import { supabase } from '@thaiakha/shared/lib/supabase';
import { ContentCategoryDB, QuizRewardDB } from '../types';
import { fetchWithCache, normalizeLang } from './_cache';
import { CONTENT_CATEGORY_PUBLIC_COLUMNS, CONTENT_CATEGORY_T_FIELDS } from './contentMetadata.service';
import { sidecarJoin, mergeSidecarRows } from '../lib/mergeTranslation';

// QuizCategoryDB = ContentCategoryDB with domain='quiz' (quiz_categories table dropped)

/**
 * Campi tradotti del quiz. `options` e `hint_blocks` sono JSONB: il sidecar li porta
 * gia' nella forma della madre, quindi il merge li sostituisce interi (tutto-o-niente),
 * mai a pezzi - un array di risposte mezzo tradotto sarebbe peggio di uno inglese.
 * NB: quiz_questions_translations oggi e' VUOTO. Il lettore c'e', il testo resta
 * inglese finche' /translate-db non lo riempie.
 */
const QUIZ_T_FIELDS = [
    'text', 'explanation', 'explanation_wrong', 'hint_response', 'options', 'hint_blocks',
] as const;

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
    async getQuizCategories(lang = 'en'): Promise<ContentCategoryDB[]> {
        const l = normalizeLang(lang);
        // v4: select cambiata (join sidecar) + lingua nella chiave.
        const data = await fetchWithCache(`quiz_categories_${l}_v4`, async () => {
            let query = supabase
                .from('content_categories')
                .select(CONTENT_CATEGORY_PUBLIC_COLUMNS
                    + sidecarJoin('content_categories_translations', CONTENT_CATEGORY_T_FIELDS, l))
                .eq('domain', 'quiz')
                .eq('is_active', true)
                .order('display_order', { ascending: true });
            if (l !== 'en') query = query.eq('translations.lang', l);
            const { data, error } = await query;

            // Cast unico (regola repo #20): PostgREST non inferisce la select concatenata.
            return error ? [] : (mergeSidecarRows(data as unknown as Record<string, unknown>[], l) as unknown as ContentCategoryDB[]);
        });
        return data || [];
    },

    /** 🧩 QUIZ ENGINE: Deep Fetch (Levels -> Modules -> Questions) — split query per compatibilità PostgREST */
    async getQuizData(categoryId?: string, lang = 'en'): Promise<Record<string, unknown>[]> {
        const l = normalizeLang(lang);
        // v10/v11: select cambiata (join sidecar) + lingua nella chiave.
        const cacheKey = categoryId ? `quiz_data_cat_${l}_v10_${categoryId}` : `quiz_full_structure_${l}_v11`;
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
                let questionsQuery = supabase
                    .from('quiz_questions')
                    .select('id, module_id, text, options, correct_index, correct_answer, question_type, explanation, explanation_wrong, display_order, points, hint_prompt, hint_response, hint_blocks, cover:media_assets!image_asset_id(image_url)'
                        + sidecarJoin('quiz_questions_translations', QUIZ_T_FIELDS, l))
                    .in('module_id', chunk)
                    .order('display_order', { ascending: true });
                if (l !== 'en') questionsQuery = questionsQuery.eq('translations.lang', l);
                const questionsRes = await questionsQuery;
                if (questionsRes.error) { console.error('Quiz questions error:', questionsRes.error); return []; }
                if (questionsRes.data) {
                    // Cast unico (regola repo #20): PostgREST non inferisce la select concatenata.
                    allQuestions.push(...mergeSidecarRows(questionsRes.data as unknown as Record<string, unknown>[], l));
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
