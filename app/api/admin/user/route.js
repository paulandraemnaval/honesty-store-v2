import { getLoggedInUser } from "@utils/firebase";

import { NextResponse } from "next/server";

export async function GET() {
  const user = await getLoggedInUser();
  if (!user) {
    return NextResponse.json({ message: "No user logged in" }, { status: 401 });
  }
  return NextResponse.json(
    { message: "User logged in", data: user },
    { status: 200 }
  );
}
