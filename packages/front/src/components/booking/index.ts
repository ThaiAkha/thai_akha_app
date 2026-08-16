/**
 * Booking barrel — clean imports for BookingPage.tsx
 *
 * Components (named exports)
 * Hooks
 * Types
 */

// ── Types ──────────────────────────────────────────────────────────────────────
export type {
  SessionInfo,
  SessionStatus,
  DailyAvailability,
  BookingFormData,
  SessionKey,
  AuthMode,
  ViewStep,
  PaymentMethod,
} from './booking.types';
export { EMPTY_FORM_DATA } from './booking.types';

// ── Hooks ──────────────────────────────────────────────────────────────────────
export { useSessionConfig }    from './hooks/useSessionConfig';
export { useAvailability }     from './hooks/useAvailability';
export { useBookingSelection } from './hooks/useBookingSelection';
export { useBookingForm }      from './hooks/useBookingForm';
export { useBookingSubmit }    from './hooks/useBookingSubmit';

// ── UI Components ──────────────────────────────────────────────────────────────
export { BookingSelection }    from './BookingSelection';
export { BookingCheckout }     from './BookingCheckout';
export { BookingStickyFooter } from './BookingStickyFooter';
export { CalendarView }        from './CalendarView';
export { default as GuestAuthStep } from './GuestAuthStep';
export { default as BookingForm }   from './BookingForm';
