import React, { useState, useMemo, useCallback } from 'react';
import { ChevronLeft, ChevronRight, Sun, Moon, Layers, Calendar } from 'lucide-react';
import { cn } from '@thaiakha/shared/lib/utils';
import { Dropdown } from '../ui/dropdown/Dropdown';
import MiniCalendar from './MiniCalendar';

export type SessionType = 'morning_class' | 'evening_class' | 'all';

interface ClassPickerProps {
    date: string;
    onDateChange: (date: string) => void;
    session: SessionType;
    onSessionChange: (session: SessionType) => void;
    className?: string;
    showSessionSelector?: boolean;
    labels?: {
        all?: string;
        morning?: string;
        evening?: string;
    };
}

const DATE_FORMAT_OPTIONS = { day: 'numeric', month: 'short', year: 'numeric' } as const;

const SESSION_CONFIG = {
    all: { icon: Layers, defaultLabel: 'All' },
    morning_class: { icon: Sun, defaultLabel: 'Morning' },
    evening_class: { icon: Moon, defaultLabel: 'Evening' }
} as const;

const ClassPicker: React.FC<ClassPickerProps> = ({
    date,
    onDateChange,
    session,
    onSessionChange,
    className,
    showSessionSelector = true,
    labels = {}
}) => {
    const [isCalendarOpen, setIsCalendarOpen] = useState(false);

    const currentDate = useMemo(() => {
        const parsed = new Date(date);
        return isNaN(parsed.getTime()) ? new Date() : parsed;
    }, [date]);

    const today = useMemo(() => {
        const d = new Date();
        d.setHours(0, 0, 0, 0);
        return d;
    }, []);

    const isDateDisabled = useCallback((checkDate: Date) => {
        const d = new Date(checkDate);
        d.setHours(0, 0, 0, 0);
        return d < today;
    }, [today]);

    const canGoBack = useMemo(() => {
        const d = new Date(currentDate);
        d.setHours(0, 0, 0, 0);
        return d > today;
    }, [currentDate, today]);

    const formatDate = useCallback((d: Date) =>
        d.toLocaleDateString('en-GB', DATE_FORMAT_OPTIONS),
        []);

    const changeDate = useCallback((days: number) => {
        const newDate = new Date(currentDate);
        newDate.setDate(newDate.getDate() + days);
        
        // Prevent going to past dates
        if (days < 0 && !canGoBack) {
            return;
        }
        
        onDateChange(newDate.toISOString().split('T')[0]);
    }, [currentDate, onDateChange, canGoBack]);

    const handleDateSelect = useCallback((newDate: Date) => {
        onDateChange(newDate.toISOString().split('T')[0]);
        setIsCalendarOpen(false);
    }, [onDateChange]);

    const SESSIONS = useMemo(() => (
        Object.entries(SESSION_CONFIG).map(([id, config]) => ({
            id: id as SessionType,
            label: labels[id as keyof typeof labels] || config.defaultLabel,
            icon: <config.icon className="w-4 h-4" />
        }))
    ), [labels]);

    // Validazione
    if (!showSessionSelector && session !== 'all') {
        console.warn('ClassPicker: session is set to', session, 'but session selector is hidden');
    }

    return (
        <div className={cn(
            "flex items-center gap-3 bg-white dark:bg-black/20 p-1 rounded-xl border border-gray-200 dark:border-white/10",
            className
        )}>
            {/* Date Picker */}
            <div className="flex items-center gap-1 bg-gray-50 dark:bg-white/5 rounded-lg p-1 relative">
                <button
                    onClick={() => changeDate(-1)}
                    onKeyDown={(e) => e.key === 'ArrowLeft' && changeDate(-1)}
                    disabled={!canGoBack}
                    className={cn(
                        "p-1 rounded-md transition-colors",
                        canGoBack
                            ? "hover:bg-white dark:hover:bg-white/10 text-gray-500 dark:text-gray-400 cursor-pointer"
                            : "opacity-30 cursor-not-allowed text-gray-300 dark:text-gray-600"
                    )}
                    aria-label="Previous day"
                >
                    <ChevronLeft className="w-4 h-4" />
                </button>

                <div className="relative">
                    <button
                        onClick={() => setIsCalendarOpen(!isCalendarOpen)}
                        className="dropdown-toggle flex items-center gap-2 min-w-[120px] px-2 py-1 hover:bg-white dark:hover:bg-white/10 rounded-md transition-colors"
                        aria-haspopup="dialog"
                        aria-expanded={isCalendarOpen}
                        aria-label="Select date"
                    >
                        <Calendar className="w-3.5 h-3.5 text-gray-400 dark:text-gray-500" />
                        <span className="text-sm font-bold text-gray-700 dark:text-gray-300 tabular-nums">
                            {formatDate(currentDate)}
                        </span>
                    </button>

                    <Dropdown
                        isOpen={isCalendarOpen}
                        onClose={() => setIsCalendarOpen(false)}
                        className="left-0 mt-2 w-[280px]"
                    >
                        <MiniCalendar
                            value={currentDate}
                            onChange={handleDateSelect}
                            isDateDisabled={isDateDisabled}
                            className="border-0 shadow-none"
                        />
                    </Dropdown>
                </div>

                <button
                    onClick={() => changeDate(1)}
                    onKeyDown={(e) => e.key === 'ArrowRight' && changeDate(1)}
                    className="p-1 hover:bg-white dark:hover:bg-white/10 rounded-md transition-colors text-gray-500 dark:text-gray-400"
                    aria-label="Next day"
                >
                    <ChevronRight className="w-4 h-4" />
                </button>
            </div>

            {showSessionSelector && (
                <>
                    <div className="h-6 w-px bg-gray-200 dark:bg-white/10" />

                    {/* Session Selector */}
                    <div className="flex bg-gray-100 dark:bg-black/40 p-1 rounded-lg" role="tablist">
                        {SESSIONS.map((s) => {
                            const isActive = session === s.id;
                            return (
                                <button
                                    key={s.id}
                                    onClick={() => onSessionChange(s.id)}
                                    className={cn(
                                        "flex items-center justify-center min-w-[44px] px-5 py-1.5 rounded-md text-xs font-black uppercase tracking-widest transition-all",
                                        // Active state - senza ombra
                                        isActive
                                            ? "bg-white dark:bg-gray-800 text-primary-600 dark:text-primary-400"
                                            : "text-gray-600 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                                    )}
                                    title={s.label}
                                    role="tab"
                                    aria-selected={isActive}
                                    aria-label={s.label}
                                >
                                    <span className="md:hidden">{s.icon}</span>
                                    <span className="hidden md:inline">{s.label}</span>
                                </button>
                            );
                        })}
                    </div>
                </>
            )}

        </div>
    );
};

export default ClassPicker;
