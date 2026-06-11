// BYPASS-PAYOUT (temporaneo) — Iniezione manuale payout driver, bypass del sistema booking.
// Rimuovere insieme alla migration (_temp_driver_payout/rollback.sql) quando i booking
// tornano la fonte di verità del payout. Vedi _temp_driver_payout/README_TEMPORANEO.md.

import React, { useEffect, useMemo, useState } from 'react';
import { supabase } from '@thaiakha/shared/lib/supabase';
import { authService, type UserProfile } from '../../services/auth.service';
import { Heading, Paragraph } from '../../components/typography';
import SelectField from '../../components/form/input/SelectField';
import Button from '../../components/ui/button/Button';
import Card from '../../components/ui/Card';
import SectionHeader from '../../components/ui/SectionHeader';
import { cn } from '@thaiakha/shared/lib/utils';

export type SessionId = 'morning_class' | 'evening_class';
type StopsRange = '1-2' | '3-4' | '5-6' | '7plus';

export interface PayoutEditTarget {
  run_date: string;
  session_id: SessionId;
}

interface Props {
  editTarget?: PayoutEditTarget | null;
  onDone?: () => void; // chiamato dopo submit/delete riusciti (per refreshare la dashboard)
}

interface PayoutTier {
  session_type: string;
  min_stops: number;
  max_stops: number;
  price_thb: number;
}

interface ExistingRow {
  total_stops: number;
  total_pax: number;
  payout_amount: number;
  status: string | null;
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

// total_stops memorizzato (2/4/6/7) -> range UI
function rangeFromStops(stops: number): StopsRange {
  if (stops <= 2) return '1-2';
  if (stops <= 4) return '3-4';
  if (stops <= 6) return '5-6';
  return '7plus';
}

const SESSION_LABEL: Record<SessionId, string> = {
  morning_class: 'Morning Class',
  evening_class: 'Evening Class',
};

const DriverPayoutForm: React.FC<Props> = ({ editTarget, onDone }) => {
  const isEditMode = !!editTarget;
  const runDate = editTarget?.run_date ?? todayISO();
  const isToday = runDate === todayISO();

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [tiers, setTiers] = useState<PayoutTier[]>([]);

  const [session, setSession] = useState<SessionId>(editTarget?.session_id ?? 'morning_class');
  const [stopsRange, setStopsRange] = useState<StopsRange>('1-2');
  const [pax, setPax] = useState('1');

  const [existing, setExisting] = useState<ExistingRow | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [result, setResult] = useState<
    { kind: 'saved'; payout: number; emailSent: boolean; date: string; session: SessionId; stops: StopsRange }
    | { kind: 'deleted' }
    | null
  >(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    authService.getCurrentUserProfile().then(setProfile);
    supabase
      .from('driver_payout_tiers')
      .select('session_type, min_stops, max_stops, price_thb')
      .then(({ data }) => setTiers((data as PayoutTier[]) ?? []));
  }, []);

  // Smart-UI: rileva un servizio già esistente per (data, classe) e precompila.
  useEffect(() => {
    let active = true;
    supabase
      .from('driver_payments')
      .select('total_stops, total_pax, payout_amount, status')
      .eq('run_date', runDate)
      .eq('session_id', session)
      .maybeSingle()
      .then(({ data }) => {
        if (!active) return;
        const row = (data as ExistingRow | null) ?? null;
        setExisting(row);
        if (row) {
          setStopsRange(rangeFromStops(row.total_stops));
          setPax(String(row.total_pax));
        } else if (!isEditMode) {
          // nuovo: reset ai default quando si cambia sessione e non c'è nulla
          setStopsRange('1-2');
          setPax('1');
        }
      });
    return () => { active = false; };
  }, [runDate, session, isEditMode]);

  const repStops = STOPS_REP[stopsRange];
  const price = useMemo(() => {
    const tier = tiers.find(
      (t) => t.session_type === session && repStops >= t.min_stops && repStops <= t.max_stops
    );
    return tier?.price_thb ?? null;
  }, [tiers, session, repStops]);

