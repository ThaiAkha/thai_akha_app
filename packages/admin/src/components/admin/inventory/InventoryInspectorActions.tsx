import React from 'react';
import { Edit, Save } from 'lucide-react';
import Button from '../../ui/button/Button';
import Tooltip from '../../ui/Tooltip';

interface InventoryInspectorActionsProps {
    isNew: boolean;
    isEditing: boolean;
    setIsEditing: (val: boolean) => void;
    handleSave: () => Promise<void>;
    isSaving: boolean;
    editingProduct: any;
}

const InventoryInspectorActions: React.FC<InventoryInspectorActionsProps> = ({
    isNew,
    isEditing,
    setIsEditing,
    handleSave,
    isSaving,
    editingProduct
}) => {
    if (!isNew && editingProduct.id && !isEditing) {
        return (
            <Tooltip content="Edit this record" position="left">
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

    if (isEditing || isNew) {
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
    }

    return null;
};

export default InventoryInspectorActions;
