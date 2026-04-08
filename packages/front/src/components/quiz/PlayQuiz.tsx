import React from 'react';
import { QuizLevel, QuizModule } from '@thaiakha/shared';
import { cn } from '@thaiakha/shared/lib/utils';
import { Icon, Typography } from '../ui';
import { t } from '@thaiakha/shared/lib/ui-strings';

interface PlayQuizProps {
  level: QuizLevel;
  module: QuizModule;
  currentQuestionIndex: number;
  totalQuestions: number;
  score: number;
  onAnswer: (option: string) => void;
  onBack: () => void;
  onGetHint: (questionText: string) => void;
  selectedOption: string | null;
  showFeedback: boolean;
}

const PlayQuiz: React.FC<PlayQuizProps> = ({ 
  level, 
  module, 
  currentQuestionIndex, 
  totalQuestions, 
  score, 
  onAnswer, 
  onBack, 
  onGetHint, 
  selectedOption, 
  showFeedback 
}) => {

  const currentQuestion = module.questions[currentQuestionIndex];
  const progress = Math.round((currentQuestionIndex / totalQuestions) * 100);
  const canAffordHint = score >= 50;

  // Temi visivi per le opzioni (A, B, C)
  const optionThemes = [
    { bg: 'from-btn-s/10', text: 'text-btn-s', icon: 'water_drop', badge: 'A' },
    { bg: 'from-primary/10', text: 'text-primary', icon: 'agriculture', badge: 'B' },
    { bg: 'from-action/10', text: 'text-action', icon: 'celebration', badge: 'C' }
  ];

  return (
    <div className="flex-grow w-full min-h-full relative animate-in fade-in duration-700">
      {/* ── ATMOSPHERIC BACKGROUND (PhotoModal style) ── */}
      <div className="fixed inset-0 z-[-1] overflow-hidden pointer-events-none bg-black">
        {module.image_url && (
          <img
            src={module.image_url}
            alt="Module background"
            className="w-full h-full object-cover opacity-80 mix-blend-multiply"
          />
        )}
      </div>

      {/* ── CONTENT CONTAINER ── */}
      <div className={cn(
        "relative z-10 w-full max-w-[72rem] mx-auto h-full md:h-auto flex flex-col justify-center animate-in fade-in zoom-in-95 duration-500",
        "[padding:var(--space-fluid-m)] [padding-top:var(--space-fluid-xs)]"
      )}>
      
      {/* ── CARD VETROSMORPHICA ── */}
      <div className={cn(
        "bg-surface-elevated/80 backdrop-blur-3xl border border-white/10 rounded-[3rem] w-full flex flex-col items-center shadow-2xl relative overflow-hidden",
        "[padding:var(--space-fluid-xl)] [padding-top:var(--space-fluid-m)]"
      )}>
        
        {/* Glow Ambientale */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent blur-[2px]" />

        {/* ── HEADER ── */}
        <header className="w-full flex flex-col md:flex-row justify-between items-start md:items-center [gap:var(--space-fluid-m)] [margin-bottom:var(--space-fluid-m)] border-b border-white/5 [padding-bottom:var(--space-fluid-m)]">
          
          {/* Navigazione & Level Info */}
          <div className="flex flex-col items-start [gap:var(--space-fluid-2xs)]">
            <button 
              onClick={onBack} 
              className="flex items-center gap-2 text-muted hover:text-color-inverse transition-colors group"
            >
              <Icon name="arrow_back" size="sm" className="group-hover:-translate-x-1 transition-transform" />
              <Typography variant="microLabel" className="font-black uppercase tracking-widest">{t.quiz.abort}</Typography>
            </button>
            
            <div className="flex items-center gap-3">
              <Typography variant="h3" color="title" className="uppercase italic font-black tracking-tighter leading-none">
                {level.title}
              </Typography>
              <div className="px-2 py-0.5 rounded-md bg-white/5 border border-white/10">
                <Typography variant="microLabel" color="muted" className="font-black font-numeric">LVL {level.id}</Typography>
              </div>
            </div>
          </div>

          {/* Stats Bar */}
          <div className="flex items-center [gap:var(--space-fluid-m)] w-full md:w-auto bg-black/30 [padding:var(--space-fluid-s)] rounded-2xl border border-white/5">
            <div className="flex-1 md:w-40 space-y-1.5">
              <div className="flex justify-between">
                <Typography variant="microLabel" color="muted" className="uppercase font-black tracking-widest">{t.quiz.statsProgress}</Typography>
                <Typography variant="numericRegular" color="primary" className="font-black">{progress}%</Typography>
              </div>
              <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                <div className="h-full bg-primary shadow-brand-glow/40 transition-all duration-700" style={{ width: `${progress}%` }} />
              </div>
            </div>

            <div className="flex items-center gap-3 [padding-left:var(--space-fluid-s)] border-l border-white/10">
              <Icon name="stars" className="text-quiz" size="md" />
              <Typography variant="numericStat" color="title" className="leading-none">{score}</Typography>
            </div>
          </div>
        </header>

        {/* ── DOMANDA ── */}
        <div key={currentQuestionIndex} className="w-full flex flex-col items-center text-center animate-in fade-in slide-in-from-right-4 duration-300">
          
          <div className="[margin-bottom:var(--space-fluid-s)] inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20">
            <Icon name="psychology" size="xs" className="text-primary" />
            <Typography variant="microLabel" color="primary" className="font-black uppercase tracking-[0.2em]">
              {t.quiz.questionOf({ current: currentQuestionIndex + 1, total: totalQuestions })}
            </Typography>
          </div>

          <Typography 
            variant="h2" 
            color="title"
            className="font-black leading-tight max-w-4xl drop-shadow-xl [font-size:var(--text-fluid-h2)]"
          >
            {currentQuestion.text}
          </Typography>

          {/* ── OPZIONI DI RISPOSTA ── */}
          <div className="flex flex-col [gap:var(--space-fluid-xs)] w-full max-w-2xl mx-auto [margin-top:var(--space-fluid-m)]">
            {currentQuestion.options.map((opt, i) => {
              const theme = optionThemes[i % 3];
              const isCorrect = opt === currentQuestion.correctAnswer;
              const isSelected = opt === selectedOption;
              
              let stateClass = "border-white/10 hover:border-white/30 hover:bg-white/5";

              if (showFeedback) {
                if (isSelected) {
                  stateClass = isCorrect 
                    ? "border-sys-success/50 bg-sys-success/10 shadow-[0_0_30px_-10px_var(--sys-success-ch)]" 
                    : "border-sys-error/50 bg-sys-error/10 shadow-[0_0_30px_-10px_var(--sys-error-ch)]";
                } else if (isCorrect) {
                  stateClass = "border-sys-success/30 bg-sys-success/5 opacity-60";
                } else {
                  stateClass = "opacity-20 border-transparent pointer-events-none";
                }
              }

              return (
                <button
                  key={i}
                  disabled={showFeedback}
                  onClick={() => onAnswer(opt)}
                  className={cn(
                    "relative flex items-center [gap:var(--space-fluid-s)] [padding:var(--space-fluid-s)] rounded-[2rem] border transition-all duration-300 group overflow-hidden",
                    stateClass,
                    !showFeedback && "hover:scale-[1.02] active:scale-[0.98]"
                  )}
                >
                  <div className={cn("absolute inset-0 bg-gradient-to-r to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500", theme.bg)} />

                  <div className="size-10 rounded-xl border border-white/10 flex items-center justify-center shrink-0 bg-black/20 z-10">
                    <Typography variant="microLabel" className="font-mono font-bold text-muted group-hover:text-color-inverse">{theme.badge}</Typography>
                  </div>

                  <Typography 
                    variant="h4" 
                    color="title" 
                    className="flex-grow z-10 leading-snug group-hover:translate-x-1 transition-transform"
                  >
                    {opt}
                  </Typography>

                  <div className={cn("opacity-0 transition-all duration-300 flex-shrink-0 scale-50 z-10", showFeedback && (isSelected || isCorrect) && "opacity-100 scale-100")}>
                     {showFeedback && (isCorrect ? (
                       <Icon name="check_circle" className="text-sys-success" size="lg" />
                     ) : (isSelected ? (
                       <Icon name="cancel" className="text-sys-error" size="lg" />
                     ) : null))}
                  </div>
                </button>
              );
            })}
          </div>

        </div>

        {/* ── FOOTER ACTIONS ── */}
        <div className="flex justify-center items-center [gap:var(--space-fluid-m)] w-full mt-auto border-t border-white/5 [padding-top:var(--space-fluid-m)]">
          
          <button 
            onClick={() => canAffordHint && onGetHint(currentQuestion.text)}
            disabled={!canAffordHint || showFeedback}
            className={cn(
              "flex items-center [gap:var(--space-fluid-xs)] [padding-inline:var(--space-fluid-m)] [padding-block:var(--space-fluid-s)] rounded-full transition-all border",
              canAffordHint && !showFeedback 
                ? "bg-action/10 border-action/20 text-action hover:bg-action hover:text-black hover:shadow-action-glow" 
                : "bg-white/5 border-transparent text-muted cursor-not-allowed"
            )}
          >
            <Icon name="lightbulb" size="sm" />
            <Typography variant="badge" className="font-black uppercase tracking-[0.2em]">{t.quiz.requestHint}</Typography>
          </button>

          <div className="h-8 w-px bg-white/10" />

          <button className="flex items-center gap-2 text-muted hover:text-color-inverse transition-colors">
            <Icon name="flag" size="sm" />
            <Typography variant="badge" className="font-black uppercase tracking-widest">{t.quiz.report}</Typography>
          </button>

        </div>

      </div>
      </div>
    </div>
  );
};

export default PlayQuiz;