/**
 * Session Configuration Defaults
 *
 * These are FALLBACK values used only when database records are incomplete.
 * The primary source of truth is always the database:
 * - class_sessions table: max_capacity, price_thb
 * - class_calendar_overrides table: custom_capacity, is_closed
 *
 * NOTE: These should ideally be removed once all database records are properly populated.
 */

export const SESSION_DEFAULTS = {
  /** Default maximum capacity if not specified in class_sessions */
  MAX_CAPACITY: 12,

  /** Default price (THB) if not specified in class_sessions */
  DEFAULT_PRICE: 1200,
} as const;

/**
 * Get initial availability state
 */
export function getInitialAvailability() {
  return {
    morning: { status: 'OPEN', booked: 0, total: 12, bookings: [] },
    evening: { status: 'OPEN', booked: 0, total: 12, bookings: [] },
  };
}

/**
 * Get session capacity from database or fallback
 * @param dbCapacity - Value from class_sessions.max_capacity or class_calendar_overrides.custom_capacity
 * @returns Capacity value
 */
export function getSessionCapacity(dbCapacity: number | null | undefined): number {
  return typeof dbCapacity === 'number' && !isNaN(dbCapacity) && dbCapacity > 0
    ? dbCapacity
    : SESSION_DEFAULTS.MAX_CAPACITY;
}

/**
 * Get session price from database or fallback
 * @param dbPrice - Value from class_sessions.price_thb
 * @returns Price in THB
 */
export function getSessionPrice(dbPrice: number | null | undefined): number {
  return typeof dbPrice === 'number' && !isNaN(dbPrice) && dbPrice > 0
    ? dbPrice
    : SESSION_DEFAULTS.DEFAULT_PRICE;
}
