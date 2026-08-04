import React from 'react';
import { Icon, MediaImage } from '../ui';
import { cn } from '@thaiakha/shared/lib/utils';
import { GalleryItem } from './GalleryModal';
import { t } from '@thaiakha/shared/lib/ui-strings';

// ─── Variants ────────────────────────────────────────────────────────────────
// square  — 1:1  (default, usato in InfoClasses gallery grid)
// video   — 16:9 (usato in History magazine grid)
// vertical — 3:4  (usato per ritratti / cards verticali)

type PhotoVariant = 'square' | 'video' | 'vertical';

const ASPECT: Record<PhotoVariant, string> = {
  square:   'aspect-square',
  video:    'aspect-video',
  vertical: 'aspect-[3/4]',
};

// ─── Props ───────────────────────────────────────────────────────────────────

interface PhotoProps {
  item: GalleryItem;
  onClick: (item: GalleryItem) => void;
  variant?: PhotoVariant;
  className?: string;
}

// ─── Component ───────────────────────────────────────────────────────────────

export const Photo: React.FC<PhotoProps> = ({
  item,
  onClick,
  variant = 'square',
  className,
}) => (
  <div
    onClick={() => onClick(item)}
    className={cn(
      'group relative overflow-hidden rounded-[2rem] border border-white/10',
      'cursor-pointer shadow-theme-lg isolate',
      'hover:-translate-y-1 transition-all duration-500',
      ASPECT[variant],
      className,
    )}
  >
    <MediaImage
      assetId={item.asset_id}
      url={item.image_url}
      fallbackAlt={item.title || t.components.media.photoFallback}
      showCaption={false}
      imgClassName="absolute inset-0 w-full h-full object-cover transition-transform duration-[1.5s] group-hover:scale-110"
    />

    {/* Hover overlay */}
    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all duration-500 flex items-center justify-center">
      <div className="size-12 rounded-full bg-black/40 backdrop-blur-sm border border-white/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 scale-90 group-hover:scale-100">
        <Icon name="zoom_in" className="text-white" size="md" />
      </div>
    </div>
  </div>
);

export default Photo;
