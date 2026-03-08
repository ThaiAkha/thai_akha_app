import React from 'react';
import { Minus, Plus } from 'lucide-react';
import { cn } from '../../lib/utils';
import AdminClassPicker from '../common/AdminClassPicker';
import Card from '../ui/Card';
import { SectionTitle } from '../typography';

interface DateSessionPaxPickerProps {
    date: string;
    onDateChange: (d: string) => void;
    session: 'morning_class' | 'evening_class';
    onSessionChange: (s: 'morning_class' | 'evening_class') => void;
    pax: number;
    onPaxChange: (p: number) => void;
    maxPax: number;
    availability?: {
        morning: { status: string; booked: number; total: number; bookings: any[] };
        evening: { status: string; booked: number; total: number; bookings: any[] };
    };
}

const DateSessionPaxPicker: React.FC<DateSessionPaxPickerProps> = ({
    date,
    onDateChange,
    session,
    onSessionChange,
    pax,
    onPaxChange,
    maxPax,
    availability
}) => {
    return (
        <Card title="Date & Session">
            <Card.Content>
                <AdminClassPicker
                    date={date}
                    onDateChange={onDateChange}
                    session={session}
                    onSessionChange={onSessionChange}
                    morningStatus={availability?.morning?.status as 'OPEN' | 'FULL' | 'CLOSED' | undefined}
                    eveningStatus={availability?.evening?.status as 'OPEN' | 'FULL' | 'CLOSED' | undefined}
                />
                {/* Pax Counter */}
                <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
                    <SectionTitle>Pax Count</SectionTitle>
                    <div className="flex items-center gap-2">
                        {/* Minus Button */}
                        <button
                            onClick={() => onPaxChange(Math.max(1, pax - 1))}
                            disabled={pax <= 1}
                            className={cn(
                                "size-10 rounded-xl border transition-all flex items-center justify-center shrink-0",
                                pax <= 1
                                    ? "bg-red-50 dark:bg-red-500/10 border-red-200 dark:border-red-500/30 text-red-600 dark:text-red-400 cursor-not-allowed opacity-60"
                                    : "bg-green-50 dark:bg-green-500/10 border-green-200 dark:border-green-500/30 text-green-600 dark:text-green-400 hover:shadow-sm cursor-pointer"
                            )}
                        >
                            <Minus className="w-5 h-5" />
                        </button>

                        {/* Pax Display Card */}
                        <div className="flex-1 py-3 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl text-center flex items-center justify-center">
                            <p className="text-2xl font-black text-gray-900 dark:text-white">{pax}</p>
                        </div>

                        {/* Plus Button */}
                        <button
                            onClick={() => onPaxChange(Math.min(pax + 1, maxPax))}
                            disabled={pax >= maxPax || maxPax === 0}
                            className={cn(
                                "size-10 rounded-xl border transition-all flex items-center justify-center shrink-0",
                                pax >= maxPax || maxPax === 0
                                    ? "bg-red-50 dark:bg-red-500/10 border-red-200 dark:border-red-500/30 text-red-600 dark:text-red-400 cursor-not-allowed opacity-60"
                                    : "bg-green-50 dark:bg-green-500/10 border-green-200 dark:border-green-500/30 text-green-600 dark:text-green-400 hover:shadow-sm cursor-pointer"
                            )}
                        >
                            <Plus className="w-5 h-5" />
                        </button>
                    </div>
                    <p className="text-center text-xs font-black uppercase tracking-widest text-gray-500 dark:text-gray-400 mt-3 mb-0">
                        {pax} of {maxPax} available
                    </p>
                </div>
            </Card.Content>
        </Card>
    );
};

export default DateSessionPaxPicker;
