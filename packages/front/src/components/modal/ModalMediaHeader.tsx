import React from 'react';
import { Typography } from '../ui/index';
import { cn } from '@thaiakha/shared/lib/utils';

interface ModalMediaHeaderProps {
  /** Main title — font-display, italic, large */
  title?: string;
  /** Subtitle / description below title */
  description?: string;
  /** Optional counter label, e.g. "1 / 4" — shown with decorative lines */
  counter?: string;
  className?: string;
}

/**
 * Shared header for all cinema modals (Photo, Video, Gallery).
 * Renders title + description OUTSIDE the media box.
 */
const ModalMediaHeader: React.FC<ModalMediaHeaderProps> = ({
  title,
  description,
  counter,
  className,
}) => {
  if (!title && !description && !counter) return null;

  return (
    <div className={cn(
      "w-full text-center space-y-3 mb-8 animate-in slide-in-from-top-4 duration-700",
      className
    )}>
      {counter && (
        <div className="flex items-center justify-center gap-4 opacity-70">
          <div className="h-px w-8 md:w-16 bg-white/30" />
          <span className="text-action text-[10px] md:text-[12px] tracking-[0.4em] font-black uppercase drop-shadow-md whitespace-nowrap">
            {counter}
          </span>
          <div className="h-px w-8 md:w-16 bg-white/30" />
        </div>
      )}

      {title && (
        <h3 className="text-2xl md:text-3xl lg:text-5xl font-display font-black italic uppercase tracking-tighter text-white drop-shadow-2xl leading-none py-1">
          {title}
        </h3>
      )}

      {description && (
        <Typography variant="paragraphM" className="text-white/70 max-w-2xl mx-auto drop-shadow-md">
          {description}
        </Typography>
      )}
    </div>
  );
};

export default ModalMediaHeader;
