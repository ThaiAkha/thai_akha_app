import { useQuery } from '@thaiakha/shared/query';
import { contentService } from '@thaiakha/shared/services';
import type { MediaAsset } from '@thaiakha/shared/types';
import type { NewsArticle } from './useNewsFeed';

/**
 * Dati extra della pagina ClassOverview: news in evidenza + card "why choose us".
 *
 * Data layer unico (CLAUDE.md #17): era `useEffect + useState + cancelled`, l'ultimo
 * fetch a mano rimasto nella famiglia delle pagine classi. Stessa coppia di chiamate
 * nello stesso `Promise.all`, in una query sola.
 */
const NEWS_IDS = ['news-00', 'news-01', 'news-02'];
const REASON_IDS = [
  'why-chose-us-01', 'why-chose-us-02', 'why-chose-us-03',
  'why-chose-us-04', 'why-chose-us-05', 'why-chose-us-06',
];

/** Vuoti stabili: un `[]` inline creerebbe un riferimento nuovo a ogni render. */
const NO_NEWS: NewsArticle[] = [];
const NO_REASONS: MediaAsset[] = [];

export const classOverviewExtrasQueryKey = ['class_overview_extras'] as const;

export const useClassOverviewExtras = () => {
  const query = useQuery({
    queryKey: classOverviewExtrasQueryKey,
    queryFn: async () => {
      const [news, reasonsData] = await Promise.all([
        contentService.getNewsByNewsIds(NEWS_IDS),
        contentService.getMediaAssetsByIds(REASON_IDS),
      ]);
      // I service restituiscono Record<string, unknown>[]: shape reale = NewsArticle / MediaAsset
      // (come consumate in ClassOverview).
      return {
        featuredNews: news as unknown as NewsArticle[],
        reasons: reasonsData as unknown as MediaAsset[],
      };
    },
  });

  return {
    featuredNews: query.data?.featuredNews ?? NO_NEWS,
    reasons: query.data?.reasons ?? NO_REASONS,
    loading: query.isPending,
  };
};
