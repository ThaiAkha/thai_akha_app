import React, { useState, useEffect, useMemo } from 'react';
import { PageLayout } from '../components/layout/PageLayout';
import { StickyTabNav } from '../components/layout';
import {
  Typography,
  Badge,
  Button,
  Card,
  Icon,
  AkhaPixelLine,
  GalleryModal,
  MediaImage,
  AudioPlayer,
} from '../components/ui/index';
import { contentService } from '@thaiakha/shared/services';
import { CultureSectionDetail, CultureGalleryItem, CultureSection } from '@thaiakha/shared/types';
import { GalleryItem } from '../components/modal/GalleryModal';
import { cn } from '@thaiakha/shared/lib/utils';
import { useAudioAsset } from '../hooks/useAudioAsset';

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
    <div className="flex gap-3">
      <div className="h-9 w-28 bg-border/40 rounded-full" />
      <div className="h-9 w-24 bg-border/40 rounded-full" />
    </div>
    <div className="h-20 bg-border/20 rounded-2xl w-full" />
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

// ─── SiblingCard — Prev/Next chapter navigation card ─────────────────────────

interface SiblingCardProps {
  section: CultureSection;
  direction: 'prev' | 'next';
  onClick: () => void;
}

const SiblingCard: React.FC<SiblingCardProps> = ({ section, direction, onClick }) => (
  <button
    onClick={onClick}
    className={cn(
      'group w-full text-left rounded-2xl border border-border bg-surface',
      'p-4 flex gap-4 items-center',
      'hover:border-primary/40 hover:bg-surface/80',
      'hover:shadow-[0_8px_24px_-4px_rgba(227,31,51,0.15)]',
      'transition-all duration-300',
      direction === 'next' && 'sm:flex-row-reverse sm:text-right',
    )}
  >
    {/* Thumbnail */}
    <div className="w-16 h-14 md:w-20 md:h-16 rounded-xl overflow-hidden shrink-0 bg-border/20">
      {section.primary_image ? (
        <MediaImage
          assetId={section.primary_image}
          showCaption={false}
          fallbackAlt={section.title}
          className="w-full h-full"
          imgClassName="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center">
          <Icon name="auto_stories" size="sm" className="text-border" />
        </div>
      )}
    </div>

    {/* Labels */}
    <div className="flex flex-col gap-1 min-w-0">
      <Typography variant="microLabel" color="muted" className="flex items-center gap-1">
        {direction === 'prev' ? (
          <><span className="material-symbols-outlined text-xs">arrow_back</span> Precedente</>
        ) : (
          <>Successivo <span className="material-symbols-outlined text-xs">arrow_forward</span></>
        )}
      </Typography>
      <Typography
        variant="caption"
        color="title"
        className="line-clamp-2 leading-snug group-hover:text-primary transition-colors duration-300"
      >
        {section.title}
      </Typography>
      {section.category && (
        <Typography variant="microLabel" color="muted" className="opacity-60">
          {section.category}
        </Typography>
      )}
    </div>
  </button>
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
  onOpen?: (slug: string) => void;
  sections?: CultureSection[];
  activeCategory?: string;
  onCategoryChange?: (cat: string) => void;
  tabItems?: TabItem[];
  returnTo?: 'history' | 'all' | string; // breadcrumb: where to return to
}

