// BYPASS-PAYOUT (temporaneo) — Report payout driver lato MANAGER (driver-centric).
// Selettore driver -> settimane ISO (lun→dom) pending + pagate. Per ogni settimana:
// "Segna pagato & fattura Zoho" => mark_driver_week_paid + invoke zoho-create-driver-expense.
// RLS: manager passa is_admin() (admin+manager) -> legge tutti i driver_payments.

import React, { useEffect, useMemo, useState } from 'react';
import { supabase } from '@thaiakha/shared/lib/supabase';
import { Heading, Paragraph } from '../../components/typography';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/button/Button';
import SelectField from '../../components/form/input/SelectField';
import { cn } from '@thaiakha/shared/lib/utils';

interface DriverOpt {
  id: string;
  full_name: string;
  zoho_contact_id: string | null;
}
interface PayoutRow {
  run_date: string;
  session_id: string;
  total_stops: number;
  total_pax: number;
  payout_amount: number;
  status: string | null;
  paid_at: string | null;
  zoho_expense_id: string | null;
}
interface WeekGroup {
  key: string;          // lunedì ISO yyyy-mm-dd
  start: Date;
  end: Date;
  endISO: string;       // domenica yyyy-mm-dd
  rows: PayoutRow[];
  total: number;
  pendingCount: number;
  zohoId: string | null;
  fullyPaid: boolean;
}

const SESSION_LABEL: Record<string, string> = { morning_class: 'Morning', evening_class: 'Evening' };

function mondayOf(d: Date): Date {
  const day = (d.getDay() + 6) % 7;
  const m = new Date(d);
  m.setDate(d.getDate() - day);
  m.setHours(0, 0, 0, 0);
  return m;
}
const isoDate = (d: Date) => {
  const z = new Date(d.getTime() - d.getTimezoneOffset() * 60000);
  return z.toISOString().split('T')[0];
};
const fmtDay = (s: string) => new Date(s + 'T00:00:00').toLocaleDateString('it-IT', { weekday: 'short', day: '2-digit', month: 'short' });
const fmtRange = (a: Date, b: Date) =>
  `${a.toLocaleDateString('it-IT', { day: '2-digit', month: 'short' })} – ${b.toLocaleDateString('it-IT', { day: '2-digit', month: 'short', year: 'numeric' })}`;

