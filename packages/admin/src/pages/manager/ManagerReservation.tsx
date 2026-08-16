// MULTI-KITCHEN — ManagerReservation a 3 pannelli:
//  SINISTRA : nav giorni (Oggi → +7) con Morning/Evening e pax.
//  CENTRO   : 2 colonne Teacher 01 / Teacher 02 (+ "Da assegnare" se serve). Card = gruppo (booking);
//             segmented = assegna a una teacher (AUTOSALVANTE via set_booking_kitchen); click card = seleziona.
//  DESTRA   : inspector booking esistente (modifica pax/data, cancella) sul gruppo selezionato.
import React from 'react';
import { useTranslation } from 'react-i18next';
import { cn } from '@thaiakha/shared/lib/utils';
import { Users, Hotel, Car, Loader2, CalendarDays } from 'lucide-react';
import PageMeta from '../../components/common/PageMeta';
import { DataExplorerLayout, DataExplorerInspector } from '../../components/data-explorer';
import { Heading } from '../../components/typography';
import DaysSidebar, { dayLabel, type DaySession } from '../../components/common/DaysSidebar';
import { useDaysOverview } from '../../hooks/useDaysOverview';

import ReservationInspector from '../../components/manager/reservation/ReservationInspector';
import ReservationInspectorActions from '../../components/manager/reservation/ReservationInspectorActions';
import { useManagerReservation } from '../../hooks/useManagerReservation';

const shortKitchen = (name: string) => name.replace(/teacher\s*/i, 'T').replace(/kitchen\s*/i, 'K');

