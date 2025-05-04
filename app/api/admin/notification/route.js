import { db } from "@/utils/firebase";
import {
  collection,
  getDocs,
  getDoc,
  doc,
  query,
  limit,
  orderBy,
  startAfter,
} from "firebase/firestore";
import { NextResponse } from "next/server";

//get notifs by 5
export async function PATCH(request) {
  const { lastVisible } = await request.json();
  try {
    const notifRef = collection(db, "Notification");
    let notifQuery;
    if (lastVisible) {
      const lastDocSnapshot = await getDoc(
        doc(db, "Notification", lastVisible)
      );
      if (!lastDocSnapshot.exists()) {
        return NextResponse.json(
          { message: "Invalid lastVisible document ID." },
          { status: 400 }
        );
      }
      notifQuery = query(
        notifRef,
        orderBy("notification_timestamp", "desc"),
        startAfter(lastDocSnapshot),
        limit(10)
      );
    } else {
      notifQuery = query(
        notifRef,
        orderBy("notification_timestamp", "desc"),
        limit(10)
      );
    }
    const snapshot = await getDocs(notifQuery);
    const notifications = snapshot.docs.map((doc) => doc.data());
    return NextResponse.json(
      { message: "Successfully fetched notifications", data: notifications },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { message: "Failed to fetch notifications: " + error.message },
      { status: 500 }
    );
  }
}
