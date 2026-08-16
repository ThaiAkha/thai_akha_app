import React from 'react';
import { Typography, Icon, MediaImage, RippleLink } from '../index';
import { cn } from '@thaiakha/shared/lib/utils';

// ─── Types ───────────────────────────────────────────────────────────────────

export interface SiblingPost {
  title: string;
  subtitle?: string | null;
  imageUrl?: string | null;
  href: string;
  slug: string;
}

// ─── Component ───────────────────────────────────────────────────────────────

interface SiblingCardPostProps {
  item: SiblingPost;
  direction: 'prev' | 'next';
  onClick: () => void;
}

export const SiblingCardPost: React.FC<SiblingCardPostProps> = ({
  item,
  direction,
  onClick,
}) => (
  <RippleLink
    href={item.href}
    onNavigate={onClick}
    className={cn(
      'group w-full text-left rounded-3xl border-2 border-border bg-surface',
      '[padding:var(--space-fluid-s)] flex [gap:var(--space-fluid-s)] items-stretch',
      'hover:border-action/40 hover:bg-surface/80 hover:shadow-action-glow',
      'transition-all duration-300',
      direction === 'next' && 'sm:flex-row-reverse',
    )}
  >
    {/* Thumbnail */}
    <div className="w-20 md:w-28 h-20 md:h-28 rounded-xl overflow-hidden shrink-0 bg-border/20 self-center">
      {item.imageUrl ? (
        <MediaImage
          url={item.imageUrl}
          showCaption={false}
          fallbackAlt={item.title}
          className="w-full h-full"
          imgClassName="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center">
          <Icon name="auto_stories" size="sm" className="text-muted" />
        </div>
      )}
    </div>

    {/* Text */}
    <div className={cn(
      'flex flex-col justify-center min-w-0 flex-1',
      direction === 'next' && 'sm:text-right',
    )}>
      <Typography
        variant="h5"
        as="p"
        color="title"
        className="line-clamp-1 leading-snug group-hover:text-action transition-colors duration-300"
      >
        {item.title}
      </Typography>

      {item.subtitle && (
        <>
          <div className={cn(
            'w-full h-[2px] rounded-full [margin-top:var(--space-fluid-2xs)] [margin-bottom:var(--space-fluid-2xs)]',
            direction === 'next'
              ? 'bg-gradient-to-r from-transparent via-action/30 to-action/60'
              : 'bg-gradient-to-r from-action/60 via-action/30 to-transparent'
          )} />
          <Typography
            variant="paragraphS"
            color="muted"
            className={cn('line-clamp-2 leading-snug w-full', direction === 'next' && 'sm:text-right')}
          >
            {item.subtitle}
          </Typography>
        </>
      )}
    </div>

    {/* Go icon */}
    <div className={cn(
      'shrink-0 self-start size-7 rounded-full bg-action flex items-center justify-center',
      'transition-all duration-300 group-hover:scale-110',
      'md:opacity-0 md:group-hover:opacity-100',
    )}>
      <Icon
        name={direction === 'prev' ? 'arrow_back' : 'arrow_forward'}
        size="xs"
        className="text-gray-900"
      />
    </div>
  </RippleLink>
);

export default SiblingCardPost;
