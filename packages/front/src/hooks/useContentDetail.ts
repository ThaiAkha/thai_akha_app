import { useMemo } from 'react';
import { useQuery, keepPreviousData } from '@thaiakha/shared/query';

interface UseContentDetailOptions<TDetail, TListItem extends { slug: string }> {
    /** Prefisso della chiave di cache (es. 'news_detail'): una funzione fetcher non e' una chiave. */
    cacheKey: string;
    slug: string;
    listItems: TListItem[];
    fetcher: (slug: string) => Promise<TDetail | null>;
    secondaryFetcher?: (slug: string) => Promise<unknown>;
}

interface UseContentDetailResult<TDetail, TListItem> {
    detail: TDetail | null;
    secondaryData: unknown;
    previous: TListItem | null;
    next: TListItem | null;
    loading: boolean;
    error: boolean;
}

/**
 * Generic hook for slug-based content detail pages with prev/next navigation.
 *
 * Usage:
 *   const { detail, previous, next, loading, error } = useContentDetail({
 *     cacheKey: 'news_detail',
 *     slug,
 *     listItems: articles,
 *     fetcher: (s) => newsService.getNewsDetailBySlug(s),
 *   });
 *
 * Data layer unico (CLAUDE.md #17): una useQuery per (cacheKey, slug). Al cambio slug il
 * dettaglio precedente resta a schermo finche' arriva il nuovo (com'era: lo stato veniva
 * sostituito solo a risposta arrivata) e `loading` e' vero nel frattempo.
 */
export function useContentDetail<TDetail, TListItem extends { slug: string }>(
    options: UseContentDetailOptions<TDetail, TListItem>
): UseContentDetailResult<TDetail, TListItem> {
    const { cacheKey, slug, listItems, fetcher, secondaryFetcher } = options;

    const query = useQuery({
        queryKey: [cacheKey, slug] as const,
        enabled: slug.length > 0,
        queryFn: async () => {
            const [detail, secondary] = await Promise.all([
                fetcher(slug),
                secondaryFetcher ? secondaryFetcher(slug) : Promise.resolve(null),
            ]);
            return { detail, secondary };
        },
        placeholderData: keepPreviousData,
    });

    const { previous, next } = useMemo(() => {
        const idx = listItems.findIndex(item => item.slug === slug);
        if (idx === -1) return { previous: null, next: null };
        return {
            previous: idx > 0 ? listItems[idx - 1] : null,
            next: idx < listItems.length - 1 ? listItems[idx + 1] : null,
        };
    }, [slug, listItems]);

    // Senza slug si resta in attesa (com'era); con lo slug: in attesa o col dettaglio precedente.
    const loading = !slug || query.isPending || query.isPlaceholderData;
    // Errore di rete, oppure slug sconosciuto (fetcher → null).
    const error = query.isError || (query.data !== undefined && !query.isPlaceholderData && query.data.detail === null);

    return {
        detail: query.data?.detail ?? null,
        secondaryData: query.data?.secondary ?? null,
        previous,
        next,
        loading,
        error,
    };
}
