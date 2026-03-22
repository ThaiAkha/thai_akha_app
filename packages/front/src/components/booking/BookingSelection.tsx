import React from 'react';
import { Icon, Button, Typography } from '../ui/index';
import { cn } from '@thaiakha/shared/lib/utils';
import { StepHeader } from './StepHeader';
import { PaxVisitorPicker } from './PaxVisitorPicker';

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS_SHORT = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];

interface BookingSelectionProps {
  selectedDate: Date | null;
  handleDateSelect: (d: Date) => void;
  dateOptions: Date[];
  dailyStats: Record<string, any>;
  formattedDateStr: string;
  setShowCalendarModal: (show: boolean) => void;
  session: 'morning_class' | 'evening_class' | null;
  handleSessionSelect: (s: 'morning_class' | 'evening_class') => void;
  sessionConfig: Record<string, any>;
  currentStats: any;
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
    <div className="space-y-16 animate-in fade-in slide-in-from-bottom-8">

      {/* BLOCCO 1: DATA */}
      <section id="step-date">
        <StepHeader
          number="01"
          stepName="Date Selection"
          title="Choose Your Cooking Day"
          subtitle="Select a date to see available seats for our sessions."
        />

        <div className="flex items-center gap-3 bg-surface border border-border p-2 rounded-2xl shadow-sm mb-8 transition-colors max-w-xl mx-auto">
          <div className="relative flex-1">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-action pointer-events-none"><Icon name="event" size="lg" /></div>
            <button onClick={() => setShowCalendarModal(true)} className="w-full bg-transparent text-gray-900 dark:text-gray-100 font-bold text-lg py-4 pl-12 pr-4 text-left hover:bg-black/5 dark:hover:bg-white/5 rounded-xl transition-colors cursor-pointer">
              {selectedDate ? formattedDateStr : "Choose a Date..."}
            </button>
          </div>
          <Button variant="mineral" size="md" onClick={() => setShowCalendarModal(true)} className="shrink-0">Month View</Button>
        </div>

        <div className="flex items-center justify-between gap-4 overflow-x-hidden no-scrollbar py-2 px-2">
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
                  "flex-1 min-w-[70px] md:min-w-[100px] h-[120px] md:h-[140px] flex flex-col items-center justify-center p-3 rounded-2xl border transition-all duration-300 relative overflow-hidden",
                  isSelected
                    ? "bg-action/10 backdrop-blur-md border-action text-action shadow-[0_0_30px_-5px_rgba(152,201,60,0.4)] scale-105 z-10 font-bold cursor-pointer"
                    : "bg-surface border-border text-gray-700 dark:text-gray-300 hover:border-action/30 hover:bg-surface/80 cursor-pointer",
                  isPast && "opacity-20 grayscale pointer-events-none border-dashed",
                  (i === 0 || i === 4) && "hidden md:flex"
                )}
              >
                <span className={cn(
                  "text-[10px] font-black uppercase tracking-widest leading-none mb-1",
                  isToday ? "text-red-500" : isSelected ? "text-action" : "text-gray-500 dark:text-gray-500"
                )}>
                  {isToday ? "TODAY" : DAYS[d.getDay()]}
                </span>
                <span className={cn("text-3xl font-mono font-black leading-none my-0.5", isSelected ? "text-action" : "text-gray-900 dark:text-gray-100")}>
                  {d.getDate()}
                </span>
                <span className="text-[10px] font-black uppercase tracking-widest opacity-40 mt-1 mb-2">
                  {MONTHS_SHORT[d.getMonth()]}
                </span>

                {/* SESSION INDICATORS */}
                {!isPast ? (
                  <div className="flex w-full mt-auto pt-2 border-t border-border/50 gap-2 h-10">
                    <div className="flex-1 flex items-center justify-center">
                      {dStats?.morning_class ? (
                        dStats.morning_class.status === 'FULL'
                          ? <span className="text-[10px] text-red-500 font-bold uppercase tracking-tighter">Full</span>
                          : <span className="text-xl font-mono font-black text-orange-500 leading-none">{dStats.morning_class.remaining}</span>
                      ) : <div className="h-3 w-3 bg-black/10 dark:bg-white/20 animate-pulse rounded-full" />}
                    </div>
                    <div className="flex-1 flex items-center justify-center border-l border-border/50">
                      {dStats?.evening_class ? (
                        dStats.evening_class.status === 'FULL'
                          ? <span className="text-[10px] text-red-500 font-bold uppercase tracking-tighter">Full</span>
                          : <span className="text-xl font-mono font-black text-action leading-none">{dStats.evening_class.remaining}</span>
                      ) : <div className="h-3 w-3 bg-black/10 dark:bg-white/20 animate-pulse rounded-full" />}
                    </div>
                  </div>
                ) : (
                  <div className="mt-auto mb-1 text-[8px] font-black uppercase tracking-widest text-gray-500 dark:text-gray-500 opacity-60">Past</div>
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {['morning_class', 'evening_class'].map((s) => {
            const sessionType = s as 'morning_class' | 'evening_class';
            const info = sessionConfig[sessionType];
            if (!info) return <div key={s} className="h-56 bg-white/5 animate-pulse rounded-3xl" />;

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
                      : "bg-surface border-border hover:border-action hover:bg-black/[0.02] dark:hover:bg-white/[0.02]"
                )}
              >
                <div className="flex items-start justify-between mb-8">
                  <div>
                    <Typography variant="h3" className="text-gray-900 dark:text-gray-100 text-xl font-black italic uppercase leading-none mb-2 tracking-tighter text-left">
                      <span className={sessionType === 'morning_class' ? 'text-orange-500' : 'text-action'}>
                        {sessionType === 'morning_class' ? 'Morning' : 'Evening'}
                      </span>
                      <br />
                      <span className="text-gray-900 dark:text-gray-100 opacity-30">Cooking Class</span>
                    </Typography>
                  </div>
                </div>
                <div className="flex items-end justify-between mt-auto">
                  <div className="flex flex-col">
                    <span className="text-2xl font-mono font-black text-gray-900 dark:text-gray-100 leading-none">
                      {info.basePrice.toLocaleString()} <span className="text-sm font-sans font-bold opacity-40">Baht / person</span>
                    </span>
                  </div>

                  {isFull ? (
                    <span className="px-4 py-2 rounded-xl bg-red-500/10 text-red-500 border border-red-500/30 text-[10px] font-black uppercase tracking-widest">FULL</span>
                  ) : (
                    <div className="bg-background/50 border border-border/50 rounded-xl px-4 py-2 flex flex-col items-center justify-center min-w-[70px]">
                      <span className="text-xl font-mono font-black text-action leading-none">{stats.remaining}</span>
                      <span className="text-[9px] font-black uppercase tracking-widest text-gray-500 dark:text-gray-500 mt-1">Seats</span>
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
        <div className="flex flex-col items-center gap-8 py-6">
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
