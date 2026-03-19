import React from 'react';
import { cn } from '@thaiakha/shared/lib/utils';
import { ChevronUp, ChevronDown, MapPin } from 'lucide-react';
import Avatar from '../../ui/avatar/Avatar';
import BadgePaxNumber from '../../ui/badge/BadgePaxNumber';
import BadgeLuggageStatus from '../../ui/badge/BadgeLuggageStatus';
import Tooltip from '../../ui/Tooltip';
import { LogisticsItem, DriverProfile } from '../../../hooks/useManagerLogistic';

export interface LogisticItemListProps {
    items: LogisticsItem[];
    drivers: DriverProfile[];
    selectedBookingId: string | null;
    onSelectBooking: (id: string) => void;
    onMoveItem: (itemId: string, direction: 'up' | 'down' | 'to-driver', targetDriverId?: string) => void;
    showAvatar?: boolean;
    showAssignDriver?: boolean;
}

// Helper function to map zone colors to Tailwind classes
const getZoneColorClasses = (colorCode: string | null): string => {
    if (!colorCode) return 'border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300';

    const colorMap: Record<string, string> = {
        'yellow': 'border-yellow-400 dark:border-yellow-600 text-gray-700 dark:text-gray-300',
        'green': 'border-green-400 dark:border-green-600 text-gray-700 dark:text-gray-300',
        'pink': 'border-pink-400 dark:border-pink-600 text-gray-700 dark:text-gray-300',
        'blue': 'border-blue-400 dark:border-blue-600 text-gray-700 dark:text-gray-300',
        'purple': 'border-purple-400 dark:border-purple-600 text-gray-700 dark:text-gray-300',
        'orange': 'border-orange-400 dark:border-orange-600 text-gray-700 dark:text-gray-300',
        'red': 'border-red-400 dark:border-red-600 text-gray-700 dark:text-gray-300',
        'cyan': 'border-cyan-400 dark:border-cyan-600 text-gray-700 dark:text-gray-300',
        'gray': 'border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300',
    };

    return colorMap[colorCode.toLowerCase()] || colorMap['gray'];
};

export const LogisticItemList: React.FC<LogisticItemListProps> = ({
    items,
    drivers,
    selectedBookingId,
    onSelectBooking,
    onMoveItem,
    showAvatar = true,
    showAssignDriver = true
}) => {
    return (
        <div className="flex-1 overflow-y-auto p-2 space-y-2 bg-gray-50/50 dark:bg-gray-900/50 no-scrollbar">
            {items.map((item, idx) => {
                const isSelected = selectedBookingId === item.id;
                const isFirst = idx === 0;
                const isLast = idx === items.length - 1;

                return (
                    <div
                        key={item.id}
                        onClick={(e) => {
                            e.stopPropagation();
                            onSelectBooking(item.id);
                        }}
                        className={cn(
                            "p-3 rounded-xl border transition-all cursor-pointer bg-white dark:bg-gray-800 shadow-sm group",
                            isSelected
                                ? "border-primary-500 ring-1 ring-primary-500"
                                : "border-gray-100 dark:border-gray-700 hover:border-primary-300"
                        )}
                    >
                        {/* Row 1: Avatar + Name + Badges */}
                        <div className="flex items-center gap-2 mb-2">
                            {showAvatar && (
                                <Avatar src={item.avatar_url} alt={item.guest_name} size="medium" />
                            )}
                            <div className="flex-1 min-w-0">
                                <span className="font-bold text-base text-gray-900 dark:text-white truncate">
                                    {item.guest_name || 'Guest'}
                                </span>
                            </div>
                            <div className="flex gap-1">
                                <BadgeLuggageStatus hasLuggage={item.has_luggage} size="md" />
                                <BadgePaxNumber paxCount={item.pax} size="md" />
                            </div>
                        </div>

                        {/* Row 2: Location Info */}
                        {(item.hotel_name || item.meeting_point) && (
                            <div className="flex items-center gap-2 mb-2">
                                <MapPin className="w-4 h-4 shrink-0 text-gray-500 dark:text-gray-500" />
                                <Tooltip content={item.hotel_name || item.meeting_point || 'No location'} position="bottom">
                                    <div className={cn(
                                        'flex-1 px-3 py-2 rounded-lg border-2 text-sm font-medium truncate',
                                        getZoneColorClasses(item.pickup_zone_color)
                                    )}>
                                        {item.hotel_name || item.meeting_point}
                                    </div>
                                </Tooltip>
                            </div>
                        )}

                        {/* Row 3: Move Buttons */}
                        <div className="flex gap-1.5 mb-2">
                            <button
                                type="button"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onMoveItem(item.id, 'up');
                                }}
                                disabled={isFirst}
                                className={cn(
                                    "h-8 w-8 flex items-center justify-center rounded-lg text-xs font-bold transition-colors shrink-0",
                                    isFirst
                                        ? "bg-gray-100 dark:bg-gray-700 text-gray-300 dark:text-gray-600 cursor-not-allowed"
                                        : "bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 hover:bg-primary-100 dark:hover:bg-primary-900/50"
                                )}
                            >
                                <ChevronUp className="w-4 h-4" />
                            </button>
                            <button
                                type="button"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onMoveItem(item.id, 'down');
                                }}
                                disabled={isLast}
                                className={cn(
                                    "h-8 w-8 flex items-center justify-center rounded-lg text-xs font-bold transition-colors shrink-0",
                                    isLast
                                        ? "bg-gray-100 dark:bg-gray-700 text-gray-300 dark:text-gray-600 cursor-not-allowed"
                                        : "bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 hover:bg-primary-100 dark:hover:bg-primary-900/50"
                                )}
                            >
                                <ChevronDown className="w-4 h-4" />
                            </button>

                            {/* Assign Driver Select */}
                            {showAssignDriver && drivers.length > 0 && (
                                <select
                                    onClick={(e) => e.stopPropagation()}
                                    onChange={(e) => {
                                        if (e.target.value) {
                                            onMoveItem(item.id, 'to-driver', e.target.value);
                                        }
                                    }}
                                    className="flex-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-primary-500 cursor-pointer"
                                >
                                    <option value="">Assign</option>
                                    {drivers.map(d => (
                                        <option key={d.id} value={d.id}>
                                            {d.full_name}
                                        </option>
                                    ))}
                                </select>
                            )}
                        </div>
                    </div>
                );
            })}

            {items.length === 0 && (
                <div className="h-full flex flex-col items-center justify-center opacity-30 gap-2">
                    <span className="text-[10px] font-bold uppercase">Empty</span>
                </div>
            )}
        </div>
    );
};

export default LogisticItemList;
