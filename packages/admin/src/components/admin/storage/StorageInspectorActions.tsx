import React from 'react';
import { useTranslation } from 'react-i18next';
import { InspectorEditButton, InspectorSaveButton } from '../../ui/inspector/InspectorActionButtons';

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
            <InspectorEditButton
                onClick={() => { setIsEditing(true); setEditingNameValue(selectedFile.name); }}
                tooltip={t('actions.editFileMetadata')}
            >
                {t('actions.edit')}
            </InspectorEditButton>
        );
    }

    return (
        <InspectorSaveButton
            onClick={handleRename}
            disabled={isUploading}
            tooltip={t('actions.saveChanges')}
        >
            {isUploading ? t('actions.saving') : t('actions.save')}
        </InspectorSaveButton>
    );
};

export default StorageInspectorActions;
