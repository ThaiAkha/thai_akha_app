import React, { useEffect } from 'react';
import { PageLayout } from '../components/layout/PageLayout';
import { StickyTabNav, HeaderMenu } from '../components/layout';
import { SmartHeaderSection } from '../components/layout/SmartHeaderSection';
import { Typography, Icon, AkhaPixelLine } from '../components/ui/index';
import {
  CinematicHeroCard,
  BlogGrid,
} from '../components/blog/index';
import { BlogGridSkeleton } from '../components/skeleton';
import { useHistoryFeed } from '../hooks/useHistoryFeed';
import CultureDetailPage from './CultureDetailPage';

interface HistoryPageProps {
  onNavigate: (page: string, topic?: string, sectionId?: string) => void;
  targetSection?: string | null;
}

const HistoryPage: React.FC<HistoryPageProps> = ({ onNavigate, targetSection }) => {
  const {
    sections,
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
      <CultureDetailPage
        slug={activeSlug}
        onBack={() => handleBack(onNavigate)}
        onOpen={(slug) => handleOpenSection(slug, onNavigate)}
        sections={sections}
        activeCategory={activeCategory}
        onCategoryChange={(cat) => handleCategoryChange(cat, () => onNavigate('history'))}
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

        <div className="w-full max-w-6xl mx-auto px-4 md:px-6 pt-10 md:pt-10 pb-32">
          {loading && <BlogGridSkeleton />}

          {!loading && error && (
            <div className="flex flex-col items-center justify-center py-24 text-center gap-4">
              <Icon name="wifi_off" size="xl" className="text-primary/40" />
              <Typography variant="h5" color="sub">Could not load culture sections</Typography>
              <Typography variant="body" color="muted">Please check your connection and try again.</Typography>
            </div>
          )}

          {!loading && !error && !hasContent && (
            <div className="flex flex-col items-center justify-center py-24 text-center gap-4">
              <Icon name="auto_stories" size="xl" className="text-action/40" />
              <Typography variant="h5" color="sub">No sections in this category</Typography>
              <Typography variant="body" color="muted">Try a different tab or check back soon.</Typography>
            </div>
          )}

          {!loading && !error && hasContent && (
            <>
              {featuredSection && (
                <div className="mb-12">
                  <CinematicHeroCard
                    section={featuredSection}
                    index={0}
                    onOpen={(slug) => handleOpenSection(slug, onNavigate)}
                  />
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
                    return (
                      <React.Fragment key={cat}>
                        <div className="mt-14 mb-8">
                          <SmartHeaderSection
                            sectionId={`history_cat_${cat.toLowerCase().replace(/[\s-]+/g, '_')}`}
                            variant="section"
                            align="center"
                            fallbackTitle={cat}
                          />
                        </div>
                        <BlogGrid sections={catSections} onOpen={(slug) => handleOpenSection(slug, onNavigate)} />
                        {!isLast && <AkhaPixelLine className="mt-14 opacity-25" />}
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
