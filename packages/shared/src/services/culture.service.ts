import { supabase } from '@thaiakha/shared/lib/supabase';
import { CultureSection, CultureSectionDetail, CultureGalleryItem } from '../types';
import { fetchWithCache } from './_cache';

export const cultureService = {

    /** 🏛️ CULTURE SECTIONS INDEX: Cards for the History/Culture index page */
    async getCultureSections(): Promise<CultureSection[]> {
        const data = await fetchWithCache<CultureSection[]>('culture_sections_index_v6', async () => {
            const { data, error } = await supabase
                .from('culture_sections')
                .select(`
                    id, slug, title, subtitle, quote, cover_asset_id, display_order, featured, audio_asset_id, seo_title, canonical_url, hreflang,
                    cover_data:media_assets!cover_asset_id(image_url, alt_text, title),
                    category:content_categories(id, title, slug)
                `)
                .eq('is_published', true)
                .order('display_order', { ascending: true });

            if (error) {
                console.error('Culture sections fetch error:', error);
                return [];
            }

            return (data || []) as unknown as CultureSection[];
        });
        return data || [];
    },

    /** 🏛️ CULTURE SECTION DETAIL: Full record for a single culture section */
    async getCultureSectionBySlug(slug: string): Promise<CultureSectionDetail | null> {
        return fetchWithCache<CultureSectionDetail>(`culture_section_${slug}_v3`, async () => {
            const { data, error } = await supabase
                .from('culture_sections')
                .select(`
                    *,
                    author:authors(name, title, description, avatar:media_assets!avatar_asset_id(image_url, alt_text)),
                    cover_data:media_assets!cover_asset_id(image_url, alt_text, title)
                `)
                .eq('slug', slug)
                .single();

            if (error) {
                console.error(`Culture section fetch error [${slug}]:`, error);
                return null;
            }

            // Resolve author avatar_asset_id → media_assets; keep author.avatar_url alias.
            const result = data as Record<string, unknown>;
            const author = result.author as Record<string, unknown> | null;
            if (author) {
                const av = author.avatar as { image_url?: string } | null;
                author.avatar_url = av?.image_url ?? null;
            }
            return result as unknown as CultureSectionDetail;
        });
    },

    /** 🖼️ CULTURE GALLERY: Gallery items joined with media_assets for a culture section */
    async getCultureGallery(galleryId: string): Promise<CultureGalleryItem[]> {
        const data = await fetchWithCache<CultureGalleryItem[]>(`culture_gallery_${galleryId}_v1`, async () => {
            const { data, error } = await supabase
                .from('gallery_items')
                .select('*, media_assets(*)')
                .eq('gallery_id', galleryId)
                .order('display_order', { ascending: true });

            if (error) {
                console.error(`Culture gallery fetch error [${galleryId}]:`, error);
                return [];
            }

            return (data || []) as CultureGalleryItem[];
        });
        return data || [];
    },
};
