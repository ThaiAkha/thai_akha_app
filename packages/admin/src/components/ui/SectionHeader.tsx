import React from 'react';
import { cn } from '@thaiakha/shared/lib/utils';

interface SectionHeaderProps {
    title: string;
    className?: string;
    variant?: 'sidebar' | 'inspector' | 'title' | 'default' | 'formfield';
}

const SectionHeader: React.FC<SectionHeaderProps> = ({
    title,
    className,
    variant = 'default'
}) => {
    return (
        <h6 className={cn(
            "font-black",
            variant === 'title' && "text-xs tracking-[0.1em] uppercase text-gray-800 dark:text-gray-200",
            variant === 'sidebar' && "text-[10px] tracking-[0.1em] uppercase text-gray-400 mb-3 ml-1",
            variant === 'inspector' && "text-xs tracking-[0.1em] uppercase text-gray-600 mb-1",
            variant === 'default' && "text-sm tracking-[0.1em] uppercase text-gray-600 dark:text-gray-400 mb-2",
            variant === 'formfield' && "text-sm text-gray-500 dark:text-gray-400 mb-1.5 font-bold normal-case tracking-normal",
            className
        )}>
            {title}
        </h6>
    );
};

export default SectionHeader;