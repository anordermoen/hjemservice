import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// ============================================
// Price Formatting
// ============================================

export function formatPrice(price: number): string {
  return new Intl.NumberFormat("nb-NO", {
    style: "currency",
    currency: "NOK",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);
}

// ============================================
// Date & Time Formatting
// ============================================

/** Full date with weekday: "mandag 2. desember" */
export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("nb-NO", {
    weekday: "long",
    day: "numeric",
    month: "long",
  }).format(date);
}

/** Short date: "2. des" */
export function formatDateShort(date: Date): string {
  return new Intl.DateTimeFormat("nb-NO", {
    day: "numeric",
    month: "short",
  }).format(date);
}

/** Date with year: "2. des 2024" */
export function formatDateWithYear(date: Date): string {
  return new Intl.DateTimeFormat("nb-NO", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);
}

/** Time only: "14:30" */
export function formatTime(date: Date | string): string {
  if (typeof date === "string") {
    return date;
  }
  return new Intl.DateTimeFormat("nb-NO", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

/** Days until date (for expiry etc) */
export function getDaysUntil(date: Date): number {
  return Math.ceil((date.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
}

/** Duration in hours and minutes: "2t 30min" or "45 min" */
export function formatDuration(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (hours === 0) return `${mins} min`;
  if (mins === 0) return `${hours}t`;
  return `${hours}t ${mins}min`;
}

/** Check if a date is within 24 hours from now */
export function isWithin24Hours(date: Date | string): boolean {
  const now = new Date();
  const targetDate = typeof date === "string" ? new Date(date) : date;
  const hoursUntil = (targetDate.getTime() - now.getTime()) / (1000 * 60 * 60);
  return hoursUntil >= 0 && hoursUntil < 24;
}
