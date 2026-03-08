import React, { useMemo } from 'react';
import { Users, Sun, Moon } from 'lucide-react';
import { cn } from '../../../lib/utils';
import { DataExplorerSidebar } from '../../../components/data-explorer';
import BadgePaxNumber from '../../ui/badge/BadgePaxNumber';

interface BookingItem {
    internal_id: string;
    guest_name: string;
    pax_count: number;
    status?: string;
    session_id?: string;
    profiles?: {
        full_name?: string;
        avatar_url?: string;
    };
}

interface ReservationSidebarProps {
    bookings: BookingItem[];
    activeBookingId: string | null;
    onSelectBooking: (booking: any) => void;
}

const ReservationSidebar: React.FC<ReservationSidebarProps> = ({
    bookings,
    activeBookingId,
    onSelectBooking,
}) => {
    const getSessionIcon = (sessionId?: string) => {
        if (!sessionId) return <Users className="w-5 h-5" />;

        if (sessionId.includes('morning')) {
            return <Sun className="w-5 h-5 text-yellow-500" />;
        } else if (sessionId.includes('evening')) {
            return <Moon className="w-5 h-5 text-indigo-400" />;
        }

        return <Users className="w-5 h-5" />;
    };

    const { activeItems, cancelledItems } = useMemo(() => {
        // Funzione per determinare la priorità della sessione
        const getSessionPriority = (sessionId?: string): number => {
            if (!sessionId) return 2; // Nessuna sessione per ultimo
            if (sessionId.includes('morning')) return 0; // Morning primo
            if (sessionId.includes('evening')) return 1; // Evening secondo
            return 2; // Altro per ultimo
        };

        // Separa i booking attivi da quelli cancellati
        const activeBookings = bookings.filter(b => b.status !== 'cancelled');
        const cancelledBookings = bookings.filter(b => b.status === 'cancelled');

        // Ordina gli ospiti: prima morning, poi evening, poi senza sessione
        const sortBookings = (items: BookingItem[]) => {
            return [...items].sort((a, b) => {
                const priorityA = getSessionPriority(a.session_id);
                const priorityB = getSessionPriority(b.session_id);

                if (priorityA !== priorityB) {
                    return priorityA - priorityB;
                }

                // A parità di sessione, ordina per nome
                const nameA = a.guest_name || a.profiles?.full_name || 'Guest';
                const nameB = b.guest_name || b.profiles?.full_name || 'Guest';
                return nameA.localeCompare(nameB);
            });
        };

        const sortedActive = sortBookings(activeBookings);
        const sortedCancelled = sortBookings(cancelledBookings);

        // Mappa i booking attivi
        const activeItems = sortedActive.map(b => ({
            id: b.internal_id,
            label: b.guest_name || b.profiles?.full_name || 'Guest',
            icon: getSessionIcon(b.session_id),
            badge: <BadgePaxNumber paxCount={b.pax_count} size="md" />
        }));

        // Mappa i booking cancellati
        const cancelledItems = sortedCancelled.map(b => ({
            id: b.internal_id,
            label: b.guest_name || b.profiles?.full_name || 'Guest',
            icon: getSessionIcon(b.session_id),
            badge: <BadgePaxNumber paxCount={b.pax_count} size="md" />
        }));

        return { activeItems, cancelledItems };
    }, [bookings]);

    const handleSelect = (bookingId: string) => {
        const booking = bookings.find(b => b.internal_id === bookingId);
        if (booking) {
            onSelectBooking(booking);
        }
    };

    const footer = cancelledItems.length > 0 ? (
        <div className="p-4 space-y-3">
            <h4 className="text-xs font-black uppercase tracking-widest text-gray-400 dark:text-gray-500">
                Cancelled Bookings
            </h4>
            <div className="space-y-2">
                {cancelledItems.map((item) => {
                    const isActive = activeBookingId === item.id;
                    return (
                        <button
                            key={item.id}
                            onClick={() => handleSelect(item.id)}
                            className={cn(
                                "w-full flex items-center gap-3 px-3 py-2 rounded-lg border text-sm transition-all text-left group",
                                isActive
                                    ? "bg-gray-200 dark:bg-gray-700 border-gray-300 dark:border-gray-600"
                                    : "bg-gray-100 dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:bg-gray-150 dark:hover:bg-gray-750"
                            )}
                        >
                            {item.icon && (
                                <div className="text-gray-400 transition-transform group-hover:scale-110">
                                    {item.icon}
                                </div>
                            )}
                            <span className="text-gray-500 dark:text-gray-400 truncate flex-1">
                                {item.label}
                            </span>
                            {item.badge && (
                                <div className="ml-2 flex items-center opacity-50">
                                    {item.badge}
                                </div>
                            )}
                        </button>
                    );
                })}
            </div>
        </div>
    ) : null;

    return (
        <DataExplorerSidebar
            title="Clients"
            titleIcon={<Users className="w-5 h-5" />}
            items={activeItems}
            selectedId={activeBookingId || ''}
            onSelect={handleSelect}
            footer={footer}
        />
    );
};

export default ReservationSidebar;