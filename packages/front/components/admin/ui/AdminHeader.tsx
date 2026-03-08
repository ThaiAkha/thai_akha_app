import React from 'react';
import { cn } from '../../../lib/utils';
import { Typography, Icon, Badge } from '../../ui/index';

interface AdminHeaderProps {
  title: string;
  icon?: string;
  count?: number | string;
  actions?: React.ReactNode;
  className?: string;
}

export const AdminHeader: React.FC<AdminHeaderProps> = ({
  title,
  icon,
  count,
  actions,
  className
}) => {
  return (
    <div className={cn(
      "sticky top-0 z-30 flex items-center justify-between p-4 border-b border-border",
      "bg-surface/80 backdrop-blur-md",
      className
    )}>
      <div className="flex items-center gap-3">
        {icon && (
          <div className="size-8 rounded-lg bg-black/5 dark:bg-white/5 flex items-center justify-center text-desc/60">
            <Icon name={icon} size="sm" />
          </div>
        )}
        <div className="flex items-center gap-2">
          <Typography 
            variant="h6" 
            className="font-black uppercase tracking-[0.2em] text-title leading-none"
          >
            {title}
          </Typography>
          {count !== undefined && (
            <Badge variant="mineral" className="h-5 px-1.5 text-[9px] border-border/50">
              {count}
            </Badge>
          )}
        </div>
      </div>

      {actions && (
        <div className="flex items-center gap-2">
          {actions}
        </div>
      )}
    </div>
  );
};

export default AdminHeader;