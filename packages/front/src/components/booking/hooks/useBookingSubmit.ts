/**
 * useBookingSubmit
 * Unified booking submission logic.
 *
 * Fixes the original bug: handleSubmit and handleStandaloneLogin
 * both built an identical payload in two separate places.
 * Here it's extracted to buildBookingPayload() + resolveUserId(),
 * then used by both submit paths.
 *
 * Two public handlers:
 *   handleSubmit         — new user signup or logged-in user flow
 *   handleStandaloneLogin — existing user: login → booking atomically
 */

import { useState } from 'react';
import { supabase } from '@thaiakha/shared/lib/supabase';
import { authService } from '../../../services/auth.service';
import { t } from '../../../i18n';
import type { BookingFormData, SessionKey, AuthMode } from '../booking.types';
import type { UserProfile } from '../../../services/auth.service';

export interface UseBookingSubmitResult {
  loading:               boolean;
  handleSubmit:          () => Promise<void>;
  handleStandaloneLogin: () => Promise<void>;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Convert a local Date to a timezone-safe YYYY-MM-DD string */
function toDateStr(d: Date): string {
  const offset = d.getTimezoneOffset() * 60_000;
  return new Date(d.getTime() - offset).toISOString().split('T')[0];
}

/** Best-effort: auto-assign first available driver from profiles table */
async function resolveDriverId(): Promise<string | null> {
  try {
    const { data } = await supabase
      .from('profiles')
      .select('id')
      .eq('role', 'driver')
      .limit(1);
    return data?.[0]?.id ?? null;
  } catch {
    return null;
  }
}

/** Build the shared booking INSERT payload */
function buildBookingPayload(
  userId:         string,
  session:        SessionKey,
  selectedDate:   Date,
  pax:            number,
  visitors:       number,
  finalPrice:     number,
  paymentMethod:  'arrival' | 'card',
  formData:       BookingFormData,
  driverId:       string | null,
) {
  return {
    user_id:          userId,
    session_id:       session,
    booking_date:     toDateStr(selectedDate),
    pax_count:        pax,
    visitor_count:    visitors,
    total_price:      finalPrice,
    payment_method:   paymentMethod === 'card' ? 'credit_card' : 'pay_on_arrival',
    payment_status:   'pending',
    status:           'confirmed',
    phone_prefix:     formData.phonePrefix,
    phone_number:     formData.phoneNumber,
    hotel_name:       'Update in profile',
    pickup_zone:      'walk-in',
    pickup_driver_uid: driverId,
  };
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useBookingSubmit(
  session:        SessionKey | null,
  selectedDate:   Date | null,
  pax:            number,
  visitors:       number,
  finalPrice:     number,
  formData:       BookingFormData,
  paymentMethod:  'arrival' | 'card',
  authMode:       AuthMode,
  userProfile:    UserProfile | null,
  onAuthSuccess:  () => void,
  onNavigate:     (page: string) => void,
): UseBookingSubmitResult {
  const [loading, setLoading] = useState(false);

  // ── Shared: resolve userId from current session or sign-up ────────────────
  const resolveUserId = async (): Promise<string | null> => {
    const isActualUser = userProfile && userProfile.role !== 'guest_virtual';
    if (isActualUser && userProfile?.id) return userProfile.id;

    // Check active Supabase session
    const { data: { user } } = await supabase.auth.getUser();
    if (user) return user.id;

    return null;
  };

  // ── handleSubmit — new guest sign-up OR already-logged-in user ────────────
  const handleSubmit = async () => {
    if (!session || !selectedDate) return;
    setLoading(true);

    try {
      let userId = await resolveUserId();

      if (!userId) {
        if (authMode === 'login') {
          throw new Error('Session not found. Please try logging in again.');
        }

        // New user registration
        const authRes = await authService.signUp(formData.email, formData.password, formData.fullName);
        if (!authRes?.user) throw new Error('Authentication failed.');
        userId = authRes.user.id;
        onAuthSuccess();

        // Persist extra profile fields collected in the form
        await supabase.from('profiles').upsert({
          id:            userId,
          phone_prefix:  formData.phonePrefix,
          phone_number:  formData.phoneNumber,
          ...(formData.age         !== '' && { age:            Number(formData.age) }),
          ...(formData.gender               && { gender:         formData.gender }),
          ...(formData.nationality           && { nationality:    formData.nationality }),
          ...(formData.hasWhatsapp !== null  && { phone_whatsapp: formData.hasWhatsapp }),
          updated_at: new Date().toISOString(),
        }, { onConflict: 'id' });
      }

      // Verify session is still alive before INSERT
      const { data: sessionCheck } = await supabase.auth.getSession();
      if (!sessionCheck?.session) {
        throw new Error('Your session has expired. Please log in again kha.');
      }

      const driverId = await resolveDriverId();
      const payload  = buildBookingPayload(userId, session, selectedDate, pax, visitors, finalPrice, paymentMethod, formData, driverId);

      const { data, error } = await supabase
        .from('bookings')
        .insert(payload)
        .select('internal_id')
        .single();

      if (error) throw error;
      if (data) localStorage.setItem('last_edited_booking', data.internal_id);

      onNavigate('user');
    } catch (err: any) {
      console.error('Submit error:', err);
      alert(t('booking:bookingError') + (err.message ?? 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  // ── handleStandaloneLogin — existing user: login → booking atomically ──────
  const handleStandaloneLogin = async () => {
    if (!formData.email || !formData.password) {
      alert('Please enter your email and password.');
      return;
    }
    if (!session || !selectedDate) {
      alert('Booking data missing. Please go back to step 1.');
      return;
    }
    setLoading(true);

    try {
      // 1. Login — get userId immediately from response (no state dependency)
      const response = await authService.signIn(formData.email, formData.password);
      if (!response?.user) throw new Error('Invalid credentials.');

      const userId = response.user.id;

      // 2. Build and insert booking
      const driverId = await resolveDriverId();
      const payload  = buildBookingPayload(userId, session, selectedDate, pax, visitors, finalPrice, paymentMethod, formData, driverId);

      const { data: bookingData, error: bookingError } = await supabase
        .from('bookings')
        .insert(payload)
        .select('internal_id')
        .single();

      if (bookingError) throw bookingError;
      if (bookingData) localStorage.setItem('last_edited_booking', bookingData.internal_id);

      onAuthSuccess();
      onNavigate('user');
    } catch (err: any) {
      console.error('Login+booking error:', err);
      alert(t('booking:bookingError') + (err.message ?? 'Errore durante il login o la prenotazione.'));
    } finally {
      setLoading(false);
    }
  };

  return { loading, handleSubmit, handleStandaloneLogin };
}
