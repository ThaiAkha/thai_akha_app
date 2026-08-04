import React from 'react';
import { cn } from '@thaiakha/shared/lib/utils';

export type AkhaCardVariant = 'glass' | 'brand-glass' | 'outline' | 'flat' | 'surface';

interface AkhaCardProps extends React.HTMLAttributes<HTMLDivElement> {
    variant?: AkhaCardVariant;
    padding?: 'none' | 's' | 'm' | 'l' | 'xl';
    rounded?: 's' | 'm' | 'l' | 'xl' | 'full';
    hoverEffect?: boolean;
}

export const AkhaCard: React.FC<AkhaCardProps> = ({
    variant = 'surface',
    padding = 'm',
    rounded = 'l',
    hoverEffect = false,
    className,
    children,
    ...props
}) => {
    const variants: Record<AkhaCardVariant, string> = {
        'surface': 'bg-surface border border-border',
        'glass': 'bg-surface/70 backdrop-blur-xl border border-white/20 shadow-xl',
        'brand-glass': 'bg-primary/5 backdrop-blur-xl border border-primary/20 shadow-lg',
        'outline': 'bg-transparent border-2 border-border-2',
        'flat': 'bg-surface-2 border-none shadow-none',
    };

    const paddings: Record<string, string> = {
        none: 'p-0',
        s: '[padding:var(--space-fluid-s)]',
        m: '[padding:var(--space-fluid-m)]',
        l: '[padding:var(--space-fluid-l)]',
        xl: '[padding:var(--space-fluid-xl)]',
    };

    const radii: Record<string, string> = {
        s: 'rounded-[var(--radius-card-sm)]',
        m: 'rounded-[var(--radius-card-md)]',
        l: 'rounded-[var(--radius-card)]',
        xl: 'rounded-[var(--radius-card-full)]',
        full: 'rounded-full',
    };

    return (
        <div
            className={cn(
                variants[variant],
                paddings[padding],
                radii[rounded],
                hoverEffect && 'transition-all duration-300 hover:scale-[1.01] active:scale-[0.99]',
                className
            )}
            {...props}
        >
            {children}
        </div>
    );
};