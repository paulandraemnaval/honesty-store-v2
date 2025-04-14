import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { Timestamp } from "firebase/firestore";

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export function firebaseTimestampToYYYY_MM_DD(timestamp) {
  if (timestamp && timestamp.seconds) {
    const date = new Date(timestamp.seconds * 1000);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
  }
  return null;
}

export function getExpiryStatus(expiryDateInput) {
  const today = new Date();

  // Handle Firebase Timestamp object or string
  const expiryDate = expiryDateInput?.seconds
    ? new Date(expiryDateInput.seconds * 1000)
    : new Date(expiryDateInput);

  const diffTime = expiryDate.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  let status = "";
  let color = "";
  let bgcolor = "";

  if (diffDays <= 0) {
    status = "Expired";
    color = "black";
    bgcolor = "bg-black/10";
  } else if (diffDays <= 3) {
    status = `Expiring in ~${diffDays} day${diffDays > 1 ? "s" : ""}`;
    color = "red";
    bgcolor = "bg-red-200";
  } else if (diffDays <= 14) {
    const weeks = Math.round(diffDays / 7);
    status = `Expiring in ~${weeks} week${weeks > 1 ? "s" : ""}`;
    color = "orange";
    bgcolor = "bg-amber-100";
  } else {
    const weeks = Math.round(diffDays / 7);
    status = `Expiring in ~${weeks} week${weeks > 1 ? "s" : ""}`;
    color = "green";
    bgcolor = "bg-green-100";
  }

  return { status, color, bgcolor };
}

export function objectToFormData(obj) {
  const formData = new FormData();

  for (const key in obj) {
    if (obj[key] !== undefined && obj[key] !== null) {
      formData.append(key, obj[key]);
    }
  }
  return formData;
}

export async function Login(values) {
  const res = await fetch("/api/admin/signin", {
    method: "POST",
    body: objectToFormData(values),
  });

  const data = await res.json();
  return { status: res.status, user: data.userData };
}

export async function Logout() {
  const res = await fetch("/api/admin/signout", {
    method: "POST",
    body: JSON.stringify({}),
  });

  return { status: res.status };
}

export async function dashboardGET() {
  const res = await fetch("/api/admin/dashboard");
  const data = await res.json();
  return { status: res.status, data: data.data };
}

export async function productsGET() {
  const res = await fetch("/api/admin/products");
  const data = await res.json();

  const prod0id = data.data[0]?.product_id;

  const inv0 = await fetch(`/api/admin/inventory?product_id=${prod0id}`);

  const inv = await inv0.json();

  return { status: res.status, data: data.data, inv: inv.inventories };
}

export async function inventoryGET(lastVisiblePID) {
  try {
    const res = await fetch(`/api/admin/inventory`, {
      method: "PATCH",
      body: JSON.stringify({
        lastVisible: lastVisiblePID,
      }),
      headers: {
        "Content-Type": "application/json",
      },
    });
    const data = await res.json();
    console.log(data, "data");
    const exhausted = data?.inventories?.length < 20 ? true : false;

    console.log("exhausted", exhausted, data?.inventories?.length);

    const lastVisible = exhausted ? "" : data?.inventories[19]?.product_id;

    console.log("lastVisible", lastVisible);

    return {
      status: res.status,
      data: [...data.inventories, ...data.noInventory],
      lastVisible,
    };
  } catch (error) {
    throw error;
  }
}

export async function categoriesGET() {
  const res = await fetch("/api/admin/category");
  const data = await res.json();
  return { status: res.status, data: data.data };
}

export async function productPATCH(obj) {
  try {
    const formData = objectToFormData(obj);
    if (typeof obj.file === "string") {
      formData.append("url", obj.file);
      formData.delete("file");
    }

    const res = await fetch(`/api/admin/products/${obj.product_id}`, {
      method: "PATCH",
      body: formData,
    });

    const data = await res.json();
    return { status: res.status, data: data.data };
  } catch (error) {
    return { status: 500, data: error };
  }
}

