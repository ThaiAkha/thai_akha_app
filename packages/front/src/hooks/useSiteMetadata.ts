/**
 * useSiteMetadata - i campi "di contorno" di una riga site_metadata (#86 F3).
 *
 * Prima 5 componenti (FaqBottomPage, PageEssentials, PageMeta, SiblingInfoSection,
 * getPageFaqs) leggevano la STESSA riga con 5 query separate, ciascuna raddoppiata
 * da StrictMode: 10 chiamate per pagina. Ora una sola query TanStack per slug,
 * chiave `['site_metadata_extras', slug]`; ogni consumer prende il campo che gli serve.
 *
 * Usage:
 *   const { extras, loading } = useSiteMetadata('home');
 *   extras?.dates.published · extras?.faqRefs · extras?.cherry.prompt ...
 */

import { useQuery } from '@thaiakha/shared/query';
import { getPageExtras, type SiteMetadataExtras } from '@thaiakha/shared/services';

export type { SiteMetadataExtras };

export const siteMetadataExtrasQueryKey = (slug: string) => ['site_metadata_extras', slug] as const;

export function useSiteMetadata(slug: string | undefined, options: { enabled?: boolean } = {}): {
  extras: SiteMetadataExtras | null;
  loading: boolean;
} {
  const key = slug ?? '';
  const enabled = (options.enabled ?? true) && key.length > 0;
  const query = useQuery({
    queryKey: siteMetadataExtrasQueryKey(key),
    queryFn: () => getPageExtras(key),
    enabled,
  });
  return { extras: query.data ?? null, loading: enabled && query.isPending };
}

export default useSiteMetadata;
