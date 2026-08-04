import React, { useEffect } from 'react';
import { PageLayout } from '../components/layout/PageLayout';
import { cn } from '@thaiakha/shared/lib/utils';
import { t } from '@thaiakha/shared/lib/ui-strings';
import { StickyTabNav, PageSEO, SiblingInfoSection } from '../components/layout';
import { Typography, Icon, FaqBottomPage } from '../components/ui';
import { Input } from '../components/ui/form';
import { BlogGridSkeleton } from '../components/skeleton';
import { useNewsFeed } from '../hooks/useNewsFeed';
import { NewsGrid } from '../components/news';
import NewsPageSingle from './NewsPageSingle';
import PageEssentials from '../components/layout/PageEssentials';
import { AkhaThemedLine } from '../components/blog';

interface NewsPageProps {
  onNavigate: (page: string, topic?: string, sectionId?: string) => void;
  targetSection?: string | null;
}

const NewsPage: React.FC<NewsPageProps> = ({ onNavigate, targetSection }) => {
  const {
    metadata,
    articles,
    allArticles,
    tabItems,
    activeCategory,
    activeSlug,
    searchQuery,
    setSearchQuery,
    sortBy,
    setSortBy,
    currentPage,
    setCurrentPage,
    totalPages,
    loading
  } = useNewsFeed(targetSection);

  // Scroll to content top when category tab changes or page changes
  useEffect(() => {
    const scrollContainer = document.getElementById('main-scroll-container');
    const contentContainer = document.getElementById('news-content');
    if (scrollContainer && contentContainer && (activeCategory !== 'all' || currentPage > 1)) {
      const containerRect = scrollContainer.getBoundingClientRect();
      const contentRect = contentContainer.getBoundingClientRect();
      const stickyOffset = window.innerWidth < 768 ? 20 : 40;
      const targetScrollTop =
        scrollContainer.scrollTop + (contentRect.top - containerRect.top) - stickyOffset;
      scrollContainer.scrollTo({ top: Math.max(0, targetScrollTop), behavior: 'smooth' });
    } else if (scrollContainer && activeCategory === 'all' && currentPage === 1) {
      scrollContainer.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [activeCategory, currentPage]);
  const handleCategoryChange = (catId: string) => {
    if (catId === 'all') {
      onNavigate('thai-cooking-tips-news');
    } else {
      onNavigate('thai-cooking-tips-news', undefined, catId);
    }
  };

  const handleOpenArticle = (slug: string) => {
    onNavigate('thai-cooking-tips-news', undefined, slug);
  };

  const handleBack = () => {
    if (activeCategory && activeCategory !== 'all') {
      onNavigate('thai-cooking-tips-news', undefined, activeCategory);
    } else {
      onNavigate('thai-cooking-tips-news');
    }
  };

  if (activeSlug) {
    return (
      <NewsPageSingle
        slug={activeSlug}
        onBack={handleBack}
        onOpen={handleOpenArticle}
        articles={allArticles}
        activeCategory={activeCategory}
        onCategoryChange={handleCategoryChange}
        tabItems={tabItems}
        onNavigate={onNavigate}
      />
    );
  }

  const hasContent = articles.length > 0;

  return (
    <>
      {/* JSON-LD is handled exclusively by SEOHead (global, slug-based).
          PageSEO manages only meta/og/twitter tags here to avoid duplicate structured data. */}
      <PageSEO
        title={metadata?.seo_title || "Thai Cooking Tips & Akha Stories | Thai Akha Kitchen Chiang Mai"}
        description={metadata?.seo_description || metadata?.page_description || 'Chef secrets, cooking tips, and Akha cultural stories from Thai Akha Kitchen Chiang Mai. Master mortar & pestle, spice levels, vegan adaptations, and more.'}
        canonical="https://www.thaiakha.com/thai-cooking-tips-news"
        ogImage={metadata?.og_image || metadata?.hero_image_url || 'https://mtqullobcsypkqgdkaob.supabase.co/storage/v1/object/public/showcase/og-default.jpg'}
        ogType="website"
      />
      <PageLayout
        slug="thai-cooking-tips-news"
        showPatterns={true}
        hideDefaultHeader={false}
        customMetadata={metadata ? {
          titleMain: metadata.header_title_main,
          titleHighlight: metadata.header_title_highlight,
          description: metadata.page_description,
          badge: metadata.header_badge,
          imageUrl: metadata.hero_image_url || '',
        } : undefined}
      >
        <div
          id="news-content"
          className="contents"
          style={{
            '--glass-accent-border': 'rgba(0, 0, 0, 0.5)',
            '--glass-accent-glow': 'rgba(0, 0, 0, 0.12)',
          } as React.CSSProperties}
        >
          {/* Tab Navigazione Categorie */}
          <StickyTabNav
            items={tabItems}
            value={activeCategory}
            onChange={handleCategoryChange}
          />

          {/* Controls: Search & Sort */}
          <div className="w-full flex flex-col md:flex-row items-center justify-between [gap:var(--space-fluid-s)] max-w-7xl mx-auto px-4 md:px-6">
            <div className="w-full md:w-80 relative group">
              <Input
                placeholder="Search articles..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                leftIcon="search"
                className="bg-white/40 dark:bg-black/20 backdrop-blur-md border-white/20 dark:border-white/5 rounded-2xl shadow-sm group-hover:shadow-md transition-all duration-500"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-black/5 dark:hover:bg-white/5 rounded-full transition-colors"
                >
                  <Icon name="close" size="xs" color="muted" />
                </button>
              )}
            </div>

            <div className="flex items-center [gap:var(--space-fluid-2xs)] bg-white/40 dark:bg-black/20 backdrop-blur-md border border-white/20 dark:border-white/5 [padding:var(--space-fluid-2xs)] rounded-2xl">
              <button
                onClick={() => setSortBy('by-id')}
                className={cn(
                  "px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all duration-300",
                  sortBy === 'by-id'
                    ? "bg-action text-white shadow-lg shadow-action/20"
                    : "text-muted hover:text-sub hover:bg-black/5 dark:hover:bg-white/5"
                )}
              >
                {t.news.sortById}
              </button>
              <button
                onClick={() => setSortBy('latest')}
                className={cn(
                  "px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all duration-300",
                  sortBy === 'latest'
                    ? "bg-action text-white shadow-lg shadow-action/20"
                    : "text-muted hover:text-sub hover:bg-black/5 dark:hover:bg-white/5"
                )}
              >
                {t.news.sortByLatest}
              </button>
              <button
                onClick={() => setSortBy('oldest')}
                className={cn(
                  "px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all duration-300",
                  sortBy === 'oldest'
                    ? "bg-action text-white shadow-lg shadow-action/20"
                    : "text-muted hover:text-sub hover:bg-black/5 dark:hover:bg-white/5"
                )}
              >
                {t.news.sortByOldest}
              </button>
            </div>
          </div>

          {/* Griglia Contenuti */}
          <div className="w-full flex flex-col [gap:var(--space-fluid-xl)]">
            {loading && <BlogGridSkeleton />}

            {!loading && !hasContent && (
              <div className="flex flex-col items-center justify-center py-24 text-center [gap:var(--space-fluid-s)]">
                <Icon name="newspaper" size="xl" className="text-action/40" />
                <Typography variant="h5" color="sub">
                  {searchQuery ? `No results for "${searchQuery}"` : "No articles found"}
                </Typography>
                <Typography variant="paragraphS" color="muted">
                  {searchQuery ? "Try a different search term or check another category." : "Check back later for more updates."}
                </Typography>
              </div>
            )}

            {!loading && hasContent && (
              <div className="flex flex-col items-center [gap:var(--space-fluid-xl)]">
                <div className="w-full">
                  <NewsGrid articles={articles} onOpen={handleOpenArticle} />
                </div>
              </div>
            )}

            <PageEssentials slug="thai-cooking-tips-news" />

            <FaqBottomPage slug="thai-cooking-tips-news"
              onNavigate={onNavigate} />

            <SiblingInfoSection
              currentSlug="thai-cooking-tips-news"
              onNavigate={onNavigate}
              sectionId="sibiling_info"
            />
          </div>
        </div>
      </PageLayout>
    </>
  );
};

export default NewsPage;
