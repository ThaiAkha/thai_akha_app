/**
 * Unified date key generation for all calendar views
 * Ensures consistent YYYY-MM-DD format across the application
 *
 * Usage: Use this instead of local date key functions in any calendar component
 */

export const getDateKey = (date: Date): string => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

/**
 * Get today's date key for comparisons
 */
export const getTodayKey = (): string => {
  return getDateKey(new Date());
};

/**
 * Check if a date string is in the past
 */
export const isPastDateKey = (dateStr: string): boolean => {
  return dateStr < getTodayKey();
};
