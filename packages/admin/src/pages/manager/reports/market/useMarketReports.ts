/**
 * Market reports (Kitchen/teacher · Logistic) - dati + azioni: run per scope, aggregato mensile
 * (teacher), PDF run/mese, edit/delete run, Expense Zoho (run logistics · mese teacher).
 * Estratto da ManagerReports.tsx (#16) a comportamento invariato. La UI e' in MarketReports.tsx.
 */
import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router';
import { useTranslation } from 'react-i18next';
import { supabase } from '@thaiakha/shared/lib/supabase';
import { useQuery, useQueryClient } from '@thaiakha/shared/query';
import { monthStartEnd, deliverPdf, edgeErrorMessage, type PdfMode } from '../shared';

// Teacher market reports have a 2nd axis: day-by-day vs month aggregate (the monthly is the Zoho/payment unit).
export type Gran = 'day' | 'month';
export type MarketScope = 'teacher' | 'logistics';

export interface MarketItem { id?: string; name?: string; unit?: string; quantity?: number; price?: number; actual_price?: number; }
export interface MarketRunRow { id: string; run_date: string; spent_on: string; status: string; total_cost: number; items: MarketItem[]; archived: boolean; shopper: string | null; /* authors.name via worker_id */ }
export interface MonthGroup { key: string; label: string; runs: MarketRunRow[]; total: number; days: number; archived: boolean; }
// A logistics run leaves "In progress" and enters "Archive" once it is expensed.
const isRunArchived = (status: string) => status === 'expensed';

const marketKey = (scope: MarketScope | null) => ['manager_reports', 'market', scope ?? ''] as const;

// Market runs (1 run = 1 report) for kitchen (teacher) or logistics. Archive = status 'expensed'.
async function loadMarketRuns(scope: MarketScope): Promise<MarketRunRow[]> {
    const { data } = await supabase
        .from('market_runs')
        .select('id, run_date, spent_on, status, total_cost, items_snapshot, worker:authors!worker_id(name)')
        .eq('shopper_role', scope)
        .order('run_date', { ascending: false });
    type Row = { id: string; run_date: string; spent_on: string | null; status: string; total_cost: number; items_snapshot: unknown; worker: { name: string | null } | { name: string | null }[] | null };
    return ((data as unknown as Row[]) ?? []).map(r => ({
        // #106: la data mostrata nei report e' il giorno REALE della spesa (spent_on);
        // run_date resta l'identita' della run (raggruppamento mese, nome PDF).
        id: r.id, run_date: r.run_date, spent_on: r.spent_on ?? r.run_date, status: r.status, total_cost: Number(r.total_cost) || 0,
        items: Array.isArray(r.items_snapshot) ? (r.items_snapshot as MarketItem[]) : [],
        archived: isRunArchived(r.status),
        shopper: (Array.isArray(r.worker) ? r.worker[0]?.name : r.worker?.name) ?? null,
    }));
}

