import React, { useState, useCallback } from 'react';
import { PageLayout, StickyTabNav } from '../components/layout';
import {
  Typography,
  Button,
  Icon,
  AkhaPixelLine,
  GalleryModal,
  PhotoModal,
} from '../components/ui/index';
import { Photo, Gallery } from '../components/modal';
import { CultureSection } from '@thaiakha/shared/types';
import { GalleryItem } from '../components/modal/GalleryModal';
import { useAudioAsset } from '../hooks/useAudioAsset';
import { HeaderSinglePost, ContentRenderer, SiblingCard } from '../components/blog';
import { ArticleDetailSkeleton } from '../components/skeleton';
import { useCultureDetail } from '../hooks/useCultureDetail';

// ─── Constants ──────────────────────────────────────────────────────────────

const SECTION_ICONS: Record<string, string> = {
  'hill-tribes-overview': 'landscape',
  'historical-roots': 'history_edu',
  'akha-zang': 'menu_book',
  'traditional-dress': 'diamond',
  'swing-festival': 'celebration',
  'featured-recipes': 'restaurant_menu',
  'thai-akha-fusion': 'merge',
  'foragers-pantry': 'forest',
  'spirit-gate': 'temple_buddhist',
  'music-folklore': 'music_note',
  'coffee-culture': 'coffee',
  'communal-dining': 'groups',
  'religion-beliefs': 'self_improvement',
  'spice-philosophy': 'local_fire_department',
};

// ─── Types ──────────────────────────────────────────────────────────────────

interface TabItem {
  value: string;
  label: string;
  icon?: string;
}

interface CultureDetailPageProps {
  slug: string;
  onBack: () => void;
  onOpen?: (slug: string) => void;
  sections?: CultureSection[];
  activeCategory?: string;
  onCategoryChange?: (cat: string) => void;
  tabItems?: TabItem[];
  returnTo?: 'history' | 'all' | string;
}

// ─── CultureDetailPage ───────────────────────────────────────────────────────

