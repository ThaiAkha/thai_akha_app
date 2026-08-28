import { useTranslation } from 'react-i18next';
import { MapPin, Globe, Map as MapIcon, Home } from 'lucide-react';
import {
    DataExplorerContent,
    GridCard,
    DataExplorerRow,
    DataCardContent,
    DataRowText,
    DataTableHead,
    HeaderCell,
    CardGrid
} from '../../../components/data-explorer';
import { Table, TableBody, TableCell } from '../../../components/ui/table';
import Badge from '../../../components/ui/badge/Badge';
import type { HotelLocation, MeetingPoint } from '../../../hooks/useAdminHotels';

interface HotelsContentProps {
    loading: boolean;
    viewMode: 'table' | 'grid';
    activeTab: 'hotels' | 'meeting_points';
    searchQuery: string;
    filteredHotels: HotelLocation[];
    filteredMeetingPoints: MeetingPoint[];
    selectedHotel: HotelLocation | null;
    selectedMeetingPoint: MeetingPoint | null;
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
    const { t } = useTranslation('hotels');

    // Lo stato vuoto guarda solo la lista della scheda attiva: le due entita'
    // non si sommano mai nella stessa vista.
    const isEmpty = activeTab === 'meeting_points'
        ? filteredMeetingPoints.length === 0
        : filteredHotels.length === 0;

    return (
        <DataExplorerContent
            loading={loading}
            isEmpty={isEmpty}
            emptyIcon={<MapIcon className="w-12 h-12" />}
            emptyMessage={activeTab === 'meeting_points' ? t('content.noMeetingPoints') : (searchQuery ? t('content.noHotelsMatch', { query: searchQuery }) : t('content.noHotels'))}
        >
            {viewMode === 'grid' ? (
                <CardGrid>
                    {activeTab === 'meeting_points' ? (
                        filteredMeetingPoints.map((mp) => {
                            return (
                                <GridCard
                                    key={mp.id}
                                    item={mp}
                                    selected={selectedMeetingPoint?.id === mp.id}
                                    onClick={() => onSelectMeetingPoint(mp)}
                                    imageUrl={mp.image_url || undefined}
                                    imageIcon={<MapPin className="w-8 h-8" />}
                                    renderFields={(item) => (
                                        <DataCardContent
                                            title={item.name}
                                            subtitle={item.description ?? undefined}
                                            badges={null}
                                            footerLeft={
                                                <div className="flex flex-col gap-0.5">
                                                    <p className="text-xs font-black tracking-tight text-sub uppercase">{t('content.cardMorning')}</p>
                                                    <p className="text-xs font-bold text-body">{item.morning_pickup_time || '--:--'}</p>
                                                </div>
                                            }
                                            footerRight={
                                                <div className="flex flex-col gap-0.5 items-end">
                                                    <p className="text-xs font-black tracking-tight text-sub uppercase">{t('content.cardEvening')}</p>
                                                    <p className="text-xs font-bold text-body">{item.evening_pickup_time || '--:--'}</p>
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
                                        subtitle={item.address ?? undefined}
                                        badges={
                                            <span
                                                className="px-2 py-0.5 rounded text-xs font-bold uppercase"
                                                style={{ backgroundColor: (item.zone_color || '#9CA3AF') + '20', color: item.zone_color || '#9CA3AF' }}
                                            >
                                                {item.zone_name}
                                            </span>
                                        }
                                        footerLeft={
                                            <p className="text-xs font-bold text-sub truncate">
                                                {item.phone_number || t('content.noPhone')}
                                            </p>
                                        }
                                        footerRight={
                                            item.is_active ? (
                                                <Badge color="success" size="sm" className="text-xs">{t('content.active')}</Badge>
                                            ) : (
                                                <Badge color="light" size="sm" className="text-xs">{t('content.inactive')}</Badge>
                                            )
                                        }
                                    />
                                )}
                            />
                        ))
                    )}
                </CardGrid>
            ) : (
                activeTab === 'meeting_points' ? (
                    <Table className="text-xs">
                        <DataTableHead>
                            <HeaderCell align="left" label={t('content.colMeetingPoint')} />
                            <HeaderCell align="left" label={t('content.colDetails')} />
                            <HeaderCell align="left" label={t('content.colPickupMorning')} />
                            <HeaderCell align="left" label={t('content.colPickupEvening')} />
                            <HeaderCell align="left" label={t('content.colStatus')} />
                            <HeaderCell align="left" label={t('content.colLinks')} />
                        </DataTableHead>
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
                                                description={mp.description || t('content.noDescription')}
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
                                            {mp.active ? (
                                                <Badge color="success" size="sm">{t('content.active')}</Badge>
                                            ) : (
                                                <Badge color="error" size="sm">{t('content.inactive')}</Badge>
                                            )}
                                        </TableCell>
                                        <TableCell className="p-4">
                                            <div className="flex items-center gap-2">
                                                {mp.google_maps_link && (
                                                    <a href={mp.google_maps_link} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()} title={t('content.openInMaps')}>
                                                        <MapPin className="w-4 h-4 text-primary-500 hover:scale-110 transition-transform" />
                                                    </a>
                                                )}
                                                {mp.image_url && (
                                                    <a href={mp.image_url} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()} title={t('content.viewPhoto')}>
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
                    <Table className="text-xs">
                        <DataTableHead>
                            <HeaderCell align="left" label={t('content.colName')} />
                            <HeaderCell align="left" label={t('content.colZone')} />
                            <HeaderCell align="left" label={t('content.colPhone')} />
                            <HeaderCell align="left" label={t('content.colStatus')} />
                        </DataTableHead>
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
                                            <Badge color="success" size="sm" className="text-xs">{t('content.active')}</Badge>
                                        ) : (
                                            <Badge color="light" size="sm" className="text-xs">{t('content.inactive')}</Badge>
                                        )}
                                    </TableCell>
                                </DataExplorerRow>
                            ))}
                        </TableBody>
                    </Table>
                )
            )}
        </DataExplorerContent>
    );
};

export default HotelsContent;
