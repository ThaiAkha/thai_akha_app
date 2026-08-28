import React, { useState, useMemo } from 'react';
import { useQuery } from '@thaiakha/shared/query';
import { useTranslation } from 'react-i18next';
import { supabase } from '@thaiakha/shared/lib/supabase';
import { useAuth } from '../../context/AuthContext';
import PageContainer from '../../components/layout/PageContainer';
import Badge from '../../components/ui/badge/Badge';
import { cn } from '@thaiakha/shared/lib/utils';
import {
    DollarSign, Users, Briefcase, Calendar, FileText,
    Printer, Download, Upload, CheckCircle2, Clock, TrendingUp,
} from 'lucide-react';
import PageMeta from '../../components/common/PageMeta';
import { Heading, Paragraph, Caption, SectionTitle } from '../../components/typography';

interface AgencyInvoice {
    id: string;
    zoho_invoice_number: string | null;
    amount: number;
    status: 'unpaid' | 'declared' | 'paid' | 'void';
    payment_proof_url: string | null;
    booking_ids: string[];
    created_at: string;
}
interface CommissionTier { tier: string; min_pax: number; rate: number; }

const AgencyReports: React.FC = () => {
    const { t } = useTranslation('pages');
    const { user } = useAuth();
    type BookingRow = { internal_id: string; total_price: number | null; commission_amount: number | null; pax_count: number | null; status: string | null };
    type CommStatus = { tier: string; rate_per_pax: number; cycle_prior_pax: number };
    const [selectedMetric, setSelectedMetric] = useState<string>('revenue');
    const [selectedInv, setSelectedInv] = useState<string[]>([]);
    const [busy, setBusy] = useState(false);
    const [reportBusy, setReportBusy] = useState(false);
    const [proofFile, setProofFile] = useState<File | null>(null);

    // Data layer (#86): un'unica query per agenzia (bookings + invoices + tiers + RPC fascia).
    // staleTime 0: dati operativi, ogni ritorno sulla pagina li rilegge; `refetch()` dopo le azioni.
    const reportQuery = useQuery({
        queryKey: ['agency_reports', user?.id ?? ''] as const,
        enabled: Boolean(user),
        staleTime: 0,
        queryFn: async () => {
            const uid = user!.id;
            const [bk, inv, prof, rpc] = await Promise.all([
                supabase.from('bookings').select('internal_id, total_price, commission_amount, pax_count, status').eq('user_id', uid).neq('status', 'cancelled'),
                supabase.from('agency_invoices').select('id, zoho_invoice_number, amount, status, payment_proof_url, booking_ids, created_at').eq('agency_id', uid).order('created_at', { ascending: false }),
                supabase.from('profiles').select('commission_config').eq('id', uid).single(),
                supabase.rpc('calculate_agency_commission', { p_agency_id: uid, p_pax: 1 }),
            ]);
            const cfg = (prof.data?.commission_config as { tiers?: CommissionTier[] } | null);
            const r = rpc.data as { success?: boolean; tier?: string; rate_per_pax?: number; cycle_prior_pax?: number } | null;
            return {
                bookings: (bk.data ?? []) as BookingRow[],
                invoices: ((inv.data as AgencyInvoice[]) ?? []),
                tiers: (cfg?.tiers ?? []).slice().sort((a, b) => a.min_pax - b.min_pax),
                commStatus: r?.success ? { tier: r.tier!, rate_per_pax: r.rate_per_pax!, cycle_prior_pax: r.cycle_prior_pax! } as CommStatus : null,
            };
        },
    });
    // Memoizzati: `?? []` creerebbe un array nuovo a ogni render e invaliderebbe i useMemo a valle.
    const bookings = useMemo(() => reportQuery.data?.bookings ?? [], [reportQuery.data]);
    const invoices = reportQuery.data?.invoices ?? [];
    const tiers = useMemo(() => reportQuery.data?.tiers ?? [], [reportQuery.data]);
    const commStatus = reportQuery.data?.commStatus ?? null;
    // Finche' l'auth non ha risolto (user null) si resta in loading: mai un report vuoto.
    const loading = !user || reportQuery.isPending;
    const fetchAll = async () => { if (user) await reportQuery.refetch(); };

    const stats = useMemo(() => {
        const totalBookings = bookings.length;
        const net = bookings.reduce((s, b) => s + (b.total_price || 0), 0);          // total_price È il net
        const totalCommission = bookings.reduce((s, b) => s + (b.commission_amount || 0), 0);
        const totalPax = bookings.reduce((s, b) => s + (b.pax_count || 0), 0);
        return { totalBookings, gross: net + totalCommission, net, totalCommission, totalPax };
    }, [bookings]);

    // Avanzamento fascia commissioni (ciclo rolling 3 mesi)
    const tierProgress = useMemo(() => {
        if (!commStatus || tiers.length === 0) return null;
        const prior = commStatus.cycle_prior_pax;
        const idx = tiers.findIndex(tr => tr.tier === commStatus.tier);
        const next = idx >= 0 ? tiers[idx + 1] : undefined;
        const pct = next ? Math.min(100, Math.round((prior / next.min_pax) * 100)) : 100;
        return { tier: commStatus.tier, rate: commStatus.rate_per_pax, prior, next, pct };
    }, [commStatus, tiers]);

    const METRICS = [
        { id: 'revenue', title: t('agencyReport.metrics.revenue', { defaultValue: 'Gross sales' }), value: `฿${stats.gross.toLocaleString()}`, icon: <DollarSign className="w-5 h-5" /> },
        { id: 'commission', title: t('agencyReport.metrics.commission', { defaultValue: 'Your commission' }), value: `฿${stats.totalCommission.toLocaleString()}`, icon: <Briefcase className="w-5 h-5" /> },
        { id: 'bookings', title: t('agencyReport.metrics.bookings', { defaultValue: 'Bookings' }), value: stats.totalBookings.toString(), icon: <Calendar className="w-5 h-5" /> },
        { id: 'pax', title: t('agencyReport.metrics.pax', { defaultValue: 'Guests' }), value: stats.totalPax.toString(), icon: <Users className="w-5 h-5" /> },
    ];

    const STATUS_BADGE: Record<string, { color: 'success' | 'warning' | 'error' | 'info'; label: string }> = {
        unpaid: { color: 'warning', label: t('agencyReport.unpaid', { defaultValue: 'To pay' }) },
        declared: { color: 'info', label: t('agencyReport.declared', { defaultValue: 'Awaiting confirmation' }) },
        paid: { color: 'success', label: t('agencyReport.paid', { defaultValue: 'Paid' }) },
        void: { color: 'error', label: t('agencyReport.void', { defaultValue: 'Void' }) },
    };

    const toggleInv = (id: string) => setSelectedInv(p => p.includes(id) ? p.filter(x => x !== id) : [...p, id]);

    // Stampa/scarica il proprio report (render-report forza l'agency_id lato server)
    const handleReport = async (mode: 'print' | 'download') => {
        if (reportBusy) return;
        setReportBusy(true);
        try {
            const ids = bookings.filter(b => ['confirmed', 'amended', 'completed'].includes(b.status || '')).map(b => b.internal_id);
            const { data, error } = await supabase.functions.invoke('render-report', { body: { report: 'agency_report', booking_ids: ids } });
            if (error) throw error;
            const url = URL.createObjectURL(data as Blob);
            if (mode === 'download') {
                const a = document.createElement('a'); a.href = url; a.download = 'ThaiAkha_Agency_Report.pdf';
                document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(url), 4000);
            } else {
                const f = document.createElement('iframe'); f.style.cssText = 'position:fixed;right:0;bottom:0;width:0;height:0;border:0;'; f.src = url;
                f.onload = () => { f.contentWindow?.focus(); f.contentWindow?.print(); };
                document.body.appendChild(f); setTimeout(() => { f.remove(); URL.revokeObjectURL(url); }, 60000);
            }
        } catch (err) {
            alert(t('agencyReport.reportError', { defaultValue: 'Report error' }) + ': ' + (err instanceof Error ? err.message : ''));
        } finally { setReportBusy(false); }
    };

    // Dichiara pagate le fatture selezionate (+ screenshot ricevuta) → in attesa di conferma manager
    const handleDeclare = async () => {
        if (busy || selectedInv.length === 0 || !user) return;
        setBusy(true);
        try {
            let proofPath: string | null = null;
            if (proofFile) {
                const ext = proofFile.name.split('.').pop() || 'png';
                const path = `${user.id}/${Date.now()}.${ext}`;
                const { error: upErr } = await supabase.storage.from('payment-proofs').upload(path, proofFile, { upsert: false });
                if (upErr) throw upErr;
                proofPath = path;
            }
            const { data, error } = await supabase.rpc('agency_declare_payment', { p_invoice_ids: selectedInv, p_proof_url: proofPath || undefined });
            if (error) throw error;
            if (!(data as { success?: boolean })?.success) throw new Error((data as { message?: string })?.message || 'Failed');
            setSelectedInv([]); setProofFile(null);
            await fetchAll();
        } catch (err) {
            alert(t('agencyReport.declareError', { defaultValue: 'Could not mark as paid' }) + ': ' + (err instanceof Error ? err.message : ''));
        } finally { setBusy(false); }
    };

    if (loading) return <div className="p-8 text-center uppercase font-black text-sub">{t('agencyReport.loading', { defaultValue: 'Loading…' })}</div>;

    const selectableUnpaid = invoices.filter(i => i.status === 'unpaid');

    return (
        <PageContainer variant="wide">
            <PageMeta title="Agency Reports | Thai Akha Kitchen" description="Agency invoices, reports and commission status." />
            <div className="grid grid-cols-12 gap-6 pb-20">

                {/* LEFT: metrics + commission tier progress */}
                <div className="col-span-12 lg:col-span-8 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {METRICS.map((metric) => (
                            <div key={metric.id} onClick={() => setSelectedMetric(metric.id)}
                                className={cn("p-6 rounded-3xl border transition-all cursor-pointer",
                                    selectedMetric === metric.id ? "bg-white dark:bg-gray-800 border-primary-500 shadow-xl shadow-primary-500/10" : "bg-white dark:bg-gray-900 border-gray-100 dark:border-gray-800 hover:border-gray-300")}>
                                <div className="flex justify-between items-start mb-4">
                                    <div className={cn("size-12 rounded-2xl flex items-center justify-center text-white",
                                        selectedMetric === metric.id ? "bg-primary-600 shadow-lg shadow-primary-500/40" : "bg-gray-100 dark:bg-gray-800 text-gray-500")}>{metric.icon}</div>
                                </div>
                                <SectionTitle as="h4" className="text-sub mb-1">{metric.title}</SectionTitle>
                                <Heading level="h2" className="font-black tracking-tighter leading-9">{metric.value}</Heading>
                            </div>
                        ))}
                    </div>

                    {/* COMMISSION TIER PROGRESS */}
                    <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-[2.5rem] p-8 shadow-sm">
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <Heading level="h4" className="font-black uppercase italic leading-none mb-1">{t('agencyReport.tierTitle', { defaultValue: 'Commission tier' })}</Heading>
                                <SectionTitle as="p" className="text-sub mb-0">{t('agencyReport.tierSub', { defaultValue: 'Rolling 3-month cycle' })}</SectionTitle>
                            </div>
                            {tierProgress && <Badge variant="light" color="info">{tierProgress.tier} · ฿{tierProgress.rate}/pax</Badge>}
                        </div>
                        {tierProgress ? (
                            <>
                                <div className="flex items-end justify-between mb-2">
                                    <span className="text-sm font-bold text-body">{tierProgress.prior} {t('agencyReport.paxInCycle', { defaultValue: 'pax this cycle' })}</span>
                                    {tierProgress.next
                                        ? <span className="text-xs font-black uppercase text-sub">{tierProgress.next.min_pax - tierProgress.prior} {t('agencyReport.toNext', { defaultValue: 'pax to' })} {tierProgress.next.tier} (฿{tierProgress.next.rate})</span>
                                        : <span className="text-xs font-black uppercase text-green-500">{t('agencyReport.topTier', { defaultValue: 'Top tier reached' })}</span>}
                                </div>
                                <div className="h-3 rounded-full bg-gray-100 dark:bg-gray-800 overflow-hidden">
                                    <div className="h-full bg-primary-600 rounded-full transition-all" style={{ width: `${tierProgress.pct}%` }} />
                                </div>
                            </>
                        ) : <Paragraph size="sm" color="secondary" className="leading-5">{t('agencyReport.noTier', { defaultValue: 'Commission tier not configured.' })}</Paragraph>}
                    </div>

                    {/* REPORT DOWNLOAD / PRINT */}
                    <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-[2.5rem] p-8 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
                        <div>
                            <Heading level="h4" className="text-lg font-black uppercase leading-none mb-1">{t('agencyReport.statement', { defaultValue: 'Bookings statement' })}</Heading>
                            <SectionTitle as="p" className="text-sub mb-0">{t('agencyReport.statementSub', { defaultValue: 'PDF of all your bookings' })}</SectionTitle>
                        </div>
                        <div className="flex gap-3">
                            <button disabled={reportBusy} onClick={() => handleReport('print')} className="inline-flex items-center gap-2 px-5 h-12 rounded-2xl border border-gray-200 dark:border-gray-700 font-black uppercase text-xs tracking-wider text-body hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50"><Printer className="w-4 h-4" />{t('agencyReport.print', { defaultValue: 'Print' })}</button>
                            <button disabled={reportBusy} onClick={() => handleReport('download')} className="inline-flex items-center gap-2 px-5 h-12 rounded-2xl bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-black uppercase text-xs tracking-wider hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50"><Download className="w-4 h-4" />PDF</button>
                        </div>
                    </div>
                </div>

                {/* RIGHT: invoices + pay flow */}
                <div className="col-span-12 lg:col-span-4 space-y-6">
                    <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-[2.5rem] p-8 shadow-sm flex flex-col">
                        <div className="flex items-center gap-4 mb-6">
                            <div className="size-14 rounded-2xl bg-primary-600 flex items-center justify-center text-white shadow-lg"><FileText className="w-6 h-6" /></div>
                            <div>
                                <Heading level="h4" className="font-black uppercase leading-none mb-1">{t('agencyReport.invoices', { defaultValue: 'Invoices' })}</Heading>
                                <SectionTitle as="p" className="text-sub mb-0">{t('agencyReport.invoicesSub', { defaultValue: 'Pay & track status' })}</SectionTitle>
                            </div>
                        </div>

                        <div className="flex-1 space-y-3">
                            {invoices.length === 0 ? (
                                <div className="py-10 text-center text-[10px] font-black uppercase text-sub">{t('agencyReport.noInvoices', { defaultValue: 'No invoices yet.' })}</div>
                            ) : invoices.map((inv) => {
                                const badge = STATUS_BADGE[inv.status];
                                const selectable = inv.status === 'unpaid';
                                const checked = selectedInv.includes(inv.id);
                                return (
                                    <div key={inv.id} onClick={() => selectable && toggleInv(inv.id)}
                                        className={cn("flex items-center justify-between p-4 rounded-2xl border transition-all",
                                            selectable ? "cursor-pointer" : "",
                                            checked ? "border-primary-500 bg-primary-50/50 dark:bg-primary-500/5" : "bg-gray-50 dark:bg-gray-800/50 border-gray-100 dark:border-gray-800 hover:border-primary-500/30")}>
                                        <div className="flex items-center gap-3 min-w-0">
                                            {selectable && <input type="checkbox" readOnly checked={checked} className="size-4 accent-primary-600 shrink-0" />}
                                            <div className="size-8 rounded-xl bg-white dark:bg-gray-700 flex items-center justify-center text-sub shrink-0">
                                                {inv.status === 'paid' ? <CheckCircle2 className="w-4 h-4 text-green-500" /> : inv.status === 'declared' ? <Clock className="w-4 h-4 text-blue-500" /> : <TrendingUp className="w-4 h-4" />}
                                            </div>
                                            <div className="min-w-0">
                                                <div className="text-xs font-black uppercase text-title truncate">{inv.zoho_invoice_number || t('agencyReport.invoice', { defaultValue: 'Invoice' })}</div>
                                                <div className="text-[10px] font-bold text-sub">฿{Number(inv.amount).toLocaleString()} · {inv.booking_ids?.length || 0} bk</div>
                                            </div>
                                        </div>
                                        <Badge variant="light" color={badge.color} size="sm">{badge.label}</Badge>
                                    </div>
                                );
                            })}
                        </div>

                        {/* PAY FLOW — only when unpaid invoices selected */}
                        {selectableUnpaid.length > 0 && (
                            <div className="mt-6 pt-6 border-t border-gray-100 dark:border-gray-800 space-y-3">
                                <label className="flex items-center gap-2 px-4 h-11 rounded-2xl border border-dashed border-gray-300 dark:border-gray-700 cursor-pointer text-xs font-bold text-sub hover:border-primary-500">
                                    <Upload className="w-4 h-4" />
                                    <span className="truncate">{proofFile ? proofFile.name : t('agencyReport.attachProof', { defaultValue: 'Attach payment screenshot' })}</span>
                                    <input type="file" accept="image/*,application/pdf" className="hidden" onChange={(e) => setProofFile(e.target.files?.[0] || null)} />
                                </label>
                                <button disabled={busy || selectedInv.length === 0} onClick={handleDeclare}
                                    className="w-full bg-primary-600 text-white h-12 rounded-2xl font-black uppercase text-xs tracking-[0.2em] shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-40 disabled:hover:scale-100">
                                    {busy ? t('agencyReport.sending', { defaultValue: 'Sending…' }) : `${t('agencyReport.markPaid', { defaultValue: 'Mark as paid' })} (${selectedInv.length})`}
                                </button>
                                <Caption className="text-center text-[10px] font-bold leading-normal">{t('agencyReport.payHint', { defaultValue: 'The manager confirms receipt before the invoice is closed.' })}</Caption>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </PageContainer>
    );
};

export default AgencyReports;
