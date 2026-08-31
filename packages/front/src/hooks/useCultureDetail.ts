import { useMemo } from 'react';
import { cultureService } from '@thaiakha/shared/services';
import { CultureSectionDetail, CultureGalleryItem, CultureSection } from '@thaiakha/shared/types';
import { useContentDetail } from './useContentDetail';

export function useCultureDetail(slug: string, sections: CultureSection[]) {
    const fetcher = useMemo(() => (s: string) => cultureService.getCultureSectionBySlug(s), []);
    const secondaryFetcher = useMemo(() => (s: string) => cultureService.getCultureGallery(s), []);

    const { detail, secondaryData, previous: seqPrev, next: seqNext, loading, error } =
        useContentDetail<CultureSectionDetail, CultureSection>({
            cacheKey: 'culture_detail',
            slug,
            listItems: sections,
            fetcher,
            secondaryFetcher,
        });

    const { previous, next } = useMemo(() => {
        let prev: CultureSection | null = null;
        let nxt: CultureSection | null = null;

        if (detail?.related_articles && detail.related_articles.length > 0) {
            prev = sections.find(s => s.slug === detail.related_articles![0] || s.id === detail.related_articles![0]) ?? null;
            nxt = detail.related_articles!.length > 1
                ? sections.find(s => s.slug === detail.related_articles![1] || s.id === detail.related_articles![1]) ?? null
                : null;
        } else {
            prev = seqPrev;
            nxt = seqNext;
        }

        // Always ensure 2 cards: if one or both directions are missing, pick any other section
        if (!prev && !nxt) {
            prev = sections.find(s => s.slug !== slug) ?? null;
            nxt = sections.find(s => s.slug !== slug && s.slug !== prev?.slug) ?? null;
        } else if (!prev && nxt) {
            prev = sections.find(s => s.slug !== slug && s.slug !== nxt!.slug) ?? null;
        } else if (!nxt && prev) {
            nxt = sections.find(s => s.slug !== slug && s.slug !== prev!.slug) ?? null;
        }

        return { previous: prev, next: nxt };
    }, [detail, sections, seqPrev, seqNext, slug]);

    return {
        section: detail,
        galleryItems: (secondaryData as CultureGalleryItem[]) ?? [],
        previous,
        next,
        loading,
        error,
    };
}
