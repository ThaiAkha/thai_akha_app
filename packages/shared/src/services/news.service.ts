import { supabase } from '@thaiakha/shared/lib/supabase';
import { NewsArticle, NewsDetail, FrontHomeCard } from '../types';
import { fetchWithCache } from './_cache';

export const newsService = {

    /** 📰 NEWS FEED: Lista articoli pubblicati per il feed index */
    async getNewsFeed(): Promise<NewsArticle[]> {
        const data = await fetchWithCache<NewsArticle[]>('news_feed_v1', async () => {
            const { data, error } = await supabase
                .from('akha_news')
                .select(`
                    id, news_id, slug, title, excerpt, cover_asset_id, read_time_minutes, published_at, canonical_url, hreflang,
                    category:content_categories(id, title, slug),
                    cover_data:media_assets!cover_asset_id(image_url, alt_text, title)
                `)
                .eq('is_published', true)
                .order('published_at', { ascending: false });
            if (error) { console.error('[newsService] getNewsFeed:', error); return []; }
            return (data ?? []) as unknown as NewsArticle[];
        });
        return data ?? [];
    },

    /** 📰 NEWS DETAIL BY SLUG: Record completo per la single news page */
    async getNewsDetailBySlug(slug: string): Promise<NewsDetail | null> {
        return fetchWithCache<NewsDetail>(`news_detail_${slug}_v3`, async () => {
            const { data, error } = await supabase
                .from('akha_news')
                .select(`
                    *,
                    category:content_categories(id, title, slug),
                    author:authors(name, title, description, avatar:media_assets!avatar_asset_id(image_url, alt_text)),
                    cover_data:media_assets!cover_asset_id(image_url, alt_text, title)
                `)
                .eq('slug', slug)
                .eq('is_published', true)
                .maybeSingle();
            if (error) { console.error(`[newsService] getNewsDetailBySlug [${slug}]:`, error); return null; }
            if (!data) return null;
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
        sectionIds: readonly string[]
    ): Promise<T[]> {
        // Data layer #86: nessuna cache qui (la possiede TanStack, front usePageSections).
        // L'errore viene rilanciato: cosi' `error`/retry della query hanno senso.
        if (sectionIds.length === 0) return [];
        const { data, error } = await supabase
            .from('page_sections')
            .select('section_id, title, subtitle, description, highlight, tag_badge, image_asset_id, button_text, button_link_url, open_in_new_tab, cherry_prompt, cherry_response, bullets, cards')
            .in('section_id', sectionIds);
        if (error) { console.error('[newsService] getPageSections:', error); throw error; }
        return (data ?? []) as T[];
    },

    /**
     * 🏠 FRONT HOME CARDS: Card B2C dalla tabella home_cards_front.
     * NON confondere con home_cards (B2B) usata da contentMetadataService.getHomeCards().
     */
    async getFrontHomeCards(cardIds?: readonly string[]): Promise<FrontHomeCard[]> {
        // Data layer #86: nessuna cache qui (la possiede TanStack, front useFrontHomeCards).
        let query = supabase.from('home_cards_front').select('*, cover_data:media_assets!image_asset_id(image_url, alt_text, title)').eq('is_active', true);
        if (cardIds && cardIds.length > 0) query = query.in('card_id', cardIds as string[]);
        const { data, error } = await query.order('display_order');
        if (error) { console.error('[newsService] getFrontHomeCards:', error); throw error; }
        let result = (data ?? []) as FrontHomeCard[];
        if (cardIds?.length) {
            result = [...result].sort((a, b) =>
                cardIds.indexOf(a.card_id ?? '') - cardIds.indexOf(b.card_id ?? '')
            );
        }
        return result;
    },
};