export async function productInventoriesGET(product_id) {
  const res = await fetch(`/api/admin/inventory?productId=${product_id}`);
  const data = await res.json();
  return { status: res.status, data: data.data };
}

export async function inventoryPATCH(obj) {
  const res = await fetch(`/api/admin/inventory/${obj.inventory_id}`, {
    method: "PATCH",
    body: objectToFormData(obj),
  });
  const data = await res.json();
  return { status: res.status, data: data.data };
}

export async function productPOST(obj) {
  const res = await fetch("/api/admin/products", {
    method: "POST",
    body: objectToFormData(obj),
  });
  const data = await res.json();
  return { status: res.status, data: data.data };
}

export function convertTimestampToDate(timestamp) {
  if (!timestamp) return new Date();

  if (timestamp.seconds && timestamp.nanoseconds) {
    return new Date(timestamp.seconds * 1000);
  }

  if (typeof timestamp === "string") {
    return new Date(timestamp);
  }

  // Handle date object
  if (timestamp instanceof Date) {
    return timestamp;
  }

  // Default to today
  return new Date();
}

export function formatDateToReadableString(date) {
  if (!(date instanceof Date)) {
    return null;
  }
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export function firebaseTimestampToLongDate(timestamp) {
  if (!(timestamp instanceof Timestamp)) {
    return null;
  }

  const date = timestamp.toDate();
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export function pricesSideEffect(
  form,
  watchWholesalePrice,
  watchRetailPrice,
  watchProfitMargin,
  manualRetailPrice,
  manualProfitMargin
) {
  const wholesalePrice = parseFloat(watchWholesalePrice) || 0;

  if (wholesalePrice <= 0) return;

  if (manualRetailPrice && !manualProfitMargin) {
    const retailPrice = parseFloat(watchRetailPrice) || 0;
    if (retailPrice > 0) {
      const calculatedMargin =
        ((retailPrice - wholesalePrice) / wholesalePrice) * 100;
      form.setValue(
        "inventory_profit_margin",
        Math.max(0, parseFloat(calculatedMargin.toFixed(2)))
      );
    }
  } else if (manualProfitMargin && !manualRetailPrice) {
    const profitMargin = parseFloat(watchProfitMargin) || 0;
    const calculatedRetail = wholesalePrice * (1 + profitMargin / 100);
    form.setValue(
      "inventory_retail_price",
      parseFloat(calculatedRetail.toFixed(2))
    );
  } else if (!manualRetailPrice && !manualProfitMargin) {
    form.setValue("inventory_profit_margin", 10);
    const calculatedRetail = wholesalePrice * 1.1;
    form.setValue(
      "inventory_retail_price",
      parseFloat(calculatedRetail.toFixed(2))
    );
  }
}

export async function categoryPOST(obj) {
  const res = fetch("/api/admin/category", {
    method: "POST",
    body: objectToFormData(obj),
  });
  const data = await res.json();
  return { status: res.status, data: data.data };
}

export async function categoryPATCH(obj) {
  if (typeof obj.file === "string") {
    obj.category_image_url = obj.file;
    delete obj.file;
  }

  const res = await fetch(`/api/admin/category/${obj.category_id}`, {
    method: "PATCH",
    body: objectToFormData(obj),
  });
  const data = await res.json();
  return { status: res.status, data: data.data };
}

export async function supplierGET() {
  console.log("Supplier GET called");

  const res = await fetch("/api/admin/supplier");
  const data = await res.json();

  return { status: res.status, data: data.data };
}

export async function supplierPOST(obj) {
  const res = await fetch("/api/admin/supplier", {
    method: "POST",
    body: objectToFormData(obj),
  });
  const data = await res.json();
  return { status: res.status, data: data.data };
}

export async function supplierPATCH(obj) {
  const res = await fetch(`/api/admin/supplier/${obj.supplier_id}`, {
    method: "PATCH",
    body: objectToFormData(obj),
  });
  const data = await res.json();
  return { status: res.status, data: data.data };
}
