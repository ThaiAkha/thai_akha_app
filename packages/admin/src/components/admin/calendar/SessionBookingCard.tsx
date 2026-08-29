import React from 'react';
import { cn } from '@thaiakha/shared/lib/utils';
import { useTranslation } from 'react-i18next';
import { User, Users } from 'lucide-react';
import Card from '../../ui/Card';
import BadgePaxNumber from '../../ui/badge/BadgePaxNumber';
import { getSessionCapacity } from '@thaiakha/shared/lib/sessionUtils';

interface BookingMember {
    guest_name: string;
    pax_count: number;
}

interface SessionBookingCardProps {
    title: string;
    status: 'OPEN' | 'FULL' | 'CLOSED';
    seats: number;
    capacity: number;
    bookings: BookingMember[];
    className?: string;
    showStatus?: boolean;
}

const SessionBookingCard: React.FC<SessionBookingCardProps> = ({
    title,
    status,
    seats,
    capacity,
    bookings,
    className,
    showStatus = true
}) => {
    const { t } = useTranslation('booking');
    const isClosed = status === 'CLOSED';
    const validCapacity = getSessionCapacity(capacity) ?? 0;
    const validSeats = getSessionCapacity(seats) ?? 0;
    const bookedPax = Math.max(0, validCapacity - validSeats);

    return (
        <Card size="sm" className={cn(
            "overflow-hidden flex flex-col min-h-[140px] flex-1 rounded-xl !p-0",
            className
        )}>
            {/* Header ridisegnato */}
            <div className={cn(
                "px-4 py-3 pb-1 border-b shrink-0",
                isClosed ? "bg-gray-50/50 dark:bg-gray-900 border-gray-200 dark:border-gray-800" : "bg-gray-50/50 dark:bg-gray-900 border-gray-200 dark:border-gray-800"
            )}>
                {/* Titolo + Status centrati in linea */}
                <div className="text-center mb-1">
                    <h5 className={cn(
                        "text-base sm:text-xl font-bold capitalize inline",
                        isClosed ? "text-error" : "text-success"
                    )}>
                        {title}
                        {showStatus && (
                            <span className="ml-2">
                                {status}
                            </span>
                        )}
                    </h5>
                </div>

                {/* Stats in linea */}
                <div className="flex items-center justify-between">
                    {/* Booked a sinistra */}
                    <div className="flex items-center gap-2">
                        <span className="text-xs sm:text-sm font-medium text-body">
                            {t('session.booked')}
                        </span>
                        <span className="text-base sm:text-lg font-bold text-error">
                            {bookedPax}
                        </span>
                    </div>

                    {/* Seats Left a destra */}
                    <div className="flex items-center gap-2">
                        <span className="text-xs sm:text-sm font-medium text-body">
                            {t('session.seatsLeft')}
                        </span>
                        <span className="text-base sm:text-lg font-bold text-success">
                            {validSeats}
                        </span>
                    </div>
                </div>
            </div>

            {/* Guest List */}
            <div className="flex-1 overflow-y-auto p-2 space-y-1 no-scrollbar bg-gray-50/10 dark:bg-white/[0.01]">
                {bookings.length > 0 ? (
                    bookings.map((booking, idx) => (
                        <div
                            key={idx}
                            className="flex items-center justify-between px-2.5 py-1.5 rounded-lg bg-white dark:bg-white/[0.02] border border-gray-100 dark:border-white/5 hover:border-green-500 transition-colors shadow-sm"
                        >
                            <div className="flex items-center gap-2 overflow-hidden">
                                <div className="shrink-0 size-5 rounded-full bg-gray-25 dark:bg-white/5 border border-gray-100 dark:border-white/5 flex items-center justify-center">
                                    <User className="w-4 h-4 text-gray-400" />
                                </div>
                                <span className="text-sm font-medium text-body truncate">
                                    {booking.guest_name}
                                </span>
                            </div>
                            <BadgePaxNumber paxCount={booking.pax_count} size="md" />
                        </div>
                    ))
                ) : (
                    <div className="h-full py-6 flex flex-col items-center justify-center">
                        {/* Opacita' sull'ICONA, non sul contenitore: li' la ereditava anche
                            il testo e lo portava a 1.47 di contrasto. */}
                        <Users className="w-10 h-10 mb-1.5 text-gray-500 opacity-30" />
                        <p className="text-sm font-bold uppercase tracking-widest text-sub">{t('session.empty')}</p>
                    </div>
                )}
            </div>
        </Card>
    );
};

export default SessionBookingCard;