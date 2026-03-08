import React from 'react';
import { cn } from '../../lib/utils';
import * as LucideIcons from 'lucide-react';
import Card from './Card';

interface StatCardProps {
    title: string;
    value: string | number;
    icon: string;
    color?: 'primary' | 'warning' | 'success' | 'action' | 'error';
    size?: 'sm' | 'md';
    className?: string;
}

const StatCard: React.FC<StatCardProps> = ({
    title,
    value,
    icon,
    color = 'primary',
    className
}) => {
    // Map string icon name to Lucide component
    const safeIcon = (typeof icon === 'string' && icon.length > 0) ? (icon.charAt(0).toUpperCase() + icon.slice(1)) : 'Activity';
    const IconComponent = (LucideIcons as any)[safeIcon] || LucideIcons.Activity;

    const colorStyles = {
        primary: {
            bg: 'bg-brand-500/10',
            icon: 'bg-brand-500 text-white',
            text: 'text-brand-500',
            border: 'border-brand-500/20'
        },
        warning: {
            bg: 'bg-warning-500/10',
            icon: 'bg-warning-500 text-white',
            text: 'text-warning-500',
            border: 'border-warning-500/20'
        },
        success: {
            bg: 'bg-success-500/10',
            icon: 'bg-success-500 text-white',
            text: 'text-success-500',
            border: 'border-success-500/20'
        },
        action: {
            bg: 'bg-blue-500/10',
            icon: 'bg-blue-500 text-white',
            text: 'text-blue-500',
            border: 'border-blue-500/20'
        },
        error: {
            bg: 'bg-error-500/10',
            icon: 'bg-error-500 text-white',
            text: 'text-error-500',
            border: 'border-error-500/20'
        }
    };

    const safeColor = (color && colorStyles[color]) ? color : 'primary';
    const currentStyles = colorStyles[safeColor];

    return (
        <Card className={cn(
            "rounded-3xl",
            className
        )}>
            <div className="flex justify-between items-start mb-4">
                <div className={cn(
                    "size-10 rounded-2xl flex items-center justify-center shadow-lg",
                    currentStyles.icon
                )}>
                    <IconComponent className="w-5 h-5" />
                </div>
            </div>
            <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 dark:text-gray-500 mb-1">{title}</p>
                <p className={cn(
                    "text-2xl font-black tracking-tighter font-mono",
                    "text-gray-900 dark:text-white"
                )}>{value}</p>
            </div>
        </Card>
    );
};

export default StatCard;
