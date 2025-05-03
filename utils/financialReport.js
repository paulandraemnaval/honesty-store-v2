import { report1 } from "./sheets";
import { formatDate, formatDateToLong } from "./formatDate";

export async function financialReportSheetDesign(report, audits, inventories) {
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

  try {
    await report1.loadInfo();
    const sheetCheck =
      report1.sheetsByTitle[
        `${formatDate(report.report_start_date.toDate())} - ${formatDate(
          report.report_end_date.toDate()
        )}`
      ];

    if (sheetCheck) {
      return null;
    }

    const sheet = await report1.addSheet({
      title: `${formatDate(report.report_start_date.toDate())} - ${formatDate(
        report.report_end_date.toDate()
      )}`,
      headerRowIndex: 4,
      headerValues: [
        "AUDIT ID",
        "DATE",
        "TIME",
        "EXPENSES",
        "INCOME",
        "PROFIT",
      ],
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
      headerCell.wrapStrategy = "WRAP";
    }
    await sheet.saveUpdatedCells();

    const dateTitle = sheet.getCell(2, 0);
    dateTitle.value = `${formatDateToLong(
      report.report_start_date.toDate()
    )} - ${formatDateToLong(report.report_end_date.toDate())}`;
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

    const totalCashValueHeader = ["CASH IN-FLOW", "CASH OUT-FLOW", "TOTAL"];

    for (let i = 5; i < 8; i++) {
      const headerCell = sheet.getCell(i, 7);
      headerCell.value = totalCashValueHeader[i - 5];
      headerCell.textFormat = headerTextFormat;
      headerCell.verticalAlignment = "MIDDLE";
      headerCell.horizontalAlignment = "CENTER";
      headerCell.wrapStrategy = "WRAP";
      headerCell.backgroundColor = headerBackgroundColor;
    }

    let row = 3,
      length = audits.length;

    for (let i = 0; i < length; i++) {
      row++;
      for (let j = 0; j < 6; j++) {
        let contentCell = sheet.getCell(row, j);
        const rawValue = audits[i][j];
        contentCell.value =
          rawValue instanceof Date
            ? rawValue.toLocaleDateString()
            : typeof rawValue === "string"
            ? rawValue.toUpperCase()
            : rawValue;
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

    row = audits.length + 4;
    for (let i = 3; i < 6; i++) {
      const contentCell = sheet.getCell(row, i);
      contentCell.backgroundColor = {
        red: 11 / 255,
        green: 83 / 255,
        blue: 148 / 255,
      };
      contentCell.textFormat = {
        fontSize: 9,
        bold: true,
        foregroundColor: {
          red: 1,
          green: 1,
          blue: 1,
        },
        fontFamily: "Cousine",
      };
      contentCell.numberFormat = {
        type: "CURRENCY",
        pattern: "₱#,##0.00",
      };
      if (i === 3) {
        contentCell.formula = `=SUM(D5:D${4 + audits.length})`;
      } else if (i === 4) {
        contentCell.formula = `=SUM(E5:E${4 + audits.length})`;
      } else {
        contentCell.formula = `=SUM(F5:F${4 + audits.length})`;
      }
    }
    await sheet.saveUpdatedCells();
    await sheet.loadCells(`A${row + 1}:F${row + 1}`);
    const totalProfitCell = sheet.getCell(row, 5); // Column F (index 5)
    const totalProfit = totalProfitCell.value || 0;

    row = 5;
    const cashValue = [
      report.report_cash_inflow || 0,
      report.report_cash_outflow || 0,
      report.report_cash_inflow + totalProfit - report.report_cash_outflow,
    ];

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

    length = inventories.length;
    for (let i = 0; i < length; i++) {
      row++;
      for (let j = 0; j < 10; j++) {
        let contentCell = sheet.getCell(row, j);
        const rawValue = inventories[i][j];
        contentCell.value =
          rawValue instanceof Date
            ? rawValue.toLocaleDateString()
            : typeof rawValue === "string"
            ? rawValue.toUpperCase()
            : rawValue;
        contentCell.textFormat = contentTextFormat;
        if (j !== 3) {
          contentCell.horizontalAlignment = "CENTER";
        } else {
          contentCell.horizontalAlignment = "LEFT";
        }
        contentCell.verticalAlignment = "MIDDLE";
        contentCell.wrapStrategy = "WRAP";
        if (j === 4) {
          contentCell.numberFormat = {
            type: "NUMBER",
          };
        }
        if (j > 4 && j < 10) {
          contentCell.numberFormat = {
            type: "CURRENCY",
            pattern: "₱#,##0.00",
          };
        }
      }
    }
    await sheet.saveUpdatedCells();
  } catch (error) {
    console.error("Error updating sheet:", error);
  }
}
