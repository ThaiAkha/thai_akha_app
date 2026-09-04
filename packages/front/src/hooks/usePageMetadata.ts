/**
 * usePageMetadata - metadata header di una pagina (site_metadata → HeaderMetadata + imageUrl).
 *
 * Data layer (#86): una query TanStack per (table, lang, slug), stessa chiave usata
 * da usePageSections({ metadataSlug }) e dall'admin (site_metadata_admin): PageLayout,
 * HeaderMenu, InfoPageHero e la pagina che chiedono lo stesso slug condividono UNA chiamata.
 *
 * Usage:
 *   const { metadata, loading } = usePageMetadata('home');
 */
import { useQuery } from '@thaiakha/shared/query';
import { contentMetadataService } from '@thaiakha/shared/services';
import type { HeaderMetadata } from '@thaiakha/shared';
import { useLanguage } from '../context/LanguageContext';

export type PageMetadata = HeaderMetadata & { imageUrl: string };

export const pageMetadataQueryKey = (slug: string, table = 'site_metadata', lang = 'en') =>
  ['page_metadata', table, lang, slug] as const;

export function usePageMetadata(slug: string | undefined, options: { enabled?: boolean } = {}): {
  metadata: PageMetadata | null;
  loading: boolean;
} {
  const key = slug ?? '';
  const enabled = (options.enabled ?? true) && key.length > 0;
  // La chiave aveva gia' lo slot `lang` ma riceveva sempre il default 'en': il
  // servizio sapeva fondere il sidecar, nessuno gli diceva in che lingua. Da qui
  // passano header, badge e Page Essentials di OGNI pagina del front.
  const { lang } = useLanguage();
  const query = useQuery({
    queryKey: pageMetadataQueryKey(key, 'site_metadata', lang),
    queryFn: () => contentMetadataService.getPageMetadata(key, 'site_metadata', lang),
    enabled,
  });
  return { metadata: query.data ?? null, loading: enabled && query.isPending };
}

export default usePageMetadata;
