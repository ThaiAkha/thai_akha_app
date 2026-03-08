import React from 'react';
import Badge from '../ui/badge/Badge';
import { getIcon, type IconName } from '../../lib/iconRegistry';
import { cn } from '../../lib/utils';

export interface WelcomeHeroProps {
    badge?: string;
    titleMain: string;
    titleHighlight?: string;
    description?: string;
    imageUrl?: string;
    icon?: string | IconName;
    children?: React.ReactNode;
    className?: string; // Additional classes for the container
}

const WelcomeHero: React.FC<WelcomeHeroProps> = ({
    badge = 'Dashboard',
    titleMain,
    titleHighlight,
    description,
    imageUrl,
    icon = 'LayoutDashboard',
    children,
    className
}) => {
    const IconComponent = getIcon(icon);

    return (
        <div className={cn(
            "rounded-3xl border border-gray-200 bg-white p-8 dark:border-gray-800 dark:bg-gray-900 md:p-8 relative overflow-hidden shadow-sm mb-8 animate-in fade-in slide-in-from-bottom-4 duration-500",
            className
        )}>
            <div className="relative z-10 space-y-4 max-w-2xl">
                {badge && (
                    <Badge color="primary" className="px-6 py-1 text-sm font-bold uppercase tracking-widest drop-shadow-sm">
                        {badge}
                    </Badge>
                )}
                <h1 className="text-3xl md:text-5xl font-black uppercase tracking-tighter text-gray-900 dark:text-white leading-none">
                    {titleMain} {titleHighlight && <span className="text-brand-600 drop-shadow-sm">{titleHighlight}</span>}
                </h1>
                {description && (
                    <p className="text-lg font-medium text-gray-900 dark:text-gray-300 max-w-lg leading-relaxed">
                        {description}
                    </p>
                )}
                {/* Optional interactive actions (like New Booking button) */}
                {children && (
                    <div className="pt-2">
                        {children}
                    </div>
                )}
            </div>

            {/* Background Decorator (Image or Icon) */}
            {imageUrl ? (
                <div className="absolute inset-y-0 right-0 h-full pointer-events-none">
                    {/* Photo fixed to card height; right-aligned on all devices. Mobile shows image at 50% opacity. */}
                    <img
                        src={imageUrl}
                        alt=""
                        className="h-full w-auto max-w-none object-cover object-right opacity-50 md:opacity-100"
                    />
                </div>
            ) : (
                <div className="absolute top-0 right-0 p-12 opacity-[0.03] dark:opacity-10 pointer-events-none">
                    {IconComponent && <IconComponent className="w-64 h-64 text-brand-600" />}
                </div>
            )}
        </div>
    );
};

export default WelcomeHero;
