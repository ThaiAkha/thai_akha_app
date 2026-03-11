import React from 'react';
import { cn } from '@thaiakha/shared/lib/utils';

import SectionHeader from '../ui/SectionHeader';

export interface SidebarItem {
    id: string;
    label: string;
    icon?: React.ReactNode;
    badge?: React.ReactNode;
    badgeType?: 'default' | 'success' | 'warning' | 'error' | 'info' | 'outline';
    badgeValue?: string | number;
}

interface DataExplorerSidebarProps {
    title: string;
    titleIcon?: React.ReactNode;
    items: SidebarItem[];
    selectedId: string;
    onSelect: (id: string) => void;
    footer?: React.ReactNode;
}

// Componente Badge interno
const Badge: React.FC<{ type: string; value: string | number; isActive?: boolean }> = ({
    type,
    value,
    isActive
}) => {
    const baseStyles = "px-3 py-0.5 text-sm font-bold uppercase tracking-wider rounded-md transition-colors";

    const variants = {
        default: cn(
            "bg-gray-100 dark:bg-gray-800",
            "text-gray-700 dark:text-gray-300",
            isActive && "bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300"
        ),
        success: cn(
            "bg-success-50 dark:bg-success-500/20",
            "text-success-700 dark:text-success-400",
            isActive && "bg-success-100 dark:bg-success-500/30"
        ),
        warning: cn(
            "bg-warning-50 dark:bg-warning-500/20",
            "text-warning-700 dark:text-warning-400",
            isActive && "bg-warning-100 dark:bg-warning-500/30"
        ),
        error: cn(
            "bg-error-50 dark:bg-error-500/20",
            "text-error-700 dark:text-error-400",
            isActive && "bg-error-100 dark:bg-error-500/30"
        ),
        info: cn(
            "bg-blue-light-50 dark:bg-blue-light-500/20",
            "text-blue-light-700 dark:text-blue-light-400",
            isActive && "bg-blue-light-100 dark:bg-blue-light-500/30"
        ),
        outline: cn(
            "bg-transparent border",
            "border-gray-200 dark:border-gray-700",
            "text-gray-600 dark:text-gray-400",
            isActive && "border-orange-200 dark:border-orange-800 text-orange-600 dark:text-orange-400"
        ),
    };

    return (
        <span className={cn(baseStyles, variants[type as keyof typeof variants])}>
            {value}
        </span>
    );
};

const DataExplorerSidebar: React.FC<DataExplorerSidebarProps> = ({
    title,
    titleIcon,
    items,
    selectedId,
    onSelect,
    footer,
}) => {
    return (
        <div className="lg:col-span-2 flex flex-col bg-white dark:bg-[#0a0a0b] border-r border-gray-100 dark:border-white/[0.05] overflow-hidden">
            {/* Header */}
            <div className="h-16 px-4 border-b border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/50 flex items-center justify-between shrink-0 shadow-sm">
                <div className="flex items-center gap-2.5">
                    {titleIcon && (
                        <div className="p-1.5 rounded-lg bg-white dark:bg-white/[0.05] shadow-sm border border-gray-100 dark:border-white/[0.05] text-gray-600 dark:text-gray-400">
                            {React.isValidElement(titleIcon) ? React.cloneElement(titleIcon as React.ReactElement<any>, { size: 16 }) : titleIcon}
                        </div>
                    )}
                    <SectionHeader title={title} variant="title" />
                </div>
            </div>

            {/* Item List */}
            <div className="flex-1 overflow-y-auto p-3 space-y-3 no-scrollbar">
                {items.map((item) => {
                    const isActive = selectedId === item.id;
                    return (
                        <button
                            key={item.id}
                            onClick={() => onSelect(item.id)}
                            className={cn(
                                "w-full flex items-center gap-3 px-3 py-3 rounded-xl border transition-all text-left group relative",
                                isActive
                                    ? "bg-orange-500/10 border-orange-500/20"
                                    : "bg-transparent border-transparent hover:bg-orange-50 dark:hover:bg-orange-500/10"
                            )}
                        >
                            {/* Active Indicator Bar */}
                            {isActive && (
                                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-orange-500 rounded-r-full" />
                            )}

                            {item.icon && (
                                <div className={cn(
                                    "transition-transform group-hover:scale-110 duration-300",
                                    isActive ? "text-orange-500" : "text-gray-400 dark:text-gray-600 group-hover:text-orange-500"
                                )}>
                                    {React.isValidElement(item.icon) ? React.cloneElement(item.icon as React.ReactElement<any>, { size: 18 }) : item.icon}
                                </div>
                            )}

                            <span className={cn(
                                "text-base truncate tracking-tight transition-colors flex-1 text-left",
                                isActive
                                    ? "text-gray-800 dark:text-gray-100 font-medium"
                                    : "text-gray-600 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white"
                            )}>
                                {item.label}
                            </span>

                            {/* Badge personalizzato o generato */}
                            {item.badge && (
                                <div className="ml-2 flex items-center">
                                    {item.badge}
                                </div>
                            )}

                            {/* Badge tipizzato con valore */}
                            {item.badgeType && item.badgeValue && (
                                <div className="ml-2 flex items-center">
                                    <Badge
                                        type={item.badgeType}
                                        value={item.badgeValue}
                                        isActive={isActive}
                                    />
                                </div>
                            )}
                        </button>
                    );
                })}
            </div>

            {/* Footer */}
            {footer && (
                <div className="mt-auto shrink-0 border-t border-gray-100 dark:border-white/[0.05] bg-gray-50/30 dark:bg-white/[0.01]">
                    {footer}
                </div>
            )}
        </div>
    );
};

export default DataExplorerSidebar;