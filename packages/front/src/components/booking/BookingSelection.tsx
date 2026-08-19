import React from 'react';
import { Icon, Button, Typography } from '../ui/index';
import { cn } from '@thaiakha/shared/lib/utils';
import { StepHeader } from './StepHeader';
import { PaxVisitorPicker } from './PaxVisitorPicker';
import type { DailyAvailability, SessionInfo } from './booking.types';

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS_SHORT = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];

interface BookingSelectionProps {
  selectedDate: Date | null;
  handleDateSelect: (d: Date) => void;
  dateOptions: Date[];
  dailyStats: Record<string, DailyAvailability>;
  formattedDateStr: string;
  setShowCalendarModal: (show: boolean) => void;
  session: 'morning_class' | 'evening_class' | null;
  handleSessionSelect: (s: 'morning_class' | 'evening_class') => void;
  sessionConfig: Record<string, SessionInfo>;
  currentStats: DailyAvailability;
  pax: number;
  setPax: (p: number) => void;
  maxSelectable: number;
  isPaxSelected: boolean;
  visitors: number;
  setVisitors: (v: number) => void;
  maxVisitorsAllowed: number;
}

export const BookingSelection: React.FC<BookingSelectionProps> = ({
  selectedDate,
  handleDateSelect,
  dateOptions,
  dailyStats,
  formattedDateStr,
  setShowCalendarModal,
  session,
  handleSessionSelect,
  sessionConfig,
  currentStats,
  pax,
  setPax,
  maxSelectable,
  isPaxSelected,
  visitors,
  setVisitors,
  maxVisitorsAllowed
}) => {
  return (
    <div className="flex flex-col [gap:var(--space-fluid-2xl)] animate-in fade-in slide-in-from-bottom-8">

      {/* BLOCCO 1: DATA */}
      <section id="step-date">

        <div className="flex items-center [gap:var(--space-fluid-s)] bg-surface border border-border p-2 rounded-full shadow-sm [margin-bottom:var(--space-fluid-l)] transition-colors max-w-xl mx-auto">
          <div className="flex-1 group">
            <button onClick={() => setShowCalendarModal(true)} className="w-full bg-transparent text-title font-bold text-lg py-4 px-6 text-left hover:bg-black/5 dark:hover:bg-white/5 rounded-full transition-colors cursor-pointer flex items-center gap-3">
              <span className="text-action transition-transform group-hover:scale-110 flex shrink-0 items-center justify-center"><Icon name="event" size="lg" /></span>
              <span className="truncate">{selectedDate ? formattedDateStr : "Choose a Date..."}</span>
            </button>
          </div>
          <Button variant="action" size="md" onClick={() => setShowCalendarModal(true)} className="shrink-0 rounded-full px-6 mr-1">Month View</Button>
        </div>

        <div className="flex items-center justify-between [gap:var(--space-fluid-s)] overflow-x-hidden no-scrollbar [padding-block:var(--space-fluid-xs)] [padding-inline:var(--space-fluid-xs)]">
          {dateOptions.map((d, i) => {
            const isSelected = selectedDate && d.toDateString() === selectedDate.toDateString();
            const isToday = d.toDateString() === new Date().toDateString();

            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const isPast = d.getTime() < today.getTime();

            const offset = d.getTimezoneOffset() * 60000;
            const dStr = new Date(d.getTime() - offset).toISOString().split('T')[0];
            const dStats = dailyStats[dStr];

            return (
              <button
                key={i}
                disabled={isPast}
                onClick={() => { if (!isPast) handleDateSelect(d); }}
                className={cn(
                  "flex-1 min-w-[100px] md:min-w-[140px] min-h-[160px] md:min-h-[180px] flex flex-col items-center p-4 rounded-[2rem] border transition-all duration-300 relative overflow-hidden",
                  isSelected
                    ? "bg-action/10 backdrop-blur-md border-action text-action shadow-[0_0_30px_-5px_rgba(152,201,60,0.4)] scale-105 z-10 font-bold cursor-pointer"
                    : "bg-surface border-border text-muted hover:border-action/30 hover:bg-black/5 dark:hover:bg-white/5 cursor-pointer",
                  isPast && "opacity-20 grayscale pointer-events-none border-dashed"
                )}
              >
                <div className="flex flex-row items-baseline justify-center gap-2 [margin-top:var(--space-fluid-2xs)] [margin-bottom:var(--space-fluid-s)]">
                  <Typography variant="h5" className={cn(
                    "leading-none tracking-wide",
                    isToday ? "text-primary uppercase" : isSelected ? "text-action" : "text-muted"
                  )}>
                    {isToday ? "TODAY" : `${DAYS[d.getDay()]},`}
                  </Typography>
                  <Typography variant="numericMedium" as="span" className={cn("leading-none", isSelected ? "text-action" : "text-title")}>
                    {d.getDate()}
                  </Typography>
                  <Typography variant="h5" className={cn("leading-none uppercase", isSelected ? "text-action" : "text-title opacity-60")}>
                    {MONTHS_SHORT[d.getMonth()]}
                  </Typography>
                </div>

                {/* SESSION INDICATORS */}
                {!isPast ? (
                  <div className="flex flex-col w-full mt-auto pt-3 border-t border-border/50 gap-2">
                    <Typography variant="h6" className="text-center opacity-60 leading-none mb-1">Spots Available</Typography>
                    <div className="flex w-full">
                      <div className="flex-1 flex flex-col items-center justify-center">
                        {dStats?.morning_class ? (
                          dStats.morning_class.status === 'FULL'
                            ? <Typography variant="h6" className="text-primary tracking-tighter uppercase">Full</Typography>
                            : <Typography variant="numericMedium" className="text-allergy leading-none" as="span">{dStats.morning_class.remaining}</Typography>
                        ) : <div className="size-3 bg-surface-elevated animate-pulse rounded-full" />}
                        <Typography variant="h6" className="opacity-50 uppercase mt-1">Morning</Typography>
                      </div>
                      <div className="flex-1 flex flex-col items-center justify-center border-l border-border/50">
                        {dStats?.evening_class ? (
                          dStats.evening_class.status === 'FULL'
                            ? <Typography variant="h6" className="text-primary tracking-tighter uppercase">Full</Typography>
                            : <Typography variant="numericMedium" className="text-action leading-none" as="span">{dStats.evening_class.remaining}</Typography>
                        ) : <div className="size-3 bg-surface-elevated animate-pulse rounded-full" />}
                        <Typography variant="h6" className="opacity-50 uppercase mt-1">Evening</Typography>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-center text-xs uppercase font-black tracking-widest opacity-30 mt-auto pb-2">
                    Passed
                  </div>
                )}

              </button>
            );
          })}
        </div>
      </section>

      {/* BLOCCO 2: CLASSES */}
      <section id="step-class" className={cn("transition-all duration-500", !selectedDate && "opacity-20 pointer-events-none")}>
        <StepHeader
          number="02"
          stepName="Class Selection"
          title="Pick Your Session"
          subtitle="Choose between our Morning or Evening Class."
        />
        <div className="grid grid-cols-1 md:grid-cols-2 [gap:var(--space-fluid-l)]">
          {['morning_class', 'evening_class'].map((s) => {
            const sessionType = s as 'morning_class' | 'evening_class';
            const info = sessionConfig[sessionType];
            if (!info) return <div key={s} className="h-56 bg-surface-elevated animate-pulse rounded-3xl" />;

            const stats = currentStats[sessionType];
            const isFull = stats.status !== 'OPEN';
            const active = session === sessionType;

            return (
              <div
                key={s}
                onClick={() => !isFull && handleSessionSelect(sessionType)}
                className={cn(
                  "group relative p-8 rounded-[2.5rem] cursor-pointer transition-all duration-300 border-2 flex flex-col",
                  isFull
                    ? "opacity-50 grayscale cursor-not-allowed border-border bg-black/5 dark:bg-white/5"
                    : active
                      ? "bg-action/10 backdrop-blur-md border-action shadow-[0_0_30px_-5px_rgba(152,201,60,0.4)] scale-105 z-10"
                      : "bg-surface border-border hover:border-action hover:bg-black/5 dark:hover:bg-white/5"
                )}
              >
                <div className="flex items-start justify-between mb-8">
                  <div>
                    <Typography variant="h3" color="title" className="italic uppercase leading-none [margin-bottom:var(--space-fluid-xs)] tracking-tighter text-left">
                      <span className={sessionType === 'morning_class' ? 'text-allergy' : 'text-action'}>
                        {sessionType === 'morning_class' ? 'Morning' : 'Evening'}
                      </span>
                      <br />
                      <span className="text-title opacity-30">Cooking Class</span>
                    </Typography>
                  </div>
                </div>
                <div className="flex items-end justify-between mt-auto">
                  <div className="flex flex-col">
                    <Typography variant="numericPrice" color="title" className="leading-none">
                      {info.basePrice.toLocaleString()} <Typography variant="microLabel" as="span" className="opacity-40">Baht / person</Typography>
                    </Typography>
                  </div>

                  {isFull ? (
                    <Typography variant="microLabel" className="[padding-inline:var(--space-fluid-s)] [padding-block:var(--space-fluid-2xs)] rounded-xl bg-primary/10 text-primary border border-primary/30">FULL</Typography>
                  ) : (
                    <div className="bg-black/5 dark:bg-white/5 border border-border/50 rounded-xl [padding-inline:var(--space-fluid-s)] [padding-block:var(--space-fluid-2xs)] flex flex-col items-center justify-center min-w-[70px]">
                      <Typography variant="numericMedium" className="text-action leading-none" as="span">{stats.remaining}</Typography>
                      <Typography variant="microLabel" color="muted" className="[margin-top:var(--space-fluid-2xs)]">Seats</Typography>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* BLOCCO 3: PARTECIPANTI */}
      <section id="step-pax" className={cn("transition-all duration-500", !session && "opacity-20 pointer-events-none")}>
        <StepHeader
          number="03"
          stepName="Group Size"
          title="Travel Companions"
          subtitle="Let us know how many people are joining the family today."
        />
        <div className="flex flex-col items-center [gap:var(--space-fluid-l)] [padding-block:var(--space-fluid-m)]">
          <PaxVisitorPicker
            pax={pax}
            setPax={setPax}
            maxSelectable={maxSelectable}
            isPaxSelected={isPaxSelected}
            visitors={visitors}
            setVisitors={setVisitors}
            maxVisitorsAllowed={maxVisitorsAllowed}
            sessionActive={!!session}
          />
        </div>
      </section>
    </div>
  );
};
