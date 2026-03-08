import React from 'react';
import { LogisticsItem, DriverProfile } from '../../../hooks/useManagerLogistic';
import LogisticItemList from './LogisticItemList';
import Avatar from '../../ui/avatar/Avatar';

export interface LogisticColumnProps {
    title: string;
    driverAvatarUrl?: string;
    items: LogisticsItem[];
    drivers: DriverProfile[];
    selectedBookingId: string | null;
    onSelectBooking: (id: string) => void;
    onMoveItem: (itemId: string, direction: 'up' | 'down' | 'to-driver', targetDriverId?: string) => void;
    showAvatar?: boolean;
    showAssignDriver?: boolean;
}

export const LogisticColumn: React.FC<LogisticColumnProps> = ({
    title,
    driverAvatarUrl,
    items,
    drivers,
    selectedBookingId,
    onSelectBooking,
    onMoveItem,
    showAvatar = true,
    showAssignDriver = true
}) => {
    return (
        <div className="w-[320px] flex flex-col rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm overflow-hidden">
            {/* Header */}
            <div className="p-3 border-b border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/30">
                <div className="flex items-center gap-2">
                    {driverAvatarUrl && (
                        <Avatar src={driverAvatarUrl} alt={title} size="xlarge" />
                    )}
                    <div className="flex-1 min-w-0 space-y-0.5">
                        <div className="font-bold text-gray-900 dark:text-white uppercase text-md tracking-wider truncate leading-tight">
                            {title}
                        </div>
                        <div className="text-sm text-gray-500 font-mono">{items.length} {items.length === 1 ? 'Hotel' : 'Hotels'}</div>
                    </div>
                </div>
            </div>

            {/* Items List */}
            <LogisticItemList
                items={items}
                drivers={drivers}
                selectedBookingId={selectedBookingId}
                onSelectBooking={onSelectBooking}
                onMoveItem={onMoveItem}
                showAvatar={showAvatar}
                showAssignDriver={showAssignDriver}
            />
        </div>
    );
};