const CultureDetailPage: React.FC<CultureDetailPageProps> = ({
  slug,
  onBack,
  onOpen,
  sections = [],
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
  const [copied,       setCopied]       = useState(false);

  // Check if audio exists — uses audio_asset_id from DB, no fallback needed
  const audioId = section?.audio_asset_id ?? undefined;
  const { asset: audioAsset } = useAudioAsset({ assetId: audioId });

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

  // ── Prev / Next siblings (same category, sorted by display_order) ──────────
  const siblings = useMemo(() => {
    if (!sections.length || !section) return { prev: null as CultureSection | null, next: null as CultureSection | null };
    const cat = section.category;
    const filtered = sections
      .filter(s => s.category === cat)
      .sort((a, b) => a.display_order - b.display_order);
    const idx = filtered.findIndex(s => s.slug === slug);
    return {
      prev: idx > 0 ? filtered[idx - 1] : null,
      next: idx < filtered.length - 1 ? filtered[idx + 1] : null,
    };
  }, [sections, section, slug]);

  // ── Share handlers ─────────────────────────────────────────────────────────
  const handleShare = async () => {
    if (!section) return;
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({
          title: section.title,
          text: section.quote || section.subtitle || '',
          url,
        });
      } catch { /* user cancelled */ }
    } else {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleCopyLink = async () => {
    await navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSiblingOpen = (siblingSlug: string) => {
    if (onOpen) onOpen(siblingSlug);
    else onBack();
  };

  const sectionIcon = SECTION_ICONS[slug] ?? 'auto_stories';
  const chapterNum  = section ? String(section.display_order + 1).padStart(2, '0') : '—';

  const galleryModalItems: GalleryItem[] = galleryItems.map(item => ({
    image_url:   item.media_assets?.image_url ?? '',
    asset_id:    item.asset_id,
    title:       item.media_assets?.title ?? '',
    description: item.media_assets?.caption ?? '',
    quote:       item.quote,
    icons:       [],
    photo_id:    undefined,
  }));

  const assetGallery = section?.gallery_images?.filter(Boolean) ?? [];
  const hasGallery   = galleryItems.length > 0 || assetGallery.length > 0;

  const handleTabChange = (cat: string) => {
    if (onCategoryChange) onCategoryChange(cat);
    else onBack();
  };

  return (
    <PageLayout slug="history" hideDefaultHeader={true} showPatterns={true}>
      <div id="history-detail-content" className="w-full flex flex-col">

        {/* ── Sticky category tabs ──────────────────────────────────────── */}
        {tabItems.length > 0 && (
          <StickyTabNav
            items={tabItems}
            value={activeCategory}
            onChange={handleTabChange}
          />
        )}

        <div className="w-full max-w-4xl mx-auto px-4 md:px-6 pt-2 pb-32">

          {/* ── Back button ───────────────────────────────────────────────── */}
          <div className="pt-6 md:pt-8 pb-6">
            <Button variant="brand" size="sm" icon="arrow_back" iconPosition="left" onClick={onBack}>
              Back to All Chapters
            </Button>
          </div>

          {/* ── Loading ───────────────────────────────────────────────────── */}
          {loading && <SkeletonDetail />}

          {/* ── Error ─────────────────────────────────────────────────────── */}
          {!loading && error && (
            <div className="flex flex-col items-center justify-center py-32 text-center gap-4">
              <Icon name="wifi_off" size="xl" className="text-primary/40" />
              <Typography variant="h5" color="sub">Could not load this chapter</Typography>
              <Button variant="outline" size="sm" onClick={onBack} icon="arrow_back">Go back</Button>
            </div>
          )}

          {/* ── Content ───────────────────────────────────────────────────── */}
          {!loading && !error && section && (
            <article className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">

              {/* 1. HERO ──────────────────────────────────────────────────── */}
              <div className="relative w-full aspect-[21/9] overflow-hidden rounded-[2.5rem]">
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
                  <div className="absolute inset-0 bg-surface flex items-center justify-center">
                    <Icon
                      name={sectionIcon}
                      size="xl"
                      className="opacity-[0.06] scale-[6] text-title pointer-events-none select-none"
                    />
                  </div>
                )}

                {/* Overlay content */}
                <div className="absolute inset-0 z-20 flex flex-col justify-end p-6 md:p-10 lg:p-14 gap-3">
                  {/* Top row: category badge only */}
                  {section.category && (
                    <div className="flex items-center gap-2">
                      <Badge variant="mineral" className="text-white/70 border-white/20 bg-black/40 backdrop-blur-sm text-[10px] tracking-widest">
                        {section.category}
                      </Badge>
                    </div>
                  )}

                  {/* Title */}
                  <Typography variant="display2" className="text-white leading-tight max-w-2xl drop-shadow-xl">
                    {section.title}
                  </Typography>

                  {/* Subtitle */}
                  {section.subtitle && (
                    <Typography variant="paragraphM" className="text-white/65 max-w-xl">
                      {section.subtitle}
                    </Typography>
                  )}
                </div>
              </div>

              {/* 2. META ROW — share + copy link (centered, btn-s color) ─────────────────────────── */}
              <div className="flex justify-center items-center gap-4 mt-6">
                <Button
                  variant="brand"
                  size="sm"
                  icon="share"
                  onClick={handleShare}
                  className="text-white bg-btn-s hover:bg-btn-s/90"
                >
                  Condividi
                </Button>
                <Button
                  variant="brand"
                  size="sm"
                  icon={copied ? 'check_circle' : 'link'}
                  onClick={handleCopyLink}
                  className={`text-white ${copied ? 'bg-action hover:bg-action/90' : 'bg-btn-s hover:bg-btn-s/90'}`}
                >
                  {copied ? 'Copiato!' : 'Copia link'}
                </Button>
              </div>

              {/* 3. AUDIO PLAYER — only if audio_asset_id is set and asset found ── */}
              {audioAsset && audioId && (
                <div className="mt-6">
                  <AudioPlayer assetId={audioId} />
                </div>
              )}

              {/* 4. QUOTE ────────────────────────────────────────────────── */}
              {section.quote && (
                <div className="max-w-2xl mx-auto">
                  <blockquote className="border-l-4 border-primary pl-6 py-2">
                    <Typography variant="quote" color="primary" className="italic leading-relaxed">
                      "{section.quote}"
                    </Typography>
                  </blockquote>
                </div>
              )}

              {/* 5. DIVIDER ──────────────────────────────────────────────── */}
              <AkhaPixelLine opacity={0.3} />

              {/* 6. BODY ─────────────────────────────────────────────────── */}
              {section.content && (
                <div className="max-w-3xl mx-auto">
                  <ContentRenderer content={section.content} />
                </div>
              )}

              {/* 7. GALLERY ──────────────────────────────────────────────── */}
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

                    {galleryItems.length > 0 && (
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                        {galleryItems.map((item, i) => (
                          <GalleryCard key={item.id} item={item} index={i}
                            onClick={() => { setGalleryStart(i); setGalleryOpen(true); }} />
                        ))}
                      </div>
                    )}

                    {assetGallery.length > 0 && (
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                        {assetGallery.map((assetId, i) => (
                          <AssetImageCard key={assetId} assetId={assetId} index={i}
                            onClick={() => { setGalleryStart(i); setGalleryOpen(true); }} />
                        ))}
                      </div>
                    )}

                    {galleryItems.length > 1 && (
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

              {/* 8. PREV / NEXT NAVIGATION ───────────────────────────────── */}
              <AkhaPixelLine opacity={0.15} />

              {(siblings.prev || siblings.next) && (
                <div className="space-y-3">
                  <Typography variant="microLabel" color="muted" className="text-center tracking-widest">
                    ALTRI CAPITOLI
                  </Typography>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {siblings.prev && (
                      <SiblingCard
                        section={siblings.prev}
                        direction="prev"
                        onClick={() => handleSiblingOpen(siblings.prev!.slug)}
                      />
                    )}
                    {siblings.next && (
                      <SiblingCard
                        section={siblings.next}
                        direction="next"
                        onClick={() => handleSiblingOpen(siblings.next!.slug)}
                      />
                    )}
                  </div>
                </div>
              )}

              {/* 9. BACK BUTTON ──────────────────────────────────────────── */}
              <div className="flex justify-center pt-8 pb-4">
                <Button variant="brand" size="md" icon="arrow_back" iconPosition="left" onClick={onBack}>
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
