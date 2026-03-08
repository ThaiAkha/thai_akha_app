import React from 'react';
import { MapPin } from 'lucide-react';
import Card from '../ui/Card';

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
                        <h3 className="text-xl font-black text-gray-900 dark:text-white flex items-center gap-2">
                            <div
                                className="p-1.5 rounded-lg shrink-0"
                                style={{ backgroundColor: color + '15' }}
                            >
                                <MapPin className="w-5 h-5" style={{ color }} />
                            </div>
                            <span className="truncate">{zone.name}</span>
                        </h3>
                        {zone.description && (
                            <p className="text-sm text-gray-600 dark:text-gray-400 font-medium mt-1 line-clamp-1">
                                {zone.description}
                            </p>
                        )}
                    </div>

                    {/* Right: Session Time */}
                    <div className="text-right">
                        <div className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
                            {isMorning ? 'Morning Pickup' : 'Evening Pickup'}
                        </div>
                        <div className="text-lg font-black text-gray-900 dark:text-white">
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
