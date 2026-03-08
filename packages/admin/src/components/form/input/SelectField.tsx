import { ChangeEvent, ReactNode, useState } from 'react';
import { cn } from '../../../lib/utils';
import SectionHeader from '../../ui/SectionHeader';
import { ChevronDown } from 'lucide-react';

interface SelectFieldProps {
    value: string;
    onChange: (e: ChangeEvent<HTMLSelectElement>) => void;
    disabled?: boolean;
    success?: boolean;
    error?: boolean;
    className?: string;
    children: ReactNode;
    label?: string;
    hint?: string;
}

const SelectField = ({
    value,
    onChange,
    disabled = false,
    success = false,
    error = false,
    className,
    children,
    label,
    hint
}: SelectFieldProps) => {
    const [isFocused, setIsFocused] = useState(false);

    const selectClasses = cn(
        "h-12 w-full rounded-xl border appearance-none px-4 shadow-theme-xs transition-all duration-300 outline-none ring-green-500/20",
        "text-base font-bold bg-white/50 dark:bg-gray-800/20 backdrop-blur-sm border-gray-200 dark:border-gray-700/50 text-gray-900 dark:text-white",
        !disabled && "hover:border-green-500/30 focus:border-green-500 focus:ring-4",
        disabled && "bg-gray-50/50 dark:bg-gray-800/40 border-gray-200 dark:border-gray-700/50 cursor-default opacity-100",
        !disabled && success && "border-green-500 focus:border-green-500 focus:ring-green-500/20 dark:border-green-500",
        !disabled && error && "border-red-500 focus:border-red-500 focus:ring-red-500/20 dark:border-red-500",
        "pr-12", // Spazio per l'icona a destra
        className
    );

    const iconColor = cn(
        "transition-colors",
        disabled && "text-gray-400 dark:text-gray-500",
        !disabled && error && "text-red-500",
        !disabled && success && "text-emerald-500",
        !disabled && !error && !success && isFocused && "text-green-500",
        !disabled && !error && !success && !isFocused && "text-gray-400 group-hover/select:text-green-500"
    );

    return (
        <div className="w-full space-y-1.5">
            {label && (
                <SectionHeader
                    title={label}
                    variant="formfield"
                />
            )}

            <div className="relative group/select">
                <select
                    value={value}
                    onChange={onChange}
                    disabled={disabled}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                    className={selectClasses}
                >
                    {children}
                </select>
                <div className={cn(
                    "absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none",
                    iconColor
                )}>
                    <ChevronDown size={20} />
                </div>
            </div>

            {hint && (
                <p className={cn(
                    "mt-1.5 text-[10px] font-black uppercase tracking-widest",
                    error ? "text-red-500" : success ? "text-emerald-500" : "text-gray-500"
                )}>
                    {hint}
                </p>
            )}
        </div>
    );
};

export default SelectField;