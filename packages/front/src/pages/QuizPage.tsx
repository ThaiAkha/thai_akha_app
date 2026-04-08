import React, { useEffect, useState } from 'react';
import { supabase } from '@thaiakha/shared/lib/supabase';
import { contentService } from '@thaiakha/shared/services';
import type { QuizCategoryDB, QuizRewardDB } from '@thaiakha/shared/types';
import { Typography } from '../components/ui/index';
import { SkeletonBase } from '../components/skeleton/atoms';
import { SkeletonHeader } from '../components/skeleton/compositions';
import { PageLayout } from '../components/layout/PageLayout';
import { SmartHeaderSection } from '../components/layout/SmartHeaderSection';
import HeaderQuiz from '../components/quiz/HeaderQuiz';
import QuizCardCategory from '../components/quiz/QuizCardCategory';
import QuizCardRewards from '../components/quiz/QuizCardRewards';
import { t } from '@thaiakha/shared/lib/ui-strings';
import { AkhaHistoryLine } from '../components/blog';

// ── Score helpers ─────────────────────────────────────────────────────────────
const SCORE_KEY = 'thai_akha_quiz_points';
export const getLocalScore = (): number => {
  try { return parseInt(localStorage.getItem(SCORE_KEY) ?? '0', 10) || 0; }
  catch { return 0; }
};

// ── QuizPage ──────────────────────────────────────────────────────────────────
interface QuizPageProps {
  onNavigate: (page: string, topic?: string, sectionId?: string) => void;
}

const QuizPage: React.FC<QuizPageProps> = ({ onNavigate }) => {
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState<QuizCategoryDB[]>([]);
  const [rewards, setRewards] = useState<QuizRewardDB[]>([]);
  const [score, setScore] = useState(0);

  useEffect(() => {
    const load = async () => {
      try {
        const [cats, rwds] = await Promise.all([
          contentService.getQuizCategories(),
          contentService.getQuizRewards(),
        ]);

        // Ordiniamo le ricompense per punteggio per calcolare correttamente la "prossima"
        const sortedRewards = (rwds ?? []).sort((a, b) => a.required_points - b.required_points);

        setCategories(cats ?? []);
        setRewards(sortedRewards);

        const localScore = getLocalScore();
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data: profile } = await supabase
            .from('profiles').select('quiz_points').eq('id', user.id).single();
          setScore(profile?.quiz_points ?? localScore);
        } else {
          setScore(localScore);
        }
      } catch (e) {
        console.error('[QuizPage]', e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  // Identifichiamo l'ID della prossima ricompensa da sbloccare
  const nextRewardId = rewards.find(r => r.required_points > score)?.id ?? null;
  const nextReward = rewards.find(r => r.required_points > score) ?? null;
  const xpMax = nextReward?.required_points ?? 100;

  return (
    <PageLayout
      slug="quiz"
      loading={loading}
      hideDefaultHeader={true}
      customHeader={
        <HeaderQuiz
          title={t.quiz.spiritQuizTitle}
          currentLevel={Math.max(1, Math.floor(score / 100) + 1)}
          totalLevels={categories.length || 4}
          score={score}
          maxScore={xpMax}
        />
      }
    >
      {loading ? (
        <div className="flex flex-col w-full [gap:var(--space-fluid-l)]">
          <SkeletonHeader align="left" />
          <div className="grid grid-cols-1 md:grid-cols-2 [gap:var(--space-fluid-m)]">
            {[1, 2, 3, 4].map(i => <SkeletonBase key={i} className="h-40 rounded-3xl" />)}
          </div>
        </div>
      ) : (
        <div className="flex flex-col [gap:var(--space-fluid-l)] [padding-top:var(--space-fluid-xl)] [padding-bottom:var(--space-fluid-3xl)]">

          <SmartHeaderSection
            sectionId="quiz-01"
            variant="hero"
            align="center"
            gradientFrom="quiz"
            gradientTo="primary"
          />

          <AkhaHistoryLine />

          {/* Categories grid */}
          <section className="flex flex-col [gap:var(--space-fluid-m)]">
            <Typography variant="h2" className="text-center">{t.quiz.choosePath}</Typography>
            {categories.length === 0 ? (
              <Typography variant="paragraphM" color="muted">{t.quiz.noCategories}</Typography>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 [gap:var(--space-fluid-xl)]">
                {categories.map(cat => (
                  <QuizCardCategory
                    key={cat.id}
                    category={cat}
                    onClick={(id) => onNavigate('quiz', undefined, id)}
                  />
                ))}
              </div>
            )}
          </section>

          <div className="[padding-top:var(--space-fluid-l)]">
            <AkhaHistoryLine />
          </div>

          <SmartHeaderSection
            sectionId="quiz-02"
            variant="hero"
            align="center"
            gradientFrom="quiz"
            gradientTo="primary"
          />

          {/* Rewards grid */}
          {rewards.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-4 [gap:var(--space-fluid-m)]">
              {rewards.map(reward => (
                <QuizCardRewards
                  key={reward.id}
                  reward={reward}
                  currentScore={score}
                  isNextToUnlock={reward.id === nextRewardId}
                />
              ))}
            </div>
          )}

        </div>
      )}
    </PageLayout>
  );
};

export default QuizPage;
