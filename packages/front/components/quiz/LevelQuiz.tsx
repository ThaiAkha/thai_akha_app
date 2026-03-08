import React from 'react';
import { QuizLevel } from '../../types/index'; // ✅ Importa i nuovi tipi
import ButtonQuiz from './ButtonQuiz';
import { cn } from '../../lib/utils';
import { Icon } from '../ui';

// --- CONFIGURAZIONE BOTTONI LOCALE (Decoupling) ---
const BUTTON_CONFIG = {
  START: { label: 'Start Quiz', icon: 'play_arrow', variant: 'primary' as const },
  RESUME: { label: 'Resume', icon: 'play_circle', variant: 'primary' as const },
  RETAKE: { label: 'Retake', icon: 'replay', variant: 'secondary' as const },
};

interface LevelQuizProps {
  level: QuizLevel;
  completedModules: string[];
  perfectModules: string[];
  bestScores: Record<string, number>;
  onStartModule: (moduleId: string) => void;
  onBack: () => void;
}

const LevelQuiz: React.FC<LevelQuizProps> = ({ 
  level, 
  completedModules, 
  perfectModules, 
  bestScores, 
  onStartModule, 
  onBack 
}) => {

  const getModuleTheme = (isPerfect: boolean, idx: number) => {
    const icons = ["potted_plant", "local_fire_department", "soup_kitchen"];
    const icon = level.modules[idx]?.icon || icons[idx % icons.length]; // Usa icona DB o fallback

    if (isPerfect) {
      return {
        bg: "bg-emerald-950/40",
        border: "border-emerald-500/40",
        blob: "bg-emerald-500",
        iconColor: "text-emerald-400",
        icon: icon,
        badge: "text-emerald-400"
      };
    } else {
      return {
        bg: "bg-[#1a1a1a]",
        border: "border-white/10",
        blob: "bg-primary",
        iconColor: "text-primary",
        icon: icon,
        badge: "text-primary"
      };
    }
  };

  return (
    <div className="flex-grow w-full max-w-[72rem] mx-auto p-6 lg:p-12 pt-2 mb-5 animate-in fade-in duration-700">
      
      {/* HEADER NAVIGAZIONE */}
      <div className="mb-10 text-center lg:text-left flex flex-col items-center lg:items-start gap-4">
        <button
          onClick={onBack}
          className="group relative flex items-center gap-2 px-6 py-2.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-white font-black text-[10px] uppercase tracking-[0.2em] transition-all duration-300"
        >
          <span className="material-symbols-outlined text-sm group-hover:-translate-x-1 transition-transform">arrow_back</span>
          Back to Levels
        </button>

        <div className="mt-2">
          <h2 className="text-4xl lg:text-5xl font-extrabold text-white mb-2 tracking-tight uppercase italic">
            {level.title}
          </h2>
          <p className="text-white/60 text-lg max-w-2xl font-light">
            {level.subtitle || "Master these modules to unlock the next stage."}
          </p>
        </div>
      </div>

      {/* GRID MODULI */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pb-20">
        {level.modules.map((mod, idx) => {
          const isPerfect = perfectModules.includes(mod.id);
          const isAttempted = completedModules.includes(mod.id);
          
          // Calcolo Score
          const bestCount = bestScores[mod.id] || 0;
          const totalQuestions = mod.questions?.length || 0;
          const percentage = totalQuestions > 0 ? Math.round((bestCount / totalQuestions) * 100) : 0;

          const theme = getModuleTheme(isPerfect, idx);
          
          // Selezione Configurazione Bottone
          const currentBtnConfig = isPerfect 
            ? BUTTON_CONFIG.RETAKE 
            : (isAttempted ? BUTTON_CONFIG.RESUME : BUTTON_CONFIG.START);

          return (
            <div
              key={mod.id}
              onClick={() => onStartModule(mod.id)}
              className={cn(
                "relative rounded-[3rem] p-8 lg:p-10 flex flex-col h-[420px] overflow-hidden border transition-all duration-500 backdrop-blur-xl group hover:scale-[1.02] shadow-2xl cursor-pointer",
                theme.bg,
                theme.border
              )}
            >
              {/* Sfondo Decorativo */}
              <div className={cn("absolute -top-20 -right-20 size-64 opacity-20 blur-[80px] transition-all duration-700 group-hover:opacity-30", theme.blob)}></div>
              
              <div className="relative z-10 flex flex-col h-full pointer-events-none">
                
                {/* ICON & BADGE */}
                <div className="flex justify-between items-start mb-8">
                  <div className={cn("size-20 rounded-[2rem] bg-white/5 flex items-center justify-center border border-white/10 shadow-inner", theme.iconColor)}>
                    <Icon name={mod.icon || theme.icon} size="2xl" />
                  </div>

                  {isPerfect ? (
                    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500/20 border border-emerald-500/30">
                      <Icon name="stars" size="xs" className="text-emerald-400" />
                      <span className="text-[9px] font-black text-emerald-400 uppercase tracking-widest">Mastered</span>
                    </div>
                  ) : isAttempted ? (
                    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-yellow-500/10 border border-yellow-500/20">
                      <Icon name="timelapse" size="xs" className="text-yellow-500" />
                      <span className="text-[9px] font-black text-yellow-500 uppercase tracking-widest">In Progress</span>
                    </div>
                  ) : null}
                </div>

                {/* TITOLO */}
                <h3 className="text-2xl font-black text-white mb-2 uppercase tracking-tight leading-tight min-h-[4rem]">
                  {mod.title}
                </h3>
                
                {/* THEME LABEL */}
                <p className="text-[10px] font-bold uppercase tracking-widest text-white/30 mb-auto">
                  {mod.theme || "Knowledge"}
                </p>

                {/* STATS BAR */}
                <div className="flex items-center justify-between px-5 py-4 bg-black/20 rounded-2xl mb-6 border border-white/5">
                  <span className="text-[10px] text-white/40 uppercase font-black tracking-widest">Score</span>
                  <span className={cn("text-xl font-black", isPerfect ? 'text-emerald-400' : 'text-white')}>
                    {percentage}%
                  </span>
                </div>

                {/* ACTION BUTTON */}
                <div>
                  <ButtonQuiz
                    fullWidth
                    config={currentBtnConfig}
                    className={cn(
                      "py-4",
                      isPerfect ? "bg-white/10 hover:bg-white/20 border-white/10" : "group-hover:brightness-110"
                    )}
                  />
                </div>

              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default LevelQuiz;