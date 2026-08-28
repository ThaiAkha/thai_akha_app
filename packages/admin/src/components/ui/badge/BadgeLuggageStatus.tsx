import React from 'react';
import { useTranslation } from 'react-i18next';
import { Luggage } from 'lucide-react';
import Tooltip from '../Tooltip';

interface BadgeLuggageStatusProps {
    hasLuggage: boolean;
    size?: 'sm' | 'md';
}

const BadgeLuggageStatus: React.FC<BadgeLuggageStatusProps> = ({ hasLuggage, size = 'md' }) => {
    const { t } = useTranslation('common');
    if (!hasLuggage) return null;

    const sizeClasses = size === 'sm'
        ? 'h-5 w-5'
        : 'h-6 w-6';

    const iconSize = size === 'sm' ? 'w-3 h-3' : 'w-4 h-4';

    return (
        <Tooltip content={t('badges.hasLuggage')} position="left">
            <div className={`flex items-center justify-center ${sizeClasses} bg-orange-50 dark:bg-btn-p-900/20 rounded-md border border-orange-500 dark:border-orange-500 shrink-0`}>
                <Luggage className={`${iconSize} text-warning`} />
            </div>
        </Tooltip>
    );
};

export default BadgeLuggageStatus;
