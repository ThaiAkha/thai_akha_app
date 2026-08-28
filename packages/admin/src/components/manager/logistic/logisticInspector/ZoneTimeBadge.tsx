import React from 'react';
import { Clock } from 'lucide-react';
import type { PickupZoneOption } from '../../../../hooks/useManagerLogistic';

interface ZoneTimeBadgeProps {
    zone: PickupZoneOption | undefined;
    sessionId: string;
}

/** Badge zona + orario pickup della sessione (estratto da LogisticInspector, task #93 B7). */
const ZoneTimeBadge: React.FC<ZoneTimeBadgeProps> = ({ zone, sessionId }) => {
    if (!zone) return null;
    const time = sessionId === 'morning_class' ? zone.morning_pickup_time : zone.evening_pickup_time;
    return (
        <div
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold text-black"
            style={{ backgroundColor: zone.color_code || '#6B7280' }}
        >
            <Clock className="w-3.5 h-3.5" />
            <span>{zone.name}</span>
            {time && <span className="opacity-80">· {time.slice(0, 5)}</span>}
        </div>
    );
};

export default ZoneTimeBadge;
