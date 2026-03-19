import React from 'react';
import { Button } from '../ui/index';
import { BookingSummaryPills } from './BookingSummaryPills';

interface BookingStickyFooterProps {
  viewStep: string;
  selectedDate: Date | null;
  session: string | null;
  shortDateStr: string;
  pax: number;
  visitors: number;
  finalPrice: number;
  handleConfirmSelection: () => void;
}

export const BookingStickyFooter: React.FC<BookingStickyFooterProps> = ({
  viewStep,
  selectedDate,
  session,
  shortDateStr,
  pax,
  visitors,
  finalPrice,
  handleConfirmSelection
}) => {
  if (viewStep !== 'selection') return null;

  return (
    <div className="sticky bottom-6 w-full px-4 z-50 animate-in slide-in-from-bottom duration-500">
      <div className="w-full max-w-5xl mx-auto bg-surface/90 backdrop-blur-3xl border border-border/50 rounded-3xl md:rounded-[2.5rem] p-4 md:p-6 shadow-[0_10px_40px_-10px_rgba(0,0,0,0.5)] flex flex-col gap-6">

        {/* PILLS ROW */}
        <BookingSummaryPills
          shortDateStr={shortDateStr}
          session={session as 'morning_class' | 'evening_class' | null}
          pax={pax}
          visitors={visitors}
          selectedDate={selectedDate}
          onDateClick={() => document.getElementById('step-date')?.scrollIntoView({ behavior: 'smooth' })}
          onClassClick={() => selectedDate ? document.getElementById('step-class')?.scrollIntoView({ behavior: 'smooth' }) : undefined}
          onGroupClick={() => (selectedDate && session) ? document.getElementById('step-pax')?.scrollIntoView({ behavior: 'smooth' }) : undefined}
        />

        {/* PRICE & CONTINUE */}
        {pax > 0 && (
          <div className="flex items-center justify-between w-full border-t border-border/50 pt-4 md:pt-6 px-2 animate-in fade-in slide-in-from-bottom-2 duration-500">
            <div className="flex flex-col text-left">
              <span className="text-[10px] font-black uppercase tracking-widest text-muted mb-1">Total Amount Due</span>
              <span className="text-2xl md:text-4xl font-mono font-black text-title leading-none">
                {finalPrice.toLocaleString()} <span className="text-sm md:text-base font-sans font-bold uppercase opacity-40">THB</span>
              </span>
              {visitors > 0 && (
                <span className="text-[10px] text-muted mt-1">
                  + {visitors} visitor{visitors > 1 ? 's' : ''} (no extra charge)
                </span>
              )}
            </div>

            <Button
              variant="action"
              size="xl"
              onClick={handleConfirmSelection}
              disabled={!selectedDate || !session || pax === 0}
              icon="arrow_forward"
              className="px-10 md:px-16 h-14 md:h-16 text-base md:text-xl shadow-action-glow transition-all active:scale-95 rounded-full font-black min-w-[160px] md:min-w-[200px]"
            >
              Confirm & Continue
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};
