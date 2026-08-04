import { supabase } from '@thaiakha/shared/lib/supabase';
import { HeaderMetadata, ContentCategoryDB, BusinessProfile } from '../types';
import { fetchWithCache, normalizeLang } from './_cache';

/**
 * Colonne pubbliche di content_categories servite al browser.
 * Esclude i campi SOLO server-side e pesanti: `semantic_vector` (vector(1536),
 * ~30KB/riga — usato solo per la ricerca semantica lato edge), `seo_audit_logs`
 * (log audit admin) e `key_entities` (alimenta llms.txt/embeddings, non la UI).
 * Mai usare select('*') su questa tabella nel front: gonfia il payload React.
 */
export const CONTENT_CATEGORY_PUBLIC_COLUMNS =
    'id,domain,title,title_highlight,tab_label,subtitle,description,content_body,ui_quote,' +
    'cover_asset_id,icon_name,color_theme,avatar_asset_id,audio_story_url,chef_secrets,seo_keywords,' +
    'seo_priority,seo_title,seo_description,seo_robots,og_title,og_description,og_type,twitter_card,' +
    'json_ld,canonical_url,seo_health_score,last_seo_audit_at,hreflang,slug,cherry_prompt,' +
    'cherry_response,cherry_button_ids,summary_ai,breadcrumbs,last_content_audit_ai,' +
    'content_quality_score,related_queries_geo,author_id,dietary_variants,business_profile_id,' +
    'display_order,is_active,created_at,updated_at';

