import React from 'react';
import DateSessionPaxPicker from '../../booking/DateSessionPaxPicker';
import SessionBookingCard from '../calendar/SessionBookingCard';

interface BookingSidebarProps {
    date: string;
    onDateChange: (d: string) => void;
    session: 'morning_class' | 'evening_class';
    onSessionChange: (s: 'morning_class' | 'evening_class') => void;
    pax: number;
    onPaxChange: (p: number) => void;
    maxPax: number;
    currentSessionData: any;
    availability?: {
        morning: { status: string; booked: number; total: number; bookings: any[] };
        evening: { status: string; booked: number; total: number; bookings: any[] };
    };
}

const BookingSidebar: React.FC<BookingSidebarProps> = ({
    date,
    onDateChange,
    session,
    onSessionChange,
    pax,
    onPaxChange,
    maxPax,
    currentSessionData,
    availability
}) => {
    return (
        <div className="lg:col-span-3 space-y-4">
            <DateSessionPaxPicker
                date={date}
                onDateChange={onDateChange}
                session={session}
                onSessionChange={onSessionChange}
                pax={pax}
                onPaxChange={onPaxChange}
                maxPax={maxPax}
                availability={availability}
            />

            <SessionBookingCard
                title={session === 'morning_class' ? 'Morning' : 'Evening'}
                status={currentSessionData.status as any}
                seats={currentSessionData.total - currentSessionData.booked}
                capacity={currentSessionData.total}
                bookings={currentSessionData.bookings}
            />
        </div>
    );
};

export default BookingSidebar;
