import React, { useState, useRef } from 'react';
import ReCAPTCHA from 'react-google-recaptcha';
import { Typography, Button, Alert } from '../ui/index';
import { Input } from '../ui/form';
import { authService } from '../../services/auth.service';
import { cn } from '@thaiakha/shared/lib/utils';

interface AuthFormProps {
  onSuccess: () => void;
  onNavigate: (page: string) => void;
  onBack?: () => void;
}

type AuthPanel = 'login' | 'signup';

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
const PanelHeader: React.FC<{ title: string; description: string; logoSize?: string }> = ({ title, description, logoSize = 'w-24' }) => (
  <div className="shrink-0 flex flex-col items-center text-center px-6 pt-8 pb-5">
    <img
      src={LOGO_SRC}
      alt="Thai Akha Kitchen"
      className={`${logoSize} h-auto object-contain mb-4`}
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
  <div className="shrink-0 px-6 md:px-10 pb-8 pt-4 flex flex-col gap-5">
    {error && <Alert variant="error" message={error} className="py-2 text-xs" />}
    {successMsg && <Alert variant="success" message={successMsg} className="py-2 text-xs" />}

    <Button fullWidth size="xl" variant="brand" type="submit" form={formId}
      isLoading={loading} className="rounded-2xl shadow-brand-glow" icon="arrow_forward">
      {cta}
    </Button>

    {isForgotPassword && onBackToLogin && (
      <button type="button" onClick={onBackToLogin}
        className="font-black uppercase tracking-widest text-foreground/40 hover:text-foreground transition-colors text-center text-xs">
        Back to Login
      </button>
    )}

    {showSocial && (
      <div className="flex flex-col gap-5">
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-border" />
          </div>
          <div className="relative flex justify-center">
            <Typography variant="monoLabel" className="bg-surface/95 dark:bg-surface-overlay/80 px-3">
              {socialLabel}
            </Typography>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-3">
          {/* Google */}
          <button
            type="button"
            onClick={() => console.log('Google')}
            className="flex items-center justify-center gap-2 w-full px-2 py-2 rounded-xl border text-md font-semibold transition-all duration-200 hover:opacity-80 active:scale-[0.98] bg-white text-black border-[#e5e5e5]"
          >
            <svg aria-label="Google logo" width="18" height="18" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
              <g>
                <path d="m0 0H512V512H0" fill="#fff" />
                <path fill="#34a853" d="M153 292c30 82 118 95 171 60h62v48A192 192 0 0190 341" />
                <path fill="#4285f4" d="m386 400a140 175 0 0053-179H260v74h102q-7 37-38 57" />
                <path fill="#fbbc02" d="m90 341a208 200 0 010-171l63 49q-12 37 0 73" />
                <path fill="#ea4335" d="m153 219c22-69 116-109 179-50l55-54c-78-75-230-72-297 55" />
              </g>
            </svg>
            Google
          </button>

          {/* Facebook */}
          <button
            type="button"
            onClick={() => console.log('Facebook')}
            className="flex items-center justify-center gap-2 w-full px-2 py-2 rounded-xl border text-md font-semibold transition-all duration-200 hover:opacity-80 active:scale-[0.98] bg-[#1A77F2] text-white border-[#005fd8]"
          >
            <svg aria-label="Facebook logo" width="18" height="18" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
              <path fill="white" d="M8 12h5V8c0-6 4-7 11-6v5c-4 0-5 0-5 3v2h5l-1 6h-4v12h-6V18H8z" />
            </svg>
            Facebook
          </button>

          {/* Apple */}
          <button
            type="button"
            onClick={() => console.log('Apple')}
            className="flex items-center justify-center gap-2 w-full px-2 py-2 rounded-xl border text-md font-semibold transition-all duration-200 hover:opacity-80 active:scale-[0.98] bg-black text-white border-black"
          >
            <svg aria-label="Apple logo" width="16" height="18" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1195 1195">
              <path fill="white" d="M1006.933 812.8c-32 153.6-115.2 211.2-147.2 249.6-32 25.6-121.6 25.6-153.6 6.4-38.4-25.6-134.4-25.6-166.4 0-44.8 32-115.2 19.2-128 12.8-256-179.2-352-716.8 12.8-774.4 64-12.8 134.4 32 134.4 32 51.2 25.6 70.4 12.8 115.2-6.4 96-44.8 243.2-44.8 313.6 76.8-147.2 96-153.6 294.4 19.2 403.2zM802.133 64c12.8 70.4-64 224-204.8 230.4-12.8-38.4 32-217.6 204.8-230.4z" />
            </svg>
            Apple
          </button>
        </div>
      </div>
    )}

    <p className="text-center mt-2">
      <Typography variant="caption" color="muted" as="span">{navText}{' '}</Typography>
      <button type="button" onClick={onNavClick}
        className="font-black text-primary hover:opacity-80 transition-opacity underline underline-offset-2 text-sm">
        {navCta}
      </button>
    </p>
  </div>
);

