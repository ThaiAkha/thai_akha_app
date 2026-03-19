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
  // Regex to detect if the name is an emoji
  const isEmoji = name && /\p{Extended_Pictographic}/u.test(name);
  
  const sizeStyles = {
    xs: 'w-3 h-3 text-[10px]',
    sm: 'w-4 h-4 text-xs',
    md: 'w-5 h-5 text-base',
    lg: 'w-6 h-6 text-xl',
    xl: 'w-8 h-8 text-2xl',
    '2xl': 'w-10 h-10 text-4xl',
  };

  const currentSizeClass = sizeStyles[size as keyof typeof sizeStyles] || 'w-5 h-5 text-base';

  if (isEmoji) {
    return (
      <span 
        className={cn(
          "inline-flex items-center justify-center leading-none select-none shrink-0",
          currentSizeClass.split(' ').find(c => c.startsWith('text-')),
          className
        )}
        role="img"
        aria-label="icon"
      >
        {name}
      </span>
    );
  }

  const IconComponent = getIcon(name);

  return (
    <IconComponent
      className={cn(
        currentSizeClass.split(' ').find(c => c.startsWith('w-')) + ' ' + currentSizeClass.split(' ').find(c => c.startsWith('h-')),
        className
      )}
      style={color ? { color } : undefined}
      strokeWidth={strokeWidth}
    />
  );
};

export default Icon;