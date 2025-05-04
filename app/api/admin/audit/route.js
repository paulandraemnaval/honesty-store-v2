import { db, createLog, getLoggedInUser } from "@/utils/firebase";
import {
  collection,
  getDoc,
  Timestamp,
  doc,
  setDoc,
  updateDoc,
  getDocs,
  query,
  where,
  orderBy,
} from "firebase/firestore";
import { NextResponse } from "next/server";
import { roundToTwoDecimals } from "@/utils/calculations";

export async function POST(request) {
  //Initialize audit and notification documents
  const auditRef = collection(db, "Audit");
  const auditDoc = doc(auditRef);
  const notificationRef = collection(db, "Notification");
  const notificationDoc = doc(notificationRef);

  let audit_gross_income = 0;
  let audit_total_expense = 0;
  const restockItems = [];

  try {
    const data = await request.json();
    const user = await getLoggedInUser();

    //Process each audited product
    const promises = data.map(async (item) => {
      const { productId, remaining } = item;
      const remainingUnits = parseInt(remaining, 10) || 0;

      //get all non-expired inventories for this product, ordered by expiration date (oldest first)
      const inventoriesRef = collection(db, "Inventory");
      const inventoryQuery = query(
        inventoriesRef,
        where("product_id", "==", productId),
        where("inventory_soft_deleted", "==", false),
        where("inventory_expiration_date", ">", Timestamp.now()),
        orderBy("inventory_expiration_date", "asc")
      );

      const inventoriesSnapshot = await getDocs(inventoryQuery);
      if (inventoriesSnapshot.empty) {
        throw new Error(`No valid inventories found for product ${productId}`);
      }

      //Track the total units before audit for financial calculations
      let totalUnitsBefore = 0;
      const inventories = [];

      inventoriesSnapshot.forEach((doc) => {
        const inventoryData = doc.data();
        totalUnitsBefore += inventoryData.inventory_total_units;
        inventories.push({
          ...inventoryData,
        });
      });

      //Calculate units sold in this audit
      const unitsSold = totalUnitsBefore - remainingUnits;
      if (unitsSold < 0) {
        throw new Error(
          `Cannot add inventory during audit. Please use the inventory form to add new stock`
        );
      }

      //Calculate financial impact for this product
      let income = 0;
      let expense = 0;

      //Get product details for pricing and reorder point
      const productRef = doc(db, "Product", productId);
      const productSnapshot = await getDoc(productRef);
      if (!productSnapshot.exists()) {
        throw new Error(`Product with ID ${productId} does not exist`);
      }

      const productDoc = productSnapshot.data();

      //Create cycle count entries and update inventories
      let remainingToDistribute = remainingUnits;
      let remainingToSell = unitsSold;
      const cycleCountRef = collection(db, "CycleCount");

      //Update each inventory, starting with the oldest
      for (const inventory of inventories) {
        const inventoryRef = doc(db, "Inventory", inventory.inventory_id);
        const initialUnits = inventory.inventory_total_units;
        let finalUnits = initialUnits;
        let unitsDeducted = 0;

        if (remainingToSell > 0) {
          //Deduct from this inventory
          unitsDeducted = Math.min(initialUnits, remainingToSell);
          finalUnits = initialUnits - unitsDeducted;
          remainingToSell -= unitsDeducted;

          if (unitsDeducted > 0) {
            //Calculate financial impact from this inventory
            const inventoryIncome = roundToTwoDecimals(
              unitsDeducted * inventory.inventory_retail_price
            );
            const inventoryExpense = roundToTwoDecimals(
              unitsDeducted * inventory.inventory_wholesale_price
            );
            income += inventoryIncome;
            expense += inventoryExpense;

            //Create cycle count record for this inventory
            const cycleCountDoc = doc(cycleCountRef);
            await setDoc(cycleCountDoc, {
              cycle_count_id: cycleCountDoc.id,
              audit_id: auditDoc.id,
              inventory_id: inventory.inventory_id,
              cycle_count_remaining: finalUnits,
              cycle_count_income: inventoryIncome,
              cycle_count_wholesale_price: inventory.inventory_wholesale_price,
              cycle_count_profit: roundToTwoDecimals(
                inventoryIncome - inventoryExpense
              ),
              cycle_count_timestamp: Timestamp.now(),
              cycle_count_last_updated: Timestamp.now(),
            });
          }
        }

        //Update inventory record
        await updateDoc(inventoryRef, {
          inventory_total_units: finalUnits,
          inventory_last_updated: Timestamp.now(),
        });
      }
      // Add to audit totals
      audit_gross_income += income;
      audit_total_expense += expense;

      // Check if we need to create restock notification
      let totalRemainingUnits = remainingUnits;

      if (totalRemainingUnits < productDoc.product_reorder_point) {
        restockItems.push({
          product_id: productId,
          product_name: productDoc.product_name,
          remaining_units: totalRemainingUnits,
          reorder_point: productDoc.product_reorder_point,
        });
      }

      // Create inventory notification link
      const invNotifRef = collection(db, "InventoryNotification");
      const invNotifDoc = doc(invNotifRef);
      await setDoc(invNotifDoc, {
        inventory_notification_id: invNotifDoc.id,
        product_id: productId,
        notification_id: notificationDoc.id,
      });
    });
    await Promise.all(promises);

    // Create the log entry
    const logData = await createLog(
      user.account_id,
      "Audit",
      auditDoc.id,
      "CREATE"
    );

    // Calculate audit totals
    audit_gross_income = roundToTwoDecimals(audit_gross_income);
    audit_total_expense = roundToTwoDecimals(audit_total_expense);
    const audit_net_profit = roundToTwoDecimals(
      audit_gross_income - audit_total_expense
    );

    // Create the audit document
    await setDoc(auditDoc, {
      audit_id: auditDoc.id,
      account_id: user.account_id,
      audit_gross_income,
      audit_total_expense,
      audit_net_profit,
      audit_timestamp: Timestamp.now(),
      audit_last_updated: Timestamp.now(),
      audit_soft_deleted: false,
    });

    // Create restock notification if needed
    if (restockItems.length > 0) {
      await setDoc(notificationDoc, {
        notification_id: notificationDoc.id,
        notification_title: "Restock Alert: Inventory Reorder Point Reached",
        notification_body: `${restockItems.length} product(s) have fallen below the reorder point. Please restock as soon as possible.`,
        notification_type: 0,
        notification_read_status: [],
        notification_timestamp: Timestamp.now(),
        notification_soft_deleted: false,
      });
    }
    return NextResponse.json(
      {
        message: "Audit successfully created.",
        audit_id: auditDoc.id,
        logData,
        restock_needed: restockItems.length > 0,
      },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { message: "Error creating audit: " + error.message },
      { status: 500 }
    );
  }
}
