import { useMemo } from 'react';
import { newsService } from '@thaiakha/shared/services';
import { NewsArticle, NewsDetail } from '@thaiakha/shared/types';
import { useContentDetail } from './useContentDetail';
import { pickRelatedPair } from './contentDetail/pickRelatedPair';

export type { NewsDetail };

export function useNewsDetail(slug: string, articles: NewsArticle[]) {
    const fetcher = useMemo(() => (s: string, l: string) => newsService.getNewsDetailBySlug(s, l), []);

    const { detail, previous: seqPrev, next: seqNext, loading, error } =
        useContentDetail<NewsDetail, NewsArticle>({
            cacheKey: 'news_detail',
            slug,
            listItems: articles,
            fetcher,
        });

    const { previous, next } = useMemo(
        () => pickRelatedPair<NewsArticle>({
            relatedIds: detail?.related_articles,
            items: articles,
            slug,
            seqPrev,
            seqNext,
        }),
        [detail, articles, seqPrev, seqNext, slug],
    );

    return { detail, previous, next, loading, error };
}