const ManagerDriverPayouts: React.FC = () => {
  const [drivers, setDrivers] = useState<DriverOpt[] | null>(null);
  const [selected, setSelected] = useState<string>('');
  const [rows, setRows] = useState<PayoutRow[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busyWeek, setBusyWeek] = useState<string | null>(null);
  const [confirming, setConfirming] = useState<string | null>(null);
  const [weekResult, setWeekResult] = useState<Record<string, { ok: boolean; msg: string }>>({});

  // Lista driver
  useEffect(() => {
    supabase
      .from('profiles')
      .select('id, full_name, zoho_contact_id')
      .eq('role', 'driver')
      .order('full_name')
      .then(({ data, error: e }) => {
        if (e) { setError(e.message); return; }
        const list = (data as DriverOpt[]) ?? [];
        setDrivers(list);
        if (list.length && !selected) setSelected(list[0].id);
      });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const selectedDriver = drivers?.find((d) => d.id === selected) ?? null;

  const fetchRows = React.useCallback(async (driverId: string) => {
    setRows(null);
    const { data, error: e } = await supabase
      .from('driver_payments')
      .select('run_date, session_id, total_stops, total_pax, payout_amount, status, paid_at, zoho_expense_id')
      .eq('driver_id', driverId)
      .order('run_date', { ascending: false });
    if (e) { setError(e.message); return; }
    setRows((data as PayoutRow[]) ?? []);
  }, []);

  useEffect(() => {
    if (selected) fetchRows(selected);
  }, [selected, fetchRows]);

  const weeks = useMemo<WeekGroup[]>(() => {
    if (!rows) return [];
    const map = new Map<string, WeekGroup>();
    for (const r of rows) {
      const monday = mondayOf(new Date(r.run_date + 'T00:00:00'));
      const key = isoDate(monday);
      let g = map.get(key);
      if (!g) {
        const end = new Date(monday); end.setDate(monday.getDate() + 6);
        g = { key, start: monday, end, endISO: isoDate(end), rows: [], total: 0, pendingCount: 0, zohoId: null, fullyPaid: false };
        map.set(key, g);
      }
      g.rows.push(r);
      g.total += r.payout_amount;
      if (r.status !== 'paid') g.pendingCount++;
      if (r.zoho_expense_id) g.zohoId = r.zoho_expense_id;
    }
    const list = Array.from(map.values()).sort((a, b) => b.start.getTime() - a.start.getTime());
    list.forEach((g) => {
      g.rows.sort((a, b) => a.run_date.localeCompare(b.run_date));
      g.fullyPaid = g.pendingCount === 0;
    });
    return list;
  }, [rows]);

  const handlePay = async (w: WeekGroup, mode: 'mark+bill' | 'bill-only') => {
    if (!selectedDriver || busyWeek) return;
    setBusyWeek(w.key);
    setWeekResult((p) => ({ ...p, [w.key]: { ok: true, msg: 'Elaboro…' } }));
    try {
      if (mode === 'mark+bill') {
        const { error: markErr } = await supabase.rpc('mark_driver_week_paid', {
          p_driver_id: selectedDriver.id,
          p_week_monday: w.key,
        });
        if (markErr) throw markErr;
      }
      const { data, error: invErr } = await supabase.functions.invoke('zoho-create-driver-expense', {
        body: { driver_id: selectedDriver.id, week_start: w.key, week_end: w.endISO },
      });
      if (invErr) {
        // Estrae il messaggio reale dal corpo della risposta (FunctionsHttpError.context)
        let detail = invErr.message;
        const ctx = (invErr as { context?: { json?: () => Promise<{ message?: string; read_authorized?: boolean }> } }).context;
        if (ctx?.json) {
          try {
            const b = await ctx.json();
            detail = b?.message ?? detail;
            if (typeof b?.read_authorized === 'boolean') {
              detail += b.read_authorized ? ' · (lettura OK → manca permesso CREATE/expenses)' : ' · (anche lettura negata → scope token assente)';
            }
          } catch { /* ignore */ }
        }
        throw new Error(detail);
      }
      const res = data as { success: boolean; skipped?: boolean; zoho_expense_id?: string; message?: string };
      if (!res.success) throw new Error(res.message ?? 'Errore Zoho');

      const msg = res.skipped
        ? 'Già registrata in Zoho.'
        : `Expense Zoho creata (${res.zoho_expense_id}).`;
      setWeekResult((p) => ({ ...p, [w.key]: { ok: true, msg } }));
      await fetchRows(selectedDriver.id);
    } catch (err: unknown) {
      setWeekResult((p) => ({
        ...p,
        [w.key]: { ok: false, msg: err instanceof Error ? err.message : 'Errore' },
      }));
    } finally {
      setBusyWeek(null);
    }
  };

  if (error) return <Paragraph size="sm" className="text-red-600 dark:text-red-400">Errore: {error}</Paragraph>;

  return (
    <div className="flex flex-col [gap:var(--space-fluid-m,1.5rem)] w-full max-w-[680px]">
      {/* Selettore driver */}
      <div className="w-full max-w-[280px]">
        <SelectField label="Driver" value={selected} onChange={(e) => setSelected(e.target.value)}>
          {(drivers ?? []).map((d) => (
            <option key={d.id} value={d.id}>{d.full_name}</option>
          ))}
        </SelectField>
      </div>

      {selectedDriver && !selectedDriver.zoho_contact_id && (
        <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 [padding:var(--space-fluid-s,1rem)]">
          <Paragraph size="sm" className="text-amber-700 dark:text-amber-400 font-bold">⚠ Vendor Zoho non collegato</Paragraph>
          <Paragraph size="xs" color="muted">Si può segnare pagato, ma la fattura Zoho fallirà finché manca <code>zoho_contact_id</code>.</Paragraph>
        </div>
      )}

      {rows === null && <Paragraph size="sm" color="muted">Caricamento…</Paragraph>}
      {rows && weeks.length === 0 && (
        <Card size="lg"><Paragraph size="sm" color="muted">Nessun servizio per questo driver.</Paragraph></Card>
      )}

      {weeks.map((w) => {
        const res = weekResult[w.key];
        return (
          <Card key={w.key} size="lg">
            <div className="flex items-start justify-between gap-4 mb-[var(--space-fluid-s,1rem)]">
              <div>
                <Heading level="h4">{fmtRange(w.start, w.end)}</Heading>
                <span className={cn(
                  'text-[10px] font-black uppercase tracking-widest',
                  w.fullyPaid ? 'text-green-600 dark:text-green-400' : 'text-amber-600'
                )}>
                  {w.fullyPaid ? (w.zohoId ? 'Pagata · Fatturata' : 'Pagata · da fatturare') : 'Pending'}
                </span>
              </div>
              <span className="text-2xl font-bold text-gray-900 dark:text-white">
                {w.total} <span className="text-sm font-medium opacity-70">Baht</span>
              </span>
            </div>

            <div className="divide-y divide-gray-100 dark:divide-gray-800">
              {w.rows.map((r) => (
                <div key={`${r.run_date}-${r.session_id}`} className="flex items-center justify-between gap-3 py-2">
                  <span className="text-sm text-gray-700 dark:text-gray-200 capitalize">
                    {fmtDay(r.run_date)} · {SESSION_LABEL[r.session_id] ?? r.session_id} · {r.total_stops} stop · {r.total_pax} pax
                  </span>
                  <span className="text-sm font-bold text-gray-900 dark:text-white shrink-0">{r.payout_amount} ฿</span>
                </div>
              ))}
            </div>

            {/* Azione settimana */}
            <div className="mt-[var(--space-fluid-s,1rem)] pt-3 border-t border-gray-200 dark:border-gray-700">
              {w.zohoId ? (
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-green-700 dark:text-green-400">Fatturata · {w.zohoId}</span>
                  <span className="text-xs text-gray-400">nessuna azione</span>
                </div>
              ) : confirming === w.key ? (
                <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 [padding:var(--space-fluid-s,1rem)]">
                  <Paragraph size="sm" className="font-bold text-gray-900 dark:text-white">
                    {w.fullyPaid ? 'Generare la fattura Zoho?' : 'Sei sicuro del pagamento?'}
                  </Paragraph>
                  <Paragraph size="xs" color="muted">
                    {w.fullyPaid
                      ? `Crea l'Expense in Zoho per ${w.total} Baht.`
                      : `Le righe passano a "pagato" e viene generata automaticamente la fattura Zoho (${w.total} Baht).`}
                  </Paragraph>
                  <div className="flex gap-2 mt-3">
                    <Button type="button" className="flex-1" isLoading={busyWeek === w.key}
                            onClick={() => { setConfirming(null); handlePay(w, w.fullyPaid ? 'bill-only' : 'mark+bill'); }}>
                      Conferma
                    </Button>
                    <Button type="button" variant="outline" className="flex-1" disabled={busyWeek === w.key}
                            onClick={() => setConfirming(null)}>
                      Annulla
                    </Button>
                  </div>
                </div>
              ) : w.fullyPaid ? (
                <Button type="button" variant="outline" className="w-full" onClick={() => setConfirming(w.key)}>
                  Ripeti fattura Zoho
                </Button>
              ) : (
                <Button type="button" className="w-full" onClick={() => setConfirming(w.key)}>
                  Segna pagato & fattura Zoho
                </Button>
              )}

              {res && (
                <Paragraph size="sm" className={cn('mt-2', res.ok ? 'text-green-700 dark:text-green-400' : 'text-red-600 dark:text-red-400')}>
                  {res.msg}
                </Paragraph>
              )}
            </div>
          </Card>
        );
      })}
    </div>
  );
};

export default ManagerDriverPayouts;
