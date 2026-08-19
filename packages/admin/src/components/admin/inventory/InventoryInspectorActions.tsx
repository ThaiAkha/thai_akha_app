import React from 'react';
import { useTranslation } from 'react-i18next';
import { InspectorEditButton, InspectorSaveButton } from '../../ui/inspector/InspectorActionButtons';
import type { Product } from '../../../hooks/useAdminInventory';

interface InventoryInspectorActionsProps {
    isNew: boolean;
    isEditing: boolean;
    setIsEditing: (val: boolean) => void;
    handleSave: () => Promise<void>;
    isSaving: boolean;
    editingProduct: Product;
}

const InventoryInspectorActions: React.FC<InventoryInspectorActionsProps> = ({
    isNew,
    isEditing,
    setIsEditing,
    handleSave,
    isSaving,
    editingProduct
}) => {
    const { t } = useTranslation('common');

    if (!isNew && editingProduct.id && !isEditing) {
        return (
            <InspectorEditButton tooltip={t('actions.editRecord')} onClick={() => setIsEditing(true)}>
                {t('actions.edit')}
            </InspectorEditButton>
        );
    }

    if (isEditing || isNew) {
        return (
            <InspectorSaveButton tooltip={t('actions.saveChanges')} onClick={handleSave} disabled={isSaving}>
                {isSaving ? t('actions.saving') : t('actions.save')}
            </InspectorSaveButton>
        );
    }

    return null;
};

export default InventoryInspectorActions;
