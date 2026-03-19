import React from 'react';
import { MapPin } from 'lucide-react';
import { LogisticsItem } from '../../../hooks/useManagerLogistic';
import LogisticWalkInItemList from './LogisticWalkInItemList';
import Avatar from '../../ui/avatar/Avatar';

interface LogisticWalkInColumnProps {
    items: LogisticsItem[];
    selectedBookingId: string | null;
    onSelectBooking: (id: string) => void;
}

export const LogisticWalkInColumn: React.FC<LogisticWalkInColumnProps> = ({
    items,
    selectedBookingId,
    onSelectBooking
}) => {
    // Custom render with meeting point info
    if (items.length === 0) return null;

    return (
        <div className="w-[320px] flex flex-col rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm overflow-hidden">
            {/* Header */}
            <div className="p-3 border-b border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/30">
                <div className="flex items-center gap-2">
                    <Avatar
                        size="xlarge"
                        fallback={<MapPin className="w-6 h-6 text-orange-100 dark:text-orange-400" />}
                        fallbackClassName="bg-orange-400 dark:bg-btn-p-900/30"
                    />
                    <div className="flex-1 min-w-0 space-y-0.5">
                        <div className="font-bold text-gray-900 dark:text-white uppercase text-md tracking-wider truncate leading-tight">
                            Walk In
                        </div>
                        <div className="text-sm text-gray-500 font-mono">{items.length} {items.length === 1 ? 'Booking' : 'Bookings'}</div>
                    </div>
                </div>
            </div>

            {/* Items List */}
            <LogisticWalkInItemList
                items={items}
                selectedBookingId={selectedBookingId}
                onSelectBooking={onSelectBooking}
            />
        </div>
    );
};
