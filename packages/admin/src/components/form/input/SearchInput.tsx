import React from 'react';
import { Search, X } from 'lucide-react';
import { cn } from '@thaiakha/shared/lib/utils';
import { useTranslation } from 'react-i18next';

interface SearchInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    onClear?: () => void;
    containerClassName?: string;
}

const SearchInput: React.FC<SearchInputProps> = ({
    value,
    onChange,
    onClear,
    placeholder = "Search...",
    className,
    containerClassName,
    ...props
}) => {
    const { t } = useTranslation('common');
    return (
        <div className={cn("relative group", containerClassName)}>
            {/* verde di fuoco, non uno stato: si accorda a focus:border-green-500 dell'input qui sotto */}
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-green-500 transition-colors" />
            <input
                type="text"
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                className={cn(
                    "w-full pl-10 pr-9 h-9 text-xs rounded-lg border border-gray-200 dark:border-gray-700 bg-surface shadow-sm focus:border-green-500 focus:ring-1 focus:ring-green-500 transition-all font-medium text-body outline-none",
                    className
                )}
                {...props}
            />
            {value && onClear && (
                <button
                    type="button"
                    onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        onClear();
                    }}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 flex items-center justify-center text-sub hover:text-body transition-colors z-30 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
                    aria-label={t('aria.clearSearch')}
                >
                    <X className="w-4 h-4" />
                </button>
            )}
        </div>
    );
};

export default SearchInput;
