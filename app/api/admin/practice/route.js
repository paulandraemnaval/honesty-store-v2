import { NextResponse } from "next/server";
import { financialReportSheetDesign } from "@/utils/financialReport";
import { inventoryReportSheetDesign } from "@/utils/inventoryReport";

export async function GET(request) {
  try {
    await financialReportSheetDesign();
    //await inventoryReportSheetDesign();

    return NextResponse.json(
      { message: "New report has been created" },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { message: `An error has occurred: ${error.message}` },
      { status: 500 }
    );
  }
}
