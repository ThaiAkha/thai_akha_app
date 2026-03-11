import React, { useState, useEffect, useMemo } from 'react';
import { supabase } from '../../lib/supabase';
import { Icon } from '../ui/index';
import { cn } from '../../lib/utils';

interface CalendarViewProps {
  currentDate: Date;
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

const DAYS_HEADER = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
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
  const [viewDate, setViewDate] = useState(new Date(currentDate));
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
      const startDayIndex = firstDayOfMonth.getDay();
      
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

        for(let i = 0; i < 42; i++) {
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
    const startDayIndex = firstDayOfMonth.getDay();
    
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
    <div className="w-full h-full flex flex-col font-sans select-none bg-background text-desc">
      
      {/* HEADER */}
      <div className="flex items-center justify-between p-6 md:p-8 border-b border-border bg-surface/50 backdrop-blur-xl shrink-0">
        <div>
          <span className="block text-[10px] font-accent font-black uppercase tracking-[0.3em] text-desc opacity-60">Select Date</span>
          <h3 className="text-3xl md:text-4xl font-display font-black text-title italic uppercase leading-none mt-2">
            {MONTHS[viewDate.getMonth()]} <span className="text-primary">{viewDate.getFullYear()}</span>
          </h3>
        </div>
        
        <div className="flex gap-2">
          <button 
            onClick={handlePrev} 
            disabled={isCurrentMonth}
            className={cn(
              "size-12 rounded-2xl border flex items-center justify-center transition-all",
              isCurrentMonth 
                ? "opacity-20 border-border cursor-not-allowed text-desc" 
                : "bg-surface border-border hover:bg-black/5 dark:hover:bg-white/10 text-title active:scale-95"
            )}
          >
            <Icon name="chevron_left" size="lg" />
          </button>
          
          <button 
            onClick={handleNext} 
            className="size-12 rounded-2xl bg-surface border border-border hover:bg-black/5 dark:hover:bg-white/10 flex items-center justify-center text-title transition-all active:scale-95"
          >
            <Icon name="chevron_right" size="lg" />
          </button>
        </div>
      </div>

      {/* GIORNI SETTIMANA */}
      <div className="grid grid-cols-7 border-b border-border bg-surface/80 dark:bg-black/40 shrink-0">
        {DAYS_HEADER.map(d => (
          <div key={d} className="py-4 text-center">
            <span className="font-accent font-black text-desc/50 uppercase tracking-widest text-[10px]">{d}</span>
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
          now.setHours(0,0,0,0);
          const checkDate = new Date(date);
          checkDate.setHours(0,0,0,0);
          
          const isPast = checkDate.getTime() < now.getTime();
          const isToday = checkDate.getTime() === now.getTime();
          const isSelected = getDateKey(date) === getDateKey(currentDate);

          const isMorningOpen = data?.morning.status === 'OPEN';
          const isEveningOpen = data?.evening.status === 'OPEN';
          
          const isFullDay = !loading && data && !isMorningOpen && !isEveningOpen;

          // Celle vuote (mese precedente/successivo)
          if (!isCurrentMonth) return <div key={idx} className="bg-background/50 dark:bg-[#121212] opacity-50 pointer-events-none" />;

          return (
            <button
              key={dateStr}
              disabled={isPast || loading || (isFullDay && !allowSelectionOnFullDays)}
              onClick={() => { onSelectDate(date); onClose(); }}
              className={cn(
                "relative flex flex-col justify-between p-2 min-h-[100px] group transition-all text-left",
                // BACKGROUND COLOR LOGIC
                isPast 
                  ? "bg-gray-100 dark:bg-[#121212] opacity-50 grayscale cursor-not-allowed" // Passato: Grigio chiaro (Light) / Scuro (Dark)
                  : isFullDay
                    ? allowSelectionOnFullDays 
                      ? "bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-500/20 cursor-pointer"
                      : "bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-500/10 cursor-not-allowed"
                    : "bg-surface hover:bg-primary/5 border-transparent",
                
                isSelected && "bg-primary/10 ring-2 ring-primary/50 z-10"
              )}
            >
              <div className="flex justify-between items-start">
                <span className={cn(
                  "text-lg font-display font-black leading-none transition-transform",
                  isToday 
                    ? "text-action scale-110" 
                    : isPast 
                      ? "text-desc/30" 
                      : "text-desc/60 group-hover:text-title", // Data normale
                  isSelected && "text-primary",
                  isFullDay && !allowSelectionOnFullDays && "text-red-400"
                )}>
                  {date.getDate()}
                </span>
                {isFullDay && <Icon name="block" className="text-red-500 text-sm opacity-80" />}
              </div>

              {/* STATISTICHE POSTI */}
              {!loading && data && !isPast && (
                <div className={cn("space-y-1.5 w-full mt-auto", isFullDay && !allowSelectionOnFullDays && "opacity-40 grayscale")}>
                  
                  {/* Morning Pill */}
                  <div className={cn("flex items-center justify-between px-2 py-1 rounded text-[9px] font-bold uppercase border transition-colors",
                    data.morning.status === 'OPEN' 
                      ? "bg-green-100 text-green-700 border-green-200 dark:bg-green-500/10 dark:text-green-400 dark:border-green-500/20" 
                      : "bg-gray-100 text-gray-400 border-gray-200 dark:bg-white/5 dark:text-white/20 dark:border-white/10"
                  )}>
                    <span className="flex gap-1 items-center"><Icon name="wb_sunny" className="text-[10px]" /><span className="hidden md:inline">AM</span></span>
                    <span>{data.morning.status === 'OPEN' ? data.morning.seats : (data.morning.status === 'CLOSED' ? 'X' : '0')}</span>
                  </div>

                  {/* Evening Pill */}
                  <div className={cn("flex items-center justify-between px-2 py-1 rounded text-[9px] font-bold uppercase border transition-colors",
                    data.evening.status === 'OPEN' 
                      ? "bg-purple-100 text-purple-700 border-purple-200 dark:bg-purple-500/10 dark:text-purple-400 dark:border-purple-500/20" 
                      : "bg-gray-100 text-gray-400 border-gray-200 dark:bg-white/5 dark:text-white/20 dark:border-white/10"
                  )}>
                    <span className="flex gap-1 items-center"><Icon name="dark_mode" className="text-[10px]" /><span className="hidden md:inline">PM</span></span>
                    <span>{data.evening.status === 'OPEN' ? data.evening.seats : (data.evening.status === 'CLOSED' ? 'X' : '0')}</span>
                  </div>

                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* FOOTER ACTION */}
      <div className="p-6 border-t border-border bg-surface/50 backdrop-blur-md flex justify-center shrink-0">
        <button 
          onClick={onClose} 
          className="px-12 py-4 rounded-2xl bg-surface border border-border hover:bg-black/5 dark:hover:bg-white/10 text-desc font-accent font-bold uppercase tracking-widest text-xs transition-colors shadow-sm"
        >
          Cancel Selection
        </button>
      </div>

    </div>
  );
};