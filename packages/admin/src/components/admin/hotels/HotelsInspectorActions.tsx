import React from 'react';
import { Edit, Save } from 'lucide-react';
import Tooltip from '../../ui/Tooltip';
import Button from '../../ui/button/Button';

interface HotelsInspectorActionsProps {
    selectedHotel: any;
    selectedMeetingPoint: any;
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
    if (!selectedHotel && !isCreating && !selectedMeetingPoint) return null;

    if (!isEditing) {
        return (
            <Tooltip content={selectedMeetingPoint ? "Edit this meeting point" : "Edit this hotel"} position="left">
                <Button
                    type="button"
                    onClick={() => setIsEditing(true)}
                    variant="outline"
                    size="md"
                    className="h-9 px-4 text-[10px] font-black uppercase tracking-widest active:scale-95 transition-all"
                    startIcon={<Edit className="w-4 h-4" />}
                >
                    EDIT
                </Button>
            </Tooltip>
        );
    }

    return (
        <Tooltip content="Save modifications" position="left">
            <Button
                type="button"
                onClick={selectedMeetingPoint ? onSaveMeetingPoint : onSave}
                disabled={saving}
                variant="primary"
                size="md"
                className="h-9 px-4 text-[10px] font-black uppercase tracking-widest transition-all"
                startIcon={<Save className="w-4 h-4" />}
            >
                {saving ? 'SAVING...' : 'SAVE'}
            </Button>
        </Tooltip>
    );
};

export default HotelsInspectorActions;
