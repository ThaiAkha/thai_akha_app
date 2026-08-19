/**
 * Driver reports - dati + azioni (settimane payout per driver, edit/delete riga, paga & fattura Zoho, PDF).
 * Estratto da ManagerReports.tsx (#16) a comportamento invariato. La UI e' in DriverReports.tsx.
 */
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { supabase } from '@thaiakha/shared/lib/supabase';
import { useQuery, useQueryClient } from '@thaiakha/shared/query';
import { mondayOf, isoDate, deliverPdf, type PdfMode } from '../shared';

export interface PayoutRow { run_date: string; session_id: string; total_stops: number; total_pax: number; payout_amount: number; status: string | null; zoho_expense_id: string | null; }
export interface WeekGroup { key: string; start: Date; end: Date; endISO: string; rows: PayoutRow[]; total: number; pendingCount: number; fullyPaid: boolean; billed: boolean; archived: boolean; }
export interface DriverReport { id: string; name: string; avatar: string | null; weeks: WeekGroup[] }

// Driver payout tiers depend only on the stops band; map band → representative stop count for the RPC.
export type StopsRange = '1-2' | '3-4' | '5-6' | '7plus';
export const STOPS_REP: Record<StopsRange, number> = { '1-2': 2, '3-4': 4, '5-6': 6, '7plus': 7 };
export const STOPS_RANGES: StopsRange[] = ['1-2', '3-4', '5-6', '7plus'];
export const rangeOfStops = (n: number): StopsRange => (n <= 2 ? '1-2' : n <= 4 ? '3-4' : n <= 6 ? '5-6' : '7plus');

export interface DriverEditing { driverId: string; run_date: string; session_id: string; range: StopsRange; pax: string }

const DRIVER_KEY = ['manager_reports', 'driver'] as const;

// Fetch all drivers (so every driver is exposed) + all payouts, then merge.
async function loadDriverReports(): Promise<DriverReport[]> {
    const [{ data: drvData }, { data: payData }] = await Promise.all([
        supabase.from('profiles').select('id, full_name, avatar_url').eq('role', 'driver').order('full_name'),
        supabase.from('driver_payments').select('driver_id, run_date, session_id, total_stops, total_pax, payout_amount, status, zoho_expense_id').order('run_date', { ascending: false }),
    ]);

    const payByDriver = new Map<string, PayoutRow[]>();
    for (const r of (payData as unknown as Array<PayoutRow & { driver_id: string }>) ?? []) {
        const arr = payByDriver.get(r.driver_id) ?? [];
        arr.push(r);
        payByDriver.set(r.driver_id, arr);
    }

    return ((drvData as Array<{ id: string; full_name: string; avatar_url: string | null }>) ?? []).map(d => {
        const wk = new Map<string, WeekGroup>();
        for (const r of payByDriver.get(d.id) ?? []) {
            const monday = mondayOf(new Date(r.run_date + 'T00:00:00'));
            const key = isoDate(monday);
            let g = wk.get(key);
            if (!g) { const end = new Date(monday); end.setDate(monday.getDate() + 6); g = { key, start: monday, end, endISO: isoDate(end), rows: [], total: 0, pendingCount: 0, fullyPaid: false, billed: false, archived: false }; wk.set(key, g); }
            g.rows.push(r);
            g.total += r.payout_amount || 0;
            if (r.status !== 'paid') g.pendingCount++;
            if (r.zoho_expense_id) g.billed = true;
        }
        const weeks = Array.from(wk.values()).sort((a, b) => b.start.getTime() - a.start.getTime());
        weeks.forEach(g => { g.rows.sort((a, b) => a.run_date.localeCompare(b.run_date)); g.fullyPaid = g.pendingCount === 0; g.archived = g.fullyPaid && g.billed; });
        return { id: d.id, name: d.full_name, avatar: d.avatar_url, weeks };
    });
}

