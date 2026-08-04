import React from 'react';
import Badge from '../ui/badge/Badge';
import { Heading, Paragraph } from '../typography';
import { getIcon, type IconName } from '@thaiakha/shared/lib/icons';
import { cn } from '@thaiakha/shared/lib/utils';

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
                <Heading level="display" className="uppercase tracking-tighter !leading-none">
                    {titleMain} {titleHighlight && <span className="text-primary-600 dark:text-primary-400 drop-shadow-sm">{titleHighlight}</span>}
                </Heading>
                {description && (
                    <Paragraph size="lg" color="primary" className="font-medium max-w-lg">
                        {description}
                    </Paragraph>
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
                <div className="absolute inset-0 md:inset-y-0 md:left-auto md:right-0 h-full pointer-events-none">
                    {/* Mobile: image covers the whole card, heavily faded so the titles stay readable.
                        Desktop (md+): right-aligned, natural width, full opacity. */}
                    <img
                        src={imageUrl}
                        alt=""
                        className="h-full w-full object-cover object-right opacity-20 md:w-auto md:max-w-none md:opacity-100"
                    />
                </div>
            ) : (
                <div className="absolute top-0 right-0 p-12 opacity-[0.03] dark:opacity-10 pointer-events-none">
                    {IconComponent && <IconComponent className="w-64 h-64 text-primary-600" />}
                </div>
            )}
        </div>
    );
};

export default WelcomeHero;
