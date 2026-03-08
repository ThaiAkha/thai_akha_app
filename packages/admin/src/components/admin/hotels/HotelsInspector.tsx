import React from 'react';
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
    // ── MEETING POINT INSPECTOR ──────────────────────────────────────────
    if (selectedMeetingPoint) {
        return (
            <div className="px-6 py-6 bg-gray-50/10 space-y-5">
                <div className="space-y-1.5">
                    <SectionHeader title="Meeting Point Name" />
                    <InputField
                        placeholder="e.g. McDonald's Tha Phae"
                        value={selectedMeetingPoint.name}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => onSelectedMeetingPointChange({ ...selectedMeetingPoint, name: e.target.value })}
                        disabled={!isEditing}
                    />
                </div>

                <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                        <SectionHeader title="Latitude" />
                        <InputField
                            type="number"
                            step={0.0000001}
                            value={selectedMeetingPoint.latitude?.toString() || ''}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => onSelectedMeetingPointChange({ ...selectedMeetingPoint, latitude: parseFloat(e.target.value) })}
                            disabled={!isEditing}
                        />
                    </div>
                    <div className="space-y-1.5">
                        <SectionHeader title="Longitude" />
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
                    <SectionHeader title="Description" />
                    <InputField
                        placeholder="Optional description"
                        value={selectedMeetingPoint.description || ''}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => onSelectedMeetingPointChange({ ...selectedMeetingPoint, description: e.target.value })}
                        disabled={!isEditing}
                    />
                </div>

                <div className="space-y-1.5">
                    <SectionHeader title="Google Maps Link" />
                    <InputField
                        placeholder="https://maps.google.com/..."
                        value={selectedMeetingPoint.google_maps_link || ''}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => onSelectedMeetingPointChange({ ...selectedMeetingPoint, google_maps_link: e.target.value })}
                        disabled={!isEditing}
                    />
                </div>

                <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                        <SectionHeader title="Morning Start" />
                        <InputField
                            type="time"
                            value={selectedMeetingPoint.morning_pickup_time || ''}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => onSelectedMeetingPointChange({ ...selectedMeetingPoint, morning_pickup_time: e.target.value })}
                            disabled={!isEditing}
                        />
                    </div>
                    <div className="space-y-1.5">
                        <SectionHeader title="Morning End" />
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
                        <SectionHeader title="Evening Start" />
                        <InputField
                            type="time"
                            value={selectedMeetingPoint.evening_pickup_time || ''}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => onSelectedMeetingPointChange({ ...selectedMeetingPoint, evening_pickup_time: e.target.value })}
                            disabled={!isEditing}
                        />
                    </div>
                    <div className="space-y-1.5">
                        <SectionHeader title="Evening End" />
                        <InputField
                            type="time"
                            value={selectedMeetingPoint.evening_pickup_end || ''}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => onSelectedMeetingPointChange({ ...selectedMeetingPoint, evening_pickup_end: e.target.value })}
                            disabled={!isEditing}
                        />
                    </div>
                </div>

                <div className="space-y-1.5">
                    <SectionHeader title="Image URL" />
                    <InputField
                        placeholder="https://..."
                        value={selectedMeetingPoint.image_url || ''}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => onSelectedMeetingPointChange({ ...selectedMeetingPoint, image_url: e.target.value })}
                        disabled={!isEditing}
                    />
                </div>

                <div className="space-y-1.5">
                    <SectionHeader title="Icon URL" />
                    <InputField
                        placeholder="https://..."
                        value={selectedMeetingPoint.icon_url || ''}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => onSelectedMeetingPointChange({ ...selectedMeetingPoint, icon_url: e.target.value })}
                        disabled={!isEditing}
                    />
                </div>

                <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-white/[0.02] border border-gray-100 dark:border-white/[0.05]">
                    <SectionHeader title="Active Status" className="mb-0" />
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
                    No hotel selected
                </p>
                <p className="text-xs text-gray-400 mt-1">
                    Click a hotel from the list to view details
                </p>
            </div>
        );
    }

    // ── EDIT / CREATE MODE ───────────────────────────────────────────────
    if (isEditing) {
        return (
            <div className="px-6 py-6 bg-gray-50/10 space-y-5">
                <div className="space-y-1.5">
                    <SectionHeader title="Hotel Name *" />
                    <InputField
                        placeholder="e.g. Shangri-La Chiang Mai"
                        value={form.name}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => onFormChange({ name: e.target.value })}
                    />
                </div>

                <div className="space-y-1.5">
                    <SectionHeader title="Pickup Zone" />
                    <SelectField
                        value={form.zone_id || ''}
                        onChange={(e) => onFormChange({ zone_id: e.target.value })}
                    >
                        <option value="">— No zone —</option>
                        {zones.map(z => (
                            <option key={z.id} value={z.id}>{z.name}</option>
                        ))}
                    </SelectField>
                </div>

                <div className="space-y-1.5">
                    <SectionHeader title="Google Map Link" />
                    <InputField
                        placeholder="Paste Google Maps URL (auto-extracts GPS)"
                        value={form.map_link || ''}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => onMapLinkChange(e.target.value)}
                        hint={form.latitude && form.longitude ? `📍 GPS: ${form.latitude.toFixed(6)}, ${form.longitude.toFixed(6)}` : undefined}
                        success={!!(form.latitude && form.longitude && form.map_link)}
                    />
                </div>

                <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                        <SectionHeader title="Latitude" />
                        <InputField
                            type="number"
                            step={0.0000001}
                            placeholder="18.7883"
                            value={form.latitude?.toString() || ''}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => onManualGPSChange('latitude', e.target.value)}
                        />
                    </div>
                    <div className="space-y-1.5">
                        <SectionHeader title="Longitude" />
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
                    <SectionHeader title="Address" />
                    <InputField
                        placeholder="Full street address"
                        value={form.address || ''}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => onFormChange({ address: e.target.value })}
                    />
                </div>

                <div className="space-y-1.5">
                    <SectionHeader title="Phone" />
                    <InputField
                        placeholder="+66 53 123456"
                        value={form.phone_number || ''}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => onFormChange({ phone_number: e.target.value })}
                    />
                </div>

                <div className="space-y-1.5">
                    <SectionHeader title="Website" />
                    <InputField
                        placeholder="https://..."
                        value={form.website || ''}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => onFormChange({ website: e.target.value })}
                    />
                </div>

                <div className="flex items-center justify-between p-4 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl">
                    <div>
                        <p className="text-xs font-black uppercase tracking-widest text-gray-700 dark:text-gray-200">Active Status</p>
                        <p className="text-[10px] text-gray-400 mt-0.5">Show hotel in pickup options</p>
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
                    <SectionHeader title="Hotel Name" />
                    <p className="text-base font-semibold text-gray-900 dark:text-white">{selectedHotel?.name}</p>
                </div>

                <div className="space-y-1.5">
                    <SectionHeader title="Pickup Zone" />
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
                        <SectionHeader title="Address" />
                        <p className="text-sm text-gray-700 dark:text-gray-300">{selectedHotel.address}</p>
                    </div>
                )}

                {selectedHotel?.phone_number && (
                    <div className="space-y-1.5">
                        <SectionHeader title="Phone" />
                        <p className="text-sm text-gray-700 dark:text-gray-300">{selectedHotel.phone_number}</p>
                    </div>
                )}

                <div className="space-y-1.5">
                    <SectionHeader title="Coordinates" />
                    <p className="font-mono text-sm text-gray-700 dark:text-gray-300">
                        {selectedHotel?.latitude && selectedHotel?.longitude
                            ? `${selectedHotel.latitude}, ${selectedHotel.longitude}`
                            : '—'}
                    </p>
                </div>

                {selectedHotel?.map_link && (
                    <div className="space-y-1.5">
                        <SectionHeader title="Map Link" />
                        <a
                            href={selectedHotel.map_link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-brand-500 hover:underline truncate block"
                        >
                            {selectedHotel.map_link}
                        </a>
                    </div>
                )}

                {selectedHotel?.website && (
                    <div className="space-y-1.5">
                        <SectionHeader title="Website" />
                        <a
                            href={selectedHotel.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-brand-500 hover:underline truncate block"
                        >
                            {selectedHotel.website}
                        </a>
                    </div>
                )}

                <div className="space-y-1.5">
                    <SectionHeader title="Status" />
                    <p>
                        {selectedHotel?.is_active
                            ? <Badge color="success" size="sm" startIcon={<CheckCircle2 className="w-3 h-3" />}>ACTIVE</Badge>
                            : <Badge color="error" size="sm" startIcon={<XCircle className="w-3 h-3" />}>INACTIVE</Badge>
                        }
                    </p>
                </div>
            </div>
        </div>
    );
};

export default HotelsInspector;
