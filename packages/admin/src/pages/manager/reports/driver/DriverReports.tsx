/**
 * Driver reports - UI: toolbar extra (select driver in archivio), colonna centro, inspector.
 * Stato e azioni in useDriverReports. Estratto da ManagerReports.tsx (#16), DOM invariato.
 */
import React from 'react';
import { useTranslation } from 'react-i18next';
import { cn } from '@thaiakha/shared/lib/utils';
import SelectField from '../../../../components/form/input/SelectField';
import Button from '../../../../components/ui/button/Button';
import { SectionTitle } from '../../../../components/typography';
import { InspectorHeader, InspectorBody, InspectorEmpty, InspectorFooter } from '../../../../components/ui/inspector/InspectorShell';
import { ReportStatusBadge, ReportListCard, ReportLineRow } from '../../../../components/reports';
import { Printer, Download, Banknote, History, Archive, Sunrise, Sunset, Check, X } from 'lucide-react';
import { SESSION_LABEL, fmtRange, type DriverView } from '../shared';
import { Avatar, DriverHeading, LoadingCenter } from '../sharedUi';
import { STOPS_RANGES, rangeOfStops, type DriverReport, type WeekGroup, type DriverReportsState } from './useDriverReports';

interface Props { d: DriverReportsState; view: DriverView; }

/** Toolbar: select del driver in modalita' archivio (solo se ci sono report). */
export const DriverToolbarExtras: React.FC<Props> = ({ d, view }) => {
    const { t } = useTranslation('manager');
    if (!(view === 'archive' && d.reports && d.reports.length > 0)) return null;
    return (
        <div className="w-56">
            <SelectField value={d.archiveDriverId} onChange={(e) => { d.setArchiveDriverId(e.target.value); d.setSelected(null); }}>
                <option value="">{t('reports.pickDriver', { defaultValue: 'Select a driver…' })}</option>
                {d.reports.map(dr => <option key={dr.id} value={dr.id}>{dr.name}</option>)}
            </SelectField>
        </div>
    );
};

const WeekCard: React.FC<{ d: DriverReportsState; driver: DriverReport; w: WeekGroup }> = ({ d, driver, w }) => {
    const { t } = useTranslation('manager');
    return (
        <ReportListCard
            selected={d.selected?.driverId === driver.id && d.selected?.weekKey === w.key}
            onClick={(e) => { e.stopPropagation(); d.setEditing(null); d.setSelected({ driverId: driver.id, weekKey: w.key }); }}
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
};

/** Colonna centro: "In progress" (tutti i driver) oppure "Archive" (un driver scelto). */
export const DriverCenter: React.FC<Props> = ({ d, view }) => {
    const { t } = useTranslation('manager');
    if (d.reports === null) return <LoadingCenter label={t('driverPayouts.loading', { defaultValue: 'Loading…' })} />;
    if (view === 'active') {
        // IN PROGRESS — all drivers exposed, non-archived weeks
        return (
            <div className="p-4 divide-y divide-gray-200 dark:divide-gray-800">
                {d.reports.map(dr => {
                    const active = dr.weeks.filter(w => !w.archived);
                    return (
                        <div key={dr.id} className="py-8 first:pt-0 last:pb-0">
                            <div className="flex items-center gap-3 mb-4 px-1">
                                <Avatar src={dr.avatar} name={dr.name} />
                                <DriverHeading>{dr.name}</DriverHeading>
                            </div>
                            {active.length === 0 ? (
                                <div className="px-1 text-sm text-gray-400">{t('reports.nothingPending', { defaultValue: 'Nothing in progress.' })}</div>
                            ) : (
                                <div className="space-y-2">{active.map(w => <WeekCard key={w.key} d={d} driver={dr} w={w} />)}</div>
                            )}
                        </div>
                    );
                })}
            </div>
        );
    }
    // ARCHIVE — pick a driver, see their billed weeks
    const archiveDriver = d.archiveDriver;
    return (
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
                            <div className="space-y-2">{archived.map(w => <WeekCard key={w.key} d={d} driver={archiveDriver} w={w} />)}</div>
                        )}
                    </div>
                );
            })()}
        </div>
    );
};

