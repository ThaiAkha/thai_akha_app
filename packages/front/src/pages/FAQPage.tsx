import React, { useState, useEffect, useMemo } from 'react';
import type { FaqCategoryUI } from '@thaiakha/shared';
import { getFaqData, getInfoPageMeta } from '../services/infoPages.service';
import { PageLayout, PageEssentials, InfoPageHero, SmartHeaderSection, SiblingInfoSection } from '../components/layout';
import { Typography, Icon, FaqBottomPage, AkhaPixelLine, FAQRichAnswer, GlassCard, MediaImage, FaqSearch } from '../components/ui';
import { CherryInlineChat, CherryIntroCard } from '../components/chat';
import { InfoPageSidebar } from '../components/layout/sidebar-info';
import LegalMetaBanner from '../components/legal/LegalMetaBanner';
import LegalFooterCard from '../components/legal/LegalFooterCard';
import { GalleryModal } from '../components/modal';
import type { GalleryItem } from '../components/modal';
import { InfoContentSkeleton } from '../components/skeleton';
import { usePageSection } from '../hooks/usePageSections';
import { t } from '../i18n';

// Header categoria: page_sections.section_id da faq_categories.section_id (DB-driven,
// nessuna mappa hardcoded — le categorie nuove si agganciano da sole).

/** Testo cercabile da una risposta HTML (i tag non devono entrare nel match). */
const stripHtml = (html: string): string => html.replace(/<[^>]*>/g, ' ');

