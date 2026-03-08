import React from 'react';
import { QuizLevel, QuizModule } from '../../types/index'; // ✅ Importa i nuovi tipi centralizzati
import { cn } from '../../lib/utils';
import { Icon } from '../ui';

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
    { bg: 'from-blue-500/10', text: 'text-blue-300', icon: 'water_drop', badge: 'A' },
    { bg: 'from-primary/10', text: 'text-primary', icon: 'agriculture', badge: 'B' },
    { bg: 'from-pink-500/10', text: 'text-pink-300', icon: 'celebration', badge: 'C' }
  ];

  return (
    <div className="relative z-10 w-full max-w-[72rem] px-4 py-6 md:px-6 md:py-8 h-full md:h-auto flex flex-col justify-center mb-5 animate-in fade-in zoom-in-95 duration-500">
      
      {/* CARD VETROSMORPHICA */}
      <div className="bg-[#0a0a0a]/80 backdrop-blur-3xl border border-white/10 rounded-[3rem] p-6 md:p-10 w-full flex flex-col items-center shadow-2xl relative overflow-hidden">
        
        {/* Glow Ambientale */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-1 bg-gradient-to-r from-transparent via-primary/50 to-transparent blur-sm" />

        {/* HEADER */}
        <header className="w-full flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8 border-b border-white/5 pb-6">
          
          {/* Navigazione */}
          <div>
            <button 
              onClick={onBack} 
              className="flex items-center gap-2 text-white/40 hover:text-white transition-colors group mb-1"
            >
              <Icon name="arrow_back" size="sm" className="group-hover:-translate-x-1 transition-transform" />
              <span className="font-black text-[10px] uppercase tracking-widest">Abort Mission</span>
            </button>
            
            <div className="flex items-baseline gap-3">
              <h2 className="text-2xl md:text-3xl font-black text-white uppercase italic tracking-tighter">
                {level.title}
              </h2>
              <span className="px-2 py-0.5 rounded-md bg-white/10 text-white/60 text-[10px] font-black uppercase tracking-widest border border-white/5">
                LVL {level.id}
              </span>
            </div>
          </div>

          {/* Stats Bar */}
          <div className="flex items-center gap-6 w-full md:w-auto bg-black/20 p-3 rounded-2xl border border-white/5">
            
            {/* Progress */}
            <div className="flex-1 md:w-32 space-y-1">
              <div className="flex justify-between text-[9px] font-black uppercase tracking-widest text-white/30">
                <span>Progress</span>
                <span>{progress}%</span>
              </div>
              <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                <div className="h-full bg-primary transition-all duration-500" style={{ width: `${progress}%` }} />
              </div>
            </div>

            {/* Score */}
            <div className="flex items-center gap-2 px-3 border-l border-white/10 pl-4">
              <Icon name="stars" className="text-yellow-400" />
              <span className="font-black text-xl text-white">{score}</span>
            </div>

          </div>
        </header>

        {/* DOMANDA */}
        <div key={currentQuestionIndex} className="w-full flex flex-col items-center text-center mb-10 animate-in fade-in slide-in-from-right-4 duration-300">
          
          <div className="mb-4 inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary">
            <Icon name="quiz" size="xs" />
            <span className="text-[10px] font-black uppercase tracking-[0.2em]">Question {currentQuestionIndex + 1} / {totalQuestions}</span>
          </div>

          <h3 className="text-2xl md:text-4xl font-display font-black text-white leading-tight max-w-4xl drop-shadow-xl">
            {currentQuestion.text}
          </h3>

          {/* OPZIONI DI RISPOSTA */}
          <div className="flex flex-col gap-4 w-full max-w-2xl mx-auto mt-12">
            {currentQuestion.options.map((opt, i) => {
              const theme = optionThemes[i % 3];
              const isCorrect = opt === currentQuestion.correctAnswer;
              const isSelected = opt === selectedOption;
              
              let stateClass = "border-white/10 hover:border-white/30 hover:bg-white/5";
              let iconClass = "bg-white/5 text-white/40";

              // Logica Feedback Visivo
              if (showFeedback) {
                if (isSelected) {
                  stateClass = isCorrect 
                    ? "border-green-500/50 bg-green-500/10 shadow-[0_0_30px_-10px_rgba(34,197,94,0.3)]" 
                    : "border-red-500/50 bg-red-500/10 shadow-[0_0_30px_-10px_rgba(239,68,68,0.3)]";
                } else if (isCorrect) {
                  stateClass = "border-green-500/30 bg-green-500/5 opacity-60";
                } else {
                  stateClass = "opacity-20 border-transparent";
                }
              }

              return (
                <button
                  key={i}
                  disabled={showFeedback}
                  onClick={() => onAnswer(opt)}
                  className={cn(
                    "relative flex items-center gap-5 p-5 rounded-[1.5rem] border-2 text-left transition-all duration-300 group overflow-hidden",
                    stateClass,
                    !showFeedback && "hover:scale-[1.02] active:scale-[0.98]"
                  )}
                >
                  {/* Gradiente Sfondo Hover */}
                  <div className={cn("absolute inset-0 bg-gradient-to-r to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500", theme.bg)} />

                  {/* Badge Lettera (A, B, C) */}
                  <div className="size-10 rounded-xl border border-white/10 flex items-center justify-center shrink-0 bg-black/20 z-10 font-mono font-bold text-white/50 group-hover:text-white group-hover:border-white/30 transition-colors">
                    {theme.badge}
                  </div>

                  {/* Testo Risposta */}
                  <span className="text-lg font-bold text-white/90 group-hover:text-white transition-colors flex-grow z-10 leading-snug">
                    {opt}
                  </span>

                  {/* Icona Feedback (Appare solo dopo risposta) */}
                  <div className={cn("opacity-0 transition-opacity duration-300 flex-shrink-0", showFeedback && (isSelected || isCorrect) && "opacity-100")}>
                     {showFeedback && (isCorrect ? (
                       <Icon name="check_circle" className="text-green-400" size="lg" />
                     ) : (isSelected ? (
                       <Icon name="cancel" className="text-red-400" size="lg" />
                     ) : null))}
                  </div>

                </button>
              );
            })}
          </div>

        </div>

        {/* FOOTER ACTIONS */}
        <div className="flex justify-center items-center gap-6 w-full mt-auto border-t border-white/5 pt-8">
          
          <button 
            onClick={() => canAffordHint && onGetHint(currentQuestion.text)}
            disabled={!canAffordHint || showFeedback}
            className={cn(
              "flex items-center gap-3 px-6 py-3 rounded-full transition-all border",
              canAffordHint && !showFeedback 
                ? "bg-secondary/10 border-secondary/30 text-secondary hover:bg-secondary hover:text-black hover:shadow-[0_0_20px_rgba(204,255,51,0.4)]" 
                : "bg-white/5 border-transparent text-white/20 cursor-not-allowed"
            )}
          >
            <Icon name="lightbulb" size="sm" />
            <span className="font-black text-[10px] uppercase tracking-[0.2em]">Hint (-50 XP)</span>
          </button>

          <div className="h-8 w-px bg-white/10" />

          <button className="flex items-center gap-2 text-white/30 hover:text-white transition-colors text-[10px] font-black uppercase tracking-widest">
            <Icon name="flag" size="sm" /> Report
          </button>

        </div>

      </div>
    </div>
  );
};

export default PlayQuiz;