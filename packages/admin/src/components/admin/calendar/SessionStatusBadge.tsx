/**
 * Standardized badge for displaying session status (Morning/Evening)
 * Used consistently across calendar views
 */

import React from 'react';
import { cn } from '@thaiakha/shared/lib/utils';
import { Sun, Moon } from 'lucide-react';

interface SessionStatusBadgeProps {
  status: 'OPEN' | 'FULL' | 'CLOSED';
  seats?: number;
  label: 'Morning' | 'Evening';
  size?: 'sm' | 'md';
  showIcon?: boolean;
  compact?: boolean;
}

const SessionStatusBadge: React.FC<SessionStatusBadgeProps> = ({
  status,
  seats = 0,
  label,
  size = 'md',
  showIcon = true,
  compact = false,
}) => {
  const isOpen = status === 'OPEN';
  const isFull = status === 'FULL';

  const Icon = label === 'Morning' ? Sun : Moon;

  const containerClass = cn(
    'flex items-center justify-between rounded border font-bold transition-all',
    size === 'sm' ? 'px-1.5 py-0.5 text-[9px]' : 'px-2 py-1 text-xs',
    isOpen
      ? 'bg-green-50 dark:bg-green-500/15 text-green-700 dark:text-green-300 border-green-200 dark:border-green-500/40'
      : isFull
        ? 'bg-red-50 dark:bg-red-500/15 text-red-700 dark:text-red-300 border-red-200 dark:border-red-500/40'
        : 'bg-orange-50 dark:bg-orange-500/15 text-orange-700 dark:text-orange-300 border-orange-200 dark:border-orange-500/40'
  );

  const displayValue = isOpen ? seats : isFull ? '0' : 'X';

  return (
    <div className={containerClass}>
      <span className="flex gap-1 items-center whitespace-nowrap">
        {showIcon && <Icon className={size === 'sm' ? 'w-2.5 h-2.5' : 'w-3 h-3'} />}
        <span>{compact ? (label === 'Morning' ? 'AM' : 'PM') : label}</span>
      </span>
      <span className="font-black ml-1">{displayValue}</span>
    </div>
  );
};

export default SessionStatusBadge;
