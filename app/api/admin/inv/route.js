import {
  db,
  createLog,
  getLoggedInUser,
  checkCollectionExists,
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
import { DevBundlerService } from "next/dist/server/lib/dev-bundler-service";
import { NextResponse } from "next/server";
import { promise } from "zod";

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
            inv.inventory_last_updated.toDate())
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
