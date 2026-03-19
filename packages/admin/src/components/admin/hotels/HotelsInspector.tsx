import React from 'react';
import { useTranslation } from 'react-i18next';
import { Building2, CheckCircle2, XCircle } from 'lucide-react';
import InputField from '../../../components/form/input/InputField';
import SelectField from '../../../components/form/input/SelectField';
import Switch from '../../../components/form/switch/Switch';
import Badge from '../../../components/ui/badge/Badge';
import SectionHeader from '../../ui/SectionHeader';
import ZoneInfoCard from '../../../components/admin/ZoneInfoCard';
import type { HotelLocation, MeetingPoint, PickupZone, HotelFormData } from '../../../hooks/useAdminHotels';

interface HotelsInspectorProps {
    selectedHotel: HotelLocation | null;
    selectedMeetingPoint: MeetingPoint | null;
    isEditing: boolean;
    isCreating: boolean;
    saving: boolean;
    form: HotelFormData;
    zones: PickupZone[];
    onFormChange: (data: Partial<HotelFormData>) => void;
    onMapLinkChange: (value: string) => void;
    onManualGPSChange: (field: 'latitude' | 'longitude', value: string) => void;
    onSelectedMeetingPointChange: (mp: MeetingPoint | null) => void;
    onSaveMeetingPoint: () => void;
}

