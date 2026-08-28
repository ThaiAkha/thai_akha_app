import React from 'react';
import { useTranslation } from 'react-i18next';
import { CheckCircle2, XCircle } from 'lucide-react';
import Badge from '../../../../components/ui/badge/Badge';
import SectionHeader from '../../../ui/SectionHeader';
import ZoneInfoCard from '../../../../components/admin/ZoneInfoCard';
import type { HotelViewProps } from './types';

// Vista hotel in sola lettura: campi opzionali (indirizzo, telefono, link, sito) compaiono solo se valorizzati.
const HotelView: React.FC<HotelViewProps> = ({ selectedHotel, zones }) => {
    const { t } = useTranslation('hotels');
    const currentZone = zones.find(z => z.id === selectedHotel?.zone_id);

    return (
        <div className="px-6 py-6 bg-gray-50/10 space-y-6">
            {currentZone && (
                <ZoneInfoCard zone={currentZone} />
            )}

            <div className="space-y-5">
                <div className="space-y-1.5">
                    <SectionHeader title={t('inspector.viewFieldHotelName')} />
                    <p className="text-base font-semibold text-title">{selectedHotel?.name}</p>
                </div>

                <div className="space-y-1.5">
                    <SectionHeader title={t('inspector.viewFieldZone')} />
                    <p>
                        <span
                            className="inline-block px-2.5 py-1 rounded text-sm font-medium"
                            style={{
                                backgroundColor: (selectedHotel?.zone_color || '#9CA3AF') + '20',
                                color: selectedHotel?.zone_color || '#9CA3AF'
                            }}
                        >
                            {selectedHotel?.zone_name}
                        </span>
                    </p>
                </div>

                {selectedHotel?.address && (
                    <div className="space-y-1.5">
                        <SectionHeader title={t('inspector.viewFieldAddress')} />
                        <p className="text-sm text-body">{selectedHotel.address}</p>
                    </div>
                )}

                {selectedHotel?.phone_number && (
                    <div className="space-y-1.5">
                        <SectionHeader title={t('inspector.viewFieldPhone')} />
                        <p className="text-sm text-body">{selectedHotel.phone_number}</p>
                    </div>
                )}

                <div className="space-y-1.5">
                    <SectionHeader title={t('inspector.viewFieldCoordinates')} />
                    <p className="font-mono text-sm text-body">
                        {selectedHotel?.latitude && selectedHotel?.longitude
                            ? `${selectedHotel.latitude}, ${selectedHotel.longitude}`
                            : '—'}
                    </p>
                </div>

                {selectedHotel?.map_link && (
                    <div className="space-y-1.5">
                        <SectionHeader title={t('inspector.viewFieldMapLink')} />
                        <a
                            href={selectedHotel.map_link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-primary-500 hover:underline truncate block"
                        >
                            {selectedHotel.map_link}
                        </a>
                    </div>
                )}

                {selectedHotel?.website && (
                    <div className="space-y-1.5">
                        <SectionHeader title={t('inspector.viewFieldWebsite')} />
                        <a
                            href={selectedHotel.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-primary-500 hover:underline truncate block"
                        >
                            {selectedHotel.website}
                        </a>
                    </div>
                )}

                <div className="space-y-1.5">
                    <SectionHeader title={t('inspector.viewFieldStatus')} />
                    <p>
                        {selectedHotel?.is_active
                            ? <Badge color="success" size="sm" startIcon={<CheckCircle2 className="w-3 h-3" />}>{t('content.active')}</Badge>
                            : <Badge color="error" size="sm" startIcon={<XCircle className="w-3 h-3" />}>{t('content.inactive')}</Badge>
                        }
                    </p>
                </div>
            </div>
        </div>
    );
};

export default HotelView;
