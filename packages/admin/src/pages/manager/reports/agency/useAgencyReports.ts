/**
 * Agency reports - dati + azioni: agenzie con prenotazioni, periodi (settimana/mese), selezione multipla,
 * PDF combinato, fattura Zoho, conferma pagamenti dichiarati, switch auto-invoice.
 * Estratto da ManagerReports.tsx (#16) a comportamento invariato. La UI e' in AgencyReports.tsx.
 */
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { supabase } from '@thaiakha/shared/lib/supabase';
import { useQuery, useQueryClient } from '@thaiakha/shared/query';
import { mondayOf, isoDate, fmtRange, monthStartEnd, deliverPdf, type PdfMode } from '../shared';

// CENTER column resolution: single bookings · week · month. A unit is "invoiced" (archive) when its booking(s) carry zoho_invoice_id.
export type AgencyGran = 'single' | 'week' | 'month';
export interface BookingRow {
    internal_id: string; booking_date: string; session_id: string | null; status: string | null;
    pax_count: number; visitor_count: number | null; total_price: number; commission_amount: number;
    applied_commission_rate: number | null; payment_method: string | null; payment_status: string | null;
    zoho_invoice_id: string | null; guest_name: string | null; guest_email: string | null;
    booking_ref: string | null; hotel_name: string | null; agency_note: string | null; special_requests: string | null;
}
export interface AgencyPeriod { key: string; label: string; start: string; end: string; bookings: BookingRow[]; count: number; pax: number; gross: number; commission: number; net: number; invoiced: boolean; }
export interface AgencyReport { id: string; name: string; avatar: string | null; bookings: BookingRow[]; totalPax: number; autoInvoice: boolean; }
export interface AgencyInvoiceRow { id: string; agency_id: string; zoho_invoice_number: string | null; amount: number; status: string; payment_proof_url: string | null; booking_ids: string[]; created_at: string; }
const monthOrWeekKey = (dateISO: string, gran: AgencyGran): string =>
    gran === 'month' ? dateISO.slice(0, 7) : isoDate(mondayOf(new Date(dateISO + 'T00:00:00')));

type AgencyData = { reports: AgencyReport[]; invoices: AgencyInvoiceRow[] };
const AGENCY_KEY = ['manager_reports', 'agency'] as const;

// Agencies + all their bookings. (Hundreds of agencies/bookings: fetched once, grouped client-side;
// the center list is searchable. For 1000s, switch to server-side search/pagination later.)
async function loadAgencies(): Promise<AgencyData> {
    const [{ data: agData }, { data: bkData }, { data: invData }] = await Promise.all([
        supabase.from('profiles').select('id, agency_company_name, full_name, avatar_url, auto_invoice').eq('role', 'agency').order('agency_company_name'),
        supabase.from('bookings').select('user_id, internal_id, booking_date, session_id, status, pax_count, visitor_count, total_price, commission_amount, applied_commission_rate, payment_method, payment_status, zoho_invoice_id, guest_name, guest_email, booking_ref, hotel_name, agency_note, special_requests').order('booking_date', { ascending: false }),
        supabase.from('agency_invoices').select('id, agency_id, zoho_invoice_number, amount, status, payment_proof_url, booking_ids, created_at').order('created_at', { ascending: false }),
    ]);
    const invoices = (invData as AgencyInvoiceRow[]) ?? [];
    const byAg = new Map<string, BookingRow[]>();
    for (const b of (bkData as Array<BookingRow & { user_id: string }>) ?? []) {
        const arr = byAg.get(b.user_id) ?? []; arr.push(b); byAg.set(b.user_id, arr);
    }
    const result: AgencyReport[] = ((agData as Array<{ id: string; agency_company_name: string | null; full_name: string | null; avatar_url: string | null; auto_invoice: boolean | null }>) ?? []).map(a => {
        const bks = byAg.get(a.id) ?? [];
        return { id: a.id, name: a.agency_company_name || a.full_name || 'Agency', avatar: a.avatar_url, bookings: bks, totalPax: bks.reduce((s, b) => s + (b.pax_count || 0), 0), autoInvoice: a.auto_invoice ?? false };
    });
    return { reports: result, invoices };
}

export function useAgencyReports(enabled: boolean) {
    const { t } = useTranslation('manager');
    const queryClient = useQueryClient();
    // Agency reports: search + single/week/month axis. Accordion (one open agency) + multi-select of cards (unify report/invoice).
    const [agencyGran, setAgencyGran] = useState<AgencyGran>('month');
    const [agencySearch, setAgencySearch] = useState('');
    const [expandedAgency, setExpandedAgency] = useState<string | null>(null);
    const [selectedKeys, setSelectedKeys] = useState<string[]>([]);
    const [reportBusy, setReportBusy] = useState(false);
    const [invoiceBusy, setInvoiceBusy] = useState(false);
    const clearAgencySel = () => { setSelectedKeys([]); };
    const toggleAgency = (id: string) => { setExpandedAgency(prev => prev === id ? null : id); setSelectedKeys([]); };
    const toggleKey = (k: string) => setSelectedKeys(prev => prev.includes(k) ? prev.filter(x => x !== k) : [...prev, k]);

    const query = useQuery({ queryKey: AGENCY_KEY, queryFn: loadAgencies, enabled, staleTime: 0 });
    const agencyReports: AgencyReport[] | null = query.isFetching ? null : (query.data?.reports ?? null);
    const agencyInvoices = useMemo<AgencyInvoiceRow[]>(() => query.data?.invoices ?? [], [query.data]);
    const fetchAgencies = () => queryClient.invalidateQueries({ queryKey: AGENCY_KEY });

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

    // Agency period report (PDF) — render-report 'agency_report'.
    // Combined report over the current multi-selection (non-contiguous): renders by booking_ids[].
    const handleAgencyReport = async (mode: PdfMode) => {
        if (reportBusy || !expAgency || selectedBookings.length === 0) return;
        setReportBusy(true);
        try {
            const { data, error } = await supabase.functions.invoke('render-report', {
                body: { report: 'agency_report', agency_id: expAgency.id, booking_ids: selectedBookings.map(b => b.internal_id) },
            });
            if (error) throw error;
            deliverPdf(data as Blob, mode, `ThaiAkha_Agency_${expAgency.name.replace(/\s+/g, '')}_${selectedBookings.length}bk.pdf`);
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
            queryClient.setQueryData<AgencyData>(AGENCY_KEY, prev =>
                prev ? { ...prev, reports: prev.reports.map(a => a.id === agencyId ? { ...a, autoInvoice: value } : a) } : prev);
        } catch (err) {
            alert(t('driverPayouts.errorGeneric', { defaultValue: 'Error' }) + ': ' + (err instanceof Error ? err.message : ''));
        }
    };

    /** Reset completo al cambio tipo report. */
    const reset = () => { setExpandedAgency(null); setSelectedKeys([]); };

    return {
        agencyGran, setAgencyGran, agencySearch, setAgencySearch, expandedAgency, selectedKeys,
        clearAgencySel, toggleAgency, toggleKey,
        filteredAgencies, periodsByAgency, expAgency, selectedBookings, selTotals, declaredByAgency,
        reportBusy, invoiceBusy,
        handleAgencyReport, handleAgencyInvoice, handleConfirmPayment, viewProof, handleToggleAuto,
        reset,
    };
}

export type AgencyReportsState = ReturnType<typeof useAgencyReports>;
