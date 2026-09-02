/**
 * BookingForm
 * The main checkout form: personal data + payment + submit.
 * Shown for both new guest users and already-authenticated users.
 *
 * Contains:
 *   - Personal data fields (name, email, phone, age, gender, nationality)
 *   - Password field for new users only
 *   - After-registration info card
 *   - Terms & Privacy acceptance
 *   - Payment method selector
 *   - Submit button
 *   - Legal modals (Terms / Privacy)
 */

import React, { useState, useEffect } from 'react';
import { Typography, Icon, Button, Card, Modal } from '../ui/index';
import { Input, PhonePrefixSelect, NationalitySelect } from '../ui/form';
import { cn } from '@thaiakha/shared/lib/utils';
import type { LegalDocument, LegalDocumentSection } from '@thaiakha/shared';
import { getInfoPage } from '../../services/infoPages.service';
import { InfoContentSkeleton } from '../skeleton';
import type { BookingFormData, AuthMode, PaymentMethod } from './booking.types';
import type { UserProfile } from '../../services/auth.service';
import { sanitizeHtml } from '../../lib/sanitizeHtml';

// ─── Mineral select ───────────────────────────────────────────────────────────
const MineralSelect = ({
  label, value, onChange, children, className,
}: {
  label?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  children: React.ReactNode;
  className?: string;
}) => (
  <div className={cn('space-y-2 w-full', className)}>
    {label && <Typography variant="fieldLabel" className="ml-1 opacity-70">{label}</Typography>}
    <select
      value={value}
      onChange={onChange}
      className="w-full px-4 py-3 rounded-xl border transition-all duration-300 ease-cinematic bg-surface-2 border-border text-title focus:outline-none focus:ring-2 focus:ring-offset-0 focus:ring-action/50 focus:bg-surface focus:border-action/50 cursor-pointer"
    >
      {children}
    </select>
  </div>
);

