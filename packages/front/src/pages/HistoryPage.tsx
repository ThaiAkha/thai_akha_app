import React, { useState, useEffect, useMemo } from 'react';
import { PageLayout } from '../components/layout/PageLayout';
import { StickyTabNav, HeaderMenu, HeaderSection } from '../components/layout';
import { Typography, Icon, AkhaPixelLine } from '../components/ui/index';
import { contentService } from '@thaiakha/shared/services';
import { CultureSection } from '@thaiakha/shared/types';
import { cn } from '@thaiakha/shared/lib/utils';
import CultureDetailPage from './CultureDetailPage';
import {
  ChapterCard,
  CinematicHeroCard,
  HeroCard,
  FilmStripCard,
} from '../components/blog/index';

// ─── Card variant selector ────────────────────────────────────────────────────

type GridVariant = 'chapter' | 'hero' | 'horizontal';

function resolveVariant(index: number): GridVariant {
  if (index % 7 === 6) return 'horizontal';
  if (index % 4 === 3) return 'hero';
  return 'chapter';
}

function variantColSpan(variant: GridVariant): string {
  if (variant === 'horizontal') return 'col-span-1 sm:col-span-2 lg:col-span-3';
  return '';
}

// ─── Category config ──────────────────────────────────────────────────────────

const CATEGORY_ICONS: Record<string, string> = {
  all: 'Grid',
  Culture: 'landmark',
  History: 'menu_book',
  People: 'groups',
  Traditions: 'party-popper',
};

// ─── Skeleton card ─────────────────────────────────────────────────────────────

const SkeletonCard: React.FC = () => (
  <div className="rounded-[2rem] border border-border bg-surface overflow-hidden animate-pulse">
    <div className="aspect-video w-full bg-gray-200 dark:bg-white/5" />
    <div className="p-5 md:p-6 space-y-3">
      <div className="h-4 bg-gray-200 dark:bg-white/5 rounded-full w-3/4" />
      <div className="h-3 bg-gray-200 dark:bg-white/5 rounded-full w-full" />
      <div className="h-3 bg-gray-200 dark:bg-white/5 rounded-full w-2/3" />
    </div>
  </div>
);

// ─── URL helpers ──────────────────────────────────────────────────────────────

const getSlugFromUrl = (): string | null => {
  const parts = window.location.pathname.split('/');
  return parts[1] === 'history' && parts[2] ? parts[2] : null;
};

// ─── HistoryPage ──────────────────────────────────────────────────────────────

interface HistoryPageProps {
  onNavigate: (page: string, topic?: string, sectionId?: string) => void;
  targetSection?: string | null;
}

