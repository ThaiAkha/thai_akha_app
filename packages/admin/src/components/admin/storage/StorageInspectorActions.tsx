import React from 'react';
import { Edit3, Save } from 'lucide-react';
import Button from '../../ui/button/Button';
import Tooltip from '../../ui/Tooltip';

interface StorageInspectorActionsProps {
    pendingFile: any;
    selectedFile: any;
    isEditing: boolean;
    setIsEditing: (val: boolean) => void;
    setEditingNameValue: (val: string) => void;
    handleRename: () => Promise<void>;
    isUploading: boolean;
}

const StorageInspectorActions: React.FC<StorageInspectorActionsProps> = ({
    pendingFile,
    selectedFile,
    isEditing,
    setIsEditing,
    setEditingNameValue,
    handleRename,
    isUploading
}) => {
    if (pendingFile || !selectedFile) return null;

    if (!isEditing) {
        return (
            <Tooltip content="Edit file metadata" position="left">
                <Button
                    type="button"
                    onClick={() => {
                        setIsEditing(true);
                        setEditingNameValue(selectedFile.name);
                    }}
                    variant="outline"
                    size="md"
                    className="h-9 px-4 text-[10px] font-black uppercase tracking-widest active:scale-95 transition-all"
                    startIcon={<Edit3 className="w-4 h-4" />}
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
                onClick={handleRename}
                disabled={isUploading}
                variant="primary"
                size="md"
                className="h-9 px-4 text-[10px] font-black uppercase tracking-widest transition-all"
                startIcon={<Save className="w-4 h-4" />}
            >
                {isUploading ? 'SAVING...' : 'SAVE'}
            </Button>
        </Tooltip>
    );
};

export default StorageInspectorActions;
