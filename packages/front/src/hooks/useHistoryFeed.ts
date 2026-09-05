import { useState, useEffect, useMemo, useCallback } from 'react';
import { useQuery } from '@thaiakha/shared/query';
import { contentService } from '@thaiakha/shared/services';
import type { CultureSection } from '@thaiakha/shared/types';
import { t } from '../i18n';
import { useContentCategories } from './useContentCategories';
import { usePageMetadata } from './usePageMetadata';
import { useLanguage } from '../context/LanguageContext';

const NO_SECTIONS: CultureSection[] = [];

export const cultureSectionsQueryKey = (lang = 'en') => ['culture_sections', lang] as const;

// URL patterns:
//   /history                        → index, all categories
//   /history/category/:categoryId   → filtered by category
//   /history/:articleSlug           → article detail

function parseHistoryUrl() {
  if (typeof window === 'undefined') return { slug: null, category: null };
  const parts = window.location.pathname.split('/').filter(Boolean);
  // parts[0] === 'akha-culture-highland-heritage'
  if (parts[1] === 'category' && parts[2]) {
    return { slug: null, category: parts[2] };
  }
  if (parts[1] && parts[1] !== 'category') {
    return { slug: parts[1], category: null };
  }
  return { slug: null, category: null };
}

export function useHistoryFeed(targetSection?: string | null) {
  const { lang } = useLanguage();
  // Sezioni + categorie + metadata: tre query in cache (CLAUDE.md #17). Era un Promise.all
  // in useEffect; i metadata ora condividono la chiave di PageLayout.
  const sectionsQuery = useQuery({
    queryKey: cultureSectionsQueryKey(lang),
    queryFn: () => contentService.getCultureSections(lang),
  });
  const { categories, loading: catsLoading } = useContentCategories('history');
  const { metadata, loading: metaLoading } = usePageMetadata('akha-culture-highland-heritage');
  const sections = sectionsQuery.data ?? NO_SECTIONS;
  const loading = sectionsQuery.isPending || catsLoading || metaLoading;
  const error = sectionsQuery.isError;

  const initialUrl = parseHistoryUrl();
  const [activeSlug, setActiveSlug] = useState<string | null>(
    () => targetSection ?? initialUrl.slug
  );
  const [activeCategory, setActiveCategory] = useState<string>(
    () => initialUrl.category ?? 'all'
  );

  // If we have an active slug but no category (e.g. direct load), find the category
  // from the section data. Era dentro il fetch: ora reagisce all'arrivo delle sezioni.
  useEffect(() => {
    if (sections.length === 0) return;
    const { category } = parseHistoryUrl();
    if (!category && initialUrl.slug) {
      const currentSection = sections.find(s => s.slug === initialUrl.slug);
      if (currentSection?.category?.id) {
        setActiveCategory(currentSection.category.id);
      }
    }
  }, [sections, initialUrl.slug]);

  // Sync with browser back/forward
  useEffect(() => {
    const handlePop = () => {
      const { slug, category } = parseHistoryUrl();
      setActiveSlug(slug);
      
      if (category) {
        setActiveCategory(category);
      } else if (!slug) {
        // Only reset to 'all' if we are on base /akha-culture-highland-heritage (no slug, no category)
        setActiveCategory('all');
      } else {
        // We are on a slug but no category in URL
        // Try to find it in already loaded sections
        const section = sections.find(s => s.slug === slug);
        if (section?.category?.id) {
          setActiveCategory(section.category.id);
        }
      }
    };
    window.addEventListener('popstate', handlePop);
    return () => window.removeEventListener('popstate', handlePop);
  }, [sections, setActiveSlug, setActiveCategory]);

  useEffect(() => {
    if (targetSection !== undefined) {
      setActiveSlug(targetSection ?? null);
    }
  }, [targetSection, setActiveSlug]);

  const handleOpenSection = useCallback((slug: string, onOpen?: (page: string, topic?: string, id?: string) => void) => {
    const section = sections.find(s => s.slug === slug);
    if (section?.category?.id) setActiveCategory(section.category.id);

    if (onOpen) {
      onOpen('akha-culture-highland-heritage', undefined, slug);
    } else {
      window.history.pushState({}, '', `/akha-culture-highland-heritage/${slug}`);
      setActiveSlug(slug);
    }
  }, [sections]);

  const handleBack = useCallback((onNavigate?: (page: string) => void) => {
    const url = activeCategory === 'all' ? '/akha-culture-highland-heritage' : `/akha-culture-highland-heritage/category/${activeCategory}`;
    window.history.pushState({}, '', url);
    window.dispatchEvent(new PopStateEvent('popstate', { state: {} }));
    setActiveSlug(null);
    // Note: We DON'T reset activeCategory for smoother return
    if (onNavigate) onNavigate('akha-culture-highland-heritage');
  }, [activeCategory]);

  const handleCategoryChange = useCallback((cat: string, onBack?: () => void) => {
    const url = cat === 'all' ? '/akha-culture-highland-heritage' : `/akha-culture-highland-heritage/category/${cat}`;
    window.history.pushState({}, '', url);
    setActiveCategory(cat);
    if (activeSlug) {
      setActiveSlug(null);
      if (onBack) onBack();
    }
  }, [activeSlug]);

  // Tab items driven by content_categories (domain='akha-culture-highland-heritage')
  const tabItems = useMemo(() => {
    const catTabs = categories.map(cat => ({
      value: cat.id,
      label: cat.tab_label ?? cat.title,
      icon: cat.icon_name ?? 'tag',
    }));
    return [{ value: 'all', label: t('history:tabAll'), icon: 'Grid' }, ...catTabs];
  }, [categories]);

  const featuredSection = useMemo(() => {
    if (activeCategory === 'all') return sections.find(s => s.featured) ?? null;
    return sections.find(s => s.featured && s.category?.id === activeCategory) ?? null;
  }, [sections, activeCategory]);

  const feedSections = useMemo(() => {
    const withoutFeatured = sections.filter(s => s.id !== featuredSection?.id);
    if (activeCategory === 'all') return withoutFeatured;
    return withoutFeatured.filter(s => s.category?.id === activeCategory);
  }, [sections, featuredSection, activeCategory]);

  const groupedData = useMemo(() => {
    const grouped = feedSections.reduce<Record<string, CultureSection[]>>((acc, s) => {
      const key = s.category?.id ?? 'other';
      (acc[key] ??= []).push(s);
      return acc;
    }, {});
    const categoryOrder = categories
      .map(c => c.id)
      .filter(id => grouped[id]?.length);
    const hasUncategorised = feedSections.some(s => !s.category?.id);
    return { grouped, categoryOrder: hasUncategorised ? [...categoryOrder, 'other'] : categoryOrder };
  }, [feedSections, categories]);

  return {
    sections,
    categories,
    pageMetadata: metadata,
    loading,
    isLoading: loading,
    isInitialLoading: loading && sections.length === 0,
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
