import React from 'react';
import { useTranslation } from 'react-i18next';
import { InspectorEditButton } from '../../ui/inspector/InspectorActionButtons';
import type { FileObject } from '../../../hooks/useAdminStorage';

interface StorageInspectorActionsProps {
    pendingFile: File | null;
    selectedFile: FileObject | null;
    isEditing: boolean;
    setIsEditing: (val: boolean) => void;
    setEditingNameValue: (val: string) => void;
}

const StorageInspectorActions: React.FC<StorageInspectorActionsProps> = ({
    pendingFile,
    selectedFile,
    isEditing,
    setIsEditing,
    setEditingNameValue,
}) => {
    const { t } = useTranslation('common');

    // In modifica l'azione primaria e' il bottone h-12 nel body (standard planner: UNA
    // primaria, in fondo). La pill Save in header era un doppione: rimossa 2026-08-28.
    if (pendingFile || !selectedFile || isEditing) return null;

    return (
        <InspectorEditButton
            onClick={() => { setIsEditing(true); setEditingNameValue(selectedFile.name); }}
            tooltip={t('actions.editFileMetadata')}
        >
            {t('actions.edit')}
        </InspectorEditButton>
    );
};

export default StorageInspectorActions;
