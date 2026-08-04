import React from 'react';
import { Link } from 'react-router'; /* Using react-router per the project's setup */
import { ArrowRight } from 'lucide-react';
import { getIcon, type IconName } from '@thaiakha/shared/lib/icons';
import { Heading, Paragraph } from '../typography';
import { cn } from '@thaiakha/shared/lib/utils';
import Card from '../ui/Card';
import { useFlash } from '../../hooks/useFlash';
import { FlashLayer } from '../ui/FlashLayer';

export interface DashboardNavCardProps {
    path: string;
    iconName?: string | IconName;
    label: string;
    description?: string;
    linkLabel?: string;
    className?: string; // Optional extra classes
}

const DashboardNavCard: React.FC<DashboardNavCardProps> = ({
    path,
    iconName,
    label,
    description,
    linkLabel,
    className
}) => {
    // Get icon from registry
    const IconComponent = getIcon(iconName);
    const { flashes, onMouseMove, onClick } = useFlash();

    return (
        <Link
            to={path}
            onMouseMove={onMouseMove}
            onClick={onClick}
            className="group focus-visible:outline-none rounded-2xl"
        >
            <Card className={cn(
                "relative isolate flex flex-col transition-all duration-300",
                "hover:shadow-xl hover:shadow-primary-500/5",
                "hover:-translate-y-1 overflow-hidden",
                "group-focus-visible:ring-2 group-focus-visible:ring-primary-500 group-focus-visible:ring-offset-2 group-focus-visible:ring-offset-white dark:group-focus-visible:ring-offset-gray-900",
                className
            )}>
            <FlashLayer flashes={flashes} />
            {/* Decorative Gradient Background */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

            {/* Icon Header (compact like BasicCard) */}
            <div className="w-10 h-10 rounded-lg bg-primary-50 dark:bg-primary-500/10 text-primary-500 flex items-center justify-center mb-6 transition-all duration-300 shadow-sm group-hover:scale-110 group-hover:bg-primary-500 group-hover:text-white shrink-0">
                <IconComponent className="w-5 h-5" />
            </div>

            {/* Content */}
            <div className="relative z-10 flex-1 flex flex-col">
                <Heading level="h3">
                    {label}
                </Heading>

                {description && (
                    <Paragraph size="base" color="secondary" className="mt-2">
                        {description}
                    </Paragraph>
                )}

                {/* Link Action */}
                {linkLabel && (
                    <div className="mt-auto pt-5 inline-flex items-center text-base font-bold uppercase tracking-wider text-primary-500 group-hover:text-primary-600 transition-colors">
                        {linkLabel}
                        <ArrowRight className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1" />
                    </div>
                )}
            </div>
            </Card>
        </Link>
    );
};

export default DashboardNavCard;
