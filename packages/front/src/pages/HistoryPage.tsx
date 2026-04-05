import React, { useEffect } from 'react';
import { PageLayout } from '../components/layout/PageLayout';
import { StickyTabNav, HeaderMenu } from '../components/layout';
import { HeaderSection } from '../components/layout/HeaderSection';
import { Typography, Icon, AkhaPixelLine, Button } from '../components/ui/index';
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
    handleCategoryChange
  } = useHistoryFeed(targetSection);

  // Scroll to content top when category tab changes
  useEffect(() => {
    const scrollContainer = document.getElementById('main-scroll-container');
    const contentContainer = document.getElementById('history-content');
    if (scrollContainer && contentContainer) {
      const containerRect = scrollContainer.getBoundingClientRect();
      const contentRect = contentContainer.getBoundingClientRect();
      const stickyOffset = window.innerWidth < 768 ? 10 : 20;
      const targetScrollTop =
        scrollContainer.scrollTop + (contentRect.top - containerRect.top) - stickyOffset;
      scrollContainer.scrollTo({ top: Math.max(0, targetScrollTop), behavior: 'smooth' });
    } else if (scrollContainer) {
      scrollContainer.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [activeCategory]);

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
        returnTo={activeCategory !== 'all' ? activeCategory : 'history'}
      />
    );
  }

  const hasContent = activeCategory === 'all'
    ? !!featuredSection || feedSections.length > 0
    : feedSections.length > 0;

  return (
    <PageLayout
      slug="history"
      showPatterns={true}
      hideDefaultHeader={true}
      customHeader={<HeaderMenu customSlug="history" />}
    >
      <div
        id="history-content"
        className="w-full flex flex-col"
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

        <div className="w-full max-w-6xl mx-auto [padding-inline:var(--space-fluid-m)] [padding-top:var(--space-fluid-l)] pb-32">
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
                <div className="[margin-bottom:var(--space-fluid-xs)] flex flex-col [gap:var(--space-fluid-l)]">
                  <CinematicHeroCard
                    section={featuredSection}
                    index={0}
                    onOpen={(slug) => handleOpenSection(slug, onNavigate)}
                    categories={categories}
                    onCategoryClick={(catId) => handleCategoryChange(catId)}
                  />
                  <div className="px-[10%] flex flex-col sm:flex-row items-stretch sm:items-center [gap:var(--space-fluid-xs)]">
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
                  <HeaderSection
                    title={featuredSection.title}
                    subtitle={featuredSection.subtitle ?? undefined}
                    variant="hero"
                    align="center"
                  />
                  <AkhaPixelLine className="opacity-30 my-4" />
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
                          <div className="[margin-top:var(--space-fluid-2xs)] [margin-bottom:var(--space-fluid-l)]">
                            <HeaderSection
                              variant="hero"
                              align="center"
                              title={catMeta.title}
                              highlight={catMeta.title_highlight ?? undefined}
                              subtitle={catMeta.subtitle ?? undefined}
                              description={catMeta.description ?? undefined}
                            />
                          </div>
                        )}
                        <BlogGrid sections={catSections} onOpen={(slug) => handleOpenSection(slug, onNavigate)} />
                        {!isLast && <AkhaPixelLine className="mt-2 opacity-25" />}
                      </React.Fragment>
                    );
                  })}
                </>
              )}
            </>
          )}
        </div>
      </div>
    </PageLayout>
  );
};

export default HistoryPage;
