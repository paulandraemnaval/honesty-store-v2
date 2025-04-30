import { report2 } from "./sheets";
import { formatDateToLong, formatDate } from "./formatDate";

export async function inventoryReportSheetDesign(inventories, start, end) {
  const headerTextFormat = {
    fontSize: 9,
    bold: true,
    foregroundColor: {
      red: 11 / 255,
      green: 83 / 255,
      blue: 148 / 255,
    },
    fontFamily: "Cousine",
  };

  const headerBackgroundColor = {
    red: 243 / 255,
    green: 243 / 255,
    blue: 243 / 255,
  };

  const contentTextFormat = {
    fontSize: 9,
    foregroundColor: {
      red: 11 / 255,
      green: 83 / 255,
      blue: 148 / 255,
    },
    fontFamily: "Cousine",
  };

  await report2.loadInfo();
  const sheetCheck =
    report2.sheetsByTitle[`${formatDate(start)} - ${formatDate(end)}`];
  if (sheetCheck) {
    return null;
  }

  const sheet = await report2.addSheet({
    title: `${formatDate(start)} - ${formatDate(end)}`,
    headerRowIndex: 4,
    headerValues: [
      "INV ID",
      "PRODUCT",
      "SUPPLIER",
      "WHOLESALE PRICE",
      "RETAIL PRICE",
      "PROFIT MARGIN",
      "EXPIRATION DATE",
      "REMAINING STOCKS",
    ],
  });
  await sheet.loadCells("A1:J500");

  const titleCell = sheet.getCell(0, 0);
  titleCell.value = "HONESTY STORE INVENTORY REPORT";
  titleCell.textFormat = {
    fontSize: 13,
    foregroundColor: {
      red: 1,
      green: 1,
      blue: 1,
    },
    fontFamily: "Cousine",
  };
  titleCell.backgroundColor = {
    red: 11 / 255,
    green: 83 / 255,
    blue: 148 / 255,
  };
  await sheet.mergeCells({
    startRowIndex: 0,
    endRowIndex: 2,
    startColumnIndex: 0,
    endColumnIndex: 8,
  });
  titleCell.horizontalAlignment = "LEFT";
  titleCell.verticalAlignment = "BOTTOM";
  await sheet.saveUpdatedCells();

  for (let col = 0; col < 8; col++) {
    const headerCell = sheet.getCell(3, col);
    headerCell.textFormat = headerTextFormat;
    headerCell.backgroundColor = headerBackgroundColor;
    headerCell.verticalAlignment = "MIDDLE";
    headerCell.horizontalAlignment = "CENTER";
    headerCell.wrapStrategy = "WRAP";
  }
  await sheet.saveUpdatedCells();

  const dateTitle = sheet.getCell(2, 0);
  dateTitle.value = `${formatDateToLong(start)} - ${formatDateToLong(end)}`;
  dateTitle.textFormat = {
    fontSize: 10,
    bold: true,
    fontFamily: "Cousine",
  };
  dateTitle.verticalAlignment = "MIDDLE";
  dateTitle.horizontalAlignment = "LEFT";

  await sheet.mergeCells({
    startRowIndex: 2,
    endRowIndex: 3,
    startColumnIndex: 0,
    endColumnIndex: 10,
  });
  await sheet.saveUpdatedCells();

  let row = 3,
    length = inventories.length;

  for (let i = 0; i < length; i++) {
    row++;
    for (let j = 0; j < 8; j++) {
      let contentCell = sheet.getCell(row, j);
      const rawValue = inventories[i][j];
      contentCell.value =
        rawValue instanceof Date ? rawValue.toLocaleDateString() : rawValue;
      contentCell.textFormat = contentTextFormat;
      if (j === 1 || j === 2) {
        contentCell.horizontalAlignment = "LEFT";
      } else {
        contentCell.horizontalAlignment = "CENTER";
      }
      contentCell.verticalAlignment = "MIDDLE";
      contentCell.wrapStrategy = "WRAP";
      if (j === 3 || j === 4) {
        contentCell.numberFormat = {
          type: "CURRENCY",
          pattern: "₱#,##0.00",
        };
      }
      if (j === 6) {
        contentCell.numberFormat = {
          type: "DATE",
        };
      }
      if (j === 7) {
        contentCell.numberFormat = {
          type: "NUMBER",
        };
      }
    }
  }
  await sheet.saveUpdatedCells();
}