const ManagerReservation: React.FC<{ onNavigate?: (page: string) => void }> = ({ onNavigate: _onNavigate }) => {
    const { t } = useTranslation('reservation');
    const { t: tm } = useTranslation('manager');
    const {
        bookings, selectedBooking, editData, loading, isSaving, isEditing,
        globalDate, globalSession, kitchens, driverNames, movingId,
        setGlobalDate, setGlobalSession, setEditData,
        handleSelectBooking, handleEditStart, handleSave,
        closeInspector, moveKitchen,
    } = useManagerReservation();
    const { days } = useDaysOverview(6); // nav giorni riusabile (oggi → +6)
    const daySession: DaySession = globalSession === 'evening_class' ? 'evening_class' : 'morning_class';

    // Gruppi attivi del giorno+sessione selezionati, divisi per teacher (+ "Da assegnare").
    const active = bookings.filter((b: any) => b.status !== 'cancelled');
    const columns: { id: string | null; name: string; items: any[] }[] = kitchens.map(k => ({
        id: k.id, name: k.full_name, items: active.filter((b: any) => b.kitchen_id === k.id),
    }));
    const unassigned = active.filter((b: any) => !b.kitchen_id);
    if (unassigned.length) columns.push({ id: null, name: tm('groupsPlanner.unassigned', { defaultValue: 'Unassigned' }), items: unassigned });

    return (
        <>
            <PageMeta title={t('meta.title')} description={t('meta.description')} />

            <DataExplorerLayout
                viewMode="table"
                inspectorOpen={true}
                onInspectorClose={closeInspector}
                sidebar={
                    <DaysSidebar
                        days={days}
                        selectedDate={globalDate}
                        selectedSession={daySession}
                        onSelect={(date, session) => { setGlobalDate(date); setGlobalSession(session); closeInspector(); }}
                    />
                }
                toolbar={
                    <div className="h-16 px-5 border-b border-gray-200 dark:border-gray-800 flex items-center gap-3 bg-gray-50/50 dark:bg-gray-900/50 shadow-sm shrink-0">
                        <Users className="w-5 h-5 text-primary-500" />
                        <span className="text-base font-bold text-gray-900 dark:text-white">
                            {dayLabel(globalDate, tm)} · {globalSession === 'evening_class' ? tm('groupsPlanner.evening', { defaultValue: 'Evening' }) : tm('groupsPlanner.morning', { defaultValue: 'Morning' })}
                        </span>
                        <span className="ml-auto text-sm font-bold text-gray-400">{active.reduce((a: number, b: any) => a + (b.pax_count || 0), 0)} pax · {active.length} {tm('groupsPlanner.groups', { defaultValue: 'groups' })}</span>
                    </div>
                }
                inspector={
                    <DataExplorerInspector
                        isEditing={isEditing}
                        onClose={closeInspector}
                        headerActions={
                            <ReservationInspectorActions
                                isEditing={isEditing}
                                handleEditStart={handleEditStart}
                                handleSave={handleSave}
                                isSaving={isSaving}
                                selectedBooking={selectedBooking}
                            />
                        }
                    >
                        <ReservationInspector
                            selectedBooking={selectedBooking}
                            isEditing={isEditing}
                            editData={editData}
                            onEditChange={setEditData}
                        />
                    </DataExplorerInspector>
                }
            >
                {/* CENTRO — colonne teacher */}
                {loading ? (
                    <div className="p-10 text-base text-gray-400">{t('messages.loading', { defaultValue: 'Loading…' })}</div>
                ) : active.length === 0 ? (
                    <div className="py-20 text-center flex flex-col items-center gap-3 text-gray-400">
                        <CalendarDays className="w-12 h-12 opacity-40" />
                        <p className="text-base">{tm('groupsPlanner.empty', { defaultValue: 'No bookings for this session.' })}</p>
                    </div>
                ) : (
                    <div className="flex flex-wrap items-start [gap:var(--space-fluid-m,1.5rem)] [padding:var(--space-fluid-s,1rem)]">
                        {columns.map(col => {
                            const pax = col.items.reduce((a, b) => a + (b.pax_count ?? 0), 0);
                            return (
                                <div key={col.id ?? 'unassigned'} className="flex-1 min-w-[280px] flex flex-col [gap:var(--space-fluid-2xs,0.5rem)]">
                                    <div className="flex items-center justify-between px-1 mb-1">
                                        <Heading level="h4">{col.name}</Heading>
                                        <span className="text-xs font-black uppercase tracking-wider text-gray-400">
                                            {tm('groupsPlanner.colTotal', { defaultValue: '{{count}} groups · {{pax}} pax', count: col.items.length, pax })}
                                        </span>
                                    </div>

                                    {col.items.length === 0 && (
                                        <div className="rounded-xl border border-dashed border-gray-200 dark:border-gray-700 py-8 text-center">
                                            <p className="text-sm text-gray-400">{tm('groupsPlanner.colEmpty', { defaultValue: 'No groups' })}</p>
                                        </div>
                                    )}

                                    {col.items.map((b: any) => {
                                        const isSel = selectedBooking?.internal_id === b.internal_id;
                                        const paid = b.payment_status === 'paid' || b.payment_status === 'completed' || b.payment_status === 'succeeded';
                                        return (
                                            <div
                                                key={b.internal_id}
                                                onClick={() => handleSelectBooking(b)}
                                                className={cn('rounded-xl border bg-white dark:bg-white/[0.02] [padding:var(--space-fluid-2xs,0.75rem)] cursor-pointer transition-colors',
                                                    isSel ? 'border-primary-500 ring-1 ring-primary-500/40' : 'border-gray-200 dark:border-gray-700 hover:border-primary-400')}
                                            >
                                                <div className="flex items-start justify-between gap-2">
                                                    <div className="min-w-0">
                                                        <div className="text-base font-bold text-gray-900 dark:text-white truncate">{b.guest_name || b.profiles?.full_name || b.guest_email || b.booking_ref || '—'}</div>
                                                        {b.booking_ref && <div className="mt-0.5 text-xs font-mono text-gray-400">{b.booking_ref}</div>}
                                                    </div>
                                                    <span className={cn('shrink-0 text-xs font-black uppercase tracking-wider px-2 py-0.5 rounded',
                                                        paid ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400' : 'bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400')}>
                                                        {paid ? 'Paid' : (b.payment_status || 'Unpaid')}
                                                    </span>
                                                </div>

                                                <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-gray-500 dark:text-gray-400">
                                                    <span className="inline-flex items-center gap-1"><Users className="size-4" />{b.pax_count ?? 0} pax</span>
                                                    {b.hotel_name && <span className="inline-flex items-center gap-1 min-w-0"><Hotel className="size-4 shrink-0" /><span className="truncate">{b.hotel_name}</span></span>}
                                                    {b.pickup_driver_uid && <span className="inline-flex items-center gap-1"><Car className="size-4" />{driverNames[b.pickup_driver_uid] || '—'}</span>}
                                                </div>

                                                {/* Segmented: assegna a una teacher (autosave). Stop propagation per non selezionare. */}
                                                <div className="mt-3 flex gap-1.5" onClick={(e) => e.stopPropagation()}>
                                                    {kitchens.map(k => {
                                                        const isCurrent = b.kitchen_id === k.id;
                                                        const busy = movingId === b.internal_id;
                                                        return (
                                                            <button
                                                                key={k.id}
                                                                type="button"
                                                                disabled={isCurrent || busy}
                                                                onClick={() => moveKitchen(b.internal_id, k.id)}
                                                                className={cn('flex-1 h-9 rounded-lg text-sm font-bold border transition-colors inline-flex items-center justify-center gap-1',
                                                                    isCurrent ? 'bg-primary-500 text-white border-primary-500 cursor-default'
                                                                        : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:border-primary-500 hover:text-primary-600 disabled:opacity-50')}
                                                            >
                                                                {busy && !isCurrent ? <Loader2 className="size-4 animate-spin" /> : shortKitchen(k.full_name)}
                                                            </button>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            );
                        })}
                    </div>
                )}
            </DataExplorerLayout>
        </>
    );
};

export default ManagerReservation;
