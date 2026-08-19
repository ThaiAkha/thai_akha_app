
import React from 'react';
import { PageLayout } from '../components/layout/PageLayout';
import { SmartHomeCard, StatCard, MediaImage, AkhaThemedLine, GlassCardFull, FaqBottomPage, ButtonVariant } from '../components/ui/index';
import { SiblingInfoSection } from '../components/layout';
import { SmartHeaderSection, ScrollEntrance } from '../components/layout/index';
import PageEssentials from '../components/layout/PageEssentials';
import { useFrontHomeCards } from '../hooks/useFrontHomeCards';
import { usePageSections, toStatCardColor, HOME_SECTION_IDS, HomeSectionId } from '../hooks/usePageSections';
import AudioPlayer from '../components/modal/AudioPlayer';
import { cn } from '@thaiakha/shared/lib/utils';
import { t } from '../i18n';
import { HomeGridSkeleton } from '../components/skeleton';

// ─── HomeGlassSection — deduplica pattern home_03/04 e home_05/06 ────────────
interface HomeGlassSectionProps {
  headerId: HomeSectionId;
  cardId: HomeSectionId;
  imageAssetId?: string;
  imageAlt?: string;
  imageHref?: string;
  buttonText?: string;
  buttonVariant?: ButtonVariant;
  glassVariant?: 'action' | 'secondary';
  imagePosition?: 'left' | 'right';
  gradientFrom?: string;
  gradientTo?: string;
  buttonSize?: 'xs' | 'sm' | 'md' | 'lg';
  onNavigate: (p: string, t?: string, s?: string) => void;
}

function HomeGlassSection({
  headerId,
  cardId,
  imageAssetId,
  imageAlt,
  imageHref,
  buttonText,
  buttonVariant = 'brand',
  glassVariant = 'action',
  imagePosition = 'left',
  gradientFrom = 'quiz-s',
  gradientTo = 'primary',
  buttonSize = 'sm',
  onNavigate,
}: HomeGlassSectionProps) {
  const { sections: pageSections, loading: sectionsLoading } = usePageSections(HOME_SECTION_IDS);

  return (
    <section className="flex flex-col [gap:var(--space-fluid-m)]">
      <div className="hidden md:block">
        <SmartHeaderSection
          sectionId={headerId}
          prefetchedData={pageSections[headerId]}
          loading={sectionsLoading}
          variant="hero2"
          align="center"
          gradientFrom={gradientFrom}
          gradientTo={gradientTo}
          hideSubtitle
        />
      </div>
      <GlassCardFull
        sectionId={cardId}
        prefetchedData={pageSections[cardId]}
        loading={sectionsLoading}
        imageAssetId={imageAssetId}
        imageAlt={imageAlt}
        imageHref={imageHref}
        buttonText={buttonText}
        buttonVariant={buttonVariant}
        buttonSize={buttonSize}
        onNavigate={onNavigate}
        imagePosition={imagePosition}
        glassVariant={glassVariant}
      />
    </section>
  );
}

