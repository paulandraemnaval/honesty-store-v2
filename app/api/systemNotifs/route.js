import {
  db,
  expiredInventoriesToday,
  twoWeeksBeforeExpiration,
} from "@/utils/firebase";
import { collection, Timestamp, doc, setDoc, getDoc } from "firebase/firestore";
import { NextResponse } from "next/server";

async function createNotificationForProducts(products, title, body) {
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
    notification_title: title,
    notification_body,
    notification_type: 2,
    notification_read_status: [],
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

    if (expiredToday.length > 0) {
      await createNotificationForProducts(
        expiredToday,
        "Action Required: Products Expired Today!",
        `Important: ${expiredToday.length} product(s) have reached their expiration date today. Ensure to check your inventory and manage your stock accordingly.\n.`
      );
    }

    if (expiredTwoWeeksBefore.length > 0) {
      await createNotificationForProducts(
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
