import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "@utils/firebase";

export default async function getImageURL(file, docId, folderName) {
  if (!file) {
    return;
  }
  const imageFolderRef = ref(storage, `${folderName}/${docId}`);
  try {
    await uploadBytes(imageFolderRef, file);
    const downloadURL = await getDownloadURL(imageFolderRef); // fixed reference
    return downloadURL;
  } catch (error) {
    console.log("Error uploading file:", error);
    return null;
  }
}
