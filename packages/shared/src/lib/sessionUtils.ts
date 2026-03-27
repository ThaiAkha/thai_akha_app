/**
 * Session Utility Functions — Shared
 *
 * Strict DB flow: return null instead of inventing fallback numbers.
 * null = "data missing from DB" → UI must block or warn, never guess.
 *
 * Source of truth:
 *   capacity → class_sessions.max_capacity (NOT NULL, no default)
 *   capacity override → class_calendar_overrides.custom_capacity (nullable = use session default)
 *   price → class_sessions.price_thb (NOT NULL)
 */

/**
 * Returns capacity from DB, or null if missing/invalid.
 * null signals the UI to block booking — not to invent a number.
 */
export function getSessionCapacity(dbCapacity: number | null | undefined): number | null {
  return typeof dbCapacity === 'number' && !isNaN(dbCapacity) && dbCapacity > 0
    ? dbCapacity
    : null;
}

/**
 * Returns price from DB, or null if missing/invalid.
 * null signals the UI to show ⚠️ and block submit — not to invent a price.
 */
export function getSessionPrice(dbPrice: number | null | undefined): number | null {
  return typeof dbPrice === 'number' && !isNaN(dbPrice) && dbPrice > 0
    ? dbPrice
    : null;
}
