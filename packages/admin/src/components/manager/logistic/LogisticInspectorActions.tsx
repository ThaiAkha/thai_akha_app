import React from 'react';
import { useTranslation } from 'react-i18next';
import { InspectorSaveButton } from '../../ui/inspector/InspectorActionButtons';
import type { LogisticsItem } from '../../../hooks/useManagerLogistic';

interface LogisticInspectorActionsProps {
    handleSave: () => void;
    isSaving: boolean;
    selectedBooking: LogisticsItem | null;
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
