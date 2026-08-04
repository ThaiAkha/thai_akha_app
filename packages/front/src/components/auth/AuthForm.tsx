import React, { useState } from 'react';
import { Typography, Button, SmartInput, Icon } from '../ui/index';
import { authService } from '../../services/auth.service';
import { cn } from '@thaiakha/shared/lib/utils';
import { t } from '@thaiakha/shared/lib/ui-strings';

interface AuthFormProps {
  onSuccess: () => void;
  onNavigate: (page: string) => void;
  onBack?: () => void;
  onOpenPrivacy?: () => void;
  panel?: AuthPanel;
  onPanelChange?: (panel: AuthPanel) => void;
  isForgotPassword?: boolean;
  onForgotPasswordChange?: (v: boolean) => void;
}

type AuthPanel = 'login' | 'signup';
type SignupStep = 0 | 1;

const selectClass = cn(
  'w-full h-14 bg-surface-2 border-2 border-transparent rounded-[var(--radius-input)] px-4 transition-all outline-none',
  'focus:border-primary/30 focus:bg-surface shadow-sm text-desc font-sans',
  'appearance-none cursor-pointer pl-12'
);

const LOGO_SRC = '/avatarCherry/00 - Logo 2026.png';

const AuthForm: React.FC<AuthFormProps> = ({
  onSuccess,
  onNavigate,
  onOpenPrivacy,
  panel: controlledPanel,
  isForgotPassword = false,
}) => {
  const [internalPanel] = useState<AuthPanel>('login');
  const panel = controlledPanel ?? internalPanel;
  const [signupStep, setSignupStep] = useState<SignupStep>(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Form State
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (panel === 'signup' && signupStep === 0) {
      setSignupStep(1);
      return;
    }

    setLoading(true);
    setError(null);
    setSuccessMsg(null);

    try {
      if (isForgotPassword) {
        await authService.resetPassword(email, window.location.origin + '/reset-password');
        setSuccessMsg('Reset link sent!');
        setLoading(false);
        return;
      }

      if (panel === 'login') {
        const { user } = await authService.signIn(email, password);
        if (user) { onSuccess(); onNavigate('user'); }
      } else {
        await authService.signUp(email, password, fullName, age ? parseInt(age) : null, gender || null);
        onSuccess(); onNavigate('user');
      }
    } catch (err: unknown) {
      console.error(err);
      setError(err instanceof Error ? err.message : t.auth.authFailed);
    } finally {
      if (!isForgotPassword) setLoading(false);
    }
  };

  const renderHeader = (title: string, highlight: string, description: string) => (
    <div className="shrink-0 flex flex-col items-center text-center [padding-top:var(--space-fluid-l)] [padding-bottom:var(--space-fluid-m)] [gap:var(--space-fluid-xs)]">
      <img src={LOGO_SRC} alt="Logo" className="w-20 h-auto object-contain mb-2" />
      <Typography variant="h4" className="italic">
        {title} <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-action font-black">{highlight}</span>
      </Typography>
      <Typography variant="caption" color="muted" className="[padding-inline:var(--space-fluid-m)]">
        {description}
      </Typography>
    </div>
  );

  return (
    <div className="w-full h-full flex flex-col animate-in fade-in duration-500">
      {panel === 'login' ? (
        <form onSubmit={handleSubmit} className="flex flex-col h-full">
          {renderHeader("Welcome", "Back", t.auth.existingUserDesc)}

          <div className="flex-1 min-h-0 overflow-y-auto [padding-inline:var(--space-fluid-m)] flex flex-col [gap:var(--space-fluid-s)]">
            <SmartInput
              label={t.auth.emailLabel}
              type="email"
              placeholder="chef@example.com"
              icon="mail"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              autoComplete="email"
              inputMode="email"
            />
            {!isForgotPassword && (
              <SmartInput
                label={t.auth.passwordLabel}
                type="password"
                placeholder="••••••••"
                icon="lock"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                autoComplete="current-password"
              />
            )}

            {error && <Typography variant="caption" color="primary" className="text-center">{error}</Typography>}
            {successMsg && <Typography variant="caption" className="text-center text-action">{successMsg}</Typography>}
          </div>

          <div className="shrink-0 [padding-inline:var(--space-fluid-m)] [padding-block:var(--space-fluid-m)]">
            <Button fullWidth size="lg" variant="brand" type="submit" isLoading={loading} icon={isForgotPassword ? "send" : "arrow_forward"} iconPosition="right">
              {isForgotPassword ? "Send Recovery Link" : "Enter Kitchen Hub"}
            </Button>
          </div>
        </form>
      ) : (
        <form onSubmit={handleSubmit} className="flex flex-col h-full">
          {renderHeader("Join the", "Kitchen", t.auth.newUserDesc)}

          <div className="flex-1 min-h-0 overflow-y-auto [padding-inline:var(--space-fluid-m)] flex flex-col [gap:var(--space-fluid-s)]">
            {signupStep === 0 ? (
              <>
                <SmartInput
                  label={t.auth.emailLabel}
                  type="email"
                  placeholder="chef@example.com"
                  icon="mail"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                  inputMode="email"
                />
                <SmartInput
                  label={t.auth.createPasswordLabel}
                  type="password"
                  placeholder={t.auth.passwordPlaceholder}
                  icon="lock"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  autoComplete="new-password"
                />
              </>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => setSignupStep(0)}
                  className="self-start flex items-center [gap:var(--space-fluid-2xs)] py-1 hover:opacity-70 transition-opacity"
                >
                  <Icon name="arrow_back" size="xs" className="text-muted" />
                  <Typography variant="caption" color="muted">{t.common.back}</Typography>
                </button>

                <SmartInput
                  label={t.auth.fullNameLabel}
                  placeholder="Somchai Akha"
                  icon="person"
                  value={fullName}
                  onChange={e => setFullName(e.target.value)}
                  required
                  autoComplete="name"
                />
                <div className="flex [gap:var(--space-fluid-s)]">
                  <div className="flex-1">
                    <SmartInput
                      label={t.auth.ageLabel}
                      type="number"
                      placeholder="25"
                      icon="cake"
                      value={age}
                      onChange={e => setAge(e.target.value)}
                    />
                  </div>
                  <div className="flex-1 flex flex-col [gap:var(--space-fluid-2xs)]">
                    <Typography variant="fieldLabel" as="label" className="[margin-left:var(--space-fluid-2xs)]">{t.auth.genderLabel}</Typography>
                    <div className="relative group">
                      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-muted group-focus-within:text-primary transition-colors">
                        <Icon name="wc" size="sm" />
                      </div>
                      <select value={gender} onChange={e => setGender(e.target.value)} className={selectClass}>
                        <option value="" disabled>{t.auth.genderSelect}</option>
                        <option value="male">{t.auth.genderMale}</option>
                        <option value="female">{t.auth.genderFemale}</option>
                        <option value="other">{t.auth.genderOther}</option>
                      </select>
                    </div>
                  </div>
                </div>
              </>
            )}

            {error && <Typography variant="caption" color="primary" className="text-center">{error}</Typography>}
            {successMsg && <Typography variant="caption" className="text-center text-action">{successMsg}</Typography>}
          </div>

          <div className="shrink-0 [padding-inline:var(--space-fluid-m)] [padding-block:var(--space-fluid-m)]">
            <Button fullWidth size="lg" variant="brand" type="submit" isLoading={loading} icon="arrow_forward" iconPosition="right">
              {signupStep === 0 ? "Continue" : "Create Account"}
            </Button>
          </div>
        </form>
      )}
    </div>
  );
};

export default AuthForm;
