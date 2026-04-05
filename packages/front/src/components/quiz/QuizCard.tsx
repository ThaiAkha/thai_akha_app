import React from 'react';
import { Typography, Icon, Card, Badge } from '../ui/index';
import { cn } from '@thaiakha/shared/lib/utils';
import { t } from '@thaiakha/shared/lib/ui-strings';

// ── Interfaccia Reward Dinamica ──────────────────────────────────────────────

interface Reward {
  id: number;
  label: string;
  icon: string;
}

interface QuizCardProps {
  awardedBonuses: number[];
  rewards?: Reward[];
  onCardClick?: () => void;
  className?: string;
  title?: string;
  description?: string;
}

const QuizCard: React.FC<QuizCardProps> = ({ 
  awardedBonuses, 
  rewards = [], 
  onCardClick, 
  className = "",
  title = t.quiz.collectionTitle,
  description = t.quiz.collectionDesc
}) => {
  const totalRewards = rewards.length;
  const unlockedCount = awardedBonuses.length;
  const progress = totalRewards > 0 ? Math.round((unlockedCount / totalRewards) * 100) : 0;

  return (
    <Card 
      variant="glass" 
      padding="none" 
      onClick={onCardClick}
      className={cn(
        "flex flex-col bg-surface/5 dark:bg-black/40 border-white/10 overflow-hidden relative group cursor-pointer shadow-theme-xl",
        "transition-all duration-500 hover:-translate-y-1 hover:shadow-brand-glow/20",
        className
      )}
    >
      {/* 1. HEADER */}
      <div className="[padding:var(--space-fluid-m)] [padding-bottom:var(--space-fluid-2xs)] relative z-10">
        <div className="flex justify-between items-start [margin-bottom:var(--space-fluid-s)]">
          <Badge variant="mineral" color="action" size="sm">
            <Typography variant="badge">{t.quiz.headerBadge}</Typography>
          </Badge>
          <div className="size-12 rounded-2xl bg-quiz text-color-inverse flex items-center justify-center shadow-lg shadow-quiz/20 transition-transform duration-500 group-hover:scale-110">
            <Icon name="emoji_events" size="md" className="font-black" />
          </div>
        </div>
        
        <Typography 
          variant="h3" 
          color="title" 
          className="italic uppercase leading-none [margin-bottom:var(--space-fluid-2xs)]"
        >
          {title}
        </Typography>
        <Typography variant="paragraphS" color="muted" className="leading-tight line-clamp-2">
          {description}
        </Typography>
      </div>

      {/* 2. PROGRESS BAR */}
      <div className="[padding-inline:var(--space-fluid-m)] [padding-block:var(--space-fluid-xs)]">
        <div className="flex justify-between [margin-bottom:var(--space-fluid-2xs)]">
          <Typography variant="microLabel" color="muted" className="uppercase font-black tracking-[0.2em]">{t.quiz.completion}</Typography>
          <Typography variant="numericRegular" color="primary" className="font-black">{progress}%</Typography>
        </div>
        <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
          <div 
            className="h-full bg-quiz shadow-[0_0_10px_var(--color-quiz)] transition-all duration-1000 ease-out" 
            style={{ width: `${progress}%` }} 
          />
        </div>
      </div>

      {/* 3. REWARDS GRID */}
      <div className="flex-1 [padding:var(--space-fluid-m)] grid grid-cols-4 [gap:var(--space-fluid-xs)] content-start">
        {rewards.length > 0 ? (
          rewards.map((reward) => {
            const isUnlocked = awardedBonuses.includes(reward.id);
            return (
              <div 
                key={reward.id} 
                className={cn(
                  "aspect-square rounded-2xl flex flex-col items-center justify-center gap-1 border transition-all duration-300 relative group/item",
                  isUnlocked 
                    ? "bg-quiz text-color-inverse border-quiz shadow-lg scale-105 z-10" 
                    : "bg-white/5 text-white/20 border-white/5"
                )}
                title={reward.label}
              >
                <Icon name={isUnlocked ? reward.icon : 'lock'} size="md" />
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

      {/* Footer CTA */}
      <div className={cn(
        "bg-white/5 border-t border-white/5 mt-auto",
        "transition-all duration-500 group-hover:bg-quiz group-hover:text-color-inverse",
        "[padding:var(--space-fluid-s)] [padding-inline:var(--space-fluid-m)]"
      )}>
        <div className="flex items-center justify-between">
          <Typography variant="badge" className="font-black uppercase tracking-widest">
            {t.quiz.viewWallet}
          </Typography>
          <Icon name="arrow_forward" size="sm" className="transition-transform group-hover:translate-x-1" />
        </div>
      </div>

    </Card>
  );
};

export default QuizCard;