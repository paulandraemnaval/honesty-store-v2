import { NextResponse } from "next/server";
import resetPassword from "@/utils/resetPassword";

export async function GET(request) {
  try {
    const url = new URL(request.url);
    const email = url.searchParams.get("email");
    resetPassword(email);

    return NextResponse.json(
      { message: "Reset Password Successful" },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { message: `An error has occurred: ${error.message}` },
      { status: 500 }
    );
  }
}
