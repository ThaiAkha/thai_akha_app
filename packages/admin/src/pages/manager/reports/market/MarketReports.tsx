/**
 * Market reports - UI: toggle giorno/mese (teacher), colonna centro (run o mesi), inspector (run o mese).
 * Stato e azioni in useMarketReports. Estratto da ManagerReports.tsx (#16), DOM invariato.
 */
import React from 'react';
import { useTranslation } from 'react-i18next';
import Button from '../../../../components/ui/button/Button';
import { Paragraph, SectionTitle } from '../../../../components/typography';
import { InspectorHeader, InspectorBody, InspectorEmpty, InspectorFooter } from '../../../../components/ui/inspector/InspectorShell';
import { SegmentedToggle, ReportStatusBadge, ReportListCard, ReportLineRow } from '../../../../components/reports';
import { Printer, Download, Banknote, History, Sunrise, Pencil, Trash2, CalendarRange, ChevronRight } from 'lucide-react';
import { type DriverView } from '../shared';
import { LoadingCenter, ArchiveEmpty } from '../sharedUi';
import type { Gran, MarketRunRow, MonthGroup, MarketReportsState } from './useMarketReports';

interface Props { m: MarketReportsState; view: DriverView; isTeacher: boolean; }

/** Toolbar: asse giorno/mese, solo per Market · Kitchen (teacher). */
export const MarketToolbarExtras: React.FC<{ m: MarketReportsState; isTeacher: boolean }> = ({ m, isTeacher }) => {
    const { t } = useTranslation('manager');
    if (!isTeacher) return null;
    return (
        <SegmentedToggle<Gran>
            value={m.gran}
            onChange={(g) => { m.setGran(g); m.setSelectedRunId(null); m.setSelectedMonth(null); }}
            options={[
                { id: 'day', label: t('reports.viewDay', { defaultValue: 'Day' }), icon: <Sunrise className="w-4 h-4" /> },
                { id: 'month', label: t('reports.viewMonth', { defaultValue: 'Month' }), icon: <CalendarRange className="w-4 h-4" /> },
            ]}
        />
    );
};

const RunCard: React.FC<{ m: MarketReportsState; r: MarketRunRow }> = ({ m, r }) => (
    <ReportListCard
        selected={m.selectedRunId === r.id}
        onClick={(e) => { e.stopPropagation(); m.setSelectedRunId(r.id); }}
        title={new Date(r.run_date + 'T00:00:00').toLocaleDateString('en-GB', { weekday: 'short', day: '2-digit', month: 'short', year: 'numeric' })}
        amount={r.total_cost.toLocaleString()}
        meta={<>
            <span className="text-xs font-bold uppercase tracking-wider text-sub">{r.items.length} items</span>
            {r.shopper && <span className="text-xs font-bold text-sub truncate">· {r.shopper}</span>}
            <ReportStatusBadge tone={r.archived ? 'green' : 'amber'}>{r.status}</ReportStatusBadge>
        </>}
    />
);

const MonthCard: React.FC<{ m: MarketReportsState; mg: MonthGroup }> = ({ m, mg }) => {
    const { t } = useTranslation('manager');
    return (
        <ReportListCard
            selected={m.selectedMonth === mg.key}
            onClick={(e) => { e.stopPropagation(); m.setSelectedRunId(null); m.setSelectedMonth(mg.key); }}
            title={mg.label}
            amount={mg.total.toLocaleString()}
            meta={<>
                <span className="text-xs font-bold uppercase tracking-wider text-sub">{mg.days} {t('reports.days', { defaultValue: 'days' })}</span>
                <ReportStatusBadge tone={mg.archived ? 'green' : 'amber'}>{mg.archived ? t('reports.expensed', { defaultValue: 'Expensed' }) : t('reports.open', { defaultValue: 'Open' })}</ReportStatusBadge>
            </>}
        />
    );
};

/** Colonna centro: mesi (teacher in modalita' month) oppure run del giorno. */
export const MarketCenter: React.FC<Props> = ({ m, view, isTeacher }) => {
    const { t } = useTranslation('manager');
    const loading = <LoadingCenter label={t('driverPayouts.loading', { defaultValue: 'Loading…' })} />;
    const empty = <ArchiveEmpty view={view} pendingLabel={t('reports.nothingPending', { defaultValue: 'Nothing in progress.' })} archiveLabel={t('reports.noArchive', { defaultValue: 'No archived reports.' })} />;
    if (isTeacher && m.gran === 'month') {
        if (m.months === null) return loading;
        const list = m.months.filter(mg => view === 'active' ? !mg.archived : mg.archived);
        return list.length === 0 ? empty : <div className="p-4 space-y-2">{list.map(mg => <MonthCard key={mg.key} m={m} mg={mg} />)}</div>;
    }
    if (m.marketRuns === null) return loading;
    const list = m.marketRuns.filter(r => view === 'active' ? !r.archived : r.archived);
    return list.length === 0 ? empty : <div className="p-4 space-y-2">{list.map(r => <RunCard key={r.id} m={m} r={r} />)}</div>;
};

