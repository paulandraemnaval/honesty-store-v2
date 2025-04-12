import { signOut } from "firebase/auth";
import { auth } from "@utils/firebase";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST(request) {
  try {
    await signOut(auth);

    cookies().set("session", "", {
      httpOnly: true,
      secure: true,
      expires: new Date(0),
      path: "/",
    });

    console.log("Sign-out successful.");
    return NextResponse.redirect(new URL("/admin", request.nextUrl));
  } catch (error) {
    console.error("An error happened during sign-out:", error);
    return NextResponse.json({ error: "Sign-out failed" }, { status: 500 });
  }
}
