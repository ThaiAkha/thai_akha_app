import React from 'react';
import { Button, Typography } from '../ui/index';
import { BookingSummaryPills } from './BookingSummaryPills';
import { t } from '../../i18n';

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
    <div className="sticky [bottom:var(--space-fluid-m)] w-full [padding-inline:var(--space-fluid-s)] z-50 animate-in slide-in-from-bottom duration-500">
      <div className="w-full max-w-5xl mx-auto bg-surface/90 backdrop-blur-3xl border border-border/50 rounded-3xl md:rounded-[2.5rem] [padding:var(--space-fluid-m)] shadow-[0_10px_40px_-10px_rgba(0,0,0,0.5)] flex flex-col [gap:var(--space-fluid-m)]">

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
          <div className="flex items-center justify-between w-full border-t border-border/50 [padding-top:var(--space-fluid-m)] px-2 animate-in fade-in slide-in-from-bottom-2 duration-500">
            <div className="flex flex-col text-left">
              <Typography variant="microLabel" color="muted" className="[margin-bottom:var(--space-fluid-2xs)]">{t('booking:stickyTotal')}</Typography>
              <Typography variant="numericPrice" color="title">
                {finalPrice.toLocaleString()} <Typography variant="microLabel" as="span" className="opacity-40">{t('booking:thb')}</Typography>
              </Typography>
              {visitors > 0 && (
                <Typography variant="microLabel" color="muted" className="[margin-top:var(--space-fluid-2xs)]">
                  {visitors > 1 ? t('booking:visitorsNoCostMany', { count: visitors }) : t('booking:visitorsNoCostOne')}
                </Typography>
              )}
            </div>

            <Button
              variant="action"
              size="lg"
              onClick={handleConfirmSelection}
              disabled={!selectedDate || !session || pax === 0}
              icon="arrow_forward"
              className="px-10 md:px-16 h-14 md:h-16 text-base md:text-xl shadow-action-glow transition-all active:scale-95 rounded-full font-black min-w-[160px] md:min-w-[200px]"
            >
              {t('booking:confirmContinue')}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};
