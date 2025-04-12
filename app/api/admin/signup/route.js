import { auth, db, createLog } from "@utils/firebase";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { collection, Timestamp, doc, setDoc } from "firebase/firestore";
import { NextResponse } from "next/server";
import getImageURL from "@utils/imageURL";
import bcryptjs from "bcryptjs";
const signUpUser = async (email, password) => {
  try {
    const userCredentials = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );
    const user = userCredentials.user;
    return user;
  } catch (error) {
    return new Error(error.message);
  }
};

//----------------------------------------------------------------------------
export async function POST(request) {
  const accountRef = collection(db, "Account");
  const accountDoc = doc(accountRef);

  try {
    const { name, email, password, file, role, salt } = Object.fromEntries(
      await request.formData()
    );

    const user = await signUpUser(email, password);

    if (user instanceof Error) {
      console.log("Error in user creation:", user);
      return NextResponse.json({ error: user }, { status: 400 });
    }

    //get image url
    let imageURL = null;
    if (file || file !== "") {
      imageURL = await getImageURL(file, accountDoc.id, "profile");
      if (!imageURL) {
        console.log("Failed to generate image URL");
        return NextResponse.json(
          { error: "Failed to generate image URL" },
          { status: 400 }
        );
      }
    }
    //creating account
    const accountData = {
      account_id: accountDoc.id,
      account_auth_id: user.uid,
      account_name: name,
      account_email: email,
      account_salt: salt,
      account_profile_url: imageURL || null,
      account_role: role,
      account_is_approved: false,
      account_timestamp: Timestamp.now().toDate(),
      account_last_updated: Timestamp.now().toDate(),
      account_soft_deleted: false,
    };

    //storing account
    await setDoc(accountDoc, accountData);

    const logData = await createLog(accountDoc.id, "Account", "N/A", "Sign-Up");

    return NextResponse.json(
      { message: "Account created successfully", accountData, logData },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error in account creation:", error);
    return NextResponse.json(
      { error: "Failed to create account. Please try again later." },
      { status: 500 }
    );
  }
}
