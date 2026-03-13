import React from 'react';
import { cn } from '@thaiakha/shared/lib/utils';
import { getIcon, type IconName } from '@thaiakha/shared/lib/icons';

export interface IconProps {
  name: string | IconName;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  color?: string;
  className?: string;
  strokeWidth?: number;
}

export const Icon: React.FC<IconProps> = ({ 
  name, 
  size = 'md', 
  color, 
  className,
  strokeWidth = 2
}) => {
  const IconComponent = getIcon(name);
  
  const sizeStyles = {
    xs: 'w-3 h-3',
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
    xl: 'w-8 h-8',
    '2xl': 'w-10 h-10',
  };

  return (
    <IconComponent
      className={cn(
        sizeStyles[size as keyof typeof sizeStyles] || 'w-5 h-5',
        className
      )}
      style={color ? { color } : undefined}
      strokeWidth={strokeWidth}
    />
  );
};

export default Icon;