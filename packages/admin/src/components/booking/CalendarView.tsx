import React, { useState, useEffect, useMemo } from 'react';
import { supabase } from '@thaiakha/shared/lib/supabase';
import { cn } from '@thaiakha/shared/lib/utils';
import { ChevronLeft, ChevronRight, Ban } from 'lucide-react';
import { getSessionCapacity } from '../../config/sessionDefaults';
import { getDateKey } from '../../utils/dateKeyUtils';
import SessionStatusBadge from '../admin/calendar/SessionStatusBadge';

interface CalendarViewProps {
    currentDate: Date;
    onSelectDate: (date: Date) => void;
    onClose: () => void;
    allowSelectionOnFullDays?: boolean;
}

interface SessionStatus {
    status: 'OPEN' | 'FULL' | 'CLOSED';
    seats: number;
}

interface DayData {
    morning: SessionStatus;
    evening: SessionStatus;
}

const DAYS_HEADER = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

export const CalendarView: React.FC<CalendarViewProps> = ({
    currentDate,
    onSelectDate,
    onClose,
    allowSelectionOnFullDays = false
}) => {

    const [viewDate, setViewDate] = useState(new Date(currentDate));
    const [availability, setAvailability] = useState<Record<string, DayData>>({});
    const [loading, setLoading] = useState(true);

    // --- 1. DATA FETCHING ---
    useEffect(() => {
        const fetchAvailability = async () => {
            setLoading(true);

            const year = viewDate.getFullYear();
            const month = viewDate.getMonth();
            const firstDayOfMonth = new Date(year, month, 1);
            const startDayIndex = firstDayOfMonth.getDay();

            const startGrid = new Date(year, month, 1 - startDayIndex);
            const endGrid = new Date(startGrid);
            endGrid.setDate(startGrid.getDate() + 42);

            const startDateStr = getDateKey(startGrid);
            const endDateStr = getDateKey(endGrid);

            try {
                const { data: sessionsData } = await supabase.from('class_sessions').select('id, max_capacity');
                const baseCaps: Record<string, number> = {};
                sessionsData?.forEach((s: any) => baseCaps[s.id] = getSessionCapacity(s.max_capacity));

                const { data: bookings } = await supabase
                    .from('bookings')
                    .select('booking_date, session_id, pax_count')
                    .gte('booking_date', startDateStr)
                    .lte('booking_date', endDateStr)
                    .neq('status', 'cancelled');

                const { data: overrides } = await supabase
                    .from('class_calendar_overrides')
                    .select('*')
                    .gte('date', startDateStr)
                    .lte('date', endDateStr);

                const statusMap: Record<string, DayData> = {};
                const loopDate = new Date(startGrid);

                for (let i = 0; i < 42; i++) {
                    const dateStr = getDateKey(loopDate);

                    const getStatus = (sessionId: string): SessionStatus => {
                        const override = overrides?.find(o => o.date === dateStr && o.session_id === sessionId);

                        if (override?.is_closed) return { status: 'CLOSED', seats: 0 };

                        const max = getSessionCapacity(override?.custom_capacity ?? baseCaps[sessionId]);

                        const occupied = bookings
                            ?.filter(b => b.booking_date === dateStr && b.session_id === sessionId)
                            .reduce((sum, b) => sum + (b.pax_count || 0), 0) || 0;

                        const remaining = Math.max(0, max - occupied);
                        return { status: remaining > 0 ? 'OPEN' : 'FULL', seats: remaining };
                    };

                    statusMap[dateStr] = {
                        morning: getStatus('morning_class'),
                        evening: getStatus('evening_class')
                    };
                    loopDate.setDate(loopDate.getDate() + 1);
                }

                setAvailability(statusMap);

            } catch (err) {
                console.error("Calendar Sync Error:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchAvailability();
    }, [viewDate]);

    // --- 2. GRID LOGIC ---
    const calendarDays = useMemo(() => {
        const year = viewDate.getFullYear();
        const month = viewDate.getMonth();
        const firstDayOfMonth = new Date(year, month, 1);
        const startDayIndex = firstDayOfMonth.getDay();

        const currentLoop = new Date(year, month, 1 - startDayIndex);
        const days = [];

        for (let i = 0; i < 42; i++) {
            days.push(new Date(currentLoop));
            currentLoop.setDate(currentLoop.getDate() + 1);
        }
        return days;
    }, [viewDate]);

    const handlePrev = () => setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1));
    const handleNext = () => setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1));

    return (
        <div className="w-full h-full bg-white dark:bg-gray-900 rounded-[2rem] border border-gray-200 dark:border-gray-800 shadow-2xl overflow-hidden flex flex-col select-none">

            {/* HEADER */}
            <div className="flex items-center justify-between p-6 md:p-8 border-b border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50 backdrop-blur-xl shrink-0">
                <div>
                    <span className="block text-[10px] font-black uppercase tracking-[0.3em] text-gray-400">Select Date</span>
                    <h3 className="text-2xl md:text-3xl font-black text-gray-900 dark:text-white italic uppercase leading-none mt-2">
                        {MONTHS[viewDate.getMonth()]} <span className="text-primary-600 dark:text-primary-400">{viewDate.getFullYear()}</span>
                    </h3>
                </div>
                <div className="flex gap-2">
                    <button onClick={handlePrev} className="size-10 rounded-xl bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700 flex items-center justify-center text-gray-600 dark:text-gray-300 transition-all active:scale-95"><ChevronLeft className="w-5 h-5" /></button>
                    <button onClick={handleNext} className="size-10 rounded-xl bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700 flex items-center justify-center text-gray-600 dark:text-gray-300 transition-all active:scale-95"><ChevronRight className="w-5 h-5" /></button>
                </div>
            </div>

            {/* GIORNI SETTIMANA */}
            <div className="grid grid-cols-7 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-black/20 shrink-0">
                {DAYS_HEADER.map(d => (
                    <div key={d} className="py-3 text-center">
                        <span className="font-black text-gray-400 uppercase tracking-widest text-[10px]">{d}</span>
                    </div>
                ))}
            </div>

            {/* GRIGLIA PRINCIPALE */}
            <div className="grid grid-cols-7 grid-rows-6 flex-1 gap-px bg-gray-100 dark:bg-gray-800/50 overflow-y-auto no-scrollbar">
                {calendarDays.map((date, idx) => {
                    const dateStr = getDateKey(date);
                    const data = availability[dateStr];
                    const isCurrentMonth = date.getMonth() === viewDate.getMonth();
                    const isSelected = date.toDateString() === currentDate.toDateString();

                    const now = new Date();
                    now.setHours(0, 0, 0, 0);
                    const checkDate = new Date(date);
                    checkDate.setHours(0, 0, 0, 0);

                    const isPast = checkDate.getTime() < now.getTime();
                    const isToday = checkDate.getTime() === now.getTime();

                    const isMorningOpen = data?.morning.status === 'OPEN';
                    const isEveningOpen = data?.evening.status === 'OPEN';

                    const isFullDay = !isMorningOpen && !isEveningOpen && !loading && !!data;

                    if (!isCurrentMonth) return <div key={idx} className="bg-white dark:bg-gray-900 opacity-30 pointer-events-none" />;

                    return (
                        <button
                            key={dateStr}
                            disabled={isPast || loading || (isFullDay && !allowSelectionOnFullDays)}
                            onClick={() => { onSelectDate(date); onClose(); }}
                            className={cn(
                                "relative flex flex-col justify-between p-2 min-h-[90px] group transition-all text-left",
                                isPast
                                    ? "bg-gray-50 dark:bg-gray-900 opacity-40 grayscale cursor-not-allowed"
                                    : isFullDay
                                        ? allowSelectionOnFullDays
                                            ? "bg-red-50 dark:bg-red-900/10 hover:bg-red-100 dark:hover:bg-red-900/20 border-red-200 dark:border-red-900/30 cursor-pointer"
                                            : "bg-red-50/50 dark:bg-red-900/5 border border-red-100 dark:border-red-900/10 cursor-not-allowed"
                                        : "bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800 border-transparent",
                                isSelected && "bg-primary-50 dark:bg-primary-500/10 ring-2 ring-primary-500/50 z-10"
                            )}
                        >
                            <div className="flex justify-between items-start">
                                <span className={cn(
                                    "text-base font-black leading-none",
                                    isToday ? "text-primary-600 dark:text-primary-400" : "text-gray-900 dark:text-white/80 group-hover:text-gray-900 dark:group-hover:text-white",
                                    isSelected && "text-primary-600 dark:text-primary-400",
                                    isFullDay && "text-red-500"
                                )}>
                                    {date.getDate()}
                                </span>
                                {isFullDay && <Ban className="w-3 h-3 text-red-500 opacity-60" />}
                            </div>

                            {!loading && data && !isPast && (
                                <div className={cn("space-y-1 w-full mt-auto", isFullDay && !allowSelectionOnFullDays && "opacity-60")}>
                                    <SessionStatusBadge
                                        status={data.morning.status as 'OPEN' | 'FULL' | 'CLOSED'}
                                        seats={data.morning.seats}
                                        label="Morning"
                                        size="sm"
                                        showIcon={false}
                                    />
                                    <SessionStatusBadge
                                        status={data.evening.status as 'OPEN' | 'FULL' | 'CLOSED'}
                                        seats={data.evening.seats}
                                        label="Evening"
                                        size="sm"
                                        showIcon={false}
                                    />
                                </div>
                            )}
                        </button>
                    );
                })}
            </div>

            <div className="p-4 border-t border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-black/20 flex justify-center shrink-0">
                <button onClick={onClose} className="px-6 py-2 rounded-xl bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-900 dark:text-white font-bold uppercase tracking-widest text-[10px] transition-colors border border-gray-200 dark:border-gray-700">
                    Cancel
                </button>
            </div>
        </div>
    );
};
