import { supabase } from '@thaiakha/shared/lib/supabase';
import { CookingClassDB } from '../types';
import { fetchWithCache } from './_cache';

export const classService = {

    /** 🍲 COOKING CLASSES: info corsi (marketing). Prezzo dalla FONTE UNICA class_sessions. */
    async getCookingClasses(): Promise<CookingClassDB[]> {
        const data = await fetchWithCache<CookingClassDB[]>('cooking_classes_v5', async () => {
            // Solo colonne UI realmente renderizzate. Esclusi i campi server-only
            // (semantic_vector, key_entities, summary_ai) e i cherry_* (Cherry usa il
            // modulo statico cherryKnowledge/classes.ts, non questa query).
            // image_url = immagine hero della pagina classe (HeroContent).
            // #37 - il PREZZO viene SOLO da class_sessions.price_thb (fonte unica),
            // arricchito per id (cooking_classes.id === class_sessions.id). La colonna
            // cooking_classes.price è stata droppata: non va più selezionata.
            const [ccRes, csRes] = await Promise.all([
                supabase
                    .from('cooking_classes')
                    .select('id, title, badge, tags, currency, unit, theme_color, duration_text, tagline, capacity_text, cover:media_assets!cover_asset_id(image_url, alt_text), description, highlights, schedule_items, inclusions, is_active, created_at, youtube_video_id'),
                supabase.from('class_sessions').select('id, price_thb'),
            ]);

            if (ccRes.error) return [];

            const priceById = new Map<string, number>();
            (csRes.data ?? []).forEach((s) => { if (s.price_thb != null) priceById.set(s.id, s.price_thb); });

            // Resolve cover_asset_id → media_assets; keep the `image_url` alias used by the UI.
            return (ccRes.data || [])
                .map((row) => {
                    const cover = (row as Record<string, unknown>).cover as { image_url?: string } | null;
                    return {
                        ...row,
                        price: priceById.get(row.id) ?? null,
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
    async getClassSections(classId: string): Promise<Record<string, unknown>[]> {
        const data = await fetchWithCache<Record<string, unknown>[]>(`class_sections_${classId}_v2`, async () => {
            const { data, error } = await supabase
                .from('class_sections')
                .select('id, section_key, title, subtitle, description, tag_badge, ui_style, display_order, assigned_classes')
                .contains('assigned_classes', [classId])
                .eq('is_active', true)
                .order('display_order', { ascending: true });

            if (error) {
                console.error(`Class sections fetch error [${classId}]:`, error);
                return [];
            }
            return data || [];
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
