import React from 'react';
import { useTranslation } from 'react-i18next';
import { MapPin } from 'lucide-react';
import Card from '../ui/Card';
import { Heading, Paragraph } from '../typography';

export interface ZoneInfo {
    id: string;
    name: string;
    color_code: string | null;
    description?: string | null;
    morning_pickup_time?: string | null;
    morning_pickup_end?: string | null;
    evening_pickup_time?: string | null;
    evening_pickup_end?: string | null;
}

interface ZoneInfoCardProps {
    zone: ZoneInfo;
    session?: 'morning_class' | 'evening_class';
}

const ZoneInfoCard: React.FC<ZoneInfoCardProps> = ({ zone, session = 'morning_class' }) => {
    const { t } = useTranslation('logistics');
    const color = zone.color_code || '#9CA3AF';
    const isMorning = session === 'morning_class';

    return (
        <Card className="relative overflow-hidden !p-0">
            {/* Colored accent bar on top */}
            <div
                className="h-1 w-full"
                style={{ backgroundColor: color }}
            />

            <div className="p-6">
                {/* 50/50 Layout: Title (left) + Session Time (right) */}
                <div className="grid grid-cols-2 gap-6 items-start">
                    {/* Left: Title with Icon */}
                    <div>
                        <Heading level="h4" className="flex items-center gap-2 text-title">
                            <div
                                className="p-1.5 rounded-lg shrink-0"
                                style={{ backgroundColor: color + '15' }}
                            >
                                <MapPin className="w-5 h-5" style={{ color }} />
                            </div>
                            <span className="truncate">{zone.name}</span>
                        </Heading>
                        {zone.description && (
                            <Paragraph size="sm" color="secondary" className="mt-1 line-clamp-1 font-medium">
                                {zone.description}
                            </Paragraph>
                        )}
                    </div>

                    {/* Right: Session Time */}
                    <div className="text-right">
                        <div className="text-xs font-bold text-sub uppercase tracking-wider mb-2">
                            {isMorning ? t('zone.morningPickup') : t('zone.eveningPickup')}
                        </div>
                        <div className="text-lg font-black text-title">
                            {isMorning
                                ? `${zone.morning_pickup_time?.substring(0, 5) || '--:--'} > ${zone.morning_pickup_end?.substring(0, 5) || '--:--'}`
                                : `${zone.evening_pickup_time?.substring(0, 5) || '--:--'} > ${zone.evening_pickup_end?.substring(0, 5) || '--:--'}`
                            }
                        </div>
                    </div>
                </div>
            </div>
        </Card>
    );
};

export default ZoneInfoCard;
