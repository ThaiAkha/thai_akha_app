import React from 'react';
import { useTranslation } from 'react-i18next';
import { InspectorEditButton, InspectorSaveButton } from '../../ui/inspector/InspectorActionButtons';
import type { ManagerBooking } from '../../../hooks/useManagerReservation';

interface ReservationInspectorActionsProps {
    isEditing: boolean;
    handleEditStart: () => void;
    handleSave: () => Promise<void>;
    isSaving: boolean;
    selectedBooking: ManagerBooking | null;
}

const ReservationInspectorActions: React.FC<ReservationInspectorActionsProps> = ({
    isEditing,
    handleEditStart,
    handleSave,
    isSaving,
    selectedBooking
}) => {
    const { t } = useTranslation('reservation');
    if (!selectedBooking || !selectedBooking.internal_id) return null;

    if (!isEditing) {
        return (
            <InspectorEditButton tooltip={t('actions.tooltipEdit')} onClick={handleEditStart}>
                EDIT
            </InspectorEditButton>
        );
    }

    return (
        <InspectorSaveButton tooltip={t('actions.tooltipSave')} onClick={handleSave} disabled={isSaving}>
            {isSaving ? t('actions.saving') : t('actions.save')}
        </InspectorSaveButton>
    );
};

export default ReservationInspectorActions;
