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
    const { visibleDrivers, getDriverItems, getWalkInItems } = useLogisticFiltering({
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

    const walkInItems = getWalkInItems();

    return (
        <div className="flex flex-col h-full overflow-hidden">
            {/* Loading Overlay */}
            {loading && <ContentLoadingOverlay label={t('content.syncing')} />}

            {/* Columns Grid */}
            <div className="flex-1 overflow-x-auto overflow-y-hidden p-4 no-scrollbar">
                <div className="flex h-full gap-4 min-w-max">
                    {/* Walk-In Column */}
                    {walkInItems.length > 0 && (
                        <LogisticWalkInColumn
                            items={walkInItems}
                            selectedBookingId={selectedBookingId}
                            onSelectBooking={onSelectBooking}
                        />
                    )}

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
