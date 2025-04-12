import { db, createLog, getLoggedInUser } from "@utils/firebase";
import {
  collection,
  getDocs,
  Timestamp,
  doc,
  setDoc,
  query,
  where,
} from "firebase/firestore";
import { NextResponse } from "next/server";

export async function GET() {
  let suppliers = [];
  try {
    const supplierRef = collection(db, "Supplier");
    const q = query(supplierRef, where("supplier_soft_deleted", "==", false));
    const supplierSnapshot = await getDocs(q);

    suppliers = supplierSnapshot.docs.map((doc) => doc.data());
    if (suppliers.length === 0) {
      return NextResponse.json(
        {
          message: "There are no suppliers in the database",
          data: {},
        },
        { status: 200 }
      );
    }
    return NextResponse.json(
      {
        message: "All suppliers",
        data: suppliers,
      },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch suppliers " + error.message },
      { status: 400 }
    );
  }
}

export async function POST(request) {
  const supplierRef = collection(db, "Supplier");
  const supplierDoc = doc(supplierRef);
  try {
    const reqFormData = await request.formData();
    const supplier_name = reqFormData.get("supplier_name");
    const supplier_contact_person = reqFormData.get("supplier_contact_person");
    const supplier_contact_number = reqFormData.get("supplier_contact_number");
    const supplier_email_address = reqFormData.get("supplier_email_address");
    const supplier_notes = reqFormData.get("supplier_notes");

    await setDoc(supplierDoc, {
      supplier_id: supplierDoc.id,
      supplier_name,
      supplier_contact_person,
      supplier_contact_number,
      supplier_email_address,
      supplier_notes,
      supplier_timestamp: Timestamp.now(),
      supplier_last_updated: Timestamp.now(),
      supplier_soft_deleted: false,
    });

    const user = await getLoggedInUser();

    const logData = await createLog(
      user.account_id,
      "Supplier",
      supplierDoc.id,
      "CREATE"
    );

    return NextResponse.json(
      {
        message: "Supplier created successfully",
        data: {
          supplierId: supplierDoc.id,
          logData,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.log(error.message);

    return NextResponse.json(
      { error: "Failed to create Supplier" },
      { status: 400 }
    );
  }
}
