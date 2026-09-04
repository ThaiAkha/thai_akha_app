import { supabase } from '@thaiakha/shared/lib/supabase';
import { CultureSection, CultureSectionDetail, CultureGalleryItem } from '../types';
import { fetchWithCache, normalizeLang } from './_cache';
import { sidecarJoin, mergeSidecarRow, mergeSidecarRows } from '../lib/mergeTranslation';

/** Campi di CONTENUTO dei sidecar del mondo cultura (`slug` escluso: fonte = registro slug). */
const CULTURE_T_FIELDS = [
    'title', 'subtitle', 'content', 'quote', 'seo_title', 'seo_description', 'og_title', 'og_description',
] as const;
/** La galleria traduce solo la didascalia. */
const GALLERY_T_FIELDS = ['quote'] as const;
/** La categoria viaggia dentro la card cultura. */
const CULTURE_EMBEDDED = ['category'] as const;

export const cultureService = {

    /** 🏛️ CULTURE SECTIONS INDEX: Cards for the History/Culture index page */
    async getCultureSections(lang = 'en'): Promise<CultureSection[]> {
        const l = normalizeLang(lang);
        // v7: select cambiata (join sidecar) + lingua nella chiave.
        const data = await fetchWithCache<CultureSection[]>(`culture_sections_index_${l}_v7`, async () => {
            let query = supabase
                .from('culture_sections')
                .select(`
                    id, slug, title, subtitle, quote, cover_asset_id, display_order, featured, audio_asset_id, seo_title, canonical_url, hreflang,
                    cover_data:media_assets!cover_asset_id(image_url, alt_text, title),
                    category:content_categories(id, title, slug${sidecarJoin('content_categories_translations', ['title'], l)})
                `+ sidecarJoin('culture_sections_translations', CULTURE_T_FIELDS, l))
                .eq('is_published', true)
                .order('display_order', { ascending: true });
            if (l !== 'en') {
                query = query.eq('translations.lang', l).eq('category.translations.lang', l);
            }
            const { data, error } = await query;

            if (error) {
                console.error('Culture sections fetch error:', error);
                return [];
            }

            // Cast unico (regola repo #20): PostgREST non inferisce la select concatenata.
            return mergeSidecarRows(data as unknown as Record<string, unknown>[], l, CULTURE_EMBEDDED) as unknown as CultureSection[];
        });
        return data || [];
    },

    /** 🏛️ CULTURE SECTION DETAIL: Full record for a single culture section */
    async getCultureSectionBySlug(slug: string, lang = 'en'): Promise<CultureSectionDetail | null> {
        const l = normalizeLang(lang);
        // v4: select cambiata (join sidecar) + lingua nella chiave.
        return fetchWithCache<CultureSectionDetail>(`culture_section_${slug}_${l}_v4`, async () => {
            let query = supabase
                .from('culture_sections')
                .select(`
                    *,
                    author:authors(name, title, description, avatar:media_assets!avatar_asset_id(image_url, alt_text)),
                    cover_data:media_assets!cover_asset_id(image_url, alt_text, title)
                `+ sidecarJoin('culture_sections_translations', CULTURE_T_FIELDS, l))
                .eq('slug', slug);
            if (l !== 'en') query = query.eq('translations.lang', l);
            const { data, error } = await query.single();

            if (error) {
                console.error(`Culture section fetch error [${slug}]:`, error);
                return null;
            }

            // Resolve author avatar_asset_id → media_assets; keep author.avatar_url alias.
            // Cast unico (regola repo #20): PostgREST non inferisce la select concatenata.
            const result = mergeSidecarRow(data as unknown as Record<string, unknown>, l);
            const author = result.author as Record<string, unknown> | null;
            if (author) {
                const av = author.avatar as { image_url?: string } | null;
                author.avatar_url = av?.image_url ?? null;
            }
            return result as unknown as CultureSectionDetail;
        });
    },

    /** 🖼️ CULTURE GALLERY: Gallery items joined with media_assets for a culture section */
    async getCultureGallery(galleryId: string, lang = 'en'): Promise<CultureGalleryItem[]> {
        const l = normalizeLang(lang);
        // v2: select cambiata (join sidecar) + lingua nella chiave. NB: il sidecar
        // gallery_items_translations oggi e' VUOTO: il lettore c'e', le didascalie
        // restano inglesi finche' /translate-db non lo riempie.
        const data = await fetchWithCache<CultureGalleryItem[]>(`culture_gallery_${galleryId}_${l}_v2`, async () => {
            let query = supabase
                .from('gallery_items')
                .select('*, media_assets(*)' + sidecarJoin('gallery_items_translations', GALLERY_T_FIELDS, l))
                .eq('gallery_id', galleryId)
                .order('display_order', { ascending: true });
            if (l !== 'en') query = query.eq('translations.lang', l);
            const { data, error } = await query;

            if (error) {
                console.error(`Culture gallery fetch error [${galleryId}]:`, error);
                return [];
            }

            // Cast unico (regola repo #20): PostgREST non inferisce la select concatenata.
            return mergeSidecarRows(data as unknown as Record<string, unknown>[], l) as unknown as CultureGalleryItem[];
        });
        return data || [];
    },
};
