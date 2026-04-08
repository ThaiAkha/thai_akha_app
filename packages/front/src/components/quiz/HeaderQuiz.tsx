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
      "app-header-layout w-full",
      "[padding-top:var(--space-fluid-m)] [padding-bottom:var(--space-fluid-s)]",
      "[padding-inline:var(--space-fluid-m)]",
      "transition-all duration-700"
    )}>

      {/* ── Glass Container — single row ── */}
      <div className={cn(
        "relative w-full overflow-hidden shadow-theme-lg",
        "rounded-[2rem] bg-white/5 dark:bg-black/20 backdrop-blur-3xl border border-white/10",
        "[padding-inline:var(--space-fluid-m)] [padding-block:var(--space-fluid-s)]",
        "flex flex-nowrap items-center [gap:var(--space-fluid-s)]"
      )}>

        {/* 1 — Avatar */}
        <div className="shrink-0">
          <div className="size-12 rounded-xl overflow-hidden border border-white/10 bg-surface">
            <img
              src="/avatarCherry/600-Avatar-Quiz.webp"
              alt="Cherry Quiz Avatar"
              className="size-full object-cover"
            />
          </div>
        </div>

        {/* 2 — Title + badge (hidden su mobile xs, visibile da sm) */}
        <div className="hidden sm:flex flex-col shrink-0 [gap:var(--space-fluid-3xs)]">
          <div className="flex items-center gap-1.5">
            <span className="size-1.5 rounded-full bg-primary animate-pulse shadow-[0_0_6px_var(--color-primary)]" />
            <Typography variant="microLabel" color="primary" className="uppercase font-black tracking-[0.25em]">
              {t.quiz.headerBadge || 'Active Quiz'}
            </Typography>
          </div>
          <Typography variant="h5" color="title" className="leading-none tracking-tight italic">
            {title}
          </Typography>
        </div>

        {/* 2 mobile — solo badge */}
        <div className="flex sm:hidden shrink-0 items-center gap-1.5">
          <span className="size-1.5 rounded-full bg-primary animate-pulse shadow-[0_0_6px_var(--color-primary)]" />
          <Typography variant="microLabel" color="primary" className="uppercase font-black tracking-[0.25em]">
            {t.quiz.headerBadge || 'Quiz'}
          </Typography>
        </div>

        {/* 3 — Progress bar (flex-1) */}
        <div className="flex-1 flex flex-col justify-center [gap:var(--space-fluid-3xs)] min-w-0">
          <div className="flex justify-between px-0.5">
            <Typography variant="microLabel" color="primary" className="font-black uppercase tracking-[0.15em]">
              Lv. {currentLevel}
            </Typography>
            <Typography variant="microLabel" color="muted" className="uppercase tracking-[0.15em]">
              {totalLevels} Steps
            </Typography>
          </div>
          <div className="flex [gap:var(--space-fluid-3xs)] h-1.5">
            {Array.from({ length: totalLevels }).map((_, i) => (
              <div
                key={i}
                className={cn(
                  "h-full flex-1 rounded-full transition-all duration-500",
                  i < currentLevel
                    ? "bg-primary shadow-[0_0_8px_var(--color-primary)]"
                    : i === currentLevel
                      ? "bg-primary/30 animate-pulse"
                      : "bg-white/10 border border-white/5"
                )}
              />
            ))}
          </div>
        </div>

        {/* 4 — Score badge */}
        <div className="shrink-0 flex items-center [gap:var(--space-fluid-2xs)] bg-black/30 rounded-xl border border-white/10 [padding-inline:var(--space-fluid-s)] [padding-block:var(--space-fluid-2xs)]">
          <Icon name="stars" className="text-quiz-p-400" size="sm" />
          <div className="flex items-baseline gap-1">
            <Typography variant="numericStat" className="leading-none text-quiz drop-shadow-lg">
              {score}
            </Typography>
            <Typography variant="microLabel" color="muted" className="font-bold">XP</Typography>
          </div>
        </div>

      </div>
    </div>
  );
};

export default HeaderQuiz;