/** @param scope null = tab market non attivo (query spenta). */
export function useMarketReports(scope: MarketScope | null) {
    const { t } = useTranslation('manager');
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const [selectedRunId, setSelectedRunId] = useState<string | null>(null);
    // Teacher day/month axis + selected month (YYYY-MM).
    const [gran, setGran] = useState<Gran>('day');
    const [selectedMonth, setSelectedMonth] = useState<string | null>(null);
    const [busy, setBusy] = useState(false);
    const [reportBusy, setReportBusy] = useState(false);

    const query = useQuery({ queryKey: marketKey(scope), queryFn: () => loadMarketRuns(scope!), enabled: scope !== null, staleTime: 0 });
    const marketRuns: MarketRunRow[] | null = query.isFetching ? null : (query.data ?? null);
    const fetchMarket = (s: MarketScope) => queryClient.invalidateQueries({ queryKey: marketKey(s) });

    const selRun = selectedRunId ? marketRuns?.find(r => r.id === selectedRunId) ?? null : null;

    // Teacher: group runs by calendar month (the monthly aggregate is the Zoho/payment unit).
    const months = useMemo<MonthGroup[] | null>(() => {
        if (!marketRuns) return null;
        const m = new Map<string, MarketRunRow[]>();
        for (const r of marketRuns) {
            const key = r.run_date.slice(0, 7);
            const arr = m.get(key) ?? [];
            arr.push(r);
            m.set(key, arr);
        }
        return Array.from(m.entries())
            .sort((a, b) => b[0].localeCompare(a[0]))
            .map(([key, runs]) => ({
                key,
                label: new Date(key + '-01T00:00:00').toLocaleDateString('en-GB', { month: 'long', year: 'numeric' }),
                runs: runs.slice().sort((a, b) => b.run_date.localeCompare(a.run_date)),
                total: runs.reduce((s, r) => s + r.total_cost, 0),
                days: runs.length,
                archived: runs.every(r => r.archived),
            }));
    }, [marketRuns]);
    const selMonth = selectedMonth ? months?.find(mg => mg.key === selectedMonth) ?? null : null;

    // Monthly aggregate report (teacher) — render-report 'market_monthly'.
    const handleMonthlyReport = async (mg: MonthGroup, mode: PdfMode) => {
        if (reportBusy) return;
        setReportBusy(true);
        try {
            const { start, end } = monthStartEnd(mg.key);
            const { data, error } = await supabase.functions.invoke('render-report', {
                body: { report: 'market_monthly', month_start: start, month_end: end },
            });
            if (error) throw error;
            deliverPdf(data as Blob, mode, `ThaiAkha_Market_Kitchen_Monthly_${mg.key}.pdf`);
        } catch (err) {
            alert(t('driverPayouts.errorReport', { defaultValue: 'Report error' }) + ': ' + (err instanceof Error ? err.message : ''));
        } finally { setReportBusy(false); }
    };

    // Drill from a month's day list into that day's ingredient detail.
    const openDayFromMonth = (runId: string) => { setSelectedRunId(runId); setGran('day'); };

    const handleRunReport = async (run: MarketRunRow, mode: PdfMode) => {
        if (reportBusy) return;
        setReportBusy(true);
        try {
            const { data, error } = await supabase.functions.invoke('render-report', {
                body: { report: 'market_run', run_id: run.id },
            });
            if (error) throw error;
            deliverPdf(data as Blob, mode, `ThaiAkha_Market_${scope === 'teacher' ? 'Kitchen' : 'Logistics'}_${run.run_date}.pdf`);
        } catch (err) {
            alert(t('driverPayouts.errorReport', { defaultValue: 'Report error' }) + ': ' + (err instanceof Error ? err.message : ''));
        } finally { setReportBusy(false); }
    };

    // Edit a market run: hand off to the Market Planner (it hydrates the run in the planner).
    const handleEditRun = (run: MarketRunRow) => {
        sessionStorage.setItem('market_launch', JSON.stringify({ action: 'edit', run_id: run.id }));
        navigate('/market-shop');
    };

    // Delete a market run (manager; RLS-guarded). Blocked in UI once expensed/archived.
    const handleDeleteRun = async (run: MarketRunRow) => {
        if (busy || !scope) return;
        if (!window.confirm(t('reports.confirmDeleteRun', { defaultValue: 'Delete this report? This cannot be undone.' }))) return;
        setBusy(true);
        try {
            const { error } = await supabase.from('market_runs').delete().eq('id', run.id);
            if (error) throw error;
            setSelectedRunId(null);
            await fetchMarket(scope);
        } catch (err) {
            alert(t('driverPayouts.errorGeneric', { defaultValue: 'Error' }) + ': ' + (err instanceof Error ? err.message : ''));
        } finally { setBusy(false); }
    };

    // BYPASS-PAYOUT — crea l'Expense Zoho per un market run (per ora SOLO logistics, 1 Expense/run).
    // Gemello di handlePayBill: invoke zoho-create-market-expense (canale staff JWT) → write-back status=expensed → archivio.
    const handleMarketExpense = async (run: MarketRunRow) => {
        if (busy || !scope) return;
        // Guardia: una lista 'planned' (bozza non confermata) non si fattura.
        if (run.status === 'planned') return;
        if (!window.confirm(t('reports.confirmExpense', { defaultValue: 'Create the Zoho expense for this report?' }))) return;
        setBusy(true);
        try {
            const { data, error } = await supabase.functions.invoke('zoho-create-market-expense', {
                body: { stream: 'logistics', run_ids: [run.id] },
            });
            if (error) throw new Error(await edgeErrorMessage(error));
            const res = data as { success: boolean; skipped?: boolean; zoho_expense_id?: string; message?: string };
            if (!res?.success) throw new Error(res?.message ?? 'Zoho error');
            alert(res.skipped
                ? t('reports.expenseSkipped', { defaultValue: 'Already expensed in Zoho.' })
                : t('reports.expenseOk', { defaultValue: 'Expense created in Zoho — moved to archive.' }));
            setSelectedRunId(null);
            await fetchMarket(scope);
        } catch (err) {
            alert(t('driverPayouts.errorGeneric', { defaultValue: 'Error' }) + ': ' + (err instanceof Error ? err.message : ''));
        } finally { setBusy(false); }
    };

    // BYPASS-PAYOUT — Expense Zoho MENSILE per kitchen (teacher): 1 Expense/mese sommando i run
    // del mese (esclude i draft 'planned'). period_start/end = 1°→ultimo del mese (monthStartEnd).
    const handleMonthlyExpense = async (mg: MonthGroup) => {
        if (busy || !scope) return;
        if (!window.confirm(t('reports.confirmExpenseMonth', { defaultValue: 'Create the monthly Zoho expense for this report?' }))) return;
        setBusy(true);
        try {
            const { start, end } = monthStartEnd(mg.key);
            const { data, error } = await supabase.functions.invoke('zoho-create-market-expense', {
                body: { stream: 'teacher', period_start: start, period_end: end },
            });
            if (error) throw new Error(await edgeErrorMessage(error));
            const res = data as { success: boolean; skipped?: boolean; zoho_expense_id?: string; message?: string };
            if (!res?.success) throw new Error(res?.message ?? 'Zoho error');
            alert(res.skipped
                ? t('reports.expenseSkipped', { defaultValue: 'Already expensed in Zoho.' })
                : t('reports.expenseOk', { defaultValue: 'Expense created in Zoho — moved to archive.' }));
            setSelectedMonth(null);
            await fetchMarket(scope);
        } catch (err) {
            alert(t('driverPayouts.errorGeneric', { defaultValue: 'Error' }) + ': ' + (err instanceof Error ? err.message : ''));
        } finally { setBusy(false); }
    };

    /** Deseleziona run e mese (chiusura inspector / cambio vista). */
    const clearSelection = () => { setSelectedRunId(null); setSelectedMonth(null); };
    /** Reset completo al cambio tipo report. */
    const reset = () => { setSelectedRunId(null); setSelectedMonth(null); setGran('day'); };

    return {
        marketRuns, months, selRun, selMonth, selectedRunId, setSelectedRunId, selectedMonth, setSelectedMonth,
        gran, setGran, busy, reportBusy,
        handleMonthlyReport, openDayFromMonth, handleRunReport, handleEditRun, handleDeleteRun, handleMarketExpense, handleMonthlyExpense,
        clearSelection, reset,
    };
}

export type MarketReportsState = ReturnType<typeof useMarketReports>;
