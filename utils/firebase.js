import { initializeApp } from "firebase/app";
import { getStorage } from "firebase/storage";
import { getAuth } from "firebase/auth";
import {
  getFirestore,
  collection,
  doc,
  setDoc,
  Timestamp,
  getDoc,
  query,
  where,
  getDocs,
  orderBy,
} from "firebase/firestore";
import { decrypt } from "@utils/session";
import { cookies } from "next/headers";

const firebaseConfig = {
  apiKey: process.env.API_KEY,
  authDomain: "fir-prac-3866d.firebaseapp.com",
  projectId: "fir-prac-3866d",
  storageBucket: "fir-prac-3866d.appspot.com",
  messagingSenderId: "433565566739",
  appId: "1:433565566739:web:265a336fd05f962229fce6",
  measurementId: "G-16LC26L69Q",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const storage = getStorage();
export const db = getFirestore(app);

//createLog function
export const createLog = async (
  account_id,
  log_table_name,
  log_table_item_id,
  log_table_action
) => {
  const logRef = collection(db, "Log");
  const logDoc = doc(logRef);

  const logData = {
    log_id: logDoc.id,
    account_id,
    log_table_name,
    log_table_item_id,
    log_table_action,
    log_timestamp: Timestamp.now().toDate(),
  };

  await setDoc(logDoc, logData);
  return logData;
};

export const getLoggedInUser = async () => {
  const encryptedSession = cookies().get("session")?.value; // Get the session cookie
  if (!encryptedSession) {
    console.log("No session cookie found.");
    return null;
  }

  const sessionData = await decrypt(encryptedSession); // Decrypt the session
  const sessionRef = doc(db, "Session", sessionData.sessionId); // Reference to the session document

  try {
    const sessionDoc = await getDoc(sessionRef); // Get the session document
    if (!sessionDoc.exists()) {
      console.log("No session found with the given sessionId.");
      return null;
    }

    const accountAuthId = sessionDoc.data().account_auth_id;

    const accountQuery = query(
      collection(db, "Account"),
      where("account_auth_id", "==", accountAuthId)
    );

    const accountSnapshot = await getDocs(accountQuery);

    if (accountSnapshot.empty) {
      console.log("No account found with the given account_auth_id.");
      return null;
    }

    const accountData = accountSnapshot.docs[0].data();

    return accountData;
  } catch (error) {
    console.error("Error fetching user information:", error);
    return null;
  }
};

export const checkCollectionExists = async (collectionName) => {
  const colRef = collection(db, collectionName);
  const snapshot = await getDocs(colRef);
  return !snapshot.empty;
};

export const getLastReportEndDate = async () => {
  try {
    const reportRef = collection(db, "Report");
    const q = query(reportRef, orderBy("report_end_date", "desc"));
    const snapshot = await getDocs(q);

    // Check if the snapshot is empty
    if (snapshot.empty) {
      console.warn("No reports found in the collection.");
      return null; // or return a default date, depending on your use case
    }

    // Ensure the report_end_date field exists
    const lastReport = snapshot.docs[0].data();
    if (!lastReport.report_end_date) {
      console.warn("The most recent report does not have an end date.");
      return null; // or handle this case as needed
    }

    return lastReport.report_end_date.toDate
      ? lastReport.report_end_date.toDate()
      : lastReport.report_end_date;
  } catch (error) {
    console.error("Error fetching last report end date:", error);
  }
};

export const expiredInventoriesToday = async () => {
  try {
    const inventoriesRef = collection(db, "Inventory");

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    const q = query(
      inventoriesRef,
      where("inventory_expiration_date", ">=", today), // Expiration date is today or later
      where("inventory_expiration_date", "<", tomorrow), // Expiration date is before tomorrow
      where("inventory_soft_deleted", "==", false),
      where("inventory_total_units", ">", 0)
    );
    const inventorySnapshot = await getDocs(q);
    if (inventorySnapshot.empty) {
      console.log("No expired products found for today.");
      return null;
    }

    const expiredInventories = inventorySnapshot.docs.map((doc) => doc.data());
    return expiredInventories;
  } catch (error) {
    console.error("Error fetching expired inventories", error);
  }
};

export async function twoWeeksBeforeExpiration() {
  try {
    const inventoryRef = collection(db, "Inventory");
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const twoWeeksFromNow = new Date(today);
    twoWeeksFromNow.setDate(today.getDate() + 14);

    const nextDay = new Date(today);
    nextDay.setDate(twoWeeksFromNow.getDate() + 1);

    const q = query(
      inventoryRef,
      where("inventory_expiration_date", ">=", twoWeeksFromNow),
      where("inventory_expiration_date", "<", nextDay),
      where("inventory_soft_deleted", "==", false),
      where("inventory_total_units", ">", 0)
    );

    const snapshot = await getDocs(q);
    if (snapshot.empty) {
      console.log("No products expiring in two weeks.");
      return [];
    }

    const expiredInventories = snapshot.docs.map((doc) => doc.data());
    return expiredInventories;
  } catch (error) {
    console.log("Error fetching products expiring in two weeks,", error);
    return [];
  }
}
