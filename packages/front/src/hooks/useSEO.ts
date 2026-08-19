import { useQuery } from '@thaiakha/shared/query';
import { seoService, PageMetadata } from '@thaiakha/shared';

export const seoMetadataQueryKey = (slug: string, lang: string) =>
  ['seo_metadata', 'site_metadata', lang, slug] as const;

/**
 * Hook to manage SEO metadata state for a specific page slug.
 *
 * @param slug The page identifier - SEMPRE lo slug INGLESE (identita' DB).
 *             La traduzione dell'URL la fa il router prima di arrivare qui.
 * @param lang Lingua da servire: 'en' legge la base, le altre fondono il sidecar
 *             campo per campo (vedi lib/mergeTranslation.ts).
 * @returns { metadata, loading } SEO metadata and loading state
 *
 * Data layer (#86): una query TanStack per (lang, slug). SEOHead globale e la
 * pagina che leggono lo stesso slug condividono UNA chiamata; StrictMode non raddoppia.
 * Su errore/miss torna i default (come prima), mai `null` dopo il caricamento.
 */
export const useSEO = (slug: string, lang: string = 'en') => {
  const query = useQuery({
    queryKey: seoMetadataQueryKey(slug, lang),
    queryFn: async (): Promise<PageMetadata> => {
      try {
        const data = await seoService.fetchMetadataForSlug(slug, 'site_metadata', lang);
        return data ?? seoService.getDefaultMetadata();
      } catch (error) {
        console.error(`[SEO] Failed to fetch metadata for slug: ${slug}`, error);
        return seoService.getDefaultMetadata();
      }
    },
    enabled: slug.length > 0,
  });
  return { metadata: query.data ?? null, loading: slug.length > 0 && query.isPending };
};
