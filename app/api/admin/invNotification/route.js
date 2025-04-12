import { db } from "@utils/firebase";
import {
  collection,
  getDocs,
  Timestamp,
  doc,
  setDoc,
  query,
  where,
  orderBy,
} from "firebase/firestore";
import { NextResponse } from "next/server";

export async function GET(request) {
  try {
    const url = new URL(request.url);
    const notifId = url.searchParams.get("notifId");
    if (!notifId) {
      return new NextResponse.json(
        { message: "Notification ID is required" },
        { status: 400 }
      );
    }

    const invNotifRef = collection(db, "InventoryNotification");
    const q = query(
      invNotifRef,
      where("notification_id", "==", notifId),
      orderBy("inventory_notification_timestamp")
    );

    const snapshot = await getDocs(q);
    const inventoryNotifications = snapshot.docs.map((doc) => doc.data());
    return NextResponse.json(
      {
        message: "Inventory Notifications successfully fetched",
        data: inventoryNotifications,
      },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { message: "Error fetching inventory notifications" },
      { status: 500 }
    );
  }
}
