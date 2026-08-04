import React from 'react';
import { useTranslation } from 'react-i18next';
import { 
    Edit3,
    Check,
    X,
    Loader2
} from 'lucide-react';

interface MediaInspectorActionsProps {
    isEditing: boolean;
    setIsEditing: (val: boolean) => void;
    handleSave: () => void;
    isSaving: boolean;
}

const MediaInspectorActions: React.FC<MediaInspectorActionsProps> = ({
    isEditing,
    setIsEditing,
    handleSave,
    isSaving,
}) => {
    const { t } = useTranslation('media');

    if (isEditing) {
        return (
            <div className="flex items-center gap-3">
                <button
                    onClick={() => setIsEditing(false)}
                    disabled={isSaving}
                    className="p-3 rounded-xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-white/5 text-gray-500 hover:bg-gray-100 dark:hover:bg-white/10 transition-all shadow-lg active:scale-95 disabled:opacity-50"
                >
                    <X size={16} />
                </button>
                <button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="flex-1 flex items-center justify-center gap-2 p-3 px-6 rounded-xl bg-primary-500 text-white font-black text-xs uppercase tracking-widest transition-all shadow-lg shadow-primary-500/20 hover:bg-primary-600 active:scale-[0.98] disabled:opacity-50"
                >
                    {isSaving ? (
                        <>
                            <Loader2 size={14} className="animate-spin" />
                            {t('actions.syncing')}
                        </>
                    ) : (
                        <>
                            <Check size={14} />
                            {t('actions.deploy')}
                        </>
                    )}
                </button>
            </div>
        );
    }

    return (
        <button
            onClick={() => setIsEditing(true)}
            className="w-full flex items-center justify-center gap-3 p-3 px-6 rounded-xl bg-surface dark:bg-gray-800 border border-border text-title font-black text-xs uppercase tracking-widest transition-all shadow-xl hover:shadow-primary-500/10 hover:border-primary-500/50 active:scale-[0.98]"
        >
            <Edit3 size={14} className="text-primary-500" />
            {t('actions.editProperties')}
        </button>
    );
};

export default MediaInspectorActions;
