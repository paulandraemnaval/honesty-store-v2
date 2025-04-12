import { db } from "@utils/firebase";
import { doc, getDoc } from "firebase/firestore";
import { report2 } from "./sheets";
import { formatDateToLong, formatDate } from "./formatDate";

export const createInventoryList = async (inventories, startDate, endDate) => {
  try {
    await report2.loadInfo();
    const sheetTitle = `${formatDate(startDate)} - ${formatDate(endDate)}`;
    const sheetCheck = report2.sheetsByTitle[sheetTitle];
    if (!sheetCheck) {
      const sheet = await report2.addSheet({
        title: `${formatDate(startDate)} - ${formatDate(endDate)}`,
        headerRowIndex: 2,
        headerValues: [
          "Inventory ID",
          "Product",
          "Supplier",
          "Wholesale Price",
          "Retail Price",
          "Profit Margin",
          "Expiration Date",
          "Remaining Stock",
        ],
      });

      let rowInd = 1;
      await sheet.loadCells(`A${rowInd + 1}:H${rowInd + 1}`);

      for (let col = 0; col < 8; col++) {
        const cell = sheet.getCell(rowInd, col);
        cell.horizontalAlignment = "CENTER";
        cell.textFormat = { bold: true };
        cell.backgroundColor = { red: 0.8549, green: 0.9176, blue: 0.8275 };
      }
      await sheet.saveUpdatedCells();

      let range = {
        startRowIndex: 0, // 0-indexed, first row
        endRowIndex: 1, // 1-indexed, second row (exclusive)
        startColumnIndex: 0, // 0-indexed, first column (A)
        endColumnIndex: 8, // 8-indexed, eighth column (H, exclusive)
      };

      await sheet.mergeCells(range, "MERGE_ALL");
      await sheet.loadCells(`A${rowInd}:H${rowInd}`);
      const title1 = sheet.getCellByA1("A1:H1");
      title1.value = `${formatDateToLong(startDate)} - ${formatDateToLong(
        endDate
      )}`;
      title1.textFormat = { bold: true };
      title1.backgroundColor = { red: 0.2, green: 0.6, blue: 0.8 };
      await sheet.saveUpdatedCells();

      const newRowValues = [];

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
          inventory.inventory_id,
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

      for (let i = 0; i < newRowValues.length; i++) {
        rowInd++;
        await sheet.loadCells(`A${rowInd + 1}:H${rowInd + 1}`);
        for (let col = 0; col < 8; col++) {
          const cell = sheet.getCell(rowInd, col);
          cell.value = newRowValues[i][col];
          cell.horizontalAlignment = "CENTER";
          if (col === 3 || col === 4) {
            cell.numberFormat = {
              type: "CURRENCY",
              pattern: "₱#,##0.00",
            };
          }
        }
        await sheet.saveUpdatedCells();
      }
    }
  } catch (error) {
    console.error("Error creating inventory list:", error);
  }
};
