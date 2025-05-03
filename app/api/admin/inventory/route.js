import {
  db,
  createLog,
  getLoggedInUser,
  checkCollectionExists,
  getLastReportEndDate,
} from "@/utils/firebase";
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
      inventories = inventories.filter(
        (inv) => inv.inventory_soft_deleted === false
      );
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
          where("inventory_soft_deleted", "==", false),
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
          where("inventory_soft_deleted", "==", false),
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
    if (!reqFormData) {
      return NextResponse.json(
        { error: "Invalid or missing form data" },
        { status: 400 }
      );
    }

    const wholesale_price = parseFloat(
      reqFormData.get("inventory_wholesale_price")
    );
    const inventory_product = reqFormData.get("product_id");
    const supplier_id = reqFormData.get("supplier_id");
    const total_units = parseInt(reqFormData.get("inventory_total_units"), 10);
    const retail_price = parseFloat(reqFormData.get("inventory_retail_price"));
    const inventory_description = reqFormData.get("inventory_description");
    let inventory_profit_margin = parseFloat(
      reqFormData.get("inventory_profit_margin")
    );

    const inventory_expiration_date_raw = reqFormData.get(
      "inventory_expiration_date"
    );

    let inventory_expiration_date = null;

    if (
      inventory_expiration_date_raw &&
      inventory_expiration_date_raw.trim() !== ""
    ) {
      let dateValue;

      try {
        if (
          typeof inventory_expiration_date_raw === "string" &&
          (inventory_expiration_date_raw.startsWith("{") ||
            inventory_expiration_date_raw.startsWith('"'))
        ) {
          dateValue = JSON.parse(inventory_expiration_date_raw);
        } else {
          dateValue = inventory_expiration_date_raw;
        }

        // Convert to Date object
        const dateObj = new Date(dateValue);

        // Validate date
        if (isNaN(dateObj.getTime())) {
          return NextResponse.json(
            { error: "Invalid expiration date format" },
            { status: 400 }
          );
        }
        inventory_expiration_date = Timestamp.fromDate(dateObj);
      } catch (error) {
        console.error("Error parsing expiration date:", error);
        return NextResponse.json(
          { error: "Failed to parse expiration date: " + error.message },
          { status: 400 }
        );
      }
    }

    await setDoc(inventoryDoc, {
      inventory_id: inventoryDoc.id,
      product_id: inventory_product,
      supplier_id,
      inventory_wholesale_price: wholesale_price,
      inventory_total_units: total_units,
      inventory_retail_price: retail_price,
      inventory_description,
      inventory_profit_margin,
      inventory_expiration_date,
      inventory_timestamp: Timestamp.now(),
      inventory_last_updated: Timestamp.now(),
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
    // Check if inventory collection exists
    const inventoryExists = await checkCollectionExists("Inventory");

    // If no inventory collection exists, just return all products
    if (inventoryExists === false) {
      const products = await fetchAllProducts();

      return NextResponse.json(
        {
          message: "No inventory collection exists, returning all products",
          inventories: [],
          noInventory: products,
        },
        { status: 200 }
      );
    }

    // Build query using helper function
    const { inventoryQuery, fullQuery } = await buildInventoryQuery(
      lastVisible
    );

    // Execute main query with pagination
    const snapshot = await getDocs(inventoryQuery);

    if (snapshot.empty) {
      // No inventories found - fetch and return all products
      const products = await fetchAllProducts();
      return NextResponse.json(
        {
          message: "No inventories found. Returning all products.",
          inventories: [],
          noInventory: products,
        },
        { status: 200 }
      );
    }

    // Process results
    const inventories = snapshot.docs.map((doc) => doc.data());
    const groupedInventories = groupInventoriesByProduct(inventories);
    const invProds = await enrichInventoriesWithProducts(groupedInventories);

    // Handle products with no inventory
    const noInventoryProducts = await fetchProductsWithNoInventory(fullQuery);

    return NextResponse.json(
      {
        message: "All inventories",
        inventories: invProds,
        noInventory: noInventoryProducts,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Failed to fetch inventories:", error);

    return NextResponse.json(
      { message: "Failed to fetch inventories: " + error.message },
      { status: 500 }
    );
  }
}

//Builds Firestore queries based on conditions
async function buildInventoryQuery(lastVisible) {
  const inventoryRef = collection(db, "Inventory");
  const baseQueryConstraints = [
    where("inventory_soft_deleted", "==", false),
    orderBy("inventory_total_units", "desc"),
  ];

  let queryConstraints = [...baseQueryConstraints];

  // Add cursor if lastVisible is provided
  if (lastVisible) {
    const lastDocSnapshot = await getDoc(doc(db, "Inventory", lastVisible));
    if (!lastDocSnapshot.exists()) {
      throw new Error("Invalid lastVisible document ID");
    }
    queryConstraints.push(startAfter(lastDocSnapshot));
  }

  // Create queries with and without limit
  const inventoryQuery = query(inventoryRef, ...queryConstraints, limit(20));
  const fullQuery = query(inventoryRef, ...queryConstraints);

  return { inventoryQuery, fullQuery };
}

//Groups inventories by product ID and calculates totals
function groupInventoriesByProduct(inventories) {
  const inventoryMap = new Map();

  inventories.forEach((inv) => {
    const productId = inv.product_id;

    if (!inventoryMap.has(productId)) {
      inventoryMap.set(productId, {
        ...inv,
        inventory_total_units: inv.inventory_total_units || 0,
      });
    } else {
      const existing = inventoryMap.get(productId);
      existing.inventory_total_units += inv.inventory_total_units || 0;

      // Keep the oldest timestamped inventory
      if (
        inv.inventory_last_updated &&
        (!existing.inventory_last_updated ||
          existing.inventory_last_updated.toDate() >
            inv.inventory_last_updated.toDate()) &&
        inv.inventory_total_units > 0
      ) {
        inventoryMap.set(productId, {
          ...inv,
          inventory_total_units: existing.inventory_total_units,
        });
      } else {
        inventoryMap.set(productId, { ...existing });
      }
    }
  });

  return Array.from(inventoryMap.values());
}

//Enriches inventory data with product details
async function enrichInventoriesWithProducts(groupedInventories) {
  const invProds = [];

  const promises = groupedInventories.map(async (item) => {
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
  return invProds;
}

//Fetches all non-deleted products
async function fetchAllProducts() {
  const productRef = collection(db, "Product");
  const productQuery = query(
    productRef,
    where("product_soft_deleted", "==", false)
  );
  const prodSnap = await getDocs(productQuery);

  if (prodSnap.empty) {
    return [];
  }

  return prodSnap.docs.map((doc) => doc.data());
}

//Fetches products that have no associated inventory
async function fetchProductsWithNoInventory(fullQuery) {
  // Get all products
  const products = await fetchAllProducts();

  if (products.length === 0) {
    return [];
  }

  // Get all inventories to find products with no inventory
  const invSnap = await getDocs(fullQuery);

  if (invSnap.empty) {
    return products; // All products have no inventory
  }

  // Filter products that don't have inventory
  const invents = invSnap.docs.map((doc) => doc.data());
  const invProdIds = new Set(invents.map((inv) => inv.product_id));

  return products.filter((product) => !invProdIds.has(product.product_id));
}
