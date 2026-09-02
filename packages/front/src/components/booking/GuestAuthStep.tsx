/**
 * GuestAuthStep
 * Two-card selector: "Existing User" (login) vs "New User" (guest signup).
 * Shown when viewStep === 'auth' and the user is not yet authenticated.
 */

import React from 'react';
import { Typography, Icon, Card, Button } from '../ui/index';
import { Input } from '../ui/form';
import type { AuthMode, BookingFormData } from './booking.types';

interface GuestAuthStepProps {
  authMode:                AuthMode;
  setAuthMode:             (m: AuthMode) => void;
  formData:                BookingFormData;
  setFormData:             (d: BookingFormData | ((prev: BookingFormData) => BookingFormData)) => void;
  loading:                 boolean;
  onGoToGuestForm:         () => void;   // → setViewStep('form') + setAuthMode('guest')
  handleStandaloneLogin:   () => Promise<void>;
}

const GuestAuthStep: React.FC<GuestAuthStepProps> = ({
  authMode,
  setAuthMode,
  formData,
  setFormData,
  loading,
  onGoToGuestForm,
  handleStandaloneLogin,
}) => {
  if (authMode !== 'login') {
    // ── Choice cards ───────────────────────────────────────────────────────
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 [gap:var(--space-fluid-l)]">
        <button
          onClick={() => setAuthMode('login')}
          className="group relative flex flex-col items-start text-left bg-surface-elevated/40 hover:bg-surface-elevated/60 border border-border hover:border-primary/40 p-10 rounded-[3rem] transition-all cursor-pointer overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -translate-y-16 translate-x-16 blur-3xl pointer-events-none" />
          <div className="flex items-center gap-4 mb-4">
            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
              <Icon name="person" size="xs" className="text-primary" />
            </div>
            <Typography variant="h5" className="font-black text-title">Existing User</Typography>
          </div>
          <Typography variant="paragraphS" className="opacity-40 font-medium leading-relaxed pl-12">
            Login with your account.
          </Typography>
        </button>

        <button
          onClick={onGoToGuestForm}
          className="group relative flex flex-col items-start text-left bg-surface-elevated/40 hover:bg-surface-elevated/60 border border-border hover:border-action/40 p-10 rounded-[3rem] transition-all cursor-pointer overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-action/5 rounded-full -translate-y-16 translate-x-16 blur-3xl pointer-events-none" />
          <div className="flex items-center gap-4 mb-4">
            <div className="w-8 h-8 rounded-full bg-surface-2 flex items-center justify-center">
              <Icon name="person_add" size="xs" className="text-title" />
            </div>
            <Typography variant="h5" className="font-black text-title">New User</Typography>
          </div>
          <Typography variant="paragraphS" className="opacity-40 font-medium leading-relaxed pl-12">
            Create an account &amp; book.
          </Typography>
        </button>
      </div>
    );
  }

  // ── Login form ─────────────────────────────────────────────────────────────
  return (
    <Card variant="glass" className="max-w-xl mx-auto p-8 border-border bg-surface/50">
      <Typography variant="h4" className="italic mb-2">Accesso Utente</Typography>
      <Typography variant="caption" className="opacity-60 [margin-bottom:var(--space-fluid-l)] block">
        Accedi per sbloccare il tuo profilo e continuare con la prenotazione.
      </Typography>

      <div className="space-y-4 [margin-bottom:var(--space-fluid-l)]">
        <Input
          label="Email"
          type="email"
          autoComplete="email"
          value={formData.email}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            setFormData(prev => ({ ...prev, email: e.target.value }))
          }
          leftIcon="mail"
        />
        <Input
          label="Password"
          type="password"
          autoComplete="current-password"
          value={formData.password}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            setFormData(prev => ({ ...prev, password: e.target.value }))
          }
          leftIcon="lock"
        />
      </div>

      <div className="flex gap-4">
        <Button
          variant="mineral"
          size="lg"
          onClick={() => setAuthMode('guest')}
          className="flex-1 border-border"
        >
          Indietro
        </Button>
        <Button
          variant="action"
          size="lg"
          onClick={handleStandaloneLogin}
          isLoading={loading}
          disabled={!(formData.email && formData.password)}
          icon="login"
          className="flex-1"
        >
          Accedi
        </Button>
      </div>
    </Card>
  );
};

export default GuestAuthStep;
