import React from 'react';
import { useTranslation } from 'react-i18next';
import { InspectorCancelButton, InspectorEditButton, InspectorSaveButton } from '../../ui/inspector';

interface MediaInspectorActionsProps {
    isEditing: boolean;
    setIsEditing: (val: boolean) => void;
    handleSave: () => void;
    isSaving: boolean;
}

/**
 * Azioni dell'inspector media sui primitivi inspector (task #93, B2). Le etichette restano
 * quelle del namespace media (editProperties / deploy / syncing); i tooltip vengono dalle
 * chiavi common gia' esistenti. Il Cancel resta solo-icona (X) come prima: l'etichetta
 * e' sr-only. Lo slot azioni dell'header e' content-sized, quindi `w-full` risolve alla
 * larghezza del contenuto esattamente come faceva il <button> scritto a mano.
 */
const MediaInspectorActions: React.FC<MediaInspectorActionsProps> = ({
    isEditing,
    setIsEditing,
    handleSave,
    isSaving,
}) => {
    const { t } = useTranslation(['media', 'common']);

    if (isEditing) {
        return (
            <div className="flex items-center gap-3">
                <InspectorCancelButton
                    tooltip={t('common:actions.cancel')}
                    onClick={() => setIsEditing(false)}
                    disabled={isSaving}
                >
                    <span className="sr-only">{t('common:actions.cancel')}</span>
                </InspectorCancelButton>
                <InspectorSaveButton
                    tooltip={t('common:actions.saveChanges')}
                    onClick={handleSave}
                    disabled={isSaving}
                >
                    {isSaving ? t('actions.syncing') : t('actions.deploy')}
                </InspectorSaveButton>
            </div>
        );
    }

    return (
        <InspectorEditButton
            tooltip={t('common:actions.editFileMetadata')}
            onClick={() => setIsEditing(true)}
            className="w-full"
        >
            {t('actions.editProperties')}
        </InspectorEditButton>
    );
};

export default MediaInspectorActions;
