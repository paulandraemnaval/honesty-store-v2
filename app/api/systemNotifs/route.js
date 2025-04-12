import {
  db,
  getLoggedInUser,
  expiredInventoriesToday,
  twoWeeksBeforeExpiration,
} from "@utils/firebase";
import {
  collection,
  Timestamp,
  doc,
  setDoc,
  getDoc,
  getDocs,
  query,
  where,
} from "firebase/firestore";
import { NextResponse } from "next/server";

async function createNotificationForProducts(user, products, title, body) {
  let expiredProducts = [];
  const notifRef = collection(db, "Notification");
  const notifDoc = doc(notifRef);

  const promises = products.map(async (item) => {
    const productDoc = doc(db, "Product", item.product_id);
    const productSnapshot = await getDoc(productDoc);
    let product;
    if (productSnapshot.exists()) {
      product = productSnapshot.data();
      expiredProducts.push(product.product_name);

      const invNotifRef = collection(db, "InventoryNotification");
      const invNotifDoc = doc(invNotifRef);

      await setDoc(invNotifDoc, {
        inventory_notification_id: invNotifDoc.id,
        inventory_id: item.inventory_id,
        notification_id: notifDoc.id,
      });
    } else {
      console.log(`Product with ID ${item.product_id} does not exist`);
    }
  });

  await Promise.all(promises);

  let notification_body = `${body} The following products have expired today: ${expiredProducts.join(
    ", "
  )}.`;

  await setDoc(notifDoc, {
    notification_id: notifDoc.id,
    account_id: user.account_id,
    notification_title: title,
    notification_body,
    notification_type: 2,
    notification_is_read: false,
    notification_timestamp: Timestamp.now(),
    notification_soft_deleted: false,
  });
}

export async function POST(request) {
  try {
    const expiredToday = await expiredInventoriesToday();
    const expiredTwoWeeksBefore = await twoWeeksBeforeExpiration();

    if (
      (!expiredToday || expiredToday.length === 0) &&
      (!expiredTwoWeeksBefore || expiredTwoWeeksBefore.length == 0)
    ) {
      return NextResponse.json(
        { message: "No notification", data: [] },
        { status: 200 }
      );
    }

    const user = await getLoggedInUser();
    if (expiredToday.length > 0) {
      await createNotificationForProducts(
        user,
        expiredToday,
        "Action Required: Products Expired Today!",
        `Important: ${expiredToday.length} product(s) have reached their expiration date today. Ensure to check your inventory and manage your stock accordingly.\n.`
      );
    }

    if (expiredTwoWeeksBefore.length > 0) {
      await createNotificationForProducts(
        user,
        expiredTwoWeeksBefore,
        "Heads Up: Products Expiring in 2 Weeks!",
        `Notice: ${expiredTwoWeeksBefore.length} product(s) in your inventory are set to expire in exactly two weeks.`
      );
    }
    return NextResponse.json(
      {
        message: "Notifications for product expiration created",
        expiredToday,
        expiredTwoWeeksBefore,
      },
      { status: 200 }
    );
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      { message: "Failed to create notification document", error: error },
      { status: 500 }
    );
  }
}

export async function GET(request) {
  try {
    const accountRef = collection(db, "Account");
    const q = query(
      accountRef,
      where("account_soft_deleted", "==", false),
      where("account_approval_expires_at", "<=", new Date())
    );
    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      console.log("No account found");
      return NextResponse.json(
        { message: "No account found" },
        { status: 404 }
      );
    }

    const accounts = snapshot.docs.map((doc) => doc.data());

    const promises = accounts.map(async (account) => {
      const accountDocRef = doc(db, "Account", account.account_id);
      await updateDoc(accountDocRef, {
        account_is_approved: false,
        account_last_updated: Timestamp.now(),
      });
    });

    await Promise.all(promises);

    return NextResponse.json(
      { message: "Account approval status updated" },
      { status: 200 }
    );
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      { message: "Error fetching accounts", error: error },
      { status: 500 }
    );
  }
}
