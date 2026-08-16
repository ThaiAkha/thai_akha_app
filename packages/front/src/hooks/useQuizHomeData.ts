import { useState, useEffect } from 'react';
import { supabase } from '@thaiakha/shared/lib/supabase';
import { contentService } from '@thaiakha/shared/services';
import type { ContentCategoryDB, QuizRewardDB } from '@thaiakha/shared/types';

const SCORE_KEY = 'thai_akha_quiz_points';
const getLocalScore = (): number => {
  try { return parseInt(localStorage.getItem(SCORE_KEY) ?? '0', 10) || 0; }
  catch { return 0; }
};

/**
 * Data loader for the Quiz HOME page (QuizPage.tsx): categories + rewards
 * (sorted by required points) + the active profile's score. When a managed
 * profile is active (`managedId`), the score comes from its DB row, not localStorage.
 */
export const useQuizHomeData = (managedId: string | null) => {
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState<ContentCategoryDB[]>([]);
  const [rewards, setRewards] = useState<QuizRewardDB[]>([]);
  const [score, setScore] = useState(0);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        const [cats, rwds] = await Promise.all([
          contentService.getQuizCategories(),
          contentService.getQuizRewards(),
        ]);
        const sortedRewards = (rwds ?? []).sort((a, b) => a.required_points - b.required_points);
        if (!mounted) return;
        setCategories(cats ?? []);
        setRewards(sortedRewards);

        const localScore = managedId ? 0 : getLocalScore();
        const { data: { user } } = await supabase.auth.getUser();
        const dbId = managedId ?? user?.id ?? null;
        if (dbId) {
          const { data: profile } = await supabase
            .from('profiles').select('quiz_points').eq('id', dbId).single();
          if (mounted) setScore(profile?.quiz_points ?? localScore);
        } else if (mounted) {
          setScore(localScore);
        }
      } catch (e) {
        console.error('[useQuizHomeData]', e);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    load();
    return () => { mounted = false; };
  }, [managedId]);

  return { categories, rewards, score, loading };
};
