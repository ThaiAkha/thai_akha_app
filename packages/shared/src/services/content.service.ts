import { supabase } from '@thaiakha/shared/lib/supabase';
import { HeaderMetadata, CultureSection, CultureSectionDetail, CultureGalleryItem } from '../types';

// Cache Version Key: Aggiornala per invalidare la cache locale se cambi la struttura dati
const GLOBAL_CACHE_KEY = 'akha_cache_content_v10';

/**
 * 🧠 INTELLIGENT CACHE MANAGER
 * Gestisce la cache locale per ridurre le chiamate a Supabase e velocizzare la UI.
 */
const getCache = () => {
    try {
        const data = localStorage.getItem(GLOBAL_CACHE_KEY);
        return data ? JSON.parse(data) : {};
    } catch (e) { return {}; }
};

const setCache = (key: string, value: any) => {
    const cache = getCache();
    cache[key] = { value, timestamp: Date.now() };
    localStorage.setItem(GLOBAL_CACHE_KEY, JSON.stringify(cache));
};

async function fetchWithCache<T>(key: string, fetcher: () => Promise<T | null>): Promise<T | null> {
    const cache = getCache();

    const updateCache = async () => {
        try {
            const fresh = await fetcher();
            if (fresh !== null) setCache(key, fresh);
            return fresh;
        } catch (e) {
            console.error(`Sync error for ${key}:`, e);
            return null;
        }
    };

    if (cache[key]) {
        updateCache(); // Sync in background per aggiornare i dati
        return cache[key].value; // Ritorna subito il dato in cache (Stale-while-revalidate)
    }

    return await updateCache();
}

/** 🛠️ NORMALIZZA LINGUA (es. th-TH -> th) */
const normalizeLang = (lang: string) => lang?.split('-')[0].toLowerCase() || 'en';

