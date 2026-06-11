// BYPASS-PAYOUT (temporaneo) — Iniezione manuale payout driver, bypass del sistema booking.
// Rimuovere insieme alla migration (_temp_driver_payout/rollback.sql) quando i booking
// tornano la fonte di verità del payout. Vedi _temp_driver_payout/README_TEMPORANEO.md.

import React, { useEffect, useMemo, useState } from 'react';
import { supabase } from '@thaiakha/shared/lib/supabase';
import { authService, type UserProfile } from '../../services/auth.service';
import { Heading, Paragraph } from '../../components/typography';
import Input from '../../components/form/input/InputField';
import SelectField from '../../components/form/input/SelectField';
import TextArea from '../../components/form/input/TextArea';
import Button from '../../components/ui/button/Button';
import Card from '../../components/ui/Card';
import { cn } from '@thaiakha/shared/lib/utils';

type SessionId = 'morning_class' | 'evening_class';
type StopsRange = '1-2' | '3-4' | '5-6' | '7plus';

interface PayoutTier {
  session_type: string;
  min_stops: number;
  max_stops: number;
  price_thb: number;
}

// Mappa range UI -> n° fermate rappresentativo per la RPC (la tariffa dipende solo dallo scaglione)
const STOPS_REP: Record<StopsRange, number> = { '1-2': 2, '3-4': 4, '5-6': 6, '7plus': 7 };
const STOPS_OPTIONS: { value: StopsRange; label: string }[] = [
  { value: '1-2', label: '1-2 hotel' },
  { value: '3-4', label: '3-4 hotel' },
  { value: '5-6', label: '5-6 hotel' },
  { value: '7plus', label: '7+ hotel' },
];

const todayISO = () => new Date().toISOString().split('T')[0];

