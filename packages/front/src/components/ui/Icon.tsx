import React from 'react';
import { cn } from '../../lib/utils.ts';

export interface IconProps {
  name: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  color?: string;
  className?: string;
}

export const Icon: React.FC<IconProps> = ({ name, size = 'md', color, className }) => {
  const sizeStyles = {
    xs: 'text-xs',
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg',
    xl: 'text-xl',
    '2xl': 'text-2xl',
  };

  return (
    <span
      className={cn(
        'material-symbols-outlined',
        sizeStyles[size] || 'text-base',
        className
      )}
      style={color ? { color } : undefined}
    >
      {name}
    </span>
  );
};

export default Icon;