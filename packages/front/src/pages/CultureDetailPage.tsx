import React, { useState, useEffect } from 'react';
import { PageLayout } from '../components/layout/PageLayout';
import { StickyTabNav } from '../components/layout';
import {
  Typography,
  Badge,
  Button,
  Icon,
  AkhaPixelLine,
  GalleryModal,
  MediaImage,
} from '../components/ui/index';
import { contentService } from '@thaiakha/shared/services';
import { CultureSectionDetail, CultureGalleryItem } from '@thaiakha/shared/types';
import { GalleryItem } from '../components/modal/GalleryModal';
import { cn } from '@thaiakha/shared/lib/utils';

// ─── Section icon map (slug → Material Symbol) ───────────────────────────────

const SECTION_ICONS: Record<string, string> = {
  'hill-tribes-overview': 'landscape',
  'historical-roots':     'history_edu',
  'akha-zang':            'menu_book',
  'traditional-dress':    'diamond',
  'swing-festival':       'celebration',
  'featured-recipes':     'restaurant_menu',
  'thai-akha-fusion':     'merge',
  'foragers-pantry':      'forest',
  'spirit-gate':          'temple_buddhist',
  'music-folklore':       'music_note',
  'coffee-culture':       'coffee',
  'communal-dining':      'groups',
  'religion-beliefs':     'self_improvement',
  'spice-philosophy':     'local_fire_department',
};

// ─── Content parser ───────────────────────────────────────────────────────────

type ContentBlock =
  | { type: 'paragraph'; text: string }
  | { type: 'bullets';   items: string[] };

function parseContent(raw: string): ContentBlock[] {
  const lines  = raw.split('\n');
  const blocks: ContentBlock[] = [];
  let para:    string[]        = [];
  let bullets: string[]        = [];

  const flushPara = () => {
    const t = para.join(' ').trim();
    if (t) blocks.push({ type: 'paragraph', text: t });
    para = [];
  };
  const flushBullets = () => {
    if (bullets.length) { blocks.push({ type: 'bullets', items: bullets }); bullets = []; }
  };

  for (const line of lines) {
    const t = line.trim();
    if (t.startsWith('•') || t.startsWith('–') || t.startsWith('-')) {
      flushPara();
      bullets.push(t.replace(/^[•–-]\s*/, ''));
    } else if (t === '') {
      if (bullets.length) flushBullets(); else flushPara();
    } else {
      if (bullets.length) flushBullets();
      para.push(t);
    }
  }
  flushBullets();
  flushPara();
  return blocks;
}

// ─── ContentRenderer ──────────────────────────────────────────────────────────

const ContentRenderer: React.FC<{ content: string }> = ({ content }) => {
  const blocks = parseContent(content);
  return (
    <div className="space-y-5">
      {blocks.map((block, i) => {
        if (block.type === 'paragraph') {
          return (
            <Typography key={i} variant="paragraphM" color="default" className="leading-loose">
              {block.text}
            </Typography>
          );
        }
        return (
          <ul key={i} className="space-y-3 pl-1">
            {block.items.map((item, j) => (
              <li key={j} className="flex items-start gap-3">
                <Icon name="chevron_right" size="sm" className="text-action shrink-0 mt-1 opacity-70" />
                <Typography variant="paragraphM" color="default" className="leading-relaxed">
                  {item}
                </Typography>
              </li>
            ))}
          </ul>
        );
      })}
    </div>
  );
};

// ─── Skeleton ─────────────────────────────────────────────────────────────────

const SkeletonDetail: React.FC = () => (
  <div className="animate-pulse space-y-10">
    <div className="w-full aspect-[21/9] rounded-[2rem] bg-border/40" />
    <div className="max-w-2xl mx-auto space-y-3">
      <div className="h-5 bg-border/40 rounded-full w-4/5 mx-auto" />
      <div className="h-5 bg-border/40 rounded-full w-3/5 mx-auto" />
    </div>
    <div className="max-w-3xl mx-auto space-y-4">
      {[100, 90, 95, 80, 85].map((w, i) => (
        <div key={i} className="h-4 bg-border/40 rounded-full" style={{ width: `${w}%` }} />
      ))}
    </div>
  </div>
);

