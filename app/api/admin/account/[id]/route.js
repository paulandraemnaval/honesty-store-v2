import { db, getLoggedInUser, createLog } from "@utils/firebase";
import { doc, getDoc, updateDoc, Timestamp } from "firebase/firestore";
import { NextResponse } from "next/server";
import getImageURL from "@utils/imageURL";
import bcryptjs from "bcryptjs";
import { adminAuth } from "@utils/firebaseAdmin";

export async function GET(request, { params }) {
  const { id } = params;

  try {
    const accountRef = doc(db, "Account", id);
    const accountDoc = await getDoc(accountRef);
    if (!accountDoc.exists()) {
      return NextResponse.json(
        { message: "Account not found" },
        { status: 404 }
      );
    }
    const account = accountDoc.data();
    return NextResponse.json(
      { message: "Account found", data: account },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching account:", error);
    return NextResponse.json(
      { message: "Error fetching account", error: error.message },
      { status: 500 }
    );
  }
}

export async function PATCH(request, { params }) {
  const { id } = params;
  const accountRef = doc(db, "Account", id);

  const accountDoc = await getDoc(accountRef);
  if (!accountDoc.exists()) {
    return NextResponse.json({ message: "Account not found" }, { status: 404 });
  }

  const account = accountDoc.data();
  try {
    const { name, file, role, url, email, password } = Object.fromEntries(
      await request.formData()
    );

    if (!email || !password || !name) {
      return NextResponse.json(
        { error: "Email, password, and name are required." },
        { status: 400 }
      );
    }

    let imageURL = url;
    if (file) {
      imageURL = await getImageURL(file, accountDoc.id, "profile");
      if (!imageURL) {
        console.log("Failed to generate image URL");
        return NextResponse.json(
          { error: "Failed to generate image URL" },
          { status: 400 }
        );
      }
    }

    const password_hash = await bcryptjs.hash(password, account.account_salt);

    await updateDoc(accountRef, {
      account_name: name,
      account_email: email,
      account_profile_url: imageURL || null,
      account_role: role,
      account_password_hash: password_hash,
      account_last_updated: Timestamp.now(),
    });

    try {
      await adminAuth.updateUser(account.account_auth_id, {
        email,
        password,
      });
    } catch (err) {
      return NextResponse.json(
        { error: "Failed to update auth info" },
        { status: 500 }
      );
    }

    const user = await getLoggedInUser();
    await createLog(user.account_id, "Account", id, "UPDATE");

    return NextResponse.json(
      { message: "Account updated successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      { error: "Failed to update account" },
      { status: 500 }
    );
  }
}

export async function DELETE(request, { params }) {
  const { id } = params;
  const accountRef = doc(db, "Account", id);
  const accountDoc = await getDoc(accountRef);
  if (!accountDoc.exists()) {
    return NextResponse.json({ message: "Account not found" }, { status: 404 });
  }
  const account = accountDoc.data();

  try {
    await updateDoc(accountRef, {
      account_soft_deleted: true,
      account_last_updated: Timestamp.now(),
    });

    try {
      await adminAuth.deleteUser(account.account_auth_id);
    } catch (error) {
      return NextResponse.json(
        { message: "Failed to delete auth info" },
        { status: 500 }
      );
    }

    const user = await getLoggedInUser();
    await createLog(user.account_id, "Account", id, "SOFT-DELETE");
    return NextResponse.json(
      { message: "Account deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
