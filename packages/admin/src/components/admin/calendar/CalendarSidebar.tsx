import { Calendar } from 'lucide-react';
import SessionBookingCard from '../../../components/admin/calendar/SessionBookingCard';
import { DayData, BookingMember } from '../../../hooks/useAdminCalendar';
import { getSessionCapacity } from '@thaiakha/shared/lib/sessionUtils';

interface CalendarSidebarProps {
    selectedDate: string | null;
    availability: Record<string, DayData>;
    dayBookings: Record<string, BookingMember[]>;
    isBulkMode: boolean;
}

const CalendarSidebar: React.FC<CalendarSidebarProps> = ({
    selectedDate,
    availability,
    dayBookings,
    isBulkMode
}) => {
    return (
        <div className="lg:col-span-2 h-full overflow-hidden flex flex-col gap-6">
            <div className="flex-1 overflow-hidden min-h-0 flex flex-col gap-4">
                {!isBulkMode ? (
                    <div className="space-y-4 overflow-y-auto pb-4">
                        <SessionBookingCard
                            title="Morning Class"
                            status={selectedDate ? (availability[selectedDate!]?.morning_class?.status ?? 'OPEN') : 'OPEN'}
                            seats={selectedDate ? (getSessionCapacity(availability[selectedDate!]?.morning_class?.seats) ?? 0) : 0}
                            capacity={selectedDate ? (getSessionCapacity(availability[selectedDate!]?.morning_class?.capacity) ?? 0) : 0}
                            bookings={dayBookings.morning_class}
                            showStatus={false}
                        />
                        <SessionBookingCard
                            title="Evening Class"
                            status={selectedDate ? (availability[selectedDate!]?.evening_class?.status ?? 'OPEN') : 'OPEN'}
                            seats={selectedDate ? (availability[selectedDate!]?.evening_class?.seats ?? 0) : 0}
                            capacity={selectedDate ? (availability[selectedDate!]?.evening_class?.capacity ?? 0) : 0}
                            bookings={dayBookings.evening_class}
                            showStatus={false}
                        />
                    </div>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center p-6 text-center bg-primary-50/20 dark:bg-primary-500/5 rounded-2xl border border-dashed border-primary-200 dark:border-primary-900/30">
                        <Calendar className="w-10 h-10 text-primary-300 mb-4" />
                        <p className="text-xs font-black uppercase tracking-widest text-primary-600 dark:text-primary-400">Bulk Edit Mode</p>
                        <p className="text-xs text-primary-600 mt-2 italic">Days with bookings are locked for security.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CalendarSidebar;