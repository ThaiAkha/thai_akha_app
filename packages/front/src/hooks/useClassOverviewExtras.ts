import { useQuery } from '@thaiakha/shared/query';
import { useLanguage } from '../context/LanguageContext';
import { contentService } from '@thaiakha/shared/services';
import type { CookingClassDB, MediaAsset } from '@thaiakha/shared/types';
import type { NewsArticle } from './useNewsFeed';

/**
 * Dati extra della pagina ClassOverview: news in evidenza + card "why choose us"
 * + video delle classi (#117: gli id YouTube vivono in cooking_classes, non nel .tsx).
 *
 * Data layer unico (CLAUDE.md #17): era `useEffect + useState + cancelled`, l'ultimo
 * fetch a mano rimasto nella famiglia delle pagine classi. Stesse chiamate
 * nello stesso `Promise.all`, in una query sola.
 */
const NEWS_IDS = ['news-00', 'news-01', 'news-02'];
const REASON_IDS = [
  'why-chose-us-01', 'why-chose-us-02', 'why-chose-us-03',
  'why-chose-us-04', 'why-chose-us-05', 'why-chose-us-06',
];

/** Ordine di display dei video di classe nella griglia "Kitchen Spirit" (morning prima). */
const CLASS_VIDEO_ORDER = ['morning_class', 'evening_class'];

/** Vuoti stabili: un `[]` inline creerebbe un riferimento nuovo a ogni render. */
const NO_NEWS: NewsArticle[] = [];
const NO_REASONS: MediaAsset[] = [];
const NO_VIDEOS: string[] = [];

export const classOverviewExtrasQueryKey = (lang = 'en') => ['class_overview_extras', lang] as const;

export const useClassOverviewExtras = () => {
  const { lang } = useLanguage();
  const query = useQuery({
    queryKey: classOverviewExtrasQueryKey(lang),
    queryFn: async () => {
      const [news, reasonsData, classes] = await Promise.all([
        contentService.getNewsByNewsIds(NEWS_IDS, lang),
        contentService.getMediaAssetsByIds(REASON_IDS),
        contentService.getCookingClasses(lang),
      ]);
      // I service restituiscono Record<string, unknown>[]: shape reale = NewsArticle / MediaAsset
      // (come consumate in ClassOverview).
      return {
        featuredNews: news as unknown as NewsArticle[],
        reasons: reasonsData as unknown as MediaAsset[],
        // Video di classe in ordine fisso (getCookingClasses ordina per prezzo, non per display).
        classVideoIds: CLASS_VIDEO_ORDER
          .map((id) => classes.find((c: CookingClassDB) => c.id === id)?.youtube_video_id)
          .filter((v): v is string => Boolean(v)),
      };
    },
  });

  return {
    featuredNews: query.data?.featuredNews ?? NO_NEWS,
    reasons: query.data?.reasons ?? NO_REASONS,
    classVideoIds: query.data?.classVideoIds ?? NO_VIDEOS,
    loading: query.isPending,
  };
};
