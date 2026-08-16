import React, { useState } from 'react';
import { useMediaAsset } from '../../hooks/useMediaAsset';
import { ContentCategoryDB } from '@thaiakha/shared';
import { Typography, AudioPlayer, Button, AkhaPixelLine, AkhaThemedLine, AkhaQuote, MediaImage } from '../ui/index';
import { Photo, GalleryModal } from '../modal/index';
import type { GalleryItem } from '../modal/index';
import PhotoModal from '../modal/PhotoModal';
import { AskCherryButton } from '../chat/AskCherryButton';
import { cn } from '@thaiakha/shared/lib/utils';

interface RecipeCategoryProps {
  cat: ContentCategoryDB;
  activeDiet?: string;
  /** Immagini extra della categoria (cover delle ricette) → modal con carousel+thumbnail. */
  galleryItems?: GalleryItem[];
  className?: string;
}

/**
 * Applica dietary_variants alla categoria, stesso pattern di adaptRecipeToDiet:
 * il dietKey è "diet_<clean>" e l'override sovrascrive title e description se presenti.
 */
const adaptCategoryToDiet = (
  cat: ContentCategoryDB,
  activeDiet: string
): ContentCategoryDB => {
  if (!activeDiet || !cat.dietary_variants) return cat;
  const cleanDiet = activeDiet.replace('diet_', '').toLowerCase();
  const dietKey = `diet_${cleanDiet}`;
  const variant = cat.dietary_variants[dietKey];
  if (!variant) return cat;
  return {
    ...cat,
    ...(variant.title ? { title: variant.title } : {}),
    ...(variant.title_highlight ? { title_highlight: variant.title_highlight } : {}),
    ...(variant.description ? { description: variant.description } : {}),
    ...(variant.content_body ? { content_body: variant.content_body } : {}),
    ...(variant.ui_quote ? { ui_quote: variant.ui_quote } : {}),
    ...(variant.cherry_prompt ? { cherry_prompt: variant.cherry_prompt } : {}),
    ...(variant.cherry_response ? { cherry_response: variant.cherry_response } : {}),
  };
};

