import { useEffect, useMemo, useState } from 'react';
import { useQuery } from '@thaiakha/shared/query';
import { newsService } from '@thaiakha/shared/services';
import { NewsArticle } from '@thaiakha/shared/types';
import { t } from '../i18n';
import { useContentCategories } from './useContentCategories';
import { usePageMetadata } from './usePageMetadata';

export type { NewsArticle };

// UI-only types — not domain data, stay local
export interface NewsMetadata {
    header_title_main: string;
    header_title_highlight?: string;
    header_badge?: string;
    page_description?: string;
    hero_image_url?: string;
    seo_title?: string;
    seo_description?: string;
    seo_robots?: string;
    og_image?: string;
    json_ld?: Record<string, unknown> | null;
}

export interface NewsCategory {
    id: string;
    title: string;
    tab_label?: string | null;
    icon_name: string;
}

const NO_ARTICLES: NewsArticle[] = [];

export const newsFeedQueryKey = ['news_feed'] as const;

/**
 * Feed news: metadata pagina + categorie blog + articoli. Data layer unico (CLAUDE.md #17):
 * era un Promise.all in useEffect; ora tre query in cache (metadata e categorie condivise).
 */
export function useNewsFeed(targetCategory: string | null = null) {
    const { metadata: meta, loading: metaLoading } = usePageMetadata('thai-cooking-tips-news');
    const { categories: cats, loading: catsLoading } = useContentCategories('blog');
    const feed = useQuery({
        queryKey: newsFeedQueryKey,
        queryFn: () => newsService.getNewsFeed(),
    });

    const metadata = useMemo<NewsMetadata | null>(() => meta ? {
        header_title_main: meta.titleMain ?? '',
        header_title_highlight: meta.titleHighlight ?? undefined,
        header_badge: meta.badge ?? undefined,
        page_description: meta.description ?? undefined,
        hero_image_url: meta.imageUrl ?? undefined,
        seo_title: meta.seoTitle ?? undefined,
        seo_description: meta.seoDescription ?? undefined,
        seo_robots: meta.robots ?? undefined,
        og_image: meta.ogImage ?? undefined,
        json_ld: (meta.jsonLd as Record<string, unknown> | null | undefined) ?? null,
    } : null, [meta]);

    const categories = useMemo<NewsCategory[]>(() => cats.map(c => ({
        id: c.id,
        title: c.title,
        tab_label: c.tab_label,
        icon_name: c.icon_name ?? '',
    })), [cats]);

    const articles = feed.data ?? NO_ARTICLES;
    const loading = metaLoading || catsLoading || feed.isPending;

    const [activeCategoryState, setActiveCategoryState] = useState<string>('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [sortBy, setSortBy] = useState<'latest' | 'oldest' | 'by-id'>('by-id');
    const [currentPage, setCurrentPage] = useState(1);

    // Reset to page 1 when filters change
    useEffect(() => {
        setCurrentPage(1);
    }, [activeCategoryState, searchQuery, sortBy]);

    // Eagerly assume targetCategory is a slug to avoid flash of news grid.
    // The useEffect below corrects it to a category filter once categories load.
    const [activeSlugState, setActiveSlugState] = useState<string | null>(
        targetCategory && targetCategory !== 'all' ? targetCategory : null
    );

    // Correct the assumption once categories are loaded
    useEffect(() => {
        if (!targetCategory || targetCategory === 'all') {
            setActiveCategoryState('all');
            setActiveSlugState(null);
        } else if (categories.length > 0) {
            if (categories.some(c => c.id === targetCategory)) {
                // It's a category filter, not a slug
                setActiveCategoryState(targetCategory);
                setActiveSlugState(null);
            } else {
                // It's an article slug
                setActiveCategoryState('all');
                setActiveSlugState(targetCategory);
            }
        }
        // If categories not loaded yet, keep initial assumption (slug)
    }, [targetCategory, categories]);

    // 1. Filter by Category
    let filteredArticles = activeCategoryState === 'all'
        ? articles
        : articles.filter(a => {
            const catId = typeof a.category === 'object' ? a.category?.id : a.category;
            return catId === activeCategoryState;
        });

    // 2. Filter by Search Query
    if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        filteredArticles = filteredArticles.filter(a =>
            a.title.toLowerCase().includes(query) ||
            (a.excerpt && a.excerpt.toLowerCase().includes(query))
        );
    }

    // 3. Sort
    filteredArticles = [...filteredArticles].sort((a, b) => {
        if (sortBy === 'by-id') {
            const idA = a.news_id || '';
            const idB = b.news_id || '';
            return idA.localeCompare(idB, undefined, { numeric: true, sensitivity: 'base' });
        }
        const dateA = new Date(a.published_at || 0).getTime();
        const dateB = new Date(b.published_at || 0).getTime();
        return sortBy === 'latest' ? dateB - dateA : dateA - dateB;
    });

    // 4. Pagination (Disabled - returning all articles)
    const totalPages = 1;
    const paginatedArticles = filteredArticles;

    const activeCategories = categories.filter(c =>
        articles.some(a => {
            const catId = typeof a.category === 'object' ? a.category?.id : a.category;
            return catId === c.id;
        })
    );

    const tabItems = [
        { value: 'all', label: t('news:tabAll'), icon: 'newspaper' as string },
        ...activeCategories.map(c => ({
            value: c.id,
            label: c.tab_label || c.title,
            icon: c.icon_name as string,
        })),
    ];

    return {
        metadata,
        pageMetadata: metadata,
        categories,
        articles: paginatedArticles,
        allArticles: articles,
        tabItems,
        activeCategory: activeCategoryState,
        activeSlug: activeSlugState,
        searchQuery,
        setSearchQuery,
        sortBy,
        setSortBy,
        currentPage,
        setCurrentPage,
        totalPages,
        loading,
        isLoading: loading,
        isInitialLoading: loading && articles.length === 0,
    };
}
