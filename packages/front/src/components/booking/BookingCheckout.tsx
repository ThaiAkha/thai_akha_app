import React, { useState } from 'react';
import { Typography, Button, Card, Input, Icon, Modal } from '../ui/index';
import { cn } from '@thaiakha/shared/lib/utils';
import { TERMS_OF_SERVICE, PRIVACY_POLICY } from '@thaiakha/shared/data';
import { StepHeader } from './StepHeader';
import { PhonePrefixSelect } from './PhonePrefixSelect';
import { NationalitySelect } from './NationalitySelect';
import { BookingSummaryPills } from './BookingSummaryPills';

// ─── Mineral select — matches Input mineral style ──────────────────────────
const MineralSelect = ({ label, value, onChange, children, className }: {
  label?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  children: React.ReactNode;
  className?: string;
}) => (
  <div className={cn('space-y-2 w-full', className)}>
    {label && <label className="ml-1 font-accent text-xs font-black uppercase tracking-widest text-desc/70">{label}</label>}
    <select
      value={value}
      onChange={onChange}
      className="w-full px-4 py-3 rounded-xl border transition-all duration-300 ease-cinematic bg-black/5 dark:bg-white/5 border-black/10 dark:border-white/10 text-title focus:outline-none focus:ring-2 focus:ring-offset-0 focus:ring-action/50 focus:bg-black/10 dark:focus:bg-white/10 focus:border-action/50 cursor-pointer"
    >
      {children}
    </select>
  </div>
);

