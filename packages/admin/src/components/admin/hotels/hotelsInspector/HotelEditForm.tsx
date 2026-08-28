import React from 'react';
import { useTranslation } from 'react-i18next';
import InputField from '../../../../components/form/input/InputField';
import SelectField from '../../../../components/form/input/SelectField';
import Switch from '../../../../components/form/switch/Switch';
import SectionHeader from '../../../ui/SectionHeader';
import type { HotelEditFormProps } from './types';

// Form hotel in edit/create: il link mappa mostra le GPS risolte come hint e passa a `success`
// quando lat/lng/link sono tutti presenti.
const HotelEditForm: React.FC<HotelEditFormProps> = ({
    selectedHotel,
    form,
    zones,
    onFormChange,
    onMapLinkChange,
    onManualGPSChange,
}) => {
    const { t } = useTranslation('hotels');

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
                    <p className="text-xs font-black uppercase tracking-widest text-body">{t('inspector.fieldActiveStatus')}</p>
                    <p className="text-xs text-sub mt-0.5">{t('inspector.showInPickup')}</p>
                </div>
                {/* key: lo Switch va rimontato quando cambia l'hotel selezionato (o si passa a 'new') */}
                <Switch
                    key={selectedHotel?.id || 'new'}
                    label=""
                    checked={form.is_active}
                    onChange={(val) => onFormChange({ is_active: val })}
                />
            </div>
        </div>
    );
};

export default HotelEditForm;
