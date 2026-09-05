import { supabase } from '@thaiakha/shared/lib/supabase';
import { CultureSection, CultureSectionDetail, CultureGalleryItem } from '../types';
import { fetchWithCache, normalizeLang } from './_cache';
import { sidecarJoin, sidecarFilter, mergeSidecarRow, mergeSidecarRows } from '../lib/mergeTranslation';

/** Campi di CONTENUTO dei sidecar del mondo cultura (`slug` escluso: fonte = registro slug). */
const CULTURE_T_FIELDS = [
    'title', 'subtitle', 'content', 'quote', 'seo_title', 'seo_description', 'og_title', 'og_description',
] as const;
/** La galleria traduce solo la didascalia. */
const GALLERY_T_FIELDS = ['quote'] as const;
/** La categoria viaggia dentro la card cultura. */
const CULTURE_EMBEDDED = ['category'] as const;

/**
 * Colonne servite al browser per una sezione di cultura: tutte tranne
 * `semantic_vector` (vector 1536, circa 19 KB di testo per riga) e
 * `seo_audit_logs` (diario dell'admin, cresce nel tempo). Nessuna delle due ha
 * un lettore nel front: erano peso puro sulla query principale della pagina.
 */
const CULTURE_SECTION_COLUMNS =
    'audio_asset_id, author_id, breadcrumbs, canonical_url, category_id,' +
    'cherry_button_ids, cherry_prompt, cherry_response, content, content_quality_score,' +
    'cover_asset_id, display_order, featured, hreflang, id, is_published, json_ld,' +
    'key_entities, last_content_audit_ai, og_description, og_image, og_title, og_type,' +
    'primary_focus_keyword, published_at, quote, reading_time_minutes, related_articles,' +
    'related_queries_geo, seo_description, seo_health_score, seo_keywords, seo_robots,' +
    'seo_title, slug, subtitle, summary_ai, title, twitter_card, updated_at, view_count';

export const cultureService = {

    /** 🏛️ CULTURE SECTIONS INDEX: Cards for the History/Culture index page */
    async getCultureSections(lang = 'en'): Promise<CultureSection[]> {
        const l = normalizeLang(lang);
        // v7: select cambiata (join sidecar) + lingua nella chiave.
        const data = await fetchWithCache<CultureSection[]>(`culture_sections_index_${l}_v7`, async () => {
            const query = sidecarFilter(supabase
                .from('culture_sections')
                .select(`
                    id, slug, title, subtitle, quote, cover_asset_id, display_order, featured, audio_asset_id, seo_title, canonical_url, hreflang,
                    cover_data:media_assets!cover_asset_id(image_url, alt_text, title),
                    category:content_categories(id, title, slug${sidecarJoin('content_categories_translations', ['title'], l)})
                `+ sidecarJoin('culture_sections_translations', CULTURE_T_FIELDS, l))
                .eq('is_published', true)
                .order('display_order', { ascending: true }), l, CULTURE_EMBEDDED);
            const { data, error } = await query;

            if (error) {
                console.error('Culture sections fetch error:', error);
                return [];
            }

            return mergeSidecarRows<CultureSection>(data, l, CULTURE_EMBEDDED);
        });
        return data || [];
    },



    /** 🏛️ CULTURE SECTION DETAIL: Full record for a single culture section */
    async getCultureSectionBySlug(slug: string, lang = 'en'): Promise<CultureSectionDetail | null> {
        const l = normalizeLang(lang);
        // v4: select cambiata (join sidecar) + lingua nella chiave.
        // v5: select a colonne esplicite (via semantic_vector e seo_audit_logs).
        return fetchWithCache<CultureSectionDetail>(`culture_section_${slug}_${l}_v5`, async () => {
            const query = sidecarFilter(supabase
                .from('culture_sections')
                .select(`
                    ${CULTURE_SECTION_COLUMNS},
                    author:authors(name, title, description, avatar:media_assets!avatar_asset_id(image_url, alt_text)),
                    cover_data:media_assets!cover_asset_id(image_url, alt_text, title)
                `+ sidecarJoin('culture_sections_translations', CULTURE_T_FIELDS, l))
                .eq('slug', slug), l);
            const { data, error } = await query.single();

            if (error) {
                console.error(`Culture section fetch error [${slug}]:`, error);
                return null;
            }

            // Resolve author avatar_asset_id → media_assets; keep author.avatar_url alias.
            const result = mergeSidecarRow(data, l);
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
        // v3: le colonne sono esplicite; `media_assets(*)` portava un vettore di
        // embedding per ogni foto della galleria.
        const data = await fetchWithCache<CultureGalleryItem[]>(`culture_gallery_${galleryId}_${l}_v3`, async () => {
            const query = sidecarFilter(supabase
                .from('gallery_items')
                .select('id, gallery_id, asset_id, display_order, quote, media_assets(asset_id, image_url, title, caption, alt_text)' + sidecarJoin('gallery_items_translations', GALLERY_T_FIELDS, l))
                .eq('gallery_id', galleryId)
                .order('display_order', { ascending: true }), l);
            const { data, error } = await query;

            if (error) {
                console.error(`Culture gallery fetch error [${galleryId}]:`, error);
                return [];
            }

            return mergeSidecarRows<CultureGalleryItem>(data, l);
        });
        return data || [];
    },
};
