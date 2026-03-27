import { useState, useEffect, useMemo, useCallback } from 'react';
import { contentService } from '@thaiakha/shared/services';
import { CultureSection } from '@thaiakha/shared/types';

export function useHistoryFeed(targetSection?: string | null) {
  const [sections, setSections] = useState<CultureSection[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string>('all');
  
  const getSlugFromUrl = useCallback((): string | null => {
    const parts = window.location.pathname.split('/');
    return parts[1] === 'history' && parts[2] ? parts[2] : null;
  }, []);

  const [activeSlug, setActiveSlug] = useState<string | null>(
    () => getSlugFromUrl() ?? targetSection ?? null
  );

  // Initial load
  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        setLoading(true);
        setError(false);
        const data = await contentService.getCultureSections();
        if (mounted) setSections(data);
      } catch (e) {
        console.error('useHistoryFeed: failed to load', e);
        if (mounted) setError(true);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    load();
    return () => { mounted = false; };
  }, []);

  // Sync state with URL (browser navigation)
  useEffect(() => {
    const handlePop = () => setActiveSlug(getSlugFromUrl());
    window.addEventListener('popstate', handlePop);
    return () => window.removeEventListener('popstate', handlePop);
  }, [getSlugFromUrl]);

  // Sync prop changes from outside
  useEffect(() => {
    const currentSlug = getSlugFromUrl();
    if (targetSection && targetSection !== activeSlug) {
      if (currentSlug !== targetSection) {
        window.history.pushState({}, '', `/history/${targetSection}`);
      }
      setActiveSlug(targetSection);
    } else if (!targetSection && activeSlug) {
      if (currentSlug !== null) {
        window.history.pushState({}, '', '/history');
      }
      setActiveSlug(null);
    }
  }, [targetSection, activeSlug, getSlugFromUrl]);

  const handleOpenSection = useCallback((slug: string, onOpen?: (page: string, topic?: string, id?: string) => void) => {
    const section = sections.find(s => s.slug === slug);
    if (section?.category) setActiveCategory(section.category);
    window.history.pushState({}, '', `/history/${slug}`);
    setActiveSlug(slug);
    if (onOpen) onOpen('history', undefined, slug);
  }, [sections]);

  const handleBack = useCallback((onNavigate?: (page: string) => void) => {
    window.history.pushState({}, '', '/history');
    setActiveSlug(null);
    if (onNavigate) onNavigate('history');
  }, []);

  const handleCategoryChange = useCallback((cat: string, onBack?: () => void) => {
    setActiveCategory(cat);
    if (activeSlug) {
      window.history.pushState({}, '', '/history');
      setActiveSlug(null);
      if (onBack) onBack();
    }
  }, [activeSlug]);

  const tabItems = useMemo(() => {
    const cats = [...new Set(sections.map(s => s.category).filter(Boolean))] as string[];
    return [
      { value: 'all', label: 'All', icon: 'grid_view' },
      ...cats.map(cat => ({ value: cat, label: cat, icon: 'label' })),
    ];
  }, [sections]);

  const featuredSection = useMemo(() => {
    if (activeCategory === 'all') {
      return sections.find(s => s.featured) ?? null;
    }
    return sections.find(s => s.featured && s.category === activeCategory) ?? null;
  }, [sections, activeCategory]);

  const feedSections = useMemo(() => {
    const withoutFeatured = sections.filter(s => s.id !== featuredSection?.id);
    if (activeCategory === 'all') return withoutFeatured;
    return withoutFeatured.filter(s => s.category === activeCategory);
  }, [sections, featuredSection, activeCategory]);

  const groupedData = useMemo(() => {
    const grouped = feedSections.reduce<Record<string, CultureSection[]>>((acc, s) => {
      const key = s.category ?? 'Other';
      (acc[key] ??= []).push(s);
      return acc;
    }, {});
    
    const seen = new Set<string>();
    const categoryOrder: string[] = [];
    for (const s of feedSections) {
      const key = s.category ?? 'Other';
      if (!seen.has(key)) { seen.add(key); categoryOrder.push(key); }
    }
    return { grouped, categoryOrder };
  }, [feedSections]);

  return {
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
  };
}
