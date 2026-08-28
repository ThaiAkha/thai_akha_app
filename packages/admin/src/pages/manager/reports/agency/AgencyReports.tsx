/**
 * Agency reports - UI: toolbar (asse single/week/month, ricerca), accordion agenzie con card
 * multi-selezionabili e pagamenti da confermare, inspector della selezione (dettaglio/lista, totali, PDF, fattura).
 * Stato e azioni in useAgencyReports. Estratto da ManagerReports.tsx (#16), DOM invariato.
 */
import React from 'react';
import { useTranslation } from 'react-i18next';
import Button from '../../../../components/ui/button/Button';
import { SectionTitle } from '../../../../components/typography';
import { InspectorHeader, InspectorBody, InspectorEmpty, InspectorFooter } from '../../../../components/ui/inspector/InspectorShell';
import { SegmentedToggle, ReportStatusBadge, ReportListCard, ReportLineRow } from '../../../../components/reports';
import { Briefcase, Printer, Download, Banknote, X, CalendarRange, ChevronRight, Search, FileText } from 'lucide-react';
import { SESSION_LABEL, cap, type DriverView } from '../shared';
import { Avatar, DriverHeading, LoadingCenter, ArchiveEmpty } from '../sharedUi';
import type { AgencyGran, AgencyPeriod, BookingRow, AgencyReportsState } from './useAgencyReports';

interface Props { a: AgencyReportsState; view: DriverView; }

/** Toolbar: asse single/week/month + ricerca agenzia (il toggle In progress/Archive lo mette la shell). */
export const AgencyToolbarExtras: React.FC<{ a: AgencyReportsState }> = ({ a }) => {
    const { t } = useTranslation('manager');
    return (
        <SegmentedToggle<AgencyGran>
            value={a.agencyGran}
            onChange={(g) => { a.setAgencyGran(g); a.clearAgencySel(); }}
            options={[
                { id: 'single', label: t('reports.viewSingle', { defaultValue: 'Single' }), icon: <FileText className="w-4 h-4" /> },
                { id: 'week', label: t('reports.viewWeek', { defaultValue: 'Week' }), icon: <CalendarRange className="w-4 h-4" /> },
                { id: 'month', label: t('reports.viewMonth', { defaultValue: 'Month' }), icon: <CalendarRange className="w-4 h-4" /> },
            ]}
        />
    );
};

export const AgencySearch: React.FC<{ a: AgencyReportsState }> = ({ a }) => {
    const { t } = useTranslation('manager');
    return (
        <div className="relative w-56">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            <input
                value={a.agencySearch}
                onChange={(e) => { a.setAgencySearch(e.target.value); a.clearAgencySel(); }}
                placeholder={t('reports.searchAgency', { defaultValue: 'Search agency…' })}
                className="w-full h-9 pl-9 pr-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-title placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
            />
        </div>
    );
};

// Multi-select cards (click toggles selection; many can be active to unify report/invoice).
const PeriodCard: React.FC<{ a: AgencyReportsState; p: AgencyPeriod }> = ({ a, p }) => {
    const { t } = useTranslation('manager');
    return (
        <ReportListCard
            selected={a.selectedKeys.includes(p.key)}
            onClick={(e) => { e.stopPropagation(); a.toggleKey(p.key); }}
            title={p.label}
            amount={p.net.toLocaleString()}
            meta={<>
                <span className="text-xs font-bold uppercase tracking-wider text-sub">{p.count} {t('reports.bookingsShort', { defaultValue: 'bookings' })} · {p.pax} pax</span>
                <ReportStatusBadge tone={p.invoiced ? 'green' : 'amber'}>{p.invoiced ? t('reports.invoiced', { defaultValue: 'Invoiced' }) : t('reports.toInvoice', { defaultValue: 'To invoice' })}</ReportStatusBadge>
            </>}
        />
    );
};
const BookingCard: React.FC<{ a: AgencyReportsState; b: BookingRow }> = ({ a, b }) => {
    const { t } = useTranslation('manager');
    const net = Number(b.total_price || 0); // total_price È GIÀ il net
    return (
        <ReportListCard
            selected={a.selectedKeys.includes(b.internal_id)}
            onClick={(e) => { e.stopPropagation(); a.toggleKey(b.internal_id); }}
            title={`${new Date(b.booking_date + 'T00:00:00').toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })} · ${b.guest_name || b.booking_ref || '—'}`}
            amount={net.toLocaleString()}
            meta={<>
                <span className="text-xs font-bold uppercase tracking-wider text-sub">{SESSION_LABEL[b.session_id ?? ''] ?? b.session_id ?? ''} · {b.pax_count} pax</span>
                <ReportStatusBadge tone={b.zoho_invoice_id ? 'green' : 'amber'}>{b.zoho_invoice_id ? t('reports.invoiced', { defaultValue: 'Invoiced' }) : t('reports.toInvoice', { defaultValue: 'To invoice' })}</ReportStatusBadge>
            </>}
        />
    );
};

