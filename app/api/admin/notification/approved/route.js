import { db } from "@utils/firebase";
import {
  collection,
  Timestamp,
  doc,
  setDoc,
  updateDoc,
} from "firebase/firestore";
import { NextResponse } from "next/server";

//create notif for rejected/approved requests
export async function POST(request) {
  try {
    const {
      notification_title,
      notification_body,
      isApproved,
      requestAccountId,
    } = await request.json();

    if (
      !notification_title ||
      !notification_body ||
      !isApproved ||
      !requestAccountId
    ) {
      return NextResponse.json(
        {
          message:
            "Notification title, body, isApproved, and requestAccoundId are required.",
        },
        { status: 400 }
      );
    }

    const notifRef = collection(db, "Notification");
    const notifDoc = doc(notifRef);

    //approved/rejected notifications owned by other roles except CEO admin, hence why the account_id is set to requestAccountId
    await setDoc(notifDoc, {
      notification_id: notifDoc.id,
      account_id: requestAccountId,
      notification_title, //if approved/rejected
      notification_body, //more info
      notification_type: 4,
      notification_is_read: false,
      notification_timestamp: Timestamp.now(),
      notification_soft_deleted: false,
    });

    // If the notification is approved, update the account's approval status
    //false, ignore
    if (isApproved) {
      const accountRef = doc(db, "Account", requestAccountId);
      const expirationDate = Timestamp.fromDate(
        new Date(Date.now() + 24 * 60 * 60 * 1000)
      ); //1 day from now
      await updateDoc(accountRef, {
        account_is_approved: true,
        account_last_updated: Timestamp.now(),
        account_approval_expires_at: expirationDate,
      });
    }

    return NextResponse.json(
      { message: "Notification successfully created." },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { message: "Failed to create notification", error: error.message },
      { status: 500 }
    );
  }
}
