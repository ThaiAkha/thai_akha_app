import React from 'react';
import { Edit, Save } from 'lucide-react';
import Button from '../../ui/button/Button';
import Tooltip from '../../ui/Tooltip';

interface DbInspectorActionsProps {
    isEditing: boolean;
    setIsEditing: (val: boolean) => void;
    setShowDeleteConfirm: (val: boolean) => void;
    handleSave: (e?: React.FormEvent | React.MouseEvent) => Promise<void>;
    isSaving: boolean;
    selectedRow: any;
}

const DbInspectorActions: React.FC<DbInspectorActionsProps> = ({
    isEditing,
    setIsEditing,
    setShowDeleteConfirm,
    handleSave,
    isSaving,
    selectedRow
}) => {
    if (!selectedRow) return null;

    if (!isEditing) {
        return (
            <Tooltip content="Edit this record" position="left">
                <Button
                    type="button"
                    onClick={() => {
                        setIsEditing(true);
                        setShowDeleteConfirm(false);
                    }}
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

export default DbInspectorActions;
