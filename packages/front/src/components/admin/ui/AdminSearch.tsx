import React from 'react';
import { cn } from '../../../lib/utils';
import { Icon } from '../../ui/index';

interface AdminSearchProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export const AdminSearch: React.FC<AdminSearchProps> = ({
  value,
  onChange,
  placeholder = "Search...",
  className
}) => {
  return (
    <div className={cn("relative group p-3 border-b border-border bg-black/5 dark:bg-white/5", className)}>
      <div className="absolute left-6 top-1/2 -translate-y-1/2 text-desc/40 group-focus-within:text-action transition-colors">
        <Icon name="search" size="sm" />
      </div>
      
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={cn(
          "w-full pl-10 pr-10 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider",
          "bg-white dark:bg-black/20 border border-border",
          "placeholder:text-desc/30 outline-none focus:border-action/50 transition-all"
        )}
      />

      {value && (
        <button
          onClick={() => onChange('')}
          className="absolute right-6 top-1/2 -translate-y-1/2 text-desc/30 hover:text-red-500 transition-colors"
        >
          <Icon name="close" size="xs" />
        </button>
      )}
    </div>
  );
};

export default AdminSearch;