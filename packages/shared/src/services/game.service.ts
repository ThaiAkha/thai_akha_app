import { supabase } from '@thaiakha/shared/lib/supabase';
import { ContentCategoryDB, QuizRewardDB } from '../types';
import { fetchWithCache } from './_cache';
import { CONTENT_CATEGORY_PUBLIC_COLUMNS } from './contentMetadata.service';

// QuizCategoryDB = ContentCategoryDB with domain='quiz' (quiz_categories table dropped)

export const gameService = {

    /** 🎁 QUIZ REWARDS: Premi disponibili ordinati per soglia XP */
    async getQuizRewards(): Promise<QuizRewardDB[]> {
        const data = await fetchWithCache('quiz_rewards_v3', async () => {
            const { data, error } = await supabase
                .from('quiz_rewards')
                .select('*, cover:media_assets!image_asset_id(image_url, alt_text)')
                .eq('is_active', true)
                .order('required_points', { ascending: true });

            if (error) return [];
            // Resolve image_asset_id → media_assets; keep the `image_url` alias used by the UI.
            return (data || []).map((row) => {
                const cover = (row as Record<string, unknown>).cover as { image_url?: string } | null;
                return { ...row, image_url: cover?.image_url ?? null } as unknown as QuizRewardDB;
            });
        });
        return data || [];
    },

    /** 🎮 QUIZ CATEGORIES: Macro-categorie hub gamification (from content_categories domain='quiz') */
    async getQuizCategories(): Promise<ContentCategoryDB[]> {
        const data = await fetchWithCache('quiz_categories_v3', async () => {
            const { data, error } = await supabase
                .from('content_categories')
                .select(CONTENT_CATEGORY_PUBLIC_COLUMNS)
                .eq('domain', 'quiz')
                .eq('is_active', true)
                .order('display_order', { ascending: true });

            return error ? [] : ((data || []) as unknown as ContentCategoryDB[]);
        });
        return data || [];
    },

    /** 🧩 QUIZ ENGINE: Deep Fetch (Levels -> Modules -> Questions) — split query per compatibilità PostgREST */
    async getQuizData(categoryId?: string): Promise<Record<string, unknown>[]> {
        const cacheKey = categoryId ? `quiz_data_cat_v9_${categoryId}` : 'quiz_full_structure_v10';
        return (await fetchWithCache<Record<string, unknown>[]>(cacheKey, async () => {
            let levelsQuery = supabase
                .from('quiz_levels')
                .select('id, title, subtitle, display_order, is_active, category_id, completion_bonus, cover:media_assets!image_asset_id(image_url)')
                .eq('is_active', true)
                .order('display_order', { ascending: true });
            if (categoryId) levelsQuery = levelsQuery.eq('category_id', categoryId);

            const levelsRes = await levelsQuery;
            if (levelsRes.error) { console.error('Quiz levels error:', levelsRes.error); return []; }
            const levels = levelsRes.data || [];
            if (levels.length === 0) return [];

            const levelIds = levels.map(l => l.id);
            const modulesRes = await supabase
                .from('quiz_modules')
                .select('id, level_id, title, icon, theme, display_order, source_table, source_slug, cover:media_assets!image_asset_id(image_url)')
                .in('level_id', levelIds)
                .order('display_order', { ascending: true });
            if (modulesRes.error) { console.error('Quiz modules error:', modulesRes.error); return []; }
            const modules = modulesRes.data || [];

            const moduleIds = modules.map(m => m.id);
            if (moduleIds.length === 0) return levels.map(l => ({ ...l, modules: [] }));

            const chunkSize = 20;
            const allQuestions: Record<string, unknown>[] = [];
            for (let i = 0; i < moduleIds.length; i += chunkSize) {
                const chunk = moduleIds.slice(i, i + chunkSize);
                const questionsRes = await supabase
                    .from('quiz_questions')
                    .select('id, module_id, text, options, correct_index, correct_answer, question_type, explanation, explanation_wrong, display_order, points, hint_prompt, hint_response, hint_blocks, cover:media_assets!image_asset_id(image_url)')
                    .in('module_id', chunk)
                    .order('display_order', { ascending: true });
                if (questionsRes.error) { console.error('Quiz questions error:', questionsRes.error); return []; }
                if (questionsRes.data) {
                    allQuestions.push(...(questionsRes.data as Record<string, unknown>[]));
                }
            }
            const questions = allQuestions;

            // Risolve l'URL immagine dall'asset (image_asset_id → media_assets). Unica fonte.
            const coverUrl = (row: Record<string, unknown>): string => {
                const c = row.cover as { image_url?: string } | { image_url?: string }[] | null;
                const m = Array.isArray(c) ? c[0] : c;
                return m?.image_url ?? '';
            };

            return levels.map(level => ({
                ...level,
                image_url: coverUrl(level as Record<string, unknown>),
                modules: modules
                    .filter(m => (m as Record<string, unknown>).level_id === (level as Record<string, unknown>).id)
                    .sort((a, b) => Number((a as Record<string, unknown>).display_order) - Number((b as Record<string, unknown>).display_order))
                    .map(module => ({
                        ...module,
                        image_url: coverUrl(module as Record<string, unknown>),
                        // T8 — link "Learn more" del reveal (pagina sorgente del modulo).
                        sourceTable: (module as Record<string, unknown>).source_table ?? null,
                        sourceSlug: (module as Record<string, unknown>).source_slug ?? null,
                        questions: questions
                            .filter(q => (q as Record<string, unknown>).module_id === (module as Record<string, unknown>).id)
                            .sort((qa, qb) => Number((qa as Record<string, unknown>).display_order) - Number((qb as Record<string, unknown>).display_order))
                            .map(q => {
                                const row = q as Record<string, unknown>;
                                const raw = row.options;
                                const opts: unknown[] = typeof raw === 'string' ? JSON.parse(raw) : (Array.isArray(raw) ? raw : []);
                                // Normalizza ogni opzione: stringa (testo legacy) → {label};
                                // oggetto {label, asset_id} (foto) → {label, assetId}. Mai URL in DB.
                                const options = opts.map((o) => {
                                    if (typeof o === 'string') return { label: o };
                                    const oo = o as { label?: string; asset_id?: string };
                                    return { label: oo.label ?? '', assetId: oo.asset_id };
                                });
                                const correctIdx = Number(row.correct_index);
                                const ca = row.correct_answer;
                                return {
                                    id: row.id,
                                    text: row.text,
                                    options,
                                    correctAnswer: options[correctIdx]?.label ?? '',
                                    questionType: row.question_type ?? 'single',
                                    imageUrl: coverUrl(row),  // foto hero della domanda (image_asset_id)
                                    correctIndices: Array.isArray(ca) ? (ca as number[]) : null,
                                    explanation: row.explanation,
                                    points: row.points ?? 10,
                                    // T6 — Quiz Hint Preset (zero-latency, no AI). Spoiler-free.
                                    hintPrompt: (q as Record<string, unknown>).hint_prompt ?? null,
                                    hintResponse: (q as Record<string, unknown>).hint_response ?? null,
                                    hintBlocks: (q as Record<string, unknown>).hint_blocks ?? null,
                                    // T8 — reveal per risposta sbagliata (supporto, spoiler-free).
                                    explanationWrong: (q as Record<string, unknown>).explanation_wrong ?? null,
                                };
                            }),
                    })),
            }));
        })) || [];
    },
};
