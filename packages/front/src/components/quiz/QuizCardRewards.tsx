import React, { useState } from 'react';
import { cn } from '@thaiakha/shared/lib/utils';
import type { QuizRewardDB } from '@thaiakha/shared/types';
import { Typography, MediaImage, Badge, Icon } from '../ui/index';

interface QuizCardRewardsProps {
  reward: QuizRewardDB;
  currentScore: number;
  isNextToUnlock?: boolean;
  /** Grand-prize showcase: full-width horizontal "trophy" card (col-span-2). */
  featured?: boolean;
  onClick?: (reward: QuizRewardDB) => void;
  className?: string;
}

const QuizCardRewards: React.FC<QuizCardRewardsProps> = ({
  reward,
  currentScore,
  isNextToUnlock = false,
  featured = false,
  onClick,
  className
}) => {
  const [isFlipped, setIsFlipped] = useState(false);
  const isUnlocked = currentScore >= reward.required_points;
  const progress = Math.min(100, (currentScore / reward.required_points) * 100);

  // Forza lo stile allergy
  const allergyStyle = { color: 'var(--color-allergy)' };

  // ── FEATURED — Grand Prize trophy (full-width horizontal showcase) ──────────
  if (featured) {
    return (
      <div
        className={cn(
          "relative w-full cursor-pointer group overflow-hidden",
          "rounded-[2.5rem] border-2 transition-all duration-700 ease-cinematic",
          "bg-gray-950",
          isUnlocked
            ? "border-action shadow-[0_0_60px_-15px_rgba(152,201,60,0.5)]"
            : "border-quiz-p/40 shadow-2xl hover:border-quiz-p/60",
          className
        )}
        onClick={() => onClick?.(reward)}
      >
        {/* Ambient glow */}
        <div className={cn(
          "absolute inset-0 pointer-events-none bg-gradient-to-tr",
          isUnlocked
            ? "from-action/10 via-transparent to-quiz-p/10"
            : "from-quiz-p/15 via-transparent to-quiz-s/10"
        )} />

        <div className="relative z-10 flex flex-col md:flex-row md:items-stretch">
          {/* IMAGE / PLACEHOLDER */}
          <div className="relative w-full md:w-2/5 aspect-[16/9] md:aspect-auto md:min-h-[17rem] overflow-hidden shrink-0">
            <div className="absolute inset-0 z-10 bg-gradient-to-t md:bg-gradient-to-r from-gray-950 via-gray-950/20 to-transparent pointer-events-none" />
            <div className={cn("w-full h-full transition-all duration-700", !isUnlocked && "opacity-60")}>
              {reward.image_url ? (
                <MediaImage
                  url={reward.image_url}
                  fallbackAlt={reward.label}
                  showCaption={false}
                  className="w-full h-full"
                  imgClassName={cn(
                    "w-full h-full object-cover transition-transform duration-1000 ease-out group-hover:scale-105",
                    !isUnlocked && "grayscale"
                  )}
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center [gap:var(--space-fluid-2xs)] bg-gray-900">
                  <Icon name="menu_book" size="2xl" className="text-white/25" />
                  <Typography variant="microLabel" color="muted" className="uppercase tracking-[0.2em] font-black">
                    Heritage Book
                  </Typography>
                </div>
              )}
            </div>
            {/* Grand Prize ribbon */}
            <div className="absolute top-4 left-4 z-20 flex items-center gap-2 [padding-inline:var(--space-fluid-s)] py-1.5 rounded-full bg-quiz-p/80 backdrop-blur-md border border-white/20 shadow-lg">
              <Icon name="emoji_events" size="xs" className="text-white" />
              <Typography variant="microLabel" className="text-white font-black uppercase tracking-[0.15em]">
                Grand Prize
              </Typography>
            </div>
          </div>

          {/* CONTENT */}
          <div className="flex-1 flex flex-col justify-center [padding:var(--space-fluid-l)] [gap:var(--space-fluid-s)]">
            <Typography variant="microLabel" color="action" className="uppercase tracking-[0.2em] font-black">
              Final Reward
            </Typography>
            <Typography variant="h2" className="uppercase tracking-tighter text-white leading-none">
              {reward.label}
            </Typography>
            <Typography variant="paragraphS" color="muted" className="leading-snug line-clamp-2 md:line-clamp-3">
              {reward.description || "The ultimate treasure of the Akha Wisdom Path — claim it when the journey is complete."}
            </Typography>

            {/* STATE — unlocked / progressing / locked */}
            <div className="[margin-top:var(--space-fluid-2xs)]">
              {isUnlocked ? (
                <div className="inline-flex items-center gap-2 [padding-inline:var(--space-fluid-s)] py-2 rounded-full bg-action/15 border border-action/40">
                  <Icon name="emoji_events" size="sm" color="action" />
                  <Typography variant="microLabel" color="action" className="font-black uppercase tracking-[0.15em]">
                    Trophy unlocked
                  </Typography>
                </div>
              ) : isNextToUnlock ? (
                <div className="flex flex-col [gap:var(--space-fluid-2xs)]">
                  <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden border border-white/5">
                    <div
                      className="h-full bg-gradient-to-r from-quiz-s to-quiz-p transition-all duration-1000 ease-out"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                  <Typography variant="numericRegular" className="text-quiz-text font-black text-sm">
                    {currentScore} <span className="opacity-40 font-medium mx-1">/</span> {reward.required_points}
                    <span className="text-[10px] opacity-60 uppercase ml-1.5">XP</span>
                  </Typography>
                </div>
              ) : (
                <div className="inline-flex items-center gap-2 [padding-inline:var(--space-fluid-s)] py-2 rounded-full bg-white/5 border border-white/10">
                  <Icon name="lock" size="sm" color="muted" />
                  <Typography variant="microLabel" color="muted" className="font-black uppercase tracking-[0.15em]">
                    Reach {reward.required_points} XP
                  </Typography>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div 
      className={cn("relative w-full aspect-[4/5] perspective-1000 cursor-pointer", className)}
      onMouseEnter={() => setIsFlipped(true)}
      onMouseLeave={() => setIsFlipped(false)}
      onClick={() => onClick?.(reward)}
    >
      <div className={cn(
        "relative w-full h-full transition-all duration-700 preserve-3d ease-cinematic cursor-pointer",
        isFlipped && "rotate-y-180"
      )}>
        
        {/* FRONT SIDE */}
        <div className={cn(
          "absolute inset-0 backface-hidden w-full h-full flex flex-col",
          "overflow-hidden rounded-[2.5rem] border-2 transition-all duration-700 ease-cinematic group",
          "bg-gray-950",
          isUnlocked ? "border-action shadow-action/20" : "border-white/10"
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
                      className="h-full bg-gradient-to-r from-quiz-s to-quiz-p transition-all duration-1000 ease-out"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                  <Typography variant="microLabel" className="text-quiz-text font-black animate-pulse uppercase tracking-[0.1em]">
                    Progressing
                  </Typography>
               </div>
            ) : (
               <div className="flex items-center gap-2 opacity-60">
                  <Icon name="visibility" size="xs" color="muted" />
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
          "overflow-hidden rounded-[2.5rem] border-2 transition-all duration-700",
          isUnlocked ? "border-action shadow-action/20" : "border-secondary/30",
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