const HistoryPage: React.FC<HistoryPageProps> = ({ onNavigate, targetSection }) => {
  const [sections, setSections] = useState<CultureSection[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [activeSlug, setActiveSlug] = useState<string | null>(
    () => getSlugFromUrl() ?? targetSection ?? null,
  );
  const [activeCategory, setActiveCategory] = useState<string>('all');

  // Sync URL → state on browser back/forward
  useEffect(() => {
    const handlePop = () => setActiveSlug(getSlugFromUrl());
    window.addEventListener('popstate', handlePop);
    return () => window.removeEventListener('popstate', handlePop);
  }, []);

  // Sync prop → URL + state when App.tsx drives navigation
  useEffect(() => {
    if (targetSection && targetSection !== activeSlug) {
      window.history.pushState({}, '', `/history/${targetSection}`);
      setActiveSlug(targetSection);
    } else if (!targetSection && activeSlug) {
      window.history.pushState({}, '', '/history');
      setActiveSlug(null);
    }
  }, [targetSection]); // eslint-disable-line react-hooks/exhaustive-deps

  // Scroll to content top when category tab changes (same pattern as InfoClasses)
  useEffect(() => {
    const scrollContainer = document.getElementById('main-scroll-container');
    const contentContainer = document.getElementById('history-content');
    if (scrollContainer && contentContainer) {
      const containerRect = scrollContainer.getBoundingClientRect();
      const contentRect = contentContainer.getBoundingClientRect();
      const stickyOffset = window.innerWidth < 768 ? 10 : 20;
      const targetScrollTop = scrollContainer.scrollTop + (contentRect.top - containerRect.top) - stickyOffset;
      scrollContainer.scrollTo({ top: Math.max(0, targetScrollTop), behavior: 'smooth' });
    } else if (scrollContainer) {
      scrollContainer.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [activeCategory]);

  const handleOpenSection = (slug: string) => {
    const section = sections.find(s => s.slug === slug);
    if (section?.category) setActiveCategory(section.category);
    window.history.pushState({}, '', `/history/${slug}`);
    setActiveSlug(slug);
  };

  const handleBack = () => {
    window.history.pushState({}, '', '/history');
    setActiveSlug(null);
    onNavigate('history');
  };

  const handleCategoryChange = (cat: string) => {
    setActiveCategory(cat);
    // If in detail view, go back to index
    if (activeSlug) {
      window.history.pushState({}, '', '/history');
      setActiveSlug(null);
    }
  };

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        setLoading(true);
        setError(false);
        const data = await contentService.getCultureSections();
        if (mounted) setSections(data);
      } catch (e) {
        console.error('HistoryPage: failed to load culture sections', e);
        if (mounted) setError(true);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    load();
    return () => { mounted = false; };
  }, []);

  // Derive sorted unique categories from loaded sections
  const categories = useMemo(() => {
    const cats = Array.from(
      new Set(sections.map(s => s.category).filter(Boolean) as string[]),
    ).sort();
    return cats;
  }, [sections]);

  const tabItems = useMemo(() => [
    { value: 'all', label: 'All', icon: CATEGORY_ICONS['all'] },
    ...categories.map(cat => ({
      value: cat,
      label: cat,
      icon: CATEGORY_ICONS[cat] ?? 'label',
    })),
  ], [categories]);

  // If a section slug is active, render the detail page
  if (activeSlug) {
    return (
      <CultureDetailPage
        slug={activeSlug}
        onBack={handleBack}
        onOpen={handleOpenSection}
        sections={sections}
        activeCategory={activeCategory}
        onCategoryChange={handleCategoryChange}
        tabItems={tabItems}
      />
    );
  }

  // Filter sections by active category
  const filteredSections = activeCategory === 'all'
    ? sections
    : sections.filter(s => s.category === activeCategory);

  const featuredSection = filteredSections.find(s => s.featured) ?? null;
  const gridSections = filteredSections.filter(s => !s.featured);

  return (
    <PageLayout
      slug="history"
      showPatterns={true}
      hideDefaultHeader={true}
      customHeader={<HeaderMenu customSlug="history" />}
    >
      <div id="history-content" className="w-full flex flex-col">

        {/* ── Sticky Category Tabs ────────────────────────────────────── */}
        <StickyTabNav
          items={tabItems}
          value={activeCategory}
          onChange={handleCategoryChange}
        />

        <div className="w-full max-w-6xl mx-auto px-4 md:px-6 pt-6 md:pt-8 pb-32">

          {/* ── Loading state ──────────────────────────────────────────── */}
          {loading && (
            <div className="space-y-10">
              <div className="rounded-[2.5rem] border border-border bg-surface overflow-hidden animate-pulse">
                <div className="aspect-[16/7] w-full bg-gray-200 dark:bg-white/5" />
                <div className="p-8 space-y-4">
                  <div className="h-5 bg-gray-200 dark:bg-white/5 rounded-full w-1/2" />
                  <div className="h-4 bg-gray-200 dark:bg-white/5 rounded-full w-3/4" />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
              </div>
            </div>
          )}

          {/* ── Error state ────────────────────────────────────────────── */}
          {!loading && error && (
            <div className="flex flex-col items-center justify-center py-24 text-center gap-4">
              <Icon name="wifi_off" size="xl" className="text-primary/40" />
              <Typography variant="h5" color="sub">Could not load culture sections</Typography>
              <Typography variant="body" color="muted">Please check your connection and try again.</Typography>
            </div>
          )}

          {/* ── Empty state ────────────────────────────────────────────── */}
          {!loading && !error && filteredSections.length === 0 && (
            <div className="flex flex-col items-center justify-center py-24 text-center gap-4">
              <Icon name="auto_stories" size="xl" className="text-action/40" />
              <Typography variant="h5" color="sub">No sections in this category</Typography>
              <Typography variant="body" color="muted">Try a different tab or check back soon.</Typography>
            </div>
          )}

          {/* ── Content ────────────────────────────────────────────────── */}
          {!loading && !error && filteredSections.length > 0 && (
            <>
              {/* 1. Featured hero — prima foto in evidenza */}
              {featuredSection && (
                <div className="mb-12">
                  <CinematicHeroCard
                    section={featuredSection}
                    index={0}
                    onOpen={handleOpenSection}
                  />
                </div>
              )}

              {/* 2. Title — from featured section data */}
              <div className={cn(featuredSection ? 'mt-10 mb-8' : 'mb-8')}>
                <HeaderSection
                  title={featuredSection?.title ?? 'Akha Heritage & Culture'}
                  subtitle={featuredSection?.subtitle ?? 'Discover the journey and living culture of the Akha people'}
                  variant="section"
                  align="center"
                />
              </div>

              {/* 3. Divider */}
              <AkhaPixelLine />

              {/* 4. Chapter grid */}
              {gridSections.length > 0 && (
                <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {gridSections.map((section, index) => {
                    const variant = resolveVariant(index);
                    const colSpan = variantColSpan(variant);
                    return (
                      <div key={section.id} className={cn(colSpan)}>
                        {variant === 'horizontal' && (
                          <FilmStripCard section={section} index={index} onOpen={handleOpenSection} />
                        )}
                        {variant === 'hero' && (
                          <HeroCard section={section} index={index} onOpen={handleOpenSection} />
                        )}
                        {variant === 'chapter' && (
                          <ChapterCard section={section} index={index} onOpen={handleOpenSection} />
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </>
          )}

        </div>
      </div>
    </PageLayout>
  );
};

export default HistoryPage;
