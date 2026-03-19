import React, { useState, useCallback, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import PageMeta from '../../components/common/PageMeta';
import {
    DataExplorerLayout,
    DataExplorerInspector,
} from '../../components/data-explorer';
import ClassPicker from '../../components/common/ClassPicker';

// Modular Components
import LogisticSidebar from '../../components/manager/logistic/LogisticSidebar';
import LogisticContent from '../../components/manager/logistic/LogisticContent';
import LogisticInspector from '../../components/manager/logistic/LogisticInspector';
import LogisticInspectorActions from '../../components/manager/logistic/LogisticInspectorActions';

// Logic Hook
import { useManagerLogistic, LogisticsItem } from '../../hooks/useManagerLogistic';
import { supabase } from '@thaiakha/shared/lib/supabase';
import { cn } from '@thaiakha/shared/lib/utils';

const ManagerLogistic: React.FC<{ onNavigate: (page: string) => void }> = ({ onNavigate: _onNavigate }) => {
    const { t } = useTranslation('logistics');
    const { t: tc } = useTranslation('common');
    const {
        items,
        drivers,
        upcomingSessions,
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

    const handleToggleDriver = useCallback((driverId: string) => {
        setSelectedDriverIds(prev => {
            // Check if driver has assigned items
            const driverHasItems = items.some(item =>
                item.pickup_driver_uid === driverId || item.dropoff_driver_uid === driverId
            );

            // Cannot deselect driver if they have assigned bookings
            if (driverHasItems && prev.has(driverId)) {
                console.warn('Cannot deselect driver with assigned bookings');
                return prev;
            }

            const next = new Set(prev);
            if (next.has(driverId)) {
                next.delete(driverId);
            } else {
                next.add(driverId);
            }

            return next;
        });
    }, [items]);

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
                    <LogisticSidebar
                        upcomingSessions={upcomingSessions}
                        selectedDate={selectedDate}
                        selectedSessionId={selectedSessionId}
                        onSelectSession={(date, sessionId) => {
                            setSelectedDate(date);
                            setSelectedSessionId(sessionId);
                            setLogisticsMode('pickup');
                        }}
                    />
                }
                toolbar={
                    <div className="h-16 px-4 border-b border-gray-200 dark:border-gray-800 flex items-center gap-3 bg-gray-50/50 dark:bg-gray-900/50 shadow-sm shrink-0 overflow-x-auto no-scrollbar">
                        {/* Date Picker */}
                        <ClassPicker
                            date={selectedDate}
                            onDateChange={(d) => {
                                setSelectedDate(d);
                                setLogisticsMode('pickup');
                            }}
                            session="all"
                            onSessionChange={(s) => {
                                setSelectedSessionId(s as any);
                                setLogisticsMode('pickup');
                            }}
                            showSessionSelector={false}
                        />

                        <div className="w-px h-6 bg-gray-200 dark:bg-gray-700" />

                        {/* Driver Pills */}
                        <div className="flex items-center gap-2 flex-1 overflow-x-auto no-scrollbar">
                            {drivers.map(driver => (
                                <button
                                    key={driver.id}
                                    onClick={() => handleToggleDriver(driver.id)}
                                    className={cn(
                                        "h-9 px-3 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors flex items-center whitespace-nowrap border shrink-0",
                                        selectedDriverIds.has(driver.id)
                                            ? "bg-primary-500 text-white border-primary-500 shadow-sm"
                                            : "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-primary-300 dark:hover:border-primary-500/30"
                                    )}
                                    title={driver.full_name}
                                >
                                    {driver.full_name}
                                </button>
                            ))}
                        </div>

                        <div className="w-px h-6 bg-gray-200 dark:bg-gray-700" />

                        {/* Pickup/Drop-off Toggle */}
                        <div className="flex rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 h-9 shrink-0">
                            <button
                                onClick={() => handleModeChange('pickup')}
                                className={cn(
                                    "flex items-center gap-1.5 px-3 text-xs font-bold uppercase tracking-wider transition-colors",
                                    logisticsMode === 'pickup'
                                        ? "bg-orange-500 text-white"
                                        : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700"
                                )}
                            >
                                {t('inspector.pickup')}
                            </button>
                            <button
                                onClick={() => handleModeChange('dropoff')}
                                className={cn(
                                    "flex items-center gap-1.5 px-3 text-xs font-bold uppercase tracking-wider transition-colors border-l border-gray-200 dark:border-gray-700",
                                    logisticsMode === 'dropoff'
                                        ? "bg-orange-500 text-white"
                                        : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700"
                                )}
                            >
                                {t('inspector.dropoff')}
                            </button>
                        </div>
                    </div>
                }
                inspector={
                    <DataExplorerInspector
                        isEditing={false}
                        onClose={closeInspector}
                        headerActions={
                            <LogisticInspectorActions
                                handleSave={() => handleUpdateBooking(new Event('submit') as any)}
                                isSaving={isSaving}
                                selectedBooking={selectedBooking}
                            />
                        }
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
                        hasUnsavedChanges={!!pendingReorder}
                        logisticsMode={logisticsMode}
                        selectedDriverIds={selectedDriverIds}
                        onActivateDriver={handleActivateDriver}
                    />

                    {pendingReorder && (
                        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-100 dark:border-gray-800 bg-yellow-50 dark:bg-yellow-900/20 flex items-center gap-3">
                            <div className="flex-1">
                                <p className="text-xs font-bold text-yellow-900 dark:text-yellow-400">
                                    {t('list.unsavedChanges')}
                                </p>
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
                                className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white text-xs font-bold rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
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
