import React from 'react';
import { Typography, Icon, MediaImage } from '../ui';
import { CultureSection } from '@thaiakha/shared/types';
import { cn } from '@thaiakha/shared/lib/utils';

interface SiblingCardProps {
  section: any;
  direction: 'prev' | 'next';
  label?: string;
  onClick: () => void;
}

/**
 * Navigation card for Previous/Next chapters at the end of a blog post.
 */
export const SiblingCard: React.FC<SiblingCardProps> = ({ section, direction, label, onClick }) => (
  <button
    onClick={onClick}
    className={cn(
      'group w-full text-left rounded-3xl border border-border bg-surface',
      '[padding:var(--space-fluid-s)] flex [gap:var(--space-fluid-s)] items-center',
      'cursor-pointer', // <-- Cursore a manina
      'hover:border-action/40 hover:bg-surface/80',
      'hover:shadow-action-glow',
      'transition-all duration-300',
      direction === 'next' && 'sm:flex-row-reverse sm:text-right',
    )}
  >
    {/* Thumbnail in 16:9 (aspect-video) */}
    <div className="w-20 md:w-28 h-20 md:h-28 rounded-xl overflow-hidden shrink-0 bg-border/20">
      {section.primary_image ? (
        <MediaImage
          assetId={section.primary_image}
          showCaption={false}
          fallbackAlt={section.title}
          className="w-full h-full"
          imgClassName="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center">
          <Icon name="auto_stories" size="sm" className="text-muted" />
        </div>
      )}
    </div>

    {/* Labels */}
    <div className="flex flex-col [gap:var(--space-fluid-3xs)] min-w-0 flex-1">
      <Typography
        variant="microLabel"
        color="muted"
        className={cn("flex items-center gap-2 [margin-bottom:var(--space-fluid-2xs)]", direction === 'next' && "sm:ml-auto")}
      >
        {direction === 'prev' && <Icon name="arrow_back" size="sm" />}
        <span>{label || (direction === 'prev' ? 'PREVIOUS' : 'NEXT')}</span>
        {direction === 'next' && <Icon name="arrow_forward" size="sm" />}
      </Typography>

      <Typography
        variant="h6"
        color="title"
        className="line-clamp-1 leading-snug group-hover:text-action transition-colors duration-300 truncate"
      >
        {section.title}
      </Typography>

      {section.subtitle && (
        <Typography
          variant="paragraphS"
          color="sub"
          className="line-clamp-2"
        >
          {section.subtitle}
        </Typography>
      )}
    </div>
  </button>
);

export default SiblingCard;
