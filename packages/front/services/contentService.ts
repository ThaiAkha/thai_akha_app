import { supabase } from '../lib/supabase';
import { HeaderMetadata } from '../components/layout/Header';

// Cache Version Key: Aggiornala per invalidare la cache locale se cambi la struttura dati
const GLOBAL_CACHE_KEY = 'akha_cache_content_v6';

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

export const contentService = {

  /** 📄 METADATA PAGINE: Titoli, descrizioni e immagini header */
  async getPageMetadata(slug: string): Promise<HeaderMetadata & { imageUrl: string } | null> {
    return fetchWithCache(`meta_${slug}`, async () => {
      const { data, error } = await supabase
        .from('site_metadata')
        .select('header_badge, header_icon, header_title_main, header_title_highlight, page_description, hero_image_url')
        .eq('page_slug', slug)
        .single();

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
  async getMenuItems() {
    return fetchWithCache('sidebar_menu_v5', async () => {
      const { data, error } = await supabase
        .from('site_metadata')
        .select('page_slug, menu_label, header_icon, menu_order, access_level')
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
  async getHomeCards(): Promise<any[]> {
    return fetchWithCache('home_cards_dynamic', async () => {
      const { data, error } = await supabase
        .from('home_cards')
        .select('*')
        .eq('is_active', true)
        .order('display_order', { ascending: true });

      return error ? [] : (data || []);
    }) || [];
  },

  /** 🎁 QUIZ REWARDS: Premi disponibili */
  async getQuizRewards(): Promise<any[]> {
    return fetchWithCache('quiz_rewards', async () => {
      const { data, error } = await supabase
        .from('quiz_rewards')
        .select('*')
        .order('id', { ascending: true });

      return error ? [] : (data || []);
    }) || [];
  },

  /** 🍲 COOKING CLASSES: Prezzi e info corsi */
  async getCookingClasses(): Promise<any[]> {
    return fetchWithCache('cooking_classes', async () => {
      const { data, error } = await supabase
        .from('cooking_classes')
        .select('*')
        .order('price', { ascending: true });

      return error ? [] : (data || []);
    }) || [];
  },

  /** 🥗 DIETARY PROFILES: Halal, Kosher, Vegan, etc. */
  async getDietaryProfiles() {
    return fetchWithCache('dietary_profiles_v1', async () => {
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

};