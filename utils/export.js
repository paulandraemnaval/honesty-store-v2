import { serviceAccountAuth } from "./sheets";
import { GoogleSpreadsheet } from "google-spreadsheet";

function sanitizeSheetName(sheetName) {
  return sheetName.replace(/[\/\\:\*\?\"<>\|]/g, "_"); // Replace invalid characters with underscores
}

// Function to export Google Sheet to PDF
export const exportSheetToPDF = async (report, sheetTitle) => {
  // Load the document
  await report.loadInfo(); // Loads document properties and worksheets

  // Get the sheet by title
  const sheet = report.sheetsByTitle[sheetTitle];
  if (!sheet) {
    throw new Error(`Sheet with title "${sheetTitle}" not found.`);
  }

  const title = sanitizeSheetName(sheetTitle);

  // Export as PDF (ArrayBuffer mode)
  const pdfBuffer = await sheet.downloadAsPDF();
  // Return the PDF buffer
  return {
    buffer: Buffer.from(pdfBuffer),
    title: `${title}.pdf`,
  };
};

// // Function to export Google Sheet to XLSX
// export const exportSheetToXLSX = async (report, sheetTitle) => {
//   const doc = new GoogleSpreadsheet(id, serviceAccountAuth);

//   // Load the document
//   await doc.loadInfo(); // Loads document properties and worksheets

//   // Get the last sheet
//   const lastSheetIndex = doc.sheetCount - 1; // Get the index of the last sheet
//   const lastSheet = doc.sheetsByIndex[lastSheetIndex]; // Access the last sheet

//   // Get the Downloads folder path
//   const downloadsFolder = path.join(homedir(), "Downloads");

//   // Create the Downloads folder if it doesn't exist
//   if (!fs.existsSync(downloadsFolder)) {
//     fs.mkdirSync(downloadsFolder);
//   }

//   // Export as XLSX (ArrayBuffer mode)
//   const xlsxBuffer = await lastSheet.downloadAsCSV();
//   const xlsxFilePath = path.join(downloadsFolder, "my-export.csv");
//   fs.writeFileSync(xlsxFilePath, Buffer.from(xlsxBuffer));
//   console.log(`XLSX exported successfully to ${xlsxFilePath}!`);

//   // Alternatively, export as XLSX (Stream mode)
//   const xlsxStream = await lastSheet.downloadAsCSV(true); // `true` toggles to stream mode
//   const streamXlsxFilePath = path.join(downloadsFolder, "my-export-stream.csv");
//   const writableStream = fs.createWriteStream(streamXlsxFilePath);

//   writableStream.on("finish", () => {
//     console.log(`Streamed CSV exported successfully to ${streamXlsxFilePath}!`);
//   });
//   writableStream.on("error", (err) => {
//     console.error("Error during streaming:", err);
//   });

//   xlsxStream.pipe(writableStream);
// };
const splitDate = (title) => {
  // Assuming the title format is "Some Title - MM/DD/YY - MM/DD/YY"
  const datePattern = /(\d{1,2}\/\d{1,2}\/\d{2}) - (\d{1,2}\/\d{1,2}\/\d{2})/;
  const match = title.match(datePattern);

  if (match) {
    // Extract the date strings
    const startDateString = match[1];
    const endDateString = match[2];

    // Parse the dates manually to avoid timezone issues
    const startParts = startDateString.split("/");
    const endParts = endDateString.split("/");

    // Create Date objects using Date.UTC
    const firstDate = new Date(
      Date.UTC(2000 + parseInt(startParts[2]), startParts[0] - 1, startParts[1])
    );
    const secondDate = new Date(
      Date.UTC(2000 + parseInt(endParts[2]), endParts[0] - 1, endParts[1])
    );

    return { start: firstDate, end: secondDate };
  } else {
    return { start: null, end: null }; // or handle it as needed
  }
};

export const getProfitData = async (report) => {
  await report.loadInfo();
  const profitData = [];

  // Iterate through all sheets
  for (let i = 0; i < report.sheetCount; i++) {
    const sheet = report.sheetsByIndex[i];
    await sheet.loadCells(); // Load all cells in the sheet

    let rowInd = 0; // Start from the first row
    let total = 0;
    let foundTotal = false;

    // Loop through rows until we find the "Total" label or reach the end of the sheet
    while (!foundTotal) {
      const cell = sheet.getCell(rowInd, 0); // Get the first column cell (A)
      if (cell.value === "Total") {
        const nextCell = sheet.getCell(rowInd, 1); // Get the second column cell (B)
        total = nextCell.value;
        foundTotal = true; // Set flag to stop the loop
      } else {
        rowInd++;
        if (rowInd >= sheet.rowCount) {
          break; // Exit the loop if we reach the end of the sheet
        }
      }
    }
    const date = splitDate(sheet.title);

    profitData.push({ date, total });
  }

  return profitData; // Return the collected sales data
};

export const getSalesData = async (report) => {
  await report.loadInfo();
  const salesData = [];

  // Iterate through all sheets
  for (let i = 0; i < report.sheetCount; i++) {
    const sheet = report.sheetsByIndex[i];
    await sheet.loadCells(); // Load all cells in the sheet

    let rowInd = 0; // Start from the first row
    let income = 0;
    let foundTotal = false;

    // Loop through rows until we find the "Total" label or reach the end of the sheet
    while (!foundTotal) {
      const cell = sheet.getCell(rowInd, 3); // Get the first column cell (A)
      if (cell.value === "Sum") {
        const nextCell = sheet.getCell(rowInd, 5); // Get the second column cell (B)
        income = nextCell.value;
        foundTotal = true; // Set flag to stop the loop
      } else {
        rowInd++;
        if (rowInd >= sheet.rowCount) {
          break; // Exit the loop if we reach the end of the sheet
        }
      }
    }

    salesData.push({ date: splitDate(sheet.title), total: income });
  }

  return salesData; // Return the collected sales data
};
