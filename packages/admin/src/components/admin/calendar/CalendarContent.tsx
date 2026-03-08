import React, { useMemo } from 'react';
import { cn } from '../../../lib/utils';
import { DayData, BulkSessionType, getDateKey } from '../../../hooks/useAdminCalendar';
import CalendarMaster, { CalendarDay, LegendItem } from '../../common/CalendarMaster';

interface CalendarContentProps {
    viewDate: Date;
    onPrev: () => void;
    onNext: () => void;
    isBulkMode: boolean;
    onBulkModeChange: (v: boolean) => void;
    bulkSessionType: BulkSessionType;
    onBulkSessionTypeChange: (t: BulkSessionType) => void;
    calendarDays: Date[];
    availability: Record<string, DayData>;
    loading: boolean;
    selectedDate: string | null;
    selectedDates: Set<string>;
    handleDateClick: (date: Date) => void;
    canNavigatePrev: boolean;
    isPastDate: (dateStr: string) => boolean;
}

const CalendarContent: React.FC<CalendarContentProps> = ({
    viewDate,
    onPrev,
    onNext,
    isBulkMode,
    onBulkModeChange,
    bulkSessionType,
    onBulkSessionTypeChange,
    calendarDays,
    availability,
    loading,
    selectedDate,
    selectedDates,
    handleDateClick,
    canNavigatePrev,
    isPastDate
}) => {
    // Convert calendar days to CalendarDay format
    const masterCalendarDays = useMemo(() => {
        return calendarDays.map((date) => {
            const dateStr = getDateKey(date);
            const rawData = availability[dateStr];
            const isCurrentMonth = date.getMonth() === viewDate.getMonth();
            const isPast = isPastDate(dateStr);
            const isSelected = isBulkMode ? selectedDates.has(dateStr) : dateStr === selectedDate;

            // Transform data structure to match CalendarDay interface
            const data = rawData ? {
                morning: rawData.morning_class,
                evening: rawData.evening_class,
            } : undefined;

            return {
                date,
                dateStr,
                isPast,
                isCurrentMonth,
                isSelected,
                isSelectedBulk: isBulkMode && selectedDates.has(dateStr),
                loading,
                data,
            } as CalendarDay;
        });
    }, [calendarDays, availability, viewDate, loading, selectedDate, selectedDates, isBulkMode, isPastDate]);

    const legend: LegendItem[] = [
        { label: 'Available', color: 'bg-green-500' },
        { label: 'Booked', color: 'bg-red-500' },
        { label: 'Closed', color: 'bg-orange-400' },
        { label: 'Selected', color: 'bg-brand-500', borderColor: 'border-brand-400' },
    ];

    const bulkSessionSelector = isBulkMode ? (
        <div className="flex bg-gray-100 dark:bg-gray-800/20 p-1 rounded-xl h-10">
            {(['morning_class', 'evening_class', 'all'] as const).map(type => (
                <button
                    key={type}
                    onClick={() => onBulkSessionTypeChange(type)}
                    className={cn(
                        'px-3 py-1.5 text-xs font-black uppercase tracking-widest rounded-lg transition-all',
                        bulkSessionType === type
                            ? 'bg-white dark:bg-gray-700 text-brand-600 shadow-sm'
                            : 'text-gray-900 dark:text-gray-100'
                    )}
                >
                    {type === 'morning_class' ? 'Morning' : type === 'evening_class' ? 'Evening' : 'All Day'}
                </button>
            ))}
        </div>
    ) : null;

    return (
        <div className="col-span-12 lg:col-span-7 h-full flex flex-col overflow-hidden bg-white dark:bg-gray-950 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-lg">
            <CalendarMaster
                viewDate={viewDate}
                onPrev={onPrev}
                onNext={onNext}
                canNavigatePrev={canNavigatePrev}
                showBulkEdit={true}
                isBulkMode={isBulkMode}
                onBulkModeChange={onBulkModeChange}
                bulkSessionSelector={bulkSessionSelector}
                calendarDays={masterCalendarDays}
                onDateClick={handleDateClick}
                loading={loading}
                legend={legend}
                badgeSize="sm"
                showBadgeIcons={false}
                containerClassName="!rounded-none !border-0 flex-1"
            />
        </div>
    );
};

export default CalendarContent;
