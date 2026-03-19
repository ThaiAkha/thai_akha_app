import React from 'react';
import { Icon } from '../ui/index';
import { cn } from '@thaiakha/shared/lib/utils';

interface BookingSummaryPillsProps {
  shortDateStr: string;
  session: 'morning_class' | 'evening_class' | null;
  pax: number;
  visitors: number;
  selectedDate: Date | null;
  // If provided, pills become clickable buttons
  onDateClick?: () => void;
  onClassClick?: () => void;
  onGroupClick?: () => void;
  className?: string;
}

const PILL_ACTIVE = 'bg-action/10 border-action shadow-[0_0_20px_-5px_rgba(152,201,60,0.3)]';
const PILL_INACTIVE = 'bg-surface border-dashed border-border/60 opacity-60';
const ICON_ACTIVE = 'bg-action text-background';
const ICON_INACTIVE = 'bg-black/10 dark:bg-white/10 text-desc';

interface PillProps {
  label: string;
  value: string;
  icon: string;
  active: boolean;
  onClick?: () => void;
  sessionColor?: string;
}

const Pill: React.FC<PillProps> = ({ label, value, icon, active, onClick, sessionColor }) => {
  const base = cn(
    'flex-1 flex items-center gap-3 px-4 py-3 rounded-full border transition-all duration-300 min-w-max',
    active ? PILL_ACTIVE : PILL_INACTIVE,
    onClick && (active ? 'cursor-pointer hover:brightness-110' : 'cursor-pointer hover:opacity-100 hover:border-action/50')
  );

  const content = (
    <>
      <div className={cn('p-2 rounded-full flex items-center justify-center transition-colors shrink-0', active ? ICON_ACTIVE : ICON_INACTIVE)}>
        <Icon name={icon} size="sm" />
      </div>
      <div className="flex flex-col items-start">
        <span className="text-[10px] font-black uppercase tracking-widest text-desc/50 leading-none mb-0.5">
          {label}
        </span>
        <span className={cn('text-base font-bold leading-none', active ? (sessionColor || 'text-title') : 'text-desc')}>
          {value}
        </span>
      </div>
    </>
  );

  if (onClick) {
    return <button type="button" onClick={onClick} className={base}>{content}</button>;
  }
  return <div className={base}>{content}</div>;
};

export const BookingSummaryPills: React.FC<BookingSummaryPillsProps> = ({
  shortDateStr,
  session,
  pax,
  visitors,
  selectedDate,
  onDateClick,
  onClassClick,
  onGroupClick,
  className,
}) => {
  const sessionLabel = session === 'morning_class' ? 'Morning' : session === 'evening_class' ? 'Evening' : 'Select';
  const sessionColor = session === 'morning_class' ? 'text-orange-500' : session === 'evening_class' ? 'text-action' : undefined;
  const sessionIcon = session === 'morning_class' ? 'wb_sunny' : 'dark_mode';
  const groupValue = pax > 0
    ? `${pax} Cook${pax > 1 ? 's' : ''}${visitors > 0 ? ` + ${visitors}` : ''}`
    : 'Select';

  return (
    <div className={cn('flex items-center gap-3 overflow-x-auto no-scrollbar', className)}>
      <Pill
        label="Date"
        value={selectedDate ? shortDateStr : 'Select'}
        icon="event"
        active={!!selectedDate}
        onClick={onDateClick}
      />

      <Icon name="chevron_right" size="xs" className="text-desc/20 hidden lg:block shrink-0" />

      <Pill
        label="Class"
        value={sessionLabel}
        icon={sessionIcon}
        active={!!session}
        onClick={onClassClick}
        sessionColor={session ? sessionColor : undefined}
      />

      <Icon name="chevron_right" size="xs" className="text-desc/20 hidden lg:block shrink-0" />

      <Pill
        label="Group"
        value={groupValue}
        icon="groups"
        active={pax > 0}
        onClick={onGroupClick}
      />
    </div>
  );
};
