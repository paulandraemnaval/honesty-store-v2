import { auth, createLog, db } from "@/utils/firebase";
import { signInWithEmailAndPassword } from "firebase/auth";
import { NextResponse } from "next/server";
import {
  collection,
  getDocs,
  Timestamp,
  doc,
  setDoc,
  query,
  where,
} from "firebase/firestore";
import { cookies } from "next/headers";
import { encrypt } from "@/utils/session";

async function createSession(userId, path) {
  try {
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 1000);
    const sessionRef = collection(db, "Session");
    const sessionDoc = doc(sessionRef);

    const sessionData = {
      session_id: sessionDoc.id,
      account_auth_id: userId,
      session_access_type: "authenticated",
      session_accessed_url: path,
      session_timestamp: Timestamp.now(),
      session_expiration_date: expiresAt,
    };

    await setDoc(sessionDoc, sessionData);

    const sessionId = sessionDoc.id;
    const cookieStore = await cookies();
    const encryptedSession = await encrypt({ sessionId, expiresAt });
    cookieStore.set("session", encryptedSession, {
      httpOnly: true,
      secure: true,
      expires: expiresAt,
      sameSite: "lax",
      path: "/",
    });

    const accountRef = collection(db, "Account");
    const q = query(accountRef, where("account_auth_id", "==", userId));
    const accountDoc = await getDocs(q);
    if (accountDoc.empty) {
      return NextResponse.json(
        { message: "Account not found" },
        { status: 404 }
      );
    }
    const account = accountDoc.docs[0].data();
    const {
      account_name = "User",
      account_role = "Admin",
      account_profile_url = "/default-profile.png",
    } = account;
    const userPayload = JSON.stringify({
      account_name,
      account_role,
      account_profile_url,
    });

    cookieStore.set("user", userPayload, {
      httpOnly: false,
      secure: true,
      expires: expiresAt,
      sameSite: "lax",
      path: "/",
    });
    console.log(userPayload);

    return sessionData;
  } catch (error) {
    console.log(error);
  }
}

//--------------------------------------------------------
const signInUser = async (email, password) => {
  try {
    const userCredentials = await signInWithEmailAndPassword(
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

//---------------------------------------------------------
export async function POST(request) {
  try {
    const reqFormData = await request.formData();
    if (!reqFormData) {
      return NextResponse.json(
        { error: "Invalid or missing form data" },
        { status: 400 }
      );
    }
    const { email, password } = Object.fromEntries(reqFormData);
    const query_string = query(
      collection(db, "Account"),
      where("account_email", "==", email)
    );

    const user = await getDocs(query_string);

    if (user.empty) {
      console.log("User not found");
      return NextResponse.json({ error: "User not found" }, { status: 400 });
    }

    const accountData = await signInUser(email, password);

    if (accountData instanceof Error) {
      console.log("Error in user sign-up:", accountData.message);
      return NextResponse.json({ error: accountData.message }, { status: 400 });
    }
    const sessionData = await createSession(
      accountData.uid,
      request.nextUrl.pathname
    );

    const logData = await createLog(
      user.docs[0].data().account_id,
      "Account",
      "N/A",
      "Sign-In"
    );

    return NextResponse.json(
      {
        message: "Account signed in successfully",
        userData: user.docs[0].data(),
        accountData,
        sessionData,
        logData,
      },
      {
        status: 200,
      }
    );
  } catch (error) {
    console.log("Error in sign-in:", error.message);
    return NextResponse.json(
      {
        message: "An error occurred during sign-in ",
        error: error.message,
      },
      { status: 500 }
    );
  }
}
