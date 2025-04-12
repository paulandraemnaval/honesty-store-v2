import { db, createLog, getLoggedInUser } from "@utils/firebase";
import {
  collection,
  getDocs,
  Timestamp,
  doc,
  setDoc,
} from "firebase/firestore";
import { NextResponse } from "next/server";
import getImageURL from "@utils/imageURL";

//----------------------------------------GET--------------------------------------
export async function GET() {
  let categories = [];
  try {
    const categoryQuery = await getDocs(collection(db, "Category"));

    categories = categoryQuery.docs.map((doc) => doc.data());
    if (categories.length === 0) {
      return NextResponse.json(
        {
          message: "There are no categories in the database",
          data: {},
        },
        { status: 200 }
      );
    }
    return NextResponse.json(
      {
        message: "All categories",
        data: categories,
      },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch categories: " + error.message },
      { status: 400 }
    );
  }
}

//--------------------------------POST---------------------------------------------------
export async function POST(request) {
  const categoryRef = collection(db, "Category");
  const categoryDoc = doc(categoryRef);
  try {
    const reqFormData = await request.formData();
    const category_name = reqFormData.get("category_name");
    const file = reqFormData.get("file");
    const category_description = reqFormData.get("category_description");

    const imageURL = await getImageURL(file, categoryDoc.id, "Category");
    if (!imageURL) {
      console.error("Failed to generate image URL:", error);
      return NextResponse.json(
        { error: "Failed to generate image URL" },
        { status: 400 }
      );
    }

    await setDoc(categoryDoc, {
      category_name,
      category_id: categoryDoc.id,
      category_image_url: imageURL,
      category_description,
      category_timestamp: Timestamp.now(),
      category_last_updated: Timestamp.now(),
      category_soft_deleted: false,
    });

    if (!file || file === "") {
      return NextResponse.json(
        {
          message: "category created successfully",
          data: { categoryId: categoryDoc.id },
        },
        { status: 200 }
      );
    }

    const user = await getLoggedInUser();

    const logData = await createLog(
      user.account_id,
      "Category",
      categoryDoc.id,
      "Added a new category"
    );

    return NextResponse.json(
      {
        message: "category created successfully",
        data: {
          categoryID: categoryDoc.id,
          imageURL,
          logData,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.log(error.message);

    return NextResponse.json(
      { error: "Failed to create category" },
      { status: 400 }
    );
  }
}
