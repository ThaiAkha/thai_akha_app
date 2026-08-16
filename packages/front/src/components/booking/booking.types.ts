/**
 * booking.types.ts
 * Shared TypeScript types for the booking flow.
 * No React, no Supabase — safe to import anywhere.
 */

// ─── Session config (built from cooking_classes DB rows) ─────────────────────

export interface SessionInfo {
  id: string;
  label: string;
  shortLabel: string;
  basePrice: number;
  icon: string;
  color: string;
  pickupTime: string;
  classTime: string;
  marketTour: boolean;
}

// ─── Availability ─────────────────────────────────────────────────────────────

export type SessionStatus = {
  status: 'OPEN' | 'FULL' | 'CLOSED';
  remaining: number;
  reason?: string;
  totalVisitors: number;
};

export interface DailyAvailability {
  morning_class: SessionStatus;
  evening_class: SessionStatus;
}

// ─── Booking form data ────────────────────────────────────────────────────────

export interface BookingFormData {
  fullName: string;
  email: string;
  password: string;
  phonePrefix: string;
  phoneNumber: string;
  age: string;
  gender: string;
  nationality: string;
  hasWhatsapp: boolean | null;
}

export const EMPTY_FORM_DATA: BookingFormData = {
  fullName:    '',
  email:       '',
  password:    '',
  phonePrefix: '+66',
  phoneNumber: '',
  age:         '',
  gender:      '',
  nationality: '',
  hasWhatsapp: null,
};

// ─── Booking session key ──────────────────────────────────────────────────────

export type SessionKey = 'morning_class' | 'evening_class';

// ─── Auth mode ────────────────────────────────────────────────────────────────

export type AuthMode = 'guest' | 'login';

// ─── View step ───────────────────────────────────────────────────────────────

export type ViewStep = 'selection' | 'auth' | 'form';

// ─── Payment method ───────────────────────────────────────────────────────────

export type PaymentMethod = 'arrival' | 'card';
