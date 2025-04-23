import { NextResponse } from "next/server";
import { sheetDesign } from "@/utils/reports";

export async function GET(request) {
  try {
    await sheetDesign();

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
