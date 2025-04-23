import { report1 } from "./sheets";

export async function sheetDesign() {
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

  await report1.loadInfo();
  const sheetCheck = report1.sheetsByTitle["DUMMY"];
  if (sheetCheck) {
    return null;
  }

  const sheet = await report1.addSheet({
    title: "DUMMY",
    headerRowIndex: 4,
    headerValues: ["AUDIT ID", "DATE", "TIME", "EXPENSES", "INCOME", "PROFIT"],
  });
  await sheet.loadCells("A1:J500");

  const titleCell = sheet.getCell(0, 0);
  titleCell.value = "HONESTY STORE FINANCIAL REPORT";
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
    endColumnIndex: 10,
  });
  titleCell.horizontalAlignment = "LEFT";
  titleCell.verticalAlignment = "BOTTOM";
  await sheet.saveUpdatedCells();

  for (let col = 0; col < 6; col++) {
    const headerCell = sheet.getCell(3, col);
    headerCell.textFormat = headerTextFormat;
    headerCell.backgroundColor = headerBackgroundColor;
    headerCell.verticalAlignment = "MIDDLE";
    headerCell.horizontalAlignment = "CENTER";
    await sheet.saveUpdatedCells();
  }

  const dateTitle = sheet.getCell(2, 0);
  dateTitle.value = "DATE HERE!";
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

  const cashIn = sheet.getCell(5, 7);
  const cashOut = sheet.getCell(6, 7);
  const totalCash = sheet.getCell(7, 7);

  cashIn.value = "CASH IN-FLOW";
  cashIn.textFormat = headerTextFormat;
  cashIn.verticalAlignment = "MIDDLE";
  cashIn.horizontalAlignment = "CENTER";
  cashIn.wrapStrategy = "WRAP";
  cashIn.backgroundColor = headerBackgroundColor;
  await sheet.saveUpdatedCells();

  cashOut.value = "CASH OUT-FLOW";
  cashOut.textFormat = headerTextFormat;
  cashOut.verticalAlignment = "MIDDLE";
  cashOut.horizontalAlignment = "CENTER";
  cashOut.wrapStrategy = "WRAP";
  cashOut.backgroundColor = headerBackgroundColor;
  await sheet.saveUpdatedCells();

  totalCash.value = "TOTAL";
  totalCash.textFormat = headerTextFormat;
  totalCash.verticalAlignment = "MIDDLE";
  totalCash.horizontalAlignment = "CENTER";
  totalCash.wrapStrategy = "WRAP";
  totalCash.backgroundColor = headerBackgroundColor;
  await sheet.saveUpdatedCells();

  const audits = [
    ["A001", new Date(2025, 3, 15), "09:30", 1500.0, 3000.0, 1500.0],
    ["A002", new Date(2025, 3, 16), "14:45", 2200.0, 4500.0, 2300.0],
    ["A003", new Date(2025, 3, 17), "11:15", 1800.0, 3200.0, 1400.0],
  ];
  let row = 3,
    length = audits.length;

  for (let i = 0; i < length; i++) {
    row++;
    for (let j = 0; j < 6; j++) {
      let contentCell = sheet.getCell(row, j);
      const rawValue = audits[i][j];
      contentCell.value =
        rawValue instanceof Date ? rawValue.toLocaleDateString() : rawValue;
      contentCell.textFormat = contentTextFormat;
      contentCell.verticalAlignment = "MIDDLE";
      contentCell.horizontalAlignment = "CENTER";
      contentCell.wrapStrategy = "WRAP";
      if (j === 3 || j === 4 || j === 5) {
        contentCell.numberFormat = {
          type: "CURRENCY",
          pattern: "₱#,##0.00",
        };
      }
    }
  }
  await sheet.saveUpdatedCells();

  row = 5;
  const cashValue = [2300, 250, 8900];

  for (let i = 0; i < 3; i++) {
    let contentCell = sheet.getCell(row, 8);
    contentCell.value = cashValue[i];
    contentCell.textFormat = contentTextFormat;
    contentCell.horizontalAlignment = "CENTER";
    contentCell.verticalAlignment = "MIDDLE";
    contentCell.wrapStrategy = "WRAP";
    contentCell.numberFormat = {
      type: "CURRENCY",
      pattern: "₱#,##0.00",
    };
    row++;
  }

  await sheet.saveUpdatedCells();

  const newHeaderValues = [
    "INV ID",
    "DATE",
    "TIME",
    "PRODUCT",
    "REMAINING UNITS",
    "WHOLESALE",
    "RETAIL",
    "EXPENSE",
    "INCOME",
    "PROFIT",
  ];

  row = audits.length + 7;
  length = newHeaderValues.length;

  for (let i = 0; i < length; i++) {
    let contentCell = sheet.getCell(row, i);
    contentCell.value = newHeaderValues[i];
    contentCell.textFormat = headerTextFormat;
    if (i !== 3) {
      contentCell.horizontalAlignment = "CENTER";
    } else {
      contentCell.horizontalAlignment = "LEFT";
    }
    contentCell.verticalAlignment = "MIDDLE";
    contentCell.wrapStrategy = "WRAP";
    contentCell.backgroundColor = headerBackgroundColor;
  }
  await sheet.saveUpdatedCells();

  const inventories = [
    [
      "I001",
      new Date(2025, 3, 15),
      "09:30",
      "CHEEZY NACHOS",
      110,
      12.5,
      15,
      1500.0,
      3000.0,
      1500.0,
    ],
    [
      "I002",
      new Date(2025, 3, 16),
      "14:45",
      "MARTY'S CRACKLING",
      50,
      11,
      15,
      2200.0,
      4500.0,
      2300.0,
    ],
    [
      "I003",
      new Date(2025, 3, 17),
      "11:15",
      "POTATO FRIES",
      20,
      1800.0,
      20,
      30,
      3200.0,
      1400.0,
    ],
  ];

  length = inventories.length;
  for (let i = 0; i < length; i++) {
    row++;
    for (let j = 0; j < 10; j++) {
      let contentCell = sheet.getCell(row, j);
      const rawValue = inventories[i][j];
      contentCell.value =
        rawValue instanceof Date ? rawValue.toLocaleDateString() : rawValue;
      contentCell.textFormat = contentTextFormat;
      if (j !== 3) {
        contentCell.horizontalAlignment = "CENTER";
      } else {
        contentCell.horizontalAlignment = "LEFT";
      }
      contentCell.verticalAlignment = "MIDDLE";
      contentCell.wrapStrategy = "WRAP";
      if (j === 4 || j === 5 || j === 6) {
        contentCell.numberFormat = {
          type: "NUMBER",
        };
      }
      if (j === 7 || j === 8 || j === 9) {
        contentCell.numberFormat = {
          type: "CURRENCY",
          pattern: "₱#,##0.00",
        };
      }
    }
  }
  await sheet.saveUpdatedCells();
}
