/* eslint-disable react-refresh/only-export-components -- re-export di compatibilita' di parseContent/slugify per i consumer esistenti */
import React, { useState, useCallback } from 'react';
import { AkhaTheme } from '../divider/AkhaPixelPattern';
import GalleryModal, { GalleryItem } from '../modal/GalleryModal';
import { parseContent, slugify } from './contentRenderer/contentParser';
import { renderBlock, type BlockContext } from './contentRenderer/renderBlock';

// Parser/slugify ri-esportati (consumer esistenti importano da qui). Blocchi in ./contentRenderer (#16 split).
export { parseContent, slugify };

// ─── Block types ──────────────────────────────────────────────────────────────

// ─── Reward card item (used by reward_cards block) ───────────────────────────
interface ContentRendererProps {
  content: string;
  className?: string;
  theme?: AkhaTheme;
}

export const ContentRenderer: React.FC<ContentRendererProps> = ({ content, className, theme }) => {
  const blocks = parseContent(content);

  // Collect all photo assetIds in order
  const photoAssetIds = blocks.flatMap(b => {
    if (b.type === 'photo') return [b.assetId];
    if (b.type === 'photo_grid') return b.assetIds;
    return [];
  });

  // Resolved gallery items, keyed by assetId
  const [resolvedAssets, setResolvedAssets] = useState<Record<string, GalleryItem>>({});
  const [galleryOpen, setGalleryOpen] = useState(false);
  const [galleryStartIndex, setGalleryStartIndex] = useState(0);

  const handlePhotoLoaded = useCallback((assetId: string, item: GalleryItem) => {
    setResolvedAssets(prev => prev[assetId] ? prev : { ...prev, [assetId]: item });
  }, []);

  const handlePhotoClick = useCallback((assetId: string) => {
    const idx = photoAssetIds.indexOf(assetId);
    setGalleryStartIndex(Math.max(0, idx));
    setGalleryOpen(true);
  }, [photoAssetIds]);

  // Gallery items in block order
  const galleryItems = photoAssetIds
    .map(id => resolvedAssets[id])
    .filter((item): item is GalleryItem => !!item);

  // Find the first paragraph block index for bold styling
  const firstParaIndex = blocks.findIndex(b => b.type === 'paragraph');
  const isFirstParagraph = (i: number) => i === firstParaIndex;

  const ctx: BlockContext = {
    onPhotoClick: handlePhotoClick,
    onPhotoLoaded: handlePhotoLoaded,
    isFirstParagraph,
    theme,
  };

  return (
    <div className={className}>
      <div className="flex flex-col [gap:var(--space-fluid-l)]">
        {blocks.map((block, i) => renderBlock(block, i, ctx))}
      </div>

      {/* Shared GalleryModal for all photo blocks */}
      {galleryItems.length > 0 && (
        <GalleryModal
          isOpen={galleryOpen}
          onClose={() => setGalleryOpen(false)}
          items={galleryItems}
          startIndex={galleryStartIndex}
        />
      )}
    </div>
  );
};

export default ContentRenderer;
