import { useQuery } from '@thaiakha/shared/query';
import { getInfoPage } from '../services/infoPages.service';
import { useLanguage } from '../context/LanguageContext';

export const infoPageQueryKey = (slug: string, lang = 'en') => ['info_page', lang, slug] as const;

/**
 * Documento di una info-page (Terms, Privacy, story About) da info_page_sections +
 * site_metadata, via getInfoPage. `enabled: false` per i lettori lazy (modal privacy
 * della pagina auth): la prima apertura legge, le successive trovano la cache.
 */
export function useInfoPage(slug: string, options: { enabled?: boolean } = {}) {
  const enabled = options.enabled ?? true;
  const { lang } = useLanguage();
  const query = useQuery({
    queryKey: infoPageQueryKey(slug, lang),
    queryFn: () => getInfoPage(slug, lang),
    enabled,
  });
  return { document: query.data ?? null, loading: enabled && query.isPending };
}
