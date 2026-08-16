/**
 * useBookingForm
 * Manages booking form state: formData, authMode, paymentMethod.
 * Syncs formData with userProfile whenever the prop changes.
 *
 * Navigation (setViewStep) is intentionally NOT handled here —
 * the orchestrator owns viewStep and applies the correct guard.
 */

import { useState, useEffect } from 'react';
import type {
  BookingFormData,
  AuthMode,
  PaymentMethod,
} from '../booking.types';
import { EMPTY_FORM_DATA } from '../booking.types';
import type { UserProfile } from '../../../services/auth.service';

export interface UseBookingFormResult {
  formData:         BookingFormData;
  setFormData:      (data: BookingFormData | ((prev: BookingFormData) => BookingFormData)) => void;
  authMode:         AuthMode;
  setAuthMode:      (m: AuthMode) => void;
  paymentMethod:    PaymentMethod;
  setPaymentMethod: (m: PaymentMethod) => void;
}

export function useBookingForm(
  userProfile: UserProfile | null,
): UseBookingFormResult {
  const [formData, setFormData] = useState<BookingFormData>({
    ...EMPTY_FORM_DATA,
    fullName: userProfile?.full_name || '',
    email:    userProfile?.email     || '',
  });

  const [authMode,      setAuthMode]      = useState<AuthMode>('guest');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('arrival');

  // Sync profile fields into form whenever userProfile changes
  useEffect(() => {
    const isActualUser = userProfile && userProfile.role !== 'guest_virtual';
    if (!isActualUser) return;

    setFormData(prev => ({
      ...prev,
      fullName:    userProfile.full_name     || '',
      email:       userProfile.email         || '',
      phonePrefix: userProfile.phone_prefix  || prev.phonePrefix,
      phoneNumber: userProfile.phone_number  || prev.phoneNumber,
      nationality: userProfile.nationality   || prev.nationality,
      gender:      userProfile.gender        || prev.gender,
      age:         userProfile.age           ? String(userProfile.age) : prev.age,
      hasWhatsapp: userProfile.phone_whatsapp ?? prev.hasWhatsapp,
    }));
  }, [userProfile]); // eslint-disable-line react-hooks/exhaustive-deps

  return {
    formData, setFormData,
    authMode, setAuthMode,
    paymentMethod, setPaymentMethod,
  };
}
