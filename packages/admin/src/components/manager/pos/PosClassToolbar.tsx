import React from 'react';
import { useTranslation } from 'react-i18next';
import { Sunrise, Sunset } from 'lucide-react';
import { cn } from '@thaiakha/shared/lib/utils';
import type { SessionType } from '../../common/ClassPicker';

/**
 * PosClassToolbar — header DINAMICO della colonna centrale del POS (manager + kitchen).
 * Switch Morning/Evening (sessione di oggi) + data. Pattern speculare alla toolbar del
 * Driver Planner (switch pickup/dropoff + data). La sessione è sollevata nell'hook
 * (useManagerPos.selectedSession), così sidebar e centro restano sincronizzati.
 */
interface PosClassToolbarProps {
    selectedSession: SessionType;
    onSessionChange: (s: SessionType) => void;
}

const PosClassToolbar: React.FC<PosClassToolbarProps> = ({ selectedSession, onSessionChange }) => {
    const { t } = useTranslation('manager');
    const isEvening = selectedSession.includes('evening');
    const today = new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'short' });

    return (
        <div className="h-16 px-5 border-b border-gray-200 dark:border-gray-800 flex items-center gap-3 bg-gray-50/50 dark:bg-gray-900/50 shadow-sm shrink-0">
            <div className="flex rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 h-9 shrink-0">
                <button
                    onClick={() => onSessionChange('morning_class')}
                    className={cn('flex items-center gap-1.5 px-3 text-xs font-bold uppercase tracking-wider transition-colors',
                        !isEvening ? 'bg-red-500 text-white' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700')}
                >
                    <Sunrise className="w-3.5 h-3.5 shrink-0" />
                    {t('groupsPlanner.morningClass', { defaultValue: 'Morning' })}
                </button>
                <button
                    onClick={() => onSessionChange('evening_class')}
                    className={cn('flex items-center gap-1.5 px-3 text-xs font-bold uppercase tracking-wider transition-colors border-l border-gray-200 dark:border-gray-700',
                        isEvening ? 'bg-green-500 text-white' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700')}
                >
                    <Sunset className="w-3.5 h-3.5 shrink-0" />
                    {t('groupsPlanner.eveningClass', { defaultValue: 'Evening' })}
                </button>
            </div>
            <span className="text-lg font-bold text-gray-900 dark:text-white">{today}</span>
        </div>
    );
};

export default PosClassToolbar;
