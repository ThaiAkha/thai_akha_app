import React, { useState, useCallback, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import PageMeta from '../../components/common/PageMeta';
import {
    DataExplorerLayout,
    DataExplorerInspector,
} from '../../components/data-explorer';
import DaysSidebar, { type DaySession } from '../../components/common/DaysSidebar';
import { useDaysOverview } from '../../hooks/useDaysOverview';

// Modular Components
import LogisticContent from '../../components/manager/logistic/LogisticContent';
import LogisticInspector from '../../components/manager/logistic/LogisticInspector';

// Logic Hook
import { useManagerLogistic, LogisticsItem } from '../../hooks/useManagerLogistic';
import { supabase } from '@thaiakha/shared/lib/supabase';
import { cn } from '@thaiakha/shared/lib/utils';
import { Paragraph } from '../../components/typography';

const ManagerLogistic: React.FC<{ onNavigate: (page: string) => void }> = ({ onNavigate: _onNavigate }) => {
    const { t } = useTranslation('logistics');
    const { t: tc } = useTranslation('common');
    const {
        items,
        drivers,
        selectedBooking,
        hotels,
        meetingPoints,
        pickupZones,
        loading,
        isSaving,
        selectedDate,
        selectedSessionId,
        selectedBookingId,
        setSelectedDate,
        setSelectedSessionId,
        setSelectedBookingId,
        fetchData,
        handleAssign,
        handleUpdateBooking,
        updateLocalItem,
        closeInspector,
    } = useManagerLogistic();
    const { days } = useDaysOverview(6); // nav giorni riusabile (oggi → +6)
    const daySession: DaySession = selectedSessionId === 'evening_class' ? 'evening_class' : 'morning_class';

    const [pendingReorder, setPendingReorder] = useState<LogisticsItem[] | null>(null);
    const [isSavingOrder, setIsSavingOrder] = useState(false);
    const [logisticsMode, setLogisticsMode] = useState<'pickup' | 'dropoff'>('pickup');
    const [selectedDriverIds, setSelectedDriverIds] = useState<Set<string>>(new Set());

    // Initialize selectedDriverIds with all drivers by default
    useEffect(() => {
        if (drivers.length > 0 && selectedDriverIds.size === 0) {
            setSelectedDriverIds(new Set(drivers.map(d => d.id)));
        }
    }, [drivers, selectedDriverIds.size]);

    const handleReorder = useCallback((reorderedItems: LogisticsItem[], mode: 'pickup' | 'dropoff') => {
        setPendingReorder(reorderedItems);
        setLogisticsMode(mode);
    }, []);

    const handleActivateDriver = useCallback((driverId: string) => {
        setSelectedDriverIds(prev => {
            const next = new Set(prev);
            next.add(driverId);
            return next;
        });
    }, []);

    const handleModeChange = useCallback((mode: 'pickup' | 'dropoff') => {
        setLogisticsMode(mode);
    }, []);

    const handleSaveOrder = useCallback(async () => {
        if (!pendingReorder) return;
        setIsSavingOrder(true);

        try {
            // Batch update based on logistics mode
            for (const [idx, item] of pendingReorder.entries()) {
                const dbUpdate = logisticsMode === 'pickup'
                    ? {
                        route_order: idx,
                        pickup_driver_uid: item.pickup_driver_uid,
                    }
                    : {
                        dropoff_sequence: idx,
                        dropoff_driver_uid: item.dropoff_driver_uid,
                    };

                await supabase
                    .from('bookings')
                    .update(dbUpdate)
                    .eq('internal_id', item.id);
            }

            // Refresh data and clear pending
            setPendingReorder(null);
            fetchData();
        } finally {
            setIsSavingOrder(false);
        }
    }, [pendingReorder, fetchData, logisticsMode]);


    return (
        <>
            <PageMeta
                title={t('meta.title')}
                description={t('meta.description')}
            />

            <DataExplorerLayout
                viewMode="table"
                inspectorOpen={!!selectedBooking}
                onInspectorClose={closeInspector}
                sidebar={
                    <DaysSidebar
                        days={days}
                        selectedDate={selectedDate}
                        selectedSession={daySession}
                        onSelect={(date, session) => { setSelectedDate(date); setSelectedSessionId(session); setLogisticsMode('pickup'); }}
                    />
                }
                toolbar={
                    <div className="h-16 px-5 border-b border-gray-200 dark:border-gray-800 flex items-center gap-3 bg-gray-50/50 dark:bg-gray-900/50 shadow-sm shrink-0">
                        {/* Switcher Pickup / Drop-off — a sinistra della data */}
                        <div className="flex rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 h-9 shrink-0">
                            <button
                                onClick={() => handleModeChange('pickup')}
                                className={cn('flex items-center px-3 text-xs font-bold uppercase tracking-wider transition-colors',
                                    logisticsMode === 'pickup' ? 'bg-orange-500 text-white' : 'text-sub hover:bg-gray-50 dark:hover:bg-gray-700')}
                            >
                                {t('inspector.pickup')}
                            </button>
                            <button
                                onClick={() => handleModeChange('dropoff')}
                                className={cn('flex items-center px-3 text-xs font-bold uppercase tracking-wider transition-colors border-l border-gray-200 dark:border-gray-700',
                                    logisticsMode === 'dropoff' ? 'bg-orange-500 text-white' : 'text-sub hover:bg-gray-50 dark:hover:bg-gray-700')}
                            >
                                {t('inspector.dropoff')}
                            </button>
                        </div>
                        <span className="text-lg font-bold text-title">
                            {t(daySession === 'evening_class' ? 'sidebar.eveningClass' : 'sidebar.morningClass', { defaultValue: daySession === 'evening_class' ? 'Evening Class' : 'Morning Class' })}
                            {' - '}
                            {new Date(selectedDate + 'T00:00:00').toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'short' })}
                        </span>
                    </div>
                }
                inspector={
                    <DataExplorerInspector
                        isEditing={false}
                        onClose={closeInspector}
                    >
                        <LogisticInspector
                            selectedBooking={selectedBooking}
                            drivers={drivers}
                            hotels={hotels}
                            meetingPoints={meetingPoints}
                            pickupZones={pickupZones}
                            onAssign={handleAssign}
                            onUpdateLocal={updateLocalItem}
                            onSubmit={handleUpdateBooking}
                            isSaving={isSaving}
                        />
                    </DataExplorerInspector>
                }
            >
                <div className="relative h-full flex flex-col">
                    {/* Logistic Content */}
                    <LogisticContent
                        loading={loading}
                        items={items}
                        drivers={drivers}
                        selectedBookingId={selectedBookingId}
                        onSelectBooking={(id) => {
                            setSelectedBookingId(id);
                            setLogisticsMode('pickup');
                        }}
                        onReorder={handleReorder}
                        logisticsMode={logisticsMode}
                        selectedDriverIds={selectedDriverIds}
                        onActivateDriver={handleActivateDriver}
                    />

                    {pendingReorder && (
                        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-100 dark:border-gray-800 bg-yellow-50 dark:bg-yellow-900/20 flex items-center gap-3">
                            <div className="flex-1">
                                <Paragraph size="xs" className="font-bold text-yellow-900 dark:text-yellow-400 leading-4">
                                    {t('list.unsavedChanges')}
                                </Paragraph>
                            </div>
                            <button
                                onClick={handleSaveOrder}
                                disabled={isSavingOrder}
                                className="px-4 py-2 bg-primary-500 text-white text-xs font-bold rounded-lg hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                {isSavingOrder ? t('actions.saving') : t('actions.saveOrder')}
                            </button>
                            <button
                                onClick={() => setPendingReorder(null)}
                                disabled={isSavingOrder}
                                className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-title text-xs font-bold rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                {tc('buttons.cancel')}
                            </button>
                        </div>
                    )}
                </div>
            </DataExplorerLayout>
        </>
    );
};

export default ManagerLogistic;
