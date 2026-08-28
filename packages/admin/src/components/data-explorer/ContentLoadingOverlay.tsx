import React from 'react';
import { useTranslation } from 'react-i18next';
import { cn } from '@thaiakha/shared/lib/utils';

interface ContentLoadingOverlayProps {
    /** Testo dell'overlay; se omesso usa dashboard:explorer.loading. */
    label?: string;
    className?: string;
}

const ContentLoadingOverlay: React.FC<ContentLoadingOverlayProps> = ({ label, className }) => {
    const { t } = useTranslation('dashboard');

    return (
        <div
            className={cn(
                'absolute inset-0 bg-white/50 dark:bg-black/50 z-50 flex items-center justify-center backdrop-blur-sm',
                className
            )}
        >
            <div className="loader font-black uppercase text-xs tracking-widest animate-pulse">
                {label ?? t('explorer.loading')}
            </div>
        </div>
    );
};

export default ContentLoadingOverlay;
