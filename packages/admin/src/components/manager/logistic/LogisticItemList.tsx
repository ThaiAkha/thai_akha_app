import React from 'react';
import { cn } from '@thaiakha/shared/lib/utils';
import { useTranslation } from 'react-i18next';
import { ChevronUp, ChevronDown, MapPin, Clock } from 'lucide-react';
import Avatar from '../../ui/avatar/Avatar';
import BadgePaxNumber from '../../ui/badge/BadgePaxNumber';
import BadgeLuggageStatus from '../../ui/badge/BadgeLuggageStatus';
import Tooltip from '../../ui/Tooltip';
import Paragraph from '../../typography/Paragraph';
import { LogisticsItem, DriverProfile } from '../../../hooks/useManagerLogistic';
import { ZONE_BOX_CLASSES, zoneBoxStyle } from './zoneColor';

export interface LogisticItemListProps {
    items: LogisticsItem[];
    drivers: DriverProfile[];
    selectedBookingId: string | null;
    onSelectBooking: (id: string) => void;
    onMoveItem: (itemId: string, direction: 'up' | 'down' | 'to-driver', targetDriverId?: string) => void;
    showAvatar?: boolean;
    showAssignDriver?: boolean;
    /**
     * Orario di ritiro sulla scheda. Acceso per il gruppo "da assegnare", che e' ordinato
     * per orario: un ordine il cui criterio non si vede sembra un ordine casuale.
     */
    showTime?: boolean;
    /**
     * Frecce su/giu' per l'ordine di percorso. Si spengono per il gruppo "da assegnare":
     * quelle righe non hanno ancora un percorso, quindi riordinarle non significa niente
     * e metterebbe in coda un salvataggio che non cambia nulla di utile.
     */
    showMove?: boolean;
}


export const LogisticItemList: React.FC<LogisticItemListProps> = ({
    items,
    drivers,
    selectedBookingId,
    onSelectBooking,
    onMoveItem,
    showAvatar = true,
    showAssignDriver = true,
    showMove = true,
    showTime = false
}) => {
    const { t } = useTranslation('common');

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
                            // Standard planner (ADMIN_PLANNER_UX): bordo 1px, niente doppio
                            // bordo; la selezione si comunica con l'elevazione, non col ring.
                            "p-3 rounded-xl border transition-all cursor-pointer bg-surface group",
                            isSelected
                                ? "border-primary-500 shadow-lg"
                                : "border-gray-100 dark:border-gray-700 hover:border-primary-300 shadow-sm"
                        )}
                    >
                        {/* Row 1: Avatar + Name + Badges */}
                        <div className="flex items-center gap-2 mb-2">
                            {showAvatar && (
                                <Avatar src={item.avatar_url} alt={item.guest_name} size="medium" />
                            )}
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
                        {(item.hotel_name || item.meeting_point_name) && (
                            <div className="flex items-center gap-2 mb-2">
                                <MapPin className="w-4 h-4 shrink-0 text-sub" />
                                <Tooltip content={item.hotel_name || item.meeting_point_name || 'No location'} position="bottom">
                                    <div className={ZONE_BOX_CLASSES} style={zoneBoxStyle(item.pickup_zone_color)}>
                                        {item.hotel_name || item.meeting_point_name}
                                    </div>
                                </Tooltip>
                            </div>
                        )}

                        {showTime && item.pickup_time && (
                            <div className="flex items-center gap-2 mb-2 text-sm text-sub font-mono">
                                <Clock className="w-4 h-4 shrink-0" />
                                {item.pickup_time}
                            </div>
                        )}

                        {/* Row 3: Move Buttons */}
                        <div className="flex gap-1.5">
                            {showMove && (<>
                            <button
                                type="button"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onMoveItem(item.id, 'up');
                                }}
                                disabled={isFirst}
                                className={cn(
                                    "size-11 flex items-center justify-center rounded-lg text-sm font-bold transition-colors shrink-0",
                                    isFirst
                                        ? "bg-gray-100 dark:bg-gray-700 text-muted cursor-not-allowed"
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
                                    "size-11 flex items-center justify-center rounded-lg text-sm font-bold transition-colors shrink-0",
                                    isLast
                                        ? "bg-gray-100 dark:bg-gray-700 text-muted cursor-not-allowed"
                                        : "bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 hover:bg-primary-100 dark:hover:bg-primary-900/50"
                                )}
                            >
                                <ChevronDown className="w-4 h-4" />
                            </button>
                            </>)}

                            {/* Assign Driver Select */}
                            {showAssignDriver && drivers.length > 0 && (
                                <select
                                    onClick={(e) => e.stopPropagation()}
                                    onChange={(e) => {
                                        if (e.target.value) {
                                            onMoveItem(item.id, 'to-driver', e.target.value);
                                        }
                                    }}
                                    className={cn(
                                        // ricetta input standard: su chip gray il testo secondario
                                        // scende sotto AA (§2), su surface text-body tiene ovunque
                                        "flex-1 h-11 min-w-0 text-sm bg-surface text-body border border-gray-200 dark:border-gray-700 rounded-lg px-2",
                                        "focus:outline-none focus:ring-2 focus:ring-primary-500 cursor-pointer"
                                    )}
                                >
                                    <option value="">{t('actions.assign')}</option>
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
                    <span className="text-sm font-bold uppercase">{t('fallback.empty')}</span>
                </div>
            )}
        </div>
    );
};

export default LogisticItemList;
