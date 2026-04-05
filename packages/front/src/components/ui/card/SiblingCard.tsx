import React from 'react';
import { Typography, Icon, MediaImage } from '../index';
import { cn } from '@thaiakha/shared/lib/utils';
import { HISTORY_UI } from '@thaiakha/shared/data';

// ─── Props ───────────────────────────────────────────────────────────────────

export interface SiblingItem {
  title: string;
  subtitle?: string | null;
  primary_image?: string | null;
  slug: string;
}

interface SiblingCardProps {
  section: SiblingItem;
  direction: 'prev' | 'next';
  onClick: () => void;
  /** Override label — default: HISTORY_UI.siblingNav.prev / .next */
  prevLabel?: string;
  nextLabel?: string;
}

// ─── Component ───────────────────────────────────────────────────────────────

export const SiblingCard: React.FC<SiblingCardProps> = ({
  section,
  direction,
  onClick,
  prevLabel = HISTORY_UI.siblingNav.prev,
  nextLabel = HISTORY_UI.siblingNav.next,
}) => (
  <button
    onClick={onClick}
    className={cn(
      'group w-full text-left rounded-3xl border border-border bg-surface',
      '[padding:var(--space-fluid-s)] flex [gap:var(--space-fluid-s)] items-center',
      'cursor-pointer',
      'hover:border-action/40 hover:bg-surface/80',
      'hover:shadow-action-glow',
      'transition-all duration-300',
      direction === 'next' && 'sm:flex-row-reverse sm:text-right',
    )}
  >
    {/* Thumbnail */}
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
          <Icon name="book-open" size="sm" className="text-muted" />
        </div>
      )}
    </div>

    {/* Labels */}
    <div className="flex flex-col [gap:var(--space-fluid-3xs)] min-w-0 flex-1">
      <Typography
        variant="microLabel"
        color="muted"
        className={cn(
          'flex items-center gap-2 [margin-bottom:var(--space-fluid-2xs)]',
          direction === 'next' && 'sm:ml-auto',
        )}
      >
        {direction === 'prev' && <Icon name="arrow-left" size="sm" />}
        <span>{direction === 'prev' ? prevLabel : nextLabel}</span>
        {direction === 'next' && <Icon name="arrow-right" size="sm" />}
      </Typography>

      <Typography
        variant="h6"
        color="title"
        className="line-clamp-1 leading-snug group-hover:text-action transition-colors duration-300 truncate"
      >
        {section.title}
      </Typography>

      {section.subtitle && (
        <Typography variant="paragraphS" color="sub" className="line-clamp-2">
          {section.subtitle}
        </Typography>
      )}
    </div>
  </button>
);

export default SiblingCard;
