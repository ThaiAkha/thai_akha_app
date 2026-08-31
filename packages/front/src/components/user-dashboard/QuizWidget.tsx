import React, { useMemo } from 'react';
import { UserProfile } from '../../services/auth.service';
import type { QuizRewardDB } from '@thaiakha/shared/types';
import { useQuizProgress } from '../../hooks/useQuizProgress';
import { useQuizCatalog } from '../../hooks/useQuizHomeData';
import { useActiveProfile } from '../../context/ActiveProfileContext';
import QuizCardCategory from '../quiz/QuizCardCategory';
import QuizCard from '../quiz/QuizCard';

interface QuizWidgetProps {
  onNavigate: (page: string, topic?: string, sectionId?: string) => void;
  userProfile?: UserProfile | null;
}

const NO_REWARDS: QuizRewardDB[] = [];
const PROGRESS_KEY = 'thai_akha_quiz_progress_v2';

interface LocalQuizProgress { score?: number; completedModules?: unknown[]; awardedBonuses?: number[] }

/**
 * Widget quiz della dashboard: premi + categorie dal catalogo condiviso (CLAUDE.md #17),
 * punteggio dal profilo attivo. Era un useEffect che scriveva sette stati, quattro dei
 * quali mai letti (level, nextReward, completedCount, accuracy): tolti.
 */
const QuizWidget: React.FC<QuizWidgetProps> = ({ onNavigate, userProfile }) => {
  const { categories, rewards: dbRewards } = useQuizCatalog();
  const { getCategoryProgress } = useQuizProgress();
  const { managedProfiles, activeProfileId, isActingAsManaged } = useActiveProfile();
  const activeManaged = managedProfiles.find(p => p.id === activeProfileId) ?? null;

  // F2 — profilo ATTIVO. Per un gestito: XP da profiles.quiz_points del gestito,
  // niente localStorage (cache per-device dell'host).
  const managed = isActingAsManaged && activeManaged ? activeManaged : null;
  // F3 — i visitor non hanno premi: lista rewards vuota.
  const visitor = managed?.profile_kind === 'visitor';
  const rewards = visitor ? NO_REWARDS : dbRewards;

  const { xp, awardedBonuses } = useMemo(() => {
    // Dettagli progressi (moduli completati, bonus) dal localStorage solo per l'host.
    let localData: LocalQuizProgress | null = null;
    if (!managed) {
      const saved = localStorage.getItem(PROGRESS_KEY);
      if (saved) { try { localData = JSON.parse(saved); } catch (e) { console.error("Quiz data parse error", e); } }
    }
    // Punteggio: fonte di verità = profiles.quiz_points (gestito o host, cross-device),
    // fallback a localStorage per ospiti. Risolve il desync del widget dashboard.
    const currentScore = managed
      ? (managed.quiz_points ?? 0)
      : (userProfile?.quiz_points != null)
        ? userProfile.quiz_points
        : (localData?.score || 0);
    return { xp: currentScore, awardedBonuses: localData?.awardedBonuses || [] };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- activeManaged object identity changes; its used fields are already tracked (stesse deps dell'effetto originale)
  }, [userProfile?.quiz_points, activeProfileId, activeManaged?.quiz_points, isActingAsManaged]);

  // Derived walletRewards
  const walletRewards = rewards.map(r => ({
    ...r,
    icon: r.icon_name
  }));

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 pb-24 [space-y:var(--space-fluid-l)]">
      
      <div className="flex flex-col [gap:var(--space-fluid-l)]">

        {/* ROW 1: SCORE & REWARDS (Heritage Wallet) */}
        <QuizCard
          awardedBonuses={awardedBonuses}
          rewards={walletRewards}
          currentScore={xp}
          columns={7}
          onCardClick={() => {}} // Attiva cursore pointer e interattività
        />

        {/* ROW 2: CATEGORIES (Single Column) */}
        <div className="grid grid-cols-1 [gap:var(--space-fluid-l)]">
           {categories.slice(0, 4).map(cat => (
              <QuizCardCategory
                key={cat.id}
                category={cat}
                progress={getCategoryProgress(cat.id)}
                onClick={(id) => onNavigate('akha-wisdom-path-quiz', undefined, id)}
              />
           ))}
        </div>

      </div>

    </div>
  );
};

export default QuizWidget;
