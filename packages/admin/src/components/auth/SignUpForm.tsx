import React, { useState, useRef } from "react";
import { Link, useNavigate } from "react-router";
import { EyeOff, Eye } from "lucide-react";
import { useTranslation } from "react-i18next";
import Label from "../form/Label";
import Input from "../form/input/InputField";
import Checkbox from "../form/input/Checkbox";
import PhoneCountryInput from "../common/PhoneCountryInput";
import LegalModal from "../legal/LegalModal";
import { useAuth } from "../../context/AuthContext";
import { useI18n } from "../../context/I18nContext";
import { supabase } from "@thaiakha/shared/lib/supabase";
// Documenti AGENCY: chi si registra qui e' un partner B2B, non un ospite.
// Una traduzione e' null finche' non e' pubblicata -> fallback esplicito all'inglese.
import {
  AGENCY_TERMS, AGENCY_TERMS_TH, AGENCY_TERMS_ZH, AGENCY_TERMS_ES,
  AGENCY_PRIVACY, AGENCY_PRIVACY_TH, AGENCY_PRIVACY_ZH, AGENCY_PRIVACY_ES,
} from "@thaiakha/shared/data";
import type { LegalDocument } from "@thaiakha/shared/types";
import { mergeLegalTranslation } from "@thaiakha/shared/lib/mergeLegalTranslation";

/**
 * Traduzioni disponibili nei file .ts, per lingua.
 * SignUpForm resta sui file e NON legge dal DB: in registrazione l'utente non e' ancora
 * autenticato e la RLS bloccherebbe la query. Quindi la lingua REALMENTE resa dipende da
 * quale file esiste, non da quale lingua ha scelto l'utente: la mappa serve a rendere
 * quella differenza esplicita invece che cablata su una lingua sola.
 */
const AGENCY_TRANSLATIONS: Record<string, { terms: LegalDocument | null; privacy: LegalDocument | null }> = {
  th: { terms: AGENCY_TERMS_TH, privacy: AGENCY_PRIVACY_TH },
  zh: { terms: AGENCY_TERMS_ZH, privacy: AGENCY_PRIVACY_ZH },
  es: { terms: AGENCY_TERMS_ES, privacy: AGENCY_PRIVACY_ES },
};

