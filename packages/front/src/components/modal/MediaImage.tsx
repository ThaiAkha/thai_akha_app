import React from 'react';
import { cn } from '@thaiakha/shared/lib/utils';
import { useMediaAsset } from '../../hooks/useMediaAsset';
import { Typography } from '../ui/index';
import AkhaLoader from '../divider/AkhaLoader';

// ─── Props ────────────────────────────────────────────────────────────────────

interface MediaImageProps extends Omit<React.ImgHTMLAttributes<HTMLImageElement>, 'src' | 'alt' | 'width' | 'height'> {
  /** Unique string identifier for the asset (e.g. 'class-01') */
  assetId?: string;
  /** Public image URL (legacy fallback) */
  url?: string;
  /**
   * Show the caption below the image.
   * Defaults to true.
   */
  showCaption?: boolean;
  /** Extra className applied to the <figure> wrapper */
  className?: string;
  /** Extra className applied to the <img> tag */
  imgClassName?: string;
  /** Fallback alt text */
  fallbackAlt?: string;
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function ImageSkeleton({ className }: { className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        'rounded-xl bg-surface-2 flex items-center justify-center overflow-hidden',
        className
      )}
    >
      <AkhaLoader variant="bloom" size={8} />
    </div>
  );
}

// ─── Component ───────────────────────────────────────────────────────────────

/**
 * SEO-safe, CLS-preventing image wrapper backed by `media_assets`.
 * Uses 'assetId' (string) for database lookup.
 */
export const MediaImage: React.FC<MediaImageProps> = ({
  assetId,
  url,
  showCaption = true,
  className,
  imgClassName,
  fallbackAlt = '',
  ...imgProps
}) => {
  const { asset, loading } = useMediaAsset({ assetId });

  // Resolve the src: fetched asset takes priority, url is fallback
  const src = asset?.image_url || url || null;

  if (!assetId && !src) return null;

  // Se abbiamo già un url diretto (da gallery_assets / culture_assets già risolti
  // lato servizio), usiamolo subito senza aspettare il secondo fetch di useMediaAsset.
  // Il secondo fetch serve solo per arricchire alt_text/caption.
  const showSkeleton = loading && !url;

  return (
    <figure className={cn('block', className)}>
      {showSkeleton ? (
        <ImageSkeleton className={cn('w-full aspect-video', imgClassName)} />
      ) : src ? (
        <img
          src={src}
          alt={asset?.alt_text ?? fallbackAlt}
          width={asset?.width ?? undefined}
          height={asset?.height ?? undefined}
          loading="lazy"
          decoding="async"
          className={cn('block w-full object-cover', imgClassName)}
          {...imgProps}
        />
      ) : (
        <ImageSkeleton className={cn('w-full aspect-video', imgClassName)} />
      )}

      {showCaption && asset?.caption && !loading && (
        <figcaption className="[margin-top:var(--space-fluid-2xs)]">
          <Typography variant="caption">{asset.caption}</Typography>
        </figcaption>
      )}
    </figure>
  );
};

export default MediaImage;
