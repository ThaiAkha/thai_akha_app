import { useMemo } from 'react';
import { useQuery } from '@thaiakha/shared/query';
import {
  contentMetadataService,
  translatedSlugService,
  buildPageSeo,
  seoService,
  type PageHeaderMetadata,
  type SiteMetadataRow,
} from '@thaiakha/shared/services';
import { PREFIX_ROUTES_ACTIVE } from '@thaiakha/shared/lib/i18n';
import { pageMetadataQueryKey } from './usePageMetadata';
import { useBusinessProfile } from './useBusinessProfile';

/** A livello di modulo: TanStack riesegue `select` solo se cambia il riferimento. */
const selectSeoRow = (d: PageHeaderMetadata | null): SiteMetadataRow | null => d?.seoRow ?? null;

/**
 * Meta dei motori per lo slug di pagina.
 *
 * @param slug SEMPRE lo slug INGLESE (identita' DB): la traduzione dell'URL la fa
 *             il router prima di arrivare qui.
 * @param lang Lingua da servire: 'en' legge la base, le altre fondono il sidecar.
 *
 * Dal 2026-09-06 NON e' piu' una lettura sua: e' una PROIEZIONE della stessa
 * query di `usePageMetadata` (stessa chiave), come `useSiteMetadata`. La stessa
 * riga di site_metadata si leggeva due volte per pagina, la seconda in fila
 * alla prima: ora una volta. Le due dipendenze esterne dei meta, il profilo
 * aziendale (solo per le pagine che ce l'hanno: la home) e il registro degli
 * slug tradotti (solo a lingue accese), sono due query dipendenti, e i meta si
 * costruiscono con `buildPageSeo`, pura, dentro un useMemo.
 *
 * L'ATTESA COPRE ANCHE IL REGISTRO. `SEOHead` scrive il <head> una volta,
 * atomico, quando `loading` cade: se il registro fosse fuori dall'attesa, per
 * un giro di rete il canonical e gli hreflang punterebbero allo slug inglese
 * sotto ogni prefisso, per poi correggersi. A lingue spente quel termine e'
 * costante-falso e il comportamento e' identico a prima. Ad aspettare e' solo
 * questo hook: header, sezioni e Page Essentials leggono la stessa chiave e non
 * aspettano ne' il profilo ne' il registro.
 */
export const useSEO = (slug: string, lang: string = 'en') => {
  const enabled = slug.length > 0;

  const row = useQuery({
    queryKey: pageMetadataQueryKey(slug, 'site_metadata', lang),
    queryFn: () => contentMetadataService.getPageMetadata(slug, 'site_metadata', lang),
    select: selectSeoRow,
    enabled,
  });

  const needsBusiness = !!row.data?.business_profile_id;
  const { profile, loading: bpLoading } = useBusinessProfile({ enabled: needsBusiness });

  const alternatesQuery = useQuery({
    queryKey: ['seo', 'page_alternates', slug] as const,
    queryFn: () => translatedSlugService.getAlternatesForSlug(slug),
    enabled: PREFIX_ROUTES_ACTIVE && enabled,
  });

  const metadata = useMemo(
    () => buildPageSeo(row.data ?? null, lang, {
      businessProfile: profile,
      alternates: alternatesQuery.data ?? {},
    }) ?? seoService.getDefaultMetadata(),
    [row.data, lang, profile, alternatesQuery.data],
  );

  const loading = enabled && (
    row.isPending ||
    (needsBusiness && bpLoading) ||
    (PREFIX_ROUTES_ACTIVE && alternatesQuery.isPending)
  );

  return { metadata: !enabled || loading ? null : metadata, loading };
};
