import React from 'react';
import { useTranslation } from 'react-i18next';
import DateSessionPaxPicker from '../../booking/DateSessionPaxPicker';
import SessionBookingCard from '../calendar/SessionBookingCard';
import type { BookingAvailability, SessionAvailability } from '../../../hooks/useAdminBooking';

interface BookingSidebarProps {
    date: string;
    onDateChange: (d: string) => void;
    session: 'morning_class' | 'evening_class';
    onSessionChange: (s: 'morning_class' | 'evening_class') => void;
    pax: number;
    onPaxChange: (p: number) => void;
    maxPax: number;
    currentSessionData: SessionAvailability;
    availability?: BookingAvailability;
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
    const { t } = useTranslation('booking');

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
                title={session === 'morning_class' ? t('session.morning') : t('session.evening')}
                status={currentSessionData.status}
                seats={currentSessionData.total - currentSessionData.booked}
                capacity={currentSessionData.total}
                // guest_name/pax_count sono nullable nel DB; la card li tratta come valorizzati (comportamento invariato)
                bookings={currentSessionData.bookings as unknown as { guest_name: string; pax_count: number }[]}
            />
        </div>
    );
};

export default BookingSidebar;
