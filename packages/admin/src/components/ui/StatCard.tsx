import React from 'react';
import { cn } from '@thaiakha/shared/lib/utils';
import {
    Activity, User, Users, Hotel, Calendar, DollarSign, TrendingUp, TrendingDown,
    ShoppingCart, Truck, ChefHat, Package, Star, Clock, type LucideIcon,
} from 'lucide-react';
import Card from './Card';
import { Numeric } from '../typography';

// Mappa STATICA nome → icona (audit 2026-08, P7). Prima c'era `import * as LucideIcons`
// + accesso dinamico: annullava il tree-shaking e portava TUTTO lucide-react (~775 KB)
// nel chunk vendor-icons dell'admin. Le icone della StatCard sono un set piccolo:
// aggiungerne una qui costa una riga, non 750 KB.
const STAT_ICONS: Record<string, LucideIcon> = {
    Activity, User, Users, Hotel, Calendar, DollarSign, TrendingUp, TrendingDown,
    ShoppingCart, Truck, ChefHat, Package, Star, Clock,
};

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
    // Nome icona → componente (PascalCase tollerante: "user" → "User"); sconosciuta → Activity
    const safeIcon = (typeof icon === 'string' && icon.length > 0) ? (icon.charAt(0).toUpperCase() + icon.slice(1)) : 'Activity';
    const IconComponent: LucideIcon = STAT_ICONS[safeIcon] ?? Activity;

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
                <p className="text-xs font-black uppercase tracking-widest text-gray-400 dark:text-gray-500 mb-1">{title}</p>
                <Numeric variant="stat" className="block tracking-tighter text-gray-900 dark:text-white">{value}</Numeric>
            </div>
        </Card>
    );
};

export default StatCard;
