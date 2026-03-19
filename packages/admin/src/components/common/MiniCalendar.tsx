import React, { useState } from 'react';
import { cn } from '@thaiakha/shared/lib/utils';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface MiniCalendarProps {
    value: Date;
    onChange: (date: Date) => void;
    className?: string;
    isDateDisabled?: (date: Date) => boolean;
}

const MiniCalendar: React.FC<MiniCalendarProps> = ({ value, onChange, className, isDateDisabled }) => {
    const [viewDate, setViewDate] = useState(new Date(value));

    const daysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
    const firstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

    const handlePrevMonth = () => {
        setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1));
    };

    const handleNextMonth = () => {
        setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1));
    };

    const handleDateSelect = (day: number) => {
        const newDate = new Date(viewDate.getFullYear(), viewDate.getMonth(), day);
        if (!isDateDisabled || !isDateDisabled(newDate)) {
            onChange(newDate);
        }
    };

    const renderDays = () => {
        const year = viewDate.getFullYear();
        const month = viewDate.getMonth();
        const days = [];
        const totalDays = daysInMonth(year, month);
        const startDay = firstDayOfMonth(year, month);
        const today = new Date();

        // Padding for empty slots at start
        for (let i = 0; i < startDay; i++) {
            days.push(<div key={`empty-${i}`} className="h-8 w-full" />);
        }

        // Actual days
        for (let d = 1; d <= totalDays; d++) {
            const currentDate = new Date(year, month, d);
            const isSelected = value.getDate() === d && value.getMonth() === month && value.getFullYear() === year;
            const isToday = today.getDate() === d && today.getMonth() === month && today.getFullYear() === year;
            const disabled = isDateDisabled ? isDateDisabled(currentDate) : false;

            days.push(
                <button
                    key={d}
                    onClick={() => handleDateSelect(d)}
                    disabled={disabled}
                    className={cn(
                        "h-8 w-full rounded-lg flex items-center justify-center text-xs font-bold transition-all active:scale-95",
                        disabled && "opacity-30 cursor-not-allowed",
                        !disabled && "active:scale-95",
                        isSelected
                            ? "bg-primary-600 text-white shadow-md shadow-primary-500/20"
                            : isToday
                                ? "bg-primary-50 text-primary-600 border border-primary-200 dark:bg-primary-900/20 dark:text-primary-400 dark:border-primary-800"
                                : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                    )}
                >
                    {d}
                </button>
            );
        }

        return days;
    };

    return (
        <div className={cn("p-4 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm", className)}>
            <div className="flex items-center justify-between mb-4 px-1">
                <h6 className="text-xs font-black uppercase tracking-widest text-gray-500 dark:text-gray-400">
                    {viewDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
                </h6>
                <div className="flex gap-1">
                    <button onClick={handlePrevMonth} className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors text-gray-500">
                        <ChevronLeft className="w-4 h-4" />
                    </button>
                    <button onClick={handleNextMonth} className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors text-gray-500">
                        <ChevronRight className="w-4 h-4" />
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-7 gap-1 text-center mb-2">
                {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, i) => (
                    <div key={i} className="text-[9px] font-black text-gray-400 uppercase">{day}</div>
                ))}
            </div>

            <div className="grid grid-cols-7 gap-1">
                {renderDays()}
            </div>
        </div>
    );
};

export default MiniCalendar;