export const contentMetadataService = {

    /** 🏢 BUSINESS PROFILE: single-row LocalBusiness source of truth (NAP, geo, hours, rating, sameAs) */
    async getBusinessProfile(): Promise<BusinessProfile | null> {
        // v3: +contact_channels (bump = invalida cache localStorage v2)
        return fetchWithCache('business_profile_v3', async () => {
            const { data, error } = await supabase
                .from('business_profile')
                .select('id, name, legal_name, tax_id, latitude, longitude, street_address, address_locality, address_region, postal_code, address_country, telephone, email, business_type, service_type, price_range, area_served, service_radius, opening_hours, same_as, founding_date, timezone, google_place_id, has_map, aggregate_rating, contact_channels')
                .limit(1)
                .maybeSingle();

            if (error) {
                console.error('❌ Database error fetching business_profile:', error);
                return null;
            }
            return (data as unknown as BusinessProfile) ?? null;
        });
    },

    /** 📄 METADATA PAGINE: Titoli, descrizioni e immagini header */
    async getPageMetadata(slug: string, table: 'site_metadata' | 'site_metadata_admin' = 'site_metadata', lang = 'en'): Promise<HeaderMetadata & { imageUrl: string } | null> {
        const normalizedLang = normalizeLang(lang);
        return fetchWithCache(`meta_${table}_${slug}_${normalizedLang}_v10`, async () => {
            if (table === 'site_metadata_admin') {
                const { data, error } = await supabase
                    .from(table)
                    .select(`
                        id,
                        page_slug,
                        header_badge,
                        header_icon,
                        cover_asset_id,
                        cover_media:media_assets!cover_asset_id(image_url),
                        seo_robots,
                        canonical_url,
                        og_type,
                        twitter_card,
                        translations:site_metadata_admin_translations (
                            language,
                            title,
                            subtitle,
                            description
                        )
                    `)
                    .eq('page_slug', slug)
                    .maybeSingle();

                if (error) {
                    console.error('❌ Database error fetching metadata:', error);
                    return null;
                }
                if (!data) {
                    console.warn(`⚠️ No metadata found for slug: ${slug}`);
                    return null;
                }

                const translations = data.translations ?? [];
                const translation =
                    translations.find(t => t.language === normalizedLang) ||
                    translations.find(t => t.language === 'en') ||
                    translations[0];

                // Cover risolta da cover_asset_id → media_assets (fonte unica, come front/home_cards).
                const coverMedia = (data as Record<string, unknown>).cover_media as { image_url?: string } | null;
                const resolvedImageUrl = coverMedia?.image_url || '';

                return {
                    badge: data.header_badge,
                    icon: data.header_icon,
                    titleMain: translation?.title || (slug.charAt(0).toUpperCase() + slug.slice(1).replace('-', ' ')),
                    titleHighlight: translation?.subtitle || '',
                    description: translation?.description || '',
                    seoTitle: translation?.title || 'Thai Akha Kitchen',
                    imageUrl: resolvedImageUrl,
                    ogImage: resolvedImageUrl,
                    robots: data.seo_robots,
                    canonicalUrl: data.canonical_url,
                    ogType: data.og_type,
                    twitterCard: data.twitter_card,
                };
            }

            const { data, error } = await supabase
                .from(table)
                .select(`
                    header_badge,
                    header_icon,
                    header_title_main,
                    header_title_highlight,
                    page_description,
                    cover_asset_id,
                    cover_media:media_assets!cover_asset_id(image_url, alt_text),
                    seo_title,
                    seo_description,
                    og_title,
                    og_description,
                    og_type,
                    twitter_card,
                    canonical_url,
                    json_ld,
                    cherry_prompt,
                    cherry_response,
                    cherry_button_ids
                `)
                .eq('page_slug', slug)
                .maybeSingle();

            if (error || !data) return null;

            // Resolve cover image from media_assets join
            const coverMedia = (data as Record<string, unknown>).cover_media as { image_url?: string } | null;
            const resolvedImageUrl = coverMedia?.image_url || '';

            return {
                badge: data.header_badge,
                icon: data.header_icon,
                titleMain: data.header_title_main,
                titleHighlight: data.header_title_highlight,
                description: data.page_description,
                imageUrl: resolvedImageUrl,
                seoTitle: data.seo_title,
                seoDescription: data.seo_description,
                ogTitle: data.og_title,
                ogDescription: data.og_description,
                ogImage: resolvedImageUrl,
                ogType: data.og_type,
                twitterCard: data.twitter_card,
                canonicalUrl: data.canonical_url,
                jsonLd: data.json_ld as object | null,
                features: null,
                cherryPrompt: (data as Record<string, unknown>).cherry_prompt as string | null,
                cherryResponse: (data as Record<string, unknown>).cherry_response as string | null,
                cherryButtonIds: (data as Record<string, unknown>).cherry_button_ids as string[] | null,
            };
        });
    },

    /**
     * 🎴 MENU SIDEBAR: dinamico, con livelli di accesso.
     *
     * Modello UNICO per front e admin (dal 30 lug 2026):
     *   base inglese -> colonna `menu_label` sulla riga (sempre presente)
     *   altre lingue -> sidecar *_translations, che SOVRASCRIVE la base
     * Prima l'admin teneva l'etichetta solo nel sidecar: bastava creare una pagina senza
     * riga di traduzione perche' comparisse nel menu senza nome (successo con
     * agency-privacy). Ora la base sta sulla riga ed e' garantita da un CHECK.
     */
    async getMenuItems(table: 'site_metadata' | 'site_metadata_admin' = 'site_metadata', lang = 'en') {
        const normalizedLang = normalizeLang(lang);
        return fetchWithCache(`sidebar_menu_${table}_${normalizedLang}_v32`, async () => {
            // Le due query restano separate perche' il front distingue menu primario e
            // footer e non ha sidecar traduzioni. Cio' che conta e' che la REGOLA di
            // risoluzione dell'etichetta sia una sola (resolveLabel, sotto).
            if (table === 'site_metadata_admin') {
                const { data, error } = await supabase
                    .from('site_metadata_admin')
                    .select(`
                        page_slug,
                        header_icon,
                        menu_order,
                        access_level,
                        menu_label,
                        translations:site_metadata_admin_translations ( language, menu_label, description )
                    `)
                    .eq('show_in_menu', true)
                    .order('menu_order', { ascending: true });

                if (error) {
                    console.error('Errore Menu DB:', error);
                    return [];
                }

                return data.map(item => {
                    // Nel sidecar vivono SOLO le lingue diverse dall'inglese: per l'inglese
                    // qui non si trova nulla e resta la base inline, che e' l'esito voluto.
                    const translation = (item.translations ?? []).find(
                        t => t.language === normalizedLang,
                    );
                    return {
                        ...item,
                        menu_label: translation?.menu_label || item.menu_label || item.page_slug,
                        page_description: translation?.description || '',
                    };
                });
            }

            const { data, error } = await supabase
                .from('site_metadata')
                .select('id, page_slug, menu_label, header_icon, menu_order, access_level, page_description, parent_id')
                .eq('show_in_menu', true)
                .eq('menu_location', 'primary')
                .order('menu_order', { ascending: true });

            if (error) {
                console.error('Errore Menu DB:', error);
                return [];
            }
            return data;
        }) || [];
    },

    /** 🔗 FOOTER MENU: Pagine informative (about, faq, contact) */
    async getFooterItems() {
        return fetchWithCache('footer_menu_v2', async () => {
            const { data, error } = await supabase
                .from('site_metadata')
                .select('id, page_slug, menu_label, header_icon, menu_order')
                .eq('show_in_menu', true)
                .eq('menu_location', 'footer')
                .order('menu_order', { ascending: true });
            if (error) { console.error('Footer menu error:', error); return []; }
            return data || [];
        }) || [];
    },

    /** 🏠 HOME CARDS: Le card della home page */
    async getHomeCards(lang = 'en'): Promise<Record<string, unknown>[]> {
        const normalizedLang = normalizeLang(lang);
        const data = await fetchWithCache<Record<string, unknown>[]>(`home_cards_${normalizedLang}_v16`, async () => {
            const { data, error } = await supabase
                .from('home_cards')
                .select(`
                    *,
                    cover:media_assets!image_asset_id (image_url, alt_text),
                    translations:home_cards_translations (*)
                `)
                .eq('is_active', true)
                .order('display_order', { ascending: true });

            if (error) {
                console.error('❌ Errore Fetch Home Cards:', error);
                return [];
            }

            return (data || []).map(item => {
                const translations = (item as unknown as Record<string, unknown[]>).translations ?? [];
                const translation =
                    (translations as Array<Record<string, string>>).find(t => t.language === normalizedLang) ||
                    (translations as Array<Record<string, string>>).find(t => t.language === 'en') ||
                    (translations as Array<Record<string, string>>)[0];

                // Cover risolta da image_asset_id → media_assets (convenzione asset, fonte unica).
                const cover = (item as Record<string, unknown>).cover as Record<string, string> | null;

                return {
                    ...item,
                    image_url: cover?.image_url ?? null,
                    image_alt: cover?.alt_text || null,
                    title: translation?.title || (item as Record<string, unknown>).title || `Card ${(item as Record<string, unknown>).id}`,
                    description: translation?.description || (item as Record<string, unknown>).description || '',
                    link_label: translation?.link_label || (item as Record<string, unknown>).link_label || 'Explore',
                };
            });
        });
        return data || [];
    },

    /** 🗂️ CONTENT CATEGORIES: Unified taxonomy fetch by domain */
    async getContentCategories(domain: string): Promise<ContentCategoryDB[]> {
        const data = await fetchWithCache<ContentCategoryDB[]>(`content_categories_${domain}_v4`, async () => {
            const { data, error } = await supabase
                .from('content_categories')
                .select(CONTENT_CATEGORY_PUBLIC_COLUMNS)
                .eq('domain', domain)
                .eq('is_active', true)
                .order('display_order', { ascending: true });
            if (error) {
                console.error('[ContentService] getContentCategories error:', error);
                return [];
            }
            return (data || []) as unknown as ContentCategoryDB[];
        });
        return data || [];
    },

    /** 📰 LATEST NEWS: Fetch latest articles from akha_news */
    async getLatestNews(): Promise<Record<string, unknown>[]> {
        const data = await fetchWithCache<Record<string, unknown>[]>('agency_news_v1', async () => {
            const { data, error } = await supabase
                .from('akha_news')
                .select(`
                    *,
                    category:content_categories(id, title, slug),
                    cover_data:media_assets!cover_asset_id(image_url, alt_text, title)
                `)
                .eq('is_published', true)
                .order('created_at', { ascending: false });

            return error ? [] : (data || []);
        });
        return data || [];
    },

    /** 📰 NEWS BY IDS: Fetch specific articles from akha_news by news_id list */
    async getNewsByNewsIds(newsIds: string[]): Promise<Record<string, unknown>[]> {
        const data = await fetchWithCache<Record<string, unknown>[]>(`news_by_ids_${newsIds.join(',')}_v1`, async () => {
            const { data, error } = await supabase
                .from('akha_news')
                .select(`
                    *,
                    category:content_categories(id, title, slug),
                    cover_data:media_assets!cover_asset_id(image_url, alt_text, title)
                `)
                .in('news_id', newsIds)
                .eq('is_published', true);

            if (error) {
                console.error('Error fetching news by news_id:', error);
                return [];
            }

            return (data || []).sort((a, b) =>
                newsIds.indexOf(a.news_id ?? '') -
                newsIds.indexOf(b.news_id ?? '')
            );
        });
        return data || [];
    },

    /**
     * 🔄 SIBLING PAGES: Given a page_slug, reads sibling_slugs[] from site_metadata
     * and returns the full metadata for each sibling.
     * Returns [] if no siblings defined for this slug.
     */
    async getSiblingPagesBySlug(currentSlug: string): Promise<Array<{
        page_slug: string;
        header_title_main: string;
        header_title_highlight: string | null;
        page_description: string | null;
        hero_image_url: string | null; // resolved from cover_asset_id → media_assets
    }>> {
        // Step 1: fetch sibling_slugs for current page
        const { data: current, error: e1 } = await supabase
            .from('site_metadata')
            .select('sibling_slugs')
            .eq('page_slug', currentSlug)
            .single();

        if (e1 || !current?.sibling_slugs?.length) return [];

        const slugs: string[] = current.sibling_slugs;

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
            .filter(Boolean) as Array<{
                page_slug: string;
                header_title_main: string;
                header_title_highlight: string | null;
                page_description: string | null;
                hero_image_url: string | null;
            }>;
    },
};
