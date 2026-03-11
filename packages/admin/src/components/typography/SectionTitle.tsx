import React from 'react';
import { cn } from '@thaiakha/shared/lib/utils';

interface SectionTitleProps {
  children: React.ReactNode;
  className?: string;
}

/**
 * Standardized subsection title for Card sections and form groups
 * Used for section headers like "Pax Count", "Logistics & Notes", etc.
 */
const SectionTitle: React.FC<SectionTitleProps> = ({
  children,
  className,
}) => {
  return (
    <p
      className={cn(
        'text-xs font-black uppercase tracking-widest text-gray-800 dark:text-gray-400 mb-3',
        className
      )}
    >
      {children}
    </p>
  );
};

export default SectionTitle;
