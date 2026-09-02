/**
 * BookingCheckout — orchestrator (~80 lines)
 *
 * Was 477 lines. Now delegates to:
 *   GuestAuthStep   — guest vs login choice + login form
 *   BookingForm     — personal data + payment + submit
 *
 * Still owns:
 *   - Hero header section ("Secure Your Cooking Station")
 *   - Summary bar (Date / Class / Group pills + Modify button)
 *   - Step routing logic
 */

import React from 'react';
import { Typography, Icon } from '../ui/index';
import { cn } from '@thaiakha/shared/lib/utils';
import GuestAuthStep from './GuestAuthStep';
import BookingForm from './BookingForm';
import type {
  SessionInfo,
  AuthMode,
  PaymentMethod,
  ViewStep,
  BookingFormData,
} from './booking.types';
import type { UserProfile } from '../../services/auth.service';

const MONTHS_SHORT = ['JAN','FEB','MAR','APR','MAY','JUN','JUL','AUG','SEP','OCT','NOV','DEC'];

interface BookingCheckoutProps {
  viewStep:             ViewStep;
  setViewStep:          (s: ViewStep) => void;
  session:              'morning_class' | 'evening_class' | null;
  sessionConfig:        Record<string, SessionInfo>;
  selectedDate:         Date | null;
  formattedDateStr:     string;
  pax:                  number;
  visitors:             number;
  userProfile:          UserProfile | null;
  authMode:             AuthMode;
  setAuthMode:          (m: AuthMode) => void;
  formData:             BookingFormData;
  setFormData:          (d: BookingFormData | ((prev: BookingFormData) => BookingFormData)) => void;
  paymentMethod:        PaymentMethod;
  setPaymentMethod:     (m: PaymentMethod) => void;
  finalPrice:           number;
  handleSubmit:         () => Promise<void>;
  handleStandaloneLogin: () => Promise<void>;
  loading:              boolean;
  loggedInUserId?:      string | null;
}

export const BookingCheckout: React.FC<BookingCheckoutProps> = ({
  viewStep, setViewStep,
  session, sessionConfig,
  selectedDate, pax,
  userProfile, authMode, setAuthMode,
  formData, setFormData,
  paymentMethod, setPaymentMethod,
  finalPrice, handleSubmit, handleStandaloneLogin,
  loading, loggedInUserId,
}) => {
  const isActualUser = (userProfile && userProfile.role !== 'guest_virtual') || !!loggedInUserId;

  if (viewStep === 'selection' || !session || !sessionConfig[session]) return null;

  const shortDateStr = selectedDate
    ? `${selectedDate.getDate()} ${MONTHS_SHORT[selectedDate.getMonth()]}`
    : '';

  return (
    <div className="animate-in fade-in slide-in-from-bottom-8">

      {/* Hero */}
      <div className="flex flex-col items-center text-center [margin-bottom:var(--space-fluid-xl)] [padding-top:var(--space-fluid-l)]">
        <Typography variant="h1" className="font-black uppercase tracking-tighter mb-4 [font-size:var(--text-fluid-display2)]">
          Secure Your <span className="text-primary italic">Cooking</span> <span className="text-action">Station</span>
        </Typography>
        <div className="flex [gap:var(--space-fluid-xs)] [margin-bottom:var(--space-fluid-l)]">
          {[...Array(10)].map((_, i) => {
            const colors = ['bg-primary','bg-primary','bg-primary','bg-primary','bg-action','bg-primary','bg-action','bg-action/20','bg-action/20','bg-action/20'];
            return <div key={i} className={cn('w-4 h-2.5 rounded-sm', colors[i] || 'bg-white/10')} />;
          })}
        </div>
        <Typography variant="paragraphS" className="max-w-2xl opacity-60 leading-relaxed">
          Check availability and reserve your Cooking Class in Chiang Mai.
          Instant Reservation - Secure Payments - 100% Refundable
        </Typography>
      </div>

      {/* Step label */}
      <div className="text-center [margin-bottom:var(--space-fluid-xl)]">
        <Typography variant="microLabel" color="muted" className="tracking-[0.4em] font-black mb-1 block uppercase">
          04. REVIEW &amp; CONFIRM
        </Typography>
        <Typography variant="h2" className="[font-size:var(--text-fluid-h1)] font-black mb-4">Review Your Journey</Typography>
        <Typography variant="paragraphS" className="opacity-50">Double-check your details before we heat up the wok.</Typography>
      </div>

      {/* Summary bar */}
      <div className="w-full bg-surface-elevated/40 backdrop-blur-md border border-border/50 p-4 rounded-[2.5rem] flex flex-col md:flex-row items-center [gap:var(--space-fluid-m)] [margin-bottom:var(--space-fluid-xl)] shadow-2xl">
        <div className="flex-1 w-full grid grid-cols-1 md:grid-cols-3 [gap:var(--space-fluid-s)]">
          {[
            { icon: 'calendar_today', label: 'Date',  value: shortDateStr || 'Select' },
            { icon: 'dark_mode',      label: 'Class', value: sessionConfig[session]?.label.split(' ')[0] || 'Select' },
            { icon: 'groups',         label: 'Group', value: `${pax} ${pax > 1 ? 'Chefs' : 'Chef'}` },
          ].map(({ icon, label, value }) => (
            <div key={label} className="flex items-center [gap:var(--space-fluid-s)] bg-surface/60 p-3 pr-8 rounded-full border border-border/50 hover:bg-surface transition-all">
              <div className="w-12 h-12 rounded-full bg-action/20 flex items-center justify-center text-action shadow-[0_0_15px_rgba(152,201,60,0.2)]">
                <Icon name={icon} size="sm" />
              </div>
              <div className="flex flex-col">
                <Typography variant="microLabel" color="muted">{label}</Typography>
                <Typography variant="h6" as="span" className="font-black text-title uppercase tracking-tight">{value}</Typography>
              </div>
            </div>
          ))}
        </div>
        <button onClick={() => setViewStep('selection')}
          className="rounded-full px-8 h-12 bg-surface-2 border border-border hover:bg-surface hover:border-border-2 transition-all uppercase text-title flex items-center gap-2 group cursor-pointer">
          <Icon name="edit" size="sm" className="opacity-40 group-hover:opacity-100 transition-opacity" />
          <Typography variant="microLabel" as="span" className="text-title">Modify</Typography>
        </button>
      </div>

      {/* Auth step */}
      {viewStep === 'auth' && !isActualUser && (
        <div className="[margin-bottom:var(--space-fluid-xl)]">
          <GuestAuthStep
            authMode={authMode}
            setAuthMode={setAuthMode}
            formData={formData}
            setFormData={setFormData}
            loading={loading}
            onGoToGuestForm={() => { setAuthMode('guest'); setViewStep('form'); }}
            handleStandaloneLogin={handleStandaloneLogin}
          />
        </div>
      )}

      {/* Main form + payment */}
      {(viewStep === 'form' || isActualUser) && (
        <BookingForm
          formData={formData}
          setFormData={setFormData}
          authMode={authMode}
          userProfile={userProfile}
          loggedInUserId={loggedInUserId}
          paymentMethod={paymentMethod}
          setPaymentMethod={setPaymentMethod}
          finalPrice={finalPrice}
          loading={loading}
          handleSubmit={handleSubmit}
          onGoBack={() => setViewStep('auth')}
        />
      )}
    </div>
  );
};
