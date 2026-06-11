// BYPASS-PAYOUT (temporaneo) — Dashboard payout driver: servizi giornalieri
// raggruppati per settimana ISO (lun→dom). Legge driver_payments del driver loggato
// (RLS: Driver Read Own). Settimana corrente/pending espansa, settimane pagate compresse,
// filtro per mese, modifica da card, realtime + popup quando l'admin segna "pagato".

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { supabase } from '@thaiakha/shared/lib/supabase';
import { authService } from '../../services/auth.service';
import { Heading, Paragraph } from '../../components/typography';
import Card from '../../components/ui/Card';
import SelectField from '../../components/form/input/SelectField';
import { cn } from '@thaiakha/shared/lib/utils';
import type { PayoutEditTarget, SessionId } from './DriverPayoutForm';

interface PayoutRow {
  run_date: string;
  session_id: string;
  total_stops: number;
  total_pax: number;
  payout_amount: number;
  status: string | null;
  paid_at: string | null;
}

interface WeekGroup {
  key: string;
  start: Date;
  end: Date;
  rows: PayoutRow[];
  totalAll: number;
  totalPending: number;
  pendingCount: number;
  paidCount: number;
}

interface Props {
  onEdit?: (target: PayoutEditTarget) => void;
  refreshKey?: number; // cambia per forzare il refetch dopo submit/delete dal form
}

const SESSION_LABEL: Record<string, string> = { morning_class: 'Morning', evening_class: 'Evening' };
const LS_SEEN_PAID = 'driver_payout_last_seen_paid';

