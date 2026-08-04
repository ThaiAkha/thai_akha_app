import React, { useEffect, useState } from 'react';
import { supabase } from '@thaiakha/shared/lib/supabase';
import { authService } from '../../services/auth.service';
import { Typography, Button, SmartInput } from '../ui/index';

/**
 * Password recovery landing for the B2C front.
 * The reset email links to `${origin}/reset-password?token_hash=…&type=recovery`.
 * We exchange the token_hash for a recovery session via verifyOtp (a POST — email
 * prefetchers that only GET the link can't consume the one-time token), then let the
 * user set a new password. Rendered full-screen by App when recovery params are present.
 */
interface Props {
  tokenHash: string;
  onDone: () => void;
}

const ResetPasswordRecovery: React.FC<Props> = ({ tokenHash, onDone }) => {
  const [verifying, setVerifying] = useState(true);
  const [verifyError, setVerifyError] = useState<string | null>(null);
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  useEffect(() => {
    let alive = true;
    supabase.auth
      .verifyOtp({ type: 'recovery', token_hash: tokenHash })
      .then(({ error: otpErr }) => {
        if (!alive) return;
        if (otpErr) setVerifyError('This reset link is invalid or has expired. Please request a new one.');
        // Strip token_hash so a refresh/re-share can't re-trigger.
        try { window.history.replaceState({}, '', '/reset-password'); } catch { /* ignore */ }
      })
      .finally(() => { if (alive) setVerifying(false); });
    return () => { alive = false; };
  }, [tokenHash]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await authService.changePassword(password);
      setDone(true);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Could not update the password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(var(--vh,1vh)*100)] bg-background text-title flex items-center justify-center [padding:var(--space-fluid-m)]">
      <div className="w-full max-w-md glass-card rounded-3xl border border-white/20 [padding:var(--space-fluid-l)] flex flex-col [gap:var(--space-fluid-m)]">
        <Typography variant="h4" className="italic text-center">
          Set a new{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-action font-black">password</span>
        </Typography>

        {verifying ? (
          <Typography variant="caption" color="muted" className="text-center">Verifying your link…</Typography>
        ) : verifyError ? (
          <>
            <Typography variant="caption" color="primary" className="text-center">{verifyError}</Typography>
            <Button fullWidth size="lg" variant="brand" onClick={onDone}>Back to sign in</Button>
          </>
        ) : done ? (
          <>
            <Typography variant="caption" className="text-center text-action">Password updated — you can sign in now.</Typography>
            <Button fullWidth size="lg" variant="brand" onClick={onDone} icon="arrow_forward" iconPosition="right">Go to sign in</Button>
          </>
        ) : (
          <form onSubmit={submit} className="flex flex-col [gap:var(--space-fluid-s)]">
            <SmartInput
              label="New password"
              type="password"
              icon="lock"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="new-password"
            />
            {error && <Typography variant="caption" color="primary" className="text-center">{error}</Typography>}
            <Button fullWidth size="lg" variant="brand" type="submit" isLoading={loading} icon="check" iconPosition="right">
              Update password
            </Button>
          </form>
        )}
      </div>
    </div>
  );
};

export default ResetPasswordRecovery;