/** Inspector: mese selezionato (teacher/month) oppure run selezionato. */
export const MarketInspector: React.FC<Props> = ({ m, isTeacher }) => {
    const { t } = useTranslation('manager');
    const { selMonth, selRun, busy, reportBusy } = m;
    if (isTeacher && m.gran === 'month') {
        if (!selMonth) return <InspectorEmpty icon={<CalendarRange className="w-8 h-8" />} hint={t('reports.selectMonth', { defaultValue: 'Select a month to see its days.' })} />;
        return (
            <>
                <InspectorHeader subtitle={t('reports.typeTeacher', { defaultValue: 'Market · Kitchen' })} title={selMonth.label} onClose={() => m.setSelectedMonth(null)} />
                <InspectorBody className="p-4 space-y-2">
                    {selMonth.runs.map(r => (
                        <ReportLineRow
                            key={r.id}
                            title={new Date(r.run_date + 'T00:00:00').toLocaleDateString('en-GB', { weekday: 'short', day: '2-digit', month: 'short' })}
                            subtitle={`${r.items.length} ${t('reports.items', { defaultValue: 'items' })}`}
                            amount={r.total_cost.toLocaleString()}
                            actions={
                                <button aria-label="Open day" onClick={() => m.openDayFromMonth(r.id)} className="p-1.5 rounded-lg text-gray-400 hover:text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-500/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"><ChevronRight className="w-5 h-5" /></button>
                            }
                        />
                    ))}
                </InspectorBody>
                <InspectorFooter className="pb-[80px]">
                    <div className="flex justify-between items-end">
                        <SectionTitle className="text-sub mb-0">{t('driverPayouts.total', { defaultValue: 'Total' })}</SectionTitle>
                        <span className="font-mono text-2xl font-black text-title">{selMonth.total.toLocaleString()} <span className="text-sm text-sub font-normal">THB</span></span>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                        <Button variant="outline" size="sm" disabled={reportBusy} startIcon={<Printer className="w-4 h-4" />} onClick={() => m.handleMonthlyReport(selMonth, 'print')}>{t('driverPayouts.print', { defaultValue: 'Print' })}</Button>
                        <Button variant="outline" size="sm" disabled={reportBusy} startIcon={<Download className="w-4 h-4" />} onClick={() => m.handleMonthlyReport(selMonth, 'download')}>PDF</Button>
                    </div>
                    {!selMonth.archived && (
                        <Button variant="primary" size="md" className="w-full justify-center" disabled={busy} startIcon={<Banknote className="w-4 h-4" />} onClick={() => m.handleMonthlyExpense(selMonth)}>
                            {t('reports.createZohoExpenseMonth', { defaultValue: 'Create Zoho expense (monthly)' })}
                        </Button>
                    )}
                </InspectorFooter>
            </>
        );
    }
    if (!selRun) return <InspectorEmpty icon={<History className="w-8 h-8" />} hint={t('reports.selectWeek', { defaultValue: 'Select a report to see the detail.' })} />;
    return (
        <>
            <InspectorHeader subtitle={`${isTeacher ? t('reports.typeTeacher', { defaultValue: 'Market · Kitchen' }) : t('reports.typeLogistic', { defaultValue: 'Market · Logistic' })}${selRun.shopper ? ` · ${selRun.shopper}` : ''}`} title={new Date(selRun.run_date + 'T00:00:00').toLocaleDateString('en-GB', { weekday: 'short', day: '2-digit', month: 'short', year: 'numeric' })} onClose={() => m.setSelectedRunId(null)} />
            <InspectorBody className="p-4 space-y-2">
                {selRun.items.length === 0 ? (
                    <div className="text-sm text-sub px-1">{t('reports.noItems', { defaultValue: 'No items.' })}</div>
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
                    <SectionTitle className="text-sub mb-0">{t('driverPayouts.total', { defaultValue: 'Total' })}</SectionTitle>
                    <span className="font-mono text-2xl font-black text-title">{selRun.total_cost.toLocaleString()} <span className="text-sm text-sub font-normal">THB</span></span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                    <Button variant="outline" size="sm" disabled={reportBusy} startIcon={<Printer className="w-4 h-4" />} onClick={() => m.handleRunReport(selRun, 'print')}>{t('driverPayouts.print', { defaultValue: 'Print' })}</Button>
                    <Button variant="outline" size="sm" disabled={reportBusy} startIcon={<Download className="w-4 h-4" />} onClick={() => m.handleRunReport(selRun, 'download')}>PDF</Button>
                </div>
                {!selRun.archived && (
                    <>
                        <div className="grid grid-cols-2 gap-2">
                            <Button variant="outline" size="sm" disabled={busy} startIcon={<Pencil className="w-4 h-4" />} onClick={() => m.handleEditRun(selRun)}>{t('reports.editList', { defaultValue: 'Edit list' })}</Button>
                            <button disabled={busy} onClick={() => m.handleDeleteRun(selRun)} className="inline-flex items-center justify-center gap-1.5 h-9 rounded-lg border border-red-200 dark:border-red-500/30 text-sm font-bold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500"><Trash2 className="w-4 h-4" /> {t('reports.delete', { defaultValue: 'Delete' })}</button>
                        </div>
                        {/* BYPASS-PAYOUT — Crea Zoho Expense: SOLO logistics, e SOLO se la lista è confermata (status != 'planned') */}
                        {!isTeacher && (
                            <>
                                <Button variant="primary" size="md" className="w-full justify-center" disabled={busy || selRun.status === 'planned'} startIcon={<Banknote className="w-4 h-4" />} onClick={() => m.handleMarketExpense(selRun)}>
                                    {t('reports.createZohoExpense', { defaultValue: 'Create Zoho expense' })}
                                </Button>
                                {selRun.status === 'planned' && (
                                    <Paragraph size="xs" className="-mt-1 text-center font-bold text-amber-600 dark:text-amber-400 leading-4">
                                        {t('reports.confirmListFirst', { defaultValue: 'Confirm the list before billing in Zoho.' })}
                                    </Paragraph>
                                )}
                            </>
                        )}
                    </>
                )}
            </InspectorFooter>
        </>
    );
};
