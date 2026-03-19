import React from 'react';
import { cn } from '@thaiakha/shared/lib/utils';
import { MapPin } from 'lucide-react';
import Avatar from '../../ui/avatar/Avatar';
import BadgePaxNumber from '../../ui/badge/BadgePaxNumber';
import BadgeLuggageStatus from '../../ui/badge/BadgeLuggageStatus';
import Tooltip from '../../ui/Tooltip';
import { LogisticsItem } from '../../../hooks/useManagerLogistic';

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

export interface LogisticWalkInItemListProps {
    items: LogisticsItem[];
    selectedBookingId: string | null;
    onSelectBooking: (id: string) => void;
}

export const LogisticWalkInItemList: React.FC<LogisticWalkInItemListProps> = ({
    items,
    selectedBookingId,
    onSelectBooking
}) => {
    return (
        <div className="flex-1 overflow-y-auto p-2 space-y-2 bg-gray-50/50 dark:bg-gray-900/50 no-scrollbar">
            {items.map((item) => {
                const isSelected = selectedBookingId === item.id;

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
                        {/* Row 1: Icon + Name + Badges */}
                        <div className="flex items-center gap-2 mb-2">
                            <Avatar
                                src={item.avatar_url}
                                alt={item.guest_name}
                                size="medium"
                                fallback={<MapPin className="w-5 h-5 text-orange-500 dark:text-orange-400" />}
                                fallbackClassName="bg-orange-100 dark:bg-btn-p-900/30"
                            />
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

                        {/* Row 3: Meeting Time */}
                        {item.pickup_time && (
                            <div className="text-xs text-gray-500 dark:text-gray-400 font-mono">
                                🕐 {item.pickup_time}
                            </div>
                        )}
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

export default LogisticWalkInItemList;
