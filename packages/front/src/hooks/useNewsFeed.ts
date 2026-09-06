import { useMemo, useState } from 'react';
import { useQuery } from '@thaiakha/shared/query';
import { newsService } from '@thaiakha/shared/services';
import { NewsArticle } from '@thaiakha/shared/types';
import { t } from '../i18n';
import { useContentCategories } from './useContentCategories';
import { usePageMetadata } from './usePageMetadata';
import { useLanguage } from '../context/LanguageContext';

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

export const newsFeedQueryKey = (lang = 'en') => ['news_feed', lang] as const;

/**
 * Feed news: metadata pagina + categorie blog + articoli. Data layer unico (CLAUDE.md #17):
 * era un Promise.all in useEffect; ora tre query in cache (metadata e categorie condivise).
 */
export function useNewsFeed(targetCategory: string | null = null) {
    const { lang } = useLanguage();
    const { metadata: meta, loading: metaLoading } = usePageMetadata('thai-cooking-tips-news');
    const { categories: cats, loading: catsLoading } = useContentCategories('blog');
    const feed = useQuery({
        queryKey: newsFeedQueryKey(lang),
        queryFn: () => newsService.getNewsFeed(lang),
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

    const [searchQuery, setSearchQuery] = useState('');
    const [sortBy, setSortBy] = useState<'latest' | 'oldest' | 'by-id'>('by-id');

    /**
     * Il secondo segmento dell'URL puo' essere una CATEGORIA o lo slug di un
     * articolo, e si distinguono solo confrontandolo con le categorie caricate.
     *
     * Era scritto come due stati piu' un effetto che li ricalcolava: ma nessun
     * setter usciva dall'hook e l'effetto leggeva solo i suoi due ingredienti,
     * quindi era gia' una funzione pura travestita da stato. Finche' le categorie
     * non sono arrivate si assume "slug", come prima, per non far lampeggiare la
     * griglia degli articoli.
     */
    const { activeCategoryState, activeSlugState } = useMemo(() => {
        if (!targetCategory || targetCategory === 'all') {
            return { activeCategoryState: 'all', activeSlugState: null as string | null };
        }
        if (categories.length > 0 && categories.some(c => c.id === targetCategory)) {
            return { activeCategoryState: targetCategory, activeSlugState: null as string | null };
        }
        return { activeCategoryState: 'all', activeSlugState: targetCategory };
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
        articles: filteredArticles,
        allArticles: articles,
        tabItems,
        activeCategory: activeCategoryState,
        activeSlug: activeSlugState,
        searchQuery,
        setSearchQuery,
        sortBy,
        setSortBy,
        loading,
        isInitialLoading: loading && articles.length === 0,
    };
}
