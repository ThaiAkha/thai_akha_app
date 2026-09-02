import React from 'react';
import { Minus, Plus } from 'lucide-react';
import { cn } from '@thaiakha/shared/lib/utils';

interface PackStepperProps {
  qty: number;
  onIncrement: () => void;
  onDecrement: () => void;
  /** 'lg' = card footer, full-width row (48px buttons that stretch) · 'md' = 44px targets · 'sm' = checklist row. */
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  className?: string;
}

const BTN = 'flex items-center justify-center rounded-xl border transition-colors select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 disabled:opacity-40 disabled:pointer-events-none';

/** [-] N [+] stepper counting purchase packs. Stops click propagation so it can live inside clickable cards/rows. */
export const PackStepper: React.FC<PackStepperProps> = ({ qty, onIncrement, onDecrement, size = 'md', disabled, className }) => {
  const sm = size === 'sm';
  const lg = size === 'lg';
  const btnSize = sm ? 'size-9' : lg ? 'h-12 flex-1' : 'size-11';
  const icon = sm ? 'w-4 h-4' : lg ? 'w-6 h-6' : 'w-5 h-5';
  const stop = (fn: () => void) => (e: React.MouseEvent) => { e.stopPropagation(); fn(); };
  return (
    <div className={cn('flex items-center', sm ? 'gap-1' : 'gap-2', lg && 'w-full', className)} onClick={e => e.stopPropagation()}>
      <button
        type="button"
        aria-label="Remove one pack"
        disabled={disabled || qty <= 0}
        onClick={stop(onDecrement)}
        className={cn(BTN, btnSize, 'bg-surface border-gray-200 dark:border-gray-700 text-sub hover:border-primary-400 hover:text-primary-600 active:scale-95')}
      >
        <Minus className={icon} />
      </button>
      <span className={cn('font-mono font-black tabular-nums text-center text-title', sm ? 'min-w-7 text-sm' : lg ? 'min-w-12 text-2xl' : 'min-w-9 text-xl')}>{qty}</span>
      <button
        type="button"
        aria-label="Add one pack"
        disabled={disabled}
        onClick={stop(onIncrement)}
        className={cn(BTN, btnSize, 'bg-primary-500 border-primary-500 text-white hover:bg-primary-600 active:scale-95 shadow-sm')}
      >
        <Plus className={icon} />
      </button>
    </div>
  );
};

export default PackStepper;
