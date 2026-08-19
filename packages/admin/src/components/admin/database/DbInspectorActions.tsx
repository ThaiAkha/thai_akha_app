import React from 'react';
import { useTranslation } from 'react-i18next';
import { InspectorEditButton, InspectorSaveButton } from '../../ui/inspector/InspectorActionButtons';

interface DbInspectorActionsProps {
    isEditing: boolean;
    setIsEditing: (val: boolean) => void;
    setShowDeleteConfirm: (val: boolean) => void;
    handleSave: (e?: React.FormEvent | React.MouseEvent) => Promise<void>;
    isSaving: boolean;
    selectedRow: Record<string, unknown> | null;
}

const DbInspectorActions: React.FC<DbInspectorActionsProps> = ({
    isEditing,
    setIsEditing,
    setShowDeleteConfirm,
    handleSave,
    isSaving,
    selectedRow
}) => {
    const { t } = useTranslation('common');

    if (!selectedRow) return null;

    if (!isEditing) {
        return (
            <InspectorEditButton
                tooltip={t('actions.editRecord')}
                onClick={() => {
                    setIsEditing(true);
                    setShowDeleteConfirm(false);
                }}
            >
                {t('actions.edit')}
            </InspectorEditButton>
        );
    }

    return (
        <InspectorSaveButton tooltip={t('actions.saveModifications')} onClick={handleSave} disabled={isSaving}>
            {isSaving ? t('actions.saving') : t('actions.save')}
        </InspectorSaveButton>
    );
};

export default DbInspectorActions;
