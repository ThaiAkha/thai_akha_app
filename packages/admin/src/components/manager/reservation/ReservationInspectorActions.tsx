import React from 'react';
import { useTranslation } from 'react-i18next';
import { InspectorEditButton, InspectorSaveButton } from '../../ui/inspector';
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
    const { t } = useTranslation(['reservation', 'common']);
    if (!selectedBooking || !selectedBooking.internal_id) return null;

    if (!isEditing) {
        // Era il literal "EDIT": in EN il testo resta identico (common actions.edit = "EDIT",
        // e il pill applica comunque `uppercase`); nelle altre lingue ora segue il locale.
        return (
            <InspectorEditButton tooltip={t('actions.tooltipEdit')} onClick={handleEditStart}>
                {t('common:actions.edit')}
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
