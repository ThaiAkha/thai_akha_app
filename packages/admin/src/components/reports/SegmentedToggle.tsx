import React from 'react';
import { cn } from '@thaiakha/shared/lib/utils';

/**
 * Generic 2–3 option segmented switcher (pill group) used across report toolbars.
 * Replaces the inline copies in ManagerReports / MarketShop / KitchenBookings.
 */
export interface SegmentedOption<T extends string> {
    id: T;
    label: React.ReactNode;
    icon?: React.ReactNode;
}

interface SegmentedToggleProps<T extends string> {
    options: SegmentedOption<T>[];
    value: T;
    onChange: (id: T) => void;
    /** Visual size of the buttons. */
    size?: 'sm' | 'md';
    className?: string;
}

export function SegmentedToggle<T extends string>({ options, value, onChange, size = 'md', className }: SegmentedToggleProps<T>) {
    const h = size === 'sm' ? 'h-8 px-3' : 'h-9 px-4';
    return (
        <div className={cn('inline-flex bg-gray-100 dark:bg-gray-800 p-1 rounded-xl', className)}>
            {options.map(o => (
                <button
                    key={o.id}
                    onClick={() => onChange(o.id)}
                    className={cn(
                        'inline-flex items-center gap-1.5 rounded-lg text-sm font-bold uppercase tracking-wider transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500',
                        h,
                        value === o.id
                            ? 'bg-white dark:bg-gray-700 text-primary-600 dark:text-primary-400 shadow-sm'
                            : 'text-gray-500 hover:text-gray-900 dark:hover:text-gray-200',
                    )}
                >
                    {o.icon}{o.label}
                </button>
            ))}
        </div>
    );
}

export default SegmentedToggle;
