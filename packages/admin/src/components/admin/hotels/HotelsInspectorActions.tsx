import React from 'react';
import { Edit, Save } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import Tooltip from '../../ui/Tooltip';
import Button from '../../ui/button/Button';
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
            <Tooltip content={selectedMeetingPoint ? t('actions.editMeetingPoint') : t('actions.editHotel')} position="left">
                <Button
                    type="button"
                    onClick={() => setIsEditing(true)}
                    variant="outline"
                    size="md"
                    className="h-9 px-4 text-xs font-black uppercase tracking-widest active:scale-95 transition-all"
                    startIcon={<Edit className="w-4 h-4" />}
                >
                    {t('actions.edit')}
                </Button>
            </Tooltip>
        );
    }

    return (
        <Tooltip content={t('actions.saveModifications')} position="left">
            <Button
                type="button"
                onClick={selectedMeetingPoint ? onSaveMeetingPoint : onSave}
                disabled={saving}
                variant="primary"
                size="md"
                className="h-9 px-4 text-xs font-black uppercase tracking-widest transition-all"
                startIcon={<Save className="w-4 h-4" />}
            >
                {saving ? t('actions.saving') : t('actions.save')}
            </Button>
        </Tooltip>
    );
};

export default HotelsInspectorActions;
