import React from 'react';
import { useTranslation } from 'react-i18next';
import { InspectorEditButton, InspectorSaveButton } from '../../ui/inspector';
import type { HotelLocation, MeetingPoint } from '@thaiakha/shared/types';

interface HotelsInspectorActionsProps {
    selectedHotel: HotelLocation | null;
    selectedMeetingPoint: MeetingPoint | null;
    isCreating: boolean;
    isEditing: boolean;
    setIsEditing: (val: boolean) => void;
    saving: boolean;
    onSave: () => void;
    onSaveMeetingPoint: () => void;
}

// Edit/Save sui primitivi inspector (task #93, B2): stesse classi pill del Button+Tooltip
// scritto a mano prima, stessi tooltip e stesso handler (meeting point vs hotel).
const HotelsInspectorActions: React.FC<HotelsInspectorActionsProps> = ({
    selectedHotel,
    selectedMeetingPoint,
    isCreating,
    isEditing,
    setIsEditing,
    saving,
    onSave,
    onSaveMeetingPoint
}) => {
    const { t } = useTranslation('common');

    if (!selectedHotel && !isCreating && !selectedMeetingPoint) return null;

    if (!isEditing) {
        return (
            <InspectorEditButton
                tooltip={selectedMeetingPoint ? t('actions.editMeetingPoint') : t('actions.editHotel')}
                onClick={() => setIsEditing(true)}
            >
                {t('actions.edit')}
            </InspectorEditButton>
        );
    }

    return (
        <InspectorSaveButton
            tooltip={t('actions.saveModifications')}
            onClick={selectedMeetingPoint ? onSaveMeetingPoint : onSave}
            disabled={saving}
        >
            {saving ? t('actions.saving') : t('actions.save')}
        </InspectorSaveButton>
    );
};

export default HotelsInspectorActions;
