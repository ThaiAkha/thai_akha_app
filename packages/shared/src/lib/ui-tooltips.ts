/**
 * Centralized tooltips data for the Thai Akha Kitchen Application.
 * Used for all UI Tooltip components across admin and front apps.
 */
export const TOOLTIPS = {
  BOOKING: {
    CALENDAR: {
      PREV_MONTH: "Previous Month",
      NEXT_MONTH: "Next Month",
      CLOSE: "Close Calendar",

      // Dynamic Day Tooltips
      DAY_UNAVAILABLE: "Not available",
      DAY_LOADING: "Loading...",
      DAY_SOLD_OUT: "Date not available (Sold Out)",
      DAY_BOTH_OPEN: "Morning and Evening available",
      DAY_MORNING_ONLY: "Morning available (Evening Full)",
      DAY_EVENING_ONLY: "Evening available (Morning Full)",
      DAY_SELECTABLE: "Select this date"
    }
  },
  COMMON: {
    CLOSE: "Close",
    BACK: "Go Back",
    SUBMIT: "Submit Request"
  }
} as const;

export type TooltipKey = typeof TOOLTIPS;
