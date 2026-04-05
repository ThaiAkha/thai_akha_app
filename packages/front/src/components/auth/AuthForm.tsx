import React, { useState, useRef } from 'react';
import ReCAPTCHA from 'react-google-recaptcha';
import { Typography, Button, Alert } from '../ui/index';
import SocialAuthButtons from './SocialAuthButtons';
import { Input } from '../ui/form';
import { authService } from '../../services/auth.service';
import { cn } from '@thaiakha/shared/lib/utils';

interface AuthFormProps {
  onSuccess: () => void;
  onNavigate: (page: string) => void;
  onBack?: () => void;
}

type AuthPanel = 'login' | 'signup';
type SignupStep = 0 | 1;

const RECAPTCHA_KEY = import.meta.env.VITE_RECAPTCHA_SITE_KEY as string | undefined;

const selectClass = cn(
  'w-full px-4 py-3 pl-11 text-base rounded-xl border transition-all duration-300 ease-cinematic appearance-none',
  'bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10',
  'border-black/10 dark:border-white/10 hover:border-black/30 dark:hover:border-white/30',
  'text-foreground',
  'focus:outline-none focus:ring-2 focus:ring-offset-0 focus:ring-action/50 focus:border-action/50',
);

// Stile glass — le due facce del flip
const FACE_CLASS =
  'absolute inset-0 w-full h-full flex flex-col overflow-hidden ' +
  'bg-surface/95 dark:bg-surface-overlay/80 border border-white/10 ' +
  'shadow-[0_32px_64px_-16px_rgba(0,0,0,0.5)] backdrop-blur-3xl rounded-[2.5rem]';

const LOGO_SRC = '/avatarCherry/00 - Logo 2026.png';

/* ────────────────────────────────────────────
   Header fisso: Logo + Titolo + Descrizione
──────────────────────────────────────────── */
const PanelHeader: React.FC<{ title: React.ReactNode; description: string; logoSize?: string }> = ({ title, description, logoSize = 'w-[77px]' }) => (
  <div className="shrink-0 flex flex-col items-center text-center px-6 pt-6 pb-3">
    <img
      src={LOGO_SRC}
      alt="Thai Akha Kitchen"
      className={`${logoSize} h-auto object-contain mb-3`}
      style={{ filter: 'drop-shadow(0 8px 20px rgba(0,0,0,0.3))' }}
    />
    <Typography variant="h4" className="italic">{title}</Typography>
    <Typography variant="caption" color="muted">{description}</Typography>
  </div>
);

/* ────────────────────────────────────────────
   Footer fisso: Alerts + CTA + OR + Social + Nav
──────────────────────────────────────────── */
interface PanelFooterProps {
  formId: string;
  cta: string;
  loading: boolean;
  error: string | null;
  successMsg: string | null;
  showSocial: boolean;
  socialLabel?: string;
  navText: string;
  navCta: string;
  onNavClick: () => void;
  isForgotPassword?: boolean;
  onBackToLogin?: () => void;
}

const PanelFooter: React.FC<PanelFooterProps> = ({
  formId, cta, loading, error, successMsg, showSocial, socialLabel = 'Or login with:', navText, navCta, onNavClick,
  isForgotPassword = false, onBackToLogin,
}) => (
  <div className="shrink-0 px-6 md:px-8 pb-6 pt-3 flex flex-col gap-3">
    {error && <Alert variant="error" message={error} className="py-2 text-xs" />}
    {successMsg && <Alert variant="success" message={successMsg} className="py-2 text-xs" />}

    <Button fullWidth size="lg" variant="brand" type="submit" form={formId}
      isLoading={loading} className="rounded-2xl shadow-brand-glow" icon="arrow_forward">
      {cta}
    </Button>

    {isForgotPassword && onBackToLogin && (
      <button type="button" onClick={onBackToLogin} className="w-full text-center hover:opacity-80 transition-opacity">
        <Typography variant="badge" color="muted" as="span">Back to Login</Typography>
      </button>
    )}

    {showSocial && (
      <SocialAuthButtons label={socialLabel} />
    )}

    <p className="text-center mt-1">
      <Typography variant="caption" color="muted" as="span">{navText}{' '}</Typography>
      <button type="button" onClick={onNavClick} className="hover:opacity-80 transition-opacity underline underline-offset-2">
        <Typography variant="badge" color="primary" as="span">{navCta}</Typography>
      </button>
    </p>
  </div>
);

