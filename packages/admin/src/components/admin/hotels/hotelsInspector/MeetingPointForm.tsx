import React from 'react';
import { useTranslation } from 'react-i18next';
import { Image as ImageIcon } from 'lucide-react';
import InputField from '../../../../components/form/input/InputField';
import Switch from '../../../../components/form/switch/Switch';
import { SectionTitle } from '../../../typography';
import type { MeetingPointFormProps } from './types';

// Form del meeting point: stesso wrapper e stessi campi del ramo originale, in view e in edit
// (cambia solo `disabled`).
const MeetingPointForm: React.FC<MeetingPointFormProps> = ({ meetingPoint, isEditing, onChange }) => {
    const { t } = useTranslation('hotels');

    return (
        <div className="px-6 py-6 bg-gray-50/10 space-y-5">
            <div className="space-y-1.5">
                <SectionTitle as="h6" tone="sub" className="mb-2">{t('inspector.fieldMPName')}</SectionTitle>
                <InputField
                    placeholder={t('inspector.placeholderMPName')}
                    value={meetingPoint.name}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => onChange({ ...meetingPoint, name: e.target.value })}
                    disabled={!isEditing}
                />
            </div>

            <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                    <SectionTitle as="h6" tone="sub" className="mb-2">{t('inspector.fieldLatitude')}</SectionTitle>
                    <InputField
                        type="number"
                        step={0.0000001}
                        value={meetingPoint.latitude?.toString() || ''}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => onChange({ ...meetingPoint, latitude: parseFloat(e.target.value) })}
                        disabled={!isEditing}
                    />
                </div>
                <div className="space-y-1.5">
                    <SectionTitle as="h6" tone="sub" className="mb-2">{t('inspector.fieldLongitude')}</SectionTitle>
                    <InputField
                        type="number"
                        step={0.0000001}
                        value={meetingPoint.longitude?.toString() || ''}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => onChange({ ...meetingPoint, longitude: parseFloat(e.target.value) })}
                        disabled={!isEditing}
                    />
                </div>
            </div>

            <div className="space-y-1.5">
                <SectionTitle as="h6" tone="sub" className="mb-2">{t('inspector.fieldDescription')}</SectionTitle>
                <InputField
                    placeholder={t('inspector.placeholderDesc')}
                    value={meetingPoint.description || ''}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => onChange({ ...meetingPoint, description: e.target.value })}
                    disabled={!isEditing}
                />
            </div>

            <div className="space-y-1.5">
                <SectionTitle as="h6" tone="sub" className="mb-2">{t('inspector.fieldGoogleMaps')}</SectionTitle>
                <InputField
                    placeholder="https://maps.google.com/..."
                    value={meetingPoint.google_maps_link || ''}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => onChange({ ...meetingPoint, google_maps_link: e.target.value })}
                    disabled={!isEditing}
                />
            </div>

            <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                    <SectionTitle as="h6" tone="sub" className="mb-2">{t('inspector.fieldMorningStart')}</SectionTitle>
                    <InputField
                        type="time"
                        value={meetingPoint.morning_pickup_time || ''}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => onChange({ ...meetingPoint, morning_pickup_time: e.target.value })}
                        disabled={!isEditing}
                    />
                </div>
                <div className="space-y-1.5">
                    <SectionTitle as="h6" tone="sub" className="mb-2">{t('inspector.fieldMorningEnd')}</SectionTitle>
                    <InputField
                        type="time"
                        value={meetingPoint.morning_pickup_end || ''}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => onChange({ ...meetingPoint, morning_pickup_end: e.target.value })}
                        disabled={!isEditing}
                    />
                </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                    <SectionTitle as="h6" tone="sub" className="mb-2">{t('inspector.fieldEveningStart')}</SectionTitle>
                    <InputField
                        type="time"
                        value={meetingPoint.evening_pickup_time || ''}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => onChange({ ...meetingPoint, evening_pickup_time: e.target.value })}
                        disabled={!isEditing}
                    />
                </div>
                <div className="space-y-1.5">
                    <SectionTitle as="h6" tone="sub" className="mb-2">{t('inspector.fieldEveningEnd')}</SectionTitle>
                    <InputField
                        type="time"
                        value={meetingPoint.evening_pickup_end || ''}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => onChange({ ...meetingPoint, evening_pickup_end: e.target.value })}
                        disabled={!isEditing}
                    />
                </div>
            </div>

            <div className="space-y-1.5">
                <SectionTitle as="h6" tone="sub" className="mb-2">{t('inspector.fieldImageAsset', { defaultValue: 'Photo (media asset)' })}</SectionTitle>
                <div className="flex items-center gap-3">
                    <div className="w-16 h-16 shrink-0 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800 flex items-center justify-center border border-gray-200 dark:border-gray-700">
                        {meetingPoint.image_url ? (
                            <img src={meetingPoint.image_url} alt="" className="w-full h-full object-cover" />
                        ) : (
                            <ImageIcon className="w-6 h-6 text-muted" />
                        )}
                    </div>
                    <div className="flex-1">
                        <InputField
                            placeholder={t('inspector.assetIdPlaceholder', { defaultValue: 'media asset id (uuid)' })}
                            value={meetingPoint.image_asset_id || ''}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => onChange({ ...meetingPoint, image_asset_id: e.target.value || null })}
                            disabled={!isEditing}
                        />
                    </div>
                </div>
            </div>

            <div className="space-y-1.5">
                <SectionTitle as="h6" tone="sub" className="mb-2">{t('inspector.fieldIconUrl')}</SectionTitle>
                <InputField
                    placeholder="https://..."
                    value={meetingPoint.icon_url || ''}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => onChange({ ...meetingPoint, icon_url: e.target.value })}
                    disabled={!isEditing}
                />
            </div>

            <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-white/[0.02] border border-gray-100 dark:border-white/[0.05]">
                <SectionTitle as="h6" tone="sub" className="mb-0">{t('inspector.fieldActiveStatus')}</SectionTitle>
                <Switch
                    label=""
                    checked={meetingPoint.active || false}
                    onChange={(checked) => onChange({ ...meetingPoint, active: checked })}
                    disabled={!isEditing}
                />
            </div>
        </div>
    );
};

export default MeetingPointForm;
