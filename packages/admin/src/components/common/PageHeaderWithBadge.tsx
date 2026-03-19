import React from 'react';
import Badge from '../ui/badge/Badge';
import { cn } from '@thaiakha/shared/lib/utils';

export interface PageHeaderWithBadgeProps {
  badge?: string;
  title: string;
  titleHighlight?: string;
  description?: string;
  alignment?: 'left' | 'center' | 'right';
  className?: string;
}

const ALIGN_MAP: Record<string, string> = {
  left: 'items-start text-left',
  center: 'items-center text-center',
  right: 'items-end text-right'
};

const PageHeaderWithBadge: React.FC<PageHeaderWithBadgeProps> = ({
  badge,
  title,
  titleHighlight,
  description,
  alignment = 'left',
  className
}) => {
  const alignClasses = ALIGN_MAP[alignment] || ALIGN_MAP.left;

  return (
    <div className={cn('flex flex-col space-y-2 mb-12', alignClasses, className)}>
      {badge && (
        <Badge variant="light" color="primary" className="font-black uppercase tracking-widest">
          {badge}
        </Badge>
      )}

      <h2 className="text-4xl font-black uppercase italic tracking-tighter text-gray-900 dark:text-white">
        {title} {titleHighlight && <span className="text-primary-600">{titleHighlight}</span>}
      </h2>

      {description && (
        <p className="text-gray-500 dark:text-gray-400 text-sm max-w-prose">
          {description}
        </p>
      )}
    </div>
  );
};

export default PageHeaderWithBadge;
