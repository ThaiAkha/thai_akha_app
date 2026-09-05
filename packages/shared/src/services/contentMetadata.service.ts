import { supabase } from '@thaiakha/shared/lib/supabase';
import { HeaderMetadata, ContentCategoryDB, BusinessProfile } from '../types';
import type { SiteMetadataExtras } from './siteMetadataExtras.service';
import { fetchWithCache, normalizeLang } from './_cache';
import { sidecarJoin, sidecarFilter, mergeSidecarRow, mergeSidecarRows } from '../lib/mergeTranslation';
import { NEWS_T_FIELDS } from './news.service';

/**
 * Campi di CONTENUTO dell'header pagina nel sidecar site_metadata. Il resto della
 * riga (cover, icona, json_ld, canonical, prompt Cherry) non si traduce: json_ld e
 * hreflang si GENERANO a render dai campi tradotti, non si memorizzano.
 */
/**
 * Campi di CONTENUTO del sidecar categoria. Esportato: ricette, news, cultura e
 * ingredienti incorporano la stessa categoria e devono tradurla con la stessa lista.
 */
/** Alias dell'embed categoria nelle card news: stesso nome per filtro e merge. */
const NEWS_CARD_EMBEDDED = ['category'] as const;

export const CONTENT_CATEGORY_T_FIELDS = [
    'title', 'title_highlight', 'tab_label', 'subtitle', 'description', 'content_body',
    'ui_quote', 'seo_title', 'seo_description', 'og_title', 'og_description',
] as const;

const PAGE_HEADER_T_FIELDS = [
    'header_title_main', 'header_title_highlight', 'header_badge', 'page_description',
    'seo_title', 'seo_description', 'og_title', 'og_description',
    // `page_essentials` viaggia con l'header dal 2026-09-05: la stessa riga
    // serviva anche il "contorno" di pagina, con una seconda query.
    'page_essentials',
] as const;

/**
 * Quel che una pagina riceve per il suo header, piu' i campi di contorno della
 * stessa riga (`extras`, assente sul ramo admin: quella tabella non li ha).
 */
export type PageHeaderMetadata = HeaderMetadata & { imageUrl: string; extras?: SiteMetadataExtras | null };

/** La forma della riga header dopo il merge: le colonne della select, niente di piu'. */
interface PageHeaderRow {
    header_badge: string | null;
    header_icon: string | null;
    header_title_main: string | null;
    header_title_highlight: string | null;
    page_description: string | null;
    cover_asset_id: string | null;
    cover_media: { image_url?: string; alt_text?: string } | null;
    seo_title: string | null;
    seo_description: string | null;
    og_title: string | null;
    og_description: string | null;
    og_type: string | null;
    twitter_card: string | null;
    canonical_url: string | null;
    json_ld: unknown;
    cherry_prompt: string | null;
    cherry_response: string | null;
    cherry_button_ids: string[] | null;
    page_essentials: Record<string, unknown> | null;
    legal_version: string | null;
    date_published: string | null;
    date_modified: string | null;
    faq_refs: string[] | null;
    sibling_slugs: string[] | null;
}

