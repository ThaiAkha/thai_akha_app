/**
 * Sidebar Divider Component
 * Simple visual separator for organizing sidebar sections.
 */

import React from 'react';

export interface DividerProps {
  /** Optional className for customization */
  className?: string;
}

const Divider: React.FC<DividerProps> = ({
  className = 'my-1'
}) => {
  return (
    <div
      className={`h-px bg-gray-100 dark:bg-gray-900 ${className}`}
      role="separator"
    />
  );
};

export default Divider;
