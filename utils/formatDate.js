export function formatDateToLong(date) {
  const d = new Date(date);

  const year = d.getFullYear();
  const month = d.toLocaleString("default", { month: "long" });
  const day = d.getDate();

  return `${month} ${day}, ${year}`;
}

export function formatDate(date) {
  const d = new Date(date);

  // Get the month, day, and year
  const month = String(d.getMonth() + 1).padStart(2, "0"); // Months are zero-based
  const day = String(d.getDate()).padStart(2, "0");
  const year = String(d.getFullYear()).slice(-2); // Get last two digits of the year

  return `${month}/${day}/${year}`;
}
