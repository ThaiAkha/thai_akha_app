import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { LogisticsItem, DriverProfile } from '../../../hooks/useManagerLogistic';
import { useLogisticFiltering } from '../../../hooks/useLogisticFiltering';
import { useLogisticMovement } from '../../../hooks/useLogisticMovement';
import { ContentLoadingOverlay } from '../../data-explorer';
import { LogisticColumn } from './LogisticColumn';
import { LogisticWalkInColumn } from './LogisticWalkInColumn';

interface LogisticContentProps {
    loading: boolean;
    items: LogisticsItem[];
    drivers: DriverProfile[];
    selectedBookingId: string | null;
    onSelectBooking: (id: string) => void;
    onReorder?: (items: LogisticsItem[], mode: 'pickup' | 'dropoff') => void;
    logisticsMode: 'pickup' | 'dropoff';
    selectedDriverIds: Set<string>;
    onActivateDriver?: (driverId: string) => void;
}

const LogisticContent: React.FC<LogisticContentProps> = ({
    loading,
    items,
    drivers,
    selectedBookingId,
    onSelectBooking,
    onReorder,
    logisticsMode,
    selectedDriverIds,
    onActivateDriver,
}) => {
    const { t } = useTranslation('logistics');
    const [reorderedItems, setReorderedItems] = useState<LogisticsItem[]>(items);

    // Update when items change from database
    useEffect(() => {
        setReorderedItems(items);
    }, [items]);

    // Filtering hook
    const { visibleDrivers, getDriverItems, getWalkInItems,
        getWalkOffItems, getUnassignedItems } = useLogisticFiltering({
        items: reorderedItems,
        drivers,
        selectedDriverIds,
        logisticsMode
    });

    // Movement hook
    const { moveItem: moveItemLogic } = useLogisticMovement({
        logisticsMode,
        selectedDriverIds,
        onReorder,
        onActivateDriver
    });

    // Wrapper for moveItem that updates local state
    const moveItem = useCallback((itemId: string, direction: 'up' | 'down' | 'to-driver', targetDriverId?: string) => {
        const updated = moveItemLogic(reorderedItems, itemId, direction, targetDriverId);
        setReorderedItems(updated);
    }, [reorderedItems, moveItemLogic]);

    // Uno dei due e' sempre vuoto per costruzione (ognuno si spegne nella gamba che non
    // e' la sua): la colonna ne riceve uno solo, quello della gamba che si sta guardando.
    const walkInItems = getWalkInItems();
    const walkOffItems = getWalkOffItems();
    const unassignedItems = getUnassignedItems();

    return (
        <div className="flex flex-col h-full overflow-hidden">
            {/* Loading Overlay */}
            {loading && <ContentLoadingOverlay label={t('content.syncing')} />}

            {/* Columns Grid */}
            <div className="flex-1 overflow-x-auto overflow-y-hidden p-4 no-scrollbar">
                <div className="flex h-full gap-4 min-w-max">
                    {/* Walk-In Column. Fino al 2026-09-09 questa colonna SPARIVA quando
                        non c'erano walk-in (`if (items.length === 0) return null`). Ora deve
                        restare, e non e' una preferenza: il gruppo "da assegnare" vive qui
                        dentro, e quello e' lo stato in cui NASCE ogni prenotazione. Con la
                        colonna che si nasconde a zero walk-in - il caso piu' comune - le
                        righe da assegnare tornerebbero invisibili proprio quando sono le
                        uniche presenti, che e' il difetto da cui parte questo lavoro.
                        Di guadagnato: a zero il manager lo vede scritto, invece di dedurlo
                        dall'assenza di una colonna. */}
                    <LogisticWalkInColumn
                        items={logisticsMode === 'pickup' ? walkInItems : walkOffItems}
                        unassignedItems={unassignedItems}
                        drivers={drivers}
                        selectedBookingId={selectedBookingId}
                        onSelectBooking={onSelectBooking}
                        onMoveItem={moveItem}
                        mode={logisticsMode}
                    />

                    {/* Driver Columns */}
                    {visibleDrivers.map(driver => {
                        const driverItems = getDriverItems(driver.id);
                        return (
                            <LogisticColumn
                                key={driver.id}
                                title={driver.full_name}
                                driverAvatarUrl={driver.avatar_url}
                                items={driverItems}
                                drivers={drivers}
                                selectedBookingId={selectedBookingId}
                                onSelectBooking={onSelectBooking}
                                onMoveItem={moveItem}
                                showAvatar={true}
                                showAssignDriver={true}
                            />
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default LogisticContent;
