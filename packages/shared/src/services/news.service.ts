import { supabase } from '@thaiakha/shared/lib/supabase';
import { NewsArticle, NewsDetail, FrontHomeCard } from '../types';
import { fetchWithCache, normalizeLang } from './_cache';
import { sidecarJoin, sidecarFilter, mergeSidecarRow, mergeSidecarRows } from '../lib/mergeTranslation';

/**
 * Campi di CONTENUTO dei due sidecar della home. Sono i soli che il merge deve
 * poter sovrascrivere: l'immagine, il link, l'ordine e i flag restano sulla base
 * (una traduzione non cambia quale foto si vede ne' dove porta il bottone).
 */
const PAGE_SECTION_T_FIELDS = [
    'tag_badge', 'title', 'highlight', 'subtitle', 'description', 'button_text', 'bullets', 'cards',
] as const;

/** Campi di CONTENUTO del sidecar news (`slug` escluso: fonte = registro slug). */
export const NEWS_T_FIELDS = [
    'title', 'subtitle', 'excerpt', 'content', 'seo_title', 'seo_description', 'og_title', 'og_description',
] as const;

/** La categoria viaggia dentro la card/dettaglio news e va fusa allo stesso giro. */
const NEWS_EMBEDDED = ['category'] as const;

const HOME_CARD_T_FIELDS = [
    'title', 'description', 'link_label', 'suffix_extra_1', 'extra_1', 'suffix_extra_2', 'extra_2',
] as const;

export const newsService = {

    /** 📰 NEWS FEED: Lista articoli pubblicati per il feed index */
    async getNewsFeed(lang = 'en'): Promise<NewsArticle[]> {
        const l = normalizeLang(lang);
        // v2: select cambiata (join sidecar) + lingua nella chiave.
        const data = await fetchWithCache<NewsArticle[]>(`news_feed_${l}_v2`, async () => {
            const query = sidecarFilter(supabase
                .from('akha_news')
                .select(`
                    id, news_id, slug, title, excerpt, cover_asset_id, read_time_minutes, published_at, canonical_url, hreflang,
                    category:content_categories(id, title, slug${sidecarJoin('content_categories_translations', ['title'], l)}),
                    cover_data:media_assets!cover_asset_id(image_url, alt_text, title)
                `+ sidecarJoin('akha_news_translations', NEWS_T_FIELDS, l))
                .eq('is_published', true)
                .order('published_at', { ascending: false }), l, NEWS_EMBEDDED);
            const { data, error } = await query;
            if (error) { console.error('[newsService] getNewsFeed:', error); return []; }
            return mergeSidecarRows<NewsArticle>(data, l, NEWS_EMBEDDED);
        });
        return data ?? [];
    },

    /** 📰 NEWS DETAIL BY SLUG: Record completo per la single news page */
    async getNewsDetailBySlug(slug: string, lang = 'en'): Promise<NewsDetail | null> {
        const l = normalizeLang(lang);
        // v4: select cambiata (join sidecar) + lingua nella chiave.
        return fetchWithCache<NewsDetail>(`news_detail_${slug}_${l}_v4`, async () => {
            const query = sidecarFilter(supabase
                .from('akha_news')
                .select(`
                    *,
                    category:content_categories(id, title, slug${sidecarJoin('content_categories_translations', ['title'], l)}),
                    author:authors(name, title, description, avatar:media_assets!avatar_asset_id(image_url, alt_text)),
                    cover_data:media_assets!cover_asset_id(image_url, alt_text, title)
                `+ sidecarJoin('akha_news_translations', NEWS_T_FIELDS, l))
                .eq('slug', slug)
                .eq('is_published', true), l, NEWS_EMBEDDED);
            const { data: raw, error } = await query.maybeSingle();
            if (error) { console.error(`[newsService] getNewsDetailBySlug [${slug}]:`, error); return null; }
            if (!raw) return null;
            const data = mergeSidecarRow(raw, l, NEWS_EMBEDDED);
            // Resolve author avatar_asset_id → media_assets; keep author.avatar_url alias.
            const result = data as Record<string, unknown>;
            const author = result.author as Record<string, unknown> | null;
            if (author) {
                const av = author.avatar as { image_url?: string } | null;
                author.avatar_url = av?.image_url ?? null;
            }
            return result as unknown as NewsDetail;
        });
    },

    /** 🏠 PAGE SECTIONS: Fetch sezioni per section_id — usato dalla home page */
    async getPageSections<T extends { section_id: string }>(
        sectionIds: readonly string[],
        lang = 'en'
    ): Promise<T[]> {
        // Data layer #86: nessuna cache qui (la possiede TanStack, front usePageSections).
        // L'errore viene rilanciato: cosi' `error`/retry della query hanno senso.
        if (sectionIds.length === 0) return [];
        const l = normalizeLang(lang);
        const query = sidecarFilter(supabase
            .from('page_sections')
            .select('section_id, title, subtitle, description, highlight, tag_badge, image_asset_id, button_text, button_link_url, open_in_new_tab, cherry_prompt, cherry_response, bullets, cards, youtube_video_id'
                + sidecarJoin('page_sections_translations', PAGE_SECTION_T_FIELDS, l))
            .in('section_id', sectionIds), l);
        const { data, error } = await query;
        if (error) { console.error('[newsService] getPageSections:', error); throw error; }
        return mergeSidecarRows<T>(data, l);
    },

    /**
     * 🏠 FRONT HOME CARDS: Card B2C dalla tabella home_cards_front.
     * NON confondere con home_cards (B2B) usata da contentMetadataService.getHomeCards().
     */
    async getFrontHomeCards(cardIds?: readonly string[], lang = 'en'): Promise<FrontHomeCard[]> {
        // Data layer #86: nessuna cache qui (la possiede TanStack, front useFrontHomeCards).
        const l = normalizeLang(lang);
        let query = supabase.from('home_cards_front')
            .select('*, cover_data:media_assets!image_asset_id(image_url, alt_text, title)'
                + sidecarJoin('home_cards_front_translations', HOME_CARD_T_FIELDS, l))
            .eq('is_active', true);
        if (cardIds && cardIds.length > 0) query = query.in('card_id', cardIds as string[]);
        query = sidecarFilter(query, l);
        const { data, error } = await query.order('display_order');
        if (error) { console.error('[newsService] getFrontHomeCards:', error); throw error; }
        let result = mergeSidecarRows<FrontHomeCard>(data, l);
        if (cardIds?.length) {
            result = [...result].sort((a, b) =>
                cardIds.indexOf(a.card_id ?? '') - cardIds.indexOf(b.card_id ?? '')
            );
        }
        return result;
    },
};
