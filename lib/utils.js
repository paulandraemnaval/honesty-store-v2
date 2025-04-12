import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export function getExpiryStatus(expiryDateStr) {
  const today = new Date();
  const expiryDate = new Date(expiryDateStr);
  const diffTime = expiryDate - today;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  let status = "";
  let color = "";
  let bgcolor = "";

  if (diffDays <= 0) {
    status = "Expired";
    color = "black";
    bgcolor = "bg-black/20";
  } else if (diffDays <= 3) {
    status = `Expiring in ~${diffDays} day${diffDays > 1 ? "s" : ""}`;
    color = "red";
    bgcolor = "bg-red-200";
  } else if (diffDays <= 14) {
    const weeks = Math.round(diffDays / 7);
    status = `Expiring in ~${weeks} week${weeks > 1 ? "s" : ""}`;
    color = "yellow";
    bgcolor = "bg-amber-100";
  } else {
    const weeks = Math.round(diffDays / 7);
    status = `Expiring in ~${weeks} week${weeks > 1 ? "s" : ""}`;
    color = "green";
    bgcolor = "bg-green-200";
  }

  return { status, color, bgcolor };
}