// ─── GalleryCard ──────────────────────────────────────────────────────────────

interface GalleryCardProps {
  item: CultureGalleryItem;
  index: number;
  onClick: () => void;
}

const GalleryCard: React.FC<GalleryCardProps> = ({ item, index, onClick }) => {
  const media   = item.media_assets;
  const caption = media?.caption ?? media?.title ?? '';

  return (
    <article
      onClick={onClick}
      className={cn(
        'group relative overflow-hidden rounded-2xl border border-border bg-surface cursor-pointer',
        'transition-all duration-500 ease-out',
        'hover:-translate-y-1 hover:border-primary/30',
        'hover:shadow-[0_16px_40px_-8px_rgba(227,31,51,0.18)]',
      )}
    >
      <div className="relative aspect-[4/3] overflow-hidden">
        <div className="absolute inset-0 z-10 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center pointer-events-none">
          <Icon name="zoom_in" size="lg" className="text-white" />
        </div>

        {media?.image_url ? (
          <img
            src={media.image_url}
            alt={media.alt_text ?? caption}
            loading="lazy"
            decoding="async"
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          />
        ) : (
          <div className="w-full h-full bg-border/20 flex items-center justify-center">
            <Icon name="photo" size="xl" className="text-border" />
          </div>
        )}

        <div className="absolute top-2 right-2 z-20">
          <Typography variant="monoLabel" className="text-white/50 group-hover:text-white/80 transition-colors">
            {String(index + 1).padStart(2, '0')}
          </Typography>
        </div>
      </div>

      {(caption || item.quote) && (
        <div className="p-4 space-y-1">
          {caption && (
            <Typography variant="caption" color="sub" className="line-clamp-2 leading-snug">
              {caption}
            </Typography>
          )}
          {item.quote && (
            <Typography variant="microLabel" color="action" className="line-clamp-1 italic">
              "{item.quote}"
            </Typography>
          )}
        </div>
      )}
    </article>
  );
};

// ─── AssetImageCard — for gallery_images (array of asset_ids) ─────────────────

const AssetImageCard: React.FC<{ assetId: string; index: number; onClick: () => void }> = ({ assetId, index, onClick }) => (
  <article
    onClick={onClick}
    className={cn(
      'group relative overflow-hidden rounded-2xl border border-border bg-surface cursor-pointer aspect-[4/3]',
      'transition-all duration-500 ease-out',
      'hover:-translate-y-1 hover:border-primary/30',
      'hover:shadow-[0_16px_40px_-8px_rgba(227,31,51,0.18)]',
    )}
  >
    <div className="absolute inset-0 z-10 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center pointer-events-none">
      <Icon name="zoom_in" size="lg" className="text-white" />
    </div>
    <MediaImage
      assetId={assetId}
      showCaption={false}
      fallbackAlt={`Photo ${index + 1}`}
      className="absolute inset-0"
      imgClassName="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
    />
    <div className="absolute top-2 right-2 z-20">
      <Typography variant="monoLabel" className="text-white/50">
        {String(index + 1).padStart(2, '0')}
      </Typography>
    </div>
  </article>
);

// ─── CultureDetailPage ────────────────────────────────────────────────────────

interface TabItem {
  value: string;
  label: string;
  icon?: string;
}

interface CultureDetailPageProps {
  slug: string;
  onBack: () => void;
  activeCategory?: string;
  onCategoryChange?: (cat: string) => void;
  tabItems?: TabItem[];
}

