import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

// Convert paise to Indian Rupee format: ₹1,25,000.50
export function formatPaise(paise) {
  if (paise === null || paise === undefined || isNaN(paise)) return "₹0";
  const rupees = Math.abs(paise) / 100;
  const isNegative = paise < 0;

  const [whole, decimal] = rupees.toFixed(2).split(".");
  let formatted;

  if (whole.length <= 3) {
    formatted = whole;
  } else {
    const last3 = whole.slice(-3);
    const rest = whole.slice(0, -3).replace(/\B(?=(\d{2})+(?!\d))/g, ",");
    formatted = `${rest},${last3}`;
  }

  const final = decimal !== "00" ? `${formatted}.${decimal}` : formatted;
  return `${isNegative ? "-" : ""}₹${final}`;
}

// Convert rupees input to paise (storage)
export function rupeesToPaise(rupees) {
  const n = typeof rupees === "string" ? parseFloat(rupees) : rupees;
  if (!isFinite(n)) return 0;
  return Math.round(n * 100);
}

// Format YYYY-MM-DD to DD/MM/YYYY
export function formatDate(ymd) {
  if (!ymd) return "";
  const [y, m, d] = ymd.split("-");
  return `${d}/${m}/${y}`;
}

// Get today's date in YYYY-MM-DD (IST)
export function todayYMD() {
  const d = new Date(
    new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" }),
  );
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

// Pretty date like "Today", "Yesterday", "05 Oct"
export function friendlyDate(ymd) {
  if (!ymd) return "";
  const today = todayYMD();
  const [y, m, d] = ymd.split("-").map(Number);
  const date = new Date(y, m - 1, d);
  const todayDate = new Date();
  const diffDays = Math.round((todayDate - date) / 86400000);

  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7)
    return date.toLocaleDateString("en-IN", { weekday: "long" });
  return `${String(d).padStart(2, "0")} ${date.toLocaleDateString("en-IN", { month: "short", year: "numeric" })}`;
}

export const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];
