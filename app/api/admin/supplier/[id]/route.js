import { db, createLog, getLoggedInUser } from "@utils/firebase";
import { Timestamp, doc, updateDoc, getDoc } from "firebase/firestore";
import { NextResponse } from "next/server";

export async function GET(request, { params }) {
  try {
    const { id } = params;
    const supplierDoc = doc(db, "Supplier", id);
    const snapshot = await getDoc(supplierDoc);
    if (!snapshot.exists()) {
      return NextResponse.json(
        { message: "No supplier found with the given ID" },
        { status: 404 }
      );
    }
    const supplier = snapshot.data();
    return NextResponse.json(
      { message: `Supplier found with the given ID: `, data: supplier },
      { status: 200 }
    );
  } catch (error) {
    console.log(error);
    return NextResponse.json({ message: error }, { status: 500 });
  }
}

//-------------------------------------DELETE-----------------------------
export async function DELETE(request, { params }) {
  const { id } = params;

  try {
    const supplierRef = doc(db, "Supplier", id);
    await updateDoc(supplierRef, {
      supplier_last_updated: Timestamp.now(),
      supplier_soft_deleted: true,
      supplier_id: "no supplier",
    });

    const user = await getLoggedInUser();
    const logData = await createLog(
      user.account_id,
      "Supplier",
      id,
      "SOFT-DELETE"
    );

    return NextResponse.json(
      {
        message: `Supplier with ID ${id} soft-deleted successfully.`,
        data: logData,
      },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(request, { params }) {
  const { id } = params;
  const supplierDoc = doc(db, "Supplier", id);

  try {
    const reqFormData = await request.formData();
    const supplier_name = reqFormData.get("supplier_name");
    const supplier_contact_person = reqFormData.get("supplier_contact_person");
    const supplier_contact_number = reqFormData.get("supplier_contact_number");
    const supplier_email_address = reqFormData.get("supplier_email_address");
    const supplier_notes = reqFormData.get("supplier_notes");

    await updateDoc(supplierDoc, {
      supplier_name,
      supplier_contact_person,
      supplier_contact_number,
      supplier_email_address,
      supplier_notes,
      supplier_last_updated: Timestamp.now(),
    });

    const user = await getLoggedInUser();
    const logData = await createLog(user.account_id, "Supplier", id, "UPDATE");

    return NextResponse.json(
      {
        message: `Updated supplier with ID ${id} successfully.`,
        data: logData,
      },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
