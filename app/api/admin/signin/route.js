import { auth, db, createLog } from "@utils/firebase";
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
import bcryptjs from "bcryptjs";
import { cookies } from "next/headers";
import { encrypt } from "@utils/session";

async function createSession(userId, path) {
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
  const encryptedSession = await encrypt({ sessionId, expiresAt });
  cookies().set("session", encryptedSession, {
    httpOnly: true,
    secure: true,
    expires: expiresAt,
    sameSite: "lax",
    path: "/",
  });

  return sessionData;
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
    const { email, password } = Object.fromEntries(await request.formData());
    const query_string = query(
      collection(db, "Account"),
      where("account_email", "==", email)
    );

    const user = await getDocs(query_string);

    if (user.empty) {
      console.log("User not found");
      return NextResponse.json({ error: "User not found" }, { status: 400 });
    }

    const email_salt = user.docs[0].data().account_salt;

    const password_hash = await bcryptjs.hash(password, email_salt);
    const accountData = await signInUser(email, password_hash);

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
