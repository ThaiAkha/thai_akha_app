import React from 'react';
import { QuizLevel, QuizModule } from '@thaiakha/shared';
import ButtonQuiz from './ButtonQuiz';
import { Typography } from '../ui';
import { cn } from '@thaiakha/shared/lib/utils';
import { t } from '@thaiakha/shared/lib/ui-strings';

// ── Configurazione Bottoni ──────────────────────────────────────────────────

const BTN_NEXT = { label: t.quiz.nextModule, icon: 'arrow_forward', variant: 'primary' as const };
const BTN_RETRY = { label: t.quiz.retry, icon: 'replay', variant: 'secondary' as const };
const BTN_HOME = { label: t.quiz.backToMenu, icon: 'Grid', variant: 'ghost' as const };

interface ResultQuizProps {
  level: QuizLevel;
  module: QuizModule;
  correctAnswers: number;
  totalQuestions: number;
  xpEarned: number;
  onNext: () => void;
  onPlayAgain: () => void;
  onReturn: () => void;
}

const ResultQuiz: React.FC<ResultQuizProps> = ({ 
  correctAnswers, 
  totalQuestions, 
  xpEarned, 
  onNext, 
  onPlayAgain, 
  onReturn 
}) => {
  const percentage = Math.round((correctAnswers / totalQuestions) * 100);
  const isPass = percentage >= 60;
  const strokeDashArray = `${percentage}, 100`;

  return (
    <div className="fixed inset-0 z-[1] flex items-center justify-center [padding:var(--space-fluid-m)] animate-in fade-in duration-500 overflow-y-auto">
      <div className="fixed inset-0 bg-black/90 backdrop-blur-3xl"></div>

      {/* div, non <main>: il landmark main è di PageLayout (#main-content) */}
      <div className="relative z-10 w-full max-w-3xl animate-in zoom-in-95 duration-700 my-auto">
        <div className={cn(
          "bg-surface border border-white/10 rounded-[3rem] flex flex-col items-center text-center shadow-2xl relative overflow-hidden",
          "[padding:var(--space-fluid-xl)]"
        )}>
          
          {/* Sfondo Glow */}
          <div className={cn(
            "absolute top-0 left-0 right-0 h-48 bg-gradient-to-b to-transparent pointer-events-none opacity-40 shrink-0",
            isPass ? 'from-sys-success/30' : 'from-sys-error/30'
          )} />

          {/* Titolo Missione */}
          <Typography 
            variant="display2" 
            className="uppercase italic font-black [margin-bottom:var(--space-fluid-m)] tracking-tighter relative z-10"
            color="title"
          >
            {isPass ? t.quiz.missionComplete : t.quiz.missionFailed}
          </Typography>

          {/* Circle Progress */}
          <div className="relative size-48 md:size-56 [margin-bottom:var(--space-fluid-m)]">
            <svg className="size-full rotate-[-90deg]" viewBox="0 0 36 36">
              <path className="fill-none stroke-white/10 stroke-[2.5]" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
              <path 
                className={cn(
                  "fill-none stroke-[2.5] stroke-linecap-round transition-all duration-[1.5s] ease-out",
                  isPass ? 'stroke-action' : 'stroke-sys-error'
                )}
                strokeDasharray={strokeDashArray} 
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" 
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <Typography variant="numericPrice" color="title" className="leading-none">
                {correctAnswers}/{totalQuestions}
              </Typography>
              <Typography variant="microLabel" color="muted" className="uppercase font-black tracking-widest mt-1">
                {t.quiz.correctLabel}
              </Typography>
            </div>
          </div>

          {/* Stats Box */}
          <div className="flex [gap:var(--space-fluid-s)] [margin-bottom:var(--space-fluid-m)] w-full max-w-md">
            <div className="flex-1 bg-white/5 [padding:var(--space-fluid-s)] rounded-2xl border border-white/5 backdrop-blur-sm">
              <Typography 
                variant="numericStat" 
                className={cn("font-black", isPass ? 'text-quiz' : 'text-muted')}
              >
                +{isPass ? xpEarned : 0}
              </Typography>
              <Typography variant="microLabel" color="muted" className="uppercase tracking-widest mt-1">
                {t.quiz.xpEarned}
              </Typography>
            </div>
            
            <div className="flex-1 bg-white/5 [padding:var(--space-fluid-s)] rounded-2xl border border-white/5 backdrop-blur-sm">
              <Typography variant="numericStat" color="title">
                {percentage}%
              </Typography>
              <Typography variant="microLabel" color="muted" className="uppercase tracking-widest mt-1">
                {t.quiz.accuracy}
              </Typography>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col [gap:var(--space-fluid-xs)] w-full max-w-xs relative z-10">
            {isPass ? (
              <ButtonQuiz fullWidth config={BTN_NEXT} onClick={onNext} className="[padding-block:var(--space-fluid-s)]" />
            ) : (
              <ButtonQuiz fullWidth config={BTN_RETRY} onClick={onPlayAgain} className="[padding-block:var(--space-fluid-s)]" />
            )}
            <ButtonQuiz fullWidth config={BTN_HOME} onClick={onReturn} />
          </div>

        </div>
      </div>
    </div>
  );
};

export default ResultQuiz;