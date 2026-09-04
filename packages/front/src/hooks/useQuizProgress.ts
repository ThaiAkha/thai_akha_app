import { useState } from 'react';
import { useQuery } from '@thaiakha/shared/query';
import { contentService } from '@thaiakha/shared/services';
import { useLanguage } from '../context/LanguageContext';

const PROGRESS_KEY = 'thai_akha_quiz_progress_v2';

/** Shape minima dei livelli grezzi restituiti da getQuizData (con category_id) usata da questo hook. */
interface QuizProgressLevel {
  id: number;
  category_id: string | null;
  modules?: { id: string }[];
}

export interface ProgressData {
  completed: number;
  total: number;
  percentage: number;
}

const NO_LEVELS: QuizProgressLevel[] = [];

export const quizDataAllQueryKey = (lang = 'en') => ['quiz_data', 'all', lang] as const;

/** Progressi locali, letti UNA volta al mount (com'era: dentro l'effetto). */
function readLocalProgress(): { perfect: string[]; completed: string[] } {
  try {
    const stored = localStorage.getItem(PROGRESS_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      return { perfect: parsed.perfectModules || [], completed: parsed.completedModules || [] };
    }
  } catch { /* noop */ }
  return { perfect: [], completed: [] };
}

/**
 * Progressi quiz per categoria/livello/globali: struttura livelli→moduli dal DB (cache
 * condivisa fra home quiz, widget dashboard e gioco: CLAUDE.md #17) + moduli completati
 * dal localStorage.
 */
export const useQuizProgress = () => {
  const { lang } = useLanguage();
  const [local] = useState(readLocalProgress);
  const perfectModules = local.perfect;
  const completedModules = local.completed;

  const query = useQuery({
    queryKey: quizDataAllQueryKey(lang),
    // getQuizData e' tipizzato Record<string, unknown>[]: si dichiara qui la shape minima usata (id, category_id, modules).
    queryFn: async () => ((await contentService.getQuizData(undefined, lang)) || []) as unknown as QuizProgressLevel[],
  });
  const quizData = query.data ?? NO_LEVELS;

  const countModules = (levels: QuizProgressLevel[]): ProgressData => {
    let total = 0;
    let completed = 0;
    levels.forEach(lvl => {
      if (lvl.modules) {
        total += lvl.modules.length;
        lvl.modules.forEach((m) => {
          if (completedModules.includes(m.id)) completed += 1;
        });
      }
    });
    return { completed, total, percentage: total > 0 ? Math.round((completed / total) * 100) : 0 };
  };

  const getCategoryProgress = (categoryId: string): ProgressData =>
    countModules(quizData.filter(l => l.category_id === categoryId));

  const getLevelProgress = (levelId: number): ProgressData => {
    const level = quizData.find(l => l.id === levelId);
    return countModules(level ? [level] : []);
  };

  const getGlobalProgress = (): ProgressData => countModules(quizData);

  return {
    loading: query.isPending,
    getCategoryProgress,
    getLevelProgress,
    getGlobalProgress,
    perfectModules,
    completedModules,
  };
};