const RecipeCategory: React.FC<RecipeCategoryProps> = ({ cat, activeDiet = '', galleryItems, className }) => {
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  // Resolve cover_asset_id → URL so GalleryModal atmospheric background works
  const { asset: coverAsset } = useMediaAsset({ assetId: cat?.cover_asset_id || undefined });

  if (!cat) return null;

  const displayCat = adaptCategoryToDiet(cat, activeDiet);

  // Resolved image URL: prefer fetched asset, fallback to direct image_url
  const resolvedImageUrl = coverAsset?.image_url || displayCat.image_url || '';

  const coverItem: GalleryItem = {
    asset_id: displayCat.cover_asset_id || undefined,
    image_url: resolvedImageUrl,
    title: displayCat.title,
    title_highlight: displayCat.title_highlight || '',
    subtitle: displayCat.subtitle || '',
    description: displayCat.subtitle || ''
  };

  // Modal items: cover categoria + cover delle ricette (senza duplicare la cover).
  const modalItems: GalleryItem[] = [
    coverItem,
    ...(galleryItems ?? []).filter(
      g => g.image_url && g.image_url !== resolvedImageUrl,
    ),
  ].filter(g => g.image_url);

  return (
    <div className={cn("grid grid-cols-1 lg:grid-cols-12 [gap:var(--space-fluid-m)] lg:[gap:var(--space-fluid-xl)] items-start", className)}>
      
      {/* ── Colonna Sinistra (Media & AI) ── */}
      <div className="lg:col-span-5 flex flex-col [gap:var(--space-fluid-m)] relative lg:sticky lg:top-32">
        {/* Immagine copertina: usa cover_asset_id (da DB) con fallback a image_url */}
        <div className="w-full relative group">
          {displayCat.cover_asset_id ? (
            <div
              className="rounded-[2rem] overflow-hidden border border-border transition-all duration-500 group-hover:border-primary/30 shadow-lg cursor-zoom-in aspect-video"
              onClick={() => setIsGalleryOpen(true)}
            >
              <MediaImage
                assetId={displayCat.cover_asset_id}
                className="w-full h-full"
                imgClassName="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
            </div>
          ) : displayCat.image_url ? (
            <Photo
              item={coverItem}
              variant="video"
              onClick={() => setIsGalleryOpen(true)}
              className="rounded-[2rem] overflow-hidden border border-border transition-all duration-500 group-hover:border-primary/30 shadow-lg"
            />
          ) : (
            <div className="w-full aspect-video rounded-[2rem] bg-surface-2 border border-border/30" />
          )}
        </div>

        {/* Quote: sotto l'immagine — canonical AkhaQuote (Akha pixel line) */}
        {displayCat.ui_quote && (
          <div className="relative [padding-block:var(--space-fluid-2xs)]">
            <AkhaQuote variant="main" align="left">
              {displayCat.ui_quote}
            </AkhaQuote>
          </div>
        )}

        {/* Audio Player */}
        <div className="w-full">
          <AudioPlayer categoryId={displayCat.id} className="w-full shadow-md rounded-full bg-surface border border-border/50" />
        </div>

        {/* Ask Cherry Button (Smart Context) */}
        <div className="w-full [padding-top:var(--space-fluid-xs)]">
          <AskCherryButton
            variant="inline"
            context="recipe-category"
            data={displayCat}
            className="w-full justify-center shadow-lg"
          />
        </div>
      </div>

      {/* ── Colonna Destra (Content) ── */}
      <div className="lg:col-span-7 flex flex-col h-full">
        <div className="h-full [padding:var(--space-fluid-l)] md:[padding:var(--space-fluid-xl)] rounded-[2.5rem] bg-surface-2 border border-border/50 flex flex-col shadow-inner-sm">
          <div className="flex flex-col [gap:var(--space-fluid-s)]">

            {/* Title / Header Menu Style */}
            <div className="flex flex-col [gap:var(--space-fluid-s)] [margin-bottom:var(--space-fluid-m)]">
              <Typography variant="h2" className="text-title leading-tight">
                {displayCat.title}
                {displayCat.title_highlight && (
                  <span className="text-action italic ml-2">{displayCat.title_highlight}</span>
                )}
              </Typography>
              <AkhaPixelLine
                length="medium"
                size={5}
                opacity={0.9}
                className="justify-start !p-0"
              />
              {/* Subtitle — stile page section header */}
              {displayCat.subtitle && (
                <Typography variant="paragraphM" color="sub" className="uppercase tracking-widest font-semibold text-[0.75rem] opacity-80">
                  {displayCat.subtitle}
                </Typography>
              )}
            </div>

            {/* Description (Expandable 5-line clamp) */}
            {displayCat.description && (
              <div className="flex flex-col [gap:var(--space-fluid-s)]">
                <Typography
                  variant="paragraphL"
                  color="title"
                  className={cn(
                    "font-semibold leading-relaxed transition-all duration-300",
                    !isExpanded && "line-clamp-[7]"
                  )}
                >
                  {displayCat.description}
                </Typography>

                <div className="flex justify-start">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsExpanded(!isExpanded)}
                  >
                    {isExpanded ? 'Read Less' : 'Read More'}
                  </Button>
                </div>
              </div>
            )}

            {/* Footer: Content Body */}
            {displayCat.content_body && (
              <div className="flex flex-col [gap:var(--space-fluid-s)] [margin-top:var(--space-fluid-l)]">
                <AkhaPixelLine
                  length="medium"
                  size={5}
                  opacity={0.9}
                  className="justify-start !p-0"
                />
                <Typography variant="paragraphM" color="default" className="whitespace-pre-wrap leading-loose font-light">
                  {displayCat.content_body}
                </Typography>
              </div>
            )}

          </div>
        </div>
      </div>

      {/* Gallery categoria: cover + cover ricette → carousel con thumbnail (swipe mobile).
          Con una sola immagine resta il PhotoModal semplice (no frecce/thumbnail inutili). */}
      {modalItems.length > 1 ? (
        <GalleryModal
          isOpen={isGalleryOpen}
          onClose={() => setIsGalleryOpen(false)}
          items={modalItems}
          startIndex={0}
        />
      ) : (
        <PhotoModal
          isOpen={isGalleryOpen}
          onClose={() => setIsGalleryOpen(false)}
          image={resolvedImageUrl}
          assetId={displayCat.cover_asset_id || undefined}
          title={displayCat.title}
          description={displayCat.subtitle || ''}
        />
      )}
    </div>
  );
};

export default RecipeCategory;
