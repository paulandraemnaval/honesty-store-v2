import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { Timestamp } from "firebase/firestore";
import DOMPurify from "dompurify";

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

export function sanitizeValue(value) {
  if (value instanceof File || value instanceof Blob) {
    return value;
  }

  if (typeof value !== "string") {
    if (typeof value === "object" && value !== null) {
      try {
        value = JSON.stringify(value);
      } catch (e) {
        value = String(value);
      }
    } else {
      value = String(value);
    }
  }

  return DOMPurify.sanitize(value, {
    ALLOWED_TAGS: [],
    ALLOWED_ATTR: [],
    KEEP_CONTENT: true,
    USE_PROFILES: {
      html: false,
    },
  });
}

export function objectToFormData(obj) {
  const formData = new FormData();

  for (const key in obj) {
    if (obj[key] !== undefined && obj[key] !== null) {
      const value = sanitizeValue(obj[key]);
      formData.append(key, value);
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
    redirect: "follow",
  });

  if (res.redirected) {
    window.location.href = res.url;
  }

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
  console.log("lastVisiblePID", lastVisiblePID);
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

    const exhausted =
      !data?.inventories || data?.inventories?.length < 20 ? true : false;

    console.log(
      "exhausted",
      exhausted,
      data?.inventories ? data.inventories.length : "No inventories "
    );

    const lastVisible = exhausted
      ? ""
      : data?.inventories[19]?.inventory.inventory_id;

    console.log("lastVisible", lastVisible);

    return {
      status: res.status,
      data: [...data.inventories, ...data.noInventory],
      lastVisible: lastVisible,
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
  console.log(obj);
  const res = await fetch(`/api/admin/inventory/${obj.inventory_id}`, {
    method: "PATCH",
    body: objectToFormData(obj),
  });
  const data = await res.json();
  return { status: res.status, data: data.data };
}

export async function inventoryPOST(obj) {
  console.log(obj);
  const res = await fetch("/api/admin/inventory", {
    method: "POST",
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
  if (!timestamp) {
    return null;
  }

  if (typeof timestamp.seconds !== "number") {
    return null;
  }

  try {
    const milliseconds = timestamp.seconds * 1000;
    const date = new Date(milliseconds);

    if (isNaN(date.getTime())) {
      return null;
    }

    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  } catch (error) {
    console.error("Error converting timestamp to date:", error);
    return null;
  }
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

  // Early return if wholesale price is invalid, but don't update any other fields
  if (wholesalePrice <= 0) {
    // This prevents cascading errors to other fields
    // Without triggering validation on those fields
    return;
  }

  if (manualRetailPrice && !manualProfitMargin) {
    const retailPrice = parseFloat(watchRetailPrice) || 0;
    if (retailPrice > 0) {
      const calculatedMargin =
        ((retailPrice - wholesalePrice) / wholesalePrice) * 100;
      form.setValue(
        "inventory_profit_margin",
        Math.max(0, parseFloat(calculatedMargin.toFixed(2))),
        { shouldValidate: false } // Add this to prevent validation on this update
      );
    }
  } else if (manualProfitMargin && !manualRetailPrice) {
    const profitMargin = parseFloat(watchProfitMargin) || 0;
    const calculatedRetail = wholesalePrice * (1 + profitMargin / 100);
    form.setValue(
      "inventory_retail_price",
      parseFloat(calculatedRetail.toFixed(2)),
      { shouldValidate: false } // Add this to prevent validation on this update
    );
  } else if (!manualRetailPrice && !manualProfitMargin) {
    form.setValue("inventory_profit_margin", 10, { shouldValidate: false });
    const calculatedRetail = wholesalePrice * 1.1;
    form.setValue(
      "inventory_retail_price",
      parseFloat(calculatedRetail.toFixed(2)),
      { shouldValidate: false } // Add this to prevent validation on this update
    );
  }
}

export async function categoryPOST(obj) {
  const res = await fetch("/api/admin/category", {
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

export async function inventoryReportGET(startDate, endDate) {
  const start = new Date(startDate);
  const end = new Date(endDate);
  end.setDate(end.getDate() + 1);

  const res = await fetch(
    `/api/admin/date?startDate=${start.toISOString()}&endDate=${end.toISOString()}`,
    {
      method: "GET",
      headers: {
        Accept: "application/pdf",
      },
    }
  );

  if (!res.ok) {
    return { status: res.status };
  }

  const blob = await res.blob();
  await downloadInventoryReportResponse(blob);
  return { status: res.status };
}

async function downloadInventoryReportResponse(blob) {
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "inventory-report.pdf";
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.URL.revokeObjectURL(url);
}

export async function inventoryGETforAudit() {
  const res = await fetch("/api/admin/inventory", {
    method: "PATCH",
    body: JSON.stringify({
      lastVisible: "",
    }),
  });
  const data = await res.json();

  const exhausted =
    !data.inventories || data.inventories.length < 20 ? true : false;

  const lastVisible = exhausted ? "" : data.inventories[19]?.product_id;

  console.log(
    "exhausted",
    exhausted,
    data?.inventories ? data.inventories.length : "No inventories "
  );

  return {
    status: res.status,
    data: data.inventories,
    lastVisible: lastVisible,
  };
}

export async function reportPOST(obj) {
  console.log(obj);
  const res = await fetch("/api/admin/report", {
    method: "POST",
    body: objectToFormData(obj),
  });
  const data = await res.json();
  return { status: res.status, data: data.data };
}

export async function accountsGET() {
  const res = await fetch("/api/admin/account");
  const data = await res.json();
  console.log(data);
  return { status: res.status, data: data.data };
}

export async function accountPATCH(obj) {
  if (typeof obj.file === "string") {
    obj.url = obj.file;
    delete obj.file;
  }

  const res = await fetch(`/api/admin/account/${obj.account_id}`, {
    method: "PATCH",
    body: objectToFormData(obj),
  });
  const data = await res.json();
  return { status: res.status, data: data.data };
}

export async function accountPOST(obj) {
  const res = await fetch("/api/admin/signup", {
    method: "POST",
    body: objectToFormData(obj),
  });
  const data = await res.json();
  return { status: res.status, data: data.data };
}

export async function reportDELETE(id) {
  const res = await fetch(`/api/admin/report/${id}`, {
    method: "DELETE",
  });
  const data = await res.json();
  return { status: res.status, data: data.data };
}

export async function accountDELETE(id) {
  const res = await fetch(`/api/admin/account/${id}`, {
    method: "DELETE",
  });
  const data = await res.json();
  return { status: res.status, data: data.data };
}

export async function productDELETE(id) {
  const res = await fetch(`/api/admin/products/${id}`, {
    method: "DELETE",
  });
  const data = await res.json();
  return { status: res.status, data: data.data };
}

export async function inventoryDELETE(id) {
  const res = await fetch(`/api/admin/inventory/${id}`, {
    method: "DELETE",
  });
  const data = await res.json();
  return { status: res.status, data: data.data };
}
export async function categoryDELETE(id) {
  const res = await fetch(`/api/admin/category/${id}`, {
    method: "DELETE",
  });
  const data = await res.json();
  return { status: res.status, data: data.data };
}
export async function supplierDELETE(id) {
  const res = await fetch(`/api/admin/supplier/${id}`, {
    method: "DELETE",
  });
  const data = await res.json();
  return { status: res.status, data: data.data };
}

export async function notificationPATCH(lastVisibleNID) {
  const res = await fetch("/api/admin/notification", {
    method: "PATCH",
    body: JSON.stringify({
      lastVisible: lastVisibleNID,
    }),
    headers: {
      "Content-Type": "application/json",
    },
  });
  const data = await res.json();

  const exhausted = !data?.data || data?.data?.length < 20;

  const lastVisible = exhausted ? "" : data?.data[19]?.notification_id;

  return { status: res.status, data: data.data, lastVisible };
}

export async function notificationSEEN(id) {
  const res = await fetch(`/api/admin/notification/${id}`, {
    method: "PATCH",
  });
  const data = await res.json();
  return { status: res.status, data: data.data };
}

export async function notificationProductsGET(id) {
  const res = await fetch(`/api/admin/invNotification?notifId=${id}`, {
    method: "GET",
  });

  const data = await res.json();

  const product_ids = data?.data?.map((notif) => notif.product_id);

  const productPromises = product_ids.map((product_id) =>
    fetch(`/api/admin/products/${product_id}`, {
      method: "GET",
    })
  );
  const productResponses = await Promise.all(productPromises);

  const productData = await Promise.all(
    productResponses.map((res) => res.json())
  );

  const products = productData.map((product) => product.data);

  return { status: res.status, data: products };
}

export async function reportsGET(lastVisible) {
  try {
    const res = await fetch(`/api/admin/report`, {
      method: "PATCH",
      body: JSON.stringify({
        lastVisible,
      }),
      headers: {
        "Content-Type": "application/json",
      },
    });

    const data = await res.json();

    const exhausted = !data?.reports || data?.reports?.length < 10;

    const lastVisibleReport = exhausted ? "" : data?.reports[9]?.report_id;

    console.log(
      "exhausted",
      exhausted,
      data?.reports ? data.reports.length : "No reports"
    );

    return {
      status: res.status,
      data: data.reports,
      lastVisible: lastVisibleReport,
    };
  } catch (error) {
    console.error("Error fetching reports:", error);
    return { status: 500, data: [] };
  }
}

export async function forgotPassword(email) {
  const res = await fetch(`/api/admin/resetPassword?email=${email}`);
  const data = await res.json();
  return { status: res.status, message: data.message };
}

export async function markAllNotificaionsRead() {
  const res = await fetch(`/api/admin/notification`);
  const data = await res.json();
  return { status: res.status, message: data.message };
}
