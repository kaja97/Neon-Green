import { format, formatDistanceToNow, differenceInDays, parseISO, addDays } from "date-fns";

/**
 * Calculate the number of days since planting.
 */
export function daysSincePlanting(plantingDate: string): number {
  const planting = parseISO(plantingDate);
  return differenceInDays(new Date(), planting);
}

/**
 * Calculate the expected harvest date given planting date and growth duration.
 */
export function calculateHarvestDate(
  plantingDate: string,
  growthDurationDays: number
): string {
  const planting = parseISO(plantingDate);
  return format(addDays(planting, growthDurationDays), "yyyy-MM-dd");
}

/**
 * Format a date string for display.
 * e.g., "July 13, 2026"
 */
export function formatDate(dateString: string): string {
  return format(parseISO(dateString), "MMMM d, yyyy");
}

/**
 * Format a date as short display.
 * e.g., "Jul 13"
 */
export function formatDateShort(dateString: string): string {
  return format(parseISO(dateString), "MMM d");
}

/**
 * Format a date with day of week.
 * e.g., "Tuesday, July 14, 2026"
 */
export function formatDateFull(dateString: string): string {
  return format(parseISO(dateString), "EEEE, MMMM d, yyyy");
}

/**
 * Get a relative time string.
 * e.g., "2 hours ago", "3 days ago"
 */
export function getRelativeTimeString(dateString: string): string {
  return formatDistanceToNow(parseISO(dateString), { addSuffix: true });
}

/**
 * Format time from 24h to display format.
 * e.g., "06:00" → "6:00 AM"
 */
export function formatTime(time: string): string {
  const [hours, minutes] = time.split(":").map(Number);
  const period = hours >= 12 ? "PM" : "AM";
  const displayHours = hours % 12 || 12;
  return `${displayHours}:${minutes.toString().padStart(2, "0")} ${period}`;
}
