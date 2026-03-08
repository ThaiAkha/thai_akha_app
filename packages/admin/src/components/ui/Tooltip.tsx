import React, { useState, ReactNode } from 'react';
import { cn } from '../../lib/utils';

interface TooltipProps {
    children: ReactNode;
    content: string;
    position?: 'top' | 'bottom' | 'left' | 'right';
    className?: string;
}

const Tooltip: React.FC<TooltipProps> = ({
    children,
    content,
    position = 'top',
    className
}) => {
    const [isVisible, setIsVisible] = useState(false);

    const positionClasses = {
        top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
        bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
        left: 'right-full top-1/2 -translate-y-1/2 mr-2',
        right: 'left-full top-1/2 -translate-y-1/2 ml-2'
    };

    const arrowClasses = {
        top: 'top-full left-1/2 -translate-x-1/2 -mt-1 border-t-gray-900',
        bottom: 'bottom-full left-1/2 -translate-x-1/2 -mb-1 border-b-gray-900',
        left: 'left-full top-1/2 -translate-y-1/2 -ml-1 border-l-gray-900',
        right: 'right-full top-1/2 -translate-y-1/2 -mr-1 border-r-gray-900'
    };

    return (
        <div
            className={cn("relative inline-block", className)}
            onMouseEnter={() => setIsVisible(true)}
            onMouseLeave={() => setIsVisible(false)}
        >
            {children}
            {isVisible && (
                <div className={cn(
                    "absolute z-[99999] whitespace-nowrap px-2 py-1 text-[10px] font-bold text-white bg-gray-900 rounded shadow-xl animate-in fade-in zoom-in duration-200",
                    positionClasses[position]
                )}>
                    {content}
                    <div className={cn(
                        "absolute border-4 border-transparent",
                        arrowClasses[position]
                    )} />
                </div>
            )}
        </div>
    );
};

export default Tooltip;
