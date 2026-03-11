import React from 'react';
import { cn } from '@thaiakha/shared/lib/utils';
import { User, Users } from 'lucide-react';
import Card from '../../ui/Card';
import BadgePaxNumber from '../../ui/badge/BadgePaxNumber';
import { getSessionCapacity } from '../../../config/sessionDefaults';

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
    const isClosed = status === 'CLOSED';
    const validCapacity = getSessionCapacity(capacity);
    const validSeats = getSessionCapacity(seats);
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
                        isClosed ? "text-red-600 dark:text-red-400" : "text-green-600 dark:text-green-400"
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
                        <span className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-400">
                            Booked:
                        </span>
                        <span className="text-base sm:text-lg font-bold text-red-500 dark:text-red-500">
                            {bookedPax}
                        </span>
                    </div>

                    {/* Seats Left a destra */}
                    <div className="flex items-center gap-2">
                        <span className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-400">
                            Seats Left:
                        </span>
                        <span className="text-base sm:text-lg font-bold text-green-600 dark:text-green-400">
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
                                <div className="shrink-0 size-5 rounded-full bg-gray-20 dark:bg-white/5 border border-gray-100 dark:border-white/5 flex items-center justify-center">
                                    <User className="w-4 h-4 text-gray-400" />
                                </div>
                                <span className="text-sm font-medium text-gray-700 dark:text-gray-300 truncate">
                                    {booking.guest_name}
                                </span>
                            </div>
                            <BadgePaxNumber paxCount={booking.pax_count} size="md" />
                        </div>
                    ))
                ) : (
                    <div className="h-full py-6 flex flex-col items-center justify-center opacity-30">
                        <Users className="w-10 h-10 mb-1.5 text-gray-500" />
                        <p className="text-sm font-bold uppercase tracking-widest text-gray-500">Empty Session</p>
                    </div>
                )}
            </div>
        </Card>
    );
};

export default SessionBookingCard;