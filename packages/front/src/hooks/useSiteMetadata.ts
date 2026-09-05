/**
 * useSiteMetadata - i campi "di contorno" di una riga site_metadata (#86 F3).
 *
 * Prima 5 componenti (FaqBottomPage, PageEssentials, PageMeta, SiblingInfoSection,
 * getPageFaqs) leggevano la STESSA riga con 5 query separate, ciascuna raddoppiata
 * da StrictMode: 10 chiamate per pagina. Poi una sola query, ma su una chiave sua.
 *
 * Dal 2026-09-05 non e' piu' nemmeno una query: e' una PROIEZIONE di quella
 * dell'header (`usePageMetadata`, stessa riga, stessa chiave). Prima la stessa
 * pagina leggeva site_metadata due volte, e nelle pagine che aspettano il layout
 * la seconda partiva solo dopo la prima. Ora chi chiede l'header e chi chiede il
 * contorno condividono una chiamata sola.
 *
 * Usage:
 *   const { extras, loading } = useSiteMetadata('home');
 *   extras?.dates.published · extras?.faqRefs · extras?.cherry.prompt ...
 */

import { useQuery } from '@thaiakha/shared/query';
import { contentMetadataService, type SiteMetadataExtras } from '@thaiakha/shared/services';
import { useLanguage } from '../context/LanguageContext';
import { pageMetadataQueryKey } from './usePageMetadata';

export type { SiteMetadataExtras };

export function useSiteMetadata(slug: string | undefined, options: { enabled?: boolean } = {}): {
  extras: SiteMetadataExtras | null;
  loading: boolean;
} {
  const key = slug ?? '';
  const enabled = (options.enabled ?? true) && key.length > 0;
  const { lang } = useLanguage();
  const query = useQuery({
    // STESSA chiave di usePageMetadata: TanStack riconosce la richiesta come una
    // sola, chiunque dei due arrivi per primo.
    queryKey: pageMetadataQueryKey(key, 'site_metadata', lang),
    queryFn: () => contentMetadataService.getPageMetadata(key, 'site_metadata', lang),
    select: (data) => data?.extras ?? null,
    enabled,
  });
  return { extras: query.data ?? null, loading: enabled && query.isPending };
}

export default useSiteMetadata;
