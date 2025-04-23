import { db } from "@/utils/firebase";
import { doc, getDoc } from "firebase/firestore";
import { inventoryReportSheetDesign } from "./inventoryReport";
import { formatDate } from "./formatDate";

export const createInventoryList = async (inventories, startDate, endDate) => {
  try {
    const newRowValues = [];
    let ctr = 1;
    const promises = inventories.map(async (inventory) => {
      const productRef = doc(db, "Product", inventory.product_id);
      const productSnapshot = await getDoc(productRef);
      if (!productSnapshot.exists()) {
        console.log("No product id found");
        return;
      }
      const productName = productSnapshot.data().product_name;

      const supplierRef = doc(db, "Supplier", inventory.supplier_id);
      const supplierSnapshot = await getDoc(supplierRef);
      if (!supplierSnapshot.exists()) {
        console.log("No supplier id found");
        return;
      }
      const expirationDate = inventory.inventory_expiration_date.toDate();
      const supplierName = supplierSnapshot.data().supplier_name;
      const newInventory = [
        `I${ctr++}`,
        productName,
        supplierName,
        inventory.inventory_wholesale_price,
        inventory.inventory_retail_price,
        inventory.inventory_profit_margin,
        formatDate(expirationDate),
        inventory.inventory_total_units,
      ];
      newRowValues.push(newInventory);
    });

    await Promise.all(promises);
    await inventoryReportSheetDesign(promises);
  } catch (error) {
    console.error("Error creating inventory list:", error);
  }
};
