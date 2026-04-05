import React, { useState, useCallback } from 'react';
import { PageLayout, StickyTabNav } from '../components/layout';
import {
  Typography,
  Button,
  Icon,
  GalleryModal,
  AkhaLoader,
} from '../components/ui/index';
import { AkhaHistoryLine } from '../components/blog';
import { Photo, Gallery } from '../components/modal';
import { useMediaAsset } from '../hooks/useMediaAsset';
import { CultureSection } from '@thaiakha/shared/types';
import { GalleryItem } from '../components/modal/GalleryModal';
import { useAudioAsset } from '../hooks/useAudioAsset';
import { HeaderSinglePost, ContentRenderer, SiblingCard } from '../components/blog';
import { ArticleDetailSkeleton } from '../components/skeleton';
import { useCultureDetail } from '../hooks/useCultureDetail';
import { t } from '@thaiakha/shared/lib/ui-strings';

// ─── Types ──────────────────────────────────────────────────────────────────

interface TabItem {
  value: string;
  label: string;
  icon?: string;
}

interface HistoryPageSingleProps {
  slug: string;
  onBack: () => void;
  onOpen?: (slug: string) => void;
  sections?: CultureSection[];
  activeCategory?: string;
  onCategoryChange?: (cat: string) => void;
  tabItems?: TabItem[];
  returnTo?: 'history' | 'all' | string;
}

// ─── PhotoAsset ──────────────────────────────────────────────────────────────
// Risolve un assetId → GalleryItem e delega il render a <Photo variant="video">

const PhotoAsset: React.FC<{ 
  assetId: string; 
  onClick: (id: string) => void;
  onLoaded: (id: string, item: GalleryItem) => void;
}> = ({ assetId, onClick, onLoaded }) => {
  const { asset, loading } = useMediaAsset({ assetId });
  
  React.useEffect(() => {
    if (asset?.image_url) {
      onLoaded(assetId, {
        image_url: asset.image_url,
        title: asset.title ?? '',
        description: asset.caption ?? '',
        quote: '',
        asset_id: assetId,
      });
    }
  }, [asset, assetId, onLoaded]);

  if (loading) return (
    <div className="w-full aspect-video rounded-[2.5rem] bg-surface flex items-center justify-center border border-white/10 shadow-theme-lg">
      <AkhaLoader />
    </div>
  );
  if (!asset?.image_url) return null;

  const item: GalleryItem = {
    image_url: asset.image_url,
    title: asset.title ?? '',
    description: asset.caption ?? '',
    quote: '',
    asset_id: assetId,
  };
  return <Photo item={item} variant="video" onClick={() => onClick(assetId)} />;
};

// ─── HistoryPageSingle ───────────────────────────────────────────────────────

