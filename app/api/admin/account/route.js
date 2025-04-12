import { db } from "@utils/firebase";
import { collection, getDocs } from "firebase/firestore";
import { NextResponse } from "next/server";

export async function GET(request) {
  try {
    const accountRef = collection(db, "Account");
    const accountSnapshot = await getDocs(accountRef);
    if (accountSnapshot.empty) {
      return NextResponse.json(
        { message: "No accounts in the db" },
        { status: 404 }
      );
    }
    const accounts = accountSnapshot.docs.map((doc) => doc.data());
    return NextResponse.json(
      {
        message: "Successfully fetched all accounts",
        data: accounts,
      },
      { status: 200 }
    );
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      { message: "An error occurred while fetching accounts." },
      { status: 500 }
    );
  }
}