export const contentService = {

    /** 📄 METADATA PAGINE: Titoli, descrizioni e immagini header */
    async getPageMetadata(slug: string, table = 'site_metadata', lang = 'en'): Promise<HeaderMetadata & { imageUrl: string } | null> {
        const normalizedLang = normalizeLang(lang);
        return fetchWithCache(`meta_${table}_${slug}_${normalizedLang}_v5`, async () => {
            // Se la tabella è site_metadata_admin, cerchiamo le traduzioni
            if (table === 'site_metadata_admin') {
                const { data, error } = await supabase
                    .from(table)
                    .select(`
                        id,
                        page_slug,
                        header_badge,
                        header_icon,
                        hero_image_url,
                        seo_robots,
                        og_image,
                        canonical_url,
                        og_type,
                        twitter_card,
                        translations:site_metadata_admin_translations (
                            language,
                            title,
                            subtitle,
                            description,
                            seo_title
                        )
                    `)
                    .eq('page_slug', slug)
                    .maybeSingle();

                if (error) {
                    console.error("❌ Database error fetching metadata:", error);
                    return null;
                }

                if (!data) {
                    console.warn(`⚠️ No metadata found for slug: ${slug}`);
                    return null;
                }

                // Fallback logico: cerchiamo la lingua richiesta, altrimenti 'en'
                const translations = (data as any).translations || [];
                const translation = translations.find((t: any) => t.language === normalizedLang) ||
                    translations.find((t: any) => t.language === 'en') ||
                    translations[0];

                return {
                    badge: data.header_badge,
                    icon: data.header_icon,
                    titleMain: translation?.title || (slug.charAt(0).toUpperCase() + slug.slice(1).replace('-', ' ')),
                    titleHighlight: translation?.subtitle || "",
                    description: translation?.description || "",
                    seoTitle: translation?.seo_title || translation?.title || "Thai Akha Kitchen",
                    imageUrl: data.hero_image_url,
                    ogImage: (data as any).og_image || data.hero_image_url,
                    robots: (data as any).seo_robots,
                    canonicalUrl: (data as any).canonical_url,
                    ogType: (data as any).og_type,
                    twitterCard: (data as any).twitter_card,
                };
            }

            // Fallback per site_metadata (front app) - manteniamo compatibilità
            const { data, error } = await supabase
                .from(table)
                .select('header_badge, header_icon, header_title_main, header_title_highlight, page_description, hero_image_url')
                .eq('page_slug', slug)
                .maybeSingle();

            if (error || !data) return null;

            return {
                badge: data.header_badge,
                icon: data.header_icon,
                titleMain: data.header_title_main,
                titleHighlight: data.header_title_highlight,
                description: data.page_description,
                imageUrl: data.hero_image_url
            };
        });
    },

    /** 🎴 MENU SIDEBAR: Dinamico con livelli di accesso */
    async getMenuItems(table = 'site_metadata', lang = 'en') {
        const normalizedLang = normalizeLang(lang);
        return fetchWithCache(`sidebar_menu_${table}_${normalizedLang}_v14`, async () => {
            if (table === 'site_metadata_admin') {
                const { data, error } = await supabase
                    .from(table)
                    .select(`
                        page_slug, 
                        header_icon, 
                        menu_order, 
                        access_level, 
                        translations:site_metadata_admin_translations (
                            language,
                            menu_label,
                            description
                        )
                    `)
                    .eq('show_in_menu', true)
                    .order('menu_order', { ascending: true });

                if (error) {
                    console.error("Errore Menu DB:", error);
                    return [];
                }

                return data.map((item: any) => {
                    const translations = item.translations || [];
                    const translation = translations.find((t: any) => t.language === normalizedLang) ||
                        translations.find((t: any) => t.language === 'en') ||
                        translations[0];

                    return {
                        ...item,
                        menu_label: translation?.menu_label || item.page_slug,
                        page_description: translation?.description || ""
                    };
                });
            }

            // Fallback per site_metadata (front app)
            const { data, error } = await supabase
                .from(table)
                .select('page_slug, menu_label, header_icon, menu_order, access_level, page_description')
                .eq('show_in_menu', true)
                .order('menu_order', { ascending: true });

            if (error) {
                console.error("Errore Menu DB:", error);
                return [];
            }
            return data;
        }) || [];
    },

    /** 🏠 HOME CARDS: Le card della home page */
    async getHomeCards(lang = 'en'): Promise<any[]> {
        const normalizedLang = normalizeLang(lang);
        const data = await fetchWithCache(`home_cards_${normalizedLang}_v4`, async () => {
            const { data, error } = await supabase
                .from('home_cards')
                .select(`
                    *,
                    translations:home_cards_translations (*)
                `)
                .eq('is_active', true)
                .order('display_order', { ascending: true });

            if (error) {
                console.error("❌ Errore Fetch Home Cards:", error);
                return [];
            }

            return (data || []).map((item: any) => {
                // Estrai traduzione: matching lingua o fallback su 'en'
                const translations = item.translations || [];
                const translation = translations.find((t: any) => t.language === normalizedLang) ||
                    translations.find((t: any) => t.language === 'en') ||
                    translations[0]; // Fallback estremo

                return {
                    ...item,
                    title: translation?.title || item.title || item.card_title || `Card ${item.id}`,
                    description: translation?.description || item.description || item.card_description || '',
                    link_label: translation?.link_label || item.link_label || 'Explore'
                };
            });
        });

        return data || [];
    },

    /** 🎁 QUIZ REWARDS: Premi disponibili */
    async getQuizRewards(): Promise<any[]> {
        const data = await fetchWithCache('quiz_rewards', async () => {
            const { data, error } = await supabase
                .from('quiz_rewards')
                .select('*')
                .order('id', { ascending: true });

            return error ? [] : (data || []);
        });
        return data || [];
    },

    /** 🍲 COOKING CLASSES: Prezzi e info corsi */
    async getCookingClasses(): Promise<any[]> {
        const data = await fetchWithCache('cooking_classes', async () => {
            const { data, error } = await supabase
                .from('cooking_classes')
                .select('*')
                .order('price', { ascending: true });

            return error ? [] : (data || []);
        });
        return data || [];
    },

    /** 🥗 DIETARY PROFILES: Halal, Kosher, Vegan, etc. */
    async getDietaryProfiles() {
        return fetchWithCache('dietary_profiles_v2', async () => {
            // Fetch profili uniti alle loro regole di sostituzione
            const { data, error } = await supabase
                .from('dietary_profiles')
                .select(`
          *,
          dietary_substitutions (
            original_ingredient,
            substitute_ingredient
          )
        `)
                .order('display_order', { ascending: true });

            if (error) {
                console.error("Dietary Sync Error:", error);
                return [];
            }

            // Mappatura pulita per il frontend e l'AI
            return data.map((p: any) => ({
                id: p.slug, // Es: diet_halal
                name: p.name,
                icon: p.icon,
                type: p.type || 'lifestyle',
                image_url: p.image_url,
                display_order: p.display_order || 0,

                // Testi descrittivi
                description: p.introduction,
                experience: p.experience,

                // Regole
                substitutions: p.dietary_substitutions?.map((s: any) => ({
                    original: s.original_ingredient,
                    substitute: s.substitute_ingredient
                })) || []
            }));
        }) || [];
    },

    /** 🧩 QUIZ ENGINE: Deep Fetch (Levels -> Modules -> Questions) */
    async getQuizData() {
        return fetchWithCache('quiz_full_structure_v1', async () => {
            const { data, error } = await supabase
                .from('quiz_levels')
                .select(`
          id,
          title,
          subtitle,
          image_url,
          display_order,
          is_active,
          reward_id,
          quiz_modules (
            id,
            title,
            icon,
            theme,
            display_order,
            quiz_questions (
              id,
              text,
              options,
              correct_index,
              explanation,
              display_order
            )
          )
        `)
                .eq('is_active', true)
                .order('display_order', { ascending: true });

            if (error) {
                console.error("Quiz Sync Error:", error);
                return [];
            }

            // Post-Processing: Ordina moduli e domande (Supabase nested order fix)
            // e parsifica il campo JSON 'options'
            const sortedLevels = data.map((level: any) => ({
                ...level,
                modules: (level.quiz_modules || [])
                    .sort((a: any, b: any) => a.display_order - b.display_order)
                    .map((module: any) => ({
                        ...module,
                        questions: (module.quiz_questions || [])
                            .sort((qa: any, qb: any) => qa.display_order - qb.display_order)
                            .map((q: any) => ({
                                id: q.id,
                                text: q.text,
                                // Gestione robusta per options (può arrivare come stringa o oggetto JSON)
                                options: typeof q.options === 'string' ? JSON.parse(q.options) : q.options,
                                correctAnswer: (typeof q.options === 'string' ? JSON.parse(q.options) : q.options)[q.correct_index],
                                explanation: q.explanation
                            }))
                    }))
            }));

            return sortedLevels;
        });
    },

    /** 🖼️ GALLERY ITEMS: Fetch items for a specific gallery by gallery_id */
    async getGalleryItems(galleryId: string): Promise<any[]> {
        const data = await fetchWithCache(`gallery_${galleryId}_v2`, async () => {
            // 1. Fetch gallery items (real columns: id, asset_id, quote, display_order)
            const { data: items, error } = await supabase
                .from('gallery_items')
                .select('id, asset_id, quote, display_order')
                .eq('gallery_id', galleryId)
                .order('display_order', { ascending: true });

            if (error || !items?.length) {
                console.error(`Gallery fetch error [${galleryId}]:`, error);
                return [];
            }

            // 2. Fetch matching media_assets to get image_url, title, caption
            const assetIds = items.map((i: any) => i.asset_id).filter(Boolean);
            const { data: assets } = await supabase
                .from('media_assets')
                .select('asset_id, image_url, title, caption')
                .in('asset_id', assetIds);

            const assetMap = Object.fromEntries(
                (assets || []).map((a: any) => [a.asset_id, a])
            );

            // 3. Merge: normalize to the GalleryItem shape expected by the UI
            return items.map((item: any) => {
                const media = assetMap[item.asset_id] || {};
                return {
                    photo_id: item.id,
                    image_url: media.image_url || '',
                    title: media.title || '',
                    description: media.caption || '',
                    quote: item.quote || '',
                    icons: [],
                };
            });
        });
        return data || [];
    },

    /** 📰 AGENCY NEWS: Fetch latest articles from akha_news */
    async getLatestNews(): Promise<any[]> {
        const data = await fetchWithCache('agency_news_v1', async () => {
            const { data, error } = await supabase
                .from('akha_news')
                .select('*')
                .eq('is_published', true)
                .order('created_at', { ascending: false });

            return error ? [] : (data || []);
        });
        return data || [];
    },

    /** 🛡️ ALLERGY KNOWLEDGE: Warning texts and instructions */
    async getAllergyKnowledge(): Promise<any[]> {
        const data = await fetchWithCache('allergy_knowledge_v1', async () => {
            const { data, error } = await supabase
                .from('allergy_knowledge')
                .select('*');

            return error ? [] : (data || []);
        });
        return data || [];
    },

    /** 🏛️ CULTURE SECTION DETAIL: Full record for a single culture section */
    async getCultureSectionBySlug(slug: string): Promise<CultureSectionDetail | null> {
        return fetchWithCache<CultureSectionDetail>(`culture_section_${slug}_v1`, async () => {
            const { data, error } = await supabase
                .from('culture_sections')
                .select('*')
                .eq('slug', slug)
                .single();

            if (error) {
                console.error(`Culture section fetch error [${slug}]:`, error);
                return null;
            }

            return data as CultureSectionDetail;
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

    /** 🏛️ CULTURE SECTIONS INDEX: Cards for the History/Culture index page */
    async getCultureSections(): Promise<CultureSection[]> {
        const data = await fetchWithCache<CultureSection[]>('culture_sections_index_v4', async () => {
            const { data, error } = await supabase
                .from('culture_sections')
                .select('id, slug, title, subtitle, quote, primary_image, display_order, featured, category, audio_asset_id')
                .eq('is_published', true)
                .order('display_order', { ascending: true });

            if (error) {
                console.error('Culture sections fetch error:', error);
                return [];
            }

            return (data || []) as CultureSection[];
        });
        return data || [];
    },

};