export default function SignUpForm() {
  const { t } = useTranslation('auth');
  const { lang } = useI18n();
  const { signUpAgency } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [isChecked, setIsChecked] = useState(false);
  const [legalModalOpen, setLegalModalOpen] = useState<'terms' | 'privacy' | null>(null);

  // Documenti legali FUSI per sezione, calcolati una volta sola: il modale mostra
  // esattamente questi, e la registrazione dell'accettazione ne riporta versione e
  // lingua. Un secondo calcolo separato potrebbe divergere da cio' che l'utente ha letto.
  // Nessuna lingua cablata: si guarda cosa esiste davvero per la lingua corrente.
  // 'en' non ha traduzione per definizione (e' l'originale).
  const activeTranslation = lang === 'en' ? undefined : AGENCY_TRANSLATIONS[lang];
  const docLang = activeTranslation ? lang : null;
  const mergedTerms = mergeLegalTranslation(AGENCY_TERMS, activeTranslation?.terms ?? null, docLang);
  const mergedPrivacy = mergeLegalTranslation(AGENCY_PRIVACY, activeTranslation?.privacy ?? null, docLang);

  // I documenti si ricalcolano a ogni render sulla lingua CORRENTE, ma l'accettazione
  // avviene al submit: senza congelare, chi legge in inglese, cambia lingua e poi invia
  // farebbe registrare una lingua che non ha letto. Si fotografa quindi al momento della
  // spunta, che e' l'atto di accettazione.
  const acceptedRef = useRef<{ terms: typeof mergedTerms; privacy: typeof mergedPrivacy } | null>(null);
  const handleAcceptChange = (checked: boolean) => {
    setIsChecked(checked);
    acceptedRef.current = checked ? { terms: mergedTerms, privacy: mergedPrivacy } : null;
  };

  // Agency Fields
  const [contactName, setContactName] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [taxId, setTaxId] = useState("");
  const [phone, setPhone] = useState("");
  const [lineId, setLineId] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    if (!contactName.trim()) { setError(t('signUp.validation.contactRequired')); return; }
    if (!companyName.trim()) { setError(t('signUp.validation.companyRequired')); return; }
    if (!taxId.trim())       { setError(t('signUp.validation.taxIdRequired')); return; }
    if (!phone.trim())       { setError(t('signUp.validation.phoneRequired')); return; }
    if (!email.trim())       { setError(t('signUp.validation.emailRequired')); return; }
    if (!password.trim())    { setError(t('signUp.validation.passwordRequired')); return; }
    if (!isChecked)          { setError(t('signUp.validation.termsRequired')); return; }

    setLoading(true);

    try {
      await signUpAgency(email, password, contactName, companyName, taxId, phone, lineId);

      // Traccia l'accettazione dei due documenti agency (append-only in profiles.legal_accepted).
      // `lang` = la lingua del testo REALMENTE mostrato: se la traduzione TH non esiste
      // l'utente ha letto l'inglese, e la prova deve dirlo. Versione, timestamp e IP li
      // timbra il server nella RPC. Non bloccante: un errore qui non annulla la registrazione.
      try {
        // Si registra ESATTAMENTE cio' che e' stato mostrato. La versione e' sempre quella
        // dell'originale (la traduzione non fa fede e porta source_version, che al primo
        // bump dell'inglese divergerebbe e farebbe fallire la registrazione). La lingua
        // distingue 'th-partial' quando alcune sezioni sono rimaste in inglese: dire 'th'
        // su un contratto letto per 2/13 in inglese sarebbe una prova inesatta.
        const acceptanceLang = (merged: ReturnType<typeof mergeLegalTranslation>) => {
          if (!merged.translationLang) return 'en';
          return merged.isPartialTranslation ? `${merged.translationLang}-partial` : merged.translationLang;
        };

        // Si usano i documenti FOTOGRAFATI alla spunta, non quelli della lingua corrente.
        const accepted = acceptedRef.current ?? { terms: mergedTerms, privacy: mergedPrivacy };

        const record = () => Promise.all([
          supabase.rpc('record_legal_acceptance', {
            p_doc_key: 'agency_terms',
            p_lang: acceptanceLang(accepted.terms),
            p_shown_version: accepted.terms.version,
          }),
          supabase.rpc('record_legal_acceptance', {
            p_doc_key: 'agency_policy',
            p_lang: acceptanceLang(accepted.privacy),
            p_shown_version: accepted.privacy.version,
          }),
        ]);

        // supabase.rpc() NON lancia: restituisce { data, error }. Senza questo controllo
        // il catch sarebbe codice morto e un consenso non registrato sparirebbe in silenzio.
        let results = await record();
        if (results.some(r => r.error)) {
          // Un solo ritentativo: copre la finestra in cui la sessione o il profilo non
          // sono ancora pronti subito dopo la registrazione.
          await new Promise(res => setTimeout(res, 800));
          results = await record();
        }
        const failed = results.filter(r => r.error);
        if (failed.length > 0) {
          failed.forEach(r => console.error("Legal acceptance NOT recorded:", r.error));
          // NON silenzioso: la prova di consenso e' l'unica cosa che documenta cosa e
          // in quale lingua il partner ha accettato. Se non si registra, l'account resta
          // valido ma qualcuno deve saperlo.
          alert(t('signUp.legalRecordFailed', {
            defaultValue:
              'Your account was created, but we could not record your acceptance of the Terms and Privacy Policy. Please contact us so we can complete it.',
          }));
        }
      } catch (legalErr) {
        console.error("Legal acceptance tracking failed:", legalErr);
        alert(t('signUp.legalRecordFailed', {
          defaultValue:
            'Your account was created, but we could not record your acceptance of the Terms and Privacy Policy. Please contact us so we can complete it.',
        }));
      }

      // Welcome email brandizzata (non-blocking: un errore qui non blocca la registrazione).
      try {
        await supabase.functions.invoke('send-admin-welcome', {
          body: {
            email,
            user_name: contactName,
            // Si manda la lingua REALE: la edge function sceglie il template e ricade
            // su EN per le lingue che non ha ancora (oggi es/zh). Cablare 'en' qui
            // significherebbe non accorgersi mai di quando i template vengono tradotti.
            lang,
            login_url: `${window.location.origin}/signin`,
          },
        });
      } catch (mailErr) {
        console.error("Welcome email failed (non-blocking):", mailErr);
      }

      navigate("/"); // Redirect or show success message
    } catch (err: unknown) {
      console.error("Signup failed:", err);
      setError((err instanceof Error ? err.message : '') || t('signUp.error'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col flex-1 w-full overflow-y-auto lg:w-1/2 no-scrollbar">
      <div className="flex flex-col justify-center flex-1 w-full max-w-lg mx-auto">
        <div className="glass-card p-6 sm:p-10 rounded-3xl border border-white/20 dark:border-white/10 shadow-brand">
          <div className="mb-5 sm:mb-8">
            <h1 className="mb-2 font-black text-gray-800 text-title-sm dark:text-white/90 sm:text-title-md uppercase tracking-tight">
              {t('signUp.title')}
            </h1>
            <p className="text-sm font-medium text-sub">
              {t('signUp.subtitle')}
            </p>
          </div>
          <div>
            <form onSubmit={handleSubmit}>
              <div className="space-y-5">
                {/* <!-- Company Name --> */}
                <div>
                  <Label htmlFor="companyName">
                    {t('signUp.fields.companyName')}<span className="text-sys-error">*</span>
                  </Label>
                  <Input
                    type="text"
                    id="companyName"
                    name="companyName"
                    autoComplete="organization"
                    placeholder={t('signUp.placeholders.companyName')}
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                  />
                </div>

                {/* <!-- Contact Name --> */}
                <div>
                  <Label htmlFor="contactName">
                    {t('signUp.fields.contactName')}<span className="text-sys-error">*</span>
                  </Label>
                  <Input
                    type="text"
                    id="contactName"
                    name="contactName"
                    autoComplete="name"
                    placeholder={t('signUp.placeholders.contactName')}
                    value={contactName}
                    onChange={(e) => setContactName(e.target.value)}
                  />
                </div>

                {/* <!-- Tax ID --> */}
                <div>
                  <Label htmlFor="taxId">
                    {t('signUp.fields.taxId')}<span className="text-sys-error">*</span>
                  </Label>
                  <Input
                    type="text"
                    id="taxId"
                    name="taxId"
                    autoComplete="off"
                    placeholder={t('signUp.placeholders.taxId')}
                    value={taxId}
                    onChange={(e) => setTaxId(e.target.value)}
                  />
                </div>

                {/* <!-- Email --> */}
                <div>
                  <Label htmlFor="email">
                    {t('signUp.fields.email')}<span className="text-sys-error">*</span>
                  </Label>
                  <Input
                    type="email"
                    id="email"
                    name="email"
                    autoComplete="email"
                    placeholder={t('signUp.placeholders.email')}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>

                {/* <!-- Password --> */}
                <div>
                  <Label htmlFor="password">
                    {t('signUp.fields.password')}<span className="text-sys-error">*</span>
                  </Label>
                  <div className="relative">
                    <Input
                      id="password"
                      name="password"
                      autoComplete="new-password"
                      placeholder={t('signUp.placeholders.password')}
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      aria-label={showPassword ? t('common.hidePassword') : t('common.showPassword')}
                      className="absolute z-30 -translate-y-1/2 cursor-pointer right-4 top-1/2 rounded focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
                    >
                      {showPassword ? (
                        <EyeOff className="fill-gray-500 dark:fill-gray-400 size-5" />
                      ) : (
                        <Eye className="fill-gray-500 dark:fill-gray-400 size-5" />
                      )}
                    </button>
                  </div>
                </div>

                {/* <!-- Phone Number & Line ID --> */}
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                  {/* <!-- Phone --> */}
                  <div className="sm:col-span-1">
                    <Label htmlFor="phone">
                      {t('signUp.fields.phone')}<span className="text-sys-error">*</span>
                    </Label>
                    <PhoneCountryInput
                      value={phone}
                      onChange={setPhone}
                    />
                  </div>
                  {/* <!-- Line ID --> */}
                  <div className="sm:col-span-1">
                    <Label htmlFor="lineId">
                      {t('signUp.fields.lineId')}
                    </Label>
                    <Input
                      type="text"
                      id="lineId"
                      name="lineId"
                      autoComplete="off"
                      placeholder={t('signUp.placeholders.lineId')}
                      value={lineId}
                      onChange={(e) => setLineId(e.target.value)}
                    />
                  </div>
                </div>
                {error && <p className="text-sm text-sys-error font-bold bg-sys-error/10 dark:bg-sys-error/10 p-3 rounded-lg border border-sys-error/15 dark:border-sys-error/20">{error}</p>}
                {/* <!-- Checkbox --> */}
                <div className="flex items-center gap-3">
                  <Checkbox
                    className="w-5 h-5"
                    checked={isChecked}
                    onChange={handleAcceptChange}
                  />
                  <p className="inline-block text-xs font-medium text-sub leading-tight">
                    {t('signUp.terms')}{" "}
                    <button
                      type="button"
                      onClick={() => setLegalModalOpen('terms')}
                      className="text-body font-bold underline underline-offset-2 hover:text-primary-500 dark:hover:text-primary-400 transition-colors"
                    >
                      {t('signUp.termsLink')}
                    </button>
                    {` ${t('signUp.termsAnd')} `}
                    <button
                      type="button"
                      onClick={() => setLegalModalOpen('privacy')}
                      className="text-body font-bold underline underline-offset-2 hover:text-primary-500 dark:hover:text-primary-400 transition-colors"
                    >
                      {t('signUp.privacyLink')}
                    </button>
                  </p>
                </div>
                {/* <!-- Button --> */}
                <div className="pt-2">
                  <button type="submit" className="primary-btn-animation flex items-center justify-center w-full px-4 py-4 text-sm font-black uppercase text-white rounded-2xl bg-primary-500 shadow-brand hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed tracking-wider" disabled={loading}>
                    {loading ? t('signUp.loading') : t('signUp.button')}
                  </button>
                </div>
              </div>
            </form>

            <div className="mt-6 border-t border-gray-100 dark:border-white/5 pt-6 text-center">
              <p className="text-sm font-medium text-sub">
                {t('signUp.alreadyAccount')}{" "}
                <Link
                  to="/signin"
                  className="text-primary-500 hover:text-primary-600 dark:text-primary-400 font-bold underline underline-offset-4"
                >
                  {t('signUp.signInLink')}
                </Link>
              </p>
            </div>
          </div>
        </div>

        {/* Fusione PER SEZIONE, non fallback sul documento intero: le traduzioni thai
            sono parziali e un `th ?? en` mostrerebbe un contratto con dei buchi (ai terms
            mancano proprio pagamenti e cancellazioni). Stessa regola delle pagine agency,
            qui applicata ai file .ts perche' in registrazione l'utente non e' ancora
            autenticato e la RLS non lascerebbe leggere il DB. */}
        <LegalModal
          document={
            legalModalOpen === 'terms'
              ? mergedTerms
              : legalModalOpen === 'privacy'
                ? mergedPrivacy
                : null
          }
          isOpen={legalModalOpen !== null}
          onClose={() => setLegalModalOpen(null)}
        />
      </div>
    </div>
  );
}
