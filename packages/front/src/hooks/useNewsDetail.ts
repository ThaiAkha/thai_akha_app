import { useMemo } from 'react';
import { newsService } from '@thaiakha/shared/services';
import { NewsArticle, NewsDetail } from '@thaiakha/shared/types';
import { useContentDetail } from './useContentDetail';

export type { NewsDetail };

export function useNewsDetail(slug: string, articles: NewsArticle[]) {
    const fetcher = useMemo(() => (s: string) => newsService.getNewsDetailBySlug(s), []);

    const { detail, previous: seqPrev, next: seqNext, loading, error } =
        useContentDetail<NewsDetail, NewsArticle>({
            slug,
            listItems: articles,
            fetcher,
        });

    const { previous, next } = useMemo(() => {
        let prev: NewsArticle | null = null;
        let nxt: NewsArticle | null = null;

        if (detail?.related_articles && detail.related_articles.length > 0) {
            prev = articles.find(a => a.slug === detail.related_articles![0] || a.id === detail.related_articles![0]) ?? null;
            nxt = detail.related_articles!.length > 1
                ? articles.find(a => a.slug === detail.related_articles![1] || a.id === detail.related_articles![1]) ?? null
                : null;
        } else {
            prev = seqPrev;
            nxt = seqNext;
        }

        // Always ensure 2 cards: if one or both directions are missing, pick any other article
        if (!prev && !nxt) {
            prev = articles.find(a => a.slug !== slug) ?? null;
            nxt = articles.find(a => a.slug !== slug && a.slug !== prev?.slug) ?? null;
        } else if (!prev && nxt) {
            prev = articles.find(a => a.slug !== slug && a.slug !== nxt!.slug) ?? null;
        } else if (!nxt && prev) {
            nxt = articles.find(a => a.slug !== slug && a.slug !== prev!.slug) ?? null;
        }

        return { previous: prev, next: nxt };
    }, [detail, articles, seqPrev, seqNext, slug]);

    return { detail, previous, next, loading, error };
}
