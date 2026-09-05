import { supabase } from '@thaiakha/shared/lib/supabase';
import { CookingClassDB } from '../types';
import { fetchWithCache, normalizeLang } from './_cache';
import { sidecarJoin, sidecarFilter, mergeSidecarRows } from '../lib/mergeTranslation';

/** Campi di CONTENUTO dei sidecar del mondo classe. */
const CLASS_T_FIELDS = [
    'title', 'badge', 'tagline', 'capacity_text', 'duration_text', 'description',
    'highlights', 'schedule_items', 'inclusions',
] as const;
const CLASS_SECTION_T_FIELDS = ['title', 'subtitle', 'description', 'tag_badge'] as const;

export const classService = {

    /** 🍲 COOKING CLASSES: info corsi (marketing). Prezzo dalla FONTE UNICA class_sessions. */
    async getCookingClasses(lang = 'en'): Promise<CookingClassDB[]> {
        const l = normalizeLang(lang);
        // v6: select cambiata (join sidecar) + lingua nella chiave.
        const data = await fetchWithCache<CookingClassDB[]>(`cooking_classes_${l}_v6`, async () => {
            // Solo colonne UI realmente renderizzate. Esclusi i campi server-only
            // (semantic_vector, key_entities, summary_ai) e i cherry_* (Cherry usa il
            // modulo statico cherryKnowledge/classes.ts, non questa query).
            // image_url = immagine hero della pagina classe (HeroContent).
            // #37 - il PREZZO viene SOLO da class_sessions.price_thb (fonte unica),
            // arricchito per id (cooking_classes.id === class_sessions.id). La colonna
            // cooking_classes.price è stata droppata: non va più selezionata.
            const ccQuery = sidecarFilter(supabase
                .from('cooking_classes')
                .select('id, title, badge, tags, currency, unit, theme_color, duration_text, tagline, capacity_text, cover:media_assets!cover_asset_id(image_url, alt_text), description, highlights, schedule_items, inclusions, is_active, created_at, youtube_video_id'
                    + sidecarJoin('cooking_classes_translations', CLASS_T_FIELDS, l)), l);
            const [ccRes, csRes] = await Promise.all([
                ccQuery,
                supabase.from('class_sessions').select('id, price_thb'),
            ]);

            if (ccRes.error) return [];

            const priceById = new Map<string, number>();
            (csRes.data ?? []).forEach((s) => { if (s.price_thb != null) priceById.set(s.id, s.price_thb); });

            // Resolve cover_asset_id → media_assets; keep the `image_url` alias used by the UI.
            return mergeSidecarRows(ccRes.data, l)
                .map((row) => {
                    const cover = (row as Record<string, unknown>).cover as { image_url?: string } | null;
                    return {
                        ...row,
                        price: priceById.get(String(row.id)) ?? null,
                        image_url: cover?.image_url ?? null,
                    } as unknown as CookingClassDB;
                })
                .sort((a, b) => (a.price ?? 0) - (b.price ?? 0));
        });
        return data || [];
    },

    /**
     * 🗓️ CLASS SESSIONS: fonte di verità BOOKING (prezzo/capacità/orari/market tour).
     * Usata dalla config sessioni di prenotazione. NON confondere con getCookingClasses
     * (cooking_classes = livello marketing/contenuto delle pagine B2C).
     */
    async getClassSessions(): Promise<Array<{
        id: string; display_name: string; price_thb: number; has_market_tour: boolean;
        duration_hours: number | null; start_time: string | null; end_time: string | null; max_capacity: number | null;
    }>> {
        const data = await fetchWithCache('class_sessions_v1', async () => {
            const { data, error } = await supabase
                .from('class_sessions')
                .select('id, display_name, price_thb, has_market_tour, duration_hours, start_time, end_time, max_capacity')
                .eq('active', true)
                .order('price_thb', { ascending: true });
            return error ? [] : (data || []);
        });
        return (data || []) as unknown as Array<{ id: string; display_name: string; price_thb: number; has_market_tour: boolean; duration_hours: number | null; start_time: string | null; end_time: string | null; max_capacity: number | null; }>;
    },

    /** 🧩 CLASS SECTIONS: Modular content blocks assigned to a class */
    async getClassSections(classId: string, lang = 'en'): Promise<Record<string, unknown>[]> {
        const l = normalizeLang(lang);
        // v3: select cambiata (join sidecar) + lingua nella chiave.
        const data = await fetchWithCache<Record<string, unknown>[]>(`class_sections_${classId}_${l}_v3`, async () => {
            const query = sidecarFilter(supabase
                .from('class_sections')
                .select('id, section_key, title, subtitle, description, tag_badge, ui_style, display_order, assigned_classes'
                    + sidecarJoin('class_sections_translations', CLASS_SECTION_T_FIELDS, l))
                .contains('assigned_classes', [classId])
                .eq('is_active', true)
                .order('display_order', { ascending: true }), l);
            const { data, error } = await query;

            if (error) {
                console.error(`Class sections fetch error [${classId}]:`, error);
                return [];
            }
            return mergeSidecarRows(data, l);
        });
        return data || [];
    },

    /** 🏫 CLASS SESSION: Logistics & meeting points for a specific class */
    async getClassSession(id: string): Promise<Record<string, unknown> | null> {
        return fetchWithCache<Record<string, unknown>>(`class_session_${id}_v1`, async () => {
            const { data, error } = await supabase
                .from('class_sessions')
                .select('*')
                .eq('id', id)
                .maybeSingle();

            if (error) {
                console.error(`Class session fetch error [${id}]:`, error);
                return null;
            }
            return data as Record<string, unknown>;
        });
    },
};