const CultureDetailPage: React.FC<CultureDetailPageProps> = ({
  slug,
  onBack,
  onOpen,
  sections = [],
  activeCategory = 'all',
  onCategoryChange,
  tabItems = [],
}) => {
  const { 
    section, 
    galleryItems, 
    previous, 
    next, 
    loading: dataLoading,
    error 
  } = useCultureDetail(slug, sections);
  
  const [galleryOpen, setGalleryOpen] = useState(false);
  const [galleryStart, setGalleryStart] = useState(0);
  const [selectedPhoto, setSelectedPhoto] = useState<GalleryItem | null>(null);

  // Audio assets
  const audioId = section?.audio_asset_id ?? undefined;
  const { asset: audioAsset } = useAudioAsset({ assetId: audioId });

  // Share logic
  const handleShare = useCallback(() => {
    if (navigator.share) {
      navigator.share({
        title: section?.title ?? 'Thai Akha',
        text: section?.subtitle ?? '',
        url: window.location.href,
      }).catch(console.error);
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Link copied to clipboard!');
    }
  }, [section]);

  const handleSiblingOpen = useCallback((newSlug: string) => {
    if (onOpen) onOpen(newSlug);
  }, [onOpen]);

  const sectionIcon = SECTION_ICONS[slug] || 'auto_stories';

  // Gallery processing: Map CultureGalleryItem -> GalleryItem (standardized for modals)
  const galleryModalItems: GalleryItem[] = galleryItems?.map(item => ({
    image_url: item.media_assets?.image_url || '',
    title: item.media_assets?.title ?? '',
    description: item.media_assets?.caption ?? '',
    quote: item.quote ?? '',
    asset_id: item.asset_id
  })) ?? [];

  const hasGallery = galleryModalItems.length > 0;

  return (
    <PageLayout
      slug={`history-${slug}`}
      showPatterns={true}
      hideDefaultHeader={true}
    >
      <div className="w-full flex flex-col">
        {onCategoryChange && (
          <StickyTabNav
            items={tabItems}
            value={activeCategory}
            onChange={onCategoryChange}
          />
        )}

        <div className="w-full max-w-6xl mx-auto px-4 md:px-6 pt-12 md:pt-12 pb-32">
          {dataLoading && <ArticleDetailSkeleton />}

          {!dataLoading && (error || !section) && (
            <div className="flex flex-col items-center justify-center py-32 text-center gap-4">
              <Icon name="wifi_off" size="xl" className="text-primary/40" />
              <Typography variant="h5" color="sub">Could not load this chapter</Typography>
              <Button variant="outline" size="sm" onClick={onBack} icon="arrow_back">Go back</Button>
            </div>
          )}

          {!dataLoading && section && (
            <article className="flex flex-col gap-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
              <HeaderSinglePost
                title={section.title}
                subtitle={section.subtitle ?? undefined}
                category={section.category ?? undefined}
                primaryImage={section.primary_image ?? undefined}
                sectionIcon={sectionIcon}
                audioAssetId={audioId}
                hasAudio={!!audioAsset}
                quote={section.quote ?? undefined}
                onShare={handleShare}
              />

              {section.content && (
                <div className="max-w-3xl mx-auto">
                  <ContentRenderer content={section.content} />
                </div>
              )}

              {hasGallery && (
                <>
                  <AkhaPixelLine opacity={0.8} />
                  <div className="space-y-8">
                    <div className="flex items-center gap-4">
                      <div className="flex-1 h-px bg-border" />
                      <div className="flex items-center gap-2 text-action/60">
                        <Icon name="photo_library" size="sm" />
                        <Typography variant="monoLabel" color="muted">
                          Gallery · {galleryModalItems.length} photos
                        </Typography>
                      </div>
                      <div className="flex-1 h-px bg-border" />
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
                      <Gallery
                        imageUrl={galleryModalItems[0]?.image_url || ''}
                        onClick={() => { setGalleryStart(0); setGalleryOpen(true); }}
                      />
                      {galleryModalItems.slice(1, 4).map((item, idx) => (
                        <Photo
                          key={item.asset_id || idx}
                          item={item}
                          onClick={setSelectedPhoto}
                        />
                      ))}
                    </div>

                    {galleryModalItems.length > 4 && (
                      <div className="flex justify-center pt-2">
                        <Button variant="mineral" size="md" icon="collections" iconPosition="left"
                          onClick={() => { setGalleryStart(0); setGalleryOpen(true); }}>
                          Open Full Gallery
                        </Button>
                      </div>
                    )}
                  </div>
                </>
              )}

              <AkhaPixelLine opacity={0.8} />

              {(previous || next) && (
                <div className="space-y-3">
                  <Typography variant="microLabel" color="muted" className="text-center tracking-widest uppercase">
                    Other Chapters
                  </Typography>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {previous && (
                      <SiblingCard
                        section={previous}
                        direction="prev"
                        onClick={() => handleSiblingOpen(previous.slug)}
                      />
                    )}
                    {next && (
                      <SiblingCard
                        section={next}
                        direction="next"
                        onClick={() => handleSiblingOpen(next.slug)}
                      />
                    )}
                  </div>
                </div>
              )}

              <div className="flex justify-center pt-8 pb-4">
                <Button variant="brand" size="md" icon="arrow_back" iconPosition="left" onClick={onBack}>
                  Back to All Chapters
                </Button>
              </div>
            </article>
          )}
        </div>
      </div>

      <GalleryModal
        isOpen={galleryOpen}
        onClose={() => setGalleryOpen(false)}
        items={galleryModalItems}
        startIndex={galleryStart}
      />

      {selectedPhoto && (
        <PhotoModal
          isOpen={!!selectedPhoto}
          onClose={() => setSelectedPhoto(null)}
          image={selectedPhoto.image_url}
          title={selectedPhoto.title}
          description={selectedPhoto.description}
          quote={selectedPhoto.quote}
        />
      )}
    </PageLayout>
  );
};

export default CultureDetailPage;
