import { MapPin, Globe, Map as MapIcon, Home } from 'lucide-react';
import { DataExplorerContent, GridCard, DataExplorerRow, DataCardContent, DataRowText } from '../../../components/data-explorer';
import { Table, TableHeader, TableBody, TableRow, TableCell } from '../../../components/ui/table';
import Badge from '../../../components/ui/badge/Badge';
import type { HotelLocation, MeetingPoint, PickupZone } from '../../../hooks/useAdminHotels';

interface HotelsContentProps {
    loading: boolean;
    viewMode: 'table' | 'grid';
    activeTab: 'hotels' | 'meeting_points';
    searchQuery: string;
    filteredHotels: HotelLocation[];
    filteredMeetingPoints: MeetingPoint[];
    selectedHotel: HotelLocation | null;
    selectedMeetingPoint: MeetingPoint | null;
    zones: PickupZone[];
    onSelectHotel: (hotel: HotelLocation) => void;
    onSelectMeetingPoint: (mp: MeetingPoint) => void;
}

const HotelsContent: React.FC<HotelsContentProps> = ({
    loading,
    viewMode,
    activeTab,
    searchQuery,
    filteredHotels,
    filteredMeetingPoints,
    selectedHotel,
    selectedMeetingPoint,
    onSelectHotel,
    onSelectMeetingPoint
}) => {
    return (
        <DataExplorerContent
            loading={loading}
            emptyIcon={<MapIcon className="w-12 h-12" />}
            emptyMessage={activeTab === 'meeting_points' ? 'No meeting points found' : `No hotels found${searchQuery ? ` matching "${searchQuery}"` : ''}`}
        >
            {viewMode === 'grid' ? (
                <div className="p-4">
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
                        {activeTab === 'meeting_points' ? (
                            filteredMeetingPoints.map((mp) => {
                                return (
                                    <GridCard
                                        key={mp.id}
                                        item={mp}
                                        selected={selectedMeetingPoint?.id === mp.id}
                                        onClick={() => onSelectMeetingPoint(mp)}
                                        imageUrl={mp.image_url}
                                        imageIcon={<MapPin className="w-8 h-8" />}
                                        renderFields={(item) => (
                                            <DataCardContent
                                                title={item.name}
                                                subtitle={item.description}
                                                badges={null}
                                                footerLeft={
                                                    <div className="flex flex-col gap-0.5">
                                                        <p className="text-[9px] font-black tracking-tight text-gray-400 uppercase">Morning</p>
                                                        <p className="text-[10px] font-bold text-gray-700 dark:text-gray-300">{item.morning_pickup_time || '--:--'}</p>
                                                    </div>
                                                }
                                                footerRight={
                                                    <div className="flex flex-col gap-0.5 items-end">
                                                        <p className="text-[9px] font-black tracking-tight text-gray-400 uppercase">Evening</p>
                                                        <p className="text-[10px] font-bold text-gray-700 dark:text-gray-300">{item.evening_pickup_time || '--:--'}</p>
                                                    </div>
                                                }
                                            />
                                        )}
                                    />
                                );
                            })
                        ) : (
                            filteredHotels.map((hotel) => (
                                <GridCard
                                    key={hotel.id}
                                    item={hotel}
                                    selected={selectedHotel?.id === hotel.id}
                                    onClick={() => onSelectHotel(hotel)}
                                    imageIcon={<Home className="w-8 h-8" />}
                                    renderFields={(item) => (
                                        <DataCardContent
                                            title={item.name}
                                            subtitle={item.address}
                                            badges={
                                                <span
                                                    className="px-2 py-0.5 rounded text-[10px] font-bold uppercase"
                                                    style={{ backgroundColor: (item.zone_color || '#9CA3AF') + '20', color: item.zone_color || '#9CA3AF' }}
                                                >
                                                    {item.zone_name}
                                                </span>
                                            }
                                            footerLeft={
                                                <p className="text-[10px] font-bold text-gray-400 truncate">
                                                    {item.phone_number || 'No phone'}
                                                </p>
                                            }
                                            footerRight={
                                                item.is_active ? (
                                                    <Badge color="success" size="sm" className="text-[9px]">ACTIVE</Badge>
                                                ) : (
                                                    <Badge color="light" size="sm" className="text-[9px]">INACTIVE</Badge>
                                                )
                                            }
                                        />
                                    )}
                                />
                            ))
                        )}
                    </div>
                </div>
            ) : (
                activeTab === 'meeting_points' ? (
                    <Table className="text-xs">
                        <TableHeader className="sticky top-0 z-10 bg-gray-50 dark:bg-gray-950 border-b border-gray-200 dark:border-gray-800">
                            <TableRow>
                                <TableCell isHeader className="px-4 py-3 text-left font-black uppercase tracking-widest text-gray-500 text-[10px]">Meeting Point</TableCell>
                                <TableCell isHeader className="px-4 py-3 text-left font-black uppercase tracking-widest text-gray-500 text-[10px]">Details</TableCell>
                                <TableCell isHeader className="px-4 py-3 text-left font-black uppercase tracking-widest text-gray-500 text-[10px]">Pick-up Morning</TableCell>
                                <TableCell isHeader className="px-4 py-3 text-left font-black uppercase tracking-widest text-gray-500 text-[10px]">Pick-up Evening</TableCell>
                                <TableCell isHeader className="px-4 py-3 text-left font-black uppercase tracking-widest text-gray-500 text-[10px]">Status</TableCell>
                                <TableCell isHeader className="px-4 py-3 text-left font-black uppercase tracking-widest text-gray-500 text-[10px]">Links</TableCell>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredMeetingPoints.map((mp, idx) => {
                                return (
                                    <DataExplorerRow
                                        key={mp.id}
                                        idx={idx}
                                        selected={selectedMeetingPoint?.id === mp.id}
                                        onClick={() => onSelectMeetingPoint(mp)}
                                    >
                                        <TableCell className="px-4 py-3">
                                            <div className="flex items-center gap-3">
                                                {mp.icon_url && (
                                                    <img src={mp.icon_url} alt="" className="w-8 h-8 rounded-lg object-cover bg-gray-100 border border-gray-100" />
                                                )}
                                                <DataRowText
                                                    title={mp.name}
                                                />
                                            </div>
                                        </TableCell>
                                        <TableCell className="px-4 py-3">
                                            <DataRowText
                                                description={mp.description || 'No description'}
                                            />
                                        </TableCell>
                                        <TableCell className="px-4 py-3">
                                            <DataRowText
                                                title={`${mp.morning_pickup_time || '--:--'} → ${mp.morning_pickup_end || '--:--'}`}
                                            />
                                        </TableCell>
                                        <TableCell className="px-4 py-3">
                                            <DataRowText
                                                title={`${mp.evening_pickup_time || '--:--'} → ${mp.evening_pickup_end || '--:--'}`}
                                            />
                                        </TableCell>
                                        <TableCell className="p-4">
                                            {mp.is_active ? (
                                                <Badge color="success" size="sm">ACTIVE</Badge>
                                            ) : (
                                                <Badge color="error" size="sm">INACTIVE</Badge>
                                            )}
                                        </TableCell>
                                        <TableCell className="p-4">
                                            <div className="flex items-center gap-2">
                                                {mp.google_maps_link && (
                                                    <a href={mp.google_maps_link} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()} title="Open in Maps">
                                                        <MapPin className="w-4 h-4 text-brand-500 hover:scale-110 transition-transform" />
                                                    </a>
                                                )}
                                                {mp.image_url && (
                                                    <a href={mp.image_url} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()} title="View Photo">
                                                        <Globe className="w-4 h-4 text-gray-400 hover:text-gray-600 transition-colors" />
                                                    </a>
                                                )}
                                            </div>
                                        </TableCell>
                                    </DataExplorerRow>
                                );
                            })}
                        </TableBody>
                    </Table>
                ) : (
                    filteredHotels.length > 0 && (
                        <Table className="text-xs">
                            <TableHeader className="sticky top-0 z-10 bg-gray-50 dark:bg-gray-950 border-b border-gray-200 dark:border-gray-800">
                                <TableRow>
                                    <TableCell isHeader className="px-4 py-3 text-left font-black uppercase tracking-widest text-gray-500 text-[10px]">Name</TableCell>
                                    <TableCell isHeader className="px-4 py-3 text-left font-black uppercase tracking-widest text-gray-500 text-[10px]">Zone</TableCell>
                                    <TableCell isHeader className="px-4 py-3 text-left font-black uppercase tracking-widest text-gray-500 text-[10px]">Phone</TableCell>
                                    <TableCell isHeader className="px-4 py-3 text-left font-black uppercase tracking-widest text-gray-500 text-[10px]">Status</TableCell>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredHotels.map((hotel, idx) => (
                                    <DataExplorerRow
                                        key={hotel.id}
                                        idx={idx}
                                        selected={selectedHotel?.id === hotel.id}
                                        onClick={() => onSelectHotel(hotel)}
                                    >
                                        <TableCell className="px-4 py-3">
                                            <DataRowText
                                                title={hotel.name}
                                                description={hotel.address}
                                            />
                                        </TableCell>
                                        <TableCell className="px-4 py-3">
                                            <DataRowText
                                                extra={hotel.zone_name}
                                            />
                                        </TableCell>
                                        <TableCell className="px-4 py-3">
                                            <DataRowText
                                                title={hotel.phone_number || '—'}
                                            />
                                        </TableCell>
                                        <TableCell className="px-4 py-3">
                                            {hotel.is_active ? (
                                                <Badge color="success" size="sm" className="text-[9px]">ACTIVE</Badge>
                                            ) : (
                                                <Badge color="light" size="sm" className="text-[9px]">INACTIVE</Badge>
                                            )}
                                        </TableCell>
                                    </DataExplorerRow>
                                ))}
                            </TableBody>
                        </Table>
                    )
                )
            )}
        </DataExplorerContent>
    );
};

export default HotelsContent;
