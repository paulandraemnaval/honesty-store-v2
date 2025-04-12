import {
  db,
  createLog,
  getLoggedInUser,
  checkCollectionExists,
  getLastReportEndDate,
} from "@utils/firebase";
import {
  collection,
  where,
  Timestamp,
  doc,
  setDoc,
  orderBy,
  limit,
  getDocs,
  query,
  getDoc,
  updateDoc,
  startAfter,
} from "firebase/firestore";
import { NextResponse } from "next/server";
import { generateReport } from "@utils/sheets";
import { exportSheetToPDF } from "@utils/export";
import { formatDate } from "@utils/formatDate";
import { report1 } from "@utils/sheets";

export async function POST(request) {
  try {
    const reqFormData = await request.formData();
    const report_cash_inflow = parseFloat(reqFormData.get("cash_inflow")) || 0;
    const report_cash_outflow =
      parseFloat(reqFormData.get("cash_outflow")) || 0;

    const reportRef = collection(db, "Report");
    const reportDoc = doc(reportRef);
    let report_start_date;

    if (await checkCollectionExists("Report")) {
      report_start_date = await getLastReportEndDate();
      await report1.loadInfo();

      const end = new Date();
      const sheetCheck =
        report1.sheetsByTitle[
          `${formatDate(report_start_date)} - ${formatDate(end)}`
        ];
      if (sheetCheck) {
        return NextResponse.json(
          { message: "Report already created for the same date range." },
          { status: 404 }
        );
      }
    } else {
      const inventoryRef = collection(db, "Inventory");
      if (!(await checkCollectionExists("Inventory"))) {
        return NextResponse.json(
          { message: "No inventories created." },
          { status: 404 }
        );
      }
      const q = query(
        inventoryRef,
        orderBy("inventory_timestamp", "asc"),
        limit(1)
      );
      const snapshot = await getDocs(q);
      if (!snapshot.empty) {
        report_start_date = snapshot.docs[0].data().inventory_timestamp;
      } else {
        report_start_date = null;
      }
    }

    const user = await getLoggedInUser();

    const auditExists = await checkCollectionExists("Audit");
    if (!auditExists) {
      return NextResponse.json(
        { message: "No audit exists in the database" },
        { status: 404 }
      );
    }

    if (report_start_date) {
      const auditRef = collection(db, "Audit");

      const auditQuery = query(
        auditRef,
        where("audit_soft_deleted", "==", false),
        where("audit_last_updated", ">=", report_start_date)
      );

      const auditSnapshot = await getDocs(auditQuery);
      if (auditSnapshot.empty) {
        return NextResponse.json(
          {
            message:
              "No audit created from the report start date until the end date",
          },
          { status: 404 }
        );
      }
      const audits = auditSnapshot.docs.map((doc) => doc.data());

      const promises = audits.map(async (item) => {
        const auditReportRef = collection(db, "AuditReport");
        const auditReportDoc = doc(auditReportRef);

        await setDoc(auditReportDoc, {
          audit_report_id: auditReportDoc.id,
          report_id: reportDoc.id,
          audit_id: item.audit_id,
          audit_report_timestamp: Timestamp.now(),
        });
      });
      await Promise.all(promises);

      await setDoc(reportDoc, {
        report_id: reportDoc.id,
        account_id: user.account_id,
        report_start_date,
        report_end_date: Timestamp.now(),
        report_cash_outflow,
        report_cash_inflow,
        report_timestamp: Timestamp.now(),
        report_last_updated: Timestamp.now(),
        report_soft_deleted: false,
      });

      const inventoryRef = collection(db, "Inventory");
      const inventoryQuery = query(
        inventoryRef,
        where("inventory_total_units", ">", 0),
        where("inventory_soft_deleted", "==", false),
        where("inventory_expiration_date", ">", new Date())
      );

      const snapshot = await getDocs(inventoryQuery);

      const updatePromises = snapshot.docs.map(async (item) => {
        const inventoryDoc = doc(db, "Inventory", item.id);
        const inventory_last_updated = new Date();

        await updateDoc(inventoryDoc, { inventory_last_updated });
      });

      await Promise.all(updatePromises);

      await generateReport(reportDoc.id);

      const start = new Date(report_start_date);
      const end = new Date();

      let sheetTitle = `${formatDate(start)} - ${formatDate(end)}`;

      const { buffer, title } = await exportSheetToPDF(report1, sheetTitle);

      await createLog(user.account_id, "Report", reportDoc.id, "CREATE");

      return new NextResponse(buffer, {
        status: 200,
        headers: {
          "Content-Type": "application/pdf",
          "Content-Disposition": `attachment; filename="${title}"`,
        },
      });
    } else {
      return NextResponse.json(
        { message: "No valid report start date found." },
        { status: 404 }
      );
    }
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      { message: "An error occurred", error: error.message },
      { status: 500 }
    );
  }
}

export async function PATCH(request) {
  const { lastVisible } = await request.json();

  if (lastVisible && typeof lastVisible !== "string") {
    return NextResponse.json(
      { message: "Invalid lastVisible document ID." },
      { status: 400 }
    );
  }

  try {
    const reportRef = collection(db, "Report");
    let q;
    if (lastVisible) {
      const lastDocSnapshot = await getDoc(doc(db, "Report", lastVisible));
      if (!lastDocSnapshot.exists()) {
        return NextResponse.json(
          { message: "Invalid lastVisible document ID." },
          { status: 400 }
        );
      }
      q = query(
        reportRef,
        orderBy("report_timestamp", "desc"),
        startAfter(lastDocSnapshot),
        limit(10)
      );
    } else {
      q = query(reportRef, orderBy("report_timestamp", "desc"), limit(10));
    }
    const snapshot = await getDocs(q);
    const reports = snapshot.docs.map((doc) => doc.data());
    return NextResponse.json(
      { message: "Successfully fetched reports", reports },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching reports:", error);

    return NextResponse.json(
      { message: "Failed to fetch reports", error: error.message },
      { status: 500 }
    );
  }
}
