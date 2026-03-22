import React from 'react';
import { cn } from '@thaiakha/shared/lib/utils';
import { useMediaAsset } from '../../hooks/useMediaAsset';

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
        'animate-pulse rounded-xl bg-gray-200 dark:bg-gray-800',
        className
      )}
    />
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
  const src = asset?.image_url ?? url ?? '';

  if (!assetId && !url) return null;

  return (
    <figure className={cn('block', className)}>
      {loading ? (
        <ImageSkeleton className={cn('w-full aspect-video', imgClassName)} />
      ) : (
        <img
          src={src}
          alt={asset?.alt_text ?? fallbackAlt}
          width={asset?.width ?? undefined}
          height={asset?.height ?? undefined}
          loading="lazy"
          decoding="async"
          className={cn('block w-full rounded-xl object-cover', imgClassName)}
          {...imgProps}
        />
      )}

      {showCaption && asset?.caption && !loading && (
        <figcaption className="mt-2 text-xs md:text-sm text-gray-500 dark:text-gray-400 font-medium italic">
          {asset.caption}
        </figcaption>
      )}
    </figure>
  );
};

export default MediaImage;
