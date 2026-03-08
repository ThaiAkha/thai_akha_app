import { useCallback } from 'react';
import { LogisticsItem } from './useManagerLogistic';

interface UseLogisticMovementProps {
    logisticsMode: 'pickup' | 'dropoff';
    selectedDriverIds: Set<string>;
    onReorder?: (items: LogisticsItem[], mode: 'pickup' | 'dropoff') => void;
    onActivateDriver?: (driverId: string) => void;
}

export function useLogisticMovement({
    logisticsMode,
    selectedDriverIds,
    onReorder,
    onActivateDriver
}: UseLogisticMovementProps) {
    const moveItem = useCallback((
        updatedItems: LogisticsItem[],
        itemId: string,
        direction: 'up' | 'down' | 'to-driver',
        targetDriverId?: string
    ): LogisticsItem[] => {
        const items = [...updatedItems];
        const itemIndex = items.findIndex(i => i.id === itemId);
        if (itemIndex === -1) return updatedItems;

        const item = items[itemIndex];

        // Get current driver based on mode
        const currentDriver = logisticsMode === 'pickup'
            ? item.pickup_driver_uid
            : (item.dropoff_driver_uid || item.pickup_driver_uid);

        if (direction === 'to-driver' && targetDriverId && targetDriverId !== currentDriver) {
            // Move to different driver
            items.splice(itemIndex, 1);

            // Update appropriate driver field based on mode
            const updatedItem = logisticsMode === 'pickup'
                ? {
                    ...item,
                    pickup_driver_uid: targetDriverId,
                    // Auto-update dropoff if not explicitly set
                    dropoff_driver_uid: item.dropoff_driver_uid || targetDriverId
                  }
                : { ...item, dropoff_driver_uid: targetDriverId };

            // Find insertion point in target driver's list
            const targetItems = items.filter(i => {
                const dId = logisticsMode === 'pickup'
                    ? i.pickup_driver_uid
                    : (i.dropoff_driver_uid || i.pickup_driver_uid);
                return dId === targetDriverId;
            });

            const insertIndex = items.findIndex(i => {
                const dId = logisticsMode === 'pickup'
                    ? i.pickup_driver_uid
                    : (i.dropoff_driver_uid || i.pickup_driver_uid);
                return dId === targetDriverId;
            });

            items.splice(insertIndex + targetItems.length, 0, updatedItem);

            // Auto-activate driver if not already selected
            if (onActivateDriver && !selectedDriverIds.has(targetDriverId)) {
                onActivateDriver(targetDriverId);
            }
        } else {
            // Reorder within same driver/group
            const sameGroupItems = items
                .map((i, idx) => {
                    const dId = logisticsMode === 'pickup'
                        ? i.pickup_driver_uid
                        : (i.dropoff_driver_uid || i.pickup_driver_uid);
                    return { item: i, idx, driverId: dId };
                })
                .filter(x => x.driverId === currentDriver);
            const currentPos = sameGroupItems.findIndex(x => x.item.id === itemId);

            if (direction === 'up' && currentPos > 0) {
                const swapIdx = sameGroupItems[currentPos - 1].idx;
                [items[itemIndex], items[swapIdx]] = [items[swapIdx], items[itemIndex]];
            } else if (direction === 'down' && currentPos < sameGroupItems.length - 1) {
                const swapIdx = sameGroupItems[currentPos + 1].idx;
                [items[itemIndex], items[swapIdx]] = [items[swapIdx], items[itemIndex]];
            }
        }

        // Notify parent of reorder
        if (onReorder) onReorder(items, logisticsMode);
        return items;
    }, [logisticsMode, onReorder, onActivateDriver, selectedDriverIds]);

    return { moveItem };
}