/* ────────────────────────────────────────────
   AuthForm principale
──────────────────────────────────────────── */
const AuthForm: React.FC<AuthFormProps> = ({ onSuccess, onNavigate, onBack }) => {
  const [panel, setPanel] = useState<AuthPanel>('login');
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
            [Campi form]       flex-1 overflow-y-auto
            [CTA+OR+social+nav] shrink-0
        ══════════════════════════════════════════ */}
        <div className={FACE_CLASS} style={{ backfaceVisibility: 'hidden' }}>
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent pointer-events-none" />

          {/* Back button — in alto a sinistra dentro la card */}
          {onBack && (
            <Button
              onClick={onBack}
              variant="action"
              size="sm"
              icon="arrow_back"
              iconPosition="left"
              className="absolute top-10 left-10 z-10 px-6 rounded-xl"
            >
              Back
            </Button>
          )}

          {/* Header fisso */}
          <PanelHeader title="Welcome Back" description="Sign in to your account" logoSize="w-32" />

          {/* Campi scrollabili */}
          <div className="flex-1 min-h-0 overflow-y-auto mt-12 px-6 md:px-10">
            <form onSubmit={handleSubmit} className="flex flex-col gap-5 h-full" id="login-form">
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
            [Logo+titolo+desc] shrink-0
            [Campi form]       flex-1 overflow-y-auto
            [CTA+OR+social+nav] shrink-0
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
              variant="action"
              size="sm"
              icon="arrow_back"
              iconPosition="left"
              className="absolute top-10 left-10 z-10 px-6 rounded-xl"
            >
              Back
            </Button>
          )}

          {/* Header fisso */}
          <PanelHeader title="Join the Kitchen" description="Create your free account" logoSize="w-20" />

          {/* Campi scrollabili */}
          <div className="flex-1 min-h-0 overflow-y-auto px-6 md:px-10">
            <form onSubmit={handleSubmit} className="flex flex-col gap-5 pb-2" id="signup-form">
              <Input label="Full Name" placeholder="e.g. Somchai Akha" leftIcon="person"
                value={fullName} onChange={e => setFullName(e.target.value)} required />

              <div className="flex gap-3">
                <div className="flex-1">
                  <Input label="Age" type="number" placeholder="25" leftIcon="cake"
                    value={age} onChange={e => setAge(e.target.value)} min={1} max={120} required />
                </div>
                <div className="flex-1 flex flex-col gap-2">
                  <Typography variant="fieldLabel" as="label">Gender</Typography>
                  <div className="relative group">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none material-symbols-outlined text-[1.2em] text-foreground/30 group-focus-within:text-action transition-colors duration-300 flex items-center leading-none">
                      wc
                    </span>
                    <select value={gender} onChange={e => setGender(e.target.value)} required className={selectClass}>
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

          {/* Footer fisso */}
          <PanelFooter
            formId="signup-form"
            cta="Create Account"
            loading={loading}
            error={error}
            successMsg={successMsg}
            showSocial={true}
            socialLabel="Or signup with:"
            navText="Already a member?"
            navCta="Sign in"
            onNavClick={() => switchPanel('login')}
          />
        </div>

      </div>
    </div>
  );
};

export default AuthForm;
