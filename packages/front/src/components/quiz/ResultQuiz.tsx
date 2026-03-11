import React from 'react';
import { QuizLevel, QuizModule } from '../../types/index'; // ✅ Tipi Nuovi
import ButtonQuiz from './ButtonQuiz';
import { Icon } from '../ui';

// Configurazione Locale Bottoni (Senza dipendenze esterne)
const BTN_NEXT = { label: 'Next Module', icon: 'arrow_forward', variant: 'primary' as const };
const BTN_RETRY = { label: 'Try Again', icon: 'replay', variant: 'secondary' as const };
const BTN_HOME = { label: 'Back to Menu', icon: 'grid_view', variant: 'ghost' as const };

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
  level, 
  module, 
  correctAnswers, 
  totalQuestions, 
  xpEarned, 
  onNext, 
  onPlayAgain, 
  onReturn 
}) => {
  const percentage = Math.round((correctAnswers / totalQuestions) * 100);
  const isPass = percentage >= 60; // 60% per passare
  const strokeDashArray = `${percentage}, 100`;

  return (
    <div className="fixed inset-0 z-[1] flex items-center justify-center p-4 md:p-8 animate-in fade-in duration-500">
      <div className="absolute inset-0 bg-black/90 backdrop-blur-3xl"></div>

      <main className="relative z-10 w-full max-w-[48rem] animate-in zoom-in-95 duration-700">
        <div className="bg-[#121212] border border-white/10 rounded-[3rem] p-8 md:p-12 flex flex-col items-center text-center shadow-2xl relative overflow-hidden">
          
          {/* Sfondo Glow */}
          <div className={`absolute top-0 left-0 right-0 h-32 bg-gradient-to-b ${isPass ? 'from-green-500/20' : 'from-red-500/20'} to-transparent pointer-events-none`} />

          <h1 className="text-4xl md:text-5xl font-black text-white uppercase mb-8 tracking-tighter relative z-10">
            {isPass ? 'Mission Complete!' : 'Mission Failed'}
          </h1>

          {/* Circle Chart */}
          <div className="relative size-48 mb-10">
            <svg className="size-full rotate-[-90deg]" viewBox="0 0 36 36">
              <path className="fill-none stroke-white/10 stroke-[2.5]" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
              <path 
                className={`fill-none stroke-[2.5] stroke-linecap-round transition-all duration-[1.5s] ease-out ${isPass ? 'stroke-action' : 'stroke-red-500'}`}
                strokeDasharray={strokeDashArray} 
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" 
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-4xl font-black text-white">{correctAnswers}/{totalQuestions}</span>
              <span className="text-[10px] uppercase font-bold text-white/40 tracking-widest">Correct</span>
            </div>
          </div>

          {/* Stats Box */}
          <div className="flex gap-4 mb-10">
            <div className="bg-white/5 px-6 py-4 rounded-2xl border border-white/5">
              <div className={`text-2xl font-black ${isPass ? 'text-quiz' : 'text-white/40'}`}>+{isPass ? xpEarned : 0}</div>
              <div className="text-[9px] uppercase tracking-widest text-white/30">XP Earned</div>
            </div>
            <div className="bg-white/5 px-6 py-4 rounded-2xl border border-white/5">
              <div className="text-2xl font-black text-white">{percentage}%</div>
              <div className="text-[9px] uppercase tracking-widest text-white/30">Accuracy</div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col gap-3 w-full max-w-xs">
            {isPass ? (
              <ButtonQuiz fullWidth config={BTN_NEXT} onClick={onNext} className="py-4" />
            ) : (
              <ButtonQuiz fullWidth config={BTN_RETRY} onClick={onPlayAgain} className="py-4" />
            )}
            <ButtonQuiz fullWidth config={BTN_HOME} onClick={onReturn} />
          </div>

        </div>
      </main>
    </div>
  );
};

export default ResultQuiz;