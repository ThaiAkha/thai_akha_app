import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { getSessionCapacity } from '../config/sessionDefaults';
import { getDateKey } from '../utils/dateKeyUtils';

export interface SessionStatus {
    status: 'OPEN' | 'FULL' | 'CLOSED';
    seats: number;
    capacity: number;
    isLocked?: boolean;
    reason?: string;
    occupiedCount: number;
}

export interface DayData {
    morning_class: SessionStatus;
    evening_class: SessionStatus;
    hasBookings: boolean;
}

export const useCalendarAvailability = (viewDate: Date) => {
    const [availability, setAvailability] = useState<Record<string, DayData>>({});
    const [loading, setLoading] = useState(true);
    const sessionsCache = useRef<Record<string, number> | null>(null);

    const checkLock = (dateStr: string, session: 'morning_class' | 'evening_class'): boolean => {
        const todayStr = getDateKey(new Date());
        if (dateStr < todayStr) return true;
        if (dateStr > todayStr) return false;
        const nowHour = new Date().getHours();
        if (session === 'morning_class') return nowHour >= 10;
        if (session === 'evening_class') return nowHour >= 17;
        return false;
    };

    const fetchAvailability = useCallback(async (skipLoading = false) => {
        if (!skipLoading) setLoading(true);
        const year = viewDate.getFullYear();
        const month = viewDate.getMonth();
        const firstDayOfMonth = new Date(year, month, 1);
        const startDayIndex = firstDayOfMonth.getDay();
        const startGrid = new Date(year, month, 1 - startDayIndex);
        const endGrid = new Date(startGrid);
        endGrid.setDate(startGrid.getDate() + 42); // Fetch 6 weeks to cover the grid

        const startDateStr = getDateKey(startGrid);
        const endDateStr = getDateKey(endGrid);

        try {
            // Load sessions cache only once
            if (!sessionsCache.current) {
                const { data: sessionsData } = await supabase.from('class_sessions').select('id, max_capacity');
                sessionsCache.current = {};
                sessionsData?.forEach((s: any) => sessionsCache.current![s.id] = getSessionCapacity(s.max_capacity));
            }

            // Parallel queries for faster loading
            const [{ data: bookings }, { data: overrides }] = await Promise.all([
                supabase.rpc('get_calendar_availability', {
                    start_date: startDateStr,
                    end_date: endDateStr
                }),
                supabase
                    .from('class_calendar_overrides')
                    .select('*')
                    .gte('date', startDateStr)
                    .lte('date', endDateStr)
            ]);

            // Convert to Map for O(1) lookup
            const bookingsMap = new Map<string, number>();
            bookings?.forEach((b: { booking_date: string; session_id: string; total_occupied: number }) => {
                const key = `${b.booking_date}-${b.session_id}`;
                bookingsMap.set(key, b.total_occupied);
            });

            const overridesMap = new Map<string, any>();
            overrides?.forEach(o => {
                const key = `${o.date}-${o.session_id}`;
                overridesMap.set(key, o);
            });

            const statusMap: Record<string, DayData> = {};
            const loopDate = new Date(startGrid);

            for (let i = 0; i < 42; i++) {
                const dateStr = getDateKey(loopDate);

                const getStatus = (sessionId: 'morning_class' | 'evening_class'): SessionStatus => {
                    const mapKey = `${dateStr}-${sessionId}`;
                    const override = overridesMap.get(mapKey);
                    const occupied = bookingsMap.get(mapKey) || 0;

                    const capacityValue = getSessionCapacity(override?.custom_capacity ?? sessionsCache.current?.[sessionId]);

                    if (override?.is_closed) {
                        return {
                            status: 'CLOSED',
                            seats: 0,
                            capacity: capacityValue,
                            isLocked: checkLock(dateStr, sessionId),
                            reason: override.closure_reason,
                            occupiedCount: occupied
                        };
                    }

                    const max = capacityValue;
                    const remaining = Math.max(0, max - occupied);

                    return {
                        status: remaining > 0 ? 'OPEN' : 'FULL',
                        seats: remaining,
                        capacity: max,
                        isLocked: checkLock(dateStr, sessionId),
                        reason: override?.closure_reason,
                        occupiedCount: occupied
                    };
                };

                const morning = getStatus('morning_class');
                const evening = getStatus('evening_class');
                statusMap[dateStr] = {
                    morning_class: morning,
                    evening_class: evening,
                    hasBookings: morning.occupiedCount > 0 || evening.occupiedCount > 0
                };

                loopDate.setDate(loopDate.getDate() + 1);
            }

            setAvailability(statusMap);
            if (!skipLoading) setLoading(false);

        } catch (err) {
            console.error('Error fetching calendar availability:', err);
            if (!skipLoading) setLoading(false);
        }
    }, [viewDate]);

    // Fetch data when viewDate changes
    useEffect(() => {
        // Reset sessions cache when month changes
        sessionsCache.current = null;
        fetchAvailability();
    }, [fetchAvailability]);

    return {
        availability,
        loading,
        refresh: () => fetchAvailability(true),
        setAvailability // Exported for optimistic updates in admin side
    };
};
