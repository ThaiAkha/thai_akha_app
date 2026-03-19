import React, { useState, useEffect, useMemo } from 'react';
import { supabase } from '@thaiakha/shared/lib/supabase';
import { Icon, Button, Tooltip } from '../ui/index';
import { cn } from '@thaiakha/shared/lib/utils';
import { TOOLTIPS } from '../../data/tooltips';

interface CalendarViewProps {
  currentDate: Date | null;
  onSelectDate: (date: Date) => void;
  onClose: () => void;
  allowSelectionOnFullDays?: boolean; // Per Admin
}

interface SessionStatus {
  status: 'OPEN' | 'FULL' | 'CLOSED';
  seats: number;
}

interface DayData {
  morning: SessionStatus;
  evening: SessionStatus;
}

const DAYS_HEADER = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

// ✅ HELPER SICURO PER LE DATE (YYYY-MM-DD)
const getDateKey = (date: Date): string => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

export const CalendarView: React.FC<CalendarViewProps> = ({
  currentDate,
  onSelectDate,
  onClose,
  allowSelectionOnFullDays = false
}) => {
  const [viewDate, setViewDate] = useState(new Date(currentDate || new Date()));
  const [availability, setAvailability] = useState<Record<string, DayData>>({});
  const [loading, setLoading] = useState(true);

  // --- 1. DATA FETCHING ---
  useEffect(() => {
    let isMounted = true;
    const fetchAvailability = async () => {
      setLoading(true);

      const year = viewDate.getFullYear();
      const month = viewDate.getMonth();

      const firstDayOfMonth = new Date(year, month, 1);
      const dayOfWeek = firstDayOfMonth.getDay(); // 0: Sun, 1: Mon...
      const startDayIndex = (dayOfWeek + 6) % 7; // Convert to Mon:0, Tue:1... Sun:6

      const startGrid = new Date(year, month, 1 - startDayIndex);
      const endGrid = new Date(startGrid);
      endGrid.setDate(startGrid.getDate() + 42);

      const startDateStr = getDateKey(startGrid);
      const endDateStr = getDateKey(endGrid);

      try {
        // A. Base Capacity
        const { data: sessionsData } = await supabase.from('class_sessions').select('id, max_capacity');
        const baseCaps: Record<string, number> = {};
        sessionsData?.forEach((s: any) => baseCaps[s.id] = s.max_capacity ?? 12);

        // B. Bookings
        const { data: bookings } = await supabase
          .from('bookings')
          .select('booking_date, session_id, pax_count')
          .gte('booking_date', startDateStr)
          .lte('booking_date', endDateStr)
          .neq('status', 'cancelled');

        // C. Overrides
        const { data: overrides } = await supabase
          .from('class_calendar_overrides')
          .select('*')
          .gte('date', startDateStr)
          .lte('date', endDateStr);

        // D. Build Map
        const statusMap: Record<string, DayData> = {};
        const loopDate = new Date(startGrid);

        for (let i = 0; i < 42; i++) {
          const dateStr = getDateKey(loopDate);

          const getStatus = (sessionId: string): SessionStatus => {
            const override = overrides?.find(o => o.date === dateStr && o.session_id === sessionId);

            if (override?.is_closed) return { status: 'CLOSED', seats: 0 };

            const max = override?.custom_capacity ?? baseCaps[sessionId] ?? 12;
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

        if (isMounted) {
          setAvailability(statusMap);
          setLoading(false);
        }
      } catch (err) {
        console.error("Calendar Sync Error:", err);
        if (isMounted) setLoading(false);
      }
    };

    fetchAvailability();
    return () => { isMounted = false; };
  }, [viewDate]);

  // --- 2. GRID RENDERING ---
  const calendarDays = useMemo(() => {
    const year = viewDate.getFullYear();
    const month = viewDate.getMonth();
    const firstDayOfMonth = new Date(year, month, 1);
    const dayOfWeek = firstDayOfMonth.getDay();
    const startDayIndex = (dayOfWeek + 6) % 7;

    const currentLoop = new Date(year, month, 1 - startDayIndex);
    const days = [];

    for (let i = 0; i < 42; i++) {
      days.push(new Date(currentLoop));
      currentLoop.setDate(currentLoop.getDate() + 1);
    }
    return days;
  }, [viewDate]);

  // --- 3. NAVIGATION LOGIC (Block Past) ---
  const today = new Date();
  const isCurrentMonth = viewDate.getMonth() === today.getMonth() && viewDate.getFullYear() === today.getFullYear();

  const handlePrev = () => {
    if (isCurrentMonth) return;
    setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1));
  };

  const handleNext = () => setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1));

  return (
    // CONTAINER: Trasparente per adattarsi al Modal, ma con testo base corretto
    <div className="w-full h-full flex flex-col font-sans select-none text-title">

      {/* HEADER */}
      <div className="flex items-center justify-between pb-4 border-b border-border shrink-0">
        <div>
          <h3 className="text-3xl md:text-4xl font-display font-black text-title uppercase leading-none mb-2">
            {MONTHS[viewDate.getMonth()]} <span className="text-action">{viewDate.getFullYear()}</span>
          </h3>
          <span className="block text-sm font-accent font-black uppercase tracking-[0.3em] text-desc">
            Choose Your Cooking Day - <span className="text-orange-500">Morning</span> and <span className="text-action">Evening</span> availability
          </span>

        </div>

        <div className="flex gap-2">
          <Tooltip content={TOOLTIPS.BOOKING.CALENDAR.PREV_MONTH} position="bottom">
            <Button
              variant="mineral"
              size="md"
              onClick={handlePrev}
              disabled={isCurrentMonth}
              icon="chevron_left"
              iconPosition="only"
              iconSize="2rem"
              className="size-12 rounded-xl"
            />
          </Tooltip>

          <Tooltip content={TOOLTIPS.BOOKING.CALENDAR.NEXT_MONTH} position="bottom">
            <Button
              variant="mineral"
              size="md"
              onClick={handleNext}
              icon="chevron_right"
              iconPosition="only"
              iconSize="2rem"
              className="size-12 rounded-xl"
            />
          </Tooltip>

          <Tooltip content={TOOLTIPS.BOOKING.CALENDAR.CLOSE} position="bottom">
            <Button
              variant="mineral"
              size="md"
              onClick={onClose}
              icon="close"
              iconPosition="only"
              iconSize="1.5rem"
              className="size-12 rounded-xl ml-2 text-red-500"
            />
          </Tooltip>
        </div>
      </div>

      {/* GIORNI SETTIMANA */}
      <div className="grid grid-cols-7 border-b border-border bg-surface/90 shrink-0">
        {DAYS_HEADER.map(d => (
          <div key={d} className="py-4 text-center">
            <span className="font-accent font-black text-sub uppercase tracking-widest text-md">{d}</span>
          </div>
        ))}
      </div>

      {/* GRIGLIA PRINCIPALE */}
      <div className="grid grid-cols-7 grid-rows-6 flex-1 gap-px bg-border overflow-y-auto custom-scrollbar">
        {calendarDays.map((date, idx) => {
          const dateStr = getDateKey(date);
          const data = availability[dateStr];

          const isCurrentMonth = date.getMonth() === viewDate.getMonth();
          const now = new Date();
          now.setHours(0, 0, 0, 0);
          const checkDate = new Date(date);
          checkDate.setHours(0, 0, 0, 0);

          const isPast = checkDate.getTime() < now.getTime();
          const isToday = checkDate.getTime() === now.getTime();
          const isSelected = currentDate ? (getDateKey(date) === getDateKey(currentDate)) : false;

          const isMorningOpen = data?.morning.status === 'OPEN';
          const isEveningOpen = data?.evening.status === 'OPEN';

          const isFullDay = !loading && data && !isMorningOpen && !isEveningOpen;

          const mOpen = data?.morning.status === 'OPEN';
          const eOpen = data?.evening.status === 'OPEN';

          const getTooltipContent = () => {
            if (isPast || !isCurrentMonth) return TOOLTIPS.BOOKING.CALENDAR.DAY_UNAVAILABLE;
            if (loading) return TOOLTIPS.BOOKING.CALENDAR.DAY_LOADING;
            if (isFullDay && !allowSelectionOnFullDays) return TOOLTIPS.BOOKING.CALENDAR.DAY_SOLD_OUT;

            if (mOpen && eOpen) return TOOLTIPS.BOOKING.CALENDAR.DAY_BOTH_OPEN;
            if (mOpen) return TOOLTIPS.BOOKING.CALENDAR.DAY_MORNING_ONLY;
            if (eOpen) return TOOLTIPS.BOOKING.CALENDAR.DAY_EVENING_ONLY;
            return TOOLTIPS.BOOKING.CALENDAR.DAY_SELECTABLE;
          };

          return (
            <Tooltip key={dateStr} content={getTooltipContent()} className="w-full h-full">
              <button
                disabled={isPast || loading || !isCurrentMonth || (isFullDay && !allowSelectionOnFullDays)}
                onClick={() => { onSelectDate(date); onClose(); }}
                className={cn(
                  "w-full h-full relative flex flex-col justify-between p-2 min-h-[120px] group transition-all text-left bg-surface dark:bg-black",
                  "hover:z-10 hover:ring-2 hover:ring-action",
                  // BACKGROUND COLOR LOGIC
                  !isCurrentMonth
                    ? "cursor-not-allowed opacity-40"
                    : isPast
                      ? "cursor-not-allowed"
                      : isFullDay
                        ? allowSelectionOnFullDays
                          ? "bg-red-50 dark:bg-red-950/20 ring-1 ring-red-300 dark:ring-red-500/20 cursor-pointer"
                          : "bg-red-50 dark:bg-red-950/10 ring-1 ring-red-200 dark:ring-red-500/10 cursor-not-allowed"
                        : "hover:bg-black/5 dark:hover:bg-white/5",

                  isSelected && "bg-action/10 ring-2 ring-action/60 z-10"
                )}
              >
                <div className={cn("flex justify-between items-start", (isPast || !isCurrentMonth) && "opacity-50")}>
                  <div className={cn(
                    "size-8 flex items-center justify-center rounded-xl border text-md font-accent font-black transition-all mb-4",
                    isToday
                      ? "bg-action border-action text-black shadow-lg shadow-action/20"
                      : (isPast || !isCurrentMonth)
                        ? "bg-transparent border-transparent text-muted"
                        : "bg-background dark:bg-black/30 border-border text-title group-hover:border-primary/50 shadow-sm"
                  )}>
                    {date.getDate()}
                  </div>
                </div>

                {/* SKELETON LOADING */}
                {loading && !isPast && (
                  <div className="space-y-2 w-full mt-auto animate-pulse pb-1">
                    <div className="h-4 bg-border/40 rounded w-full" />
                    <div className="h-px bg-border/20 mx-2" />
                    <div className="h-4 bg-border/40 rounded w-3/4" />
                  </div>
                )}

                {/* STATISTICHE POSTI */}
                {!loading && data && !isPast && (
                  <div className={cn("space-y-1.5 w-full mt-auto", (isFullDay && !allowSelectionOnFullDays) && "opacity-40 grayscale", !isCurrentMonth && "opacity-50")}>

                    {/* Morning Section */}
                    <div className={cn("flex items-center justify-between px-1 text-sm font-black transition-colors",
                      data.morning.status === 'OPEN'
                        ? "text-orange-500"
                        : "text-red-500"
                    )}>
                      <span className="hidden md:inline">Morning Class</span>
                      <span>{data.morning.status === 'OPEN' ? data.morning.seats : '0'}</span>
                    </div>

                    {/* Divider */}
                    <div className="h-px bg-border mx-2" />

                    {/* Evening Section */}
                    <div className={cn("flex items-center justify-between px-1 text-sm font-black transition-colors",
                      data.evening.status === 'OPEN'
                        ? "text-action"
                        : "text-sys-error"
                    )}>
                      <span className="hidden md:inline">Evening Class</span>
                      <span>{data.evening.status === 'OPEN' ? data.evening.seats : '0'}</span>
                    </div>

                  </div>
                )}
              </button>
            </Tooltip>
          );
        })}
      </div>


    </div>
  );
};