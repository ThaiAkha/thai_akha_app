/**
 * 📊 MANAGER REPORTS — unified 3-column reports hub (like Store POS).
 * Left: report type · Center: report list (2 views) · Right: single report detail.
 * Wired: DRIVER — center shows ALL drivers (avatar + name).
 *   • "In corso": weeks not yet paid+billed.
 *   • "Archivio": pick a driver → weeks paid AND billed in Zoho.
 * Wired: MARKET · KITCHEN (teacher) + MARKET · LOGISTIC — identical flow, only
 * shopper_role differs. 1 market_run = 1 report (date · items · total).
 *   • "In corso": runs not yet expensed · "Archivio": expensed runs.
 *   • Print/PDF via render-report 'market_run'. Zoho expensing TBD (no edge yet).
 * TODO (step by step): agency bookings.
 */
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router';
import { useTranslation } from 'react-i18next';
import { supabase } from '@thaiakha/shared/lib/supabase';
import { DataExplorerLayout, DataExplorerSidebar } from '../../components/data-explorer';
import SelectField from '../../components/form/input/SelectField';
import Button from '../../components/ui/button/Button';
import SalaryRoster from '../../components/manager/SalaryRoster';
import { SectionTitle } from '../../components/typography';
import { InspectorShell, InspectorHeader, InspectorBody, InspectorEmpty, InspectorFooter } from '../../components/ui/inspector/InspectorShell';
import { SegmentedToggle, ReportStatusBadge, ReportListCard, ReportLineRow } from '../../components/reports';
import { usePageMetadata } from '../../hooks/usePageMetadata';
import { cn } from '@thaiakha/shared/lib/utils';
import { Truck, GraduationCap, Package, Briefcase, Printer, Download, Banknote, History, Clock, Archive, Sunrise, Sunset, Pencil, Trash2, Check, X, CalendarRange, ChevronRight, Search, FileText, Receipt, Wallet } from 'lucide-react';

type ReportType = 'driver' | 'market_teacher' | 'market_logistic' | 'agency' | 'classes' | 'salary';

// --- POS Classes (fatturazione giornaliera 4 = sessione × tender) ---
interface PosRow { tender: 'cash' | 'card'; session: string; booking_id: string; sku: string | null; quantity: number; amount: number; line_type: string }
interface PosBucket { key: string; session: string; tender: 'cash' | 'card'; bookings: number; items: number; amount: number }
type DriverView = 'active' | 'archive';
// Teacher market reports have a 2nd axis: day-by-day vs month aggregate (the monthly is the Zoho/payment unit).
type Gran = 'day' | 'month';

interface MonthGroup { key: string; label: string; runs: MarketRunRow[]; total: number; days: number; archived: boolean; }
const monthStartEnd = (key: string): { start: string; end: string } => {
    const [y, m] = key.split('-').map(Number);
    const start = `${key}-01`;
    const end = new Date(Date.UTC(y, m, 0)).toISOString().split('T')[0]; // last day of month
    return { start, end };
};

// Kitchen (teacher) and Logistic share market_runs — identical report, only shopper_role differs.
const isMarketType = (t: ReportType): t is 'market_teacher' | 'market_logistic' => t === 'market_teacher' || t === 'market_logistic';
const marketScope = (t: ReportType): 'teacher' | 'logistics' => (t === 'market_teacher' ? 'teacher' : 'logistics');

interface PayoutRow { run_date: string; session_id: string; total_stops: number; total_pax: number; payout_amount: number; status: string | null; zoho_expense_id: string | null; }
interface WeekGroup { key: string; start: Date; end: Date; endISO: string; rows: PayoutRow[]; total: number; pendingCount: number; fullyPaid: boolean; billed: boolean; archived: boolean; }
interface DriverReport { id: string; name: string; avatar: string | null; weeks: WeekGroup[] }

interface MarketItem { id?: string; name?: string; unit?: string; quantity?: number; price?: number; actual_price?: number; }
interface MarketRunRow { id: string; run_date: string; status: string; total_cost: number; items: MarketItem[]; archived: boolean; shopper: string | null; /* authors.name via worker_id */ }
// A logistics run leaves "In progress" and enters "Archive" once it is expensed.
const isRunArchived = (status: string) => status === 'expensed';

// --- Agency reports ---
// CENTER column resolution: single bookings · week · month. A unit is "invoiced" (archive) when its booking(s) carry zoho_invoice_id.
type AgencyGran = 'single' | 'week' | 'month';
interface BookingRow {
    internal_id: string; booking_date: string; session_id: string | null; status: string | null;
    pax_count: number; visitor_count: number | null; total_price: number; commission_amount: number;
    applied_commission_rate: number | null; payment_method: string | null; payment_status: string | null;
    zoho_invoice_id: string | null; guest_name: string | null; guest_email: string | null;
    booking_ref: string | null; hotel_name: string | null; agency_note: string | null; special_requests: string | null;
}
interface AgencyPeriod { key: string; label: string; start: string; end: string; bookings: BookingRow[]; count: number; pax: number; gross: number; commission: number; net: number; invoiced: boolean; }
interface AgencyReport { id: string; name: string; avatar: string | null; bookings: BookingRow[]; totalPax: number; autoInvoice: boolean; }
interface AgencyInvoiceRow { id: string; agency_id: string; zoho_invoice_number: string | null; amount: number; status: string; payment_proof_url: string | null; booking_ids: string[]; created_at: string; }
const monthOrWeekKey = (dateISO: string, gran: AgencyGran): string =>
    gran === 'month' ? dateISO.slice(0, 7) : isoDate(mondayOf(new Date(dateISO + 'T00:00:00')));

const SESSION_LABEL: Record<string, string> = { morning_class: 'Morning', evening_class: 'Evening' };
const cap = (s: string): string => (s ? s.charAt(0).toUpperCase() + s.slice(1) : s);
// Driver payout tiers depend only on the stops band; map band → representative stop count for the RPC.
type StopsRange = '1-2' | '3-4' | '5-6' | '7plus';
const STOPS_REP: Record<StopsRange, number> = { '1-2': 2, '3-4': 4, '5-6': 6, '7plus': 7 };
const STOPS_RANGES: StopsRange[] = ['1-2', '3-4', '5-6', '7plus'];
const rangeOfStops = (n: number): StopsRange => (n <= 2 ? '1-2' : n <= 4 ? '3-4' : n <= 6 ? '5-6' : '7plus');
function mondayOf(d: Date): Date { const day = (d.getDay() + 6) % 7; const m = new Date(d); m.setDate(d.getDate() - day); m.setHours(0, 0, 0, 0); return m; }
const isoDate = (d: Date) => new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().split('T')[0];
const fmtRange = (a: Date, b: Date) => `${a.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })} – ${b.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}`;

const Avatar: React.FC<{ src: string | null; name: string; className?: string; textClassName?: string }> = ({ src, name, className = 'size-[72px]', textClassName = 'text-xl' }) => (
    src
        ? <img src={src} alt={name} className={cn(className, 'rounded-full object-cover shrink-0 border border-gray-200 dark:border-gray-700')} />
        : <span className={cn(className, textClassName, 'rounded-full bg-primary-50 dark:bg-primary-500/10 text-primary-600 dark:text-primary-400 flex items-center justify-center font-black shrink-0')}>{name.charAt(0).toUpperCase()}</span>
);

const DriverHeading: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <span className="text-xl font-bold text-gray-900 dark:text-white truncate">{children}</span>
);

