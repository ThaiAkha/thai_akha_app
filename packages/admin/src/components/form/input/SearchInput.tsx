import React from 'react';
import { Search, X } from 'lucide-react';
import { cn } from '../../../lib/utils';

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
    return (
        <div className={cn("relative group", containerClassName)}>
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-green-500 transition-colors" />
            <input
                type="text"
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                className={cn(
                    "w-full pl-10 pr-9 h-9 text-xs rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm focus:border-green-500 focus:ring-1 focus:ring-green-500 transition-all font-medium text-gray-700 dark:text-gray-200 outline-none",
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
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 flex items-center justify-center text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 transition-colors z-30 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
                    aria-label="Clear search"
                >
                    <X className="w-4 h-4" />
                </button>
            )}
        </div>
    );
};

export default SearchInput;
