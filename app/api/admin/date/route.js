import { db } from "@utils/firebase";
import { collection, getDocs, query, where, orderBy } from "firebase/firestore";
import { NextResponse } from "next/server";
import { createInventoryList } from "@utils/inventoryFile";
import { exportSheetToPDF } from "@utils/export";
import { report2 } from "@utils/sheets";
import { formatDate } from "@utils/formatDate";

export async function GET(request) {
  const url = new URL(request.url);
  const startDate = url.searchParams.get("startDate");
  const endDate = url.searchParams.get("endDate");

  try {
    if (!startDate && !endDate) {
      return NextResponse.json(
        { message: "Both startDate and endDate are required" },
        { status: 400 }
      );
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return NextResponse.json(
        { message: "Invalid date format" },
        { status: 400 }
      );
    }

    const inventoryRef = collection(db, "Inventory");
    const q = query(
      inventoryRef,
      where("inventory_timestamp", ">=", start),
      where("inventory_timestamp", "<=", end),
      orderBy("inventory_timestamp", "desc")
    );

    const snapshot = await getDocs(q);
    if (snapshot.empty) {
      return NextResponse.json({ message: "No data found" }, { status: 404 });
    }

    const inventories = snapshot.docs.map((doc) => doc.data());

    await createInventoryList(inventories, start, end);
    const sheetTitle = `${formatDate(start)} - ${formatDate(end)}`;
    const { buffer, title } = await exportSheetToPDF(report2, sheetTitle);

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${title}"`,
      },
    });
  } catch (error) {
    console.log(error);

    return new NextResponse("Error exporting PDF", { status: 500 });
  }
}
