import React, { useEffect, useRef } from 'react';
import { PageLayout } from '../components/layout/PageLayout';
import { StickyTabNav, HeaderMenu, SiblingInfoSection } from '../components/layout';
import { HeaderSection } from '../components/layout/HeaderSection';
import PageEssentials from '../components/layout/PageEssentials';
import { Typography, Icon, AkhaThemedLine, Button, FaqBottomPage } from '../components/ui/index';
import {
  CinematicHeroCard,
  BlogGrid,
} from '../components/blog/index';
import { AudioPlayer } from '../components/modal/AudioPlayer';
import { BlogGridSkeleton } from '../components/skeleton';
import { t } from '@thaiakha/shared/lib/ui-strings';
import { useHistoryFeed } from '../hooks/useHistoryFeed';
import HistoryPageSingle from './HistoryPageSingle';

interface HistoryPageProps {
  onNavigate: (page: string, topic?: string, sectionId?: string) => void;
  targetSection?: string | null;
}

const HistoryPage: React.FC<HistoryPageProps> = ({ onNavigate, targetSection }) => {
  const historyContentRef = useRef<HTMLDivElement>(null);

  const {
    sections,
    categories,
    loading,
    error,
    activeSlug,
    activeCategory,
    tabItems,
    featuredSection,
    feedSections,
    groupedData,
    handleOpenSection,
    handleBack,
    handleCategoryChange,
    isInitialLoading,
  } = useHistoryFeed(targetSection);

  // SCROLL BEHAVIOR: Smooth scroll to content top when category changes
  useEffect(() => {
    if (!isInitialLoading) {
      const scrollContainer = document.getElementById('main-scroll-container');

      if (scrollContainer && historyContentRef.current) {
        // Offset to account for the header/tabs being visible
        const offset = historyContentRef.current.offsetTop - 120;

        scrollContainer.scrollTo({
          top: offset > 0 ? offset : 0,
          behavior: 'smooth'
        });
      }
    }
  }, [activeCategory, isInitialLoading]);

  // Detail page view
  if (activeSlug) {
    return (
      <HistoryPageSingle
        slug={activeSlug}
        onBack={() => handleBack(onNavigate)}
        onOpen={(slug) => handleOpenSection(slug, onNavigate)}
        sections={sections}
        activeCategory={activeCategory}
        onCategoryChange={(cat) => handleCategoryChange(cat)}
        tabItems={tabItems}
        returnTo={activeCategory !== 'all' ? activeCategory : 'akha-culture-highland-heritage'}
        onNavigate={onNavigate}
      />
    );
  }

  const hasContent = activeCategory === 'all'
    ? !!featuredSection || feedSections.length > 0
    : feedSections.length > 0;

  return (
    <PageLayout
      slug="akha-culture-highland-heritage"
      showPatterns={true}
      hideDefaultHeader={true}
      customHeader={<HeaderMenu customSlug="akha-culture-highland-heritage" />}
    >
      {/* SEO: interamente di SEOHead (globale, slug-based). Niente PageSEO qui. */}
      <div
        ref={historyContentRef as any}
        className="contents"
        style={{
          '--glass-accent-border': 'rgba(0, 0, 0, 0.5)',
          '--glass-accent-glow': 'rgba(0, 0, 0, 0.12)',
        } as React.CSSProperties}
      >
        <StickyTabNav
          items={tabItems}
          value={activeCategory}
          onChange={handleCategoryChange}
        />


        {loading && <BlogGridSkeleton />}

        {!loading && error && (
          <div className="flex flex-col items-center justify-center py-24 text-center [gap:var(--space-fluid-s)]">
            <Icon name="wifi_off" size="xl" className="text-primary/40" />
            <Typography variant="h5" color="sub">{t.history.loadError}</Typography>
            <Typography variant="paragraphS" color="muted">{t.history.loadErrorHint}</Typography>
          </div>
        )}

        {!loading && !error && !hasContent && (
          <div className="flex flex-col items-center justify-center py-24 text-center [gap:var(--space-fluid-s)]">
            <Icon name="auto_stories" size="xl" className="text-action/40" />
            <Typography variant="h5" color="sub">{t.history.emptyTitle}</Typography>
            <Typography variant="paragraphS" color="muted">{t.history.emptyHint}</Typography>
          </div>
        )}

        {!loading && !error && hasContent && (
          <>
            {featuredSection && (
              <div className="flex flex-col [gap:var(--space-fluid-l)]">
                <CinematicHeroCard
                  section={featuredSection}
                  index={0}
                  onOpen={(slug) => handleOpenSection(slug, onNavigate)}
                  categories={categories}
                  onCategoryClick={(catId) => handleCategoryChange(catId)}
                />
                <div className="w-full max-w-[var(--container-section)] mx-auto flex flex-col sm:flex-row items-stretch sm:items-center [gap:var(--space-fluid-xs)]">
                  {featuredSection.audio_asset_id && (
                    <div className="flex-1 min-w-0">
                      <AudioPlayer assetId={featuredSection.audio_asset_id} hideTranscript />
                    </div>
                  )}
                  <Button
                    variant="brand"
                    size="md"
                    icon="arrow_forward"
                    onClick={() => handleOpenSection(featuredSection.slug, onNavigate)}
                    className="shrink-0"
                  >
                    {t.history.explore}
                  </Button>
                </div>

                <AkhaThemedLine theme="history" />
              </div>
            )}

            {activeCategory !== 'all' && feedSections.length > 0 && (
              <BlogGrid sections={feedSections} onOpen={(slug) => handleOpenSection(slug, onNavigate)} />
            )}

            {activeCategory === 'all' && groupedData.categoryOrder.length > 0 && (
              <>
                {groupedData.categoryOrder.map((cat, catIdx) => {
                  const catSections = groupedData.grouped[cat] ?? [];
                  const isLast = catIdx === groupedData.categoryOrder.length - 1;
                  const catMeta = categories.find(c => c.id === cat);
                  return (
                    <React.Fragment key={cat}>
                      {cat !== 'other' && catMeta && (
                        <div className="contents">
                          <HeaderSection
                            variant="section"
                            align="center"
                            title={catMeta.title}
                            highlight={catMeta.title_highlight ?? undefined}
                            subtitle={catMeta.subtitle ?? undefined}
                            description={catMeta.description ?? undefined}
                          />
                        </div>
                      )}
                      <BlogGrid sections={catSections} onOpen={(slug) => handleOpenSection(slug, onNavigate)} />
                      {!isLast && (
                        <AkhaThemedLine theme="history" />
                      )}
                    </React.Fragment>
                  );
                })}
              </>
            )}
          </>
        )}

        <PageEssentials
          slug="akha-culture-highland-heritage"
        />

        <FaqBottomPage
          slug="akha-culture-highland-heritage"
          onNavigate={onNavigate}
        />

        <SiblingInfoSection
          currentSlug="akha-culture-highland-heritage"
          onNavigate={onNavigate}
          sectionId="sibiling_info"
        />

      </div>
    </PageLayout>
  );
};

export default HistoryPage;