const HistoryPageSingle: React.FC<HistoryPageSingleProps> = ({
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
  const [fetchedAssets, setFetchedAssets] = useState<Record<string, GalleryItem>>({});

  const handleAssetLoaded = useCallback((id: string, item: GalleryItem) => {
    setFetchedAssets(prev => prev[id] ? prev : { ...prev, [id]: item });
  }, []);

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
      alert(t.common.copiedLink);
    }
  }, [section]);

  const handleSiblingOpen = useCallback((newSlug: string) => {
    if (onOpen) onOpen(newSlug);
  }, [onOpen]);

  // ─── Dynamic SEO injection ───────────────────────────────────────────────

  const SITE_URL = 'https://www.thaiakha.com';

  React.useEffect(() => {
    if (!section) return;

    const title = section.seo_title || section.title;
    const description = section.seo_description || section.subtitle || '';
    const image = section.og_image || section.primary_image || '';
    const url = `${SITE_URL}/history/${section.slug}`;

    document.title = `${title} | Thai Akha Kitchen`;

    const setMeta = (attr: string, key: string, value: string) => {
      let el = document.querySelector(`meta[${attr}="${key}"]`);
      if (!el) { el = document.createElement('meta'); el.setAttribute(attr, key); document.head.appendChild(el); }
      el.setAttribute('content', value);
    };

    setMeta('name', 'description', description);
    setMeta('property', 'og:title', title);
    setMeta('property', 'og:description', description);
    setMeta('property', 'og:image', image);
    setMeta('property', 'og:url', url);
    setMeta('property', 'og:type', 'article');

    let canonical = document.querySelector('link[rel="canonical"]');
    if (!canonical) { canonical = document.createElement('link'); canonical.setAttribute('rel', 'canonical'); document.head.appendChild(canonical); }
    canonical.setAttribute('href', url);

    // JSON-LD Article
    document.querySelector('script[data-article-ld]')?.remove();
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.setAttribute('data-article-ld', 'true');
    script.text = JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'Article',
      headline: title,
      description,
      image,
      url,
      author: { '@type': 'Person', name: section.author_name || 'Niti Muelaeku' },
      datePublished: section.published_at || undefined,
      dateModified: section.updated_at || undefined,
      publisher: { '@type': 'Organization', name: 'Thai Akha Kitchen', url: SITE_URL },
    });
    document.head.appendChild(script);

    return () => {
      document.querySelector('script[data-article-ld]')?.remove();
    };
  }, [section]);

  // Gallery processing: Map CultureGalleryItem -> GalleryItem (standardized for modals)
  const galleryModalItems: GalleryItem[] = galleryItems?.map(item => ({
    image_url: item.media_assets?.image_url || '',
    title: item.media_assets?.title ?? '',
    description: item.media_assets?.caption ?? '',
    quote: item.quote ?? '',
    asset_id: item.asset_id
  })) ?? [];

  const hasGallery = galleryModalItems.length > 0;
  
  // Filter out any potentially falsy or empty strings added by mistake in the DB array
  const validGalleryIds = section?.gallery_images?.filter(id => id && id.trim() !== '') ?? [];

  const topImages = validGalleryIds.slice(0, 2);
  const bottomImages = validGalleryIds.slice(2, 4);
  const extraImages = validGalleryIds.slice(4);

  // Unify all items for the mega GalleryModal
  const fullGalleryItems: GalleryItem[] = [
    ...validGalleryIds.map(id => fetchedAssets[id]).filter(Boolean),
    ...galleryModalItems
  ];

  const handleOpenUnifiedGallery = useCallback((startAssetId?: string) => {
    if (!startAssetId) {
      setGalleryStart(0);
      setGalleryOpen(true);
      return;
    }
    const idx = fullGalleryItems.findIndex(i => i.asset_id === startAssetId);
    setGalleryStart(Math.max(0, idx)); // fallback to 0 if not found precisely
    setGalleryOpen(true);
  }, [fullGalleryItems]);

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

        <div className="w-full max-w-6xl mx-auto [padding-inline:var(--space-fluid-m)] [padding-top:var(--space-fluid-l)] pb-32">
          {dataLoading && <ArticleDetailSkeleton />}

          {!dataLoading && (error || !section) && (
            <div className="flex flex-col items-center justify-center py-32 text-center [gap:var(--space-fluid-s)]">
              <Icon name="wifi_off" size="xl" className="text-primary/40" />
              <Typography variant="h5" color="sub">{t.history.chapterLoadError}</Typography>
              <Button variant="outline" size="sm" onClick={onBack} icon="arrow_back">{t.common.goBack}</Button>
            </div>
          )}

          {!dataLoading && section && (
            <article className="flex flex-col gap-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
              <HeaderSinglePost
                title={section.title}
                subtitle={section.subtitle ?? undefined}
                primaryImage={section.primary_image ?? undefined}
                audioAssetId={audioId}
                hasAudio={!!audioAsset}
                quote={section.quote ?? undefined}
                onShare={handleShare}
              />

              {topImages.length > 0 && (
                <div className="max-w-5xl mx-auto w-full grid grid-cols-2 [gap:var(--space-fluid-m)] pt-6">
                  {topImages.map((id) => <PhotoAsset key={id} assetId={id} onClick={handleOpenUnifiedGallery} onLoaded={handleAssetLoaded} />)}
                </div>
              )}

              {section.content && (
                <div className="max-w-3xl mx-auto w-full flex flex-col [gap:var(--space-fluid-l)] pb-6">
                  <ContentRenderer content={section.content} />
                </div>
              )}

              {(bottomImages.length > 0 || extraImages.length > 0) && (
                <div className="max-w-5xl mx-auto w-full flex flex-col [gap:var(--space-fluid-m)]">
                  {bottomImages.length > 0 && (
                    <div className="grid grid-cols-2 [gap:var(--space-fluid-m)]">
                      {bottomImages.map((id) => <PhotoAsset key={id} assetId={id} onClick={handleOpenUnifiedGallery} onLoaded={handleAssetLoaded} />)}
                    </div>
                  )}
                  {extraImages.length > 0 && (
                    <div className="grid grid-cols-2 [gap:var(--space-fluid-m)]">
                      {extraImages.map((id) => <PhotoAsset key={id} assetId={id} onClick={handleOpenUnifiedGallery} onLoaded={handleAssetLoaded} />)}
                    </div>
                  )}
                </div>
              )}

              {hasGallery && (
                <>
                  <AkhaHistoryLine />
                  <div className="flex flex-col [gap:var(--space-fluid-l)]">
                    <div className="flex items-center gap-4">
                      <div className="flex-1 h-px bg-border" />
                      <div className="flex items-center gap-2 text-action/60">
                        <Icon name="photo_library" size="sm" />
                        <Typography variant="caption" color="muted">
                          {t.history.galleryLabel({ count: galleryModalItems.length })}
                        </Typography>
                      </div>
                      <div className="flex-1 h-px bg-border" />
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
                      <Gallery
                        imageUrl={galleryModalItems[0]?.image_url || ''}
                        onClick={() => handleOpenUnifiedGallery(galleryModalItems[0]?.asset_id)}
                      />
                      {galleryModalItems.slice(1, 4).map((item, idx) => (
                        <Photo
                          key={item.asset_id || idx}
                          item={item}
                          onClick={() => handleOpenUnifiedGallery(item.asset_id)}
                        />
                      ))}
                    </div>

                    {galleryModalItems.length > 4 && (
                      <div className="flex justify-center pt-2">
                        <Button variant="mineral" size="md" icon="collections" iconPosition="left"
                          onClick={() => handleOpenUnifiedGallery(galleryModalItems[0]?.asset_id)}>
                          {t.history.openGallery}
                        </Button>
                      </div>
                    )}
                  </div>
                </>
              )}

              <AkhaHistoryLine />

              {(previous || next) && (
                <div className="flex flex-col [gap:var(--space-fluid-xs)]">
                  <Typography variant="microLabel" color="muted" className="text-center tracking-widest uppercase">
                    {t.history.otherChapters}
                  </Typography>
                  <div className="grid grid-cols-1 sm:grid-cols-2 [gap:var(--space-fluid-l)]">
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
                  {t.history.back}
                </Button>
              </div>
            </article>
          )}
        </div>
      </div>

      <GalleryModal
        isOpen={galleryOpen}
        onClose={() => setGalleryOpen(false)}
        items={fullGalleryItems}
        startIndex={galleryStart}
      />
    </PageLayout>
  );
};

export default HistoryPageSingle;
