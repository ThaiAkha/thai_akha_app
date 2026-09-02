import React, { useState, useMemo } from 'react';
import { Button, Tooltip, Typography } from '../ui/index';
import { cn } from '@thaiakha/shared/lib/utils';
import { t } from '../../i18n';
import { getDateKey } from '@thaiakha/shared/lib/dateKeyUtils';
import { useCalendarAvailability } from './hooks/useCalendarAvailability';

interface CalendarViewProps {
  currentDate: Date | null;
  onSelectDate: (date: Date) => void;
  onClose: () => void;
  allowSelectionOnFullDays?: boolean; // Per Admin
}

// Posti per giorno/sessione: dati e tipi in ./hooks/useCalendarAvailability.

const DAYS_HEADER = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];


export const CalendarView: React.FC<CalendarViewProps> = ({
  currentDate,
  onSelectDate,
  onClose,
  allowSelectionOnFullDays = false
}) => {
  const [viewDate, setViewDate] = useState(new Date(currentDate || new Date()));
  // --- 1. DATA (posti per giorno, cache TanStack, rilettura a ogni mese) ---
  const { availability, loading } = useCalendarAvailability(viewDate);

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
    <div className="w-full h-full flex flex-col font-sans select-none text-title bg-surface rounded-[2rem]">

      {/* HEADER */}
      <div className="flex items-center justify-between [padding-bottom:var(--space-fluid-s)] border-b border-border shrink-0">
        <div>
          <Typography variant="h3" color="title" className="uppercase leading-none [margin-bottom:var(--space-fluid-2xs)]">
            {MONTHS[viewDate.getMonth()]} <span className="text-action">{viewDate.getFullYear()}</span>
          </Typography>
          <Typography variant="microLabel" color="muted" className="block">
            <span className="text-allergy">Morning</span> & <span className="text-action">Evening</span> availability
          </Typography>

        </div>

        <div className="flex gap-2">
          <Tooltip content={t('booking:tooltips.calendar.prevMonth')} position="bottom">
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

          <Tooltip content={t('booking:tooltips.calendar.nextMonth')} position="bottom">
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

          <Tooltip content={t('booking:tooltips.calendar.close')} position="bottom">
            <Button
              variant="mineral"
              size="md"
              onClick={onClose}
              icon="close"
              iconPosition="only"
              iconSize="1.5rem"
              className="size-12 rounded-xl ml-2 text-primary"
            />
          </Tooltip>
        </div>
      </div>

      {/* GIORNI SETTIMANA */}
      <div className="grid grid-cols-7 border-b border-border bg-surface/90 shrink-0">
        {DAYS_HEADER.map(d => (
          <div key={d} className="[padding-block:var(--space-fluid-s)] text-center">
            <Typography variant="microLabel" color="muted">{d}</Typography>
          </div>
        ))}
      </div>

      {/* GRIGLIA PRINCIPALE */}
      <div className="grid grid-cols-7 grid-rows-6 flex-1 gap-px bg-border overflow-y-auto custom-scrollbar">
        {calendarDays.map((date) => {
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
            if (isPast || !isCurrentMonth) return t('booking:tooltips.calendar.dayUnavailable');
            if (loading) return t('booking:tooltips.calendar.dayLoading');
            if (isFullDay && !allowSelectionOnFullDays) return t('booking:tooltips.calendar.daySoldOut');

            if (mOpen && eOpen) return t('booking:tooltips.calendar.dayBothOpen');
            if (mOpen) return t('booking:tooltips.calendar.dayMorningOnly');
            if (eOpen) return t('booking:tooltips.calendar.dayEveningOnly');
            return t('booking:tooltips.calendar.daySelectable');
          };

          return (
            <Tooltip key={dateStr} content={getTooltipContent()} className="w-full h-full">
              <button
                disabled={isPast || loading || !isCurrentMonth || (isFullDay && !allowSelectionOnFullDays)}
                onClick={() => { onSelectDate(date); onClose(); }}
                className={cn(
                  "w-full h-full relative flex flex-col justify-between p-2 min-h-[120px] group transition-all text-left bg-surface",
                  "hover:z-10 hover:ring-2 hover:ring-action",
                  // BACKGROUND COLOR LOGIC
                  !isCurrentMonth
                    ? "cursor-not-allowed opacity-40"
                    : isPast
                      ? "cursor-not-allowed"
                      : isFullDay
                        ? allowSelectionOnFullDays
                          ? "bg-primary/10 ring-1 ring-primary/20 cursor-pointer"
                          : "bg-primary/5 ring-1 ring-primary/10 cursor-not-allowed"
                        : "hover:bg-black/5 dark:hover:bg-white/5",

                  isSelected && "bg-action/10 ring-2 ring-action/60 z-10"
                )}
              >
                <div className={cn("flex justify-between items-start", (isPast || !isCurrentMonth) && "opacity-50")}>
                  <div className={cn(
                    "size-8 flex items-center justify-center rounded-xl border transition-all mb-4",
                    isToday
                      ? "bg-action border-action text-black shadow-lg shadow-action/20"
                      : (isPast || !isCurrentMonth)
                        ? "bg-transparent border-transparent text-muted"
                        : "bg-black/5 dark:bg-white/5 border-border text-title group-hover:border-action/50 shadow-sm"
                  )}>
                    <Typography variant="numericMedium" as="span" color="inherit">{date.getDate()}</Typography>
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
                    <div className="flex items-center justify-between px-1">
                      <Typography variant="microLabel" as="span" className={cn("hidden md:inline", data.morning.status === 'OPEN' ? "text-allergy" : "text-primary")}>Morning Class</Typography>
                      <Typography variant="numericMedium" as="span" className={data.morning.status === 'OPEN' ? "text-allergy" : "text-primary"}>{data.morning.status === 'OPEN' ? data.morning.seats : '0'}</Typography>
                    </div>

                    {/* Divider */}
                    <div className="h-px bg-border mx-2" />

                    {/* Evening Section */}
                    <div className="flex items-center justify-between px-1">
                      <Typography variant="microLabel" as="span" className={cn("hidden md:inline", data.evening.status === 'OPEN' ? "text-action" : "text-primary")}>Evening Class</Typography>
                      <Typography variant="numericMedium" as="span" className={data.evening.status === 'OPEN' ? "text-action" : "text-primary"}>{data.evening.status === 'OPEN' ? data.evening.seats : '0'}</Typography>
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