// src/services/googleSheets.js
import { GoogleSpreadsheet } from "google-spreadsheet";
import { JWT } from "google-auth-library";

// Initialize auth for Google Sheets API
export const initializeGoogleAuth = () => {
  if (!process.env.GOOGLE_CLIENT_EMAIL || !process.env.GOOGLE_PRIVATE_KEY) {
    throw new Error("Google API credentials are missing");
  }

  return new JWT({
    email: process.env.GOOGLE_CLIENT_EMAIL,
    key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, "\n"),
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });
};

export const getSpreadsheet = (sheetId, auth) => {
  if (!sheetId) throw new Error("Sheet ID is required");
  return new GoogleSpreadsheet(sheetId, auth);
};

// src/services/reportService.js
import { db } from "@/utils/firebase";
import {
  collection,
  where,
  doc,
  getDocs,
  query,
  getDoc,
} from "firebase/firestore";
import { formatDate } from "../utils/formatDate";
import { financialReportSheetDesign } from "../utils/financialReport";

// Fetch report data from Firestore
export const fetchReportData = async (reportId) => {
  if (!reportId) throw new Error("Report ID is required");

  const reportDoc = doc(db, "Report", reportId);
  const reportSnapshot = await getDoc(reportDoc);

  if (!reportSnapshot.exists()) {
    throw new Error(`Report with ID ${reportId} not found`);
  }

  return reportSnapshot.data();
};

// Fetch audit data for a report
export const fetchAuditData = async (reportId) => {
  const auditReportRef = collection(db, "AuditReport");
  const q = query(auditReportRef, where("report_id", "==", reportId));
  const querySnapshot = await getDocs(q);

  if (querySnapshot.empty) {
    return [];
  }

  const auditReports = querySnapshot.docs.map((doc) => doc.data());

  const audits = [];
  let ctr = 1;

  const promises = auditReports.map(async (report) => {
    try {
      const auditRef = doc(db, "Audit", report.audit_id);
      const auditSnapshot = await getDoc(auditRef);

      if (!auditSnapshot.exists()) {
        console.warn(`Audit with ID ${report.audit_id} not found`);
        return;
      }

      const audit = auditSnapshot.data();
      const date = audit.audit_timestamp.toDate();

      audits.push([
        `A${ctr++}`,
        formatDate(date),
        date.toLocaleTimeString(),
        audit.audit_total_expense,
        audit.audit_gross_income,
        audit.audit_net_profit,
      ]);
    } catch (error) {
      console.error(`Error fetching audit ${report.audit_id}:`, error);
    }
  });

  await Promise.all(promises);
  return audits;
};

// Fetch inventory data between dates
export const fetchInventoryData = async (startDate, endDate) => {
  if (!startDate || !endDate) {
    throw new Error("Start date and end date are required");
  }

  try {
    const cycleCountRef = collection(db, "CycleCount");
    const q = query(
      cycleCountRef,
      where("cycle_count_timestamp", ">=", startDate),
      where("cycle_count_timestamp", "<=", endDate)
    );

    const cycleSnapshot = await getDocs(q);

    if (cycleSnapshot.empty) {
      return [];
    }

    const cycleCounts = cycleSnapshot.docs.map((doc) => doc.data());

    // Aggregate cycle counts by inventory ID
    const aggregatedCycleCounts = cycleCounts.reduce((acc, cycleCount) => {
      const inventoryId = cycleCount.inventory_id;

      if (!acc[inventoryId]) {
        acc[inventoryId] = cycleCount;
      } else {
        acc[inventoryId].cycle_count_profit += cycleCount.cycle_count_profit;
        acc[inventoryId].cycle_count_income += cycleCount.cycle_count_income;
      }

      return acc;
    }, {});

    return Object.values(aggregatedCycleCounts);
  } catch (error) {
    console.error("Error fetching inventory data:", error);
    throw error;
  }
};

// Enrich inventory data with product information
export const enrichInventoryData = async (cycleCounts) => {
  const data = [];
  let ctr = 1;

  const promises = cycleCounts.map(async (cycle) => {
    try {
      // Get inventory data
      const inventoryDoc = doc(db, "Inventory", cycle.inventory_id);
      const inventorySnapshot = await getDoc(inventoryDoc);

      if (!inventorySnapshot.exists()) {
        console.warn(`Inventory not found for ID: ${cycle.inventory_id}`);
        return;
      }

      const inventory = inventorySnapshot.data();

      // Get product data
      const productRef = doc(db, "Product", inventory.product_id);
      const productSnapshot = await getDoc(productRef);

      if (!productSnapshot.exists()) {
        console.warn(`Product not found for ID: ${inventory.product_id}`);
        return;
      }

      const product = productSnapshot.data();
      const date = inventory.inventory_timestamp.toDate();
      const expense = cycle.cycle_count_income - cycle.cycle_count_profit;

      data.push([
        `I${ctr++}`,
        formatDate(date),
        date.toLocaleTimeString(),
        product.product_name,
        inventory.inventory_total_units,
        inventory.inventory_wholesale_price,
        inventory.inventory_retail_price,
        expense,
        cycle.cycle_count_income,
        cycle.cycle_count_profit,
      ]);
    } catch (error) {
      console.error(`Error processing inventory ${cycle.inventory_id}:`, error);
    }
  });

  await Promise.all(promises);
  return data;
};

// Main report generation function
export const generateReport = async (reportId) => {
  try {
    // Fetch report data
    const reportData = await fetchReportData(reportId);

    // Fetch audit data
    const auditData = await fetchAuditData(reportId);

    // Fetch and process inventory data
    const cycleCounts = await fetchInventoryData(
      reportData.report_start_date,
      reportData.report_end_date
    );

    const inventoryData = await enrichInventoryData(cycleCounts);

    // Generate the report sheet
    let reportTotals;
    try {
      reportTotals = await financialReportSheetDesign(
        reportData,
        auditData,
        inventoryData
      );
    } catch (error) {
      throw new Error("Google sheet cannot be created");
    }

    return {
      success: true,
      message: "Report generated successfully",
      data: {
        totalRevenue: reportTotals?.totalRevenue || 0,
        totalIncome: reportTotals?.totalIncome || 0,
        totalExpenses: reportTotals?.totalExpenses || 0,
      },
    };
  } catch (error) {
    console.error("Error generating report:", error);
    return {
      success: false,
      message: error.message || "Failed to generate report",
    };
  }
};

// Initialize Google authentication
export const serviceAccountAuth = initializeGoogleAuth();

// Initialize spreadsheets
export const report1 = getSpreadsheet(
  process.env.GOOGLE_SHEET_ID_1,
  serviceAccountAuth
);

export const report2 = getSpreadsheet(
  process.env.GOOGLE_SHEET_ID_2,
  serviceAccountAuth
);

// Export the inventorySummary function separately if needed
export const inventorySummary = async (startDate, endDate) => {
  const cycleCounts = await fetchInventoryData(startDate, endDate);
  return await enrichInventoryData(cycleCounts);
};
