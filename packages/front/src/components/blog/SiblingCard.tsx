import React from 'react';
import { Typography, Icon, MediaImage } from '../ui';
import { CultureSection } from '@thaiakha/shared/types';
import { cn } from '@thaiakha/shared/lib/utils';

interface SiblingCardProps {
  section: CultureSection;
  direction: 'prev' | 'next';
  onClick: () => void;
}

/**
 * Navigation card for Previous/Next chapters at the end of a blog post.
 */
export const SiblingCard: React.FC<SiblingCardProps> = ({ section, direction, onClick }) => (
  <button
    onClick={onClick}
    className={cn(
      'group w-full text-left rounded-2xl border border-border bg-surface',
      'p-4 flex gap-4 items-center',
      'hover:border-primary/40 hover:bg-surface/80',
      'hover:shadow-[0_8px_24px_-4px_rgba(227,31,51,0.15)]',
      'transition-all duration-300',
      direction === 'next' && 'sm:flex-row-reverse sm:text-right',
    )}
  >
    {/* Thumbnail */}
    <div className="w-20 h-16 md:w-28 md:h-24 rounded-xl overflow-hidden shrink-0 bg-border/20">
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
          <Icon name="auto_stories" size="sm" className="text-border" />
        </div>
      )}
    </div>

    {/* Labels */}
    <div className="flex flex-col gap-1 min-w-0 flex-1">
      <Typography variant="microLabel" color="muted" className="flex items-center gap-1 justify-start md:justify-start">
        {direction === 'prev' ? (
          <>
            <span className="material-symbols-outlined text-sm">arrow_back</span>
            <span>PREVIOUS</span>
          </>
        ) : (
          <div className="flex items-center gap-1 sm:ml-auto">
            <span>NEXT</span>
            <span className="material-symbols-outlined text-sm">arrow_forward</span>
          </div>
        )}
      </Typography>
      <Typography
        variant="caption"
        color="title"
        className="line-clamp-2 leading-snug group-hover:text-primary transition-colors duration-300"
      >
        {section.title}
      </Typography>
      {section.category && (
        <Typography variant="microLabel" color="muted" className="opacity-60">
          {section.category}
        </Typography>
      )}
    </div>
  </button>
);

export default SiblingCard;
