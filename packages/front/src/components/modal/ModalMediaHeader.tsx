import React from 'react';
import { cn } from '@thaiakha/shared/lib/utils';
import { Typography } from '../ui/index';
import { HeaderSection } from '../layout/HeaderSection';

interface ModalMediaHeaderProps {
  title?: string;
  highlight?: string;
  subtitle?: string;
  description?: string;
  counter?: string;
  className?: string;
}

/**
 * Shared header for all cinema modals (Photo, Video, Gallery).
 * Renders title + pixel divider + description via HeaderSection.
 */
const ModalMediaHeader: React.FC<ModalMediaHeaderProps> = ({
  title,
  highlight,
  subtitle,
  description,
  counter,
  className,
}) => {
  if (!title && !highlight && !subtitle && !description && !counter) return null;

  return (
    <div className={cn(
      "w-full text-center [margin-bottom:var(--space-fluid-m)] animate-in slide-in-from-top-4 duration-700",
      className
    )}>
      {counter && (
        <div className="flex items-center justify-center gap-4 opacity-70 [margin-bottom:var(--space-fluid-2xs)]">
          <div className="h-px w-8 md:w-16 bg-white/30" />
          <Typography variant="microLabel" className="text-action tracking-[0.4em] font-black uppercase drop-shadow-md whitespace-nowrap">
            {counter}
          </Typography>
          <div className="h-px w-8 md:w-16 bg-white/30" />
        </div>
      )}

      {(title || highlight || subtitle || description) && (
        <HeaderSection
          title={title ?? ''}
          highlight={highlight}
          subtitle={subtitle || description}
          variant="history"
          align="center"
          hideTitle={!title && !highlight}
          hideSubtitle={!subtitle && !description}
          hideDivider={!title && !highlight}
          hideDescription
          hideTag
          className="text-white [&_*]:text-white [&_*]:drop-shadow-2xl"
        />
      )}
    </div>
  );
};

export default ModalMediaHeader;
