import React, { useMemo } from 'react';
import { Calendar, CheckCircle, BookOpen, Star, Award, AlertTriangle } from 'lucide-react';
import { cn } from '@thaiakha/shared/lib/utils';

interface ContextualStatsViewProps {
  activeTab: string;
  activeBooking: any | null;
  menuSelection: any | null;
}

function getCountdownLabel(dateStr: string): { label: string; isToday: boolean } {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const target = new Date(dateStr);
  target.setHours(0, 0, 0, 0);
  const diff = Math.round((target.getTime() - now.getTime()) / 86400000);
  if (diff === 0) return { label: 'Today!', isToday: true };
  if (diff === 1) return { label: 'Tomorrow', isToday: false };
  if (diff < 0)  return { label: 'Completed', isToday: false };
  return { label: `${diff} days`, isToday: false };
}

const StatShell: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className }) => (
  <div className={cn('bg-surface border border-border rounded-3xl p-5', className)}>
    {children}
  </div>
);

const StatLabel: React.FC<{ children: React.ReactNode; warning?: boolean }> = ({ children, warning }) => (
  <p className={cn(
    'text-[10px] font-black uppercase tracking-widest mb-4',
    warning ? 'text-amber-800 dark:text-yellow-400' : 'text-gray-500 dark:text-gray-500'
  )}>
    {children}
  </p>
);

const ContextualStatsView: React.FC<ContextualStatsViewProps> = ({
  activeTab,
  activeBooking,
  menuSelection,
}) => {
  const countdown = useMemo(() =>
    activeBooking?.booking_date ? getCountdownLabel(activeBooking.booking_date) : null,
    [activeBooking?.booking_date]
  );

  const hotelPending = activeBooking?.hotel_name === 'To be selected';

  const dishCount = useMemo(() => {
    if (!menuSelection) return 0;
    return [menuSelection.curry, menuSelection.soup, menuSelection.stirfry].filter(Boolean).length;
  }, [menuSelection]);

  /* ── OVERVIEW ── */
  if (activeTab === 'overview') {
    const menuDone = !!menuSelection;
    return (
      <StatShell>
        <StatLabel>Journey Progress</StatLabel>
        <div className="flex items-center gap-3 mb-2">
          <CheckCircle className={cn('w-5 h-5 shrink-0', menuDone ? 'text-action' : 'text-border')} />
          <span className={cn('text-sm font-medium', menuDone ? 'text-gray-700 dark:text-gray-300' : 'text-gray-500 dark:text-gray-500')}>
            Menu selected
          </span>
        </div>
        <div className="mt-4 pt-4 border-t border-border">
          <p className="text-2xl font-black text-gray-900 dark:text-gray-100">
            {menuDone ? 1 : 0}
            <span className="text-base font-medium text-gray-500 dark:text-gray-500"> / 1</span>
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-500 mt-0.5">tasks complete</p>
        </div>
      </StatShell>
    );
  }

  /* ── MY RESERVATION ── */
  if (activeTab === 'reservation') {
    return (
      <div className={cn(
        'border rounded-3xl p-5',
        hotelPending
          ? 'bg-sys-notice/10 border-sys-notice/40'
          : 'bg-surface border-border'
      )}>
        <StatLabel warning={hotelPending}>
          {hotelPending ? 'Action Required' : 'Next Class'}
        </StatLabel>

        {countdown ? (
          <div className="flex items-start gap-3">
            <Calendar className={cn(
              'w-5 h-5 shrink-0 mt-0.5',
              countdown.isToday ? 'text-primary' : hotelPending ? 'text-sys-notice' : 'text-action'
            )} />
            <div>
              <p className="text-2xl font-black text-gray-900 dark:text-gray-100">{countdown.label}</p>
              <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                {new Date(activeBooking.booking_date).toLocaleDateString('en-GB', {
                  day: 'numeric', month: 'short', year: 'numeric'
                })}
              </p>
            </div>
          </div>
        ) : (
          <p className="text-sm text-gray-500 dark:text-gray-500">No booking yet</p>
        )}

        {hotelPending && (
          <div className="flex items-center gap-2 mt-3 text-amber-800 dark:text-yellow-400 text-xs font-semibold">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            Hotel pickup not set
          </div>
        )}
      </div>
    );
  }

  /* ── MY MENU ── */
  if (activeTab === 'menu') {
    return (
      <StatShell>
        <StatLabel>My Menu</StatLabel>
        <div className="flex items-start gap-3">
          <BookOpen className="w-5 h-5 text-action shrink-0 mt-0.5" />
          <div>
            <p className="text-2xl font-black text-gray-900 dark:text-gray-100">
              {dishCount}
              <span className="text-base font-medium text-gray-500 dark:text-gray-500"> / 3</span>
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">dishes selected</p>
          </div>
        </div>
        {dishCount === 3 && (
          <div className="mt-4 pt-4 border-t border-border flex items-center gap-2 text-action text-xs font-bold">
            <CheckCircle className="w-4 h-4" />
            Menu complete!
          </div>
        )}
      </StatShell>
    );
  }

  /* ── AKHA QUIZ ── */
  if (activeTab === 'quiz') {
    return (
      <StatShell>
        <StatLabel>Quiz Level</StatLabel>
        <div className="flex items-start gap-3">
          <Star className="w-5 h-5 text-primary shrink-0 mt-0.5" />
          <div>
            <p className="text-2xl font-black text-gray-900 dark:text-gray-100">1</p>
            <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">current level</p>
          </div>
        </div>
      </StatShell>
    );
  }

  /* ── PASSPORT ── */
  if (activeTab === 'passport') {
    const hasCert = dishCount === 3;
    return (
      <StatShell>
        <StatLabel>Certificate</StatLabel>
        <div className="flex items-start gap-3">
          <Award className={cn('w-5 h-5 shrink-0 mt-0.5', hasCert ? 'text-action' : 'text-border')} />
          <p className={cn('text-sm font-medium leading-snug', hasCert ? 'text-gray-700 dark:text-gray-300' : 'text-gray-500 dark:text-gray-500')}>
            {hasCert ? 'Ready to download' : 'Complete your menu first'}
          </p>
        </div>
      </StatShell>
    );
  }

  return null;
};

export default ContextualStatsView;
