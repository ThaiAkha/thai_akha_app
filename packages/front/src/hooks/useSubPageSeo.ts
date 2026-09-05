import { useMemo } from 'react';
import { useQuery } from '@thaiakha/shared/query';
import { translatedSlugService, buildSubPageHreflang, SITE_URL } from '@thaiakha/shared/services';
import { PREFIX_ROUTES_ACTIVE } from '@thaiakha/shared/lib/i18n';
import { useLanguage } from '../context/LanguageContext';
import { buildLangPath } from '../lib/langRouting';

export interface SubPageSeo {
  /** URL canonico della pagina NELLA lingua corrente (a lista vuota: quello inglese di sempre). */
  canonical: string;
  /** Mappa hreflang per PageSEO. `undefined` = niente alternate (come oggi dove non c'erano). */
  hreflang: Record<string, string> | undefined;
}

/**
 * Canonical e hreflang di una SOTTO-PAGINA (hub + slug): ricette, sezioni culture,
 * articoli news, ingredienti e categorie ingrediente. Un punto solo per le 5 pagine
 * che prima costruivano l'URL a mano o passavano la colonna DB `hreflang`, che
 * contiene solo `en` (task #205, prerequisito dell'accensione #197).
 *
 * A LISTA LINGUE VUOTA IL DOM RESTA IDENTICO A OGGI, per costruzione:
 *  - canonical: `buildLangPath('en', [hub, slug], null)` = `/hub/slug`, cioe' lo stesso
 *    valore che stava in `canonical_url` (verificato uguale su 253/253 righe il 05/09);
 *  - hreflang: si ripassa la colonna DB com'era (`dbHreflang`), senza interrogare il registro.
 *
 * A lista accesa: canonical localizzato nella lingua corrente; hreflang da
 * `v_translated_slugs` per hub e slug, tutte le lingue attive + x-default inglese.
 * Finche' il registro non e' arrivato non si emette nulla: meglio nessun alternate
 * che un alternate sbagliato per un frame.
 */
export function useSubPageSeo(
  hubEn: string,
  slugEn: string | null | undefined,
  dbHreflang?: Record<string, string> | null,
): SubPageSeo {
  const { lang, slugMap } = useLanguage();
  const slug = slugEn ?? '';

  const canonical = `${SITE_URL}${buildLangPath(lang, [hubEn, slug], slugMap)}`;

  const { data: alternates } = useQuery({
    queryKey: ['seo', 'subpage_alternates', hubEn, slug],
    queryFn: async () => {
      const [hub, page] = await Promise.all([
        translatedSlugService.getAlternatesForSlug(hubEn),
        translatedSlugService.getAlternatesForSlug(slug),
      ]);
      return { hub, page };
    },
    enabled: PREFIX_ROUTES_ACTIVE && slug.length > 0,
  });

  const hreflang = useMemo<Record<string, string> | undefined>(() => {
    if (!PREFIX_ROUTES_ACTIVE) return dbHreflang ?? undefined;
    if (!alternates || !slug) return undefined;
    return buildSubPageHreflang(hubEn, slug, alternates.hub, alternates.page);
  }, [alternates, dbHreflang, hubEn, slug]);

  return { canonical, hreflang };
}
