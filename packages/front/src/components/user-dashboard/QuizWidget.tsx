import React, { useState, useEffect } from 'react';
import { Typography, Button, Icon, Badge, Card } from '../ui';
import { cn } from '@thaiakha/shared/lib/utils';
// Assicurati che l'import includa sia la costante che il TIPO
import { contentService } from '@thaiakha/shared/services';
import { UserProfile } from '../../services/auth.service';
import type { ContentCategoryDB } from '@thaiakha/shared/types';
import { useQuizProgress } from '../../hooks/useQuizProgress';
import { useActiveProfile } from '../../context/ActiveProfileContext';
import QuizCardCategory from '../quiz/QuizCardCategory';
import QuizCard from '../quiz/QuizCard';

interface QuizWidgetProps {
  onNavigate: (page: string, topic?: string, sectionId?: string) => void;
  userProfile?: UserProfile | null;
}

// Mock Data per la Leaderboard
const LEADERBOARD = [
  { rank: 1, name: "HillWarrior", xp: 14200, avatar: "🔥" },
  { rank: 2, name: "BambooSpirit", xp: 13850, avatar: "🎋" },
  { rank: 3, name: "TeaLeaf_99", xp: 12400, avatar: "🍵" },
];

const QuizWidget: React.FC<QuizWidgetProps> = ({ onNavigate, userProfile }) => {
  const [xp, setXp] = useState(0);
  const [level, setLevel] = useState(1);
  const [rewards, setRewards] = useState<any[]>([]);
  const [categories, setCategories] = useState<ContentCategoryDB[]>([]);
  const [nextReward, setNextReward] = useState<any | null>(null);
  const [completedCount, setCompletedCount] = useState(0);
  const [accuracy, setAccuracy] = useState(0);
  
  const { getCategoryProgress } = useQuizProgress();
  const { managedProfiles, activeProfileId, isActingAsManaged } = useActiveProfile();
  const activeManaged = managedProfiles.find(p => p.id === activeProfileId) ?? null;
  const [selectedRewardId, setSelectedRewardId] = useState<string | null>(null);
  
  // ✅ FIX STATO: Manteniamo anche questo fix precedente
  const [awardedBonuses, setAwardedBonuses] = useState<number[]>([]);

  // --- SYNC DATI REALI ---
  useEffect(() => {
    const init = async () => {
      const [dbRewards, dbCats] = await Promise.all([
        contentService.getQuizRewards(),
        contentService.getQuizCategories(),
      ]);
      setCategories(dbCats || []);

      // F2 — profilo ATTIVO. Per un gestito: XP da profiles.quiz_points del gestito,
      // niente localStorage (cache per-device dell'host).
      const managed = isActingAsManaged && activeManaged ? activeManaged : null;
      // F3 — i visitor non hanno premi: lista rewards vuota.
      const visitor = managed?.profile_kind === 'visitor';
      setRewards(visitor ? [] : (dbRewards || []));

      // Dettagli progressi (moduli completati, bonus) dal localStorage solo per l'host.
      let localData: { score?: number; completedModules?: unknown[]; awardedBonuses?: number[] } | null = null;
      if (!managed) {
        const saved = localStorage.getItem('thai_akha_quiz_progress_v2');
        if (saved) { try { localData = JSON.parse(saved); } catch (e) { console.error("Quiz data parse error", e); } }
      }

      // Punteggio: fonte di verità = profiles.quiz_points (gestito o host, cross-device),
      // fallback a localStorage per ospiti. Risolve il desync del widget dashboard.
      const currentScore = managed
        ? (managed.quiz_points ?? 0)
        : (userProfile?.quiz_points != null)
          ? userProfile.quiz_points
          : (localData?.score || 0);

      setXp(currentScore);
      setLevel(Math.floor(currentScore / 100) + 1);
      setCompletedCount((localData?.completedModules || []).length);
      setAwardedBonuses(localData?.awardedBonuses || []);

      // Prossimo premio = primo non ancora sbloccato dal punteggio reale (no per i visitor).
      const next = visitor ? null : (dbRewards || []).find((r: any) => currentScore < (r.required_points ?? 0));
      setNextReward(visitor ? null : (next || (dbRewards && dbRewards[dbRewards.length - 1]) || null));

      setAccuracy(localData || currentScore > 0 ? 98 : 0);
    };
    init();
  }, [userProfile?.quiz_points, activeProfileId, activeManaged?.quiz_points, isActingAsManaged]);

  // Calcolo Percentuale per il prossimo livello (visivo)
  const progressPercent = Math.min(100, (xp % 100)); 
  const rankTitle = level < 2 ? "Novice Visitor" : level < 4 ? "Village Explorer" : "Akha Guardian";
  
  // Parametri Cerchio SVG
  const radius = 18;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progressPercent / 100) * circumference;

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