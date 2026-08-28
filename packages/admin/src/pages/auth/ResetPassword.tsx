import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { EyeOff, Eye } from "lucide-react";
import { useTranslation } from "react-i18next";
import { supabase } from "@thaiakha/shared/lib/supabase";
import { authService } from "../../services/auth.service";
import { useI18n } from "../../context/I18nContext";
import PageMeta from "../../components/common/PageMeta";
import AuthLayout from "./AuthPageLayout";
import Label from "../../components/form/Label";
import Input from "../../components/form/input/InputField";
import { Heading, Paragraph } from "../../components/typography";

/**
 * ResetPassword — dual-mode page.
 *  - "request": user enters email → Supabase sends a reset link.
 *  - "update":  user arrives from the email link (recovery session) → sets a new password.
 * Mode is auto-detected from the Supabase PASSWORD_RECOVERY event / URL hash.
 */
export default function ResetPassword() {
  const { t } = useTranslation("auth");
  const { lang } = useI18n();
  const navigate = useNavigate();

  // Recovery mode is detected from the flag captured in recovery-capture.ts (before
  // Supabase consumed the hash), with the live hash as a fallback.
  const [mode, setMode] = useState<"request" | "update">(() => {
    let flagged = false;
    try { flagged = sessionStorage.getItem("akha_pw_recovery") === "1"; } catch { /* ignore */ }
    return (flagged || window.location.hash.includes("type=recovery")) ? "update" : "request";
  });
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const clearRecoveryFlag = () => {
    try { sessionStorage.removeItem("akha_pw_recovery"); } catch { /* ignore */ }
  };

  useEffect(() => {
    // Backup: if PASSWORD_RECOVERY fires after mount, switch to update mode.
    const { data } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") {
        try { sessionStorage.setItem("akha_pw_recovery", "1"); } catch { /* ignore */ }
        setMode("update");
      }
    });
    return () => data.subscription.unsubscribe();
  }, []);

  // PKCE-safe recovery: the email link is `${origin}/reset-password?token_hash=…&type=recovery`.
  // We exchange the token_hash for a recovery session via verifyOtp (a POST, so email
  // prefetchers that only GET the URL can't consume the one-time token). Then the user
  // can set a new password. Replaces the old GET magic-link that scanners burned.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const tokenHash = params.get("token_hash");
    const type = params.get("type");
    if (type !== "recovery" || !tokenHash) return;
    setMode("update");
    setLoading(true);
    supabase.auth
      .verifyOtp({ type: "recovery", token_hash: tokenHash })
      .then(({ error: otpErr }) => {
        if (otpErr) {
          setError(otpErr.message || t("resetPassword.linkExpired", { defaultValue: "This reset link is invalid or has expired. Request a new one." }));
        } else {
          try { sessionStorage.setItem("akha_pw_recovery", "1"); } catch { /* ignore */ }
          // Strip token_hash from the URL so a refresh/re-share can't re-trigger.
          try { window.history.replaceState({}, "", window.location.pathname); } catch { /* ignore */ }
        }
      })
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleRequest = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const resetUrl = `${window.location.origin}/reset-password`;
      // Brand email lang: TH if the admin UI is Thai, otherwise EN (es/zh fall back to EN).
      await authService.resetPassword(email, resetUrl, lang === "th" ? "th" : "en");
      setDone(true);
    } catch (err: unknown) {
      console.error("Reset request failed:", err);
      setError((err as { message?: string } | null)?.message || t("resetPassword.error"));
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await authService.changePassword(password);
      clearRecoveryFlag();
      setDone(true);
    } catch (err: unknown) {
      console.error("Password update failed:", err);
      setError((err as { message?: string } | null)?.message || t("resetPassword.error"));
    } finally {
      setLoading(false);
    }
  };

  const isUpdate = mode === "update";

  return (
    <>
      <PageMeta
        title={t("resetPassword.pageTitle")}
        description={t("resetPassword.pageDesc")}
      />
      <AuthLayout>
        <div className="flex flex-col flex-1 w-full overflow-y-auto lg:w-1/2 no-scrollbar">
          <div className="flex flex-col justify-center flex-1 w-full max-w-lg mx-auto">
            <div className="glass-card p-6 sm:p-10 rounded-3xl border border-white/20 dark:border-white/10 shadow-brand">
              <div className="mb-5 sm:mb-8">
                <Heading level="h1" className="mb-2 font-black text-title-sm leading-[38px] sm:text-title-md sm:leading-[44px] uppercase">
                  {isUpdate ? t("resetPassword.updateTitle") : t("resetPassword.requestTitle")}
                </Heading>
                <Paragraph size="sm" color="secondary" className="font-medium leading-5">
                  {isUpdate ? t("resetPassword.updateSubtitle") : t("resetPassword.requestSubtitle")}
                </Paragraph>
              </div>

              {done ? (
                <Paragraph size="sm" className="text-green-700 dark:text-green-400 font-bold bg-green-500/10 p-3 rounded-lg border border-green-500/15 leading-5">
                  {isUpdate ? t("resetPassword.updatedMessage") : t("resetPassword.sentMessage")}
                </Paragraph>
              ) : isUpdate ? (
                <form onSubmit={handleUpdate}>
                  <div className="space-y-5">
                    <div>
                      <Label htmlFor="new-password">
                        {t("resetPassword.newPasswordLabel")}<span className="text-sys-error">*</span>
                      </Label>
                      <div className="relative">
                        <Input
                          type={showPassword ? "text" : "password"}
                          id="new-password"
                          name="new-password"
                          autoComplete="new-password"
                          placeholder={t("resetPassword.newPasswordPlaceholder")}
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          aria-label={showPassword ? t("common.hidePassword") : t("common.showPassword")}
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

                    {error && (
                      <Paragraph size="sm" className="text-sys-error font-bold bg-sys-error/10 p-3 rounded-lg border border-sys-error/15 dark:border-sys-error/20 leading-5">
                        {error}
                      </Paragraph>
                    )}

                    <div className="pt-2">
                      <button
                        type="submit"
                        className="primary-btn-animation flex items-center justify-center w-full px-4 py-4 text-sm font-black uppercase text-white rounded-2xl bg-primary-500 shadow-brand hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed tracking-wider"
                        disabled={loading}
                      >
                        {loading ? t("resetPassword.updating") : t("resetPassword.updateButton")}
                      </button>
                    </div>
                  </div>
                </form>
              ) : (
                <form onSubmit={handleRequest}>
                  <div className="space-y-5">
                    <div>
                      <Label htmlFor="email">
                        {t("resetPassword.emailLabel")}<span className="text-sys-error">*</span>
                      </Label>
                      <Input
                        type="email"
                        id="email"
                        name="email"
                        autoComplete="email"
                        placeholder={t("resetPassword.emailPlaceholder")}
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                      />
                    </div>

                    {error && (
                      <Paragraph size="sm" className="text-sys-error font-bold bg-sys-error/10 p-3 rounded-lg border border-sys-error/15 dark:border-sys-error/20 leading-5">
                        {error}
                      </Paragraph>
                    )}

                    <div className="pt-2">
                      <button
                        type="submit"
                        className="primary-btn-animation flex items-center justify-center w-full px-4 py-4 text-sm font-black uppercase text-white rounded-2xl bg-primary-500 shadow-brand hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed tracking-wider"
                        disabled={loading}
                      >
                        {loading ? t("resetPassword.sending") : t("resetPassword.sendButton")}
                      </button>
                    </div>
                  </div>
                </form>
              )}

              <div className="mt-6 border-t border-gray-100 dark:border-white/5 pt-6 text-center">
                <button
                  type="button"
                  onClick={() => { clearRecoveryFlag(); navigate("/signin"); }}
                  className="text-sm text-primary-500 hover:text-primary-600 dark:text-primary-400 font-bold underline underline-offset-4"
                >
                  {t("resetPassword.backToSignIn")}
                </button>
              </div>
            </div>
          </div>
        </div>
      </AuthLayout>
    </>
  );
}
