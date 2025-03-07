import { format, startOfWeek, endOfWeek, isWithinInterval } from "date-fns";

/**
 * Format a date string to a human-readable format
 */
export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return format(date, "MMM d, yyyy");
}

/**
 * Check if a date is within the current week
 */
export function isCurrentWeek(dateString: string): boolean {
  const date = new Date(dateString);
  const now = new Date();
  const weekStart = startOfWeek(now, { weekStartsOn: 1 }); // Week starts on Monday
  const weekEnd = endOfWeek(now, { weekStartsOn: 1 });

  return isWithinInterval(date, { start: weekStart, end: weekEnd });
}

/**
 * Get the current date in YYYY-MM-DD format
 */
export function getCurrentDate(): string {
  return new Date().toISOString().split("T")[0];
}