function mondayOf(d: Date): Date {
  const day = (d.getDay() + 6) % 7;
  const monday = new Date(d);
  monday.setDate(d.getDate() - day);
  monday.setHours(0, 0, 0, 0);
  return monday;
}
function fmtDay(dateStr: string): string {
  return new Date(dateStr + 'T00:00:00').toLocaleDateString('it-IT', { weekday: 'short', day: '2-digit', month: 'short' });
}
function fmtRange(start: Date, end: Date): string {
  const s = start.toLocaleDateString('it-IT', { day: '2-digit', month: 'short' });
  const e = end.toLocaleDateString('it-IT', { day: '2-digit', month: 'short', year: 'numeric' });
  return `${s} – ${e}`;
}
// Ultimi 6 mesi (anno in corso): opzioni filtro {value: 'YYYY-MM', label}
function lastMonths(n: number): { value: string; label: string }[] {
  const out: { value: string; label: string }[] = [];
  const now = new Date();
  for (let i = 0; i < n; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    out.push({
      value: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`,
      label: d.toLocaleDateString('it-IT', { month: 'long', year: 'numeric' }),
    });
  }
  return out;
}

const DriverPayoutDashboard: React.FC<Props> = ({ onEdit, refreshKey }) => {
  const [rows, setRows] = useState<PayoutRow[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [driverId, setDriverId] = useState<string | null>(null);
  const now = new Date();
  const [monthKey, setMonthKey] = useState(`${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`);
  const [paidPopup, setPaidPopup] = useState<string | null>(null);
  const fetchedOnce = useRef(false);

  const fetchRows = React.useCallback(async () => {
    const { data, error: e } = await supabase
      .from('driver_payments')
      .select('run_date, session_id, total_stops, total_pax, payout_amount, status, paid_at')
      .order('run_date', { ascending: false });
    if (e) { setError(e.message); return; }
    const list = (data as PayoutRow[]) ?? [];
    setRows(list);

    // Popup "pagamento ricevuto": righe paid con paid_at più recente dell'ultimo visto.
    const lastSeen = localStorage.getItem(LS_SEEN_PAID) ?? '';
    const paid = list.filter((r) => r.status === 'paid' && r.paid_at);
    const newestPaid = paid.reduce<string>((max, r) => (r.paid_at! > max ? r.paid_at! : max), '');
    if (newestPaid && newestPaid > lastSeen) {
      if (fetchedOnce.current) {
        const justPaid = paid.filter((r) => r.paid_at! > lastSeen);
        const total = justPaid.reduce((s, r) => s + r.payout_amount, 0);
        setPaidPopup(`Pagamento ricevuto: ${total} Baht (${justPaid.length} servizi).`);
      }
      localStorage.setItem(LS_SEEN_PAID, newestPaid);
    }
    fetchedOnce.current = true;
  }, []);

  useEffect(() => {
    authService.getCurrentUserProfile().then((p) => setDriverId(p?.id ?? null));
    fetchRows();
  }, [fetchRows, refreshKey]);

  // Realtime: l'admin segna "pagato" -> aggiorno e mostro il popup live.
  useEffect(() => {
    if (!driverId) return;
    const channel = supabase
      .channel('driver-payments-self')
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'driver_payments', filter: `driver_id=eq.${driverId}` },
        () => { fetchRows(); }
      )
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [driverId, fetchRows]);

  const weeks = useMemo<WeekGroup[]>(() => {
    if (!rows) return [];
    const map = new Map<string, WeekGroup>();
    for (const r of rows) {
      const monday = mondayOf(new Date(r.run_date + 'T00:00:00'));
      const key = monday.toISOString().split('T')[0];
      let g = map.get(key);
      if (!g) {
        const end = new Date(monday); end.setDate(monday.getDate() + 6);
        g = { key, start: monday, end, rows: [], totalAll: 0, totalPending: 0, pendingCount: 0, paidCount: 0 };
        map.set(key, g);
      }
      g.rows.push(r);
      g.totalAll += r.payout_amount;
      if (r.status === 'paid') g.paidCount++;
      else { g.totalPending += r.payout_amount; g.pendingCount++; }
    }
    const list = Array.from(map.values()).sort((a, b) => b.start.getTime() - a.start.getTime());
    list.forEach((g) => g.rows.sort((a, b) => a.run_date.localeCompare(b.run_date)));
    return list;
  }, [rows]);

  // Filtro mese: settimana appartiene al mese del suo LUNEDÌ (settimane intere, niente split).
  const monthWeeks = useMemo(
    () => weeks.filter((w) => `${w.start.getFullYear()}-${String(w.start.getMonth() + 1).padStart(2, '0')}` === monthKey),
    [weeks, monthKey]
  );

  if (error) return <Paragraph size="sm" className="text-red-600 dark:text-red-400">Errore: {error}</Paragraph>;
  if (rows === null) return <Paragraph size="sm" color="muted">Caricamento payout…</Paragraph>;

  return (
    <div className="flex flex-col [gap:var(--space-fluid-m,1.5rem)] w-full max-w-[640px]">
      {/* Popup pagamento ricevuto */}
      {paidPopup && (
        <div className="rounded-xl border border-green-500/40 bg-green-500/10 [padding:var(--space-fluid-s,1rem)] flex items-center justify-between gap-3">
          <div>
            <Paragraph size="sm" className="text-green-700 dark:text-green-400 font-bold">💸 {paidPopup}</Paragraph>
          </div>
          <button type="button" onClick={() => setPaidPopup(null)} className="text-green-700 dark:text-green-400 text-sm font-bold">OK</button>
        </div>
      )}

      {/* Filtro mese */}
      <div className="w-full max-w-[220px]">
        <SelectField value={monthKey} onChange={(e) => setMonthKey(e.target.value)}>
          {lastMonths(6).map((m) => (
            <option key={m.value} value={m.value} className="capitalize">{m.label}</option>
          ))}
        </SelectField>
      </div>

      {monthWeeks.length === 0 && (
        <Card size="lg">
          <Heading level="h4">Nessun servizio nel mese</Heading>
          <Paragraph size="sm" color="muted" className="mt-1">Scegli un altro mese o dichiara un servizio.</Paragraph>
        </Card>
      )}

      {monthWeeks.map((w) => {
        const fullyPaid = w.pendingCount === 0 && w.paidCount > 0;
        // settimane pagate -> compresse (una riga); pending/correnti -> espanse
        if (fullyPaid) {
          return (
            <Card key={w.key} size="md">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-sm font-bold text-gray-900 dark:text-white">{fmtRange(w.start, w.end)}</span>
                  <span className="ml-2 text-[10px] font-black uppercase tracking-widest text-green-600 dark:text-green-400">Pagato</span>
                </div>
                <span className="text-base font-bold text-gray-900 dark:text-white">{w.totalAll} Baht</span>
              </div>
            </Card>
          );
        }
        return (
          <Card key={w.key} size="lg">
            <div className="flex items-start justify-between gap-4 mb-[var(--space-fluid-s,1rem)]">
              <div>
                <Heading level="h4">Settimana</Heading>
                <Paragraph size="sm" color="muted">{fmtRange(w.start, w.end)}</Paragraph>
              </div>
              <div className="text-right">
                <span className="block text-2xl font-bold text-gray-900 dark:text-white">
                  {w.totalPending} <span className="text-sm font-medium opacity-70">Baht</span>
                </span>
                <span className="text-[10px] font-black uppercase tracking-widest text-amber-600">Da pagare · Pending</span>
              </div>
            </div>

            <div className="divide-y divide-gray-100 dark:divide-gray-800">
              {w.rows.map((r) => {
                const editable = r.status !== 'paid';
                return (
                  <button
                    key={`${r.run_date}-${r.session_id}`}
                    type="button"
                    disabled={!editable}
                    onClick={() => editable && onEdit?.({ run_date: r.run_date, session_id: r.session_id as SessionId })}
                    className={cn(
                      'w-full flex items-center justify-between gap-3 py-2.5 text-left',
                      editable && 'hover:bg-green-500/[0.04] rounded-lg px-1 -mx-1 transition-colors cursor-pointer'
                    )}
                  >
                    <div className="min-w-0">
                      <span className="block text-sm font-bold text-gray-900 dark:text-white capitalize">{fmtDay(r.run_date)}</span>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {SESSION_LABEL[r.session_id] ?? r.session_id} · {r.total_stops} stop · {r.total_pax} pax
                      </span>
                    </div>
                    <span className="text-sm font-bold text-gray-900 dark:text-white shrink-0">{r.payout_amount} ฿</span>
                  </button>
                );
              })}
            </div>

            <div className="flex items-center justify-between mt-[var(--space-fluid-s,1rem)] pt-3 border-t border-gray-200 dark:border-gray-700">
              <span className="text-xs font-black uppercase tracking-widest text-gray-500">Totale settimana</span>
              <span className="text-base font-bold text-gray-900 dark:text-white">{w.totalAll} Baht</span>
            </div>
          </Card>
        );
      })}
    </div>
  );
};

export default DriverPayoutDashboard;
