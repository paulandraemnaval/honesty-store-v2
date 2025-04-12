import { db } from "@utils/firebase";
import { getDoc, doc } from "firebase/firestore";
import { NextResponse } from "next/server";

export async function GET(request, { params }) {
  try {
    const { id } = params;
    const notifDoc = doc(db, "Notification", id);
    const snapshot = await getDoc(categoryDoc);
    if (!snapshot.exists()) {
      return NextResponse.json(
        { message: "No notification found with the given ID" },
        { status: 404 }
      );
    }
    const notif = snapshot.data();
    return NextResponse.json(
      { message: `Category found with the given ID: `, data: notif },
      { status: 200 }
    );
  } catch (error) {
    console.log(error);
    return NextResponse.json({ message: error }, { status: 500 });
  }
}
