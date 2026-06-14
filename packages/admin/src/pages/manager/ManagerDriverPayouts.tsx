// BYPASS-PAYOUT (temporaneo) — Report payout driver lato MANAGER (driver-centric).
// Selettore driver -> settimane ISO (lun→dom) pending + pagate. Per ogni settimana:
// "Segna pagato & fattura Zoho" => mark_driver_week_paid + invoke zoho-create-driver-expense.
// RLS: manager passa is_admin() (admin+manager) -> legge tutti i driver_payments.

import React, { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { supabase } from '@thaiakha/shared/lib/supabase';
import { Heading, Paragraph } from '../../components/typography';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/button/Button';
import SelectField from '../../components/form/input/SelectField';
import { Printer, Download, Trash2 } from 'lucide-react';
import { cn } from '@thaiakha/shared/lib/utils';

interface DriverOpt {
  id: string;
  full_name: string;
  email: string | null;
  zoho_contact_id: string | null;
}

// BYPASS-PAYOUT — total_stops numerico -> range per l'email di cancellazione
const stopsToRange = (n: number): string =>
  n <= 2 ? '1-2' : n <= 4 ? '3-4' : n <= 6 ? '5-6' : '7plus';
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
const getLocale = (lang: string) => (lang === 'th' ? 'th-TH' : 'en-GB');
const fmtDay = (s: string, lang = 'en') => new Date(s + 'T00:00:00').toLocaleDateString(getLocale(lang), { weekday: 'short', day: '2-digit', month: 'short' });
const fmtRange = (a: Date, b: Date, lang = 'en') => {
  const locale = getLocale(lang);
  return `${a.toLocaleDateString(locale, { day: '2-digit', month: 'short' })} – ${b.toLocaleDateString(locale, { day: '2-digit', month: 'short', year: 'numeric' })}`;
};

const ManagerDriverPayouts: React.FC = () => {
  const { t, i18n } = useTranslation('manager');
  const [drivers, setDrivers] = useState<DriverOpt[] | null>(null);
  const [selected, setSelected] = useState<string>('');
  const [rows, setRows] = useState<PayoutRow[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busyWeek, setBusyWeek] = useState<string | null>(null);
  const [confirming, setConfirming] = useState<string | null>(null);
  const [reportBusy, setReportBusy] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [deletingRow, setDeletingRow] = useState<string | null>(null);
  const [weekResult, setWeekResult] = useState<Record<string, { ok: boolean; msg: string }>>({});

  // Lista driver
  useEffect(() => {
    supabase
      .from('profiles')
      .select('id, full_name, email, zoho_contact_id')
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
    setRows((data as unknown as PayoutRow[]) ?? []);
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
    setWeekResult((p) => ({ ...p, [w.key]: { ok: true, msg: t('driverPayouts.processing') } }));
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
      if (!res.success) throw new Error(res.message ?? t('driverPayouts.errorGeneric'));

      const msg = res.skipped
        ? t('driverPayouts.alreadyInZoho')
        : t('driverPayouts.zohoExpenseCreated', { id: res.zoho_expense_id });
      setWeekResult((p) => ({ ...p, [w.key]: { ok: true, msg } }));
      await fetchRows(selectedDriver.id);
    } catch (err: unknown) {
      setWeekResult((p) => ({
        ...p,
        [w.key]: { ok: false, msg: err instanceof Error ? err.message : t('driverPayouts.errorGeneric') },
      }));
    } finally {
      setBusyWeek(null);
    }
  };

  // Report PDF (Cloud Run via edge function render-report). Genera on-the-fly, niente archivio.
  const handleReport = async (w: WeekGroup, mode: 'print' | 'download') => {
    if (!selectedDriver || reportBusy) return;
    setReportBusy(w.key);
    try {
      const { data, error: e } = await supabase.functions.invoke('render-report', {
        body: { report: 'driver_report', driver_id: selectedDriver.id, week_start: w.key, week_end: w.endISO, format: 'A5' },
      });
      if (e) {
        let msg = e.message;
        const ctx = (e as { context?: { json?: () => Promise<{ error?: string }> } }).context;
        if (ctx?.json) { try { msg = (await ctx.json())?.error ?? msg; } catch { /* ignore */ } }
        throw new Error(msg);
      }
      const blob = data as Blob;
      const url = URL.createObjectURL(blob);
      if (mode === 'download') {
        const a = document.createElement('a');
        a.href = url;
        a.download = `ThaiAkha_Driver_Report_${selectedDriver.full_name.replace(/\s+/g, '')}_${w.key}.pdf`;
        document.body.appendChild(a); a.click(); a.remove();
        setTimeout(() => URL.revokeObjectURL(url), 4000);
      } else {
        const iframe = document.createElement('iframe');
        iframe.style.cssText = 'position:fixed;right:0;bottom:0;width:0;height:0;border:0;';
        iframe.src = url;
        iframe.onload = () => { iframe.contentWindow?.focus(); iframe.contentWindow?.print(); };
        document.body.appendChild(iframe);
        setTimeout(() => { iframe.remove(); URL.revokeObjectURL(url); }, 60000);
      }
    } catch (err: unknown) {
      setWeekResult((p) => ({ ...p, [w.key]: { ok: false, msg: err instanceof Error ? err.message : t('driverPayouts.errorReport') } }));
    } finally {
      setReportBusy(null);
    }
  };

  // BYPASS-PAYOUT — elimina UN servizio (admin_delete_payout) + email cancellazione (driver TH + office EN)
  const handleDeleteRow = async (w: WeekGroup, r: PayoutRow) => {
    if (!selectedDriver) return;
    const rowKey = `${r.run_date}-${r.session_id}`;
    setDeletingRow(rowKey);
    try {
      const { error: delErr } = await supabase.rpc('admin_delete_payout', {
        p_driver_id: selectedDriver.id,
        p_run_date: r.run_date,
        p_session_id: r.session_id,
      });
      if (delErr) throw delErr;

      // Email cancellazione — non blocca il successo (degradazione graziosa).
      try {
        await supabase.functions.invoke('send-driver-cancellation', {
          body: {
            driver_name: selectedDriver.full_name,
            email: selectedDriver.email,
            run_date: r.run_date,
            session_id: r.session_id,
            stops_range: stopsToRange(r.total_stops),
            reason: null,
          },
        });
      } catch { /* degradazione graziosa */ }

      setWeekResult((p) => ({ ...p, [w.key]: { ok: true, msg: t('driverPayouts.serviceDeleted') } }));
      await fetchRows(selectedDriver.id);
    } catch (err: unknown) {
      setWeekResult((p) => ({ ...p, [w.key]: { ok: false, msg: err instanceof Error ? err.message : t('driverPayouts.errorGeneric') } }));
    } finally {
      setDeletingRow(null);
    }
  };

  const reportBtnClass = 'inline-flex items-center gap-1.5 h-9 px-3 rounded-lg border text-xs font-bold transition-colors ' +
    'border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 ' +
    'hover:border-green-500 hover:text-green-600 disabled:opacity-50';
  const reportButtons = (w: WeekGroup) => (
    <div className="flex gap-2">
      <button type="button" disabled={reportBusy === w.key} onClick={() => handleReport(w, 'print')} className={reportBtnClass}>
        <Printer className="size-4" /> {reportBusy === w.key ? t('driverPayouts.generating') : t('driverPayouts.printReport')}
      </button>
      <button type="button" disabled={reportBusy === w.key} onClick={() => handleReport(w, 'download')} className={reportBtnClass}>
        <Download className="size-4" /> {t('driverPayouts.downloadPdf')}
      </button>
    </div>
  );

  if (error) return <Paragraph size="sm" className="text-red-600 dark:text-red-400">{t('driverPayouts.errorPrefix')} {error}</Paragraph>;

  return (
    <div className="flex flex-col [gap:var(--space-fluid-m,1.5rem)] w-full max-w-[680px]">
      {/* Selettore driver */}
      <div className="w-full max-w-[280px]">
        <SelectField label={t('driverPayouts.driverLabel')} value={selected} onChange={(e) => setSelected(e.target.value)}>
          {(drivers ?? []).map((d) => (
            <option key={d.id} value={d.id}>{d.full_name}</option>
          ))}
        </SelectField>
      </div>

      {selectedDriver && !selectedDriver.zoho_contact_id && (
        <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 [padding:var(--space-fluid-s,1rem)]">
          <Paragraph size="sm" className="text-amber-700 dark:text-amber-400 font-bold">⚠ {t('driverPayouts.zohoWarningTitle')}</Paragraph>
          <Paragraph size="xs" color="muted">{t('driverPayouts.zohoWarningMsg')}</Paragraph>
        </div>
      )}

      {rows === null && <Paragraph size="sm" color="muted">{t('driverPayouts.loading')}</Paragraph>}
      {rows && weeks.length === 0 && (
        <Card size="lg"><Paragraph size="sm" color="muted">{t('driverPayouts.noServices')}</Paragraph></Card>
      )}

      {weeks.map((w) => {
        const res = weekResult[w.key];
        return (
          <Card key={w.key} size="lg">
            <div className="flex items-start justify-between gap-4 mb-[var(--space-fluid-s,1rem)]">
              <div>
                <Heading level="h4">{fmtRange(w.start, w.end, i18n.language)}</Heading>
                <span className={cn(
                  'text-[10px] font-black uppercase tracking-widest',
                  w.fullyPaid ? 'text-green-600 dark:text-green-400' : 'text-amber-600'
                )}>
                  {w.fullyPaid ? (w.zohoId ? t('driverPayouts.statusPaidBilled') : t('driverPayouts.statusPaidUnbilled')) : t('driverPayouts.statusPending')}
                </span>
              </div>
              <span className="text-2xl font-bold text-gray-900 dark:text-white">
                {w.total} <span className="text-sm font-medium opacity-70">Baht</span>
              </span>
            </div>

            {/* Report A5: stampa / download (Cloud Run, on-the-fly) */}
            <div className="flex justify-end mb-[var(--space-fluid-2xs,0.5rem)]">{reportButtons(w)}</div>

            <div className="divide-y divide-gray-100 dark:divide-gray-800">
              {w.rows.map((r) => {
                const rowKey = `${r.run_date}-${r.session_id}`;
                const canDelete = r.status !== 'paid' && !w.zohoId;
                return (
                  <div key={rowKey} className="py-2">
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-sm text-gray-700 dark:text-gray-200 capitalize">
                        {fmtDay(r.run_date, i18n.language)} · {r.session_id === 'morning_class' ? t('driverPayouts.morningSession') : t('driverPayouts.eveningSession')} · {r.total_stops} stop · {r.total_pax} pax
                      </span>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-sm font-bold text-gray-900 dark:text-white">{r.payout_amount} ฿</span>
                        {canDelete && (
                          <button
                            type="button"
                            aria-label={t('driverPayouts.deleteService')}
                            title={t('driverPayouts.deleteService')}
                            disabled={deletingRow === rowKey}
                            onClick={() => setConfirmDelete(rowKey)}
                            className="p-1 rounded-md text-gray-400 hover:text-red-600 hover:bg-red-500/10 transition-colors disabled:opacity-50"
                          >
                            <Trash2 className="size-4" />
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Conferma inline cancellazione riga */}
                    {confirmDelete === rowKey && (
                      <div className="mt-2 rounded-lg border border-red-500/30 bg-red-500/5 [padding:var(--space-fluid-2xs,0.5rem)]">
                        <Paragraph size="xs" className="font-bold text-gray-900 dark:text-white">
                          {t('driverPayouts.confirmDeleteTitle')}
                        </Paragraph>
                        <Paragraph size="xs" color="muted">
                          {t('driverPayouts.confirmDeleteMsg', { date: fmtDay(r.run_date, i18n.language) })}
                        </Paragraph>
                        <div className="flex gap-2 mt-2">
                          <button
                            type="button"
                            disabled={deletingRow === rowKey}
                            onClick={() => { setConfirmDelete(null); handleDeleteRow(w, r); }}
                            className="h-8 px-3 rounded-lg text-xs font-bold bg-red-600 text-white hover:bg-red-700 disabled:opacity-50"
                          >
                            {t('driverPayouts.deleteConfirm')}
                          </button>
                          <button
                            type="button"
                            onClick={() => setConfirmDelete(null)}
                            className="h-8 px-3 rounded-lg text-xs font-bold border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300"
                          >
                            {t('driverPayouts.deleteCancel')}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Azione settimana */}
            <div className="mt-[var(--space-fluid-s,1rem)] pt-3 border-t border-gray-200 dark:border-gray-700">
              {w.zohoId ? (
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-green-700 dark:text-green-400">{t('driverPayouts.billedLabel', { zohoId: w.zohoId })}</span>
                  <span className="text-xs text-gray-400">{t('driverPayouts.noAction')}</span>
                </div>
              ) : confirming === w.key ? (
                <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 [padding:var(--space-fluid-s,1rem)]">
                  <Paragraph size="sm" className="font-bold text-gray-900 dark:text-white">
                    {w.fullyPaid ? t('driverPayouts.confirmBillTitle') : t('driverPayouts.confirmPayTitle')}
                  </Paragraph>
                  <Paragraph size="xs" color="muted">
                    {w.fullyPaid
                      ? t('driverPayouts.confirmBillMsg', { amount: w.total })
                      : t('driverPayouts.confirmPayMsg', { amount: w.total })}
                  </Paragraph>
                  <div className="flex gap-2 mt-3">
                    <Button type="button" className="flex-1" isLoading={busyWeek === w.key}
                            onClick={() => { setConfirming(null); handlePay(w, w.fullyPaid ? 'bill-only' : 'mark+bill'); }}>
                      {t('driverPayouts.confirm')}
                    </Button>
                    <Button type="button" variant="outline" className="flex-1" disabled={busyWeek === w.key}
                            onClick={() => setConfirming(null)}>
                      {t('driverPayouts.cancel')}
                    </Button>
                  </div>
                </div>
              ) : w.fullyPaid ? (
                <Button type="button" variant="outline" className="w-full" onClick={() => setConfirming(w.key)}>
                  {t('driverPayouts.rebillZoho')}
                </Button>
              ) : (
                <Button type="button" className="w-full" onClick={() => setConfirming(w.key)}>
                  {t('driverPayouts.markPaidAndBill')}
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
