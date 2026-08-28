import React from 'react';
import { Users } from 'lucide-react';
import Tooltip from '../Tooltip';

interface BadgePaxNumberProps {
    paxCount: number;
    size?: 'sm' | 'md' | 'lg';
}

const SIZE_BOX: Record<'sm' | 'md' | 'lg', string> = {
    sm: 'h-5 px-1.5 gap-1',
    md: 'h-6 px-2 gap-1.5',
    lg: 'h-7 px-2.5 gap-2',
};
const SIZE_ICON: Record<'sm' | 'md' | 'lg', string> = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
};
const SIZE_TEXT: Record<'sm' | 'md' | 'lg', string> = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base',
};

const BadgePaxNumber: React.FC<BadgePaxNumberProps> = ({ paxCount, size = 'md' }) => {
    const sizeClasses = SIZE_BOX[size];
    const iconSize = SIZE_ICON[size];
    const textSize = SIZE_TEXT[size];

    const tooltipText = `${paxCount} ${paxCount === 1 ? 'person' : 'persons'} booked`;

    return (
        <Tooltip content={tooltipText} position="top">
            <div className={`flex items-center justify-center ${sizeClasses} bg-green-50 dark:bg-green-900/20 rounded-md border border-green-500 dark:border-green-500 shrink-0`}>
                <Users className={`${iconSize} text-success`} />
                <span className={`${textSize} font-black text-success tabular-nums`}>
                    {paxCount}
                </span>
            </div>
        </Tooltip>
    );
};

export default BadgePaxNumber;
