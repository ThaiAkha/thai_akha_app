import { useState, useEffect } from 'react';
import { contentService } from '@thaiakha/shared/services';

/**
 * Dati extra della pagina ClassOverview: news in evidenza + card "why choose us".
 * Pattern hook standard (come useClassPageData / useClassesPageSections) —
 * niente fetch inline nella pagina.
 */
export const useClassOverviewExtras = () => {
  const [featuredNews, setFeaturedNews] = useState<any[]>([]);
  const [reasons, setReasons] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const loadData = async () => {
      setLoading(true);
      try {
        const [news, reasonsData] = await Promise.all([
          contentService.getNewsByNewsIds(['news-00', 'news-01', 'news-02']),
          contentService.getMediaAssetsByIds(['why-chose-us-01', 'why-chose-us-02', 'why-chose-us-03', 'why-chose-us-04', 'why-chose-us-05', 'why-chose-us-06']),
        ]);
        if (!cancelled) {
          setFeaturedNews(news);
          setReasons(reasonsData);
        }
      } catch (error) {
        console.error('Error loading class overview extras:', error);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    loadData();
    return () => { cancelled = true; };
  }, []);

  return { featuredNews, reasons, loading };
};