// ─── Legal document renderer ──────────────────────────────────────────────────
const LegalContent = ({ doc }: { doc: LegalDocument }) => (
  <div className="space-y-6 text-sm">
    <Typography variant="caption" className="not-italic opacity-60">
      Effective: {new Date(doc.effectiveDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
    </Typography>
    {doc.sections?.map((s: LegalDocumentSection, i: number) => (
      <div key={i}>
        <Typography variant="h5" className="mb-2 font-black">{s.title}</Typography>
        {typeof s.content === 'string'
          ? <Typography variant="body" className="opacity-80" dangerouslySetInnerHTML={{ __html: sanitizeHtml(s.content) }} />
          : Array.isArray(s.content)
            ? <ul className="list-disc list-inside space-y-1">
                {s.content.map((c: string, j: number) => (
                  <li key={j} className="inline-block w-full">
                    <Typography variant="body" color="sub" className="opacity-80 inline" dangerouslySetInnerHTML={{ __html: sanitizeHtml(c) }} />
                  </li>
                ))}
              </ul>
            : null}
        {s.subsections?.map((sub, k: number) => (
          <div key={k} className="ml-4 mt-3">
            <Typography variant="paragraphS" className="font-bold mb-1 text-title">{sub.title}</Typography>
            {typeof sub.content === 'string'
              ? <Typography variant="body" className="opacity-80" dangerouslySetInnerHTML={{ __html: sanitizeHtml(sub.content) }} />
              : Array.isArray(sub.content)
                ? <ul className="list-disc list-inside space-y-1">
                    {sub.content.map((c: string, j: number) => (
                      <li key={j} className="inline-block w-full">
                        <Typography variant="body" color="sub" className="opacity-80 inline" dangerouslySetInnerHTML={{ __html: sanitizeHtml(c) }} />
                      </li>
                    ))}
                  </ul>
                : null}
          </div>
        ))}
      </div>
    ))}
  </div>
);

// ─── Props ────────────────────────────────────────────────────────────────────
interface BookingFormProps {
  formData:        BookingFormData;
  setFormData:     (d: BookingFormData | ((prev: BookingFormData) => BookingFormData)) => void;
  authMode:        AuthMode;
  userProfile:     UserProfile | null;
  loggedInUserId?: string | null;
  paymentMethod:   PaymentMethod;
  setPaymentMethod: (m: PaymentMethod) => void;
  finalPrice:      number;
  loading:         boolean;
  handleSubmit:    () => Promise<void>;
  onGoBack:        () => void;
}

// ─── Component ────────────────────────────────────────────────────────────────
const BookingForm: React.FC<BookingFormProps> = ({
  formData, setFormData,
  authMode, userProfile, loggedInUserId,
  paymentMethod, setPaymentMethod,
  finalPrice, loading,
  handleSubmit, onGoBack,
}) => {
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [legalModal, setLegalModal]       = useState<'terms' | 'privacy' | null>(null);
  // Documenti legali dal DB (info_pages, stessa fonte di Terms/Privacy page) —
  // fetch lazy alla prima apertura del modal, poi restano in stato.
  const [legalDocs, setLegalDocs] = useState<{ terms: LegalDocument | null; privacy: LegalDocument | null }>({ terms: null, privacy: null });
  useEffect(() => {
    if (!legalModal || legalDocs[legalModal]) return;
    const kind = legalModal;
    const slug = kind === 'terms' ? 'booking-terms-conditions' : 'privacy-policy';
    let cancelled = false;
    getInfoPage(slug).then(doc => {
      if (!cancelled) setLegalDocs(prev => ({ ...prev, [kind]: doc }));
    });
    return () => { cancelled = true; };
  }, [legalModal, legalDocs]);

  const isActualUser = (userProfile && userProfile.role !== 'guest_virtual') || !!loggedInUserId;
  const canSubmit    = termsAccepted || isActualUser;

  const update = (patch: Partial<BookingFormData>) =>
    setFormData(prev => ({ ...prev, ...patch }));

  return (
    <Card variant="glass" className="p-8 border-border bg-surface/50">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center [margin-bottom:var(--space-fluid-l)] [gap:var(--space-fluid-s)]">
        <div>
          <Typography variant="h4" className="italic">
            {isActualUser ? 'I Tuoi Dati' : (authMode === 'login' ? 'Accesso Utente' : 'Dati Nuovo Utente')}
          </Typography>
          {isActualUser ? (
            <Typography variant="caption" className="not-italic text-action font-bold mt-1 inline-flex items-center gap-1">
              <Icon name="verified" size="xs" /> Account collegato: {userProfile?.full_name || formData.fullName || 'Utente'}
            </Typography>
          ) : (
            <Typography variant="caption" className="not-italic opacity-60 mt-1">
              {authMode === 'login' ? 'Accedi per usare il tuo profilo.' : 'Crea un account per completare la prenotazione.'}
            </Typography>
          )}
        </div>
        {!isActualUser && (
          <Button variant="mineral" size="sm" icon="view_list" onClick={onGoBack} className="text-xs h-10 px-4 border-border hover:border-title shrink-0">
            Indietro
          </Button>
        )}
      </div>

      <div className="space-y-5">
        {/* Row 1: Name + Email */}
        <div className="grid grid-cols-1 md:grid-cols-2 [gap:var(--space-fluid-s)]">
          <Input label="Full Name" autoComplete="name" value={formData.fullName}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => update({ fullName: e.target.value })}
            disabled={isActualUser} leftIcon="person" />
          <Input label="Email" type="email" autoComplete="email" value={formData.email}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => update({ email: e.target.value })}
            disabled={isActualUser} leftIcon="mail" />
        </div>

        {/* Row 2: Phone + WhatsApp */}
        {/* A 375px la 12-col fissa strozzava i campi (Prefix ~63px): su mobile si impila, da md il layout resta quello di prima */}
        <div className="grid grid-cols-12 [gap:var(--space-fluid-s)] items-start">
          <div className="col-span-5 md:col-span-3 space-y-2">
            <Typography variant="fieldLabel" className="ml-1 opacity-70">Prefix</Typography>
            <PhonePrefixSelect value={formData.phonePrefix} onChange={val => update({ phonePrefix: val })} />
          </div>
          <div className="col-span-7 md:col-span-5">
            <Input label="Phone Number" type="tel" autoComplete="tel-national" placeholder="81 234 5678"
              value={formData.phoneNumber}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => update({ phoneNumber: e.target.value })} />
          </div>
          <div className="col-span-12 md:col-span-4 space-y-2">
            <Typography variant="fieldLabel" as="label" className="ml-1 opacity-70">WhatsApp</Typography>
            <div className="flex gap-2">
              {([true, false] as const).map(val => (
                <button key={String(val)} type="button" onClick={() => update({ hasWhatsapp: val })}
                  className={cn(
                    'flex-1 min-h-[50px] py-3 px-3 rounded-xl border text-xs font-black uppercase tracking-widest transition-all duration-200 flex items-center justify-center gap-1.5 cursor-pointer',
                    formData.hasWhatsapp === val
                      ? val ? 'border-action/60 bg-action/10 text-action shadow-glow-lime'
                             : 'border-primary/50 bg-primary/10 text-primary'
                      : 'border-border bg-surface-2 text-muted hover:border-border-2',
                  )}>
                  <span className="text-sm">{val ? '✓' : '✗'}</span>
                  <Typography variant="microLabel" as="span">{val ? 'Yes' : 'No'}</Typography>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Row 3: Age + Gender + Nationality */}
        <div className="grid grid-cols-12 [gap:var(--space-fluid-s)] items-start">
          <div className="col-span-4 md:col-span-3">
            <Input label="Age" type="number" min="0" max="120" placeholder="—"
              value={formData.age}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => update({ age: e.target.value })} />
          </div>
          <div className="col-span-8 md:col-span-4">
            <MineralSelect label="Gender" value={formData.gender}
              onChange={e => update({ gender: e.target.value })}>
              <option value="">Select</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </MineralSelect>
          </div>
          <div className="col-span-12 md:col-span-5 space-y-2">
            <Typography variant="fieldLabel" className="ml-1 opacity-70">Nationality</Typography>
            <NationalitySelect value={formData.nationality} onChange={code => update({ nationality: code })} />
          </div>
        </div>

        {/* Password — new users only */}
        {!userProfile && !loggedInUserId && authMode !== 'login' && (
          <Input label="Create Password" type="password" autoComplete="new-password" placeholder="Min 6 chars"
            value={formData.password}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => update({ password: e.target.value })}
            leftIcon="lock" />
        )}

        {/* After-registration info card */}
        <div className="flex items-start gap-4 bg-action/5 border border-action/20 rounded-2xl p-5">
          <div className="p-2 bg-action/10 rounded-xl shrink-0 mt-0.5">
            <Icon name="info" className="text-action" size="md" />
          </div>
          <div>
            <Typography variant="h6" as="p" className="mb-1 font-black text-title">After Registration</Typography>
            <Typography variant="caption" className="not-italic opacity-70 leading-relaxed">
              Once registered, you'll be able to set your <strong className="text-title">pickup location</strong>,
              choose your <strong className="text-title">preferred menu</strong>, and access exclusive member
              benefits — all from your personal dashboard.
            </Typography>
          </div>
        </div>

        {/* Terms & Conditions */}
        <div className="flex items-start gap-3 pt-1">
          <button type="button" onClick={() => setTermsAccepted(v => !v)}
            aria-pressed={termsAccepted}
            className={cn(
              // before:-inset-3 porta l'area tocco a 44px (20+24) senza toccare il visuale
              'relative before:absolute before:-inset-3 before:content-[\'\'] mt-0.5 w-5 h-5 shrink-0 rounded border-2 flex items-center justify-center transition-all duration-200 cursor-pointer',
              termsAccepted ? 'bg-action border-action shadow-glow-lime' : 'bg-surface-2 border-border hover:border-action/50',
            )}>
            {termsAccepted && (
              <span className="material-symbols-outlined text-[13px] text-background font-black" style={{ fontVariationSettings: "'FILL' 1, 'wght' 700" }}>check</span>
            )}
          </button>
          <Typography variant="caption" className="not-italic opacity-70 leading-relaxed">
            I agree to the{' '}
            <button type="button" onClick={() => setLegalModal('terms')}
              className="text-title font-bold underline underline-offset-2 hover:text-action transition-colors cursor-pointer">
              Terms of Service
            </button>
            {' '}and{' '}
            <button type="button" onClick={() => setLegalModal('privacy')}
              className="text-title font-bold underline underline-offset-2 hover:text-action transition-colors cursor-pointer">
              Privacy Policy
            </button>
            . Required to complete your booking.
          </Typography>
        </div>

        {/* Payment */}
        <div className="pt-6 border-t border-border mt-6">
          <div className="flex justify-between items-end mb-4">
            <Typography variant="h6" className="opacity-60">Total Due</Typography>
            <Typography variant="h3" className="font-black">
              {finalPrice.toLocaleString()}{' '}
              <Typography variant="numericRegular" as="span" color="primary" className="text-sm">THB</Typography>
            </Typography>
          </div>

          {!(authMode === 'login' && !userProfile) && (
            <div className="grid grid-cols-2 [gap:var(--space-fluid-s)] [margin-bottom:var(--space-fluid-m)]">
              <button type="button" onClick={() => setPaymentMethod('arrival')}
                className={cn('p-4 rounded-2xl border text-left transition-all cursor-pointer',
                  paymentMethod === 'arrival' ? 'bg-action/10 border-action text-title' : 'bg-surface-2 border-border text-desc hover:bg-surface-2/10')}>
                <Typography variant="h6" as="div" className="mb-1">Paga all'Arrivo</Typography>
                <Typography variant="microLabel" as="div" className="opacity-70 normal-case font-medium">Contanti o QR Code</Typography>
              </button>
              <button type="button" onClick={() => setPaymentMethod('card')}
                className={cn('p-4 rounded-2xl border text-left transition-all cursor-pointer',
                  paymentMethod === 'card' ? 'bg-primary/10 border-primary text-title' : 'bg-surface-2 border-border text-desc hover:bg-surface-2/10')}>
                <Typography variant="h6" as="div" className="mb-1">Carta di Credito</Typography>
                <Typography variant="microLabel" as="div" className="opacity-70 normal-case font-medium">Stripe Secure</Typography>
              </button>
            </div>
          )}

          {!canSubmit && authMode === 'guest' && (
            <Typography variant="caption" className="not-italic text-primary/80 text-center mb-3">
              Please accept the Terms of Service to continue.
            </Typography>
          )}

          <Button
            variant={paymentMethod === 'card' ? 'brand' : 'action'}
            size="lg" fullWidth
            onClick={handleSubmit}
            isLoading={loading}
            disabled={!canSubmit}
            icon={paymentMethod === 'card' ? 'credit_card' : 'verified'}
            className="h-16 text-lg shadow-xl"
          >
            {paymentMethod === 'card' ? 'Paga Ora (Demo)' : 'Conferma Prenotazione'}
          </Button>
        </div>
      </div>

      {/* Legal modals */}
      <Modal
        isOpen={legalModal !== null}
        onClose={() => setLegalModal(null)}
        title={legalModal === 'terms' ? 'Terms of Service' : 'Privacy Policy'}
        size="lg"
      >
        {legalModal !== null && (
          legalDocs[legalModal]
            ? <LegalContent doc={legalDocs[legalModal]} />
            : <InfoContentSkeleton blocks={4} />
        )}
      </Modal>
    </Card>
  );
};

export default BookingForm;