// ─── Legal document renderer ────────────────────────────────────────────────
const LegalContent = ({ doc }: { doc: any }) => (
  <div className="space-y-6 text-sm">
    <p className="text-desc/60 text-xs">Effective: {new Date(doc.effectiveDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
    {doc.sections?.map((s: any, i: number) => (
      <div key={i}>
        <h3 className="font-black uppercase tracking-tight text-title mb-2">{s.title}</h3>
        {typeof s.content === 'string'
          ? <p className="text-desc/80 leading-relaxed">{s.content}</p>
          : Array.isArray(s.content)
            ? <ul className="list-disc list-inside space-y-1 text-desc/80">{s.content.map((c: string, j: number) => <li key={j}>{c}</li>)}</ul>
            : null}
        {s.subsections?.map((sub: any, k: number) => (
          <div key={k} className="ml-4 mt-3">
            <h4 className="font-bold text-title mb-1">{sub.title}</h4>
            {typeof sub.content === 'string'
              ? <p className="text-desc/80 leading-relaxed">{sub.content}</p>
              : Array.isArray(sub.content)
                ? <ul className="list-disc list-inside space-y-1 text-desc/80">{sub.content.map((c: string, j: number) => <li key={j}>{c}</li>)}</ul>
                : null}
          </div>
        ))}
      </div>
    ))}
  </div>
);

// ─── Props ──────────────────────────────────────────────────────────────────
interface BookingCheckoutProps {
  viewStep: 'selection' | 'auth' | 'form';
  setViewStep: (step: 'selection' | 'auth' | 'form') => void;
  session: 'morning_class' | 'evening_class' | null;
  sessionConfig: Record<string, any>;
  selectedDate: Date | null;
  formattedDateStr: string;
  pax: number;
  visitors: number;
  userProfile: any;
  authMode: 'guest' | 'login';
  setAuthMode: (mode: 'guest' | 'login') => void;
  formData: any;
  setFormData: (data: any) => void;
  paymentMethod: 'arrival' | 'card';
  setPaymentMethod: (method: 'arrival' | 'card') => void;
  finalPrice: number;
  handleSubmit: () => Promise<void>;
  loading: boolean;
}

const MONTHS_SHORT = ['JAN','FEB','MAR','APR','MAY','JUN','JUL','AUG','SEP','OCT','NOV','DEC'];

export const BookingCheckout: React.FC<BookingCheckoutProps> = ({
  viewStep, setViewStep,
  session, sessionConfig,
  selectedDate, formattedDateStr, pax, visitors,
  userProfile, authMode, setAuthMode,
  formData, setFormData,
  paymentMethod, setPaymentMethod,
  finalPrice, handleSubmit, loading
}) => {
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [legalModal, setLegalModal] = useState<'terms' | 'privacy' | null>(null);

  if (viewStep === 'selection' || !session || !sessionConfig[session]) return null;

  const shortDateStr = selectedDate
    ? `${selectedDate.getDate()} ${MONTHS_SHORT[selectedDate.getMonth()]}`
    : '';

  const canSubmit = authMode === 'login' ? true : termsAccepted;

  return (
    <div className="animate-in fade-in slide-in-from-bottom-8">
      <StepHeader
        number="04"
        stepName="Review & Confirm"
        title="Review Your Journey"
        subtitle="Double-check your details before we heat up the wok."
      />

      {/* SUMMARY */}
      <div className="bg-surface/90 backdrop-blur-sm border border-border/50 rounded-3xl p-4 md:p-5 shadow-md mb-8 flex items-center gap-4">
        <BookingSummaryPills
          shortDateStr={shortDateStr}
          session={session}
          pax={pax}
          visitors={visitors}
          selectedDate={selectedDate}
          className="flex-1"
        />
        <button
          onClick={() => setViewStep('selection')}
          className="shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-full border border-border/50 bg-black/5 dark:bg-white/5 hover:border-action/50 hover:bg-action/5 hover:text-action text-desc/60 text-xs font-black uppercase tracking-wider transition-all cursor-pointer"
        >
          <Icon name="edit" size="sm" />
          <span className="hidden sm:inline">Modify</span>
        </button>
      </div>

      {/* AUTH TOGGLE */}
      {viewStep === 'auth' && !userProfile && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <button onClick={() => { setAuthMode('login'); setViewStep('form'); }} className="bg-surface hover:bg-black/5 dark:hover:bg-white/5 border border-dashed border-border p-6 rounded-[2rem] text-left group transition-all cursor-pointer">
            <div className="flex items-center gap-3 mb-2"><Icon name="person" className="text-primary group-hover:scale-110 transition-transform" /><span className="font-bold text-title">Existing User</span></div>
            <p className="text-xs text-desc/60 pl-9">Login with your account.</p>
          </button>
          <button onClick={() => { setAuthMode('guest'); setViewStep('form'); }} className="bg-surface hover:bg-black/5 dark:hover:bg-white/5 border border-border p-6 rounded-[2rem] text-left group transition-all cursor-pointer">
            <div className="flex items-center gap-3 mb-2"><Icon name="person_add" className="text-title group-hover:scale-110 transition-transform" /><span className="font-bold text-title">New User</span></div>
            <p className="text-xs text-desc/60 pl-9">Create an account & book.</p>
          </button>
        </div>
      )}

      {/* FORM */}
      {(viewStep === 'form' || userProfile) && (
        <Card variant="glass" className="p-8 border-border bg-surface/50">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
            <div>
              <Typography variant="h4" className="text-title italic uppercase">
                {authMode === 'login' ? 'Member Login' : 'Your Details'}
              </Typography>
              {!userProfile && (
                <p className="text-xs text-desc/60 mt-1">
                  {authMode === 'login' ? "Access your profile & benefits." : "Create your account to complete the booking."}
                </p>
              )}
            </div>
            {!userProfile && (
              <Button variant="mineral" size="sm" icon={authMode === 'login' ? "person_add" : "login"} onClick={() => setAuthMode(authMode === 'login' ? 'guest' : 'login')} className="text-xs h-10 px-4 border-border hover:border-title shrink-0">
                {authMode === 'login' ? "New User instead" : "Login instead"}
              </Button>
            )}
          </div>

          <div className="space-y-5">

            {/* ── LOGIN MODE ── */}
            {authMode === 'login' && !userProfile ? (
              <>
                <Input label="Email" type="email" autoComplete="email" value={formData.email} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, email: e.target.value })} leftIcon="mail" />
                <Input label="Password" type="password" autoComplete="current-password" value={formData.password} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, password: e.target.value })} leftIcon="lock" />
              </>
            ) : (
              <>
                {/* Row 1: Name + Email */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input label="Full Name" autoComplete="name" value={formData.fullName} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, fullName: e.target.value })} disabled={!!userProfile} leftIcon="person" />
                  <Input label="Email" type="email" autoComplete="email" value={formData.email} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, email: e.target.value })} disabled={!!userProfile} leftIcon="mail" />
                </div>

                {/* Row 2: Phone prefix + number + WhatsApp */}
                <div className="grid grid-cols-12 gap-4 items-start">
                  <div className="col-span-3 space-y-2">
                    <label className="ml-1 font-accent text-xs font-black uppercase tracking-widest text-desc/70">Prefix</label>
                    <PhonePrefixSelect
                      value={formData.phonePrefix}
                      onChange={val => setFormData({ ...formData, phonePrefix: val })}
                    />
                  </div>
                  <div className="col-span-5">
                    <Input
                      label="Phone Number"
                      type="tel"
                      autoComplete="tel-national"
                      placeholder="81 234 5678"
                      value={formData.phoneNumber}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, phoneNumber: e.target.value })}
                    />
                  </div>
                  <div className="col-span-4 space-y-2">
                    <label className="ml-1 font-accent text-xs font-black uppercase tracking-widest text-desc/70">WhatsApp</label>
                    <div className="flex gap-2">
                      <button type="button" onClick={() => setFormData({ ...formData, hasWhatsapp: true })}
                        className={cn(
                          "flex-1 min-h-[50px] py-3 px-3 rounded-xl border text-xs font-black uppercase tracking-widest transition-all duration-200 flex items-center justify-center gap-1.5 cursor-pointer",
                          formData.hasWhatsapp === true
                            ? "border-action/60 bg-action/10 text-action shadow-[0_0_12px_-4px_rgba(152,201,60,0.4)]"
                            : "border-black/10 dark:border-white/10 bg-black/5 dark:bg-white/5 text-desc/50 hover:border-black/20 dark:hover:border-white/20"
                        )}>
                        <span className="text-sm">✓</span> Yes
                      </button>
                      <button type="button" onClick={() => setFormData({ ...formData, hasWhatsapp: false })}
                        className={cn(
                          "flex-1 min-h-[50px] py-3 px-3 rounded-xl border text-xs font-black uppercase tracking-widest transition-all duration-200 flex items-center justify-center gap-1.5 cursor-pointer",
                          formData.hasWhatsapp === false
                            ? "border-red-500/50 bg-red-500/10 text-red-400"
                            : "border-black/10 dark:border-white/10 bg-black/5 dark:bg-white/5 text-desc/50 hover:border-black/20 dark:hover:border-white/20"
                        )}>
                        <span className="text-sm">✗</span> No
                      </button>
                    </div>
                  </div>
                </div>

                {/* Row 3: Age + Gender + Nationality */}
                <div className="grid grid-cols-12 gap-4 items-start">
                  <div className="col-span-3">
                    <Input
                      label="Age"
                      type="number"
                      min="0"
                      max="120"
                      placeholder="—"
                      value={formData.age}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, age: e.target.value })}
                    />
                  </div>
                  <div className="col-span-4">
                    <MineralSelect
                      label="Gender"
                      value={formData.gender}
                      onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                    >
                      <option value="">Select</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                    </MineralSelect>
                  </div>
                  <div className="col-span-5 space-y-2">
                    <label className="ml-1 font-accent text-xs font-black uppercase tracking-widest text-desc/70">Nationality</label>
                    <NationalitySelect
                      value={formData.nationality}
                      onChange={code => setFormData({ ...formData, nationality: code })}
                    />
                  </div>
                </div>

                {/* Password (new user only) */}
                {!userProfile && (
                  <Input label="Create Password" type="password" autoComplete="new-password" placeholder="Min 6 chars" value={formData.password} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, password: e.target.value })} leftIcon="lock" />
                )}

                {/* Info card — replaces notes */}
                <div className="flex items-start gap-4 bg-action/5 border border-action/20 rounded-2xl p-5">
                  <div className="p-2 bg-action/10 rounded-xl shrink-0 mt-0.5">
                    <Icon name="info" className="text-action" size="md" />
                  </div>
                  <div>
                    <p className="font-black text-sm text-title uppercase tracking-tight mb-1">After Registration</p>
                    <p className="text-xs text-desc/70 leading-relaxed">
                      Once registered, you'll be able to set your <strong className="text-title">pickup location</strong>, choose your <strong className="text-title">preferred menu</strong>, and access exclusive member benefits — all from your personal dashboard.
                    </p>
                  </div>
                </div>

                {/* Terms & Conditions */}
                <div className="flex items-start gap-3 pt-1">
                  <button
                    type="button"
                    onClick={() => setTermsAccepted(!termsAccepted)}
                    className={cn(
                      "mt-0.5 w-5 h-5 shrink-0 rounded border-2 flex items-center justify-center transition-all duration-200 cursor-pointer",
                      termsAccepted
                        ? "bg-action border-action shadow-[0_0_10px_-2px_rgba(152,201,60,0.5)]"
                        : "bg-black/5 dark:bg-white/5 border-black/20 dark:border-white/20 hover:border-action/50"
                    )}
                  >
                    {termsAccepted && <span className="material-symbols-outlined text-[13px] text-background font-black" style={{ fontVariationSettings: "'FILL' 1, 'wght' 700" }}>check</span>}
                  </button>
                  <p className="text-xs text-desc/70 leading-relaxed">
                    I agree to the{" "}
                    <button type="button" onClick={() => setLegalModal('terms')} className="text-title font-bold underline underline-offset-2 hover:text-action transition-colors cursor-pointer">
                      Terms of Service
                    </button>
                    {" "}and{" "}
                    <button type="button" onClick={() => setLegalModal('privacy')} className="text-title font-bold underline underline-offset-2 hover:text-action transition-colors cursor-pointer">
                      Privacy Policy
                    </button>
                    . Required to complete your booking.
                  </p>
                </div>
              </>
            )}

            {/* ── PAYMENT ── */}
            <div className="pt-6 border-t border-border mt-6">
              <div className="flex justify-between items-end mb-4">
                <Typography variant="h6" className="text-desc/60 uppercase">Total Due</Typography>
                <Typography variant="h3" className="text-title font-black">{finalPrice.toLocaleString()} <span className="text-sm text-primary">THB</span></Typography>
              </div>

              {!(authMode === 'login' && !userProfile) && (
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <button type="button" onClick={() => setPaymentMethod('arrival')} className={cn("p-4 rounded-2xl border text-left transition-all cursor-pointer", paymentMethod === 'arrival' ? "bg-action/10 border-action text-title" : "bg-black/5 dark:bg-white/5 border-black/10 dark:border-white/10 text-desc hover:bg-black/10 dark:hover:bg-white/8")}>
                    <div className="font-bold text-sm uppercase mb-1">Pay on Arrival</div>
                    <div className="text-[10px] opacity-70">Cash or QR Code</div>
                  </button>
                  <button type="button" onClick={() => setPaymentMethod('card')} className={cn("p-4 rounded-2xl border text-left transition-all cursor-pointer", paymentMethod === 'card' ? "bg-primary/10 border-primary text-title" : "bg-black/5 dark:bg-white/5 border-black/10 dark:border-white/10 text-desc hover:bg-black/10 dark:hover:bg-white/8")}>
                    <div className="font-bold text-sm uppercase mb-1">Credit Card</div>
                    <div className="text-[10px] opacity-70">Stripe Secure</div>
                  </button>
                </div>
              )}

              {!canSubmit && authMode === 'guest' && (
                <p className="text-xs text-orange-400/80 text-center mb-3 font-medium">
                  Please accept the Terms of Service to continue.
                </p>
              )}

              <Button
                variant={paymentMethod === 'card' ? "brand" : "action"}
                size="xl"
                fullWidth
                onClick={handleSubmit}
                isLoading={loading}
                disabled={!canSubmit}
                icon={paymentMethod === 'card' ? "credit_card" : "verified"}
                className="h-16 text-lg shadow-xl"
              >
                {paymentMethod === 'card' ? "Pay Now (Demo)" : "Confirm & Pay Later"}
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Legal Modals */}
      <Modal
        isOpen={legalModal !== null}
        onClose={() => setLegalModal(null)}
        title={legalModal === 'terms' ? 'Terms of Service' : 'Privacy Policy'}
        size="lg"
      >
        {legalModal !== null && (
          <LegalContent doc={legalModal === 'terms' ? TERMS_OF_SERVICE : PRIVACY_POLICY} />
        )}
      </Modal>
    </div>
  );
};