export function useDriverReports(enabled: boolean) {
    const { t } = useTranslation('manager');
    const queryClient = useQueryClient();
    const [archiveDriverId, setArchiveDriverId] = useState('');
    const [selected, setSelected] = useState<{ driverId: string; weekKey: string } | null>(null);
    const [busy, setBusy] = useState(false);
    const [reportBusy, setReportBusy] = useState(false);
    // Inline edit of a single driver day-entry (manager-scoped RPCs).
    const [editing, setEditing] = useState<DriverEditing | null>(null);

    // staleTime 0 = dati operativi; `null` durante il (re)fetch = loader, come prima.
    const query = useQuery({ queryKey: DRIVER_KEY, queryFn: loadDriverReports, enabled, staleTime: 0 });
    const reports: DriverReport[] | null = query.isFetching ? null : (query.data ?? null);
    const fetchAll = () => queryClient.invalidateQueries({ queryKey: DRIVER_KEY });

    const selDriver = selected ? reports?.find(d => d.id === selected.driverId) ?? null : null;
    const week = selDriver?.weeks.find(w => w.key === selected?.weekKey) ?? null;
    const archiveDriver = useMemo(() => reports?.find(d => d.id === archiveDriverId) ?? null, [reports, archiveDriverId]);

    const handleReport = async (driverId: string, driverName: string, w: WeekGroup, mode: PdfMode) => {
        if (reportBusy) return;
        setReportBusy(true);
        try {
            const { data, error } = await supabase.functions.invoke('render-report', {
                body: { report: 'driver_report', driver_id: driverId, week_start: w.key, week_end: w.endISO, format: 'A5' },
            });
            if (error) throw error;
            deliverPdf(data as Blob, mode, `ThaiAkha_Driver_${driverName.replace(/\s+/g, '')}_${w.key}.pdf`);
        } catch (err) {
            alert(t('driverPayouts.errorReport', { defaultValue: 'Report error' }) + ': ' + (err instanceof Error ? err.message : ''));
        } finally { setReportBusy(false); }
    };

    const handlePayBill = async (driverId: string, w: WeekGroup) => {
        if (busy) return;
        if (!window.confirm(t('driverPayouts.confirmPay', { defaultValue: 'Mark week as paid and bill in Zoho?' }))) return;
        setBusy(true);
        try {
            const { error: markErr } = await supabase.rpc('mark_driver_week_paid', { p_driver_id: driverId, p_week_monday: w.key });
            if (markErr) throw markErr;
            const { data, error: invErr } = await supabase.functions.invoke('zoho-create-driver-expense', { body: { driver_id: driverId, week_start: w.key, week_end: w.endISO } });
            if (invErr) throw invErr;
            const res = data as { success: boolean; message?: string };
            if (!res?.success) throw new Error(res?.message ?? 'Zoho error');
            alert(t('driverPayouts.zohoOk', { defaultValue: 'Paid & billed in Zoho — moved to archive.' }));
            setSelected(null);
            await fetchAll();
        } catch (err) {
            alert(t('driverPayouts.errorGeneric', { defaultValue: 'Error' }) + ': ' + (err instanceof Error ? err.message : ''));
        } finally { setBusy(false); }
    };

    // Edit a single driver day-entry on behalf of the driver (inject upserts; blocks if paid).
    const handleSaveEdit = async () => {
        if (!editing || busy) return;
        const pax = Number(editing.pax);
        if (!Number.isFinite(pax) || pax < 0) { alert(t('driverPayouts.invalidPax', { defaultValue: 'Invalid pax' })); return; }
        setBusy(true);
        try {
            const { error } = await supabase.rpc('inject_driver_payout_manual', {
                p_run_date: editing.run_date,
                p_session_id: editing.session_id,
                p_total_stops: STOPS_REP[editing.range],
                p_total_pax: pax,
                p_driver_id: editing.driverId,
            });
            if (error) throw error;
            setEditing(null);
            await fetchAll();
        } catch (err) {
            alert(t('driverPayouts.errorGeneric', { defaultValue: 'Error' }) + ': ' + (err instanceof Error ? err.message : ''));
        } finally { setBusy(false); }
    };

    // Delete a single driver day-entry (manager only; blocks if paid / week closed).
    const handleDeleteRow = async (driverId: string, r: PayoutRow) => {
        if (busy) return;
        setBusy(true);
        try {
            const { error } = await supabase.rpc('admin_delete_payout', {
                p_driver_id: driverId,
                p_run_date: r.run_date,
                p_session_id: r.session_id,
            });
            if (error) throw error;
            if (editing && editing.driverId === driverId && editing.run_date === r.run_date && editing.session_id === r.session_id) setEditing(null);
            await fetchAll();
        } catch (err) {
            alert(t('driverPayouts.errorGeneric', { defaultValue: 'Error' }) + ': ' + (err instanceof Error ? err.message : ''));
        } finally { setBusy(false); }
    };

    /** Deseleziona la settimana (chiusura inspector / cambio vista). */
    const clearSelection = () => setSelected(null);
    /** Reset completo al cambio tipo report. */
    const reset = () => { setSelected(null); };

    return {
        reports, selDriver, week, archiveDriver, archiveDriverId, setArchiveDriverId,
        selected, setSelected, editing, setEditing, busy, reportBusy,
        handleReport, handlePayBill, handleSaveEdit, handleDeleteRow,
        clearSelection, reset,
    };
}

export type DriverReportsState = ReturnType<typeof useDriverReports>;
