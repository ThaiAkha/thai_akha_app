import { useState, useEffect, useMemo, useCallback } from 'react';
import { supabase } from '@thaiakha/shared/lib/supabase';
import { getSessionCapacity } from '../config/sessionDefaults';
import { getDateKey } from '../utils/dateKeyUtils';
import { useCalendarAvailability, SessionStatus, DayData } from './useCalendarAvailability';

// --- INTERFACES ---
export type { SessionStatus, DayData };

export interface BookingMember {
    guest_name: string;
    pax_count: number;
}

export interface EditSessionState {
    isClosed: boolean;
    reason: string;
    seats: number;
    occupied: number;
}

export type BulkSessionType = 'morning_class' | 'evening_class' | 'all';

// Re-export centralized getDateKey for backward compatibility
export { getDateKey };

export const useAdminCalendar = () => {
    const [viewDate, setViewDate] = useState(new Date());
    const { availability, loading, refresh: fetchAvailability, setAvailability } = useCalendarAvailability(viewDate);

    const [dayBookings, setDayBookings] = useState<Record<string, BookingMember[]>>({
        morning_class: [],
        evening_class: []
    });

    const [selectedDate, setSelectedDate] = useState<string | null>(getDateKey(new Date()));
    const [isEditing, setIsEditing] = useState(false);
    const [isBulkMode, setIsBulkMode] = useState(false);
    const [selectedDates, setSelectedDates] = useState<Set<string>>(new Set());
    const [bulkSessionType, setBulkSessionType] = useState<BulkSessionType>('all');

    const [editState, setEditState] = useState<Record<string, EditSessionState>>({
        morning_class: { isClosed: false, reason: '', seats: 0, occupied: 0 },
        evening_class: { isClosed: false, reason: '', seats: 0, occupied: 0 }
    });

    const isPastDate = (dateStr: string): boolean => {
        const todayStr = getDateKey(new Date());
        return dateStr < todayStr;
    };

    const canNavigateToPreviousMonth = (): boolean => {
        const prevMonth = new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1);
        const today = new Date();
        const todayMonth = new Date(today.getFullYear(), today.getMonth(), 1);
        return prevMonth >= todayMonth;
    };

    const fetchDayBookings = useCallback(async (dateStr: string) => {
        try {
            const { data, error } = await supabase
                .from('bookings')
                .select('guest_name, pax_count, session_id')
                .eq('booking_date', dateStr)
                .neq('status', 'cancelled');

            if (error) {
                console.error('Error fetching day bookings:', error);
                return;
            }

            const split: Record<string, BookingMember[]> = { morning_class: [], evening_class: [] };
            data?.forEach((b: { guest_name: string | null; pax_count: number; session_id: string | null }) => {
                if (b.session_id && split[b.session_id]) {
                    split[b.session_id].push({ guest_name: b.guest_name || 'Unknown Guest', pax_count: b.pax_count });
                }
            });
            setDayBookings(split);
        } catch (err) {
            console.error('Unexpected error in fetchDayBookings:', err);
        }
    }, []);

    useEffect(() => { if (selectedDate && !isBulkMode) fetchDayBookings(selectedDate); }, [selectedDate, isBulkMode, fetchDayBookings]);

    // Sync edit state
    useEffect(() => {
        if (isBulkMode) {
            setEditState({
                morning_class: { isClosed: false, reason: '', seats: 0, occupied: 0 },
                evening_class: { isClosed: false, reason: '', seats: 0, occupied: 0 }
            });
        } else if (selectedDate && availability[selectedDate]) {
            const data = availability[selectedDate];
            setEditState({
                morning_class: { isClosed: data.morning_class.status === 'CLOSED', reason: data.morning_class.reason || '', seats: data.morning_class.seats, occupied: data.morning_class.capacity - data.morning_class.seats },
                evening_class: { isClosed: data.evening_class.status === 'CLOSED', reason: data.evening_class.reason || '', seats: data.evening_class.seats, occupied: data.evening_class.capacity - data.evening_class.seats }
            });
        }
    }, [selectedDate, availability, isBulkMode]);

    useEffect(() => { setIsEditing(false); setSelectedDates(new Set()); }, [isBulkMode]);

    const handleDateClick = (date: Date) => {
        const dateStr = getDateKey(date);
        // Block past dates
        if (isPastDate(dateStr)) return;

        if (isBulkMode) {
            if (availability[dateStr]?.hasBookings) return;
            setSelectedDates(prev => {
                const next = new Set(prev);
                if (next.has(dateStr)) next.delete(dateStr);
                else next.add(dateStr);
                return next;
            });
        } else {
            setSelectedDate(dateStr);
        }
    };

    const handleSaveBatch = async () => {
        const datesToUpdate = isBulkMode ? Array.from(selectedDates) : (selectedDate ? [selectedDate] : []);
        if (datesToUpdate.length === 0) return;

        // Filter out past dates - prevent modification of past dates
        const validDates = datesToUpdate.filter(d => !isPastDate(d));
        if (validDates.length === 0) {
            console.warn('Cannot save - all selected dates are in the past');
            return;
        }

        const payloads: {
            date: string;
            session_id: string;
            is_closed: boolean;
            closure_reason: string | null;
            custom_capacity: number | null;
        }[] = [];
        const sessionsToApply = isBulkMode ? (bulkSessionType === 'all' ? ['morning_class', 'evening_class'] : [bulkSessionType]) : ['morning_class', 'evening_class'];

        validDates.forEach(d => {
            sessionsToApply.forEach(s => {
                const edit = editState[bulkSessionType === 'all' && isBulkMode ? 'morning_class' : s as keyof EditSessionState];
                let finalCapacity: number | null = null;

                if (!edit.isClosed) {
                    if (isBulkMode) {
                        const currentCap = availability[d]?.[s as keyof DayData] as SessionStatus;
                        finalCapacity = getSessionCapacity(currentCap?.capacity) + edit.seats;
                    } else {
                        finalCapacity = edit.seats + edit.occupied;
                    }
                }

                payloads.push({
                    date: d,
                    session_id: s,
                    is_closed: edit.isClosed,
                    closure_reason: edit.isClosed ? edit.reason : null,
                    custom_capacity: edit.isClosed ? null : finalCapacity,
                });
            });
        });

        // Optimistic update: update UI immediately
        const updatedAvailability = { ...availability };
        validDates.forEach(d => {
            sessionsToApply.forEach(s => {
                const edit = editState[bulkSessionType === 'all' && isBulkMode ? 'morning_class' : s as keyof EditSessionState];
                if (updatedAvailability[d]) {
                    const sessionKey = s as 'morning_class' | 'evening_class';
                    if (edit.isClosed) {
                        updatedAvailability[d][sessionKey].status = 'CLOSED';
                        updatedAvailability[d][sessionKey].seats = 0;
                        updatedAvailability[d][sessionKey].reason = edit.reason;
                    } else {
                        const finalCap = isBulkMode
                            ? getSessionCapacity(updatedAvailability[d][sessionKey].capacity) + edit.seats
                            : edit.seats + edit.occupied;
                        const remaining = Math.max(0, finalCap - (edit.occupied));
                        updatedAvailability[d][sessionKey].status = remaining > 0 ? 'OPEN' : 'FULL';
                        updatedAvailability[d][sessionKey].seats = remaining;
                        updatedAvailability[d][sessionKey].capacity = finalCap;
                    }
                }
            });
        });

        setAvailability(updatedAvailability);
        setIsEditing(false);
        if (isBulkMode) { setIsBulkMode(false); setSelectedDates(new Set()); }

        // Save to database in background (non-blocking)
        const { error } = await supabase.from("class_calendar_overrides").upsert(payloads, { onConflict: "date,session_id" });
        if (!error) {
            // Lightweight refresh - skip loading UI, background sync only
            fetchAvailability();
        }
    };

    const calendarDays = useMemo(() => {
        const year = viewDate.getFullYear();
        const month = viewDate.getMonth();
        const firstDayOfMonth = new Date(year, month, 1);
        const startDayIndex = firstDayOfMonth.getDay();
        const currentLoop = new Date(year, month, 1 - startDayIndex);
        const days = [];
        for (let i = 0; i < 42; i++) { days.push(new Date(currentLoop)); currentLoop.setDate(currentLoop.getDate() + 1); }
        return days;
    }, [viewDate]);

    const handlePrev = () => {
        // Block navigation to past months
        if (!canNavigateToPreviousMonth()) return;
        setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1));
    };
    const handleNext = () => setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1));

    const updateEditState = (sessionId: string, field: keyof EditSessionState, value: string | number | boolean) => {
        setEditState(prev => ({ ...prev, [sessionId]: { ...prev[sessionId as keyof EditSessionState], [field]: value } }));
    };

    return {
        viewDate, setViewDate,
        availability,
        loading,
        dayBookings,
        selectedDate, setSelectedDate,
        isEditing, setIsEditing,
        isBulkMode, setIsBulkMode,
        selectedDates,
        bulkSessionType, setBulkSessionType,
        editState,
        handleDateClick,
        handleSaveBatch,
        calendarDays,
        handlePrev,
        handleNext,
        updateEditState,
        isPastDate,
        canNavigateToPreviousMonth
    };
};