/** Colonna centro: accordion (una agenzia aperta alla volta) con card single/week/month multi-selezionabili. */
export const AgencyCenter: React.FC<Props> = ({ a, view }) => {
    const { t } = useTranslation('manager');
    const { filteredAgencies, agencyGran, expandedAgency, periodsByAgency, declaredByAgency, invoiceBusy } = a;
    if (filteredAgencies === null) return <LoadingCenter label={t('driverPayouts.loading', { defaultValue: 'Loading…' })} />;
    if (filteredAgencies.length === 0) return <ArchiveEmpty view={view} pendingLabel={t('reports.nothingPending', { defaultValue: 'Nothing in progress.' })} archiveLabel={t('reports.noArchive', { defaultValue: 'No archived reports.' })} />;
    return (
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
                            onClick={() => a.toggleAgency(ag.id)}
                            aria-expanded={open}
                            className={`w-full flex items-center gap-3 px-2 py-3 rounded-xl transition-colors ${open ? 'bg-gray-50 dark:bg-gray-800/60' : 'hover:bg-gray-50 dark:hover:bg-gray-800/40'} focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500`}
                        >
                            <Avatar src={ag.avatar} name={ag.name} />
                            <div className="flex-1 text-left min-w-0">
                                <DriverHeading>{ag.name}</DriverHeading>
                                <span className="block text-xs font-bold uppercase tracking-wider text-sub">{ag.totalPax} pax · {ag.bookings.length} {t('reports.bookingsShort', { defaultValue: 'bookings' })}</span>
                            </div>
                            <ChevronRight className={`w-5 h-5 text-gray-400 shrink-0 transition-transform ${open ? 'rotate-90' : ''}`} />
                        </button>
                        {open && (
                            <div className="px-2 pb-4 pt-2 space-y-2">
                                <div className="flex items-center justify-between px-1 pb-1">
                                    <span className="text-xs font-bold uppercase tracking-wider text-sub">{t('reports.autoInvoice', { defaultValue: 'Auto-invoice each booking' })}</span>
                                    <button role="switch" aria-checked={ag.autoInvoice} onClick={(e) => { e.stopPropagation(); a.handleToggleAuto(ag.id, !ag.autoInvoice); }}
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
                                                <button onClick={(e) => { e.stopPropagation(); a.handleConfirmPayment(decl.map(i => i.id)); }} disabled={invoiceBusy} className="text-xs font-bold px-2.5 py-1 rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50">{t('reports.confirmAll', { defaultValue: 'Confirm all' })}</button>
                                            </div>
                                            {decl.map(inv => (
                                                <div key={inv.id} className="flex items-center justify-between gap-2 text-sm">
                                                    <span className="font-medium text-body truncate">{inv.zoho_invoice_number || t('reports.invoice', { defaultValue: 'Invoice' })} · ฿{Number(inv.amount).toLocaleString()}</span>
                                                    <div className="flex items-center gap-2 shrink-0">
                                                        {inv.payment_proof_url && <button onClick={(e) => { e.stopPropagation(); a.viewProof(inv.payment_proof_url!); }} className="text-xs text-blue-600 hover:underline">{t('reports.viewProof', { defaultValue: 'Screenshot' })}</button>}
                                                        <button onClick={(e) => { e.stopPropagation(); a.handleConfirmPayment([inv.id]); }} disabled={invoiceBusy} className="text-xs font-bold px-2 py-1 rounded-lg border border-blue-300 dark:border-blue-500/40 text-blue-700 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-500/10 disabled:opacity-50">{t('reports.confirm', { defaultValue: 'Confirm' })}</button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    );
                                })()}
                                {count === 0 ? (
                                    <div className="px-1 text-sm text-sub">{view === 'active' ? t('reports.nothingPending', { defaultValue: 'Nothing in progress.' }) : t('reports.noArchive', { defaultValue: 'No archived reports.' })}</div>
                                ) : agencyGran === 'single' ? items.map(b => <BookingCard key={b.internal_id} a={a} b={b} />) : periods.map(p => <PeriodCard key={p.key} a={a} p={p} />)}
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
    );
};

// Label/value row for the single-booking detail.
const kv = (label: string, value: React.ReactNode) => value ? (
    <div className="flex justify-between gap-4 py-1.5 border-b border-gray-100 dark:border-gray-800 last:border-0">
        <span className="text-sm text-sub shrink-0">{label}</span>
        <span className="text-sm font-bold text-body text-right">{value}</span>
    </div>
) : null;

/** Inspector: selezione corrente (dettaglio singolo o lista), totali gross/commission/net, PDF, fattura Zoho. */
export const AgencyInspector: React.FC<{ a: AgencyReportsState }> = ({ a }) => {
    const { t } = useTranslation('manager');
    const { expAgency, selectedBookings, selTotals, agencyGran, expandedAgency, reportBusy, invoiceBusy } = a;
    if (!(expAgency && selectedBookings.length > 0)) {
        return <InspectorEmpty icon={<Briefcase className="w-8 h-8" />} hint={!expandedAgency ? t('reports.openAgency', { defaultValue: 'Open an agency, then select bookings to combine.' }) : agencyGran === 'single' ? t('reports.selectBooking', { defaultValue: 'Select one or more bookings to unify.' }) : t('reports.selectPeriod', { defaultValue: 'Select one or more periods to unify.' })} />;
    }
    return (
        <>
            <InspectorHeader
                size="lg"
                leading={<Avatar src={expAgency.avatar} name={expAgency.name} className="size-12" textClassName="text-base" />}
                subtitle={expAgency.name}
                title={`${selTotals.count} ${t('reports.selected', { defaultValue: 'selected' })} · ${selTotals.pax} pax`}
                onClose={a.clearAgencySel}
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
                                <button aria-label={t('reports.remove', { defaultValue: 'Remove' })} onClick={() => a.toggleKey(b.internal_id)} className="p-1.5 rounded-lg text-sub hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-500/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500"><X className="w-5 h-5" /></button>
                            ) : undefined}
                        />
                    ))}
                </InspectorBody>
            )}
            <InspectorFooter className="pb-[80px]">
                <div className="space-y-1 mb-1">
                    <div className="flex justify-between text-sm"><span className="text-sub">{t('reports.gross', { defaultValue: 'Gross' })}</span><span className="font-mono font-bold text-body">{selTotals.gross.toLocaleString()}</span></div>
                    <div className="flex justify-between text-sm"><span className="text-sub">{t('reports.commission', { defaultValue: 'Commission' })}</span><span className="font-mono font-bold text-amber-600 dark:text-amber-400">− {selTotals.commission.toLocaleString()}</span></div>
                    <div className="flex justify-between items-end pt-1 border-t border-gray-200 dark:border-gray-700">
                        <SectionTitle className="text-sub mb-0">{t('reports.netDue', { defaultValue: 'Net due' })}</SectionTitle>
                        <span className="font-mono text-2xl font-black text-title">{selTotals.net.toLocaleString()} <span className="text-sm text-sub font-normal">THB</span></span>
                    </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                    <Button variant="outline" size="sm" disabled={reportBusy} startIcon={<Printer className="w-4 h-4" />} onClick={() => a.handleAgencyReport('print')}>{t('driverPayouts.print', { defaultValue: 'Print' })}</Button>
                    <Button variant="outline" size="sm" disabled={reportBusy} startIcon={<Download className="w-4 h-4" />} onClick={() => a.handleAgencyReport('download')}>PDF</Button>
                </div>
                {/* Invoice to Zoho — crea la fattura per la selezione (solo su click + conferma) */}
                {selectedBookings.some(b => b.zoho_invoice_id) ? (
                    <p className="text-center text-xs text-sub mt-2">{t('reports.alreadyInvoiced', { defaultValue: 'Invoiced in Zoho.' })}</p>
                ) : (
                    <Button variant="primary" size="sm" className="w-full mt-2" disabled={invoiceBusy} startIcon={<Banknote className="w-4 h-4" />} onClick={a.handleAgencyInvoice}>{invoiceBusy ? t('driverPayouts.processing', { defaultValue: 'Processing…' }) : t('reports.invoiceZoho', { defaultValue: 'Invoice to Zoho' })}</Button>
                )}
            </InspectorFooter>
        </>
    );
};
