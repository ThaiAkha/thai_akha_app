import React from 'react';
import { Edit3, Save } from 'lucide-react';
import { useTranslation } from 'react-i18next';
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
    const { t } = useTranslation('common');

    if (pendingFile || !selectedFile) return null;

    if (!isEditing) {
        return (
            <Tooltip content={t('actions.editFileMetadata')} position="left">
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
                    {t('actions.edit')}
                </Button>
            </Tooltip>
        );
    }

    return (
        <Tooltip content={t('actions.saveChanges')} position="left">
            <Button
                type="button"
                onClick={handleRename}
                disabled={isUploading}
                variant="primary"
                size="md"
                className="h-9 px-4 text-[10px] font-black uppercase tracking-widest transition-all"
                startIcon={<Save className="w-4 h-4" />}
            >
                {isUploading ? t('actions.saving') : t('actions.save')}
            </Button>
        </Tooltip>
    );
};

export default StorageInspectorActions;