// ─── HomePage ─────────────────────────────────────────────────────────────────
const HomePage: React.FC<{ onNavigate: (p: string, t?: string, s?: string) => void }> = ({ onNavigate }) => {
  const { cards, loading: cardsLoading } = useFrontHomeCards(['home-card-01', 'home-card-02', 'home-card-03', 'home-card-04', 'home-card-05']);
  const { sections: pageSections, metadata: pageMetadata, loading: sectionsLoading } = usePageSections(HOME_SECTION_IDS, { metadataSlug: 'home' });

  return (
    <PageLayout
      slug="home"
      customMetadata={pageMetadata || undefined}
      loading={sectionsLoading}
      instantContent
      showPatterns={true}
      hideDefaultHeader={false}
    >
      {/* SEO (title/meta/og/json-ld): interamente di SEOHead, globale via slug "home".
          Niente PageSEO qui — doppia scrittura degli stessi tag. */}

        {/* ── HERO IMAGE ──────────────────────────────────────────────────────
            Il container è SEMPRE renderizzato: riserva lo spazio (aspect-15/5)
            così l'arrivo tardivo di pageMetadata.imageUrl non causa layout shift.
            Il bg-surface-2 fa da skeleton; l'immagine entra in dissolvenza. */}
        <div className="w-full relative aspect-15/5 rounded-[2rem] overflow-hidden border-2 border-border shadow-2xl group bg-surface-2">
          {pageMetadata?.imageUrl && (
            <>
              <MediaImage
                url={pageMetadata.imageUrl}
                showCaption={false}
                fallbackAlt={t('alt:homeHero')}
                imgClassName="absolute inset-0 w-full h-full object-cover transition-all duration-700 group-hover:scale-110"
                fetchPriority="high"
                loading="eager"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent z-30 pointer-events-none" />
            </>
          )}
        </div>

        <AkhaThemedLine theme="akha" />

        {/* ── EXPLORE GRID + AUDIO ────────────────────────────────────────── */}
        <ScrollEntrance delay={0.1}>
          <div className="flex flex-col [gap:var(--space-fluid-l)]">
            <section id="home_02" className="flex flex-col [gap:var(--space-fluid-m)]">
              <SmartHeaderSection
                sectionId="home_02"
                prefetchedData={pageSections['home_02']}
                loading={sectionsLoading}
                variant="hero2"
                align="center"
                gradientFrom="primary"
                gradientTo="action"
              />

              {cardsLoading ? (
                <HomeGridSkeleton />
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-6 [gap:var(--space-fluid-m)]">
                  {cards.map((card, idx) => {
                    // card_id e' nullable nel tipo: una card senza id non e' renderizzabile
                    if (!card.card_id) return null;
                    const isLast = idx === 4;
                    const colClass = cn(
                      idx < 3 ? 'md:col-span-2' : 'md:col-span-3',
                      isLast ? 'col-span-2' : 'col-span-1'
                    );

                    return (
                      <div key={card.card_id} className={colClass}>
                        {/* Single DOM instance for every card — no responsive dual-render.
                            Cards 0-2: vertical; cards 3-4: horizontal (same on mobile+desktop).
                            Eliminates T01/T05 pickup-text duplication and D04 duplicate H3. */}
                        <SmartHomeCard
                          cardId={card.card_id}
                          layout={idx < 3 ? 'vertical' : 'horizontal'}
                          showDivider={true}
                          onNavigate={onNavigate}
                          buttonSize="xs"
                        />
                      </div>
                    );
                  })}
                </div>
              )}
            </section>

            {/* Audio Highlight — The Kitchen Vibe */}
            <div className="w-full max-w-xl mx-auto">
              <AudioPlayer assetId="01-kitchen-home" />
            </div>
          </div>
        </ScrollEntrance>

        <AkhaThemedLine theme="akha" />

        {/* ── MEET CHERRY ─────────────────────────────────────────────────── */}
        <ScrollEntrance delay={0.1} viewportMargin="-20px">
          <section id="home_01" className="grid grid-cols-1 lg:grid-cols-2 [gap:var(--space-fluid-xl)] items-center">
            {/* Colonna Immagine (Full-width mobile, rounded lg on desktop) */}
            <div className="order-1 lg:order-2 w-full relative aspect-square rounded-[2rem] lg:rounded-[3rem] overflow-hidden border-2 border-border shadow-2xl group bg-surface-2">
              <MediaImage
                assetId="01-home-cherry"
                className="relative z-20 w-full h-full"
                imgClassName="w-full h-full object-cover transition-all duration-700 group-hover:scale-110"
                fallbackAlt={t('alt:cherry')}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent z-30 pointer-events-none" />
            </div>

            {/* Colonna Testo + StatCards + Audio */}
            <div className="order-2 lg:order-1 flex flex-col [gap:var(--space-fluid-m)]">
              <SmartHeaderSection
                sectionId="home_01"
                prefetchedData={pageSections['home_01']}
                loading={sectionsLoading}
                variant="section"
                align="left"
                gradientFrom="action"
                gradientTo="allergy"
              />

              <AudioPlayer assetId="01-cherry-home" hideTranscript className="w-full" />

              <div className="grid grid-cols-2 [gap:var(--space-fluid-m)]">
                {(pageSections['home_01']?.cards ?? []).map((card) => (
                  <StatCard
                    key={card.title}
                    color={toStatCardColor(card.variant)}
                    value={card.title}
                    description={card.description}
                    size="md"
                    shadow={false}
                  />
                ))}
              </div>

            </div>
          </section>
        </ScrollEntrance>

        <AkhaThemedLine theme="history" />

        {/* ── SECTION 03 (Akha People) ────────────────────────────────────── */}
        <ScrollEntrance delay={0.1} viewportMargin="-20px">
          <HomeGlassSection
            headerId="home_03"
            cardId="home_04"
            buttonVariant="primary"
            buttonSize="sm"
            glassVariant="action"
            imagePosition="left"
            gradientFrom="quiz-s"
            gradientTo="primary"
            onNavigate={onNavigate}
          />
        </ScrollEntrance>

        <AkhaThemedLine theme="akha" />

        {/* ── SECTION 04 (AI Quiz) ────────────────────────────────────────── */}
        <ScrollEntrance delay={0.1} viewportMargin="-20px">
          <HomeGlassSection
            headerId="home_05"
            cardId="home_06"
            buttonVariant="quiz-p"
            buttonSize="sm"
            glassVariant="secondary"
            imagePosition="right"
            gradientFrom="quiz-p"
            gradientTo="allergy"
            onNavigate={onNavigate}
          />
        </ScrollEntrance>


        <PageEssentials
          slug="home"
        />

        <FaqBottomPage slug="home"
          onNavigate={onNavigate} buttonSize="sm" />

        <SiblingInfoSection
          currentSlug="home"
          onNavigate={onNavigate}
          sectionId="sibiling_home"
        />

    </PageLayout>
  );
};

export default HomePage;
