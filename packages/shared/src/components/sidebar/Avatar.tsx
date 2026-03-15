/**
 * Avatar Component for Sidebar
 * Displays user avatar with fallback initials.
 * Used in sidebar user profile section.
 */

import React from 'react';

export interface AvatarProps {
  /** Avatar image URL */
  src?: string;
  /** User name for fallback initials */
  name?: string;
  /** Avatar size - defaults to logo size (40px) */
  size?: 'sm' | 'md' | 'lg';
  /** Optional className for customization */
  className?: string;
}

const SIZE_CLASSES = {
  sm: 'w-8 h-8 text-xs',
  md: 'w-10 h-10 text-sm',
  lg: 'w-12 h-12 text-base',
};

/**
 * Get initials from user name
 */
function getInitials(name?: string): string {
  if (!name) return '?';
  return name
    .split(' ')
    .slice(0, 2)
    .map(part => part[0])
    .join('')
    .toUpperCase();
}

const Avatar: React.FC<AvatarProps> = ({
  src,
  name = 'User',
  size = 'md',
  className = '',
}) => {
  const sizeClass = SIZE_CLASSES[size];
  const initials = getInitials(name);

  return (
    <div
      className={`
        ${sizeClass} rounded-full flex items-center justify-center
        bg-gradient-to-br from-cherry-500 to-cherry-600 dark:from-cherry-600 dark:to-cherry-700
        text-white font-bold overflow-hidden flex-shrink-0 ${className}
      `}
    >
      {src ? (
        <img
          src={src}
          alt={name}
          className="w-full h-full object-cover"
        />
      ) : (
        <span>{initials}</span>
      )}
    </div>
  );
};

export default Avatar;
