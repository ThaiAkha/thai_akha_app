import React from 'react';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import { cn } from '@thaiakha/shared/lib/utils';
import Button from '../../ui/button/Button';

interface CalendarHeaderProps {
  viewDate: Date;
  onPrev: () => void;
  onNext: () => void;
  canNavigatePrev?: boolean;
  onClose?: () => void;
  showBulkEditButton?: boolean;
  isBulkMode?: boolean;
  onBulkModeChange?: (v: boolean) => void;
  subtitle?: string;
  bulkSessionSelector?: React.ReactNode;
}

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const CalendarHeader: React.FC<CalendarHeaderProps> = ({
  viewDate,
  onPrev,
  onNext,
  canNavigatePrev = true,
  onClose,
  showBulkEditButton = false,
  isBulkMode = false,
  onBulkModeChange,
  subtitle,
  bulkSessionSelector,
}) => {
  return (
    <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-800 shrink-0">
      <div className="space-y-0.5">
        <h3 className="text-xl font-black uppercase text-gray-900 dark:text-gray-100">
          {MONTHS[viewDate.getMonth()]} <span className="text-primary-500">{viewDate.getFullYear()}</span>
        </h3>
        {subtitle && (
          <p className="text-xs font-black uppercase tracking-widest text-gray-700 dark:text-gray-400">
            {subtitle}
          </p>
        )}
      </div>

      <div className="flex items-center gap-2">
        {bulkSessionSelector && (
          <>
            {bulkSessionSelector}
            <div className="w-px h-8 bg-gray-200 dark:bg-gray-800 mx-2" />
          </>
        )}

        {showBulkEditButton && onBulkModeChange && (
          <>
            <Button
              variant={isBulkMode ? 'primary' : 'outline'}
              size="sm"
              onClick={() => onBulkModeChange(!isBulkMode)}
              className="text-xs font-black uppercase"
            >
              {isBulkMode ? 'Close Bulk' : 'Bulk Edit'}
            </Button>
            <div className="w-px h-8 bg-gray-200 dark:bg-gray-800 mx-2" />
          </>
        )}

        <button
          onClick={onPrev}
          disabled={!canNavigatePrev}
          className={cn(
            'p-2 rounded-xl border transition-all active:scale-95',
            canNavigatePrev
              ? 'bg-white dark:bg-gray-900 border-gray-100 dark:border-gray-800 hover:border-primary-200 dark:hover:border-primary-500/30 text-gray-800 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100'
              : 'opacity-20 border-gray-100 dark:border-gray-800 cursor-not-allowed text-gray-800 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100'
          )}
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        <button
          onClick={onNext}
          className="p-2 rounded-xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 hover:border-primary-200 dark:hover:border-primary-500/30 transition-all active:scale-95 text-gray-800 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100"
        >
          <ChevronRight className="w-5 h-5" />
        </button>

        {onClose && (
          <>
            <div className="w-px h-8 bg-gray-200 dark:bg-gray-800 mx-2" />
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 hover:border-primary-200 dark:hover:border-primary-500/30 transition-all active:scale-95 text-gray-800 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100"
            >
              <X className="w-5 h-5" />
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default CalendarHeader;