  const isPaid = existing?.status === 'paid';
  const isExistingPending = existing?.status === 'pending';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile || submitting || isPaid) return;

    setSubmitting(true);
    setError(null);

    try {
      const { data, error: rpcError } = await supabase.rpc('inject_driver_payout_manual', {
        p_run_date: runDate,
        p_session_id: session,
        p_total_stops: repStops,
        p_total_pax: Number(pax),
      });
      if (rpcError) throw rpcError;

      const row = Array.isArray(data) ? data[0] : data;
      const payout = row?.payout_amount ?? price ?? 0;

      // Email di conferma — sempre inviata (anche in modifica). Non blocca il successo.
      let emailSent = false;
      try {
        const { error: mailError } = await supabase.functions.invoke('send-driver-payout-confirmation', {
          body: {
            driver_name: profile.full_name,
            email: profile.email,
            run_date: runDate,
            session_id: session,
            stops_range: stopsRange,
            total_pax: Number(pax),
            payout_amount: payout,
            edited: isExistingPending,
          },
        });
        emailSent = !mailError;
      } catch {
        emailSent = false;
      }

      setResult({ kind: 'saved', payout, emailSent, date: runDate, session, stops: stopsRange });
      onDone?.();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Errore durante l’invio. Riprova.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!isExistingPending || deleting) return;
    setDeleting(true);
    setError(null);
    try {
      const { error: delError } = await supabase.rpc('delete_my_payout', {
        p_run_date: runDate,
        p_session_id: session,
      });
      if (delError) throw delError;
      setResult({ kind: 'deleted' });
      onDone?.();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Errore durante l’eliminazione.');
    } finally {
      setDeleting(false);
    }
  };

  const resetForm = () => {
    setResult(null);
    setError(null);
    setExisting(null);
    setSession('morning_class');
    setStopsRange('1-2');
    setPax('1');
    onDone?.();
  };

  // ---- Success / Deleted card ----
  if (result) {
    return (
      <Card size="lg" className="max-w-[560px] mx-auto text-center">
        {result.kind === 'saved' ? (
          <>
            <div className="text-4xl mb-2">✅</div>
            <Heading level="h3">Servizio registrato</Heading>
            <div className="mt-[var(--space-fluid-s,1rem)] text-left rounded-xl border border-gray-100 dark:border-gray-800 [padding:var(--space-fluid-s,1rem)] space-y-2">
              <SummaryRow label="Data" value={fmtDate(result.date)} />
              <SummaryRow label="Classe" value={SESSION_LABEL[result.session]} />
              <SummaryRow label="N° hotel" value={result.stops} />
              <SummaryRow label="Prezzo" value={`${result.payout} Baht`} highlight />
            </div>
            <Paragraph size="xs" color="muted" className="mt-2">
              {result.emailSent ? 'Email di conferma inviata.' : 'Salvato (email non disponibile).'}
            </Paragraph>
          </>
        ) : (
          <>
            <div className="text-4xl mb-2">🗑️</div>
            <Heading level="h3">Servizio eliminato</Heading>
            <Paragraph size="sm" color="muted" className="mt-1">
              Il servizio è stato rimosso.
            </Paragraph>
          </>
        )}
        <Button type="button" className="w-full mt-[var(--space-fluid-m,1.5rem)]" onClick={resetForm}>
          Nuovo invio
        </Button>
      </Card>
    );
  }

  return (
    <Card size="lg" className="max-w-[560px] mx-auto">
      <header className="mb-[var(--space-fluid-s,1rem)]">
        <Heading level="h3">{isEditMode || isExistingPending ? 'Modifica servizio' : 'Dichiara servizio'}</Heading>
        <Paragraph size="sm" color="muted" className="mt-1">
          Inserisci i dati del servizio per generare il payout.
        </Paragraph>
      </header>

      {/* Banner stato esistente */}
      {isPaid && (
        <div className="mb-[var(--space-fluid-s,1rem)] rounded-xl border border-green-500/30 bg-green-500/10 [padding:var(--space-fluid-s,1rem)]">
          <Paragraph size="sm" className="text-green-700 dark:text-green-400 font-bold">
            Già pagato — sola lettura
          </Paragraph>
          <Paragraph size="xs" color="muted">Questo servizio è stato pagato e non è più modificabile.</Paragraph>
        </div>
      )}
      {isExistingPending && (
        <div className="mb-[var(--space-fluid-s,1rem)] rounded-xl border border-amber-500/30 bg-amber-500/10 [padding:var(--space-fluid-s,1rem)]">
          <Paragraph size="sm" className="text-amber-700 dark:text-amber-400 font-bold">
            Già inviato per questo giorno e classe
          </Paragraph>
          <Paragraph size="xs" color="muted">Salvando sovrascrivi il servizio esistente (parte una nuova email).</Paragraph>
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col [gap:var(--space-fluid-s,1rem)]">
        {/* Data — oggi (auto) o data della card in modifica; sempre sola lettura */}
        <div className="w-full space-y-1.5">
          <SectionHeader title="Data" variant="formfield" />
          <div className="h-12 flex items-center px-4 rounded-xl border border-gray-200 dark:border-gray-700/50 bg-gray-50/50 dark:bg-gray-800/40 text-base font-bold text-gray-900 dark:text-white">
            <span className="capitalize">{fmtDate(runDate)}</span>
            {isToday && (
              <span className="ml-auto text-[10px] font-black uppercase tracking-widest text-gray-400">Oggi</span>
            )}
          </div>
        </div>

        {/* Tipo classe — segmented (bloccato in modifica da card) */}
        <div className="w-full space-y-1.5">
          <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">Tipo classe</span>
          <div className="grid grid-cols-2 [gap:var(--space-fluid-2xs,0.5rem)]">
            {(['morning_class', 'evening_class'] as SessionId[]).map((s) => (
              <button
                key={s}
                type="button"
                disabled={isEditMode}
                onClick={() => setSession(s)}
                className={cn(
                  'h-12 rounded-xl border text-sm font-bold transition-all duration-300',
                  session === s
                    ? 'border-green-500 bg-green-500/10 text-green-700 dark:text-green-400'
                    : 'border-gray-200 dark:border-gray-700/50 text-gray-600 dark:text-gray-300 hover:border-green-500/30',
                  isEditMode && 'opacity-60 cursor-not-allowed'
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
          disabled={isPaid}
          onChange={(e) => setStopsRange(e.target.value as StopsRange)}
        >
          {STOPS_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </SelectField>

        {/* Prezzo payout (auto) */}
        <div className="flex items-center justify-between rounded-xl bg-gray-900 dark:bg-gray-800 text-white [padding:var(--space-fluid-s,1rem)]">
          <span className="text-xs opacity-80">Prezzo payout</span>
          <span className="text-2xl font-bold">
            {price ?? '—'} <span className="text-sm font-medium opacity-80">Baht</span>
          </span>
        </div>

        {/* Numero clienti totali — tendina 1..14 */}
        <SelectField
          label="Numero clienti totali (persone in auto)"
          value={pax}
          disabled={isPaid}
          onChange={(e) => setPax(e.target.value)}
        >
          {Array.from({ length: 14 }, (_, i) => i + 1).map((n) => (
            <option key={n} value={String(n)}>{n} {n === 1 ? 'persona' : 'persone'}</option>
          ))}
        </SelectField>

        {error && (
          <Paragraph size="sm" className="text-red-600 dark:text-red-400">{error}</Paragraph>
        )}

        {!isPaid && (
          <Button type="submit" className="w-full mt-1" disabled={!profile} isLoading={submitting}>
            {submitting ? 'Invio…' : isExistingPending ? 'Salva modifica' : 'Invia'}
          </Button>
        )}

        {/* Elimina — solo su pending esistente */}
        {isExistingPending && !isPaid && (
          <Button
            type="button"
            variant="outline"
            className="w-full text-red-600 ring-red-300"
            onClick={handleDelete}
            isLoading={deleting}
          >
            {deleting ? 'Elimino…' : 'Elimina servizio'}
          </Button>
        )}
      </form>
    </Card>
  );
};

const SummaryRow: React.FC<{ label: string; value: string; highlight?: boolean }> = ({ label, value, highlight }) => (
  <div className="flex items-center justify-between">
    <span className="text-sm text-gray-500 dark:text-gray-400">{label}</span>
    <span className={cn('text-sm font-bold', highlight ? 'text-green-700 dark:text-green-400' : 'text-gray-900 dark:text-white')}>
      {value}
    </span>
  </div>
);

function fmtDate(dateStr: string): string {
  return new Date(dateStr + 'T00:00:00').toLocaleDateString('it-IT', {
    weekday: 'long', day: '2-digit', month: 'long', year: 'numeric',
  });
}

export default DriverPayoutForm;
