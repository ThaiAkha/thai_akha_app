/**
 * Quiz single - costanti localStorage, preferenza spiegazioni, punteggio locale, sync profilo.
 * Estratto da QuizPageSingle.tsx (#16 split monstre) a comportamento invariato.
 */
import { supabase } from '@thaiakha/shared/lib/supabase';
import type { Json } from '@thaiakha/shared/types';

// ── Constants ──────────────────────────────────────────────────────────────────
export const PROGRESS_KEY = 'thai_akha_quiz_progress_v2';
export const SCORE_KEY = 'thai_akha_quiz_points';
export const EXPLANATIONS_KEY = 'thai_akha_quiz_explanations';

// Explanation preference (guest): 'on' | 'off' | assente(undecided→null)
export const getLocalExplanations = (): boolean | null => {
  try {
    const v = localStorage.getItem(EXPLANATIONS_KEY);
    return v === 'on' ? true : v === 'off' ? false : null;
  } catch { return null; }
};

// ── Types ──────────────────────────────────────────────────────────────────────
export type View = 'HOME' | 'LEVEL_SELECT' | 'PLAYING' | 'RESULT';

// ── Score helpers ──────────────────────────────────────────────────────────────
export const saveLocalScore = (score: number) => {
  try { localStorage.setItem(SCORE_KEY, String(score)); } catch { /* noop */ }
};
export const getLocalScore = () => {
  try { return Number(localStorage.getItem(SCORE_KEY)) || 0; } catch { return 0; }
};

export const syncProgressToSupabase = async (score: number, progressJson: Json, targetId?: string) => {
  try {
    // targetId presente = profilo gestito attivo (F2); altrimenti l'host loggato.
    let id = targetId;
    if (!id) {
      const { data: { user } } = await supabase.auth.getUser();
      id = user?.id;
    }
    if (!id) return;
    await supabase.from('profiles').update({
      quiz_points: score,
      quiz_progress: progressJson
    }).eq('id', id);
  } catch { /* noop */ }
};
