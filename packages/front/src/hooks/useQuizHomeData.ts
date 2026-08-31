import { useQuery } from '@thaiakha/shared/query';
import { supabase } from '@thaiakha/shared/lib/supabase';
import { contentService } from '@thaiakha/shared/services';
import type { ContentCategoryDB, QuizRewardDB } from '@thaiakha/shared/types';

const SCORE_KEY = 'thai_akha_quiz_points';
const getLocalScore = (): number => {
  try { return parseInt(localStorage.getItem(SCORE_KEY) ?? '0', 10) || 0; }
  catch { return 0; }
};

const NO_CATEGORIES: ContentCategoryDB[] = [];
const NO_REWARDS: QuizRewardDB[] = [];

export const quizHomeCatalogQueryKey = ['quiz_home', 'catalog'] as const;
/** Prefisso 'user': dato dell'utente loggato, rimosso al logout (App.handleLogout). */
export const quizScoreQueryKey = (managedId: string | null) =>
  ['user', 'quiz_score', managedId ?? 'self'] as const;

/**
 * Data loader for the Quiz HOME page (QuizPage.tsx): categories + rewards
 * (sorted by required points) + the active profile's score. When a managed
 * profile is active (`managedId`), the score comes from its DB row, not localStorage.
 * Due query (CLAUDE.md #17): il catalogo e' pubblico e stabile, il punteggio no.
 */
export const useQuizHomeData = (managedId: string | null) => {
  const catalog = useQuery({
    queryKey: quizHomeCatalogQueryKey,
    queryFn: async () => {
      const [cats, rwds] = await Promise.all([
        contentService.getQuizCategories(),
        contentService.getQuizRewards(),
      ]);
      return {
        categories: cats ?? NO_CATEGORIES,
        rewards: [...(rwds ?? [])].sort((a, b) => a.required_points - b.required_points),
      };
    },
  });

  const score = useQuery({
    queryKey: quizScoreQueryKey(managedId),
    queryFn: async () => {
      const localScore = managedId ? 0 : getLocalScore();
      const { data: { user } } = await supabase.auth.getUser();
      const dbId = managedId ?? user?.id ?? null;
      if (!dbId) return localScore;
      const { data: profile } = await supabase
        .from('profiles').select('quiz_points').eq('id', dbId).single();
      return profile?.quiz_points ?? localScore;
    },
    // Il punteggio cambia a ogni quiz giocato: si rilegge a ogni mount della home, come prima.
    staleTime: 0,
  });

  return {
    categories: catalog.data?.categories ?? NO_CATEGORIES,
    rewards: catalog.data?.rewards ?? NO_REWARDS,
    score: score.data ?? 0,
    loading: catalog.isPending || score.isPending,
  };
};
