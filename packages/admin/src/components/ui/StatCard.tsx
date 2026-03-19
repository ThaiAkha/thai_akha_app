import React from 'react';
import { cn } from '@thaiakha/shared/lib/utils';
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
            bg: 'bg-primary-500/10',
            icon: 'bg-primary-500 text-white',
            text: 'text-primary-500',
            border: 'border-primary-500/20'
        },
        warning: {
            bg: 'bg-sys-warning/10',
            icon: 'bg-sys-warning text-white',
            text: 'text-sys-warning',
            border: 'border-sys-warning/20'
        },
        success: {
            bg: 'bg-sys-success/10',
            icon: 'bg-sys-success text-white',
            text: 'text-sys-success',
            border: 'border-sys-success/20'
        },
        action: {
            bg: 'bg-blue-500/10',
            icon: 'bg-blue-500 text-white',
            text: 'text-blue-500',
            border: 'border-blue-500/20'
        },
        error: {
            bg: 'bg-sys-error/10',
            icon: 'bg-sys-error text-white',
            text: 'text-sys-error',
            border: 'border-sys-error/20'
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
