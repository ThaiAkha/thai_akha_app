import React from 'react';
import { useTranslation } from 'react-i18next';
import { InspectorSaveButton } from '../../ui/inspector/InspectorActionButtons';

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
    const { t } = useTranslation('logistics');

    if (!selectedBooking || !selectedBooking.id) return null;

    return (
        <InspectorSaveButton tooltip={t('actions.tooltipSave')} onClick={handleSave} disabled={isSaving}>
            {isSaving ? t('actions.saving') : t('actions.save')}
        </InspectorSaveButton>
    );
};

export default LogisticInspectorActions;
