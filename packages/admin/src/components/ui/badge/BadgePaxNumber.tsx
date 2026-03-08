import React from 'react';
import { Users } from 'lucide-react';
import Tooltip from '../Tooltip';

interface BadgePaxNumberProps {
    paxCount: number;
    size?: 'sm' | 'md';
}

const BadgePaxNumber: React.FC<BadgePaxNumberProps> = ({ paxCount, size = 'md' }) => {
    const sizeClasses = size === 'sm'
        ? 'h-5 px-1.5 gap-1'
        : 'h-6 px-2 gap-1.5';

    const iconSize = size === 'sm' ? 'w-3 h-3' : 'w-4 h-4';
    const textSize = size === 'sm' ? 'text-xs' : 'text-sm';

    const tooltipText = `${paxCount} ${paxCount === 1 ? 'person' : 'persons'} booked`;

    return (
        <Tooltip content={tooltipText} position="top">
            <div className={`flex items-center justify-center ${sizeClasses} bg-green-50 dark:bg-green-900/20 rounded-md border border-green-500 dark:border-green-500 shrink-0`}>
                <Users className={`${iconSize} text-green-500`} />
                <span className={`${textSize} font-black text-green-600 dark:text-green-400 tabular-nums`}>
                    {paxCount}
                </span>
            </div>
        </Tooltip>
    );
};

export default BadgePaxNumber;