/** Inspector: settimana selezionata (righe giorno, edit inline, totale, PDF, paga & fattura). */
export const DriverInspector: React.FC<{ d: DriverReportsState }> = ({ d }) => {
    const { t } = useTranslation('manager');
    const { week, selDriver, editing, busy, reportBusy } = d;
    if (!(week && selDriver)) {
        return <InspectorEmpty icon={<History className="w-8 h-8" />} hint={t('reports.selectWeek', { defaultValue: 'Select a report to see the detail.' })} />;
    }
    return (
        <>
            <InspectorHeader
                size="lg"
                leading={<Avatar src={selDriver.avatar} name={selDriver.name} className="size-12" textClassName="text-base" />}
                subtitle={selDriver.name}
                title={fmtRange(week.start, week.end)}
                onClose={() => d.setSelected(null)}
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
                            onEdit={canManage && !isEditing ? () => d.setEditing({ driverId: selDriver.id, run_date: r.run_date, session_id: r.session_id, range: rangeOfStops(r.total_stops), pax: String(r.total_pax) }) : undefined}
                            onDelete={canManage && !isEditing ? () => d.handleDeleteRow(selDriver.id, r) : undefined}
                            confirmDelete={{ title: t('driverPayouts.confirmDeleteTitle', { defaultValue: 'Delete service entry?' }), message: t('driverPayouts.confirmDelete', { defaultValue: 'This will remove the driver service for this day. This cannot be undone.' }) }}
                        >
                            {isEditing && editing && (
                                <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700 space-y-2">
                                    <div className="flex bg-gray-100 dark:bg-gray-800 p-1 rounded-lg">
                                        {STOPS_RANGES.map(rg => (
                                            <button key={rg} onClick={() => d.setEditing({ ...editing, range: rg })} className={cn('flex-1 px-2 h-8 rounded-md text-xs font-bold transition-all', editing.range === rg ? 'bg-white dark:bg-gray-700 text-primary-600 dark:text-primary-400 shadow-sm' : 'text-gray-500 hover:text-gray-900 dark:hover:text-gray-200')}>{rg === '7plus' ? '7+' : rg}</button>
                                        ))}
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <label className="text-xs font-bold uppercase text-gray-400">pax</label>
                                        <input type="number" min={0} value={editing.pax} onChange={(e) => d.setEditing({ ...editing, pax: e.target.value })} className="w-20 h-9 px-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500" />
                                        <div className="flex-1" />
                                        <Button variant="primary" size="sm" disabled={busy} startIcon={<Check className="w-4 h-4" />} onClick={d.handleSaveEdit}>{t('driverPayouts.save', { defaultValue: 'Save' })}</Button>
                                        <Button variant="outline" size="sm" disabled={busy} startIcon={<X className="w-4 h-4" />} onClick={() => d.setEditing(null)}>{t('driverPayouts.cancel', { defaultValue: 'Cancel' })}</Button>
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
                    <Button variant="outline" size="sm" disabled={reportBusy} startIcon={<Printer className="w-4 h-4" />} onClick={() => d.handleReport(selDriver.id, selDriver.name, week, 'print')}>{t('driverPayouts.print', { defaultValue: 'Print' })}</Button>
                    <Button variant="outline" size="sm" disabled={reportBusy} startIcon={<Download className="w-4 h-4" />} onClick={() => d.handleReport(selDriver.id, selDriver.name, week, 'download')}>PDF</Button>
                </div>
                {!week.archived && (
                    <Button variant="primary" size="md" className="w-full justify-center" disabled={busy} startIcon={<Banknote className="w-4 h-4" />} onClick={() => d.handlePayBill(selDriver.id, week)}>
                        {t('driverPayouts.payBill', { defaultValue: 'Mark paid & bill (Zoho)' })}
                    </Button>
                )}
            </InspectorFooter>
        </>
    );
};
