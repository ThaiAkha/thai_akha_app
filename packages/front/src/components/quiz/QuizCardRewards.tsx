import React, { useState } from 'react';
import { cn } from '@thaiakha/shared/lib/utils';
import type { QuizRewardDB } from '@thaiakha/shared/types';
import { Typography, MediaImage, Badge, Icon } from '../ui/index';

interface QuizCardRewardsProps {
  reward: QuizRewardDB;
  currentScore: number;
  isNextToUnlock?: boolean;
  className?: string;
}

const QuizCardRewards: React.FC<QuizCardRewardsProps> = ({ 
  reward, 
  currentScore,
  isNextToUnlock = false,
  className 
}) => {
  const [isFlipped, setIsFlipped] = useState(false);
  const isUnlocked = currentScore >= reward.required_points;
  const progress = Math.min(100, (currentScore / reward.required_points) * 100);

  // Forza lo stile allergy
  const allergyStyle = { color: 'var(--color-allergy)' };

  return (
    <div 
      className={cn("relative w-full aspect-[4/5] perspective-1000", className)}
      onMouseEnter={() => setIsFlipped(true)}
      onMouseLeave={() => setIsFlipped(false)}
    >
      <div className={cn(
        "relative w-full h-full transition-all duration-700 preserve-3d ease-cinematic cursor-help",
        isFlipped && "rotate-y-180"
      )}>
        
        {/* FRONT SIDE */}
        <div className={cn(
          "absolute inset-0 backface-hidden w-full h-full flex flex-col",
          "overflow-hidden rounded-[2.5rem] border transition-all duration-700 ease-cinematic group",
          "bg-gray-950",
          isUnlocked ? "border-white/20 shadow-glow-lime/10" : "border-white/10"
        )}>
          
          {/* HEADER (1:1 Photo & Title) */}
          <div className="relative aspect-square w-full overflow-hidden shrink-0">
             <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-transparent pointer-events-none z-10" />
             <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-gray-950 to-transparent z-10 opacity-90" />

             <div className={cn(
                "w-full h-full transition-all duration-700",
                !isUnlocked && "opacity-50"
             )}>
                {reward.image_url ? (
                <MediaImage
                    url={reward.image_url}
                    fallbackAlt={reward.label}
                    showCaption={false}
                    className="w-full h-full"
                    imgClassName="w-full h-full object-cover transition-transform duration-1000 ease-out group-hover:scale-110"
                />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gray-900 border-b border-white/5">
                     <Icon name="emoji_events" size="xl" className="text-white/20" />
                  </div>
                )}
             </div>

             {/* XP Badge */}
             <div className="absolute top-4 right-4 z-30">
                <Badge variant="mineral" size="xs" color="quiz-p" className="backdrop-blur-2xl bg-black/60 !text-white font-black">
                  {reward.required_points} XP
                </Badge>
             </div>

             <div className="absolute inset-x-0 bottom-0 [padding:var(--space-fluid-m)] flex items-center justify-center z-20">
                <Typography variant="h3" className="uppercase tracking-tighter text-white text-center leading-tight">
                    {reward.label}
                </Typography>
             </div>
          </div>

          {/* FOOTER FRONT */}
          <div className="flex-1 bg-surface-2/10 backdrop-blur-md flex flex-col items-center justify-center [padding-inline:var(--space-fluid-m)] [gap:var(--space-fluid-2xs)]">
            {isUnlocked ? (
               <Typography variant="microLabel" color="action" className="animate-pulse flex items-center gap-1 font-black uppercase tracking-[0.1em]">
                  <div className="size-1.5 rounded-full bg-action" />
                  Unlocked reward
               </Typography>
            ) : isNextToUnlock ? (
               <div className="w-full flex flex-col items-center gap-2 px-2">
                  <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden border border-white/5">
                    <div 
                      className="h-full bg-gradient-to-r from-quiz-p to-quiz-s transition-all duration-1000 ease-out"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                  <Typography variant="microLabel" color="primary" className="font-black animate-pulse uppercase tracking-[0.1em]">
                    Progressing
                  </Typography>
               </div>
            ) : (
               <div className="flex items-center gap-2 opacity-60">
                  <Icon name="lock" size="xs" color="muted" />
                  <Typography variant="microLabel" color="muted" className="font-black uppercase tracking-[0.1em]">
                    Locked
                  </Typography>
               </div>
            )}
          </div>
        </div>

        {/* BACK SIDE */}
        <div className={cn(
          "absolute inset-0 backface-hidden rotate-y-180 w-full h-full flex flex-col",
          "overflow-hidden rounded-[2.5rem] border border-secondary/30",
          "bg-black"
        )}>
          <div className="absolute inset-0 bg-gradient-to-tr from-secondary/10 via-transparent to-secondary/5 pointer-events-none" />

          {/* Akha Secret - FONT UNIFICATO CON FRONT (microLabel) */}
          <div className="[padding:var(--space-fluid-m)] [padding-bottom:0] flex flex-col items-center text-center z-10 shrink-0">
             <Typography 
                variant="microLabel" 
                style={allergyStyle} 
                className="font-black uppercase tracking-[0.2em] opacity-60"
             >
                Akha Secret
             </Typography>
          </div>

          <div className="flex-1 flex items-center justify-center [padding:var(--space-fluid-m)] overflow-hidden z-10">
            <Typography 
                variant="paragraphS" 
                style={allergyStyle}
                className="text-center italic font-bold leading-relaxed overflow-y-auto custom-scrollbar"
            >
              {reward.description || "Every step brings you closer to the Akha wisdom. Unlock now to reveal the secret!"}
            </Typography>
          </div>

          {/* REQUISITO PUNTI - UNA RIGA SOLA */}
          <div className="[padding:var(--space-fluid-m)] pt-0 z-10 shrink-0">
             <div className="flex items-center justify-between border-t border-white/5 pt-4">
                <Typography variant="microLabel" style={allergyStyle} className="font-black uppercase tracking-[0.12em] opacity-60">
                   Required
                </Typography>
                <div className="flex items-center gap-1.5">
                    <Typography 
                        variant="numericStat" 
                        style={allergyStyle} 
                        className="[font-size:var(--text-fluid-h3)] leading-none font-black"
                    >
                      {reward.required_points}
                    </Typography>
                    <Typography variant="microLabel" style={allergyStyle} className="font-black scale-90 mt-1">XP</Typography>
                </div>
             </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default QuizCardRewards;
