import React from 'react';
import { Typography, Icon, Card, Badge } from './index';
import { cn } from '../../lib/utils';

// Interfaccia Reward Dinamica
interface Reward {
  id: number;
  label: string;
  icon: string;
}

interface QuizCardProps {
  awardedBonuses: number[];
  rewards?: Reward[]; // Opzionale, se non passato mostriamo uno stato di loading/empty
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
  title = "Spirit Rewards",
  description = "Unlock heritage gifts by mastering the quiz."
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
        "flex flex-col bg-[#1a1a1a] border-white/10 overflow-hidden relative group cursor-pointer",
        className
      )}
    >
      {/* 1. HEADER */}
      <div className="p-8 pb-4 relative z-10">
        <div className="flex justify-between items-start mb-4">
          <Badge variant="mineral" className="bg-quiz/10 text-quiz border-quiz/20">
            Collection
          </Badge>
          <div className="size-12 rounded-2xl bg-quiz text-black flex items-center justify-center shadow-lg shadow-quiz/20">
            <Icon name="emoji_events" size="md" className="font-black" />
          </div>
        </div>
        
        <Typography variant="h3" className="text-white italic uppercase leading-none mb-2">
          {title}
        </Typography>
        <Typography variant="body" className="text-white/60 text-sm leading-tight">
          {description}
        </Typography>
      </div>

      {/* 2. PROGRESS BAR */}
      <div className="px-8 py-2">
        <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-white/40 mb-2">
          <span>Completion</span>
          <span className="text-quiz">{progress}%</span>
        </div>
        <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
          <div 
            className="h-full bg-quiz shadow-[0_0_10px_rgba(254,202,42,0.5)] transition-all duration-1000 ease-out" 
            style={{ width: `${progress}%` }} 
          />
        </div>
      </div>

      {/* 3. REWARDS GRID (Dynamic) */}
      <div className="flex-1 p-8 grid grid-cols-4 gap-3 content-start">
        {rewards.length > 0 ? (
          rewards.map((reward) => {
            const isUnlocked = awardedBonuses.includes(reward.id);
            return (
              <div 
                key={reward.id} 
                className={cn(
                  "aspect-square rounded-2xl flex flex-col items-center justify-center gap-1 border transition-all duration-300 relative group/item",
                  isUnlocked 
                    ? "bg-quiz text-black border-quiz shadow-lg scale-105 z-10" 
                    : "bg-white/5 text-white/20 border-white/5"
                )}
                title={reward.label}
              >
                <Icon name={isUnlocked ? reward.icon : 'lock'} size="md" />
                {isUnlocked && (
                  <div className="absolute -top-1 -right-1 size-2 bg-green-500 rounded-full animate-pulse border border-black" />
                )}
              </div>
            );
          })
        ) : (
          // Loading Skeleton
          [1-4].map(i => <div key={i} className="aspect-square rounded-2xl bg-white/5 animate-pulse" />)
        )}
      </div>

      {/* Footer CTA */}
      <div className="p-6 bg-white/5 border-t border-white/5 mt-auto group-hover:bg-quiz group-hover:text-black transition-colors duration-500">
        <div className="flex items-center justify-between">
          <span className="font-black uppercase tracking-widest text-xs">View Wallet</span>
          <Icon name="arrow_forward" size="sm" />
        </div>
      </div>

    </Card>
  );
};

export default QuizCard;