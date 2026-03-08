import React from 'react';
import { cn } from '../../../lib/utils';
import { Typography, Icon } from '../../ui/index';

interface AdminListItemProps {
  title: string;
  subtitle?: string;
  // Fix: Added optional icon property to resolve type errors in AdminMarketShop.tsx kha
  icon?: string;
  status?: React.ReactNode;
  isActive?: boolean;
  onClick?: () => void;
  className?: string;
}

export const AdminListItem: React.FC<AdminListItemProps> = ({
  title,
  subtitle,
  icon,
  status,
  isActive,
  onClick,
  className
}) => {
  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full text-left p-4 transition-all border-b border-border/50 relative overflow-hidden",
        isActive 
          ? "bg-surface dark:bg-[#2a2a2a] border-l-4 border-l-action shadow-sm" 
          : "bg-transparent hover:bg-black/5 dark:hover:bg-white/5 border-l-4 border-l-transparent",
        className
      )}
    >
      <div className="flex justify-between items-start gap-4">
        {/* Fix: Render icon if provided to support the feature used in AdminMarketShop.tsx kha */}
        {icon && (
          <div className={cn(
            "size-10 rounded-xl flex items-center justify-center shrink-0 border transition-all duration-300",
            isActive 
              ? "bg-action/20 border-action/30 text-action shadow-sm" 
              : "bg-black/5 dark:bg-white/5 border-border dark:border-white/5 text-desc/40 group-hover:text-desc/60"
          )}>
            <Icon name={icon} size="md" />
          </div>
        )}
        <div className="flex-1 min-w-0">
          <Typography 
            variant="h6" 
            className={cn(
              "text-sm font-black uppercase tracking-tight truncate",
              isActive ? "text-action" : "text-title"
            )}
          >
            {title}
          </Typography>
          {subtitle && (
            <Typography variant="caption" className="text-[10px] text-desc/50 uppercase tracking-widest mt-1 truncate">
              {subtitle}
            </Typography>
          )}
        </div>
        
        {status && (
          <div className="shrink-0 flex items-center h-5">
            {status}
          </div>
        )}
      </div>
    </button>
  );
};

export default AdminListItem;