/** Confronto tollerante: minuscole + accenti rimossi (NFD). */
const normalizeText = (value: string): string =>
  value.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim();

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

  // ── Ricerca & filtri (client-side sui ~65 hub già in memoria) ───────────────
  const [query, setQuery] = useState('');
  const [activeCats, setActiveCats] = useState<string[]>([]);
  // In ricerca le risposte sono aperte di default: qui teniamo quelle richiuse a mano.
  const [closedIds, setClosedIds] = useState<string[]>([]);

  const q = normalizeText(query);
  const searching = q.length > 0;

  // Numerazione STABILE: catNo/itemNo calcolati sui dati integrali, così "2.3"
  // resta "2.3" anche quando il filtro nasconde le voci intorno.
  const indexed = useMemo(
    () => faqData.map((cat, ci) => ({
      cat,
      catNo: ci + 1,
      items: cat.items.map((item, ii) => ({ item, itemNo: ii + 1, id: `${cat.id}-${ii}` })),
    })),
    [faqData],
  );

  // 1° passo: filtro per parola chiave (domanda + risposta, HTML strippato).
  const byQuery = useMemo(
    () => indexed.map(g => ({
      ...g,
      items: q
        ? g.items.filter(x => normalizeText(`${x.item.question} ${stripHtml(x.item.answer)}`).includes(q))
        : g.items,
    })),
    [indexed, q],
  );

  // Chip: mostrano quante FAQ restano per categoria con la ricerca corrente.
  const chipCategories = useMemo(
    () => byQuery
      .filter(g => g.items.length > 0 || activeCats.includes(g.cat.id))
      .map(g => ({ id: g.cat.id, label: g.cat.categoryTitle, count: g.items.length })),
    [byQuery, activeCats],
  );

  // 2° passo: filtro per categoria attiva (vuoto = tutte).
  const filtered = useMemo(
    () => byQuery.filter(g =>
      (activeCats.length === 0 || activeCats.includes(g.cat.id)) && g.items.length > 0,
    ),
    [byQuery, activeCats],
  );

  const totalCount = useMemo(() => faqData.reduce((n, c) => n + c.items.length, 0), [faqData]);
  const shownCount = useMemo(() => filtered.reduce((n, g) => n + g.items.length, 0), [filtered]);

  const handleQueryChange = (value: string) => {
    setQuery(value);
    setClosedIds([]);
  };
  const toggleCategory = (id: string) => {
    setActiveCats(prev => (prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]));
  };
  const resetFilters = () => {
    setQuery('');
    setActiveCats([]);
    setClosedIds([]);
  };

  // In ricerca: aperte di default (il match può stare nella risposta) → il click richiude.
  // Navigazione normale: accordion classico a singola apertura.
  const isItemOpen = (id: string) => (searching ? !closedIds.includes(id) : expandedId === id);
  const toggle = (id: string) => {
    if (searching) {
      setClosedIds(prev => (prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]));
      return;
    }
    setExpandedId(prev => (prev === id ? null : id));
  };

  // Table of Contents = categorie visibili (anchor = section_id DB, fallback category key)
  const toc = filtered.map(g => ({ id: g.cat.sectionId ?? g.cat.id, label: g.cat.categoryTitle }));

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

      <div className="flex flex-col [gap:var(--space-fluid-l)] w-full max-w-6xl mx-auto">
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

        {/* ── Ricerca + filtri categoria — comanda la colonna FAQ qui sotto ── */}
        {!loading && totalCount > 0 && (
          <FaqSearch
            query={query}
            onQueryChange={handleQueryChange}
            categories={chipCategories}
            activeCategories={activeCats}
            onToggleCategory={toggleCategory}
            onReset={resetFilters}
            shown={shownCount}
            total={totalCount}
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

          {/* Destra: accordion categorie — riempie la track (cap 4xl = standard lettura app, come i documenti legali del trio) */}
          <div className="flex flex-col [gap:var(--space-fluid-xl)] min-w-0 max-w-4xl">
          {loading ? (
            <InfoContentSkeleton blocks={6} />
          ) : (
          filtered.map((group, gIdx) => {
            const category = group.cat;
            const sectionId = category.sectionId ?? category.id;
            return (
              <React.Fragment key={category.id}>
                <section id={sectionId} className="flex flex-col [gap:var(--space-fluid-l)] scroll-mt-[var(--space-fluid-2xl)]">

                  {/* ── Category photo (click → gallery con tutte le foto) ── */}
                  {category.imageAssetId && (
                    <button
                      type="button"
                      onClick={() => openGallery(category.id)}
                      aria-label={t('components:gallery.openCategoryGallery', { name: category.categoryTitle })}
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
                        <Typography as="span" variant="caption" className="text-inverse">{t('components:gallery.chip')}</Typography>
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
                    {group.items.map(({ item, itemNo, id: itemId }) => {
                      const isOpen = isItemOpen(itemId);
                      const hasExtras = (item.links && item.links.length > 0) || Boolean(item.cta);

                      return (
                        <div
                          key={itemId}
                          className="rounded-2xl border border-border overflow-hidden bg-surface flex items-stretch"
                        >
                          {/* ── Number rail (come policy) — flush, sfumatura ocean, Roboto ── */}
                          {/* Numerazione gerarchica categoria.domanda (es. 1.1, 1.2, 2.1) */}
                          <div className="shrink-0 w-10 flex items-center justify-center bg-gradient-to-b from-ocean-blue/15 to-transparent">
                            <span className="font-accent font-bold text-base leading-none text-ocean-blue tabular-nums">{group.catNo}.{itemNo}</span>
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
                {gIdx < filtered.length - 1 && (
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

          {/* ── Nessun risultato — rimanda a Cherry, che è nel blocco qui sopra ── */}
          {!loading && filtered.length === 0 && totalCount > 0 && (
            <GlassCard variant="subtle" padding="l" radius="2rem" className="text-center flex flex-col items-center [gap:var(--space-fluid-s)]">
              <Icon name="search_off" size="lg" className="text-ocean-blue" />
              <Typography variant="h4" as="p" color="title" className="font-bold">
                {t('faq:noResultsTitle')}
              </Typography>
              <Typography variant="paragraphM" color="sub" className="leading-relaxed">
                {t('faq:noResultsBody')}
              </Typography>
              <button
                type="button"
                onClick={resetFilters}
                className="flex items-center [gap:var(--space-fluid-2xs)] min-h-11 text-ocean-blue hover:opacity-75 transition-opacity"
              >
                <Icon name="restart_alt" size="sm" />
                <Typography as="span" variant="caption" className="font-semibold">
                  {t('faq:filterReset')}
                </Typography>
              </button>
            </GlassCard>
          )}

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
