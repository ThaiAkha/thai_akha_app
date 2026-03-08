import React from 'react';
import { Edit, Save } from 'lucide-react';
import Button from '../../ui/button/Button';
import Tooltip from '../../ui/Tooltip';

interface ReservationInspectorActionsProps {
    isEditing: boolean;
    handleEditStart: () => void;
    handleSave: () => Promise<void>;
    isSaving: boolean;
    selectedBooking: any;
}

const ReservationInspectorActions: React.FC<ReservationInspectorActionsProps> = ({
    isEditing,
    handleEditStart,
    handleSave,
    isSaving,
    selectedBooking
}) => {
    if (!selectedBooking || !selectedBooking.internal_id) return null;

    if (!isEditing) {
        return (
            <Tooltip content="Edit this booking" position="left">
                <Button
                    type="button"
                    onClick={handleEditStart}
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
        <Tooltip content="Save changes" position="left">
            <Button
                type="button"
                onClick={handleSave}
                disabled={isSaving}
                variant="primary"
                size="md"
                className="h-9 px-4 text-[10px] font-black uppercase tracking-widest transition-all"
                startIcon={<Save className="w-4 h-4" />}
            >
                {isSaving ? 'SAVING...' : 'SAVE'}
            </Button>
        </Tooltip>
    );
};

export default ReservationInspectorActions;
