import { useState, useEffect } from 'react';
import { contentService } from '@thaiakha/shared/services';

const PROGRESS_KEY = 'thai_akha_quiz_progress_v2';

export interface ProgressData {
  completed: number;
  total: number;
  percentage: number;
}

export const useQuizProgress = () => {
  const [loading, setLoading] = useState(true);
  const [perfectModules, setPerfectModules] = useState<string[]>([]);
  const [completedModules, setCompletedModules] = useState<string[]>([]);
  const [quizData, setQuizData] = useState<any[]>([]);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        // Load local progress
        try {
          const stored = localStorage.getItem(PROGRESS_KEY);
          if (stored) {
            const parsed = JSON.parse(stored);
            setPerfectModules(parsed.perfectModules || []);
            setCompletedModules(parsed.completedModules || []);
          }
        } catch { /* noop */ }

        // Fetch all quiz data
        const dbData = await contentService.getQuizData();
        setQuizData(dbData || []);
      } catch (e) {
        console.error('[useQuizProgress]', e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const getCategoryProgress = (categoryId: string): ProgressData => {
    const categoryLevels = quizData.filter(l => l.category_id === categoryId);
    let total = 0;
    let completed = 0;

    categoryLevels.forEach(lvl => {
      if (lvl.modules) {
        total += lvl.modules.length;
        lvl.modules.forEach((m: any) => {
          if (completedModules.includes(m.id)) {
            completed += 1;
          }
        });
      }
    });

    return {
      completed,
      total,
      percentage: total > 0 ? Math.round((completed / total) * 100) : 0
    };
  };

  const getLevelProgress = (levelId: number): ProgressData => {
    const level = quizData.find(l => l.id === levelId);
    let total = 0;
    let completed = 0;

    if (level && level.modules) {
      total = level.modules.length;
      level.modules.forEach((m: any) => {
        if (completedModules.includes(m.id)) {
          completed += 1;
        }
      });
    }

    return {
      completed,
      total,
      percentage: total > 0 ? Math.round((completed / total) * 100) : 0
    };
  };

  const getGlobalProgress = (): ProgressData => {
    let total = 0;
    let completed = 0;

    quizData.forEach(lvl => {
      if (lvl.modules) {
        total += lvl.modules.length;
        lvl.modules.forEach((m: any) => {
          if (completedModules.includes(m.id)) {
            completed += 1;
          }
        });
      }
    });

    return {
      completed,
      total,
      percentage: total > 0 ? Math.round((completed / total) * 100) : 0
    };
  };

  return {
    loading,
    getCategoryProgress,
    getLevelProgress,
    getGlobalProgress,
    perfectModules,
    completedModules,
  };
};
