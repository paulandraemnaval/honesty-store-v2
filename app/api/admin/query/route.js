import { db } from "@utils/firebase";
import { collection, getDocs, query, where } from "firebase/firestore";
import { NextResponse } from "next/server";

function calculateSimilarity(supplierName, searchTerm) {
  const lowerSupplierName = supplierName.toLowerCase();
  const lowerSearchTerm = searchTerm.toLowerCase();

  const index = lowerSupplierName.indexOf(lowerSearchTerm);
  return index === -1 ? Infinity : index;
}

export async function GET(request) {
  const url = new URL(request.url);
  const supplier = url.searchParams.get("supplier");
  const product = url.searchParams.get("product");
  const category = url.searchParams.get("category");

  if (!supplier && !product && !category) {
    return NextResponse.json(
      { message: "Search term is required" },
      { status: 400 }
    );
  }

  try {
    if (supplier) {
      const supplierRef = collection(db, "Supplier");
      const q = query(supplierRef, where("supplier_soft_deleted", "==", false));

      const snapshot = await getDocs(q);
      const suppliers = snapshot.docs.map((doc) => doc.data());

      const filteredSuppliers = suppliers
        .filter((item) => {
          return item.supplier_name
            .toLowerCase()
            .includes(supplier.toLowerCase());
        })
        .map((item) => ({
          supplier_name: item.supplier_name,
          supplier_id: item.supplier_id,
        }));

      filteredSuppliers.sort((a, b) => {
        const aSimilarity = calculateSimilarity(a.supplier_name, supplier);
        const bSimilarity = calculateSimilarity(b.supplier_name, supplier);
        return aSimilarity - bSimilarity; // Ascending order
      });
      return NextResponse.json(
        { message: "Suppliers found", data: filteredSuppliers },
        { status: 200 }
      );
    }

    if (product) {
      const productRef = collection(db, "Product");
      const q = query(productRef, where("product_soft_deleted", "==", false));

      const snapshot = await getDocs(q);
      const products = snapshot.docs.map((doc) => doc.data());

      const filteredProducts = products
        .filter((item) => {
          return item.product_name
            .toLowerCase()
            .includes(product.toLowerCase());
        })
        .map((item) => ({
          product_name: item.product_name,
          product_id: item.product_id,
        }));

      filteredProducts.sort((a, b) => {
        const aSimilarity = calculateSimilarity(a.product_name, search);
        const bSimilarity = calculateSimilarity(b.product_name, search);
        return aSimilarity - bSimilarity; // Ascending order
      });
      return NextResponse.json(
        { message: "Products found", data: filteredProducts },
        { status: 200 }
      );
    }

    if (category) {
      const categoryRef = collection(db, "Category");
      const q = query(categoryRef, where("category_soft_deleted", "==", false));

      const snapshot = await getDocs(q);
      const categories = snapshot.docs.map((doc) => doc.data());

      const filteredCategory = categories
        .filter((item) => {
          return item.category_name
            .toLowerCase()
            .includes(category.toLowerCase());
        })
        .map((item) => ({
          category_name: item.category_name,
          category_id: item.category_id,
        }));

      filteredCategory.sort((a, b) => {
        const aSimilarity = calculateSimilarity(a.category_name, category);
        const bSimilarity = calculateSimilarity(b.category_name, category);
        return aSimilarity - bSimilarity; // Ascending order
      });
      return NextResponse.json(
        { message: "Categories found", data: filteredCategory },
        { status: 200 }
      );
    }
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      { message: "Error fetching filtered collection" },
      { status: 500 }
    );
  }
}
