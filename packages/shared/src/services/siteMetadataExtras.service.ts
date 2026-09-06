/**
 * site_metadata - "contorno" di una pagina: pagine sorelle (sibling_slugs) e campi extra
 * (Cherry entry-point, page_essentials, date, faq_refs). Estratto da contentMetadata.service.ts
 * (#16 split monstre) a comportamento invariato; nessuna cache qui, la possiede TanStack
 * (front `useSiteMetadata`, `SiblingInfoSection`).
 */
import { supabase } from '../lib/supabase';
import { normalizeLang } from './_cache';
import { sidecarJoin, sidecarFilter, mergeSidecarRows } from '../lib/mergeTranslation';

/** Campi tradotti mostrati nelle card "pagine sorelle". */
const SIBLING_T_FIELDS = ['header_title_main', 'header_title_highlight', 'page_description'] as const;

/** La forma della riga sorella dopo il merge: le colonne della select, niente di piu'. */
interface SiblingRow {
    page_slug: string;
    header_title_main: string | null;
    header_title_highlight: string | null;
    page_description: string | null;
    cover_media: { image_url?: string } | null;
}

/**
 * 🔄 SIBLING PAGES (by slugs): metadata + cover per una lista ordinata di slug.
 * Il front la usa con `sibling_slugs` letto da getPageExtras (data layer #86:
 * una sola riga site_metadata per pagina, poi questa query per le sorelle).
 */
export async function getSiblingPagesBySlugs(slugs: readonly string[], lang = 'en'): Promise<SiblingPageMeta[]> {
    if (slugs.length === 0) return [];

    const l = normalizeLang(lang);
    // Step 2: fetch metadata + cover image for each sibling slug
    const query = sidecarFilter(supabase
        .from('site_metadata')
        .select(`
            page_slug,
            header_title_main,
            header_title_highlight,
            page_description,
            cover_media:media_assets!cover_asset_id(image_url)
        `+ sidecarJoin('site_metadata_translations', SIBLING_T_FIELDS, l))
        .in('page_slug', slugs), l);
    const { data: rawSiblings, error: e2 } = await query;

    if (e2 || !rawSiblings) return [];
    const data = mergeSidecarRows<SiblingRow>(rawSiblings, l);

    // Preserve order defined in sibling_slugs, resolve cover_media → hero_image_url alias
    return slugs
        .map(s => {
            const d = data.find(d => d.page_slug === s);
            if (!d) return null;
            const coverMedia = d.cover_media;
            return {
                page_slug: d.page_slug,
                header_title_main: d.header_title_main,
                header_title_highlight: d.header_title_highlight ?? null,
                page_description: d.page_description ?? null,
                hero_image_url: coverMedia?.image_url ?? null,
            };
        })
        .filter(Boolean) as SiblingPageMeta[];
}

/**
 * Qui vivevano `getSiblingPagesBySlug` (singolare) e `getPageExtras`.
 *
 * La prima non aveva chiamanti da tempo; la seconda li ha persi il 2026-09-05,
 * quando i campi di contorno sono passati dentro `getPageMetadata` (una riga
 * sola invece di due letture della stessa). Restavano esportate come se fossero
 * vive, e `getPageExtras` fondeva il sidecar con una lista di campi piu' povera
 * di quella dell'header: chi l'avesse riusata avrebbe avuto meno traduzioni
 * senza accorgersene. Rimosse.
 */

export interface SiblingPageMeta {
    page_slug: string;
    header_title_main: string;
    header_title_highlight: string | null;
    page_description: string | null;
    hero_image_url: string | null; // resolved from cover_asset_id -> media_assets
}

/** Campi di contorno di site_metadata (vedi getPageExtras). */
export interface SiteMetadataExtras {
    cherry: { prompt: string | null; response: string | null; buttonIds: string[] | null };
    essentials: Record<string, unknown> | null;
    /** Versione del documento legale (Terms, Privacy, FAQ): la mostra LegalMetaBanner. */
    legalVersion: string | null;
    dates: { published: string | null; modified: string | null };
    faqRefs: string[];
    siblingSlugs: string[];
}
