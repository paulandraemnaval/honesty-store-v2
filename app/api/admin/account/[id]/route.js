import { db, auth } from "@utils/firebase";
import { doc, getDoc, updateDoc, Timestamp } from "firebase/firestore";
import { NextResponse } from "next/server";
import getImageURL from "@utils/imageURL";

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
    const { name, file, role, url } = Object.fromEntries(
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

    await updateDoc(accountRef, {
      account_name: name,
      account_profile_url: imageURL || null,
      account_role: role,
      account_last_updated: Timestamp.now(),
    });

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