const HotelsInspector: React.FC<HotelsInspectorProps> = ({
    selectedHotel,
    selectedMeetingPoint,
    isEditing,
    isCreating,
    form,
    zones,
    onFormChange,
    onMapLinkChange,
    onManualGPSChange,
    onSelectedMeetingPointChange,
}) => {
    const { t } = useTranslation('hotels');

    // ── MEETING POINT INSPECTOR ──────────────────────────────────────────
    if (selectedMeetingPoint) {
        return (
            <div className="px-6 py-6 bg-gray-50/10 space-y-5">
                <div className="space-y-1.5">
                    <SectionHeader title={t('inspector.fieldMPName')} />
                    <InputField
                        placeholder={t('inspector.placeholderMPName')}
                        value={selectedMeetingPoint.name}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => onSelectedMeetingPointChange({ ...selectedMeetingPoint, name: e.target.value })}
                        disabled={!isEditing}
                    />
                </div>

                <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                        <SectionHeader title={t('inspector.fieldLatitude')} />
                        <InputField
                            type="number"
                            step={0.0000001}
                            value={selectedMeetingPoint.latitude?.toString() || ''}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => onSelectedMeetingPointChange({ ...selectedMeetingPoint, latitude: parseFloat(e.target.value) })}
                            disabled={!isEditing}
                        />
                    </div>
                    <div className="space-y-1.5">
                        <SectionHeader title={t('inspector.fieldLongitude')} />
                        <InputField
                            type="number"
                            step={0.0000001}
                            value={selectedMeetingPoint.longitude?.toString() || ''}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => onSelectedMeetingPointChange({ ...selectedMeetingPoint, longitude: parseFloat(e.target.value) })}
                            disabled={!isEditing}
                        />
                    </div>
                </div>

                <div className="space-y-1.5">
                    <SectionHeader title={t('inspector.fieldDescription')} />
                    <InputField
                        placeholder={t('inspector.placeholderDesc')}
                        value={selectedMeetingPoint.description || ''}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => onSelectedMeetingPointChange({ ...selectedMeetingPoint, description: e.target.value })}
                        disabled={!isEditing}
                    />
                </div>

                <div className="space-y-1.5">
                    <SectionHeader title={t('inspector.fieldGoogleMaps')} />
                    <InputField
                        placeholder="https://maps.google.com/..."
                        value={selectedMeetingPoint.google_maps_link || ''}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => onSelectedMeetingPointChange({ ...selectedMeetingPoint, google_maps_link: e.target.value })}
                        disabled={!isEditing}
                    />
                </div>

                <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                        <SectionHeader title={t('inspector.fieldMorningStart')} />
                        <InputField
                            type="time"
                            value={selectedMeetingPoint.morning_pickup_time || ''}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => onSelectedMeetingPointChange({ ...selectedMeetingPoint, morning_pickup_time: e.target.value })}
                            disabled={!isEditing}
                        />
                    </div>
                    <div className="space-y-1.5">
                        <SectionHeader title={t('inspector.fieldMorningEnd')} />
                        <InputField
                            type="time"
                            value={selectedMeetingPoint.morning_pickup_end || ''}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => onSelectedMeetingPointChange({ ...selectedMeetingPoint, morning_pickup_end: e.target.value })}
                            disabled={!isEditing}
                        />
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                        <SectionHeader title={t('inspector.fieldEveningStart')} />
                        <InputField
                            type="time"
                            value={selectedMeetingPoint.evening_pickup_time || ''}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => onSelectedMeetingPointChange({ ...selectedMeetingPoint, evening_pickup_time: e.target.value })}
                            disabled={!isEditing}
                        />
                    </div>
                    <div className="space-y-1.5">
                        <SectionHeader title={t('inspector.fieldEveningEnd')} />
                        <InputField
                            type="time"
                            value={selectedMeetingPoint.evening_pickup_end || ''}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => onSelectedMeetingPointChange({ ...selectedMeetingPoint, evening_pickup_end: e.target.value })}
                            disabled={!isEditing}
                        />
                    </div>
                </div>

                <div className="space-y-1.5">
                    <SectionHeader title={t('inspector.fieldImageUrl')} />
                    <InputField
                        placeholder="https://..."
                        value={selectedMeetingPoint.image_url || ''}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => onSelectedMeetingPointChange({ ...selectedMeetingPoint, image_url: e.target.value })}
                        disabled={!isEditing}
                    />
                </div>

                <div className="space-y-1.5">
                    <SectionHeader title={t('inspector.fieldIconUrl')} />
                    <InputField
                        placeholder="https://..."
                        value={selectedMeetingPoint.icon_url || ''}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => onSelectedMeetingPointChange({ ...selectedMeetingPoint, icon_url: e.target.value })}
                        disabled={!isEditing}
                    />
                </div>

                <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-white/[0.02] border border-gray-100 dark:border-white/[0.05]">
                    <SectionHeader title={t('inspector.fieldActiveStatus')} className="mb-0" />
                    <Switch
                        label=""
                        checked={selectedMeetingPoint.is_active || false}
                        onChange={(checked) => onSelectedMeetingPointChange({ ...selectedMeetingPoint, is_active: checked })}
                        disabled={!isEditing}
                    />
                </div>
            </div>
        );
    }

    // ── EMPTY STATE ──────────────────────────────────────────────────────
    if (!selectedHotel && !isCreating) {
        return (
            <div className="flex flex-col items-center justify-center h-full text-center px-6 py-20">
                <Building2 className="w-12 h-12 text-gray-300 dark:text-gray-600 mb-4" />
                <p className="text-sm font-black uppercase tracking-widest text-gray-400">
                    {t('inspector.noHotelSelected')}
                </p>
                <p className="text-xs text-gray-400 mt-1">
                    {t('inspector.noHotelHint')}
                </p>
            </div>
        );
    }

    // ── EDIT / CREATE MODE ───────────────────────────────────────────────
    if (isEditing) {
        return (
            <div className="px-6 py-6 bg-gray-50/10 space-y-5">
                <div className="space-y-1.5">
                    <SectionHeader title={t('inspector.fieldHotelName')} />
                    <InputField
                        placeholder={t('inspector.placeholderHotelName')}
                        value={form.name}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => onFormChange({ name: e.target.value })}
                    />
                </div>

                <div className="space-y-1.5">
                    <SectionHeader title={t('inspector.fieldZone')} />
                    <SelectField
                        value={form.zone_id || ''}
                        onChange={(e) => onFormChange({ zone_id: e.target.value })}
                    >
                        <option value="">{t('inspector.noZone')}</option>
                        {zones.map(z => (
                            <option key={z.id} value={z.id}>{z.name}</option>
                        ))}
                    </SelectField>
                </div>

                <div className="space-y-1.5">
                    <SectionHeader title={t('inspector.fieldMapLink')} />
                    <InputField
                        placeholder={t('inspector.placeholderMapLink')}
                        value={form.map_link || ''}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => onMapLinkChange(e.target.value)}
                        hint={form.latitude && form.longitude ? `📍 GPS: ${form.latitude.toFixed(6)}, ${form.longitude.toFixed(6)}` : undefined}
                        success={!!(form.latitude && form.longitude && form.map_link)}
                    />
                </div>

                <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                        <SectionHeader title={t('inspector.fieldLatitude')} />
                        <InputField
                            type="number"
                            step={0.0000001}
                            placeholder="18.7883"
                            value={form.latitude?.toString() || ''}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => onManualGPSChange('latitude', e.target.value)}
                        />
                    </div>
                    <div className="space-y-1.5">
                        <SectionHeader title={t('inspector.fieldLongitude')} />
                        <InputField
                            type="number"
                            step={0.0000001}
                            placeholder="98.9853"
                            value={form.longitude?.toString() || ''}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => onManualGPSChange('longitude', e.target.value)}
                        />
                    </div>
                </div>

                <div className="space-y-1.5">
                    <SectionHeader title={t('inspector.fieldAddress')} />
                    <InputField
                        placeholder={t('inspector.placeholderAddress')}
                        value={form.address || ''}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => onFormChange({ address: e.target.value })}
                    />
                </div>

                <div className="space-y-1.5">
                    <SectionHeader title={t('inspector.fieldPhone')} />
                    <InputField
                        placeholder={t('inspector.placeholderPhone')}
                        value={form.phone_number || ''}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => onFormChange({ phone_number: e.target.value })}
                    />
                </div>

                <div className="space-y-1.5">
                    <SectionHeader title={t('inspector.fieldWebsite')} />
                    <InputField
                        placeholder="https://..."
                        value={form.website || ''}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => onFormChange({ website: e.target.value })}
                    />
                </div>

                <div className="flex items-center justify-between p-4 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl">
                    <div>
                        <p className="text-xs font-black uppercase tracking-widest text-gray-700 dark:text-gray-200">{t('inspector.fieldActiveStatus')}</p>
                        <p className="text-[10px] text-gray-400 mt-0.5">{t('inspector.showInPickup')}</p>
                    </div>
                    <Switch
                        key={selectedHotel?.id || 'new'}
                        label=""
                        checked={form.is_active}
                        onChange={(val) => onFormChange({ is_active: val })}
                    />
                </div>
            </div>
        );
    }

    // ── VIEW MODE ────────────────────────────────────────────────────────
    const currentZone = zones.find(z => z.id === selectedHotel?.zone_id);

    return (
        <div className="px-6 py-6 bg-gray-50/10 space-y-6">
            {currentZone && (
                <ZoneInfoCard zone={currentZone} />
            )}

            <div className="space-y-5">
                <div className="space-y-1.5">
                    <SectionHeader title={t('inspector.viewFieldHotelName')} />
                    <p className="text-base font-semibold text-gray-900 dark:text-white">{selectedHotel?.name}</p>
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
                        <p className="text-sm text-gray-700 dark:text-gray-300">{selectedHotel.address}</p>
                    </div>
                )}

                {selectedHotel?.phone_number && (
                    <div className="space-y-1.5">
                        <SectionHeader title={t('inspector.viewFieldPhone')} />
                        <p className="text-sm text-gray-700 dark:text-gray-300">{selectedHotel.phone_number}</p>
                    </div>
                )}

                <div className="space-y-1.5">
                    <SectionHeader title={t('inspector.viewFieldCoordinates')} />
                    <p className="font-mono text-sm text-gray-700 dark:text-gray-300">
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

export default HotelsInspector;
