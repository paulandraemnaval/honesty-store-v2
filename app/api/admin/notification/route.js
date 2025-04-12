import { db } from "@utils/firebase";
import { collection, getDocs, doc, query } from "firebase/firestore";
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
      notifQuery = query(notifRef, startAfter(lastDocSnapshot), limit(5));
    } else {
      notifQuery = query(notifRef, limit(5));
    }
    const snapshot = await getDocs(notifQuery);
    const notifications = snapshot.docs.map((doc) => doc.data());
    return NextResponse.json(
      { message: "Successfully fetched products", data: notifications },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { message: "Failed to fetch products: " + error.message },
      { status: 500 }
    );
  }
}
