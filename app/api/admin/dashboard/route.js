import { db } from "@/utils/firebase";
import { collection, getDocs, query, where } from "firebase/firestore";
import { NextResponse } from "next/server";
import { formatDate } from "@/utils/formatDate";
import { roundToTwoDecimals } from "@/utils/calculations";

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

    let reports = [];
    const reportRef = collection(db, "Report");
    q = query(reportRef, where("report_soft_deleted", "==", false));
    querySnapshot = await getDocs(q);
    if (!querySnapshot.empty) {
      const reportData = querySnapshot.docs.map((doc) => doc.data());

      reports = reportData.map(
        ({
          report_start_date,
          report_end_date,
          report_total_expense,
          report_total_income,
          report_total_revenue,
        }) => ({
          report_start_date: formatDate(report_start_date.toDate()),
          report_end_date: formatDate(report_end_date.toDate()),
          report_total_expense: roundToTwoDecimals(report_total_expense),
          report_total_income: roundToTwoDecimals(report_total_income),
          report_total_revenue: roundToTwoDecimals(report_total_revenue),
        })
      );
    }

    return NextResponse.json(
      {
        message: "Dashboard data successfully fetched",
        data: {
          products,
          categories,
          suppliers,
          reports,
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