/** I due soli campi che menu e footer mostrano: il resto della riga resta inglese/strutturale. */
const MENU_T_FIELDS = ['menu_label', 'page_description'] as const;

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
    async getPageMetadata(slug: string, table: 'site_metadata' | 'site_metadata_admin' = 'site_metadata', lang = 'en'): Promise<PageHeaderMetadata | null> {
        const normalizedLang = normalizeLang(lang);
        // Data layer #86: nessuna cache localStorage qui. La cache la possiede TanStack
        // (front `usePageMetadata`, admin `usePageMetadata`): stessa riga, stessa freschezza
        // di getPageExtras. I lettori legacy (feed hook) pagano un round-trip per mount.
        return (async () => {
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
                            lang,
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
                    translations.find(t => t.lang === normalizedLang) ||
                    translations.find(t => t.lang === 'en') ||
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

            const frontQuery = sidecarFilter(supabase
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
                    cherry_button_ids,
                    page_essentials,
                    legal_version,
                    date_published,
                    date_modified,
                    faq_refs,
                    sibling_slugs
                `+ sidecarJoin('site_metadata_translations', PAGE_HEADER_T_FIELDS, normalizedLang))
                .eq('page_slug', slug), normalizedLang);
            const { data: rawFront, error } = await frontQuery.maybeSingle();

            if (error || !rawFront) return null;
            const data = mergeSidecarRow<PageHeaderRow>(rawFront, normalizedLang);

            // Resolve cover image from media_assets join
            const resolvedImageUrl = data.cover_media?.image_url || '';

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
                cherryPrompt: data.cherry_prompt,
                cherryResponse: data.cherry_response,
                cherryButtonIds: data.cherry_button_ids,
                // Campi "di contorno" della STESSA riga (Page Essentials, date, FAQ
                // collegate, pagine sorelle). Prima li leggeva getPageExtras con una
                // seconda query, su una terza chiave di cache: la stessa riga di
                // site_metadata arrivava due volte per pagina, e nelle pagine che
                // aspettano il layout arrivava anche in fila. Ora `useSiteMetadata`
                // proietta questo campo dalla stessa query dell'header.
                extras: {
                    cherry: {
                        prompt: data.cherry_prompt,
                        response: data.cherry_response,
                        buttonIds: data.cherry_button_ids,
                    },
                    essentials: data.page_essentials ?? null,
                    legalVersion: data.legal_version,
                    dates: {
                        published: data.date_published,
                        modified: data.date_modified,
                    },
                    faqRefs: Array.isArray(data.faq_refs) ? data.faq_refs : [],
                    siblingSlugs: Array.isArray(data.sibling_slugs) ? data.sibling_slugs : [],
                },
            };
        })();
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
        return fetchWithCache(`sidebar_menu_${table}_${normalizedLang}_v34`, async () => {
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
                        translations:site_metadata_admin_translations ( lang, menu_label, description )
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
                        t => t.lang === normalizedLang,
                    );
                    return {
                        ...item,
                        menu_label: translation?.menu_label || item.menu_label || item.page_slug,
                        page_description: translation?.description || '',
                    };
                });
            }

            // FRONT: base inglese sulla riga + sidecar site_metadata_translations
            // (menu_label, page_description) fuso PER CAMPO — stessa regola di
            // seo.service. In inglese il join non parte: la base È l'inglese.
            const { data, error } = await sidecarFilter(supabase
                .from('site_metadata')
                .select(`id, page_slug, menu_label, header_icon, menu_order, access_level, page_description, parent_id${sidecarJoin('site_metadata_translations', MENU_T_FIELDS, normalizedLang)}`)
                .eq('show_in_menu', true)
                .eq('menu_location', 'primary')
                .order('menu_order', { ascending: true }), normalizedLang);

            if (error) {
                console.error('Errore Menu DB:', error);
                return [];
            }
            return mergeSidecarRows(data, normalizedLang);
        }) || [];
    },

    /**
     * 🔗 FOOTER MENU: Pagine informative (about, faq, contact).
     * Stesso merge per campo del menu primario: era l'unico lettore del menu
     * senza `lang`, e su /es/ il footer restava inglese mentre il resto no.
     */
    async getFooterItems(lang = 'en') {
        const normalizedLang = normalizeLang(lang);
        // v4: filtro lingua server-side sul sidecar (prima arrivavano 11 traduzioni per voce)
        return fetchWithCache(`footer_menu_${normalizedLang}_v4`, async () => {
            const { data, error } = await sidecarFilter(supabase
                .from('site_metadata')
                .select(`id, page_slug, menu_label, header_icon, menu_order${sidecarJoin('site_metadata_translations', MENU_T_FIELDS, normalizedLang)}`)
                .eq('show_in_menu', true)
                .eq('menu_location', 'footer')
                .order('menu_order', { ascending: true }), normalizedLang);
            if (error) { console.error('Footer menu error:', error); return []; }
            return mergeSidecarRows(data, normalizedLang);
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
                    (translations as Array<Record<string, string>>).find(t => t.lang === normalizedLang) ||
                    (translations as Array<Record<string, string>>).find(t => t.lang === 'en') ||
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
    async getContentCategories(domain: string, lang = 'en'): Promise<ContentCategoryDB[]> {
        const l = normalizeLang(lang);
        // v5: select cambiata (join sidecar) + lingua nella chiave.
        const data = await fetchWithCache<ContentCategoryDB[]>(`content_categories_${domain}_${l}_v5`, async () => {
            const query = sidecarFilter(supabase
                .from('content_categories')
                .select(CONTENT_CATEGORY_PUBLIC_COLUMNS
                    + sidecarJoin('content_categories_translations', CONTENT_CATEGORY_T_FIELDS, l))
                .eq('domain', domain)
                .eq('is_active', true)
                .order('display_order', { ascending: true }), l);
            const { data, error } = await query;
            if (error) {
                console.error('[ContentService] getContentCategories error:', error);
                return [];
            }
            return mergeSidecarRows<ContentCategoryDB>(data, l);
        });
        return data || [];
    },

    /** 📰 LATEST NEWS: Fetch latest articles from akha_news */
    async getLatestNews(lang = 'en'): Promise<Record<string, unknown>[]> {
        const l = normalizeLang(lang);
        // v2: select cambiata (join sidecar) + lingua nella chiave.
        const data = await fetchWithCache<Record<string, unknown>[]>(`agency_news_${l}_v2`, async () => {
            const query = sidecarFilter(supabase
                .from('akha_news')
                .select(`
                    *,
                    category:content_categories(id, title, slug${sidecarJoin('content_categories_translations', ['title'], l)}),
                    cover_data:media_assets!cover_asset_id(image_url, alt_text, title)
                `+ sidecarJoin('akha_news_translations', NEWS_T_FIELDS, l))
                .eq('is_published', true)
                .order('created_at', { ascending: false }), l, NEWS_CARD_EMBEDDED);
            const { data, error } = await query;

            return error ? [] : mergeSidecarRows(data, l, NEWS_CARD_EMBEDDED);
        });
        return data || [];
    },

    /** 📰 NEWS BY IDS: Fetch specific articles from akha_news by news_id list */
    async getNewsByNewsIds(newsIds: string[], lang = 'en'): Promise<Record<string, unknown>[]> {
        const l = normalizeLang(lang);
        // v2: select cambiata (join sidecar) + lingua nella chiave.
        const data = await fetchWithCache<Record<string, unknown>[]>(`news_by_ids_${newsIds.join(',')}_${l}_v2`, async () => {
            const query = sidecarFilter(supabase
                .from('akha_news')
                .select(`
                    *,
                    category:content_categories(id, title, slug${sidecarJoin('content_categories_translations', ['title'], l)}),
                    cover_data:media_assets!cover_asset_id(image_url, alt_text, title)
                `+ sidecarJoin('akha_news_translations', NEWS_T_FIELDS, l))
                .in('news_id', newsIds)
                .eq('is_published', true), l, NEWS_CARD_EMBEDDED);
            const { data: raw, error } = await query;

            if (error) {
                console.error('Error fetching news by news_id:', error);
                return [];
            }
            const data = mergeSidecarRows(raw, l, NEWS_CARD_EMBEDDED);

            return (data || []).sort((a, b) =>
                newsIds.indexOf(String(a.news_id ?? '')) -
                newsIds.indexOf(String(b.news_id ?? ''))
            );
        });
        return data || [];
    }
};
