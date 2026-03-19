import React from 'react';
import { Icon } from '../ui/index';
import { cn } from '@thaiakha/shared/lib/utils';

interface PaxVisitorPickerProps {
  // Cooks
  pax: number;
  setPax: (p: number) => void;
  maxSelectable: number;
  isPaxSelected: boolean;
  // Visitors
  visitors: number;
  setVisitors: (v: number) => void;
  maxVisitorsAllowed: number;
  // Context
  sessionActive: boolean; // whether a session has been selected
}

// ─── Sub-component: single stepper row ──────────────────────────────────────

interface StepperRowProps {
  icon: string;
  label: string;
  value: number;
  onDecrement: () => void;
  onIncrement: () => void;
  isActive: boolean;
  isDisabled: boolean;
  canDecrement: boolean;
  canIncrement: boolean;
  colorScheme: 'action' | 'btn-s';
  hint?: React.ReactNode;
  compact?: boolean;
}

const StepperRow: React.FC<StepperRowProps> = ({
  icon,
  label,
  value,
  onDecrement,
  onIncrement,
  isActive,
  isDisabled,
  canDecrement,
  canIncrement,
  colorScheme,
  hint,
  compact = false,
}) => {
  const isAction = colorScheme === 'action';

  // Active container styles per color scheme
  const containerActive = isAction
    ? 'bg-action/10 border-action shadow-[0_0_30px_-5px_rgba(152,201,60,0.4)] scale-105'
    : 'bg-btn-s-500/10 border-btn-s-500 shadow-[0_0_30px_-5px_rgba(28,163,230,0.4)] scale-105';

  // Label / icon active color
  const labelActive = isAction ? 'text-action' : 'text-btn-s-500';
  const labelInactive = 'text-muted';

  // Add button bg
  const addBtnActive = isAction
    ? 'bg-action shadow-action-glow'
    : 'bg-btn-s-500 shadow-[0_4px_16px_rgba(28,163,230,0.4)]';

  // Compact (~10% smaller) sizing tokens
  const px      = compact ? 'px-9'          : 'px-10';
  const py      = compact ? 'py-[18px]'     : 'py-5';
  const gap     = compact ? 'gap-5'         : 'gap-6';
  const btnSize = compact ? 'size-11'       : 'size-12';
  const numSize = compact ? 'text-3xl w-10' : 'text-4xl w-12';
  const lblSize = compact ? 'text-lg'       : 'text-xl';
  const prSize  = compact ? 'pr-6'          : 'pr-8';
  const minW    = compact ? 'min-w-[108px]' : 'min-w-[120px]';
  const gapStp  = compact ? 'gap-6'         : 'gap-8';

  return (
    <div className={cn('flex flex-col items-center gap-3', isDisabled && 'opacity-30 pointer-events-none')}>
      <div
        className={cn(
          'flex items-center backdrop-blur-md border rounded-full transition-all duration-500 w-full',
          gap, px, py,
          isActive ? containerActive : 'bg-surface border-border opacity-80 shadow-sm',
        )}
      >
        {/* Label */}
        <div className={cn('flex items-center gap-3 border-r border-border', prSize, minW)}>
          <Icon name={icon} size={compact ? 'md' : 'lg'} className={isActive ? labelActive : labelInactive} />
          <span className={cn('font-black uppercase tracking-widest', lblSize, isActive ? labelActive : labelInactive)}>
            {label}
          </span>
        </div>

        {/* Stepper */}
        <div className={cn('flex items-center', gapStp)}>
          <button
            onClick={onDecrement}
            disabled={!canDecrement}
            className={cn('rounded-full border border-border flex items-center justify-center hover:border-action transition-colors text-title bg-background shadow-sm cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed', btnSize)}
          >
            <Icon name="remove" size="sm" />
          </button>
          <span className={cn('font-mono font-black text-title text-center', numSize)}>{value}</span>
          <button
            onClick={onIncrement}
            disabled={!canIncrement}
            className={cn(
              'rounded-full flex items-center justify-center text-background hover:scale-110 transition-transform border-none cursor-pointer',
              btnSize,
              canIncrement ? addBtnActive : 'bg-black/10 dark:bg-white/10 cursor-not-allowed hover:scale-100',
            )}
          >
            <Icon name="add" size="sm" />
          </button>
        </div>
      </div>

      {/* Optional hint row */}
      {hint && <div className="text-sm text-sub text-center font-medium px-2">{hint}</div>}
    </div>
  );
};

// ─── Main component ──────────────────────────────────────────────────────────

export const PaxVisitorPicker: React.FC<PaxVisitorPickerProps> = ({
  pax,
  setPax,
  maxSelectable,
  isPaxSelected,
  visitors,
  setVisitors,
  maxVisitorsAllowed,
  sessionActive,
}) => {
  const visitorHint = (
    <>
      Visitors do not cook.&nbsp;Max&nbsp;1&nbsp;per&nbsp;cook,&nbsp;up&nbsp;to&nbsp;2&nbsp;per&nbsp;booking.
      {isPaxSelected && maxVisitorsAllowed === 0 && (
        <span className="block text-btn-s-500/80 mt-1 font-bold">
          No visitor spots left for this class.
        </span>
      )}
    </>
  );

  return (
    <div className={cn('flex flex-col items-center gap-6 w-full max-w-md transition-all duration-500', !sessionActive && 'opacity-20 pointer-events-none')}>

      {/* COOKS */}
      <StepperRow
        icon="groups"
        label="Cooks"
        value={pax}
        onDecrement={() => setPax(Math.max(0, pax - 1))}
        onIncrement={() => setPax(Math.min(maxSelectable > 0 ? maxSelectable : 12, pax + 1))}
        isActive={isPaxSelected}
        isDisabled={false}
        canDecrement={pax > 0}
        canIncrement={pax < (maxSelectable > 0 ? maxSelectable : 12)}
        colorScheme="action"
      />

      {/* DIVIDER */}
      <div className="flex items-center gap-5 w-full px-4">
        <div className="flex-1 h-px bg-border/40" />
        <span className="text-xs font-black uppercase tracking-widest text-muted">+ Optional</span>
        <div className="flex-1 h-px bg-border/40" />
      </div>

      {/* VISITORS */}
      <StepperRow
        icon="person"
        label="Visitors"
        value={visitors}
        onDecrement={() => setVisitors(Math.max(0, visitors - 1))}
        onIncrement={() => setVisitors(Math.min(maxVisitorsAllowed, visitors + 1))}
        isActive={visitors > 0}
        isDisabled={!isPaxSelected}
        canDecrement={visitors > 0}
        canIncrement={visitors < maxVisitorsAllowed}
        colorScheme="btn-s"
        compact={true}
        hint={visitorHint}
      />

    </div>
  );
};
