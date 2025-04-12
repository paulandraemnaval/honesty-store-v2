import { db, getLoggedInUser } from "@utils/firebase";
import { collection, Timestamp, doc, setDoc } from "firebase/firestore";
import { NextResponse } from "next/server";

//create notif for access request
export async function POST(request) {
  try {
    const { notification_title, notification_body } = await request.json();

    if (!notification_title || !notification_body) {
      return NextResponse.json(
        { message: "Notification title and body are required." },
        { status: 400 }
      );
    }

    const notifRef = collection(db, "Notification");
    const notifDoc = doc(notifRef);

    const user = await getLoggedInUser();

    //here we set the account_id to the current user logged in, since all notif_type:1, will only be owned by the CEO
    //include account_id to pass for approving or rejecting the request in approved api route
    await setDoc(notifDoc, {
      notification_id: notifDoc.id,
      account_id: user.account_id,
      notification_title,
      notification_body,
      notification_type: 1,
      notification_is_read: false,
      notification_timestamp: Timestamp.now(),
      notification_soft_deleted: false,
    });

    return NextResponse.json(
      { message: "Notification successfully created." },
      { status: 200 }
    );
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      { message: "Failed to create notification", error: error },
      { status: 500 }
    );
  }
}
