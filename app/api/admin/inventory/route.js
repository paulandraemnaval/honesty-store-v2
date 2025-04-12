import {
  db,
  createLog,
  getLoggedInUser,
  checkCollectionExists,
  getLastReportEndDate,
} from "@utils/firebase";
import {
  collection,
  getDocs,
  Timestamp,
  doc,
  setDoc,
  query,
  where,
  orderBy,
  getDoc,
  startAfter,
  limit,
} from "firebase/firestore";
import { NextResponse } from "next/server";

//give oldest
export async function GET(request) {
  let inventories = [];
  const url = new URL(request.url);
  const productId = url.searchParams.get("productId");
  console.log(productId);

  try {
    const inventoryRef = collection(db, "Inventory");
    if (productId) {
      const q = query(inventoryRef, where("product_id", "==", productId));
      const productSnapshot = await getDocs(q);
      if (productSnapshot.empty) {
        return NextResponse.json(
          { message: "No inventories under this product" },
          { status: 404 }
        );
      }
      inventories = productSnapshot.docs.map((doc) => doc.data());
      return NextResponse.json(
        {
          message: `Inventories found with this product ID: ${productId}`,
          data: inventories,
        },
        { status: 200 }
      );
    } else {
      const reportExist = await checkCollectionExists("Report");
      let snapshot;

      if (!reportExist) {
        const q = query(
          inventoryRef,
          where("inventory_total_units", ">", 0),
          orderBy("inventory_total_units", "desc")
        );
        snapshot = await getDocs(q);
        inventories = snapshot.docs.map((doc) => doc.data());

        if (inventories.length === 0) {
          return NextResponse.json(
            {
              message: "There are no inventories in the database",
            },
            { status: 200 }
          );
        }
      } else {
        const lastReport = await getLastReportEndDate();
        const currentDate = new Date();

        const q = query(
          inventoryRef,
          where("inventory_last_updated", ">=", lastReport),
          where("inventory_last_updated", "<=", currentDate),
          where("inventory_total_units", ">", 0),
          orderBy("inventory_timestamp", "desc")
        );
        snapshot = await getDocs(q);

        if (snapshot.empty) {
          return NextResponse.json(
            { message: "No inventories found since the last report." },
            { status: 404 }
          );
        } else {
          inventories = snapshot.docs.map((doc) => doc.data());
        }
      }

      const oldInventories = inventories.reduce((acc, inventory) => {
        const productId = inventory.product_id;

        if (
          inventory.inventory_timestamp && // Ensure timestamp exists
          (!acc[productId] ||
            acc[productId].inventory_timestamp > inventory.inventory_timestamp)
        ) {
          acc[productId] = inventory;
        }
        return acc;
      }, {});

      const result = Object.values(oldInventories);

      const invProds = [];
      const promises = result.map(async (item) => {
        const productRef = doc(db, "Product", item.product_id);

        const snapshot = await getDoc(productRef);
        if (snapshot.exists()) {
          const product = snapshot.data();
          invProds.push({ inventory: item, product });
        } else {
          console.log(
            `No product found for inventory with product_id: ${item.product_id}`
          );
        }
      });

      await Promise.all(promises);

      return NextResponse.json(
        {
          message: reportExist
            ? "Inventories found since the last report"
            : "All inventories",
          inventories: invProds,
        },
        { status: 200 }
      );
    }
  } catch (error) {
    console.error("Error fetching inventories:", error);
    return NextResponse.json(
      { error: "Failed to fetch inventories: " + error.message },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  const inventoryRef = collection(db, "Inventory");
  const inventoryDoc = doc(inventoryRef);
  try {
    const reqFormData = await request.formData();

    const wholesale_price = parseFloat(reqFormData.get("wholesale_price"));
    const inventory_product = reqFormData.get("inventory_product");
    const inventory_supplier = reqFormData.get("inventory_supplier");
    const total_units = parseInt(reqFormData.get("total_units"), 10);
    const retail_price = parseFloat(reqFormData.get("retail_price"));
    const inventory_description = reqFormData.get("inventory_description");
    let inventory_profit_margin = parseFloat(
      reqFormData.get("inventory_profit_margin")
    );
    let inventory_expiration_date = reqFormData.get(
      "inventory_expiration_date"
    );

    const date = new Date(inventory_expiration_date);
    inventory_expiration_date = Timestamp.fromDate(date);

    await setDoc(inventoryDoc, {
      inventory_id: inventoryDoc.id,
      product_id: inventory_product,
      supplier_id: inventory_supplier,
      inventory_wholesale_price: wholesale_price,
      inventory_total_units: total_units,
      inventory_retail_price: retail_price,
      inventory_description,
      inventory_profit_margin,
      inventory_expiration_date,
      inventory_timestamp: Timestamp.now().toDate(),
      inventory_last_updated: Timestamp.now().toDate(),
      inventory_soft_deleted: false,
    });

    const user = await getLoggedInUser();
    const logData = await createLog(
      user.account_id,
      "Inventory",
      inventoryDoc.id,
      "CREATE"
    );

    return NextResponse.json(
      {
        message: "inventory created successfully",
        data: {
          inventoryID: inventoryDoc.id,
          logData,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.log(error.message);

    return NextResponse.json(
      { error: "Failed to create inventory" },
      { status: 500 }
    );
  }
}

export async function PATCH(request) {
  const { lastVisible } = await request.json();

  try {
    const inventoryRef = collection(db, "Inventory");
    let inventoryQuery;
    const reportExist = await checkCollectionExists("Report");
    let fullQuery;

    if (reportExist && lastVisible !== "") {
      const lastDocSnapshot = await getDoc(doc(db, "Inventory", lastVisible));
      if (!lastDocSnapshot.exists()) {
        return NextResponse.json(
          { message: "Invalid lastVisible document ID." },
          { status: 400 }
        );
      }
      const lastReport = await getLastReportEndDate();
      const currentDate = new Date();

      inventoryQuery = query(
        inventoryRef,
        limit(20),
        where("inventory_last_updated", ">=", lastReport),
        where("inventory_last_updated", "<=", currentDate),
        where("inventory_soft_delete", "==", false),
        orderBy("inventory_total_units", "desc"),
        startAfter(lastDocSnapshot)
      );
      fullQuery = query(
        inventoryRef,
        where("inventory_last_updated", ">=", lastReport),
        where("inventory_last_updated", "<=", currentDate),
        where("inventory_soft_delete", "==", false),
        orderBy("inventory_total_units", "desc"),
        startAfter(lastDocSnapshot)
      );
    } else if (!reportExist && lastVisible !== "") {
      const lastDocSnapshot = await getDoc(doc(db, "Inventory", lastVisible));
      if (!lastDocSnapshot.exists()) {
        return NextResponse.json(
          { message: "Invalid lastVisible document ID." },
          { status: 400 }
        );
      }
      inventoryQuery = query(
        inventoryRef,
        limit(20),
        where("inventory_soft_deleted", "==", false),
        orderBy("inventory_total_units", "desc"),
        startAfter(lastDocSnapshot)
      );
      fullQuery = query(
        inventoryRef,
        where("inventory_soft_deleted", "==", false),
        orderBy("inventory_total_units", "desc"),
        startAfter(lastDocSnapshot)
      );
    } else if (reportExist && lastVisible === "") {
      const lastReport = await getLastReportEndDate();
      const currentDate = new Date();

      inventoryQuery = query(
        inventoryRef,
        limit(20),
        where("inventory_last_updated", ">=", lastReport),
        where("inventory_last_updated", "<=", currentDate),
        where("inventory_soft_deleted", "==", false),
        orderBy("inventory_total_units", "desc")
      );
      fullQuery = query(
        inventoryRef,
        where("inventory_last_updated", ">=", lastReport),
        where("inventory_last_updated", "<=", currentDate),
        where("inventory_soft_deleted", "==", false),
        orderBy("inventory_total_units", "desc")
      );
    } else {
      inventoryQuery = query(
        inventoryRef,
        limit(20),
        where("inventory_soft_deleted", "==", false),
        orderBy("inventory_total_units", "desc")
      );
      fullQuery = query(inventoryRef, orderBy("inventory_total_units", "desc"));
    }

    const snapshot = await getDocs(inventoryQuery);
    if (snapshot.empty) {
      return NextResponse.json(
        { message: "No inventories found since the last report." },
        { status: 404 }
      );
    }

    const inventories = snapshot.docs.map((doc) => doc.data());

    const oldInventories = inventories.reduce((acc, inventory) => {
      const productId = inventory.product_id;

      if (
        inventory.inventory_timestamp && // Ensure timestamp exists
        (!acc[productId] ||
          acc[productId].inventory_timestamp.toDate() >
            inventory.inventory_timestamp.toDate())
      ) {
        acc[productId] = inventory;
      }
      return acc;
    }, {});

    const result = Object.values(oldInventories);

    const invProds = [];
    const promises = result.map(async (item) => {
      const productRef = doc(db, "Product", item.product_id);

      const snapshot = await getDoc(productRef);
      if (snapshot.exists()) {
        const product = snapshot.data();
        invProds.push({ inventory: item, product });
      } else {
        console.log(
          `No product found for inventory with product_id: ${item.product_id}`
        );
      }
    });

    await Promise.all(promises);

    const productRef = collection(db, "Product");
    const q = query(productRef, where("product_soft_deleted", "==", false));
    const prodSnap = await getDocs(q);
    if (prodSnap.empty) {
      return NextResponse.json(
        { message: "No products found" },
        { status: 404 }
      );
    }
    const products = prodSnap.docs.map((doc) => doc.data());
    const invSnap = await getDocs(fullQuery);
    if (invSnap.empty) {
      return NextResponse.json(
        { message: "No inventories found" },
        { status: 404 }
      );
    }
    const invents = invSnap.docs.map((doc) => doc.data());
    const invProdIds = new Set(invents.map((inv) => inv.product_id));

    const noInvProds = products.filter(
      (product) => !invProdIds.has(product.product_id)
    );

    return NextResponse.json(
      {
        message: reportExist
          ? "Inventories found since the last report"
          : "All inventories",
        inventories: invProds,
        noInventory: noInvProds,
      },
      { status: 200 }
    );
  } catch (error) {
    console.log(error);

    return NextResponse.json(
      { message: "Failed to fetch inventories: " + error.message },
      { status: 500 }
    );
  }
}
