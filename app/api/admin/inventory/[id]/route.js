import { db, getLoggedInUser, createLog } from "@/utils/firebase";
import { Timestamp, updateDoc, doc, getDoc } from "firebase/firestore";
import { NextResponse } from "next/server";

export async function GET(request, { params }) {
  try {
    const { id } = await params;
    const inventoryDoc = doc(db, "Inventory", id);
    const snapshot = await getDoc(inventoryDoc);
    if (!snapshot.exists()) {
      return NextResponse.json(
        { message: "No inventory found with the given ID" },
        { status: 404 }
      );
    }
    const inventory = snapshot.data();
    if (inventory.inventory_soft_deleted === true) {
      return NextResponse.json(
        { message: `Inventory soft-deleted ` },
        { status: 200 }
      );
    }
    return NextResponse.json(
      { message: `Inventory found with the given ID: `, data: inventory },
      { status: 200 }
    );
  } catch (error) {
    console.log(error);
    return NextResponse.json({ message: error }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  const { id } = await params;
  try {
    const inventoryRef = doc(db, "Inventory", id);
    await updateDoc(inventoryRef, {
      inventory_soft_deleted: true,
      inventory_last_updated: Timestamp.now(),
    });

    const user = await getLoggedInUser();
    const logData = await createLog(
      user.account_id,
      "Inventory",
      id,
      `Soft-deleted inventory with ID ${id}`
    );

    return NextResponse.json(
      {
        message: `Inventory with ID ${id} soft-deleted successfully.`,
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
  const inventoryDoc = doc(db, "Inventory", id);
  try {
    const reqFormData = await request.formData();
    if (!reqFormData) {
      return NextResponse.json(
        { error: "Invalid or missing form data" },
        { status: 400 }
      );
    }

    const inventory_wholesale_price = parseFloat(
      reqFormData.get("inventory_wholesale_price")
    );
    const product_id = reqFormData.get("product_id");
    const supplier_id = reqFormData.get("supplier_id");
    const inventory_total_units = parseInt(
      reqFormData.get("inventory_total_units"),
      10
    );
    const inventory_retail_price = parseFloat(
      reqFormData.get("inventory_retail_price")
    );
    const inventory_description = reqFormData.get("inventory_description");
    const inventory_profit_margin = parseFloat(
      reqFormData.get("inventory_profit_margin")
    );

    // Improved expiration date handling
    const inventory_expiration_date_raw = reqFormData.get(
      "inventory_expiration_date"
    );

    let inventory_expiration_date = null;

    if (
      inventory_expiration_date_raw &&
      inventory_expiration_date_raw.trim() !== ""
    ) {
      let dateValue;

      try {
        if (
          typeof inventory_expiration_date_raw === "string" &&
          (inventory_expiration_date_raw.startsWith("{") ||
            inventory_expiration_date_raw.startsWith('"'))
        ) {
          dateValue = JSON.parse(inventory_expiration_date_raw);
        } else {
          dateValue = inventory_expiration_date_raw;
        }

        // Convert to Date object
        const dateObj = new Date(dateValue);

        // Validate date
        if (isNaN(dateObj.getTime())) {
          return NextResponse.json(
            { error: "Invalid expiration date format" },
            { status: 400 }
          );
        }
        inventory_expiration_date = Timestamp.fromDate(dateObj);
      } catch (error) {
        console.error("Error parsing expiration date:", error);
        return NextResponse.json(
          { error: "Failed to parse expiration date: " + error.message },
          { status: 400 }
        );
      }
    }

    // Create update object with validated fields
    const updateData = {
      product_id,
      supplier_id,
      inventory_wholesale_price,
      inventory_total_units,
      inventory_retail_price,
      inventory_description,
      inventory_profit_margin,
      inventory_last_updated: Timestamp.now(),
    };

    // Only add expiration date if it exists
    if (inventory_expiration_date !== null) {
      updateData.inventory_expiration_date = inventory_expiration_date;
    }

    await updateDoc(inventoryDoc, updateData);

    const user = await getLoggedInUser();
    const logData = await createLog(
      user.account_id,
      "Inventory",
      id,
      `Updated inventory with ID ${id}`
    );

    return NextResponse.json(
      {
        message: `Updated inventory with ID ${id} successfully.`,
        data: logData,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error updating inventory:", error);
    return NextResponse.json(
      { error: "Failed to update inventory: " + error.message },
      { status: 500 }
    );
  }
}
