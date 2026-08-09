import React, { useState, useCallback } from 'react';
import { Typography, Button, Icon, AkhaCard } from '../components/ui/index';
import { PageSEO } from '../components/layout/index';
import AuthForm from '../components/auth/AuthForm';
import { joinGroup } from '@thaiakha/shared/services';
import type { UserProfile } from '@thaiakha/shared/types';

interface JoinGroupPageProps {
  onNavigate: (page: string) => void;
  userProfile: UserProfile | null;
  onAuthSuccess: () => void;
}

type JoinStatus = 'idle' | 'joining' | 'joined' | 'error';
type AuthPanel = 'login' | 'signup';

/** Legge il booking_ref dal link condiviso (/join-group?ref=TAK-xxxx). */
const getRefFromUrl = (): string | null => {
  if (typeof window === 'undefined') return null;
  return new URLSearchParams(window.location.search).get('ref');
};

/**
 * F1 — Landing del link "join group". Due strade (sotto-profili → F2):
 *  (a) nuovo account · (b) login esistente. Dopo l'auth chiama joinGroup(ref),
 *  che delega alla RPC SECURITY DEFINER (guard + idempotenza nel DB).
 *  Privacy: il joiner non vede il booking né i profili altrui — solo l'esito.
 */
const JoinGroupPage: React.FC<JoinGroupPageProps> = ({ onNavigate, userProfile, onAuthSuccess }) => {
  const ref = getRefFromUrl();
  const [status, setStatus] = useState<JoinStatus>('idle');
  const [message, setMessage] = useState<string | null>(null);
  const [authPanel, setAuthPanel] = useState<AuthPanel>('signup');

  const runJoin = useCallback(async () => {
    if (!ref) return;
    setStatus('joining');
    setMessage(null);
    const result = await joinGroup(ref);
    if (result.success) {
      setStatus('joined');
    } else {
      setStatus('error');
      setMessage(result.message ?? 'Could not join this group. Please ask for a fresh invite link.');
    }
  }, [ref]);

  // Login/signup completati → la sessione è attiva, tenta subito il join.
  const handleAuthSuccess = useCallback(() => {
    onAuthSuccess();
    void runJoin();
  }, [onAuthSuccess, runJoin]);

  const Shell: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <div className="relative min-h-[100dvh] w-full flex flex-col items-center justify-center bg-background [padding:var(--space-fluid-m)]">
      <PageSEO
        title="Join Your Cooking Class Group | Thai Akha Kitchen"
        description="You've been invited to join a Thai Akha Kitchen cooking class group."
        canonical="https://www.thaiakha.com/join-group"
      />
      <AkhaCard variant="glass" className="w-full max-w-[var(--container-form)]" padding="l">
        {children}
      </AkhaCard>
    </div>
  );

  // ── Link senza ref → invito non valido ──────────────────────────────────
  if (!ref) {
    return (
      <Shell>
        <div className="flex flex-col items-center text-center [gap:var(--space-fluid-s)]">
          <div className="w-14 h-14 rounded-2xl bg-surface-2 flex items-center justify-center">
            <Icon name="link_off" />
          </div>
          <Typography variant="h4" color="title">Invalid invite link</Typography>
          <Typography variant="body" color="muted">
            This group invitation is missing or incomplete. Ask the group leader to share a fresh link.
          </Typography>
          <Button variant="brand" size="lg" onClick={() => onNavigate('home')} className="[margin-top:var(--space-fluid-s)]">
            Go to homepage
          </Button>
        </div>
      </Shell>
    );
  }

  // ── Join riuscito ───────────────────────────────────────────────────────
  if (status === 'joined') {
    return (
      <Shell>
        <div className="flex flex-col items-center text-center [gap:var(--space-fluid-s)]">
          <div className="w-14 h-14 rounded-2xl bg-action/10 flex items-center justify-center">
            <Icon name="check_circle" className="text-action" />
          </div>
          <Typography variant="h4" color="title">You're in! 🎉</Typography>
          <Typography variant="body" color="muted">
            You've joined the group. Set your dietary preferences and pick your dishes from your dashboard.
          </Typography>
          <div className="flex flex-col w-full [gap:var(--space-fluid-xs)] [margin-top:var(--space-fluid-s)]">
            <Button variant="brand" size="lg" onClick={() => onNavigate('user')}>
              Go to my dashboard
            </Button>
            <Button variant="outline" size="lg" onClick={() => onNavigate('menu')}>
              Choose my dishes
            </Button>
          </div>
        </div>
      </Shell>
    );
  }

  // ── Utente loggato → conferma esplicita del join ─────────────────────────
  if (userProfile) {
    return (
      <Shell>
        <div className="flex flex-col items-center text-center [gap:var(--space-fluid-s)]">
          <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center">
            <Icon name="group_add" className="text-primary" />
          </div>
          <Typography variant="h4" color="title">Join the cooking class group</Typography>
          <Typography variant="body" color="muted">
            You're signed in as <span className="text-title font-semibold">{userProfile.full_name || userProfile.email}</span>.
            Confirm to join this group — you'll then set your own diet and dishes.
          </Typography>

          {status === 'error' && message && (
            <Typography variant="caption" color="primary" className="[margin-top:var(--space-fluid-2xs)]">
              {message}
            </Typography>
          )}

          <Button
            variant="brand"
            size="lg"
            onClick={() => void runJoin()}
            disabled={status === 'joining'}
            className="w-full [margin-top:var(--space-fluid-s)]"
          >
            {status === 'joining' ? 'Joining…' : 'Join the group'}
          </Button>
          <Button variant="ghost" size="sm" onClick={() => onNavigate('home')}>
            Not now
          </Button>
        </div>
      </Shell>
    );
  }

  // ── Non loggato → (a) nuovo account / (b) login ──────────────────────────
  return (
    <Shell>
      <div className="flex flex-col [gap:var(--space-fluid-s)]">
        <div className="flex flex-col items-center text-center [gap:var(--space-fluid-2xs)]">
          <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center [margin-bottom:var(--space-fluid-2xs)]">
            <Icon name="celebration" className="text-primary" />
          </div>
          <Typography variant="h4" color="title">You're invited!</Typography>
          <Typography variant="body" color="muted">
            {authPanel === 'signup'
              ? 'Create your free account to join the group and set your dietary preferences.'
              : 'Sign in to join the group and set your dietary preferences.'}
          </Typography>
        </div>

        {/* Toggle (a) nuovo account / (b) login */}
        <div className="grid grid-cols-2 [gap:var(--space-fluid-2xs)] rounded-[var(--radius-input)] bg-surface-2 p-1">
          <button
            type="button"
            onClick={() => setAuthPanel('signup')}
            className={`min-h-[44px] rounded-[var(--radius-input)] transition-colors ${authPanel === 'signup' ? 'bg-surface shadow-sm' : ''}`}
          >
            <Typography variant="accent" color={authPanel === 'signup' ? 'primary' : 'muted'}>New account</Typography>
          </button>
          <button
            type="button"
            onClick={() => setAuthPanel('login')}
            className={`min-h-[44px] rounded-[var(--radius-input)] transition-colors ${authPanel === 'login' ? 'bg-surface shadow-sm' : ''}`}
          >
            <Typography variant="accent" color={authPanel === 'login' ? 'primary' : 'muted'}>Sign in</Typography>
          </button>
        </div>

        <AuthForm
          onSuccess={handleAuthSuccess}
          onNavigate={onNavigate}
          panel={authPanel}
          onPanelChange={setAuthPanel}
        />
      </div>
    </Shell>
  );
};

export default JoinGroupPage;
