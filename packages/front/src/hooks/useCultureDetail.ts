import { useMemo } from 'react';
import { cultureService } from '@thaiakha/shared/services';
import { CultureSectionDetail, CultureGalleryItem, CultureSection } from '@thaiakha/shared/types';
import { useContentDetail } from './useContentDetail';
import { pickRelatedPair } from './contentDetail/pickRelatedPair';

export function useCultureDetail(slug: string, sections: CultureSection[]) {
    const fetcher = useMemo(() => (s: string, l: string) => cultureService.getCultureSectionBySlug(s, l), []);
    const secondaryFetcher = useMemo(() => (s: string, l: string) => cultureService.getCultureGallery(s, l), []);

    const { detail, secondaryData, previous: seqPrev, next: seqNext, loading, error } =
        useContentDetail<CultureSectionDetail, CultureSection>({
            cacheKey: 'culture_detail',
            slug,
            listItems: sections,
            fetcher,
            secondaryFetcher,
        });

    const { previous, next } = useMemo(
        () => pickRelatedPair<CultureSection>({
            relatedIds: detail?.related_articles,
            items: sections,
            slug,
            seqPrev,
            seqNext,
        }),
        [detail, sections, seqPrev, seqNext, slug],
    );

    return {
        section: detail,
        galleryItems: (secondaryData as CultureGalleryItem[]) ?? [],
        previous,
        next,
        loading,
        error,
    };
}
