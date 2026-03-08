import React from 'react';
import { Icon } from './Icon.tsx';
import { Typography } from './Typography.tsx';
import { cn } from '../../lib/utils.ts';

export interface StatCardProps {
  icon: string;
  title: string;
  value: string | number;
  change?: string;
  trend?: 'up' | 'down' | 'neutral';
  description?: string;
  color?: 'primary' | 'secondary' | 'action' | 'success' | 'warning' | 'error' | 'info' | 'default' | 'quiz';
  className?: string;
  bordered?: boolean;
  shadow?: boolean;
  hoverable?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

const StatCard: React.FC<StatCardProps> = ({
  icon,
  title,
  value,
  change,
  trend = 'neutral',
  description,
  color = 'primary',
  className,
  bordered = true,
  shadow = true,
  hoverable = true,
  size = 'md',
}) => {
  const colorStyles = {
    primary: {
      icon: 'text-primary',
      bg: 'bg-primary/5',
      border: 'border-primary/20',
      text: 'text-primary',
    },
    secondary: {
      icon: 'text-secondary',
      bg: 'bg-secondary/5',
      border: 'border-secondary/20',
      text: 'text-secondary',
    },
    action: {
      icon: 'text-action',
      bg: 'bg-action/5',
      border: 'border-action/20',
      text: 'text-action',
    },
    success: {
      icon: 'text-green-500',
      bg: 'bg-green-500/5',
      border: 'border-green-500/20',
      text: 'text-green-500',
    },
    warning: {
      icon: 'text-yellow-500',
      bg: 'bg-yellow-500/5',
      border: 'border-yellow-500/20',
      text: 'text-yellow-500',
    },
    error: {
      icon: 'text-red-500',
      bg: 'bg-red-500/5',
      border: 'border-red-500/20',
      text: 'text-red-500',
    },
    info: {
      icon: 'text-blue-500',
      bg: 'bg-blue-500/5',
      border: 'border-blue-500/20',
      text: 'text-blue-500',
    },
    default: {
      icon: 'text-slate-400',
      bg: 'bg-slate-500/5',
      border: 'border-slate-500/20',
      text: 'text-slate-400',
    },
    quiz: {
      icon: 'text-quiz',
      bg: 'bg-quiz/5',
      border: 'border-quiz/20',
      text: 'text-quiz',
    },
  };

  const currentSize = {
    sm: { padding: 'p-4', iconSize: 'sm' as const, titleSize: 'accent' as const, valueSize: 'h6' as const },
    md: { padding: 'p-6', iconSize: 'md' as const, titleSize: 'h5' as const, valueSize: 'h5' as const },
    lg: { padding: 'p-8', iconSize: 'lg' as const, titleSize: 'h4' as const, valueSize: 'h4' as const },
  }[size];

  const currentColor = colorStyles[color] || colorStyles.primary;

  return (
    <div
      className={cn(
        'rounded-2xl transition-all duration-300',
        currentSize.padding,
        currentColor.bg,
        bordered && `border ${currentColor.border}`,
        shadow && 'shadow-md',
        hoverable && 'hover:shadow-lg hover:-translate-y-1 cursor-pointer',
        className
      )}
    >
      <div className="flex items-start justify-between mb-4">
        <div className={cn('p-3 rounded-xl bg-white/5')}>
          <Icon name={icon} className={currentColor.icon} size={currentSize.iconSize} />
        </div>
      </div>
      
      <div className="mb-1">
        <Typography variant={currentSize.valueSize} className="text-title">
          {value}
        </Typography>
      </div>
      
      <Typography variant={currentSize.titleSize} className={cn('font-semibold', currentColor.text)}>
        {title}
      </Typography>
    </div>
  );
};

export default StatCard;