/* ────────────────────────────────────────────
   AuthForm principale
──────────────────────────────────────────── */
const AuthForm: React.FC<AuthFormProps> = ({ onSuccess, onNavigate, onBack }) => {
  const [panel, setPanel] = useState<AuthPanel>('login');
  const [signupStep, setSignupStep] = useState<SignupStep>(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [isForgotPassword, setIsForgotPassword] = useState(false);

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('');

  const recaptchaRef = useRef<ReCAPTCHA>(null);

  const switchPanel = (next: AuthPanel) => {
    setPanel(next);
    setError(null);
    setSuccessMsg(null);
    setIsForgotPassword(false);
    setSignupStep(0);
  };

  const handleSignupContinue = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!email || !password) {
      setError('Please fill in email and password.');
      return;
    }
    setSignupStep(1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccessMsg(null);

    try {
      if (isForgotPassword) {
        await authService.resetPassword(email, window.location.origin + '/reset-password');
        setSuccessMsg('Reset link sent! Check your email kha.');
        setLoading(false);
        return;
      }

      if (RECAPTCHA_KEY && panel === 'signup') {
        const token = recaptchaRef.current?.getValue();
        if (!token) {
          setError('Please complete the reCAPTCHA verification.');
          setLoading(false);
          return;
        }
      }

      if (panel === 'login') {
        const { user } = await authService.signIn(email, password);
        if (user) {
          const profile = await authService.getCurrentUserProfile();
          onSuccess();
          if (
            profile?.role &&
            ['admin', 'manager', 'driver', 'kitchen', 'logistics', 'agency'].includes(profile.role)
          ) {
            const adminUrl = import.meta.env.VITE_ADMIN_URL || 'https://admin.thaiakha.com';
            window.location.href = `${adminUrl}?token=${user.id}&app=front`;
          } else {
            onNavigate('user');
          }
        }
      } else {
        await authService.signUp(email, password, fullName, age ? parseInt(age) : null, gender || null);
        onSuccess();
        onNavigate('user');
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Authentication failed.');
      recaptchaRef.current?.reset();
    } finally {
      if (!isForgotPassword) setLoading(false);
    }
  };

  return (
    <div className="w-full h-full" style={{ perspective: '1200px' }}>
      <div
        className="relative w-full h-full transition-transform duration-700"
        style={{
          transformStyle: 'preserve-3d',
          transitionTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)',
          transform: panel === 'signup' ? 'rotateY(180deg)' : 'rotateY(0deg)',
        }}
      >

        {/* ══════════════════════════════════════════
            FRONT — Login
            [Logo+titolo+desc] shrink-0
            [Campi form]       flex-1
            [CTA+OR+social+nav] shrink-0
        ══════════════════════════════════════════ */}
        <div className={FACE_CLASS} style={{ backfaceVisibility: 'hidden' }}>
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent pointer-events-none" />

          {/* Back button — in alto a sinistra dentro la card */}
          {onBack && (
            <Button
              onClick={onBack}
              variant="primary"
              size="xs"
              icon="arrow_back"
              iconPosition="left"
              className="absolute top-8 left-8 z-10 px-4 rounded-xl"
            >
              Back
            </Button>
          )}

          {/* Header fisso */}
          <PanelHeader title="Welcome Back" description="Sign in to your account" logoSize="w-[90px]" />

          {/* Campi form */}
          <div className="flex-1 min-h-0 px-6 md:px-10 mt-8">
            <form onSubmit={handleSubmit} className="flex flex-col gap-4 h-full" id="login-form">
              <Input
                label="Email Address" type="email" placeholder="chef@example.com" leftIcon="mail"
                value={email} onChange={e => setEmail(e.target.value)} required
              />
              {!isForgotPassword && (
                <div className="flex flex-col gap-2">
                  <Input
                    label="Password" type="password" placeholder="••••••••" leftIcon="lock"
                    value={password} onChange={e => setPassword(e.target.value)} required
                  />
                  <div className="flex justify-end">
                    <button type="button" onClick={() => setIsForgotPassword(true)}
                      className="font-bold text-foreground/40 hover:text-foreground transition-colors text-xs">
                      Forgot Password?
                    </button>
                  </div>
                </div>
              )}
            </form>
          </div>

          {/* Footer fisso */}
          <PanelFooter
            formId="login-form"
            cta={isForgotPassword ? 'Send Recovery Link' : 'Enter Kitchen Hub'}
            loading={loading}
            error={error}
            successMsg={successMsg}
            showSocial={!isForgotPassword}
            socialLabel="Or login with:"
            navText="New here?-"
            navCta="Create account"
            onNavClick={() => switchPanel('signup')}
            isForgotPassword={isForgotPassword}
            onBackToLogin={() => setIsForgotPassword(false)}
          />
        </div>

        {/* ══════════════════════════════════════════
            BACK — Signup (rotateY 180°)
            2-step flow:
              Step 0: email + password + reCAPTCHA → "Continue →"
              Step 1: fullName + age + gender → "← Back" + "Create Account"
        ══════════════════════════════════════════ */}
        <div
          className={FACE_CLASS}
          style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
        >
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent pointer-events-none" />

          {/* Back button — in alto a sinistra dentro la card */}
          {onBack && (
            <Button
              onClick={onBack}
              variant="primary"
              size="xs"
              icon="arrow_back"
              iconPosition="left"
              className="absolute top-8 left-8 z-10 px-4 rounded-xl"
            >
              Back
            </Button>
          )}

          {/* Header fisso */}
          <PanelHeader
            title={
              <>
                Join the <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">Kitchen</span>
              </>
            }
            description="Create your free account"
            logoSize="w-[51px]"
          />

          {/* Step indicator */}
          <div className="shrink-0 flex justify-center gap-2 px-6 pb-2">
            <div className={`h-1 rounded-full transition-all duration-300 ${signupStep === 0 ? 'w-8 bg-primary' : 'w-4 bg-primary/30'}`} />
            <div className={`h-1 rounded-full transition-all duration-300 ${signupStep === 1 ? 'w-8 bg-primary' : 'w-4 bg-primary/30'}`} />
          </div>

          {/* Step 0 — Credentials */}
          <div
            className="flex flex-col h-full overflow-hidden transition-all duration-300"
            style={{
              opacity: signupStep === 0 ? 1 : 0,
              transform: signupStep === 0 ? 'translateX(0)' : 'translateX(-20px)',
              pointerEvents: signupStep === 0 ? 'auto' : 'none',
              position: signupStep === 0 ? 'relative' : 'absolute',
              inset: signupStep === 0 ? 'auto' : 0,
              zIndex: signupStep === 0 ? 1 : 0,
            }}
          >
            <div className="flex-1 min-h-0 px-6 md:px-8">
              <form onSubmit={handleSignupContinue} className="flex flex-col gap-4" id="signup-step0-form">
                <Input label="Email Address" type="email" placeholder="chef@example.com" leftIcon="mail"
                  value={email} onChange={e => setEmail(e.target.value)} required />

                <Input label="Password" type="password" placeholder="••••••••" leftIcon="lock"
                  value={password} onChange={e => setPassword(e.target.value)} required />

                {RECAPTCHA_KEY && (
                  <div className="flex justify-center">
                    <ReCAPTCHA ref={recaptchaRef} sitekey={RECAPTCHA_KEY} theme="dark" />
                  </div>
                )}
              </form>
            </div>

            <div className="shrink-0 px-6 md:px-8 pb-6 pt-3 flex flex-col gap-3">
              {error && <Alert variant="error" message={error} className="py-2 text-xs" />}

              <Button fullWidth size="lg" variant="brand" type="submit" form="signup-step0-form"
                className="rounded-2xl shadow-brand-glow" icon="arrow_forward" iconPosition="right">
                Continue
              </Button>

              <p className="text-center mt-1">
                <Typography variant="caption" color="muted" as="span">Already a member?{' '}</Typography>
                <button type="button" onClick={() => switchPanel('login')}
                  className="font-black text-primary hover:opacity-80 transition-opacity underline underline-offset-2 text-sm">
                  Sign in
                </button>
              </p>
            </div>
          </div>

          {/* Step 1 — Profile */}
          <div
            className="flex flex-col h-full overflow-hidden transition-all duration-300"
            style={{
              opacity: signupStep === 1 ? 1 : 0,
              transform: signupStep === 1 ? 'translateX(0)' : 'translateX(20px)',
              pointerEvents: signupStep === 1 ? 'auto' : 'none',
              position: signupStep === 1 ? 'relative' : 'absolute',
              inset: signupStep === 1 ? 'auto' : 0,
              zIndex: signupStep === 1 ? 1 : 0,
            }}
          >
            <div className="flex-1 min-h-0 px-6 md:px-8">
              <form onSubmit={handleSubmit} className="flex flex-col gap-4" id="signup-form">
                <Input label="Full Name" placeholder="e.g. Somchai Akha" leftIcon="person"
                  value={fullName} onChange={e => setFullName(e.target.value)} required />

                <div className="flex gap-3">
                  <div className="flex-1">
                    <Input label="Age" type="number" placeholder="25" leftIcon="cake"
                      value={age} onChange={e => setAge(e.target.value)} min={1} max={120} />
                  </div>
                  <div className="flex-1 flex flex-col gap-2">
                    <Typography variant="fieldLabel" as="label">Gender</Typography>
                    <div className="relative group">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none material-symbols-outlined text-[1.2em] text-foreground/30 group-focus-within:text-action transition-colors duration-300 flex items-center leading-none">
                        wc
                      </span>
                      <select value={gender} onChange={e => setGender(e.target.value)} className={selectClass}>
                        <option value="" disabled>Select...</option>
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                        <option value="other">Other</option>
                      </select>
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none material-symbols-outlined text-[1.1em] text-foreground/30">
                        expand_more
                      </span>
                    </div>
                  </div>
                </div>
              </form>
            </div>

            <div className="shrink-0 px-6 md:px-8 pb-6 pt-3 flex flex-col gap-3">
              {error && <Alert variant="error" message={error} className="py-2 text-xs" />}
              {successMsg && <Alert variant="success" message={successMsg} className="py-2 text-xs" />}

              <div className="flex gap-3">
                <Button
                  variant="action"
                  size="md"
                  type="button"
                  onClick={() => { setSignupStep(0); setError(null); }}
                  icon="arrow_back"
                >
                  Back
                </Button>
                <Button
                  fullWidth
                  size="md"
                  variant="brand"
                  type="submit"
                  form="signup-form"
                  isLoading={loading}
                  icon="arrow_forward"
                >
                  Create Account
                </Button>
              </div>

              <SocialAuthButtons label="Or signup with:" />

              <p className="text-center mt-1">
                <Typography variant="caption" color="muted" as="span">Already a member?{' '}</Typography>
                <button type="button" onClick={() => switchPanel('login')}
                  className="font-black text-primary hover:opacity-80 transition-opacity underline underline-offset-2 text-sm">
                  Sign in
                </button>
              </p>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};

export default AuthForm;
