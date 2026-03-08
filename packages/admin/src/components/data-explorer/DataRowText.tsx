import React from 'react';
import { cn } from '../../lib/utils';

interface DataRowTextProps {
    title?: React.ReactNode;
    description?: React.ReactNode;
    extra?: React.ReactNode;
    className?: string;
    layout?: 'vertical' | 'horizontal';
    titleClassName?: string;
    descriptionClassName?: string;
    extraClassName?: string;
}

const DataRowText: React.FC<DataRowTextProps> = ({
    title,
    description,
    extra,
    className,
    layout = 'vertical',
    titleClassName,
    descriptionClassName,
    extraClassName
}) => {
    return (
        <div className={cn(
            layout === 'vertical'
                ? "flex flex-col gap-1"
                : "flex flex-row items-baseline gap-2 flex-wrap",
            className
        )}>
            {title && (
                <p className={cn(
                    layout === 'vertical' ? "text-theme-sm" : "text-theme-xs",
                    "font-bold uppercase tracking-wide",
                    "text-gray-900 dark:text-gray-100",
                    "leading-tight line-clamp-1",
                    titleClassName
                )}>
                    {title}
                </p>
            )}
            {description && (
                <p className={cn(
                    layout === 'vertical' ? "text-theme-xs" : "text-theme-xs",
                    "font-medium",
                    "text-gray-800 dark:text-gray-400",
                    "line-clamp-1 leading-snug",
                    descriptionClassName
                )}>
                    {description}
                </p>
            )}
            {extra && (
                <p className={cn(
                    layout === 'vertical' ? "text-theme-xs" : "text-[10px]",
                    "font-semibold uppercase tracking-wider",
                    "text-gray-600 dark:text-gray-500",
                    "leading-none line-clamp-1",
                    extraClassName
                )}>
                    {extra}
                </p>
            )}
        </div>
    );
};

export default DataRowText;