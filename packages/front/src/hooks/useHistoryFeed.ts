import { useState, useEffect, useMemo, useCallback } from 'react';
import { contentService } from '@thaiakha/shared/services';
import { CultureSection, ContentCategoryDB } from '@thaiakha/shared/types';

// URL patterns:
//   /history                        → index, all categories
//   /history/category/:categoryId   → filtered by category
//   /history/:articleSlug           → article detail

function parseHistoryUrl() {
  const parts = window.location.pathname.split('/').filter(Boolean);
  // parts[0] === 'history'
  if (parts[1] === 'category' && parts[2]) {
    return { slug: null, category: parts[2] };
  }
  if (parts[1] && parts[1] !== 'category') {
    return { slug: parts[1], category: null };
  }
  return { slug: null, category: null };
}

export function useHistoryFeed(targetSection?: string | null) {
  const [sections, setSections] = useState<CultureSection[]>([]);
  const [categories, setCategories] = useState<ContentCategoryDB[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const initialUrl = parseHistoryUrl();
  const [activeSlug, setActiveSlug] = useState<string | null>(
    () => targetSection ?? initialUrl.slug
  );
  const [activeCategory, setActiveCategory] = useState<string>(
    () => initialUrl.category ?? 'all'
  );

  // Load sections + content_categories(domain='history') in parallel
  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        setLoading(true);
        setError(false);
        const [sectionsData, categoriesData] = await Promise.all([
          contentService.getCultureSections(),
          contentService.getContentCategories('history'),
        ]);
        if (mounted) {
          setSections(sectionsData);
          setCategories(categoriesData);

          // If we have an active slug but no category (e.g. direct load), 
          // find the category from the section data
          const { category } = parseHistoryUrl();
          if (!category && initialUrl.slug) {
            const currentSection = sectionsData.find(s => s.slug === initialUrl.slug);
            if (currentSection?.category_id) {
              setActiveCategory(currentSection.category_id);
            }
          }
        }
      } catch (e) {
        console.error('useHistoryFeed: failed to load', e);
        if (mounted) setError(true);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    load();
    return () => { mounted = false; };
  }, [initialUrl.slug]);

  // Sync with browser back/forward
  useEffect(() => {
    const handlePop = () => {
      const { slug, category } = parseHistoryUrl();
      setActiveSlug(slug);
      
      if (category) {
        setActiveCategory(category);
      } else if (!slug) {
        // Only reset to 'all' if we are on base /history (no slug, no category)
        setActiveCategory('all');
      } else {
        // We are on a slug but no category in URL
        // Try to find it in already loaded sections
        const section = sections.find(s => s.slug === slug);
        if (section?.category_id) {
          setActiveCategory(section.category_id);
        }
      }
    };
    window.addEventListener('popstate', handlePop);
    return () => window.removeEventListener('popstate', handlePop);
  }, [sections]);

  // Sync external navigation from App.tsx (sidebar, deep links).
  // Must NOT depend on activeSlug — otherwise category changes trigger re-open.
  useEffect(() => {
    if (targetSection !== undefined) {
      setActiveSlug(targetSection ?? null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [targetSection]);

  const handleOpenSection = useCallback((slug: string, onOpen?: (page: string, topic?: string, id?: string) => void) => {
    const section = sections.find(s => s.slug === slug);
    if (section?.category_id) setActiveCategory(section.category_id);

    if (onOpen) {
      onOpen('history', undefined, slug);
    } else {
      window.history.pushState({}, '', `/history/${slug}`);
      setActiveSlug(slug);
    }
  }, [sections]);

  const handleBack = useCallback((onNavigate?: (page: string) => void) => {
    const url = activeCategory === 'all' ? '/history' : `/history/category/${activeCategory}`;
    window.history.pushState({}, '', url);
    window.dispatchEvent(new PopStateEvent('popstate', { state: {} }));
    setActiveSlug(null);
    // Note: We DON'T reset activeCategory for smoother return
    if (onNavigate) onNavigate('history');
  }, [activeCategory]);

  const handleCategoryChange = useCallback((cat: string, onBack?: () => void) => {
    const url = cat === 'all' ? '/history' : `/history/category/${cat}`;
    window.history.pushState({}, '', url);
    setActiveCategory(cat);
    if (activeSlug) {
      setActiveSlug(null);
      if (onBack) onBack();
    }
  }, [activeSlug]);

  // Tab items driven by content_categories (domain='history')
  const tabItems = useMemo(() => {
    const catTabs = categories.map(cat => ({
      value: cat.id,
      label: cat.tab_label ?? cat.title,
      icon: cat.icon_name ?? 'tag',
    }));
    return [{ value: 'all', label: 'All', icon: 'Grid' }, ...catTabs];
  }, [categories]);

  const featuredSection = useMemo(() => {
    if (activeCategory === 'all') return sections.find(s => s.featured) ?? null;
    return sections.find(s => s.featured && s.category_id === activeCategory) ?? null;
  }, [sections, activeCategory]);

  const feedSections = useMemo(() => {
    const withoutFeatured = sections.filter(s => s.id !== featuredSection?.id);
    if (activeCategory === 'all') return withoutFeatured;
    return withoutFeatured.filter(s => s.category_id === activeCategory);
  }, [sections, featuredSection, activeCategory]);

  const groupedData = useMemo(() => {
    const grouped = feedSections.reduce<Record<string, CultureSection[]>>((acc, s) => {
      const key = s.category_id ?? 'other';
      (acc[key] ??= []).push(s);
      return acc;
    }, {});
    const categoryOrder = categories
      .map(c => c.id)
      .filter(id => grouped[id]?.length);
    const hasUncategorised = feedSections.some(s => !s.category_id);
    return { grouped, categoryOrder: hasUncategorised ? [...categoryOrder, 'other'] : categoryOrder };
  }, [feedSections, categories]);

  return {
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
  };
}
