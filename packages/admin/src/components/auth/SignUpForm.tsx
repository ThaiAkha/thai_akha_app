import React, { useState } from "react";
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
import { TERMS_OF_SERVICE, TERMS_OF_SERVICE_TH, PRIVACY_POLICY, PRIVACY_POLICY_TH } from "@thaiakha/shared/data";

export default function SignUpForm() {
  const { t } = useTranslation('auth');
  const { lang } = useI18n();
  const { signUpAgency } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [isChecked, setIsChecked] = useState(false);
  const [legalModalOpen, setLegalModalOpen] = useState<'terms' | 'privacy' | null>(null);

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
      await signUpAgency(email, password, contactName, companyName, taxId, phone);
      navigate("/"); // Redirect or show success message
    } catch (err: any) {
      console.error("Signup failed:", err);
      setError(err.message || t('signUp.error'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col flex-1 w-full overflow-y-auto lg:w-1/2 no-scrollbar">
      <div className="flex flex-col justify-center flex-1 w-full max-w-lg mx-auto">
        <div className="glass-card p-6 sm:p-10 rounded-3xl border border-white/20 dark:border-white/10 shadow-brand">
          <div className="mb-8 sm:mb-10">
            <h1 className="mb-2 font-black text-gray-800 text-title-sm dark:text-white/90 sm:text-title-md uppercase tracking-tight">
              {t('signUp.title')}
            </h1>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
              {t('signUp.subtitle')}
            </p>
          </div>
          <div>
            <form onSubmit={handleSubmit}>
              <div className="space-y-5">
                {/* <!-- Company Name --> */}
                <div className="mb-5">
                  <Label htmlFor="companyName">
                    {t('signUp.fields.companyName')}<span className="text-error-500">*</span>
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
                <div className="mb-5">
                  <Label htmlFor="contactName">
                    {t('signUp.fields.contactName')}<span className="text-error-500">*</span>
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
                <div className="mb-5">
                  <Label htmlFor="taxId">
                    {t('signUp.fields.taxId')}<span className="text-error-500">*</span>
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
                <div className="mb-5">
                  <Label htmlFor="email">
                    {t('signUp.fields.email')}<span className="text-error-500">*</span>
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
                <div className="mb-5">
                  <Label htmlFor="password">
                    {t('signUp.fields.password')}<span className="text-error-500">*</span>
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
                    <span
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute z-30 -translate-y-1/2 cursor-pointer right-4 top-1/2"
                    >
                      {showPassword ? (
                        <Eye className="fill-gray-500 dark:fill-gray-400 size-5" />
                      ) : (
                        <EyeOff className="fill-gray-500 dark:fill-gray-400 size-5" />
                      )}
                    </span>
                  </div>
                </div>

                {/* <!-- Phone Number & Line ID --> */}
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                  {/* <!-- Phone --> */}
                  <div className="sm:col-span-1">
                    <Label htmlFor="phone">
                      {t('signUp.fields.phone')}<span className="text-error-500">*</span>
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
                {error && <p className="text-sm text-error-500 font-bold bg-error-50 dark:bg-error-500/10 p-3 rounded-lg border border-error-100 dark:border-error-500/20">{error}</p>}
                {/* <!-- Checkbox --> */}
                <div className="flex items-center gap-3">
                  <Checkbox
                    className="w-5 h-5"
                    checked={isChecked}
                    onChange={setIsChecked}
                  />
                  <p className="inline-block text-xs font-medium text-gray-500 dark:text-gray-400 leading-tight">
                    {t('signUp.terms')}{" "}
                    <button
                      type="button"
                      onClick={() => setLegalModalOpen('terms')}
                      className="text-gray-800 dark:text-white/90 font-bold underline underline-offset-2 hover:text-brand-500 dark:hover:text-brand-400 transition-colors"
                    >
                      {t('signUp.termsLink')}
                    </button>
                    {` ${t('signUp.termsAnd')} `}
                    <button
                      type="button"
                      onClick={() => setLegalModalOpen('privacy')}
                      className="text-gray-800 dark:text-white font-bold underline underline-offset-2 hover:text-brand-500 dark:hover:text-brand-400 transition-colors"
                    >
                      {t('signUp.privacyLink')}
                    </button>
                  </p>
                </div>
                {/* <!-- Button --> */}
                <div className="pt-2">
                  <button className="brand-btn-animation flex items-center justify-center w-full px-4 py-4 text-sm font-black uppercase text-white rounded-2xl bg-brand-500 shadow-brand hover:bg-brand-600 tracking-wider" disabled={loading}>
                    {loading ? t('signUp.loading') : t('signUp.button')}
                  </button>
                </div>
              </div>
            </form>

            <div className="mt-6 border-t border-gray-100 dark:border-white/5 pt-6 text-center">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                {t('signUp.alreadyAccount')}{" "}
                <Link
                  to="/signin"
                  className="text-brand-500 hover:text-brand-600 dark:text-brand-400 font-bold underline underline-offset-4"
                >
                  {t('signUp.signInLink')}
                </Link>
              </p>
            </div>
          </div>
        </div>

        <LegalModal
          document={
            legalModalOpen === 'terms'
              ? (lang === 'th' ? TERMS_OF_SERVICE_TH : TERMS_OF_SERVICE)
              : legalModalOpen === 'privacy'
                ? (lang === 'th' ? PRIVACY_POLICY_TH : PRIVACY_POLICY)
                : null
          }
          isOpen={legalModalOpen !== null}
          onClose={() => setLegalModalOpen(null)}
        />
      </div>
    </div>
  );
}
