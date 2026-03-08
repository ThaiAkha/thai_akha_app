import React from 'react';
import { Save } from 'lucide-react';
import Button from '../../ui/button/Button';
import Tooltip from '../../ui/Tooltip';

interface LogisticInspectorActionsProps {
    handleSave: () => void;
    isSaving: boolean;
    selectedBooking: any;
}

const LogisticInspectorActions: React.FC<LogisticInspectorActionsProps> = ({
    handleSave,
    isSaving,
    selectedBooking
}) => {
    if (!selectedBooking || !selectedBooking.id) return null;

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

export default LogisticInspectorActions;
