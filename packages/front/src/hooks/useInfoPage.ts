import { useQuery } from '@thaiakha/shared/query';
import { getInfoPage } from '../services/infoPages.service';

export const infoPageQueryKey = (slug: string) => ['info_page', slug] as const;

/**
 * Documento di una info-page (Terms, Privacy, story About) da info_page_sections +
 * site_metadata, via getInfoPage. `enabled: false` per i lettori lazy (modal privacy
 * della pagina auth): la prima apertura legge, le successive trovano la cache.
 */
export function useInfoPage(slug: string, options: { enabled?: boolean } = {}) {
  const enabled = options.enabled ?? true;
  const query = useQuery({
    queryKey: infoPageQueryKey(slug),
    queryFn: () => getInfoPage(slug),
    enabled,
  });
  return { document: query.data ?? null, loading: enabled && query.isPending };
}