const DriverPayoutForm: React.FC = () => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [tiers, setTiers] = useState<PayoutTier[]>([]);

  const [runDate, setRunDate] = useState(todayISO());
  const [session, setSession] = useState<SessionId>('morning_class');
  const [stopsRange, setStopsRange] = useState<StopsRange>('1-2');
  const [pax, setPax] = useState('1');
  const [comments, setComments] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<{ payout: number; emailSent: boolean } | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Driver bloccato sul loggato (self-service) + tariffe lette dal DB (unica fonte di verità)
  useEffect(() => {
    authService.getCurrentUserProfile().then(setProfile);
    supabase
      .from('driver_payout_tiers')
      .select('session_type, min_stops, max_stops, price_thb')
      .then(({ data }) => setTiers((data as PayoutTier[]) ?? []));
  }, []);

  const repStops = STOPS_REP[stopsRange];

  const price = useMemo(() => {
    const tier = tiers.find(
      (t) => t.session_type === session && repStops >= t.min_stops && repStops <= t.max_stops
    );
    return tier?.price_thb ?? null;
  }, [tiers, session, repStops]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile || submitting) return;

    const paxNum = Number(pax);
    if (!Number.isFinite(paxNum) || paxNum < 1) {
      setError('Inserisci un numero di clienti valido (min 1).');
      return;
    }

    setSubmitting(true);
    setError(null);
    setResult(null);

    try {
      const { data, error: rpcError } = await supabase.rpc('inject_driver_payout_manual', {
        p_run_date: runDate,
        p_session_id: session,
        p_total_stops: repStops,
        p_total_pax: paxNum,
      });
      if (rpcError) throw rpcError;

      const row = Array.isArray(data) ? data[0] : data;
      const payout = row?.payout_amount ?? price ?? 0;

      // Email di conferma — non blocca il successo del payout se fallisce.
      let emailSent = false;
      try {
        const { error: mailError } = await supabase.functions.invoke(
          'send-driver-payout-confirmation',
          {
            body: {
              driver_name: profile.full_name,
              email: profile.email,
              run_date: runDate,
              session_id: session,
              stops_range: stopsRange,
              total_pax: paxNum,
              payout_amount: payout,
              comments: comments.trim() || null,
            },
          }
        );
        emailSent = !mailError;
      } catch {
        emailSent = false;
      }

      setResult({ payout, emailSent });
      setComments('');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Errore durante l’invio. Riprova.';
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Card size="lg" className="max-w-[480px] mx-auto">
      <header className="mb-[var(--space-fluid-s,1rem)]">
        <span className="inline-block text-[10px] font-black uppercase tracking-widest text-amber-600 bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 rounded-full px-2.5 py-1 mb-3">
          Modulo temporaneo · bypass booking
        </span>
        <Heading level="h3">Dichiara servizio</Heading>
        <Paragraph size="sm" color="muted" className="mt-1">
          Inserisci i dati del servizio per generare il payout.
        </Paragraph>
      </header>

      <form onSubmit={handleSubmit} className="flex flex-col [gap:var(--space-fluid-s,1rem)]">
        {/* Data */}
        <Input
          type="date"
          label="Data"
          value={runDate}
          onChange={(e) => setRunDate(e.target.value)}
        />

        {/* Driver — bloccato sul loggato */}
        <Input
          label="Driver"
          value={profile?.full_name ?? 'Caricamento…'}
          disabled
        />

        {/* Tipo classe — segmented control */}
        <div className="w-full space-y-1.5">
          <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">
            Tipo classe
          </span>
          <div className="grid grid-cols-2 [gap:var(--space-fluid-2xs,0.5rem)]">
            {(['morning_class', 'evening_class'] as SessionId[]).map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setSession(s)}
                className={cn(
                  'h-12 rounded-xl border text-sm font-bold transition-all duration-300',
                  session === s
                    ? 'border-green-500 bg-green-500/10 text-green-700 dark:text-green-400'
                    : 'border-gray-200 dark:border-gray-700/50 text-gray-600 dark:text-gray-300 hover:border-green-500/30'
                )}
              >
                {s === 'morning_class' ? 'Morning Class' : 'Evening Class'}
              </button>
            ))}
          </div>
        </div>

        {/* Numero hotel (stop) */}
        <SelectField
          label="Numero hotel (stop)"
          value={stopsRange}
          onChange={(e) => setStopsRange(e.target.value as StopsRange)}
        >
          {STOPS_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </SelectField>

        {/* Prezzo payout (auto, da driver_payout_tiers) */}
        <div className="flex items-center justify-between rounded-xl bg-gray-900 dark:bg-gray-800 text-white [padding:var(--space-fluid-s,1rem)]">
          <span className="text-xs opacity-80">Prezzo payout</span>
          <span className="text-2xl font-bold">
            {price ?? '—'} <span className="text-sm font-medium opacity-80">Baht</span>
          </span>
        </div>

        {/* Numero clienti totali */}
        <Input
          type="number"
          label="Numero clienti totali (persone in auto)"
          min="1"
          max="12"
          value={pax}
          onChange={(e) => setPax(e.target.value)}
          hint="Min 1 · Max 12 persone."
        />

        {/* Commenti */}
        <TextArea
          label="Commenti"
          placeholder="Note opzionali sul servizio…"
          value={comments}
          onChange={setComments}
        />

        {error && (
          <Paragraph size="sm" className="text-red-600 dark:text-red-400">
            {error}
          </Paragraph>
        )}

        {result && (
          <div className="rounded-xl border border-green-500/30 bg-green-500/10 [padding:var(--space-fluid-s,1rem)]">
            <Paragraph size="sm" className="text-green-700 dark:text-green-400 font-bold">
              Payout registrato: {result.payout} Baht.
            </Paragraph>
            <Paragraph size="xs" color="muted" className="mt-1">
              {result.emailSent
                ? 'Email di conferma inviata.'
                : 'Payout salvato (email di conferma non disponibile).'}
            </Paragraph>
          </div>
        )}

        <Button type="submit" className="w-full mt-1" disabled={!profile} isLoading={submitting}>
          {submitting ? 'Invio…' : 'Invia'}
        </Button>
      </form>
    </Card>
  );
};

export default DriverPayoutForm;
