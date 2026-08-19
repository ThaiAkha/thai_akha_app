import { useQuery } from '@thaiakha/shared/query';
import { contentService } from '@thaiakha/shared/services';
import { useTranslation } from 'react-i18next';

/**
 * Hook per pagine che hanno bisogno di metadata locale (site_metadata_admin).
 * Carica metadata dal database e lo restituisce per uso nel rendering.
 *
 * Esempio: AgencyHome usa metadata per popolare WelcomeHero component
 *
 * @param slug - Page slug (es. 'agency-home', 'agency-news')
 * @returns { pageMeta, loading } - metadata e loading state
 *
 * **Nota:** AppHeader gestisce automaticamente setPageHeader()
 * Questo hook serve SOLO per ottenere metadata per rendering locale.
 *
 * Data layer (#86): cache TanStack per (table, lang, slug) - stessa convenzione
 * di chiave del front (`['page_metadata', table, lang, slug]`), cosi' AppHeader e
 * la pagina che chiedono lo stesso slug condividono UNA query.
 */
type RawPageMeta = NonNullable<Awaited<ReturnType<typeof contentService.getPageMetadata>>>;
/** Vista per i componenti: i `null` del DB diventano `undefined` (prop opzionali React). */
export type AdminPageMeta = { [K in keyof RawPageMeta]: Exclude<RawPageMeta[K], null> | undefined };

function stripNulls(meta: RawPageMeta): AdminPageMeta {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(meta)) out[k] = v ?? undefined;
    return out as AdminPageMeta;
}

export const adminPageMetadataQueryKey = (slug: string, lang: string) =>
    ['page_metadata', 'site_metadata_admin', lang, slug] as const;

export function usePageMetadata(slug: string) {
    const { i18n } = useTranslation();
    const query = useQuery({
        queryKey: adminPageMetadataQueryKey(slug, i18n.language),
        queryFn: async () => {
            try {
                const meta = await contentService.getPageMetadata(slug, 'site_metadata_admin', i18n.language);
                return meta ? stripNulls(meta) : null;
            } catch (error) {
                console.error(`Failed to load metadata for ${slug}:`, error);
                return null;
            }
        },
        enabled: slug.length > 0,
    });
    return { pageMeta: query.data ?? null, loading: slug.length > 0 && query.isPending };
}
