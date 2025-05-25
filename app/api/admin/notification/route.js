import { db } from "@/utils/firebase";
import {
  collection,
  getDocs,
  getDoc,
  updateDoc,
  doc,
  query,
  limit,
  orderBy,
  startAfter,
  writeBatch,
  Timestamp,
  arrayUnion,
} from "firebase/firestore";
import { NextResponse } from "next/server";
import { getLoggedInUser } from "@/utils/firebase";

export async function GET(request) {
  try {
    const user = await getLoggedInUser();
    if (!user) {
      return NextResponse.json(
        { message: "User not authenticated" },
        { status: 401 }
      );
    }

    const notifRef = collection(db, "Notification");
    const notifDocs = await getDocs(notifRef);

    if (notifDocs.empty) {
      return NextResponse.json(
        { message: "No notifications found." },
        { status: 404 }
      );
    }

    // Use batch write for better performance when updating multiple documents
    const batch = writeBatch(db);

    // Update all notifications to mark them as read by current user
    notifDocs.docs.forEach((docSnapshot) => {
      const docRef = doc(db, "Notification", docSnapshot.id);
      batch.update(docRef, {
        notification_read_status: arrayUnion(user.account_id),
        notification_last_updated: Timestamp.now(),
      });
    });

    // Commit the batch write
    await batch.commit();

    return NextResponse.json(
      {
        message: "Successfully marked all notifications as read",
      },
      { status: 200 }
    );
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      { message: "Failed to mark notifications as read: " + error.message },
      { status: 500 }
    );
  }
}

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
