import React, { useState } from 'react';
import { cn } from '@thaiakha/shared/lib/utils';
import { Sun, Moon, Calendar as CalendarIcon } from 'lucide-react';
import BookingCalendarModal from '../booking/BookingCalendarModal';

interface AdminClassPickerProps {
    date: string;
    session: 'morning_class' | 'evening_class';
    onDateChange: (date: string) => void;
    onSessionChange: (session: 'morning_class' | 'evening_class') => void;
    morningStatus?: 'OPEN' | 'FULL' | 'CLOSED';
    eveningStatus?: 'OPEN' | 'FULL' | 'CLOSED';
}

const AdminClassPicker: React.FC<AdminClassPickerProps> = ({
    date,
    session,
    onDateChange,
    onSessionChange,
    morningStatus,
    eveningStatus
}) => {
    const [isCalendarOpen, setIsCalendarOpen] = useState(false);

    const isMorningDisabled = morningStatus === 'FULL' || morningStatus === 'CLOSED';
    const isEveningDisabled = eveningStatus === 'FULL' || eveningStatus === 'CLOSED';

    const handleDateSelect = (newDate: Date) => {
        const year = newDate.getFullYear();
        const month = String(newDate.getMonth() + 1).padStart(2, '0');
        const day = String(newDate.getDate()).padStart(2, '0');
        onDateChange(`${year}-${month}-${day}`);
    };

    const formatDate = (dateStr: string) => {
        const d = new Date(dateStr);
        return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    };

    return (
        <div className="flex flex-col gap-3">
            {/* Date Picker Card - Clickable */}
            <div
                onClick={() => setIsCalendarOpen(true)}
                className="flex items-center justify-between p-3 bg-white dark:bg-gray-900 border border-green-200 dark:border-green-500/30 rounded-2xl cursor-pointer hover:shadow-md transition-all"
            >
                <p className="text-sm font-black text-gray-900 dark:text-white flex-1">{formatDate(date)}</p>
                <CalendarIcon className="w-5 h-5 text-green-600 dark:text-green-400 ml-2 shrink-0" />
            </div>

            <BookingCalendarModal
                isOpen={isCalendarOpen}
                onClose={() => setIsCalendarOpen(false)}
                currentDate={new Date(date)}
                onSelectDate={handleDateSelect}
            />

            {/* Session Toggle - Card Style */}
            <div className="grid grid-cols-2 gap-2">
                <button
                    onClick={() => onSessionChange('morning_class')}
                    disabled={isMorningDisabled}
                    className={cn(
                        "p-3 rounded-2xl border transition-all flex flex-col items-center gap-1.5",
                        isMorningDisabled
                            ? "bg-red-50 dark:bg-red-500/10 border-red-200 dark:border-red-500/30 text-red-700 dark:text-red-300 cursor-not-allowed opacity-60"
                            : session === 'morning_class'
                                ? "bg-green-50 dark:bg-green-500/10 border-green-200 dark:border-green-500/30 text-green-700 dark:text-green-400 shadow-sm cursor-pointer"
                                : "bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 text-gray-800 dark:text-gray-200 hover:border-gray-400 cursor-pointer"
                    )}
                >
                    <Sun className="w-4 h-4" />
                    <span className="text-xs font-black uppercase">Morning</span>
                </button>
                <button
                    onClick={() => onSessionChange('evening_class')}
                    disabled={isEveningDisabled}
                    className={cn(
                        "p-3 rounded-2xl border transition-all flex flex-col items-center gap-1.5",
                        isEveningDisabled
                            ? "bg-red-50 dark:bg-red-500/10 border-red-200 dark:border-red-500/30 text-red-700 dark:text-red-300 cursor-not-allowed opacity-60"
                            : session === 'evening_class'
                                ? "bg-green-50 dark:bg-green-500/10 border-green-200 dark:border-green-500/30 text-green-700 dark:text-green-400 shadow-sm cursor-pointer"
                                : "bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 text-gray-800 dark:text-gray-200 hover:border-gray-400 cursor-pointer"
                    )}
                >
                    <Moon className="w-4 h-4" />
                    <span className="text-xs font-black uppercase">Evening</span>
                </button>
            </div>
        </div>
    );
};

export default AdminClassPicker;
