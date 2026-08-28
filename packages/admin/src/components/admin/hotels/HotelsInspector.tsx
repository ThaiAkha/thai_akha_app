import React from 'react';
import { useTranslation } from 'react-i18next';
import { Building2 } from 'lucide-react';
import { InspectorEmpty } from '../../ui/inspector';
import MeetingPointForm from './hotelsInspector/MeetingPointForm';
import HotelEditForm from './hotelsInspector/HotelEditForm';
import HotelView from './hotelsInspector/HotelView';
import type { HotelsInspectorProps } from './hotelsInspector/types';

export type { HotelsInspectorProps } from './hotelsInspector/types';

// Guscio a rami: il contenitore scrollabile e l'header sono di DataExplorerInspector (AdminHotels),
// qui si sceglie solo quale corpo mostrare. Ordine dei rami invariato: meeting point > vuoto > edit > vista.
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

    if (selectedMeetingPoint) {
        return (
            <MeetingPointForm
                meetingPoint={selectedMeetingPoint}
                isEditing={isEditing}
                onChange={onSelectedMeetingPointChange}
            />
        );
    }

    if (!selectedHotel && !isCreating) {
        return (
            <InspectorEmpty
                icon={<Building2 className="w-12 h-12 text-muted" />}
                title={t('inspector.noHotelSelected')}
                hint={t('inspector.noHotelHint')}
            />
        );
    }

    if (isEditing) {
        return (
            <HotelEditForm
                selectedHotel={selectedHotel}
                form={form}
                zones={zones}
                onFormChange={onFormChange}
                onMapLinkChange={onMapLinkChange}
                onManualGPSChange={onManualGPSChange}
            />
        );
    }

    return <HotelView selectedHotel={selectedHotel} zones={zones} />;
};

export default HotelsInspector;
