import React from 'react';
import { cn } from '@thaiakha/shared/lib/utils';
import { Typography, Icon } from '../ui';
import { t } from '@thaiakha/shared/lib/ui-strings';

interface HeaderQuizProps {
  title: string;
  currentLevel: number;
  totalLevels: number;
  score: number;
  maxScore: number;
}

const HeaderQuiz: React.FC<HeaderQuizProps> = ({ title, currentLevel, totalLevels, score }) => {
  return (
    <div className={cn(
      "app-header-layout flex flex-col items-center text-center w-full justify-start",
      "[padding-top:var(--space-fluid-xl)] [padding-bottom:var(--space-fluid-m)]",
      "[padding-inline:var(--space-fluid-m)]",
      "transition-all duration-700"
    )}>

      {/* ── CONTAINER PRINCIPALE (Glass Style v4) ── */}
      <div className={cn(
        "relative w-full overflow-hidden group shadow-2xl",
        "rounded-[3rem] bg-white/5 dark:bg-black/20 backdrop-blur-3xl border border-white/10",
        "[padding:var(--space-fluid-m)]",
        "flex flex-wrap lg:flex-nowrap items-center justify-between gap-y-6 lg:gap-y-0 lg:[gap:var(--space-fluid-m)]"
      )}>

        {/* ── 1) AVATAR (Top Left su Mobile, Sinistra su Desktop) ── */}
        <div className="shrink-0 flex items-center justify-center order-1 lg:order-1">
          <div className="relative size-22 rounded-[1.4rem] bg-surface flex items-center justify-center text-primary overflow-hidden border border-white/10">
            <img
              src="/avatarCherry/600-Avatar-Quiz.webp"
              alt="Cherry Quiz Avatar"
              className="size-full object-cover"
            />
          </div>
        </div>

        {/* ── 2) SCORE BADGE (Top Right su Mobile, Destra su Desktop) ── */}
        <div className="flex items-center justify-end shrink-0 order-2 lg:order-4">
          <div className="flex items-center gap-4 bg-black/40 px-6 h-22 rounded-[1.4rem] border border-white/10 group-hover:bg-black/60 transition-colors duration-500">
            <div className="flex flex-col items-end">
              <Typography variant="microLabel" color="muted" className="uppercase font-black tracking-[0.2em] mb-1">
                Wisdom
              </Typography>
              <div className="flex items-center gap-2">
                <Typography variant="numericStat" className="[font-size:2rem] leading-none text-quiz drop-shadow-lg">
                  {score}
                </Typography>
                <Typography variant="microLabel" color="muted" className="font-bold self-end mb-1">XP</Typography>
              </div>
            </div>
            <div className="size-12 rounded-full bg-quiz/10 flex items-center justify-center border border-quiz/20">
              <Icon name="stars" className="text-quiz" size="xl" />
            </div>
          </div>
        </div>

        {/* ── 3) TITOLO (Centrato Sotto Avatar/Score su Mobile) ── */}
        <div className="flex flex-col text-center lg:text-left w-full lg:w-auto items-center lg:items-start shrink-0 order-3 lg:order-2">
          <div className="flex items-center gap-2 [margin-bottom:var(--space-fluid-2xs)]">
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse shadow-[0_0_8px_var(--color-primary)]"></span>
            <Typography variant="microLabel" color="primary" className="uppercase font-black tracking-[0.3em]">
              {t.quiz.headerBadge || "Active Quiz"}
            </Typography>
          </div>

          <Typography
            variant="h2"
            color="title"
            className="leading-none tracking-tighter italic [font-size:var(--text-fluid-h2)]"
          >
            {title}
          </Typography>
        </div>

        {/* ── 4) PROGRESS BAR (Ultima in basso su Mobile) ── */}
        <div className="flex-1 w-full lg:max-w-xl flex flex-col justify-center [padding-inline:var(--space-fluid-s)] order-4 lg:order-3">
          <div className="flex justify-between w-full [margin-bottom:var(--space-fluid-2xs)] px-1">
            <div className="flex items-center gap-2">
              <Typography variant="microLabel" color="primary" className="font-black uppercase tracking-[0.2em]">
                Level {currentLevel}
              </Typography>
              <div className="h-px w-8 bg-primary/30"></div>
            </div>
            <Typography variant="microLabel" color="muted" className="font-black uppercase tracking-[0.2em]">
              {totalLevels} Steps
            </Typography>
          </div>

          <div className="w-full">
            <div className="flex gap-2 h-2">
              {Array.from({ length: totalLevels }).map((_, i) => (
                <div
                  key={i}
                  className={cn(
                    "h-full flex-1 rounded-full transition-all duration-500",
                    i < currentLevel
                      ? "bg-primary shadow-[0_0_10px_var(--color-primary)]"
                      : i === currentLevel
                        ? "bg-primary/30 animate-pulse"
                        : "bg-surface-elevated/50 border border-white/5"
                  )}
                />
              ))}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
export default HeaderQuiz;