const ManagerReports: React.FC = () => {
    const { t } = useTranslation('manager');
    const navigate = useNavigate();
    usePageMetadata('manager-reports');
    const [reportType, setReportType] = useState<ReportType>('driver');
    const [view, setView] = useState<DriverView>('active');
    const [archiveDriverId, setArchiveDriverId] = useState('');

    const [reports, setReports] = useState<DriverReport[] | null>(null);
    const [marketRuns, setMarketRuns] = useState<MarketRunRow[] | null>(null);
    const [selected, setSelected] = useState<{ driverId: string; weekKey: string } | null>(null);
    const [selectedRunId, setSelectedRunId] = useState<string | null>(null);
    // Teacher day/month axis + selected month (YYYY-MM).
    const [gran, setGran] = useState<Gran>('day');
    const [selectedMonth, setSelectedMonth] = useState<string | null>(null);
    const [busy, setBusy] = useState(false);
    const [reportBusy, setReportBusy] = useState(false);
    const [invoiceBusy, setInvoiceBusy] = useState(false);
    // Inline edit of a single driver day-entry (manager-scoped RPCs).
    const [editing, setEditing] = useState<{ driverId: string; run_date: string; session_id: string; range: StopsRange; pax: string } | null>(null);
    // Agency reports: search + single/week/month axis. Accordion (one open agency) + multi-select of cards (unify report/invoice).
    const [agencyReports, setAgencyReports] = useState<AgencyReport[] | null>(null);
    const [agencyGran, setAgencyGran] = useState<AgencyGran>('month');
    const [agencySearch, setAgencySearch] = useState('');
    const [expandedAgency, setExpandedAgency] = useState<string | null>(null);
    const [agencyInvoices, setAgencyInvoices] = useState<AgencyInvoiceRow[]>([]);
    const [selectedKeys, setSelectedKeys] = useState<string[]>([]);
    const clearAgencySel = () => { setSelectedKeys([]); };
    const toggleAgency = (id: string) => { setExpandedAgency(prev => prev === id ? null : id); setSelectedKeys([]); };
    const toggleKey = (k: string) => setSelectedKeys(prev => prev.includes(k) ? prev.filter(x => x !== k) : [...prev, k]);
    // POS Classes: giorno selezionato + righe del giorno (RPC) + busy.
    const [posDay, setPosDay] = useState(() => new Date().toISOString().split('T')[0]);
    const [posRows, setPosRows] = useState<PosRow[] | null>(null);
    const [posBusy, setPosBusy] = useState(false);

    // Fetch all drivers (so every driver is exposed) + all payouts, then merge.
    const fetchAll = useCallback(async () => {
        setReports(null);
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

        const result: DriverReport[] = ((drvData as Array<{ id: string; full_name: string; avatar_url: string | null }>) ?? []).map(d => {
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
        setReports(result);
    }, []);

    // Market runs (1 run = 1 report) for kitchen (teacher) or logistics. Archive = status 'expensed'.
    const fetchMarket = useCallback(async (scope: 'teacher' | 'logistics') => {
        setMarketRuns(null);
        const { data } = await supabase
            .from('market_runs')
            .select('id, run_date, status, total_cost, items_snapshot, worker:authors!worker_id(name)')
            .eq('shopper_role', scope)
            .order('run_date', { ascending: false });
        type Row = { id: string; run_date: string; status: string; total_cost: number; items_snapshot: unknown; worker: { name: string | null } | { name: string | null }[] | null };
        const rows: MarketRunRow[] = ((data as unknown as Row[]) ?? []).map(r => ({
            id: r.id, run_date: r.run_date, status: r.status, total_cost: Number(r.total_cost) || 0,
            items: Array.isArray(r.items_snapshot) ? (r.items_snapshot as MarketItem[]) : [],
            archived: isRunArchived(r.status),
            shopper: (Array.isArray(r.worker) ? r.worker[0]?.name : r.worker?.name) ?? null,
        }));
        setMarketRuns(rows);
    }, []);

    // Agencies + all their bookings. (Hundreds of agencies/bookings: fetched once, grouped client-side;
    // the center list is searchable. For 1000s, switch to server-side search/pagination later.)
    const fetchAgencies = useCallback(async () => {
        setAgencyReports(null);
        const [{ data: agData }, { data: bkData }, { data: invData }] = await Promise.all([
            supabase.from('profiles').select('id, agency_company_name, full_name, avatar_url, auto_invoice').eq('role', 'agency').order('agency_company_name'),
            supabase.from('bookings').select('user_id, internal_id, booking_date, session_id, status, pax_count, visitor_count, total_price, commission_amount, applied_commission_rate, payment_method, payment_status, zoho_invoice_id, guest_name, guest_email, booking_ref, hotel_name, agency_note, special_requests').order('booking_date', { ascending: false }),
            supabase.from('agency_invoices').select('id, agency_id, zoho_invoice_number, amount, status, payment_proof_url, booking_ids, created_at').order('created_at', { ascending: false }),
        ]);
        setAgencyInvoices((invData as AgencyInvoiceRow[]) ?? []);
        const byAg = new Map<string, BookingRow[]>();
        for (const b of (bkData as Array<BookingRow & { user_id: string }>) ?? []) {
            const arr = byAg.get(b.user_id) ?? []; arr.push(b); byAg.set(b.user_id, arr);
        }
        const result: AgencyReport[] = ((agData as Array<{ id: string; agency_company_name: string | null; full_name: string | null; avatar_url: string | null; auto_invoice: boolean | null }>) ?? []).map(a => {
            const bks = byAg.get(a.id) ?? [];
            return { id: a.id, name: a.agency_company_name || a.full_name || 'Agency', avatar: a.avatar_url, bookings: bks, totalPax: bks.reduce((s, b) => s + (b.pax_count || 0), 0), autoInvoice: a.auto_invoice ?? false };
        });
        setAgencyReports(result);
    }, []);

    // POS Classes: righe del giorno (gruppi incassati on-arrival, non ancora fatturati).
    const fetchPosDay = useCallback(async () => {
        setPosRows(null);
        const { data } = await supabase.rpc('get_pos_daily_invoice' as never, { p_day: posDay } as never);
        setPosRows((data as unknown as PosRow[]) ?? []);
    }, [posDay]);

    useEffect(() => {
        if (reportType === 'driver') fetchAll();
        else if (isMarketType(reportType)) fetchMarket(marketScope(reportType));
        else if (reportType === 'agency') fetchAgencies();
        else if (reportType === 'classes') fetchPosDay();
    }, [reportType, fetchAll, fetchMarket, fetchAgencies, fetchPosDay]);

    // 4 bucket sessione × tender (con conteggi e importo base).
    const posBuckets = useMemo<PosBucket[]>(() => {
        if (!posRows) return [];
        const m = new Map<string, PosBucket & { _bk: Set<string> }>();
        for (const r of posRows) {
            const key = `${r.session}|${r.tender}`;
            let g = m.get(key);
            if (!g) { g = { key, session: r.session, tender: r.tender, bookings: 0, items: 0, amount: 0, _bk: new Set() }; m.set(key, g); }
            g._bk.add(r.booking_id);
            g.items += Number(r.quantity) || 0;
            g.amount += Number(r.amount) || 0;
        }
        return Array.from(m.values()).map(g => ({ ...g, bookings: g._bk.size }))
            .sort((a, b) => (a.session === b.session ? a.tender.localeCompare(b.tender) : a.session.localeCompare(b.session)));
    }, [posRows]);

    // Genera le (fino a 4) fatture POS del giorno in Zoho.
    const handlePosInvoices = async () => {
        if (posBusy || posBuckets.length === 0) return;
        if (!window.confirm(t('reports.confirmPosInvoices', { defaultValue: 'Generate the POS invoices (cash/card · morning/evening) for {{day}}?', day: posDay }))) return;
        setPosBusy(true);
        try {
            const { data, error } = await supabase.functions.invoke('zoho-create-pos-invoice', { body: { day: posDay } });
            if (error) throw error;
            const res = data as { success: boolean; skipped?: boolean; message?: string; invoices?: Array<{ invoice_number?: string }> };
            if (!res.success) throw new Error(res.message || 'Failed');
            await fetchPosDay();
            alert(res.skipped ? t('reports.posNothing', { defaultValue: 'Nothing to invoice for this day.' })
                : t('reports.posOk', { defaultValue: '{{n}} invoice(s) created in Zoho.', n: res.invoices?.length ?? 0 }));
        } catch (err) {
            alert(t('driverPayouts.errorGeneric', { defaultValue: 'Error' }) + ': ' + (err instanceof Error ? err.message : ''));
        } finally { setPosBusy(false); }
    };

    const selDriver = selected ? reports?.find(d => d.id === selected.driverId) ?? null : null;
    const week = selDriver?.weeks.find(w => w.key === selected?.weekKey) ?? null;
    const selRun = selectedRunId ? marketRuns?.find(r => r.id === selectedRunId) ?? null : null;

    // Group each agency's bookings into periods (week|month). A period is "invoiced" when ALL bookings have zoho_invoice_id.
    const periodsByAgency = useMemo<Map<string, AgencyPeriod[]>>(() => {
        const map = new Map<string, AgencyPeriod[]>();
        if (!agencyReports || agencyGran === 'single') return map; // single mode uses bookings directly
        for (const ag of agencyReports) {
            const pmap = new Map<string, BookingRow[]>();
            for (const b of ag.bookings) {
                if (!b.booking_date) continue;
                const key = monthOrWeekKey(b.booking_date, agencyGran);
                const arr = pmap.get(key) ?? []; arr.push(b); pmap.set(key, arr);
            }
            const periods: AgencyPeriod[] = Array.from(pmap.entries()).sort((a, b) => b[0].localeCompare(a[0])).map(([key, bks]) => {
                // total_price È GIÀ il net (gross − commission, scritto da AgencyBooking). gross è derivato.
                const net = bks.reduce((s, b) => s + Number(b.total_price || 0), 0);
                const commission = bks.reduce((s, b) => s + Number(b.commission_amount || 0), 0);
                const gross = net + commission;
                const pax = bks.reduce((s, b) => s + (b.pax_count || 0), 0);
                let start: string, end: string, label: string;
                if (agencyGran === 'month') { const se = monthStartEnd(key); start = se.start; end = se.end; label = new Date(key + '-01T00:00:00').toLocaleDateString('en-GB', { month: 'long', year: 'numeric' }); }
                else { const s = new Date(key + 'T00:00:00'); const e = new Date(s); e.setDate(s.getDate() + 6); start = key; end = isoDate(e); label = fmtRange(s, e); }
                return { key, label, start, end, bookings: bks.slice().sort((a, b) => b.booking_date.localeCompare(a.booking_date)), count: bks.length, pax, gross, commission, net, invoiced: bks.length > 0 && bks.every(b => !!b.zoho_invoice_id) };
            });
            map.set(ag.id, periods);
        }
        return map;
    }, [agencyReports, agencyGran]);

    const filteredAgencies = useMemo(() => {
        if (!agencyReports) return null;
        const q = agencySearch.trim().toLowerCase();
        return q ? agencyReports.filter(a => a.name.toLowerCase().includes(q)) : agencyReports;
    }, [agencyReports, agencySearch]);

    const expAgency = expandedAgency ? agencyReports?.find(a => a.id === expandedAgency) ?? null : null;
    // Bookings behind the current multi-selection (single: by internal_id · week/month: union of selected periods).
    const selectedBookings = useMemo<BookingRow[]>(() => {
        if (!expAgency || selectedKeys.length === 0) return [];
        const set = new Set(selectedKeys);
        if (agencyGran === 'single') return expAgency.bookings.filter(b => set.has(b.internal_id));
        return (periodsByAgency.get(expAgency.id) ?? []).filter(p => set.has(p.key)).flatMap(p => p.bookings);
    }, [expAgency, selectedKeys, agencyGran, periodsByAgency]);
    const selTotals = useMemo(() => {
        // total_price È GIÀ il net; gross = net + commission.
        const net = selectedBookings.reduce((s, b) => s + Number(b.total_price || 0), 0);
        const commission = selectedBookings.reduce((s, b) => s + Number(b.commission_amount || 0), 0);
        const pax = selectedBookings.reduce((s, b) => s + (b.pax_count || 0), 0);
        return { gross: net + commission, commission, net, pax, count: selectedBookings.length };
    }, [selectedBookings]);

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
    const handleMonthlyReport = async (mg: MonthGroup, mode: 'print' | 'download') => {
        if (reportBusy) return;
        setReportBusy(true);
        try {
            const { start, end } = monthStartEnd(mg.key);
            const { data, error } = await supabase.functions.invoke('render-report', {
                body: { report: 'market_monthly', month_start: start, month_end: end },
            });
            if (error) throw error;
            const url = URL.createObjectURL(data as Blob);
            if (mode === 'download') {
                const a = document.createElement('a'); a.href = url; a.download = `ThaiAkha_Market_Kitchen_Monthly_${mg.key}.pdf`;
                document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(url), 4000);
            } else {
                const iframe = document.createElement('iframe'); iframe.style.cssText = 'position:fixed;right:0;bottom:0;width:0;height:0;border:0;'; iframe.src = url;
                iframe.onload = () => { iframe.contentWindow?.focus(); iframe.contentWindow?.print(); };
                document.body.appendChild(iframe); setTimeout(() => { iframe.remove(); URL.revokeObjectURL(url); }, 60000);
            }
        } catch (err) {
            alert(t('driverPayouts.errorReport', { defaultValue: 'Report error' }) + ': ' + (err instanceof Error ? err.message : ''));
        } finally { setReportBusy(false); }
    };

    // Drill from a month's day list into that day's ingredient detail.
    const openDayFromMonth = (runId: string) => { setSelectedRunId(runId); setGran('day'); };

    const handleRunReport = async (run: MarketRunRow, mode: 'print' | 'download') => {
        if (reportBusy) return;
        setReportBusy(true);
        try {
            const { data, error } = await supabase.functions.invoke('render-report', {
                body: { report: 'market_run', run_id: run.id },
            });
            if (error) throw error;
            const url = URL.createObjectURL(data as Blob);
            if (mode === 'download') {
                const a = document.createElement('a'); a.href = url; a.download = `ThaiAkha_Market_${reportType === 'market_teacher' ? 'Kitchen' : 'Logistics'}_${run.run_date}.pdf`;
                document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(url), 4000);
            } else {
                const iframe = document.createElement('iframe'); iframe.style.cssText = 'position:fixed;right:0;bottom:0;width:0;height:0;border:0;'; iframe.src = url;
                iframe.onload = () => { iframe.contentWindow?.focus(); iframe.contentWindow?.print(); };
                document.body.appendChild(iframe); setTimeout(() => { iframe.remove(); URL.revokeObjectURL(url); }, 60000);
            }
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
        if (busy) return;
        if (!window.confirm(t('reports.confirmDeleteRun', { defaultValue: 'Delete this report? This cannot be undone.' }))) return;
        setBusy(true);
        try {
            const { error } = await supabase.from('market_runs').delete().eq('id', run.id);
            if (error) throw error;
            setSelectedRunId(null);
            await fetchMarket(marketScope(reportType));
        } catch (err) {
            alert(t('driverPayouts.errorGeneric', { defaultValue: 'Error' }) + ': ' + (err instanceof Error ? err.message : ''));
        } finally { setBusy(false); }
    };

    const handleReport = async (driverId: string, driverName: string, w: WeekGroup, mode: 'print' | 'download') => {
        if (reportBusy) return;
        setReportBusy(true);
        try {
            const { data, error } = await supabase.functions.invoke('render-report', {
                body: { report: 'driver_report', driver_id: driverId, week_start: w.key, week_end: w.endISO, format: 'A5' },
            });
            if (error) throw error;
            const url = URL.createObjectURL(data as Blob);
            if (mode === 'download') {
                const a = document.createElement('a'); a.href = url; a.download = `ThaiAkha_Driver_${driverName.replace(/\s+/g, '')}_${w.key}.pdf`;
                document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(url), 4000);
            } else {
                const iframe = document.createElement('iframe'); iframe.style.cssText = 'position:fixed;right:0;bottom:0;width:0;height:0;border:0;'; iframe.src = url;
                iframe.onload = () => { iframe.contentWindow?.focus(); iframe.contentWindow?.print(); };
                document.body.appendChild(iframe); setTimeout(() => { iframe.remove(); URL.revokeObjectURL(url); }, 60000);
            }
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

    // BYPASS-PAYOUT — crea l'Expense Zoho per un market run (per ora SOLO logistics, 1 Expense/run).
    // Gemello di handlePayBill: invoke zoho-create-market-expense (canale staff JWT) → write-back status=expensed → archivio.
    const handleMarketExpense = async (run: MarketRunRow) => {
        if (busy) return;
        // Guardia: una lista 'planned' (bozza non confermata) non si fattura.
        if (run.status === 'planned') return;
        if (!window.confirm(t('reports.confirmExpense', { defaultValue: 'Create the Zoho expense for this report?' }))) return;
        setBusy(true);
        try {
            const { data, error } = await supabase.functions.invoke('zoho-create-market-expense', {
                body: { stream: 'logistics', run_ids: [run.id] },
            });
            if (error) {
                let detail = error.message;
                const ctx = (error as { context?: { json?: () => Promise<{ message?: string }> } }).context;
                if (ctx?.json) { try { detail = (await ctx.json())?.message ?? detail; } catch { /* ignore */ } }
                throw new Error(detail);
            }
            const res = data as { success: boolean; skipped?: boolean; zoho_expense_id?: string; message?: string };
            if (!res?.success) throw new Error(res?.message ?? 'Zoho error');
            alert(res.skipped
                ? t('reports.expenseSkipped', { defaultValue: 'Already expensed in Zoho.' })
                : t('reports.expenseOk', { defaultValue: 'Expense created in Zoho — moved to archive.' }));
            setSelectedRunId(null);
            await fetchMarket(marketScope(reportType));
        } catch (err) {
            alert(t('driverPayouts.errorGeneric', { defaultValue: 'Error' }) + ': ' + (err instanceof Error ? err.message : ''));
        } finally { setBusy(false); }
    };

    // BYPASS-PAYOUT — Expense Zoho MENSILE per kitchen (teacher): 1 Expense/mese sommando i run
    // del mese (esclude i draft 'planned'). period_start/end = 1°→ultimo del mese (monthStartEnd).
    const handleMonthlyExpense = async (mg: MonthGroup) => {
        if (busy) return;
        if (!window.confirm(t('reports.confirmExpenseMonth', { defaultValue: 'Create the monthly Zoho expense for this report?' }))) return;
        setBusy(true);
        try {
            const { start, end } = monthStartEnd(mg.key);
            const { data, error } = await supabase.functions.invoke('zoho-create-market-expense', {
                body: { stream: 'teacher', period_start: start, period_end: end },
            });
            if (error) {
                let detail = error.message;
                const ctx = (error as { context?: { json?: () => Promise<{ message?: string }> } }).context;
                if (ctx?.json) { try { detail = (await ctx.json())?.message ?? detail; } catch { /* ignore */ } }
                throw new Error(detail);
            }
            const res = data as { success: boolean; skipped?: boolean; zoho_expense_id?: string; message?: string };
            if (!res?.success) throw new Error(res?.message ?? 'Zoho error');
            alert(res.skipped
                ? t('reports.expenseSkipped', { defaultValue: 'Already expensed in Zoho.' })
                : t('reports.expenseOk', { defaultValue: 'Expense created in Zoho — moved to archive.' }));
            setSelectedMonth(null);
            await fetchMarket(marketScope(reportType));
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

    // Agency period report (PDF) — render-report 'agency_report'.
    // Combined report over the current multi-selection (non-contiguous): renders by booking_ids[].
    const handleAgencyReport = async (mode: 'print' | 'download') => {
        if (reportBusy || !expAgency || selectedBookings.length === 0) return;
        setReportBusy(true);
        try {
            const { data, error } = await supabase.functions.invoke('render-report', {
                body: { report: 'agency_report', agency_id: expAgency.id, booking_ids: selectedBookings.map(b => b.internal_id) },
            });
            if (error) throw error;
            const url = URL.createObjectURL(data as Blob);
            if (mode === 'download') {
                const a = document.createElement('a'); a.href = url; a.download = `ThaiAkha_Agency_${expAgency.name.replace(/\s+/g, '')}_${selectedBookings.length}bk.pdf`;
                document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(url), 4000);
            } else {
                const iframe = document.createElement('iframe'); iframe.style.cssText = 'position:fixed;right:0;bottom:0;width:0;height:0;border:0;'; iframe.src = url;
                iframe.onload = () => { iframe.contentWindow?.focus(); iframe.contentWindow?.print(); };
                document.body.appendChild(iframe); setTimeout(() => { iframe.remove(); URL.revokeObjectURL(url); }, 60000);
            }
        } catch (err) {
            alert(t('driverPayouts.errorReport', { defaultValue: 'Report error' }) + ': ' + (err instanceof Error ? err.message : ''));
        } finally { setReportBusy(false); }
    };

    // Crea UNA fattura Zoho per la selezione corrente (non auto: parte solo dal click + conferma).
    const handleAgencyInvoice = async () => {
        if (invoiceBusy || !expAgency || selectedBookings.length === 0) return;
        if (!window.confirm(t('reports.confirmInvoice', { defaultValue: 'Create a Zoho invoice for {{n}} booking(s) — net {{net}} THB?', n: selTotals.count, net: selTotals.net.toLocaleString() }))) return;
        setInvoiceBusy(true);
        try {
            const { data, error } = await supabase.functions.invoke('zoho-create-agency-invoice', {
                body: { agency_id: expAgency.id, booking_ids: selectedBookings.map(b => b.internal_id) },
            });
            if (error) throw error;
            const res = data as { success: boolean; message?: string; invoice_number?: string; skipped?: string[] };
            if (!res.success) throw new Error(res.message || 'Invoice failed');
            clearAgencySel();
            await fetchAgencies();
            alert(t('reports.invoiceOk', { defaultValue: 'Invoice {{num}} created in Zoho.', num: res.invoice_number || '' }) + (res.skipped?.length ? `\n${res.skipped.length} skipped (not billable).` : ''));
        } catch (err) {
            alert(t('driverPayouts.errorGeneric', { defaultValue: 'Error' }) + ': ' + (err instanceof Error ? err.message : ''));
        } finally { setInvoiceBusy(false); }
    };

    // Fatture "dichiarate pagate" per agenzia → il manager le conferma (→ pagamento Zoho).
    const declaredByAgency = useMemo(() => {
        const m = new Map<string, AgencyInvoiceRow[]>();
        for (const inv of agencyInvoices) {
            if (inv.status !== 'declared') continue;
            const arr = m.get(inv.agency_id) ?? []; arr.push(inv); m.set(inv.agency_id, arr);
        }
        return m;
    }, [agencyInvoices]);

    const handleConfirmPayment = async (invoiceIds: string[]) => {
        if (invoiceBusy || invoiceIds.length === 0) return;
        if (!window.confirm(t('reports.confirmPayment', { defaultValue: 'Confirm payment received for {{n}} invoice(s)? Records the payment in Zoho.', n: invoiceIds.length }))) return;
        setInvoiceBusy(true);
        try {
            const { data, error } = await supabase.functions.invoke('zoho-record-agency-payment', { body: { invoice_ids: invoiceIds } });
            if (error) throw error;
            if (!(data as { success?: boolean })?.success) throw new Error((data as { message?: string })?.message || 'Failed');
            await fetchAgencies();
            alert(t('reports.paymentOk', { defaultValue: 'Payment recorded — invoice marked paid in Zoho.' }));
        } catch (err) {
            alert(t('driverPayouts.errorGeneric', { defaultValue: 'Error' }) + ': ' + (err instanceof Error ? err.message : ''));
        } finally { setInvoiceBusy(false); }
    };
    const viewProof = async (path: string) => {
        const { data } = await supabase.storage.from('payment-proofs').createSignedUrl(path, 120);
        if (data?.signedUrl) window.open(data.signedUrl, '_blank');
    };
    // Switch fatturazione automatica per agenzia (policy manager)
    const handleToggleAuto = async (agencyId: string, value: boolean) => {
        try {
            const { data, error } = await supabase.rpc('set_agency_auto_invoice', { p_agency_id: agencyId, p_value: value });
            if (error) throw error;
            if (!(data as { success?: boolean })?.success) throw new Error((data as { message?: string })?.message || 'Failed');
            setAgencyReports(prev => prev ? prev.map(a => a.id === agencyId ? { ...a, autoInvoice: value } : a) : prev);
        } catch (err) {
            alert(t('driverPayouts.errorGeneric', { defaultValue: 'Error' }) + ': ' + (err instanceof Error ? err.message : ''));
        }
    };

    // --- Sidebar: report types ---
    const TYPES: { id: ReportType; label: string; icon: React.ReactNode; enabled: boolean }[] = [
        { id: 'driver', label: t('reports.typeDriver', { defaultValue: 'Driver' }), icon: <Truck className="w-5 h-5" />, enabled: true },
        { id: 'market_teacher', label: t('reports.typeTeacher', { defaultValue: 'Market · Kitchen' }), icon: <GraduationCap className="w-5 h-5" />, enabled: true },
        { id: 'market_logistic', label: t('reports.typeLogistic', { defaultValue: 'Market · Logistic' }), icon: <Package className="w-5 h-5" />, enabled: true },
        { id: 'agency', label: t('reports.typeAgency', { defaultValue: 'Agency bookings' }), icon: <Briefcase className="w-5 h-5" />, enabled: true },
        { id: 'classes', label: t('reports.typeClasses', { defaultValue: 'Classes' }), icon: <GraduationCap className="w-5 h-5" />, enabled: true },
        { id: 'salary', label: t('reports.typeSalary', { defaultValue: 'Salary' }), icon: <Wallet className="w-5 h-5" />, enabled: true },
    ];
    const sidebarItems = TYPES.map(ty => ({
        id: ty.id, label: ty.label, icon: ty.icon,
        ...(ty.enabled ? {} : { badgeType: 'outline' as const, badgeValue: t('reports.soon', { defaultValue: 'soon' }) }),
    }));

    const archiveDriver = useMemo(() => reports?.find(d => d.id === archiveDriverId) ?? null, [reports, archiveDriverId]);

    const renderRunCard = (r: MarketRunRow) => (
        <ReportListCard
            key={r.id}
            selected={selectedRunId === r.id}
            onClick={(e) => { e.stopPropagation(); setSelectedRunId(r.id); }}
            title={new Date(r.run_date + 'T00:00:00').toLocaleDateString('en-GB', { weekday: 'short', day: '2-digit', month: 'short', year: 'numeric' })}
            amount={r.total_cost.toLocaleString()}
            meta={<>
                <span className="text-xs font-bold uppercase tracking-wider text-gray-400">{r.items.length} items</span>
                {r.shopper && <span className="text-xs font-bold text-gray-500 dark:text-gray-400 truncate">· {r.shopper}</span>}
                <ReportStatusBadge tone={r.archived ? 'green' : 'amber'}>{r.status}</ReportStatusBadge>
            </>}
        />
    );

    const renderMonthCard = (mg: MonthGroup) => (
        <ReportListCard
            key={mg.key}
            selected={selectedMonth === mg.key}
            onClick={(e) => { e.stopPropagation(); setSelectedRunId(null); setSelectedMonth(mg.key); }}
            title={mg.label}
            amount={mg.total.toLocaleString()}
            meta={<>
                <span className="text-xs font-bold uppercase tracking-wider text-gray-400">{mg.days} {t('reports.days', { defaultValue: 'days' })}</span>
                <ReportStatusBadge tone={mg.archived ? 'green' : 'amber'}>{mg.archived ? t('reports.expensed', { defaultValue: 'Expensed' }) : t('reports.open', { defaultValue: 'Open' })}</ReportStatusBadge>
            </>}
        />
    );

    const marketEmpty = (
        <div className="h-full flex flex-col items-center justify-center text-gray-400 gap-3 py-20">
            {view === 'active' ? <Clock className="w-10 h-10 opacity-40" /> : <Archive className="w-10 h-10 opacity-40" />}
            <SectionTitle className="text-gray-400">{view === 'active' ? t('reports.nothingPending', { defaultValue: 'Nothing in progress.' }) : t('reports.noArchive', { defaultValue: 'No archived reports.' })}</SectionTitle>
        </div>
    );

    const renderWeekCard = (d: DriverReport, w: WeekGroup) => (
        <ReportListCard
            key={w.key}
            selected={selected?.driverId === d.id && selected?.weekKey === w.key}
            onClick={(e) => { e.stopPropagation(); setEditing(null); setSelected({ driverId: d.id, weekKey: w.key }); }}
            title={fmtRange(w.start, w.end)}
            amount={w.total.toLocaleString()}
            meta={<>
                <span className="text-xs font-bold uppercase tracking-wider text-gray-400">{w.rows.length} runs</span>
                <ReportStatusBadge tone={w.archived ? 'green' : w.fullyPaid ? 'blue' : 'amber'}>
                    {w.archived ? t('driverPayouts.billed', { defaultValue: 'Billed' }) : w.fullyPaid ? t('driverPayouts.paid', { defaultValue: 'Paid' }) : `${w.pendingCount} ${t('driverPayouts.pending', { defaultValue: 'pending' })}`}
                </ReportStatusBadge>
            </>}
        />
    );

    // Label/value row for the single-booking detail.
    const kv = (label: string, value: React.ReactNode) => value ? (
        <div className="flex justify-between gap-4 py-1.5 border-b border-gray-100 dark:border-gray-800 last:border-0">
            <span className="text-sm text-gray-400 shrink-0">{label}</span>
            <span className="text-sm font-bold text-gray-800 dark:text-gray-100 text-right">{value}</span>
        </div>
    ) : null;

    // Multi-select cards (click toggles selection; many can be active to unify report/invoice).
    const renderPeriodCard = (p: AgencyPeriod) => (
        <ReportListCard
            key={p.key}
            selected={selectedKeys.includes(p.key)}
            onClick={(e) => { e.stopPropagation(); toggleKey(p.key); }}
            title={p.label}
            amount={p.net.toLocaleString()}
            meta={<>
                <span className="text-xs font-bold uppercase tracking-wider text-gray-400">{p.count} {t('reports.bookingsShort', { defaultValue: 'bookings' })} · {p.pax} pax</span>
                <ReportStatusBadge tone={p.invoiced ? 'green' : 'amber'}>{p.invoiced ? t('reports.invoiced', { defaultValue: 'Invoiced' }) : t('reports.toInvoice', { defaultValue: 'To invoice' })}</ReportStatusBadge>
            </>}
        />
    );
    const renderBookingCard = (b: BookingRow) => {
        const net = Number(b.total_price || 0); // total_price È GIÀ il net
        return (
            <ReportListCard
                key={b.internal_id}
                selected={selectedKeys.includes(b.internal_id)}
                onClick={(e) => { e.stopPropagation(); toggleKey(b.internal_id); }}
                title={`${new Date(b.booking_date + 'T00:00:00').toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })} · ${b.guest_name || b.booking_ref || '—'}`}
                amount={net.toLocaleString()}
                meta={<>
                    <span className="text-xs font-bold uppercase tracking-wider text-gray-400">{SESSION_LABEL[b.session_id ?? ''] ?? b.session_id ?? ''} · {b.pax_count} pax</span>
                    <ReportStatusBadge tone={b.zoho_invoice_id ? 'green' : 'amber'}>{b.zoho_invoice_id ? t('reports.invoiced', { defaultValue: 'Invoiced' }) : t('reports.toInvoice', { defaultValue: 'To invoice' })}</ReportStatusBadge>
                </>}
            />
        );
    };
    const agencyEmpty = (
        <div className="h-full flex flex-col items-center justify-center text-gray-400 gap-3 py-20">
            {view === 'active' ? <Clock className="w-10 h-10 opacity-40" /> : <Archive className="w-10 h-10 opacity-40" />}
            <SectionTitle className="text-gray-400">{view === 'active' ? t('reports.nothingPending', { defaultValue: 'Nothing in progress.' }) : t('reports.noArchive', { defaultValue: 'No archived reports.' })}</SectionTitle>
        </div>
    );

    return (
        <DataExplorerLayout
            viewMode="table"
            inspectorOpen={reportType === 'driver' || isMarketType(reportType) || reportType === 'agency'}
            onInspectorClose={() => { setSelected(null); setSelectedRunId(null); clearAgencySel(); }}
            sidebar={
                <DataExplorerSidebar
                    title={t('reports.title', { defaultValue: 'Reports' })}
                    titleIcon={<History className="w-5 h-5" />}
                    items={sidebarItems}
                    selectedId={reportType}
                    onSelect={(id) => { const ty = TYPES.find(x => x.id === id); if (ty?.enabled) { setReportType(id as ReportType); setSelected(null); setSelectedRunId(null); setSelectedMonth(null); setExpandedAgency(null); setSelectedKeys([]); setGran('day'); setView('active'); } }}
                />
            }
            toolbar={
                <div className="h-16 px-4 border-b border-gray-200 dark:border-gray-800 flex items-center gap-3 bg-gray-50/50 dark:bg-gray-900/50 shrink-0">
                    {(reportType === 'driver' || isMarketType(reportType)) && (
                        <>
                            {reportType === 'market_teacher' && (
                                <SegmentedToggle<Gran>
                                    value={gran}
                                    onChange={(g) => { setGran(g); setSelectedRunId(null); setSelectedMonth(null); }}
                                    options={[
                                        { id: 'day', label: t('reports.viewDay', { defaultValue: 'Day' }), icon: <Sunrise className="w-4 h-4" /> },
                                        { id: 'month', label: t('reports.viewMonth', { defaultValue: 'Month' }), icon: <CalendarRange className="w-4 h-4" /> },
                                    ]}
                                />
                            )}
                            <SegmentedToggle<DriverView>
                                value={view}
                                onChange={(v) => { setView(v); setSelected(null); setSelectedRunId(null); setSelectedMonth(null); }}
                                options={[
                                    { id: 'active', label: t('reports.viewActive', { defaultValue: 'In progress' }), icon: <Clock className="w-4 h-4" /> },
                                    { id: 'archive', label: t('reports.viewArchive', { defaultValue: 'Archive' }), icon: <Archive className="w-4 h-4" /> },
                                ]}
                            />
                            {reportType === 'driver' && view === 'archive' && reports && reports.length > 0 && (
                                <div className="w-56">
                                    <SelectField value={archiveDriverId} onChange={(e) => { setArchiveDriverId(e.target.value); setSelected(null); }}>
                                        <option value="">{t('reports.pickDriver', { defaultValue: 'Select a driver…' })}</option>
                                        {reports.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                                    </SelectField>
                                </div>
                            )}
                        </>
                    )}
                    {reportType === 'agency' && (
                        <>
                            <SegmentedToggle<AgencyGran>
                                value={agencyGran}
                                onChange={(g) => { setAgencyGran(g); clearAgencySel(); }}
                                options={[
                                    { id: 'single', label: t('reports.viewSingle', { defaultValue: 'Single' }), icon: <FileText className="w-4 h-4" /> },
                                    { id: 'week', label: t('reports.viewWeek', { defaultValue: 'Week' }), icon: <CalendarRange className="w-4 h-4" /> },
                                    { id: 'month', label: t('reports.viewMonth', { defaultValue: 'Month' }), icon: <CalendarRange className="w-4 h-4" /> },
                                ]}
                            />
                            <SegmentedToggle<DriverView>
                                value={view}
                                onChange={(v) => { setView(v); clearAgencySel(); }}
                                options={[
                                    { id: 'active', label: t('reports.viewActive', { defaultValue: 'In progress' }), icon: <Clock className="w-4 h-4" /> },
                                    { id: 'archive', label: t('reports.viewArchive', { defaultValue: 'Archive' }), icon: <Archive className="w-4 h-4" /> },
                                ]}
                            />
                            <div className="relative w-56">
                                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                                <input
                                    value={agencySearch}
                                    onChange={(e) => { setAgencySearch(e.target.value); clearAgencySel(); }}
                                    placeholder={t('reports.searchAgency', { defaultValue: 'Search agency…' })}
                                    className="w-full h-9 pl-9 pr-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-white placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
                                />
                            </div>
                        </>
                    )}
                    {reportType === 'classes' && (
                        <div className="flex items-center gap-2">
                            <span className="text-xs font-bold uppercase tracking-wider text-gray-400">{t('reports.day', { defaultValue: 'Day' })}</span>
                            <input
                                type="date"
                                value={posDay}
                                onChange={(e) => setPosDay(e.target.value)}
                                className="h-9 px-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
                            />
                        </div>
                    )}
                    <div className="flex-1" />
                </div>
            }
            inspector={
                <InspectorShell>
                    {reportType === 'market_teacher' && gran === 'month' ? (
                        selMonth ? (
                            <>
                                <InspectorHeader subtitle={t('reports.typeTeacher', { defaultValue: 'Market · Kitchen' })} title={selMonth.label} onClose={() => setSelectedMonth(null)} />
                                <InspectorBody className="p-4 space-y-2">
                                    {selMonth.runs.map(r => (
                                        <ReportLineRow
                                            key={r.id}
                                            title={new Date(r.run_date + 'T00:00:00').toLocaleDateString('en-GB', { weekday: 'short', day: '2-digit', month: 'short' })}
                                            subtitle={`${r.items.length} ${t('reports.items', { defaultValue: 'items' })}`}
                                            amount={r.total_cost.toLocaleString()}
                                            actions={
                                                <button aria-label="Open day" onClick={() => openDayFromMonth(r.id)} className="p-1.5 rounded-lg text-gray-400 hover:text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-500/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"><ChevronRight className="w-5 h-5" /></button>
                                            }
                                        />
                                    ))}
                                </InspectorBody>
                                <InspectorFooter className="pb-[80px]">
                                    <div className="flex justify-between items-end">
                                        <SectionTitle className="text-gray-400 mb-0">{t('driverPayouts.total', { defaultValue: 'Total' })}</SectionTitle>
                                        <span className="font-mono text-2xl font-black text-gray-900 dark:text-white">{selMonth.total.toLocaleString()} <span className="text-sm text-gray-400 font-normal">THB</span></span>
                                    </div>
                                    <div className="grid grid-cols-2 gap-2">
                                        <Button variant="outline" size="sm" disabled={reportBusy} startIcon={<Printer className="w-4 h-4" />} onClick={() => handleMonthlyReport(selMonth, 'print')}>{t('driverPayouts.print', { defaultValue: 'Print' })}</Button>
                                        <Button variant="outline" size="sm" disabled={reportBusy} startIcon={<Download className="w-4 h-4" />} onClick={() => handleMonthlyReport(selMonth, 'download')}>PDF</Button>
                                    </div>
                                    {!selMonth.archived && (
                                        <Button variant="primary" size="md" className="w-full justify-center" disabled={busy} startIcon={<Banknote className="w-4 h-4" />} onClick={() => handleMonthlyExpense(selMonth)}>
                                            {t('reports.createZohoExpenseMonth', { defaultValue: 'Create Zoho expense (monthly)' })}
                                        </Button>
                                    )}
                                </InspectorFooter>
                            </>
                        ) : (
                            <InspectorEmpty icon={<CalendarRange className="w-8 h-8" />} hint={t('reports.selectMonth', { defaultValue: 'Select a month to see its days.' })} />
                        )
                    ) : isMarketType(reportType) ? (
                        selRun ? (
                            <>
                                <InspectorHeader subtitle={`${reportType === 'market_teacher' ? t('reports.typeTeacher', { defaultValue: 'Market · Kitchen' }) : t('reports.typeLogistic', { defaultValue: 'Market · Logistic' })}${selRun.shopper ? ` · ${selRun.shopper}` : ''}`} title={new Date(selRun.run_date + 'T00:00:00').toLocaleDateString('en-GB', { weekday: 'short', day: '2-digit', month: 'short', year: 'numeric' })} onClose={() => setSelectedRunId(null)} />
                                <InspectorBody className="p-4 space-y-2">
                                    {selRun.items.length === 0 ? (
                                        <div className="text-sm text-gray-400 px-1">{t('reports.noItems', { defaultValue: 'No items.' })}</div>
                                    ) : selRun.items.map((it, i) => (
                                        <ReportLineRow
                                            key={it.id || i}
                                            title={it.name}
                                            subtitle={(it.quantity || it.unit) ? `${it.quantity ?? ''} ${it.unit ?? ''}` : undefined}
                                            amount={Number(it.actual_price ?? it.price ?? 0).toLocaleString()}
                                        />
                                    ))}
                                </InspectorBody>
                                <InspectorFooter className="pb-[80px]">
                                    <div className="flex justify-between items-end">
                                        <SectionTitle className="text-gray-400 mb-0">{t('driverPayouts.total', { defaultValue: 'Total' })}</SectionTitle>
                                        <span className="font-mono text-2xl font-black text-gray-900 dark:text-white">{selRun.total_cost.toLocaleString()} <span className="text-sm text-gray-400 font-normal">THB</span></span>
                                    </div>
                                    <div className="grid grid-cols-2 gap-2">
                                        <Button variant="outline" size="sm" disabled={reportBusy} startIcon={<Printer className="w-4 h-4" />} onClick={() => handleRunReport(selRun, 'print')}>{t('driverPayouts.print', { defaultValue: 'Print' })}</Button>
                                        <Button variant="outline" size="sm" disabled={reportBusy} startIcon={<Download className="w-4 h-4" />} onClick={() => handleRunReport(selRun, 'download')}>PDF</Button>
                                    </div>
                                    {!selRun.archived && (
                                        <>
                                            <div className="grid grid-cols-2 gap-2">
                                                <Button variant="outline" size="sm" disabled={busy} startIcon={<Pencil className="w-4 h-4" />} onClick={() => handleEditRun(selRun)}>{t('reports.editList', { defaultValue: 'Edit list' })}</Button>
                                                <button disabled={busy} onClick={() => handleDeleteRun(selRun)} className="inline-flex items-center justify-center gap-1.5 h-9 rounded-lg border border-red-200 dark:border-red-500/30 text-sm font-bold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500"><Trash2 className="w-4 h-4" /> {t('reports.delete', { defaultValue: 'Delete' })}</button>
                                            </div>
                                            {/* BYPASS-PAYOUT — Crea Zoho Expense: SOLO logistics, e SOLO se la lista è confermata (status != 'planned') */}
                                            {reportType === 'market_logistic' && (
                                                <>
                                                    <Button variant="primary" size="md" className="w-full justify-center" disabled={busy || selRun.status === 'planned'} startIcon={<Banknote className="w-4 h-4" />} onClick={() => handleMarketExpense(selRun)}>
                                                        {t('reports.createZohoExpense', { defaultValue: 'Create Zoho expense' })}
                                                    </Button>
                                                    {selRun.status === 'planned' && (
                                                        <p className="-mt-1 text-center text-xs font-bold text-amber-600 dark:text-amber-400">
                                                            {t('reports.confirmListFirst', { defaultValue: 'Confirm the list before billing in Zoho.' })}
                                                        </p>
                                                    )}
                                                </>
                                            )}
                                        </>
                                    )}
                                </InspectorFooter>
                            </>
                        ) : (
                            <InspectorEmpty icon={<History className="w-8 h-8" />} hint={t('reports.selectWeek', { defaultValue: 'Select a report to see the detail.' })} />
                        )
                    ) : reportType === 'agency' ? (
                        expAgency && selectedBookings.length > 0 ? (
                            <>
                                <InspectorHeader
                                    size="lg"
                                    leading={<Avatar src={expAgency.avatar} name={expAgency.name} className="size-12" textClassName="text-base" />}
                                    subtitle={expAgency.name}
                                    title={`${selTotals.count} ${t('reports.selected', { defaultValue: 'selected' })} · ${selTotals.pax} pax`}
                                    onClose={clearAgencySel}
                                />
                                {selectedBookings.length === 1 ? (
                                    // Dettaglio completo del singolo booking
                                    (() => {
                                        const b = selectedBookings[0];
                                        return (
                                            <InspectorBody className="p-4">
                                                <div className="rounded-xl border border-gray-200 dark:border-gray-800 p-4">
                                                    {kv(t('reports.date', { defaultValue: 'Date' }), new Date(b.booking_date + 'T00:00:00').toLocaleDateString('en-GB', { weekday: 'long', day: '2-digit', month: 'short', year: 'numeric' }))}
                                                    {kv(t('reports.class', { defaultValue: 'Class' }), SESSION_LABEL[b.session_id ?? ''] ?? b.session_id)}
                                                    {kv(t('reports.bookingRef', { defaultValue: 'Booking ref' }), b.booking_ref || b.internal_id)}
                                                    {kv('Pax', `${b.pax_count}${b.visitor_count ? ` (+${b.visitor_count} ${t('reports.visitors', { defaultValue: 'visitors' })})` : ''}`)}
                                                    {kv(t('reports.hotel', { defaultValue: 'Hotel' }), b.hotel_name)}
                                                    {kv(t('reports.status', { defaultValue: 'Status' }), cap(b.status ?? ''))}
                                                    {kv(t('reports.payment', { defaultValue: 'Payment' }), [b.payment_method, b.payment_status].filter(Boolean).join(' · '))}
                                                    {kv('Email', b.guest_email)}
                                                    {kv(t('reports.commissionRate', { defaultValue: 'Commission rate' }), b.applied_commission_rate ? `${b.applied_commission_rate}/pax` : null)}
                                                    {kv(t('reports.agencyNote', { defaultValue: 'Agency note' }), b.agency_note)}
                                                    {kv(t('reports.requests', { defaultValue: 'Requests' }), b.special_requests)}
                                                </div>
                                            </InspectorBody>
                                        );
                                    })()
                                ) : (
                                    // Selezione multipla → lista unificata (rimovibile)
                                    <InspectorBody className="p-4 space-y-2">
                                        {selectedBookings.map((b, i) => (
                                            <ReportLineRow
                                                key={b.internal_id || i}
                                                title={new Date(b.booking_date + 'T00:00:00').toLocaleDateString('en-GB', { weekday: 'short', day: '2-digit', month: 'short' })}
                                                subtitle={`${b.guest_name || b.booking_ref || '—'} · ${SESSION_LABEL[b.session_id ?? ''] ?? b.session_id ?? ''} · ${b.pax_count} pax`}
                                                amount={Number(b.total_price || 0).toLocaleString()}
                                                actions={agencyGran === 'single' ? (
                                                    <button aria-label={t('reports.remove', { defaultValue: 'Remove' })} onClick={() => toggleKey(b.internal_id)} className="p-1.5 rounded-lg text-gray-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-500/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500"><X className="w-5 h-5" /></button>
                                                ) : undefined}
                                            />
                                        ))}
                                    </InspectorBody>
                                )}
                                <InspectorFooter className="pb-[80px]">
                                    <div className="space-y-1 mb-1">
                                        <div className="flex justify-between text-sm"><span className="text-gray-400">{t('reports.gross', { defaultValue: 'Gross' })}</span><span className="font-mono font-bold text-gray-700 dark:text-gray-200">{selTotals.gross.toLocaleString()}</span></div>
                                        <div className="flex justify-between text-sm"><span className="text-gray-400">{t('reports.commission', { defaultValue: 'Commission' })}</span><span className="font-mono font-bold text-amber-600 dark:text-amber-400">− {selTotals.commission.toLocaleString()}</span></div>
                                        <div className="flex justify-between items-end pt-1 border-t border-gray-200 dark:border-gray-700">
                                            <SectionTitle className="text-gray-400 mb-0">{t('reports.netDue', { defaultValue: 'Net due' })}</SectionTitle>
                                            <span className="font-mono text-2xl font-black text-gray-900 dark:text-white">{selTotals.net.toLocaleString()} <span className="text-sm text-gray-400 font-normal">THB</span></span>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-2">
                                        <Button variant="outline" size="sm" disabled={reportBusy} startIcon={<Printer className="w-4 h-4" />} onClick={() => handleAgencyReport('print')}>{t('driverPayouts.print', { defaultValue: 'Print' })}</Button>
                                        <Button variant="outline" size="sm" disabled={reportBusy} startIcon={<Download className="w-4 h-4" />} onClick={() => handleAgencyReport('download')}>PDF</Button>
                                    </div>
                                    {/* Invoice to Zoho — crea la fattura per la selezione (solo su click + conferma) */}
                                    {selectedBookings.some(b => b.zoho_invoice_id) ? (
                                        <p className="text-center text-xs text-gray-400 mt-2">{t('reports.alreadyInvoiced', { defaultValue: 'Invoiced in Zoho.' })}</p>
                                    ) : (
                                        <Button variant="primary" size="sm" className="w-full mt-2" disabled={invoiceBusy} startIcon={<Banknote className="w-4 h-4" />} onClick={handleAgencyInvoice}>{invoiceBusy ? t('driverPayouts.processing', { defaultValue: 'Processing…' }) : t('reports.invoiceZoho', { defaultValue: 'Invoice to Zoho' })}</Button>
                                    )}
                                </InspectorFooter>
                            </>
                        ) : (
                            <InspectorEmpty icon={<Briefcase className="w-8 h-8" />} hint={!expandedAgency ? t('reports.openAgency', { defaultValue: 'Open an agency, then select bookings to combine.' }) : agencyGran === 'single' ? t('reports.selectBooking', { defaultValue: 'Select one or more bookings to unify.' }) : t('reports.selectPeriod', { defaultValue: 'Select one or more periods to unify.' })} />
                        )
                    ) : week && selDriver ? (
                        <>
                            <InspectorHeader
                                size="lg"
                                leading={<Avatar src={selDriver.avatar} name={selDriver.name} className="size-12" textClassName="text-base" />}
                                subtitle={selDriver.name}
                                title={fmtRange(week.start, week.end)}
                                onClose={() => setSelected(null)}
                            />
                            <InspectorBody className="p-4 space-y-2">
                                {week.rows.map((r, i) => {
                                    const isMorning = r.session_id === 'morning_class';
                                    const canManage = !week.archived && r.status !== 'paid';
                                    const isEditing = !!editing && editing.driverId === selDriver.id && editing.run_date === r.run_date && editing.session_id === r.session_id;
                                    return (
                                        <ReportLineRow
                                            key={i}
                                            leading={
                                                <div className={cn('shrink-0 w-14 rounded-lg flex items-center justify-center', isMorning ? 'bg-primary/10' : 'bg-action/10')}>
                                                    {isMorning ? <Sunrise className="w-8 h-8 text-primary" /> : <Sunset className="w-8 h-8 text-action" />}
                                                </div>
                                            }
                                            title={new Date(r.run_date + 'T00:00:00').toLocaleDateString('en-GB', { weekday: 'short', day: '2-digit', month: 'short' })}
                                            subtitle={`${SESSION_LABEL[r.session_id] ?? r.session_id} · ${r.total_stops} stops · ${r.total_pax} pax`}
                                            amount={r.payout_amount.toLocaleString()}
                                            onEdit={canManage && !isEditing ? () => setEditing({ driverId: selDriver.id, run_date: r.run_date, session_id: r.session_id, range: rangeOfStops(r.total_stops), pax: String(r.total_pax) }) : undefined}
                                            onDelete={canManage && !isEditing ? () => handleDeleteRow(selDriver.id, r) : undefined}
                                            confirmDelete={{ title: t('driverPayouts.confirmDeleteTitle', { defaultValue: 'Delete service entry?' }), message: t('driverPayouts.confirmDelete', { defaultValue: 'This will remove the driver service for this day. This cannot be undone.' }) }}
                                        >
                                            {isEditing && editing && (
                                                <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700 space-y-2">
                                                    <div className="flex bg-gray-100 dark:bg-gray-800 p-1 rounded-lg">
                                                        {STOPS_RANGES.map(rg => (
                                                            <button key={rg} onClick={() => setEditing({ ...editing, range: rg })} className={cn('flex-1 px-2 h-8 rounded-md text-xs font-bold transition-all', editing.range === rg ? 'bg-white dark:bg-gray-700 text-primary-600 dark:text-primary-400 shadow-sm' : 'text-gray-500 hover:text-gray-900 dark:hover:text-gray-200')}>{rg === '7plus' ? '7+' : rg}</button>
                                                        ))}
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <label className="text-xs font-bold uppercase text-gray-400">pax</label>
                                                        <input type="number" min={0} value={editing.pax} onChange={(e) => setEditing({ ...editing, pax: e.target.value })} className="w-20 h-9 px-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500" />
                                                        <div className="flex-1" />
                                                        <Button variant="primary" size="sm" disabled={busy} startIcon={<Check className="w-4 h-4" />} onClick={handleSaveEdit}>{t('driverPayouts.save', { defaultValue: 'Save' })}</Button>
                                                        <Button variant="outline" size="sm" disabled={busy} startIcon={<X className="w-4 h-4" />} onClick={() => setEditing(null)}>{t('driverPayouts.cancel', { defaultValue: 'Cancel' })}</Button>
                                                    </div>
                                                </div>
                                            )}
                                        </ReportLineRow>
                                    );
                                })}
                            </InspectorBody>
                            <InspectorFooter className="pb-[80px]">
                                <div className="flex justify-between items-end">
                                    <SectionTitle className="text-gray-400 mb-0">{t('driverPayouts.total', { defaultValue: 'Total' })}</SectionTitle>
                                    <span className="font-mono text-2xl font-black text-gray-900 dark:text-white">{week.total.toLocaleString()} <span className="text-sm text-gray-400 font-normal">THB</span></span>
                                </div>
                                <div className="grid grid-cols-2 gap-2">
                                    <Button variant="outline" size="sm" disabled={reportBusy} startIcon={<Printer className="w-4 h-4" />} onClick={() => handleReport(selDriver.id, selDriver.name, week, 'print')}>{t('driverPayouts.print', { defaultValue: 'Print' })}</Button>
                                    <Button variant="outline" size="sm" disabled={reportBusy} startIcon={<Download className="w-4 h-4" />} onClick={() => handleReport(selDriver.id, selDriver.name, week, 'download')}>PDF</Button>
                                </div>
                                {!week.archived && (
                                    <Button variant="primary" size="md" className="w-full justify-center" disabled={busy} startIcon={<Banknote className="w-4 h-4" />} onClick={() => handlePayBill(selDriver.id, week)}>
                                        {t('driverPayouts.payBill', { defaultValue: 'Mark paid & bill (Zoho)' })}
                                    </Button>
                                )}
                            </InspectorFooter>
                        </>
                    ) : (
                        <InspectorEmpty icon={<History className="w-8 h-8" />} hint={t('reports.selectWeek', { defaultValue: 'Select a report to see the detail.' })} />
                    )}
                </InspectorShell>
            }
        >
            {/* CENTER */}
            {reportType === 'salary' ? (
                <SalaryRoster onOpenDriverPayouts={() => setReportType('driver')} />
            ) : reportType === 'classes' ? (
                posRows === null ? (
                    <div className="p-8 text-center"><SectionTitle className="text-gray-400">{t('driverPayouts.loading', { defaultValue: 'Loading…' })}</SectionTitle></div>
                ) : posBuckets.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-gray-400 gap-3 py-20">
                        <Receipt className="w-10 h-10 opacity-40" />
                        <SectionTitle className="text-gray-400">{t('reports.posNothing', { defaultValue: 'Nothing to invoice for this day.' })}</SectionTitle>
                    </div>
                ) : (
                    <div className="p-4 space-y-4 max-w-2xl mx-auto">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {posBuckets.map(b => (
                                <div key={b.key} className="rounded-xl border border-gray-200 dark:border-gray-800 p-4 bg-white dark:bg-gray-900">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-base font-bold text-gray-900 dark:text-white">{SESSION_LABEL[b.session] ?? b.session}</span>
                                        <ReportStatusBadge tone={b.tender === 'cash' ? 'green' : 'blue'}>{b.tender === 'cash' ? t('reports.cash', { defaultValue: 'Cash' }) : t('reports.card', { defaultValue: 'Card' })}</ReportStatusBadge>
                                    </div>
                                    <div className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">{b.bookings} {t('reports.bookingsShort', { defaultValue: 'bookings' })} · {b.items} {t('reports.items', { defaultValue: 'items' })}</div>
                                    <div className="font-mono text-2xl font-black text-gray-900 dark:text-white">{b.amount.toLocaleString()} <span className="text-xs text-gray-400 font-normal">THB{b.tender === 'card' ? ' +3%' : ''}</span></div>
                                </div>
                            ))}
                        </div>
                        <div className="rounded-xl border border-gray-200 dark:border-gray-800 p-4 bg-gray-50 dark:bg-gray-900/60 flex items-center justify-between gap-4">
                            <div>
                                <div className="text-xs font-bold uppercase tracking-wider text-gray-400">{t('reports.posTotalBase', { defaultValue: 'Total (base, pre-card-fee)' })}</div>
                                <div className="font-mono text-xl font-black text-gray-900 dark:text-white">{posBuckets.reduce((s, b) => s + b.amount, 0).toLocaleString()} <span className="text-xs text-gray-400 font-normal">THB</span></div>
                            </div>
                            <Button variant="primary" size="md" disabled={posBusy} startIcon={<Banknote className="w-4 h-4" />} onClick={handlePosInvoices} className="justify-center">
                                {posBusy ? t('driverPayouts.processing', { defaultValue: 'Processing…' }) : t('reports.posGenerate', { defaultValue: 'Generate Zoho invoices' })}
                            </Button>
                        </div>
                        <p className="text-center text-xs text-gray-400">{t('reports.posHint', { defaultValue: 'Up to 4 invoices: morning/evening × cash/card. Already-invoiced groups are skipped.' })}</p>
                    </div>
                )
            ) : isMarketType(reportType) ? (
                (reportType === 'market_teacher' && gran === 'month') ? (
                    months === null ? (
                        <div className="p-8 text-center"><SectionTitle className="text-gray-400">{t('driverPayouts.loading', { defaultValue: 'Loading…' })}</SectionTitle></div>
                    ) : (() => {
                        const list = months.filter(mg => view === 'active' ? !mg.archived : mg.archived);
                        return list.length === 0 ? marketEmpty : <div className="p-4 space-y-2">{list.map(mg => renderMonthCard(mg))}</div>;
                    })()
                ) : marketRuns === null ? (
                    <div className="p-8 text-center"><SectionTitle className="text-gray-400">{t('driverPayouts.loading', { defaultValue: 'Loading…' })}</SectionTitle></div>
                ) : (() => {
                    const list = marketRuns.filter(r => view === 'active' ? !r.archived : r.archived);
                    return list.length === 0 ? marketEmpty : <div className="p-4 space-y-2">{list.map(r => renderRunCard(r))}</div>;
                })()
            ) : reportType === 'agency' ? (
                filteredAgencies === null ? (
                    <div className="p-8 text-center"><SectionTitle className="text-gray-400">{t('driverPayouts.loading', { defaultValue: 'Loading…' })}</SectionTitle></div>
                ) : filteredAgencies.length === 0 ? agencyEmpty : (
                    // ACCORDION — one agency open at a time; inside it the cards (single/week/month), multi-selectable.
                    <div className="p-2 divide-y divide-gray-200 dark:divide-gray-800">
                        {filteredAgencies.map(ag => {
                            const open = expandedAgency === ag.id;
                            const items = agencyGran === 'single'
                                ? ag.bookings.filter(b => view === 'active' ? !b.zoho_invoice_id : !!b.zoho_invoice_id)
                                : [];
                            const periods = agencyGran !== 'single'
                                ? (periodsByAgency.get(ag.id) ?? []).filter(p => view === 'active' ? !p.invoiced : p.invoiced)
                                : [];
                            const count = agencyGran === 'single' ? items.length : periods.length;
                            return (
                                <div key={ag.id} className="py-1">
                                    <button
                                        onClick={() => toggleAgency(ag.id)}
                                        aria-expanded={open}
                                        className={`w-full flex items-center gap-3 px-2 py-3 rounded-xl transition-colors ${open ? 'bg-gray-50 dark:bg-gray-800/60' : 'hover:bg-gray-50 dark:hover:bg-gray-800/40'} focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500`}
                                    >
                                        <Avatar src={ag.avatar} name={ag.name} />
                                        <div className="flex-1 text-left min-w-0">
                                            <DriverHeading>{ag.name}</DriverHeading>
                                            <span className="block text-xs font-bold uppercase tracking-wider text-gray-400">{ag.totalPax} pax · {ag.bookings.length} {t('reports.bookingsShort', { defaultValue: 'bookings' })}</span>
                                        </div>
                                        <ChevronRight className={`w-5 h-5 text-gray-400 shrink-0 transition-transform ${open ? 'rotate-90' : ''}`} />
                                    </button>
                                    {open && (
                                        <div className="px-2 pb-4 pt-2 space-y-2">
                                            <div className="flex items-center justify-between px-1 pb-1">
                                                <span className="text-xs font-bold uppercase tracking-wider text-gray-400">{t('reports.autoInvoice', { defaultValue: 'Auto-invoice each booking' })}</span>
                                                <button role="switch" aria-checked={ag.autoInvoice} onClick={(e) => { e.stopPropagation(); handleToggleAuto(ag.id, !ag.autoInvoice); }}
                                                    className={`relative w-10 h-6 rounded-full transition-colors ${ag.autoInvoice ? 'bg-primary-600' : 'bg-gray-300 dark:bg-gray-600'}`}>
                                                    <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${ag.autoInvoice ? 'translate-x-4' : ''}`} />
                                                </button>
                                            </div>
                                            {(() => {
                                                const decl = declaredByAgency.get(ag.id) ?? [];
                                                if (decl.length === 0) return null;
                                                return (
                                                    <div className="mb-3 rounded-xl border border-blue-200 dark:border-blue-500/30 bg-blue-50/60 dark:bg-blue-500/5 p-3 space-y-2">
                                                        <div className="flex items-center justify-between">
                                                            <span className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">{t('reports.toConfirm', { defaultValue: 'Payments to confirm' })}</span>
                                                            <button onClick={(e) => { e.stopPropagation(); handleConfirmPayment(decl.map(i => i.id)); }} disabled={invoiceBusy} className="text-xs font-bold px-2.5 py-1 rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50">{t('reports.confirmAll', { defaultValue: 'Confirm all' })}</button>
                                                        </div>
                                                        {decl.map(inv => (
                                                            <div key={inv.id} className="flex items-center justify-between gap-2 text-sm">
                                                                <span className="font-medium text-gray-700 dark:text-gray-200 truncate">{inv.zoho_invoice_number || t('reports.invoice', { defaultValue: 'Invoice' })} · ฿{Number(inv.amount).toLocaleString()}</span>
                                                                <div className="flex items-center gap-2 shrink-0">
                                                                    {inv.payment_proof_url && <button onClick={(e) => { e.stopPropagation(); viewProof(inv.payment_proof_url!); }} className="text-xs text-blue-600 hover:underline">{t('reports.viewProof', { defaultValue: 'Screenshot' })}</button>}
                                                                    <button onClick={(e) => { e.stopPropagation(); handleConfirmPayment([inv.id]); }} disabled={invoiceBusy} className="text-xs font-bold px-2 py-1 rounded-lg border border-blue-300 dark:border-blue-500/40 text-blue-700 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-500/10 disabled:opacity-50">{t('reports.confirm', { defaultValue: 'Confirm' })}</button>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                );
                                            })()}
                                            {count === 0 ? (
                                                <div className="px-1 text-sm text-gray-400">{view === 'active' ? t('reports.nothingPending', { defaultValue: 'Nothing in progress.' }) : t('reports.noArchive', { defaultValue: 'No archived reports.' })}</div>
                                            ) : agencyGran === 'single' ? items.map(b => renderBookingCard(b)) : periods.map(p => renderPeriodCard(p))}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )
            ) : reports === null ? (
                <div className="p-8 text-center"><SectionTitle className="text-gray-400">{t('driverPayouts.loading', { defaultValue: 'Loading…' })}</SectionTitle></div>
            ) : view === 'active' ? (
                // IN PROGRESS — all drivers exposed, non-archived weeks
                <div className="p-4 divide-y divide-gray-200 dark:divide-gray-800">
                    {reports.map(d => {
                        const active = d.weeks.filter(w => !w.archived);
                        return (
                            <div key={d.id} className="py-8 first:pt-0 last:pb-0">
                                <div className="flex items-center gap-3 mb-4 px-1">
                                    <Avatar src={d.avatar} name={d.name} />
                                    <DriverHeading>{d.name}</DriverHeading>
                                </div>
                                {active.length === 0 ? (
                                    <div className="px-1 text-sm text-gray-400">{t('reports.nothingPending', { defaultValue: 'Nothing in progress.' })}</div>
                                ) : (
                                    <div className="space-y-2">{active.map(w => renderWeekCard(d, w))}</div>
                                )}
                            </div>
                        );
                    })}
                </div>
            ) : (
                // ARCHIVE — pick a driver, see their billed weeks
                <div className="p-4">
                    {!archiveDriver ? (
                        <div className="h-full flex flex-col items-center justify-center text-gray-400 gap-3 py-20">
                            <Archive className="w-10 h-10 opacity-40" />
                            <SectionTitle className="text-gray-400">{t('reports.pickDriverHint', { defaultValue: 'Select a driver to see archived reports.' })}</SectionTitle>
                        </div>
                    ) : (() => {
                        const archived = archiveDriver.weeks.filter(w => w.archived);
                        return (
                            <div>
                                <div className="flex items-center gap-3 mb-4 px-1">
                                    <Avatar src={archiveDriver.avatar} name={archiveDriver.name} />
                                    <DriverHeading>{archiveDriver.name}</DriverHeading>
                                </div>
                                {archived.length === 0 ? (
                                    <div className="px-1 text-sm text-gray-400">{t('reports.noArchive', { defaultValue: 'No archived reports.' })}</div>
                                ) : (
                                    <div className="space-y-2">{archived.map(w => renderWeekCard(archiveDriver, w))}</div>
                                )}
                            </div>
                        );
                    })()}
                </div>
            )}
        </DataExplorerLayout>
    );
};

export default ManagerReports;
