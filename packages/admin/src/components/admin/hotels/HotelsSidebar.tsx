import React, { useMemo } from 'react';
import { Building2, Map as MapIcon } from 'lucide-react';
import { DataExplorerSidebar } from '../../../components/data-explorer';
import type { HotelLocation, PickupZone, MeetingPoint } from '../../../hooks/useAdminHotels';

interface HotelsSidebarProps {
    hotels: HotelLocation[];
    zones: PickupZone[];
    meetingPoints: MeetingPoint[];
    selectedZone: string;
    activeTab: 'hotels' | 'meeting_points';
    onSelect: (id: string) => void;
}

const HotelsSidebar: React.FC<HotelsSidebarProps> = ({
    hotels,
    zones,
    meetingPoints,
    selectedZone,
    activeTab,
    onSelect
}) => {
    const sidebarItems = useMemo(() => {
        // Filter out "Walk Inn" zone
        const visibleZones = zones.filter(z =>
            !z.name.toLowerCase().includes('walk in') &&
            !z.name.toLowerCase().includes('walk inn') &&
            !z.name.toLowerCase().includes('self transportation')
        );

        // Sort zones: Azure, Pink, Green, Yellow, Red
        const zoneOrder = ['azure', 'pink', 'green', 'yellow', 'red'];
        visibleZones.sort((a, b) => {
            const indexA = zoneOrder.indexOf(a.id);
            const indexB = zoneOrder.indexOf(b.id);
            if (indexA === -1 && indexB === -1) return 0;
            if (indexA === -1) return 1;
            if (indexB === -1) return -1;
            return indexA - indexB;
        });

        return [
            {
                id: 'all_mps',
                label: 'All Meeting Points',
                count: meetingPoints.length,
                icon: <MapIcon className="w-4 h-4" />
            },
            {
                id: 'all',
                label: 'All Hotels',
                count: hotels.length,
                icon: <Building2 className="w-4 h-4" />
            },
            ...visibleZones.map(z => ({
                id: z.id,
                label: z.name,
                count: hotels.filter(h => h.zone_id === z.id).length,
                color: z.color_code,
                badge: (
                    <span
                        className="text-xs font-semibold px-2 py-0.5 rounded-full"
                        style={{
                            backgroundColor: (z.color_code || '#9CA3AF') + '20',
                            color: z.color_code || '#9CA3AF'
                        }}
                    >
                        {hotels.filter(h => h.zone_id === z.id).length}
                    </span>
                )
            }))
        ];
    }, [hotels, zones, meetingPoints]);

    return (
        <DataExplorerSidebar
            title="Hotels"
            titleIcon={<Building2 className="w-5 h-5" />}
            items={sidebarItems}
            selectedId={activeTab === 'meeting_points' ? 'all_mps' : selectedZone}
            onSelect={onSelect}
        />
    );
};

export default HotelsSidebar;
