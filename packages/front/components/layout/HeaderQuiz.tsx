import React from 'react';
import { cn } from '../../lib/utils';
import { Typography, Icon } from '../ui';

interface HeaderQuizProps {
  title: string;
  currentLevel: number;
  totalLevels: number;
  score: number;
  maxScore: number;
}

const HeaderQuiz: React.FC<HeaderQuizProps> = ({ title, currentLevel, totalLevels, score, maxScore }) => {
  return (
    <div className={cn(
      // Layout Base
      "app-header-layout flex flex-col items-center text-center w-full justify-start",
      
      // 1. Spaziatura Verticale
      "pt-6 md:pt-12 lg:pt-16 pb-8", // Ridotto leggermente pt su mobile per guadagnare spazio
      
      // 2. 🟢 FIX: Padding Laterale (Allinea con il contenuto della pagina)
      "px-4 md:px-8 lg:px-12",
      
      // 3. Transizioni Colore
      "transition-all duration-700",

      // 4. Altezza Minima
      "min-h-[200px]"
    )}>
      
      {/* CONTAINER PRINCIPALE: Mineral Style 4.8 */}
      <div className="relative w-full rounded-[2.5rem] bg-white/5 backdrop-blur-3xl border border-white/10 p-6 lg:p-8 flex flex-col lg:flex-row items-center justify-between gap-8 shadow-2xl overflow-hidden group">
        
        {/* TITOLO DASHBOARD */}
        <div className="flex items-center gap-6 w-full lg:w-auto">
          <div className="relative">
            <div className="relative size-16 rounded-2xl bg-surface border border-white/10 flex items-center justify-center text-primary shadow-brand-glow group-hover:scale-105 transition-transform duration-500">
              <Icon name="temple_buddhist" size="xl" />
            </div>
          </div>

          <div className="space-y-1 text-left">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse shadow-[0_0_8px_var(--color-primary)]"></span>
              <p className="font-accent text-primary/80 text-[10px] font-black uppercase tracking-[0.3em]">Active Quiz</p>
            </div>
            
            <Typography variant="h2" className="text-3xl lg:text-5xl leading-none tracking-tighter italic text-title">
              {title}
            </Typography>
          </div>
        </div>

        {/* PROGRESSO A SEGMENTI */}
        <div className="flex-1 w-full lg:max-w-2xl flex flex-col justify-center px-4">
          <div className="flex justify-between w-full mb-3 px-1">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black text-primary uppercase tracking-[0.2em]">Level {currentLevel}</span>
              <div className="h-px w-8 bg-primary/30"></div>
            </div>
            <span className="text-[10px] font-black text-desc/40 uppercase tracking-[0.2em]">{totalLevels} Steps</span>
          </div>

          <div className="w-full">
            <div className="flex gap-2 h-2">
              {Array.from({ length: totalLevels }).map((_, i) => (
                <div
                  key={i}
                  className={cn(
                    "flex-1 rounded-full transition-all duration-1000",
                    i < currentLevel 
                      ? 'bg-primary shadow-brand-glow' 
                      : 'bg-white/5 border border-white/5'
                  )}
                />
              ))}
            </div>
          </div>
        </div>

        {/* SCORE BADGE */}
        <div className="flex items-center gap-5 w-full lg:w-auto bg-surface rounded-[2rem] p-3 pr-8 border border-white/10 shadow-xl">
          <div className="size-14 rounded-2xl bg-quiz text-black flex items-center justify-center shadow-lg shadow-quiz/20">
            <Icon name="emoji_events" size="xl" className="font-black" />
          </div>
          
          <div className="flex flex-col text-left">
            <span className="font-accent text-desc/50 text-[9px] font-black uppercase tracking-[0.3em] mb-1">Total Score</span>
            <div className="flex items-baseline gap-2">
              <Typography variant="h3" className="leading-none tracking-tighter text-title">
                {score.toLocaleString()}
              </Typography>
              <span className="font-accent text-[11px] font-black text-quiz">XP</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default HeaderQuiz;