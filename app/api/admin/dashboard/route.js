import { db } from "@utils/firebase";
import { collection, getDocs, query, where } from "firebase/firestore";
import { NextResponse } from "next/server";
import { report1 } from "@utils/sheets";
import { formatDate } from "@utils/formatDate";
import { getProfitData, getSalesData } from "@utils/export";

export const revalidate = 0;

export async function GET(request) {
  try {
    let products, categories, suppliers;
    products = categories = suppliers = 0;

    const productRef = collection(db, "Product");
    let q = query(productRef, where("product_soft_deleted", "==", false));
    let querySnapshot = await getDocs(q);
    if (!querySnapshot.empty) {
      products = querySnapshot.docs.length;
    }

    const categoryRef = collection(db, "Category");
    q = query(categoryRef, where("category_soft_deleted", "==", false));
    querySnapshot = await getDocs(q);
    if (!querySnapshot.empty) {
      categories = querySnapshot.docs.length;
    }

    const supplierRef = collection(db, "Supplier");
    q = query(supplierRef, where("supplier_soft_deleted", "==", false));
    querySnapshot = await getDocs(q);
    if (!querySnapshot.empty) {
      suppliers = querySnapshot.docs.length;
    }

    const profit = await getProfitData(report1);
    const sales = await getSalesData(report1);

    const totalProfit = profit.reduce((acc, item) => {
      return acc + item.total;
    }, 0);

    const totalSales = sales.reduce((acc, item) => {
      return acc + item.total;
    }, 0);

    return NextResponse.json(
      {
        message: "Sales successfully fetched",
        data: {
          profit,
          sales,
          products,
          categories,
          suppliers,
          totalProfit,
          totalSales,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      { error: "Error fetching sales data" },
      { status: 500 }
    );
  }
}
