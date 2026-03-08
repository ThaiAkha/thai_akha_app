import { useCallback, useMemo } from 'react';
import { LogisticsItem, DriverProfile } from './useManagerLogistic';

interface UseLogisticFilteringProps {
    items: LogisticsItem[];
    drivers: DriverProfile[];
    selectedDriverIds: Set<string>;
    logisticsMode: 'pickup' | 'dropoff';
}

export function useLogisticFiltering({
    items,
    drivers,
    selectedDriverIds,
    logisticsMode
}: UseLogisticFilteringProps) {
    // Visible drivers based on selection
    const visibleDrivers = useMemo(() => {
        return drivers.filter(d => selectedDriverIds.has(d.id));
    }, [drivers, selectedDriverIds]);

    // Get driver items based on logistics mode
    const getDriverItems = useCallback((driverId: string): LogisticsItem[] => {
        if (logisticsMode === 'pickup') {
            return items
                .filter(i => i.pickup_driver_uid === driverId && i.pickup_zone !== 'walk-in')
                .sort((a, b) => a.route_order - b.route_order);
        } else {
            // Drop-off: use dropoff_driver_uid, fallback to pickup_driver_uid
            return items
                .filter(i => {
                    const driverUid = i.dropoff_driver_uid || i.pickup_driver_uid;
                    return driverUid === driverId && i.requires_dropoff && i.pickup_zone !== 'walk-in';
                })
                .sort((a, b) => a.dropoff_sequence - b.dropoff_sequence);
        }
    }, [items, logisticsMode]);

    // Get walk-in items (not assigned to any driver)
    const getWalkInItems = useCallback((): LogisticsItem[] => {
        return items.filter(i => i.pickup_zone === 'walk-in');
    }, [items]);

    return {
        visibleDrivers,
        getDriverItems,
        getWalkInItems
    };
}
