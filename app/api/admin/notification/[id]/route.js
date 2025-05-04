import { db } from "@/utils/firebase";
import {
  getDoc,
  doc,
  updateDoc,
  Timestamp,
  arrayUnion,
} from "firebase/firestore";
import { NextResponse } from "next/server";
import { getLoggedInUser } from "@/utils/firebase";

export async function PATCH(request, { params }) {
  try {
    const { id } = await params;
    const notifDoc = doc(db, "Notification", id);
    const snapshot = await getDoc(notifDoc);
    if (!snapshot.exists()) {
      return NextResponse.json(
        { message: "No notification found with the given ID" },
        { status: 404 }
      );
    }
    const user = await getLoggedInUser();

    const notif = snapshot.data();
    await updateDoc(notifDoc, {
      notification_read_status: arrayUnion(user.account_id),
      notification_last_updated: Timestamp.now(),
    });

    return NextResponse.json(
      { message: `Notification found and marked as read `, data: notif },
      { status: 200 }
    );
  } catch (error) {
    console.log(error);
    return NextResponse.json({ message: error }, { status: 500 });
  }
}