const CultureDetailPage: React.FC<CultureDetailPageProps> = ({
  slug,
  onBack,
  activeCategory = 'all',
  onCategoryChange,
  tabItems = [],
}) => {
  const [section,      setSection]      = useState<CultureSectionDetail | null>(null);
  const [galleryItems, setGalleryItems] = useState<CultureGalleryItem[]>([]);
  const [loading,      setLoading]      = useState(true);
  const [error,        setError]        = useState(false);
  const [galleryOpen,  setGalleryOpen]  = useState(false);
  const [galleryStart, setGalleryStart] = useState(0);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        setLoading(true);
        setError(false);
        const detail = await contentService.getCultureSectionBySlug(slug);
        if (!mounted) return;
        if (!detail) { setError(true); return; }
        setSection(detail);
        // gallery_items join (if a matching gallery exists)
        const items = await contentService.getCultureGallery(slug);
        if (mounted) setGalleryItems(items);
      } catch (e) {
        console.error('CultureDetailPage load error', e);
        if (mounted) setError(true);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    load();
    return () => { mounted = false; };
  }, [slug]);

  const sectionIcon = SECTION_ICONS[slug] ?? 'auto_stories';
  const chapterNum  = section ? String(section.display_order + 1).padStart(2, '0') : '—';

  // Gallery items from gallery_items table
  const galleryModalItems: GalleryItem[] = galleryItems.map(item => ({
    image_url:   item.media_assets?.image_url ?? '',
    asset_id:    item.asset_id,
    title:       item.media_assets?.title ?? '',
    description: item.media_assets?.caption ?? '',
    quote:       item.quote,
    icons:       [],
    photo_id:    undefined,
  }));

  // gallery_images = asset_id strings stored directly on the section row
  const assetGallery = section?.gallery_images?.filter(Boolean) ?? [];

  const hasGallery = galleryItems.length > 0 || assetGallery.length > 0;

  const handleTabChange = (cat: string) => {
    if (onCategoryChange) onCategoryChange(cat);
    else onBack();
  };

  return (
    <PageLayout slug="history" hideDefaultHeader={true} showPatterns={true}>
      <div id="history-detail-content" className="w-full flex flex-col">

        {tabItems.length > 0 && (
          <StickyTabNav
            items={tabItems}
            value={activeCategory}
            onChange={handleTabChange}
          />
        )}

      <div className="w-full max-w-4xl mx-auto px-4 md:px-6 pb-32">

        {/* ── Back ──────────────────────────────────────────────────────── */}
        <div className="pt-2 pb-8">
          <Button variant="ghost" size="sm" icon="arrow_back" iconPosition="left" onClick={onBack}
            className="text-sub hover:text-title">
            All Chapters
          </Button>
        </div>

        {loading && <SkeletonDetail />}

        {!loading && error && (
          <div className="flex flex-col items-center justify-center py-32 text-center gap-4">
            <Icon name="wifi_off" size="xl" className="text-primary/40" />
            <Typography variant="h5" color="sub">Could not load this chapter</Typography>
            <Button variant="outline" size="sm" onClick={onBack} icon="arrow_back">Go back</Button>
          </div>
        )}

        {!loading && !error && section && (
          <article className="space-y-14 animate-in fade-in slide-in-from-bottom-4 duration-700">

            {/* ── Hero ──────────────────────────────────────────────────── */}
            <div className="relative w-full aspect-[21/9] overflow-hidden rounded-[2.5rem]">
              {/* gradient overlay — always present for text readability */}
              <div className="absolute inset-0 z-10 bg-gradient-to-t from-black/80 via-black/30 to-black/10" />

              {section.primary_image ? (
                <MediaImage
                  assetId={section.primary_image}
                  showCaption={false}
                  fallbackAlt={section.title}
                  className="absolute inset-0"
                  imgClassName="w-full h-full object-cover"
                />
              ) : (
                /* No-image placeholder: dark surface + giant faded icon */
                <div className="absolute inset-0 bg-surface flex items-center justify-center">
                  <Icon
                    name={sectionIcon}
                    size="xl"
                    className="opacity-[0.06] scale-[6] text-title pointer-events-none select-none"
                  />
                </div>
              )}

              {/* Overlaid text */}
              <div className="absolute inset-0 z-20 flex flex-col justify-end p-6 md:p-10 lg:p-14 gap-3">
                {/* Chapter number + icon */}
                <div className="flex items-center gap-3 mb-1">
                  <span className="font-mono text-white/40 text-sm tracking-[0.2em]">CH. {chapterNum}</span>
                  <Icon name={sectionIcon} size="sm" className="text-action/70" />
                  {section.featured && (
                    <Badge variant="mineral" className="text-primary border-primary/30 bg-black/50 backdrop-blur-sm text-[10px] tracking-widest">
                      Featured
                    </Badge>
                  )}
                </div>

                <Typography variant="display2" className="text-white leading-tight max-w-2xl drop-shadow-xl">
                  {section.title}
                </Typography>

                {section.subtitle && (
                  <Typography variant="paragraphM" className="text-white/65 max-w-xl">
                    {section.subtitle}
                  </Typography>
                )}
              </div>
            </div>

            {/* ── Quote ─────────────────────────────────────────────────── */}
            {section.quote && (
              <div className="max-w-2xl mx-auto">
                <blockquote className="border-l-4 border-primary pl-6 py-2">
                  <Typography variant="quote" color="primary" className="italic leading-relaxed">
                    "{section.quote}"
                  </Typography>
                </blockquote>
              </div>
            )}

            {section.quote && section.content && <AkhaPixelLine opacity={0.3} />}

            {/* ── Body ──────────────────────────────────────────────────── */}
            {section.content && (
              <div className="max-w-3xl mx-auto">
                <ContentRenderer content={section.content} />
              </div>
            )}

            {/* ── Gallery (gallery_items join) ───────────────────────────── */}
            {hasGallery && (
              <>
                <AkhaPixelLine opacity={0.25} />
                <div className="space-y-6">
                  <div className="flex items-center gap-4">
                    <div className="flex-1 h-px bg-border" />
                    <div className="flex items-center gap-2">
                      <Icon name="photo_library" size="sm" className="text-action/60" />
                      <Typography variant="monoLabel" color="muted">
                        Gallery · {galleryItems.length + assetGallery.length} photos
                      </Typography>
                    </div>
                    <div className="flex-1 h-px bg-border" />
                  </div>

                  {/* gallery_items (relational) */}
                  {galleryItems.length > 0 && (
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                      {galleryItems.map((item, i) => (
                        <GalleryCard key={item.id} item={item} index={i} onClick={() => { setGalleryStart(i); setGalleryOpen(true); }} />
                      ))}
                    </div>
                  )}

                  {/* gallery_images (asset_ids on the section row) */}
                  {assetGallery.length > 0 && (
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                      {assetGallery.map((assetId, i) => (
                        <AssetImageCard key={assetId} assetId={assetId} index={i} onClick={() => { setGalleryStart(i); setGalleryOpen(true); }} />
                      ))}
                    </div>
                  )}

                  {galleryItems.length > 1 && (
                    <div className="flex justify-center pt-2">
                      <Button variant="mineral" size="md" icon="collections" iconPosition="left" onClick={() => { setGalleryStart(0); setGalleryOpen(true); }}>
                        Open Full Gallery
                      </Button>
                    </div>
                  )}
                </div>
              </>
            )}

            <AkhaPixelLine opacity={0.15} />

            {/* ── Navigation footer ────────────────────────────────────── */}
            <div className="flex justify-center pb-4">
              <Button variant="outline" size="md" icon="arrow_back" iconPosition="left" onClick={onBack}>
                Back to All Chapters
              </Button>
            </div>

          </article>
        )}
      </div>{/* end max-w inner wrapper */}

      </div>{/* end flex col */}

      <GalleryModal
        isOpen={galleryOpen}
        onClose={() => setGalleryOpen(false)}
        items={galleryModalItems}
        startIndex={galleryStart}
      />
    </PageLayout>
  );
};

export default CultureDetailPage;
