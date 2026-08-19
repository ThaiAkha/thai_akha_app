/**
 * site_metadata - "contorno" di una pagina: pagine sorelle (sibling_slugs) e campi extra
 * (Cherry entry-point, page_essentials, date, faq_refs). Estratto da contentMetadata.service.ts
 * (#16 split monstre) a comportamento invariato; nessuna cache qui, la possiede TanStack
 * (front `useSiteMetadata`, `SiblingInfoSection`).
 */
import { supabase } from '../lib/supabase';

/**
 * 🔄 SIBLING PAGES: Given a page_slug, reads sibling_slugs[] from site_metadata
 * and returns the full metadata for each sibling.
 * Returns [] if no siblings defined for this slug.
 */
export async function getSiblingPagesBySlug(currentSlug: string): Promise<SiblingPageMeta[]> {
    // Step 1: fetch sibling_slugs for current page
    const { data: current, error: e1 } = await supabase
        .from('site_metadata')
        .select('sibling_slugs')
        .eq('page_slug', currentSlug)
        .single();

    if (e1 || !current?.sibling_slugs?.length) return [];
    return getSiblingPagesBySlugs(current.sibling_slugs);
}

/**
 * 🔄 SIBLING PAGES (by slugs): metadata + cover per una lista ordinata di slug.
 * Il front la usa con `sibling_slugs` letto da getPageExtras (data layer #86:
 * una sola riga site_metadata per pagina, poi questa query per le sorelle).
 */
export async function getSiblingPagesBySlugs(slugs: readonly string[]): Promise<SiblingPageMeta[]> {
    if (slugs.length === 0) return [];

    // Step 2: fetch metadata + cover image for each sibling slug
    const { data, error: e2 } = await supabase
        .from('site_metadata')
        .select(`
            page_slug,
            header_title_main,
            header_title_highlight,
            page_description,
            cover_media:media_assets!cover_asset_id(image_url)
        `)
        .in('page_slug', slugs);

    if (e2 || !data) return [];

    // Preserve order defined in sibling_slugs, resolve cover_media → hero_image_url alias
    return slugs
        .map(s => {
            const d = data.find(d => d.page_slug === s);
            if (!d) return null;
            const coverMedia = (d as Record<string, unknown>).cover_media as { image_url?: string } | null;
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
 * 📎 PAGE EXTRAS (data layer #86): i campi "di contorno" di una riga site_metadata
 * che prima 5 componenti leggevano con 5 query separate (Cherry entry-point,
 * page_essentials, date, faq_refs, sibling_slugs). Nessuna cache qui: la
 * possiede TanStack (front `useSiteMetadata`). Ritorna null se la riga manca.
 */
export async function getPageExtras(slug: string): Promise<SiteMetadataExtras | null> {
    if (!slug) return null;
    const { data, error } = await supabase
        .from('site_metadata')
        .select('cherry_prompt, cherry_response, cherry_button_ids, page_essentials, date_published, date_modified, faq_refs, sibling_slugs')
        .eq('page_slug', slug)
        .maybeSingle();
    if (error) {
        console.error('[contentMetadataService] getPageExtras:', error);
        throw error;
    }
    if (!data) return null;
    const row = data as Record<string, unknown>;
    return {
        cherry: {
            prompt: (row.cherry_prompt as string | null) ?? null,
            response: (row.cherry_response as string | null) ?? null,
            buttonIds: (row.cherry_button_ids as string[] | null) ?? null,
        },
        essentials: (row.page_essentials as Record<string, unknown> | null) ?? null,
        dates: {
            published: (row.date_published as string | null) ?? null,
            modified: (row.date_modified as string | null) ?? null,
        },
        faqRefs: Array.isArray(row.faq_refs) ? (row.faq_refs as string[]) : [],
        siblingSlugs: Array.isArray(row.sibling_slugs) ? (row.sibling_slugs as string[]) : [],
    };
}

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
    dates: { published: string | null; modified: string | null };
    faqRefs: string[];
    siblingSlugs: string[];
}
