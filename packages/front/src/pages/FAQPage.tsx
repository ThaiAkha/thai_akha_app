import React, { useState, useEffect } from 'react';
import type { FaqCategoryUI } from '@thaiakha/shared';
import { getFaqData, getInfoPageMeta } from '../services/infoPages.service';
import { PageLayout, PageEssentials, InfoPageHero, SmartHeaderSection, SiblingInfoSection } from '../components/layout';
import { Typography, Icon, FaqBottomPage, AkhaPixelLine, AkhaPixelPattern, FAQRichAnswer, GlassCard, MediaImage } from '../components/ui';
import { CherryInlineChat, CherryIntroCard } from '../components/chat';
import { InfoPageSidebar } from '../components/layout/sidebar-info';
import LegalMetaBanner from '../components/legal/LegalMetaBanner';
import LegalFooterCard from '../components/legal/LegalFooterCard';
import { GalleryModal } from '../components/modal';
import type { GalleryItem } from '../components/modal';
import { InfoContentSkeleton } from '../components/skeleton';
import { SkeletonBase } from '../components/skeleton/atoms';
import { usePageSection } from '../hooks/usePageSection';
import type { PageSectionData } from '../hooks/useHomePageSections';
import { t } from '@thaiakha/shared/lib/ui-strings';

// Header categoria: page_sections.section_id da faq_categories.section_id (DB-driven,
// nessuna mappa hardcoded — le categorie nuove si agganciano da sole).

interface FAQPageProps {
  onNavigate: (page: string, topic?: string, section?: string) => void;
}

