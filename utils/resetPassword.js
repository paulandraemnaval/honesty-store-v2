import { auth } from "./firebase";
import { sendPasswordResetEmail } from "firebase/auth";

export default function resetPassword(email) {
  sendPasswordResetEmail(auth, email)
    .then(() => {
      console.log("Email sent successfully");
    })
    .catch((error) => {
      console.log(error.message);
    });
}
