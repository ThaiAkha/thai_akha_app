import React from 'react';
import { Typography } from './Typography';
import { Icon } from './Icon';
import { cn } from '@thaiakha/shared/lib/utils';

interface SmartInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
    icon?: string;
    containerClassName?: string;
}

export const SmartInput: React.FC<SmartInputProps> = ({
    label,
    error,
    icon,
    className,
    containerClassName,
    id,
    ...props
}) => {
    return (
        <div className={cn("flex flex-col [gap:var(--space-fluid-2xs)] w-full group/input", containerClassName)}>
            {label && (
                <Typography variant="fieldLabel" as="label" htmlFor={id} className="[margin-left:var(--space-fluid-2xs)]">
                    {label}
                </Typography>
            )}
            <div className="relative group">
                {icon && (
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-muted group-focus-within:text-primary transition-colors">
                        <Icon name={icon} size="sm" />
                    </div>
                )}
                <input
                    id={id}
                    className={cn(
                        "w-full h-14 bg-surface-2 border-2 border-transparent rounded-[var(--radius-input)] transition-all outline-none",
                        "focus:border-primary/30 focus:bg-surface shadow-sm",
                        icon ? "pl-12 pr-4" : "px-4",
                        error && "border-red-500/50 bg-red-500/5",
                        className
                    )}
                    {...props}
                />
            </div>
            {error && (
                <Typography variant="caption" className="text-red-500 ml-1 animate-in fade-in slide-in-from-top-1">
                    {error}
                </Typography>
            )}
        </div>
    );
};