const FAQPage: React.FC<FAQPageProps> = ({ onNavigate }) => {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [faqData, setFaqData] = useState<FaqCategoryUI[]>([]);
  const [meta, setMeta] = useState<{ version: string; effectiveDate: string; lastUpdated: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [galleryOpen, setGalleryOpen] = useState(false);
  const [galleryStart, setGalleryStart] = useState(0);
  // Card intro Cherry — riga page_sections 'universal_cherry' (shared)
  const { section: cherrySection, loading: cherryLoading } = usePageSection('universal_cherry');

  // Fonte DB: FAQ (faq_categories + faq_questions) + meta doc (info_pages 'faq').
  useEffect(() => {
    let cancelled = false;
    Promise.all([getFaqData(), getInfoPageMeta('cooking-class-faq-chiang-mai')]).then(([d, m]) => {
      if (!cancelled) { setFaqData(d); setMeta(m); setLoading(false); }
    });
    return () => { cancelled = true; };
  }, []);

  const toggle = (id: string) => {
    setExpandedId(prev => (prev === id ? null : id));
  };

  // Table of Contents = categorie FAQ (anchor = section_id DB, fallback category key)
  const toc = faqData.map(c => ({ id: c.sectionId ?? c.id, label: c.categoryTitle }));

  // Gallery = foto delle categorie che ne hanno una (image_asset_id). Il click su
  // una foto apre la modal esistente su TUTTE le foto, partendo da quella cliccata.
  const galleryCats = faqData.filter(c => c.imageAssetId);
  const galleryItems: GalleryItem[] = galleryCats.map(c => ({
    asset_id: c.imageAssetId,
    image_url: '',
    title: c.categoryTitle,
  }));
  const openGallery = (categoryId: string) => {
    const idx = galleryCats.findIndex(c => c.id === categoryId);
    if (idx < 0) return;
    setGalleryStart(idx);
    setGalleryOpen(true);
  };

  return (
    <PageLayout slug="cooking-class-faq-chiang-mai" showPatterns={false}>
      {/* SEO: driven entirely by SEOHead via site_metadata slug "cooking-class-faq-chiang-mai".
          No PageSEO — avoids duplicate JSON-LD injection. */}

      <div className="flex flex-col [gap:var(--space-fluid-l)] w-full max-w-5xl mx-auto">
        {/* ── PAGE HERO (divider tematizzato block_faq) ── */}
        <InfoPageHero
          slug="cooking-class-faq-chiang-mai"
          fallbackIcon="help_outline"
          dividerTheme="block_faq"
          gradientFrom="ocean-blue"
          gradientTo="deep-ocean"
        />

        {/* ── Cherry block — card intro (2/5) + chat inline (3/5) su lg ──
            Mobile/tablet (<lg): SOLO la card (la chat inline scompare; su mobile
            resta la ChatBox laterale). Desktop: 2 colonne, altezze allineate. */}
        <div className="w-full">
          <div className="grid grid-cols-1 lg:grid-cols-5 [gap:var(--space-fluid-m)] items-stretch">
            <div className="lg:col-span-2">
              <CherryIntroCard data={cherrySection} loading={cherryLoading} />
            </div>
            <div className="hidden lg:block lg:col-span-3">
              <CherryInlineChat onNavigate={onNavigate} />
            </div>
          </div>
        </div>

        {/* ── Flower divider tra hero e categorie ── */}
        <div className="w-full overflow-hidden">
          <AkhaPixelLine
            geometry="flower"
            length="medium"
            theme="block_faq"
            size={10}
            opacity={0.9}
            animate
          />
        </div>

        {/* Header meta (versione/date) — full-width, sopra la TOC, NON sticky */}
        {meta && (
          <LegalMetaBanner
            version={meta.version}
            effectiveDate={meta.effectiveDate}
            lastUpdated={meta.lastUpdated}
            accent="ocean"
          />
        )}

        {/* ── FAQ CATEGORIES — 2 colonne: sidenav sticky (lg) + accordion ── */}
        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,18rem)_1fr] [gap:var(--space-fluid-l)] items-start">
          {/* Sinistra: sidebar info-page modulare (Menu + TOC + CTA classi) — desktop-only, sticky */}
          <InfoPageSidebar
            currentSlug="cooking-class-faq-chiang-mai"
            onNavigate={onNavigate}
            toc={toc}
            numberedToc
            ctaCardId="sidebar-cta-classes"
            accent="ocean"
            className="hidden lg:flex lg:sticky lg:top-[var(--space-fluid-l)]"
          />

          {/* Destra: accordion categorie */}
          <div className="flex flex-col [gap:var(--space-fluid-xl)] min-w-0">
          {loading ? (
            <InfoContentSkeleton blocks={6} />
          ) : (
          faqData.map((category, catIndex) => {
            const sectionId = category.sectionId ?? category.id;
            return (
              <React.Fragment key={category.id}>
                <section id={sectionId} className="flex flex-col [gap:var(--space-fluid-l)] scroll-mt-[var(--space-fluid-2xl)]">

                  {/* ── Category photo (click → gallery con tutte le foto) ── */}
                  {category.imageAssetId && (
                    <button
                      type="button"
                      onClick={() => openGallery(category.id)}
                      aria-label={t.components.gallery.openCategoryGallery({ name: category.categoryTitle })}
                      className="group relative w-full aspect-[16/9] rounded-[2rem] overflow-hidden border border-ocean-blue/15 shadow-theme-md cursor-zoom-in focus-visible:shadow-focus-ring"
                    >
                      <MediaImage
                        assetId={category.imageAssetId}
                        showCaption={false}
                        fallbackAlt={category.categoryTitle}
                        imgClassName="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                      {/* Wash + chip zoom (accento ocean) */}
                      <span className="absolute inset-0 bg-gradient-to-t from-deep-ocean/40 via-transparent to-transparent pointer-events-none" />
                      <span className="absolute top-3 right-3 flex items-center [gap:var(--space-fluid-2xs)] rounded-full bg-black/40 backdrop-blur-md [padding-inline:var(--space-fluid-s)] [padding-block:var(--space-fluid-2xs)] text-inverse">
                        <Icon name="zoom_in" size="sm" />
                        <Typography as="span" variant="caption" className="text-inverse">{t.components.gallery.chip}</Typography>
                      </span>
                    </button>
                  )}

                  {/* ── Dynamic Category Header (DB-driven) ── */}
                  <SmartHeaderSection
                    sectionId={sectionId}
                    variant="section"
                    align="center"
                    gradientFrom="ocean-blue"
                    gradientTo="deep-ocean"
                    dividerTheme="block_faq"
                    fallbackTitle={category.categoryTitle}
                  />

                  {/* ── Accordion items ── */}
                  <div className="flex flex-col [gap:var(--space-fluid-xs)]">
                    {category.items.map((item, index) => {
                      const itemId = `${category.id}-${index}`;
                      const isOpen = expandedId === itemId;
                      const hasExtras = (item.links && item.links.length > 0) || Boolean(item.cta);

                      return (
                        <div
                          key={itemId}
                          className="rounded-2xl border border-border overflow-hidden bg-surface flex items-stretch"
                        >
                          {/* ── Number rail (come policy) — flush, sfumatura ocean, Roboto ── */}
                          {/* Numerazione gerarchica categoria.domanda (es. 1.1, 1.2, 2.1) */}
                          <div className="shrink-0 w-10 flex items-center justify-center bg-gradient-to-b from-ocean-blue/15 to-transparent">
                            <span className="font-accent font-bold text-base leading-none text-ocean-blue tabular-nums">{catIndex + 1}.{index + 1}</span>
                          </div>

                          {/* ── Colonna contenuto: header (button) + risposta ── */}
                          <div className="flex-1 min-w-0 flex flex-col">
                          <button
                            onClick={() => toggle(itemId)}
                            className="w-full text-left flex items-center justify-between [gap:var(--space-fluid-s)] [padding:var(--space-fluid-m)] hover:bg-ocean-blue/5 transition-colors"
                            aria-expanded={isOpen}
                          >
                            <div className="flex items-center [gap:var(--space-fluid-xs)] min-w-0">
                              <Typography variant="paragraphM" color="title" className={`font-semibold transition-colors ${isOpen ? '!text-ocean-blue' : ''}`}>
                                {item.question}
                              </Typography>
                            </div>
                            {/* Toggle: freccia azzurra; cerchio pulsante attorno = "ha link/CTA" */}
                            <div className={`relative shrink-0 flex items-center justify-center size-8 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}>
                              {hasExtras && !isOpen && (
                                <>
                                  <span className="absolute inset-0 rounded-full border-2 border-sky-blue/50" aria-hidden="true" />
                                  <span className="absolute inset-0 rounded-full border-2 border-sky-blue/60 animate-ping motion-reduce:hidden" aria-hidden="true" />
                                </>
                              )}
                              <Icon name="expand_more" size="sm" className="text-sky-blue" />
                            </div>
                          </button>

                          {isOpen && (
                            <div className="[padding-inline:var(--space-fluid-m)] [padding-bottom:var(--space-fluid-m)] border-t border-border">
                              <div className="[padding-top:var(--space-fluid-s)]">
                                <FAQRichAnswer item={item} onNavigate={onNavigate} />
                              </div>
                            </div>
                          )}
                          </div>{/* /content column */}
                        </div>
                      );
                    })}
                  </div>

                </section>
                {catIndex < faqData.length - 1 && (
                  <div className="w-full overflow-hidden">
                    <AkhaPixelLine
                      geometry="flower"
                      length="medium"
                      theme="block_faq"
                      size={10}
                      opacity={0.9}
                      animate
                    />
                  </div>
                )}
              </React.Fragment>
            );
          }))}

          {/* Footer — entità legale + copyright, a lato della sidebar (larghezza contenuto, non full-w) */}
          {!loading && <LegalFooterCard accent="ocean" />}
          </div>{/* /accordion column */}
        </div>{/* /grid sidenav+accordion */}

        <PageEssentials slug="cooking-class-faq-chiang-mai" accent="ocean" />

        <FaqBottomPage slug="cooking-class-faq-chiang-mai" onNavigate={onNavigate} />

        <SiblingInfoSection
          currentSlug="cooking-class-faq-chiang-mai"
          onNavigate={onNavigate}
          accent="ocean"
        />
      </div>

      {/* Gallery modal — tutte le foto categoria, parte da quella cliccata */}
      <GalleryModal
        isOpen={galleryOpen}
        onClose={() => setGalleryOpen(false)}
        items={galleryItems}
        startIndex={galleryStart}
      />
    </PageLayout>
  );
};

export default FAQPage;
