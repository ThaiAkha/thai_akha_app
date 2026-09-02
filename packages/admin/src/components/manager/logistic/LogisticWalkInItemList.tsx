import React from 'react';
import { cn } from '@thaiakha/shared/lib/utils';
import { useTranslation } from 'react-i18next';
import { Clock, MapPin } from 'lucide-react';
import Avatar from '../../ui/avatar/Avatar';
import BadgePaxNumber from '../../ui/badge/BadgePaxNumber';
import BadgeLuggageStatus from '../../ui/badge/BadgeLuggageStatus';
import Tooltip from '../../ui/Tooltip';
import Paragraph from '../../typography/Paragraph';
import { LogisticsItem } from '../../../hooks/useManagerLogistic';

// Helper function to map zone colors to Tailwind classes
const getZoneColorClasses = (colorCode: string | null): string => {
    if (!colorCode) return 'border-gray-200 dark:border-gray-700 text-body';

    const colorMap: Record<string, string> = {
        'yellow': 'border-yellow-400 dark:border-yellow-600 text-body',
        'green': 'border-green-400 dark:border-green-600 text-body',
        'pink': 'border-pink-400 dark:border-pink-600 text-body',
        'blue': 'border-blue-400 dark:border-blue-600 text-body',
        'purple': 'border-purple-400 dark:border-purple-600 text-body',
        'orange': 'border-orange-400 dark:border-orange-600 text-body',
        'red': 'border-red-400 dark:border-red-600 text-body',
        'cyan': 'border-cyan-400 dark:border-cyan-600 text-body',
        'gray': 'border-gray-300 dark:border-gray-600 text-body',
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
    const { t } = useTranslation('common');

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
                            // Standard planner (ADMIN_PLANNER_UX): bordo 1px, niente doppio
                            // bordo; la selezione si comunica con l'elevazione, non col ring.
                            "p-3 rounded-xl border transition-all cursor-pointer bg-surface group",
                            isSelected
                                ? "border-primary-500 shadow-lg"
                                : "border-gray-100 dark:border-gray-700 hover:border-primary-300 shadow-sm"
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
                                <Paragraph size="base" className="font-bold text-title truncate">
                                    {item.guest_name || t('fallback.guest')}
                                </Paragraph>
                            </div>
                            <div className="flex gap-1">
                                <BadgeLuggageStatus hasLuggage={item.has_luggage} size="md" />
                                <BadgePaxNumber paxCount={item.pax} size="md" />
                            </div>
                        </div>

                        {/* Row 2: Location Info */}
                        {(item.hotel_name || item.meeting_point) && (
                            <div className="flex items-center gap-2 mb-2">
                                <MapPin className="w-4 h-4 shrink-0 text-sub" />
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

                        {/* Row 3: Meeting Time (floor 14px del planner, icona al posto dell'emoji) */}
                        {item.pickup_time && (
                            <div className="flex items-center gap-2 text-sm text-sub font-mono">
                                <Clock className="w-4 h-4 shrink-0" />
                                {item.pickup_time}
                            </div>
                        )}
                    </div>
                );
            })}

            {items.length === 0 && (
                <div className="h-full flex flex-col items-center justify-center opacity-30 gap-2">
                    <span className="text-sm font-bold uppercase">{t('fallback.empty')}</span>
                </div>
            )}
        </div>
    );
};

export default LogisticWalkInItemList;
