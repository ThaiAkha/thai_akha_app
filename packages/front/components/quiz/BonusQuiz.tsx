import React from 'react';
import { BONUS_CARDS } from '../../lib/bonusQuiz';
import ButtonQuiz from './ButtonQuiz';
import { QUIZ_BUTTONS } from '../../data/quizData';

interface BonusQuizProps {
  levelId: number;
  onClaim: () => void;
  onReturn: () => void;
}

const BonusQuiz: React.FC<BonusQuizProps> = ({ levelId, onClaim, onReturn }) => {
  const bonus = BONUS_CARDS.find(b => b.levelId === levelId) || BONUS_CARDS[0];

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 md:p-8 animate-in fade-in duration-700">
      <div className="absolute inset-0 bg-black/95 backdrop-blur-3xl"></div>
      <main className="relative z-10 w-full max-w-[72rem] animate-in zoom-in-95 slide-in-from-bottom-12 duration-1000">
        <div className="bg-white/5 border border-white/10 rounded-[3rem] p-12 flex flex-col md:flex-row gap-16">
          <div className="flex-1 text-center">
            <h1 className="text-5xl font-black text-white uppercase mb-4 tracking-tighter">Level Clear!</h1>
            <p className="text-primary font-black uppercase tracking-[0.2em] mb-10 text-xs">Achievement Unlocked kha!</p>
            <div className="relative w-72 h-72 mx-auto rounded-[2.5rem] overflow-hidden border border-white/20 shadow-2xl">
              <img src={bonus.image} alt={bonus.prizeTitle} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
              {bonus.reward_mp3 && (
                 <div className="absolute inset-0 flex items-center justify-center">
                    <div className="size-20 rounded-full bg-primary/20 backdrop-blur-md border border-white/20 flex items-center justify-center animate-pulse">
                        <span className="material-symbols-outlined text-white text-4xl">music_note</span>
                    </div>
                 </div>
              )}
            </div>
          </div>
          <div className="flex-1 flex flex-col justify-center space-y-10">
            <div className="bg-primary/10 border border-primary/30 p-10 rounded-[2.5rem] text-center shadow-inner relative overflow-hidden group">
              {bonus.reward_mp3 && (
                <div className="absolute -top-10 -right-10 size-40 bg-primary/10 rounded-full blur-[40px] animate-pulse"></div>
              )}
              <span className={`material-symbols-outlined text-primary text-6xl mb-4 ${bonus.reward_mp3 ? 'animate-bounce' : ''}`}>{bonus.icon}</span>
              <h2 className="text-3xl font-black text-white uppercase mb-2 tracking-tight">{bonus.prizeTitle}</h2>
              <h2 className="text-white/60 font-medium leading-relaxed mb-6">{bonus.prizeDescription}</h2>
              
              {bonus.reward_mp3 && (
                <a 
                    href={bonus.reward_mp3} 
                    download 
                    className="inline-flex items-center gap-3 px-8 py-4 rounded-2xl bg-primary text-white font-black uppercase tracking-widest text-sm shadow-xl shadow-primary/30 hover:scale-105 active:scale-95 transition-all mb-4"
                >
                    <span className="material-symbols-outlined">download</span>
                    Download Song kha!
                </a>
              )}
            </div>
            <div className="flex flex-col gap-4">
              <ButtonQuiz fullWidth config={QUIZ_BUTTONS.HOME} onClick={onClaim} className="py-5 text-sm" />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default BonusQuiz;