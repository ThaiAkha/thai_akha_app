/**
 * Master Calendar Component
 * 100% pure presentational component
 * All data comes from props - no hardcoding, no data fetching
 * Can be used in Card, Modal, or standalone
 */

import React, { ReactNode } from 'react';
import { cn } from '@thaiakha/shared/lib/utils';
import SessionStatusBadge from '../admin/calendar/SessionStatusBadge';
import CalendarHeader from '../admin/calendar/CalendarHeader';
import AkhaPixelPattern from '../ui/AkhaPixelPattern';

export interface CalendarDay {
  date: Date;
  dateStr: string;
  isPast: boolean;
  isCurrentMonth: boolean;
  isSelected?: boolean;
  isSelectedBulk?: boolean;
  loading?: boolean;
  data?: {
    morning: { status: 'OPEN' | 'FULL' | 'CLOSED'; seats: number };
    evening: { status: 'OPEN' | 'FULL' | 'CLOSED'; seats: number };
  };
}

export interface LegendItem {
  label: string;
  color: string;
  borderColor?: string;
}

export interface CalendarMasterProps {
  // Header
  viewDate: Date;
  subtitle?: string;
  onPrev: () => void;
  onNext: () => void;
  canNavigatePrev: boolean;
  onClose?: () => void;

  // Bulk mode
  showBulkEdit?: boolean;
  isBulkMode?: boolean;
  onBulkModeChange?: (v: boolean) => void;
  bulkSessionSelector?: ReactNode;

  // Days header
  daysHeader?: string[];

  // Calendar grid
  calendarDays: CalendarDay[];
  onDateClick: (date: Date) => void;
  loading?: boolean;

  // Legend
  legend?: LegendItem[];

  // Styling
  showBadgeIcons?: boolean;
  badgeSize?: 'sm' | 'md';
  containerClassName?: string;
}

const DEFAULT_DAYS_HEADER = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const DEFAULT_LEGEND: LegendItem[] = [
  { label: 'Available', color: 'bg-green-500' },
  { label: 'Booked', color: 'bg-red-500' },
  { label: 'Closed', color: 'bg-orange-400' },
  { label: 'Selected', color: 'bg-primary-500', borderColor: 'border-primary-400' },
];

const CalendarMaster: React.FC<CalendarMasterProps> = ({
  // Header
  viewDate,
  subtitle = 'Select a date',
  onPrev,
  onNext,
  canNavigatePrev,
  onClose,

  // Bulk mode
  showBulkEdit = false,
  isBulkMode = false,
  onBulkModeChange,
  bulkSessionSelector,

  // Days header
  daysHeader = DEFAULT_DAYS_HEADER,

  // Calendar grid
  calendarDays,
  onDateClick,
  loading = false,

  // Legend
  legend = DEFAULT_LEGEND,

  // Styling
  showBadgeIcons = false,
  badgeSize = 'sm',
  containerClassName = '',
}) => {
  return (
    <div
      className={cn(
        'w-full flex flex-col h-full bg-white dark:bg-gray-950 overflow-hidden',
        containerClassName
      )}
    >
      {/* Header */}
      <CalendarHeader
        viewDate={viewDate}
        onPrev={onPrev}
        onNext={onNext}
        canNavigatePrev={canNavigatePrev}
        onClose={onClose}
        showBulkEditButton={showBulkEdit}
        isBulkMode={isBulkMode}
        onBulkModeChange={onBulkModeChange}
        bulkSessionSelector={bulkSessionSelector}
        subtitle={subtitle}
      />

      {/* Days Header */}
      <div className="grid grid-cols-7 border-b border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/50 shrink-0">
        {daysHeader.map((day) => (
          <div key={day} className="py-2 text-center">
            <span className="text-xs font-black text-gray-700 dark:text-gray-400 uppercase tracking-widest">
              {day}
            </span>
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 grid-rows-6 flex-1 overflow-hidden bg-gray-50 dark:bg-gray-900/30 gap-px">
        {calendarDays.map((day) => {
          const { date, isPast, isCurrentMonth, isSelected, isSelectedBulk, data } = day;

          if (!isCurrentMonth) {
            return <div key={day.dateStr} className="bg-white dark:bg-gray-950" />;
          }

          const isMorningOpen = data?.morning.status === 'OPEN';
          const isEveningOpen = data?.evening.status === 'OPEN';
          const isFullDay = !loading && data && !isMorningOpen && !isEveningOpen;

          return (
            <button
              key={day.dateStr}
              disabled={isPast || loading}
              onClick={() => onDateClick(date)}
              className={cn(
                'relative flex flex-col px-2 py-2 h-24 lg:h-32 transition-all group text-left outline-none',
                isPast
                  ? 'bg-gray-50 dark:bg-gray-900 opacity-35 grayscale cursor-not-allowed'
                  : isFullDay
                    ? 'bg-red-50/60 dark:bg-red-900/20 cursor-not-allowed hover:bg-red-100/60 dark:hover:bg-red-900/30'
                    : 'bg-white dark:bg-gray-950 hover:bg-primary-50/50 dark:hover:bg-primary-500/5 cursor-pointer',
                isSelected &&
                'ring-2 ring-inset ring-primary-500 z-10 bg-primary-50/40 dark:bg-primary-500/15',
                isSelectedBulk &&
                isBulkMode &&
                'ring-2 ring-inset ring-green-500 z-10 bg-green-50/40 dark:bg-green-500/15'
              )}
            >
              <span
                className={cn(
                  'text-lg font-black tracking-tighter transition-transform',
                  isPast
                    ? 'text-gray-300 dark:text-gray-700'
                    : 'text-gray-900 dark:text-gray-100',
                  isSelected && 'text-primary-600 dark:text-primary-400 scale-110'
                )}
              >
                {date.getDate()}
              </span>

              {!loading && data && !isPast && (
                <div className="mt-auto space-y-0.5 pt-1.5">
                  <SessionStatusBadge
                    status={data.morning.status}
                    seats={data.morning.seats}
                    label="Morning"
                    size={badgeSize}
                    showIcon={showBadgeIcons}
                    compact={false}
                  />
                  <SessionStatusBadge
                    status={data.evening.status}
                    seats={data.evening.seats}
                    label="Evening"
                    size={badgeSize}
                    showIcon={showBadgeIcons}
                    compact={false}
                  />
                </div>
              )}

              {loading && (
                <div className="absolute inset-0 flex items-center justify-center bg-white/50 dark:bg-gray-950/50 backdrop-blur-[1px] z-20">
                  <AkhaPixelPattern variant="diamond" size={12} speed={80} className="text-primary-500 opacity-50" />
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Legend Footer */}
      {legend && legend.length > 0 && (
        <div className="p-3 pt-4 border-t border-gray-100 dark:border-gray-800 flex items-center gap-4 justify-center overflow-x-auto shrink-0">
          {legend.map((item) => (
            <div key={item.label} className="flex items-center gap-1.5 whitespace-nowrap">
              <div
                className={cn(
                  'size-2.5 rounded-full',
                  item.color,
                  item.borderColor && `border ${item.borderColor}`
                )}
              />
              <span className="text-xs font-black uppercase tracking-widest text-gray-700 dark:text-gray-400">
                {item.label}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CalendarMaster;
