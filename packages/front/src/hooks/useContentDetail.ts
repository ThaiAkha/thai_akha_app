import { useState, useEffect, useMemo } from 'react';

interface UseContentDetailOptions<TDetail, TListItem extends { slug: string }> {
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
 *     slug,
 *     listItems: articles,
 *     fetcher: (s) => newsService.getNewsDetailBySlug(s),
 *   });
 *
 * Define fetcher/secondaryFetcher with useMemo outside to keep them stable
 * across renders (avoids effect re-firing on every render).
 */
export function useContentDetail<TDetail, TListItem extends { slug: string }>(
    options: UseContentDetailOptions<TDetail, TListItem>
): UseContentDetailResult<TDetail, TListItem> {
    const { slug, listItems, fetcher, secondaryFetcher } = options;

    const [detail, setDetail] = useState<TDetail | null>(null);
    const [secondaryData, setSecondaryData] = useState<unknown>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    useEffect(() => {
        if (!slug) return;

        let mounted = true;
        setLoading(true);
        setError(false);

        Promise.all([
            fetcher(slug),
            secondaryFetcher ? secondaryFetcher(slug) : Promise.resolve(null),
        ])
            .then(([detailResult, secondary]) => {
                if (!mounted) return;
                if (!detailResult) { setError(true); return; }
                setDetail(detailResult);
                setSecondaryData(secondary);
            })
            .catch((e) => {
                console.error('[useContentDetail]', e);
                if (mounted) setError(true);
            })
            .finally(() => {
                if (mounted) setLoading(false);
            });

        return () => { mounted = false; };
    }, [slug]); // fetcher/secondaryFetcher must be stable (use useMemo in wrapper)

    const { previous, next } = useMemo(() => {
        const idx = listItems.findIndex(item => item.slug === slug);
        if (idx === -1) return { previous: null, next: null };
        return {
            previous: idx > 0 ? listItems[idx - 1] : null,
            next: idx < listItems.length - 1 ? listItems[idx + 1] : null,
        };
    }, [slug, listItems]);

    return { detail, secondaryData, previous, next, loading, error };
}
