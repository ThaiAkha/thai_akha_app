import React from 'react';
import { cn } from '@thaiakha/shared/lib/utils';
import { Typography, Icon } from '../ui';
import { t } from '@thaiakha/shared/lib/ui-strings';

interface HeaderQuizProps {
  title: string;
  currentLevel?: number;
  totalLevels?: number;
  score: number;
  maxScore?: number;
  view?: 'HOME' | 'LEVEL_SELECT' | 'PLAYING' | 'RESULT';
  questionResults?: ('correct' | 'wrong')[];
  totalQuestions?: number;
  progressTextLeft?: string;
  progressTextRight?: string;
  progressPercentage?: number;
  onBackClick?: () => void;
}

const HeaderQuiz: React.FC<HeaderQuizProps> = ({
  title,
  currentLevel = 0,
  totalLevels = 1,
  score,
  view = 'HOME',
  questionResults,
  totalQuestions = 1,
  progressTextLeft,
  progressTextRight,
  progressPercentage = 0,
  onBackClick
}) => {
  return (
    <div className={cn(
      "app-header-layout w-full",
      "[padding-top:var(--space-fluid-xs)] [padding-bottom:var(--space-fluid-xs)]",
      "transition-all duration-700"
    )}>

      {/* ── Glass Container — single row ── */}
      <div className={cn(
        "relative w-full overflow-hidden shadow-theme-lg",
        "rounded-[2rem] bg-white/5 dark:bg-black/20 backdrop-blur-3xl border border-white/10",
        "[padding-inline:var(--space-fluid-m)] [padding-block:var(--space-fluid-s)]",
        "flex flex-nowrap items-center [gap:var(--space-fluid-s)]"
      )}>

        {/* 1 — Back + Avatar */}
        <div className="shrink-0 flex items-center [gap:var(--space-fluid-xs)]">
          {onBackClick && (
            <button
              type="button"
              onClick={onBackClick}
              className="size-10 rounded-xl bg-white/10 hover:bg-white/20 border border-white/10 flex items-center justify-center text-white transition-all group"
            >
              <Icon name="arrow_back" size="sm" className="group-hover:-translate-x-1 transition-transform" />
            </button>
          )}
          <div className="size-12 rounded-xl overflow-hidden border border-white/10 bg-surface">
            <img
              src="/avatarCherry/600-Avatar-Quiz.webp"
              alt="Cherry Quiz Avatar"
              className="size-full object-cover"
              fetchPriority="high"
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
          {/* as="p": UI app-bar label — semantic H1 lives in QuizPage sr-only (fixes D04 H5-before-H1). */}
          <Typography variant="h5" as="p" color="title" className="leading-none tracking-tight italic">
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
            <Typography variant="microLabel" color="primary" className="font-black uppercase tracking-[0.15em] truncate">
              {view === 'PLAYING'
                ? `Q. ${Math.min((questionResults?.length || 0) + 1, (totalQuestions || 0))}`
                : (progressTextLeft || t.quiz.progress)}
            </Typography>
            <Typography variant="microLabel" color="muted" className="uppercase tracking-[0.15em] font-bold shrink-0">
              {view === 'PLAYING'
                ? `${totalQuestions || 0} Questions`
                : (progressTextRight || `${progressPercentage || 0}%`)}
            </Typography>
          </div>

          <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden border border-white/5">
            {view === 'PLAYING' ? (
              <div className="flex [gap:var(--space-fluid-3xs)] h-full">
                {Array.from({ length: totalQuestions || 1 }).map((_, i) => {
                  const status = questionResults?.[i];
                  return (
                    <div
                      key={i}
                      className={cn(
                        "h-full flex-1 rounded-full transition-all duration-500",
                        status === 'correct' ? "bg-action shadow-[0_0_12px_var(--color-action)]" :
                          status === 'wrong' ? "bg-quiz-p shadow-[0_0_12px_var(--color-quiz-p)]" :
                            i === (questionResults?.length || 0) ? "bg-white/30 animate-pulse" :
                              "bg-white/10"
                      )}
                    />
                  );
                })}
              </div>
            ) : (
              <div
                className="h-full rounded-full transition-all duration-1000 bg-quiz-p shadow-[0_0_15px_var(--color-quiz-p)]"
                style={{
                  width: `${Math.min(100, Math.max(0, progressPercentage || 0))}%`,
                }}
              />
            )}
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
