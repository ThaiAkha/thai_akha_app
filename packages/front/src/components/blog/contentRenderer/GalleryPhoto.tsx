/**
 * ContentRenderer - foto di una photo grid: risolve l'asset, notifica il padre per la lightbox.
 * Estratto da ContentRenderer.tsx (#16 split monstre), DOM invariato.
 */
import React from 'react';
import { MediaImage } from '../../ui';
import AkhaQuote from '../../divider/AkhaQuote';
import type { AkhaTheme } from '../../divider/AkhaPixelPattern';
import type { GalleryItem } from '../../modal/GalleryModal';
import { useMediaAsset } from '../../../hooks/useMediaAsset';

interface GalleryPhotoProps {
  assetId: string;
  onOpen: (assetId: string) => void;
  onLoaded: (assetId: string, item: GalleryItem) => void;
  theme?: AkhaTheme;
}

export const GalleryPhoto: React.FC<GalleryPhotoProps> = ({ assetId, onOpen, onLoaded, theme }) => {
  const { asset } = useMediaAsset({ assetId });

  // Register asset in parent once resolved
  React.useEffect(() => {
    if (asset?.image_url) {
      onLoaded(assetId, {
        image_url: asset.image_url,
        asset_id: assetId,
        title: asset.title ?? undefined,
        description: asset.caption ?? undefined,
      });
    }
  }, [asset, assetId, onLoaded]);

  return (
    <div className="flex flex-col gap-3">
      <button
        onClick={() => onOpen(assetId)}
        className="w-full aspect-video rounded-[2rem] overflow-hidden cursor-zoom-in group relative shadow-lg"
        aria-label={asset?.alt_text ?? 'Open photo'}
      >
        <MediaImage
          assetId={assetId}
          className="w-full h-full"
          imgClassName="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          fallbackAlt=""
        />
      </button>

      {asset?.alt_text && (
        <div className="mt-1">
          <AkhaQuote
            variant="base"
            className="opacity-90"
            author={`© Thai Akha Kitchen ${new Date().getFullYear()}`}
            theme={theme}
          >
            {asset.alt_text}
          </AkhaQuote>
        </div>
      )}
    </div>
  );
};

// ─── Block renderer context
