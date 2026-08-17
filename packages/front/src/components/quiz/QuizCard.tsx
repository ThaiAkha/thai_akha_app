import React, { useState } from 'react';
import { Typography, Icon, Card, Badge } from '../ui/index';
import { cn } from '@thaiakha/shared/lib/utils';
import { t } from '../../i18n';
import QuizModalRewards from './QuizModalRewards';

// ── Interfaccia Reward Dinamica ──────────────────────────────────────────────

interface Reward {
  id: number;
  label: string;
  icon: string;
  required_points: number;
  image_url?: string | null;
  description?: string | null;
  audio_url?: string | null;
  pdf_url?: string | null;
}

interface QuizCardProps {
  awardedBonuses: number[];
  rewards?: Reward[];
  currentScore?: number;
  onCardClick?: () => void;
  className?: string;
  title?: string;
  description?: string;
  hideDescription?: boolean;
  columns?: number;
  onModalClose?: () => void;
}

const QuizCard: React.FC<QuizCardProps> = ({ 
  awardedBonuses, 
  rewards = [], 
  currentScore = 0,
  onCardClick, 
  className = "",
  title = t('quiz:collectionTitle'),
  description = t('quiz:collectionDesc'),
  hideDescription = false,
  columns = 4,
  onModalClose
}) => {
  const [selectedReward, setSelectedReward] = useState<Reward | null>(null);

  // Ordina i premi per punti richiesti
  const sortedRewards = [...rewards].sort((a, b) => a.required_points - b.required_points);
  
  // Trova l'ultimo premio sbloccato e il prossimo da sbloccare
  const lastUnlocked = [...sortedRewards].reverse().find(r => currentScore >= r.required_points);
  const nextReward = sortedRewards.find(r => currentScore < r.required_points);

  const basePoints = lastUnlocked?.required_points ?? 0;
  const targetPoints = nextReward?.required_points ?? (lastUnlocked ? lastUnlocked.required_points + 100 : 100);
  
  // Calcola la percentuale di avanzamento DIRETTA verso l'obiettivo
  const displayProgress = Math.min(100, Math.round((currentScore / targetPoints) * 100));

  return (
    <Card 
      variant="glass" 
      padding="none" 
      onClick={onCardClick}
      className={cn(
        "flex flex-col rounded-[2.5rem] bg-surface/5 dark:bg-black/40 border-white/10 overflow-hidden relative group shadow-theme-xl",
        onCardClick ? "cursor-pointer" : "cursor-default",
        "transition-all duration-500 hover:shadow-[0_20px_40px_-15px_rgba(var(--quiz-p-ch),0.3)]",
        className
      )}
    >
      {/* 1. HEADER */}
      <div className="[padding:var(--space-fluid-m)] [padding-top:var(--space-fluid-m)] [padding-bottom:var(--space-fluid-2xs)] relative z-10">
        <div className="flex justify-between items-start [gap:var(--space-fluid-s)]">
          <div className="flex flex-col flex-1">
            <Typography 
              variant="h3" 
              color="title" 
              className="italic uppercase leading-none [margin-bottom:var(--space-fluid-2xs)]"
            >
              {title}
            </Typography>
            {!hideDescription && (
              <Typography variant="paragraphS" color="muted" className="leading-tight line-clamp-2">
                {description}
              </Typography>
            )}
          </div>

          <div className="shrink-0 size-12 rounded-2xl bg-quiz text-color-inverse flex items-center justify-center shadow-lg shadow-quiz/20 transition-transform duration-500 group-hover:scale-110">
            <Icon name="emoji_events" size="md" className="font-black" />
          </div>
        </div>
      </div>

      {/* 2. PROGRESS BAR */}
      <div className="[padding-inline:var(--space-fluid-m)] [padding-block:var(--space-fluid-xs)]">
        <div className="flex justify-between items-end [margin-bottom:var(--space-fluid-2xs)]">
          <div className="flex flex-col">
            <Typography variant="microLabel" className="text-quiz-text/60 uppercase font-black tracking-[0.2em] mb-1">
              {nextReward ? "Next Reward" : "All Unlocked"}
            </Typography>
            <Typography variant="numericRegular" className="text-quiz-text font-black text-sm">
              {currentScore} <span className="opacity-40 font-medium mx-1">/</span> {targetPoints} <span className="text-[10px] opacity-60 uppercase ml-1">XP</span>
            </Typography>
          </div>
          <Typography variant="numericRegular" className="text-quiz-text font-black text-2xl leading-none">{displayProgress}%</Typography>
        </div>
        <div className="h-2.5 w-full bg-white/5 rounded-full overflow-hidden border border-white/5">
          <div 
            className="h-full bg-gradient-to-r from-quiz-s to-quiz-p shadow-[0_0_20px_rgba(var(--quiz-s-rgb),0.5)] transition-all duration-1000 ease-out" 
            style={{ width: `${displayProgress}%` }} 
          />
        </div>
      </div>

      {/* 3. REWARDS GRID */}
      <div className={cn(
        "flex-1 [padding:var(--space-fluid-m)] grid [gap:var(--space-fluid-s)] content-start",
        columns === 7 ? "grid-cols-4 lg:grid-cols-7" : "grid-cols-4"
      )}>
        {rewards.length > 0 ? (
          rewards.map((reward) => {
            const isUnlocked = awardedBonuses.includes(reward.id);
            return (
              <div 
                key={reward.id} 
                className={cn(
                  "aspect-square rounded-2xl flex flex-col items-center justify-center gap-1 border-2 transition-all duration-300 relative group/item overflow-hidden cursor-pointer",
                  isUnlocked 
                    ? "bg-quiz text-color-inverse border-action shadow-lg z-10 shadow-action/20" 
                    : "bg-white/5 text-white/20 border-white/5 hover:border-white/20"
                )}
                title={reward.label}
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedReward(reward);
                }}
              >
                {/* Premium Locked/Unlocked Overlay */}
                {!isUnlocked ? (
                  <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/20 group-hover/item:bg-transparent transition-colors duration-500">
                    <div className="size-11 rounded-full bg-black/40 backdrop-blur-md border border-white/20 flex items-center justify-center shadow-lg transition-transform duration-500 group-hover/item:scale-110">
                      <Icon name="lock" size="sm" className="text-white/80" />
                    </div>
                  </div>
                ) : (
                  <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/5 group-hover/item:bg-black/20 transition-colors duration-500">
                    <div className="size-11 rounded-full bg-action/20 backdrop-blur-md border border-action/40 flex items-center justify-center shadow-lg transition-all duration-500 group-hover/item:scale-110">
                      <Icon name="visibility" size="sm" className="text-action" />
                    </div>
                  </div>
                )}

                {reward.image_url ? (
                  <img 
                    src={reward.image_url} 
                    alt={reward.label} 
                    className={cn(
                      "w-full h-full object-cover transition-all duration-500", 
                      !isUnlocked && "opacity-40 grayscale blur-[1px]"
                    )} 
                  />
                ) : (
                  <Icon name={isUnlocked ? reward.icon : 'lock'} size="md" className={cn(!isUnlocked && "opacity-20")} />
                )}
                {isUnlocked && (
                  <div className="absolute -top-1 -right-1 size-2.5 bg-sys-success rounded-full animate-pulse border-2 border-white dark:border-black shadow-lg" />
                )}
              </div>
            );
          })
        ) : (
          // Loading Skeleton
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="aspect-square rounded-2xl bg-white/5 animate-pulse" />
          ))
        )}
      </div>

      {/* 4. FOOTER — UNLOCKED LIST */}
      {rewards.filter(r => awardedBonuses.includes(r.id)).length > 0 && (
        <div className="[padding-inline:var(--space-fluid-m)] [padding-bottom:var(--space-fluid-m)] [margin-top:var(--space-fluid-2xs)]">
          <div className="bg-black/20 rounded-2xl [padding:var(--space-fluid-xs)] border border-white/5">
            <Typography variant="paragraphS" className="text-white/60 leading-tight">
              <span className="font-black text-action uppercase text-[10px] tracking-widest mr-2">{t('quiz:unlockedLabel') || 'Unlocked'}:</span>
              {rewards
                .filter(r => awardedBonuses.includes(r.id))
                .map((r, i, arr) => (
                  <React.Fragment key={r.id}>
                    <span className="text-white/80">{r.label}</span>
                    {i < arr.length - 1 && <span className="mx-1.5 text-action opacity-50">•</span>}
                  </React.Fragment>
                ))}
            </Typography>
          </div>
        </div>
      )}

      {/* 4. GALLERY MODAL PER TUTTI I PREMI */}
      <QuizModalRewards
        isOpen={selectedReward !== null}
        onClose={() => {
          setSelectedReward(null);
          if (onModalClose) onModalClose();
        }}
        rewards={rewards}
        initialRewardId={selectedReward ? selectedReward.id : null}
        awardedBonuses={awardedBonuses}
      />
    </Card>
  );
};

export default QuizCard;