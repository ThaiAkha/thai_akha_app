import React, { useState, useEffect } from 'react';
import { Typography, Button, Icon, Badge, Card } from '../ui';
import { cn } from '../../lib/utils';
// Assicurati che l'import includa sia la costante che il TIPO
import { BONUS_CARDS, BonusCard } from '../../lib/bonusQuiz'; 
import { UserProfile } from '../../services/authService';

interface QuizWidgetProps {
  onNavigate: (page: string) => void;
  userProfile?: UserProfile | null;
}

// Mock Data per la Leaderboard
const LEADERBOARD = [
  { rank: 1, name: "HillWarrior", xp: 14200, avatar: "🔥" },
  { rank: 2, name: "BambooSpirit", xp: 13850, avatar: "🎋" },
  { rank: 3, name: "TeaLeaf_99", xp: 12400, avatar: "🍵" },
];

const QuizWidget: React.FC<QuizWidgetProps> = ({ onNavigate, userProfile }) => {
  const [xp, setXp] = useState(0);
  const [level, setLevel] = useState(1);
  
  // ✅ FIX CRITICO: Inizializza con  (il primo oggetto), non con l'intero array!
const [nextReward, setNextReward] = useState(BONUS_CARDS[0]);  
  const [completedCount, setCompletedCount] = useState(0);
  const [accuracy, setAccuracy] = useState(0);
  
  // ✅ FIX STATO: Manteniamo anche questo fix precedente
  const [awardedBonuses, setAwardedBonuses] = useState<number[]>([]);

  // --- SYNC DATI REALI ---
  useEffect(() => {
    const saved = localStorage.getItem('thai_akha_quiz_progress_v2');
    
    if (saved) {
      try {
        const data = JSON.parse(saved);
        const currentScore = data.score || 0;
        setXp(currentScore);
        setCompletedCount((data.completedModules || []).length);
        
        // Salviamo i bonus ottenuti
        const bonuses = data.awardedBonuses || [];
        setAwardedBonuses(bonuses);
        
        // Calcolo Livello (100 XP = 1 Livello)
        const currentLevel = Math.floor(currentScore / 100) + 1;
        setLevel(currentLevel);

        // Calcolo Prossimo Premio
        // Trova il primo premio NON ancora ottenuto
        const next = BONUS_CARDS.find(b => !bonuses.includes(b.levelId));
        
        // Se c'è un prossimo premio, usalo. Altrimenti usa l'ultimo (hai finito).
        setNextReward(next || BONUS_CARDS[BONUS_CARDS.length - 1]);

        setAccuracy(98); // Mock per ora

      } catch (e) { console.error("Quiz data parse error", e); }
    }
  }, []);

  // Calcolo Percentuale per il prossimo livello (visivo)
  const progressPercent = Math.min(100, (xp % 100)); 
  const rankTitle = level < 2 ? "Novice Visitor" : level < 4 ? "Village Explorer" : "Akha Guardian";
  
  // Parametri Cerchio SVG
  const radius = 18;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progressPercent / 100) * circumference;

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 pb-24 space-y-8">
      
      {/* 1. HERO DASHBOARD: PLAYER STATUS */}
      <div className="relative bg-[#121212] border border-white/10 rounded-[3rem] p-8 overflow-hidden shadow-2xl group">
        
        {/* Background Effects */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-quiz/10 rounded-full blur-[80px] group-hover:bg-quiz/20 transition-colors duration-1000" />
        
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-8">
            
            {/* LEFT: CIRCULAR LEVEL & INFO */}
            <div className="flex items-center gap-6 w-full md:w-auto">
                {/* Level Circle SVG */}
                <div className="relative size-24 shrink-0 flex items-center justify-center">
                    <svg className="size-full -rotate-90 transform" viewBox="0 0 40 40">
                        {/* Track */}
                        <circle className="text-white/10" stroke="currentColor" strokeWidth="3" fill="transparent" r={radius} cx="20" cy="20" />
                        {/* Progress */}
                        <circle 
                            className="text-quiz transition-all duration-1000 ease-out" 
                            stroke="currentColor" 
                            strokeWidth="3" 
                            strokeLinecap="round"
                            fill="transparent" 
                            r={radius} 
                            cx="20" 
                            cy="20"
                            style={{ strokeDasharray: circumference, strokeDashoffset }}
                        />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-2xl font-black text-white leading-none">{level}</span>
                        <span className="text-[7px] font-bold uppercase text-white/40 tracking-wider">Level</span>
                    </div>
                </div>

                <div>
                    <div className="flex items-center gap-3 mb-1">
                        <Badge variant="mineral" className="bg-quiz/20 text-quiz border-quiz/30 text-[10px] h-5 px-2">
                            {rankTitle}
                        </Badge>
                        <span className="text-[10px] font-mono text-white/40">ID: {userProfile?.id.slice(0,4).toUpperCase() || 'GUEST'}</span>
                    </div>
                    <Typography variant="h3" className="text-white italic uppercase tracking-tighter leading-none mb-1">
                        {userProfile?.full_name?.split(' ') || "Warrior"}
                    </Typography>
                    <div className="text-xs text-white/60 font-medium flex items-center gap-2">
                        <Icon name="bolt" size="xs" className="text-quiz"/>
                        <span className="text-white font-bold">{xp} XP</span> Total Earned
                    </div>
                </div>
            </div>

            {/* RIGHT: NEXT REWARD TEASER */}
            <div 
                className="w-full md:w-auto bg-white/5 border border-white/10 p-1 pr-6 rounded-2xl flex items-center gap-4 cursor-pointer hover:bg-white/10 hover:border-quiz/30 transition-all group/reward" 
                onClick={() => onNavigate('quiz')}
            >
                <div className="size-14 rounded-xl bg-gradient-to-br from-quiz to-orange-500 flex items-center justify-center text-black shadow-lg group-hover/reward:scale-105 transition-transform">
                    {/* ✅ ORA FUNZIONA: nextReward è un oggetto singolo */}
                    <Icon name={nextReward.icon} size="md"/>
                </div>
                <div>
                    <div className="text-[9px] font-black uppercase text-quiz tracking-widest mb-0.5">Next Unlock</div>
                    {/* ✅ ORA FUNZIONA: nextReward è un oggetto singolo */}
                    <div className="font-bold text-white text-sm">{nextReward.prizeTitle}</div>
                </div>
                <Icon name="arrow_forward" className="text-white/20 group-hover/reward:text-white group-hover/reward:translate-x-1 transition-all ml-2"/>
            </div>
        </div>
      </div>

      {/* 2. GRID SYSTEM */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* COL 1: ACTIVE CHALLENGE (Hero Card) */}
        <div className="lg:col-span-2 relative group cursor-pointer" onClick={() => onNavigate('quiz')}>
            <div className="absolute inset-0 bg-quiz/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-700 rounded-[3rem]" />
            
            <Card variant="glass" padding="none" className="h-full bg-[#1a1a1a] border-white/10 overflow-hidden relative min-h-[320px]">
                {/* Image BG */}
                <div className="absolute inset-0">
                    <img src="https://mtqullobcsypkqgdkaob.supabase.co/storage/v1/object/public/showcase/Akha01.jpg" className="w-full h-full object-cover opacity-40 group-hover:scale-105 transition-transform duration-[3s]" alt="Challenge" />
                    <div className="absolute inset-0 bg-gradient-to-r from-black via-black/80 to-transparent" />
                </div>

                <div className="relative z-10 p-8 h-full flex flex-col justify-between">
                    <div>
                        <div className="flex justify-between items-start mb-4">
                            <Badge variant="mineral" className="bg-red-500/20 text-red-400 border-red-500/30 animate-pulse">
                                <Icon name="timer" size="xs" className="mr-1"/> DAILY CHALLENGE
                            </Badge>
                            <div className="bg-quiz text-black font-black text-xs px-3 py-1 rounded-full shadow-[0_0_15px_rgba(254,202,42,0.4)]">
                                +500 XP
                            </div>
                        </div>
                        
                        <Typography variant="h3" className="text-white italic uppercase tracking-tighter max-w-md mb-2 leading-none">
                            Ancestral Lore: <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-white/50">The Spirit Gate</span>
                        </Typography>
                        
                        <p className="text-white/70 text-sm max-w-sm line-clamp-2 mt-4 font-medium">
                            Deep dive into the complex history of Akha migration. Only 4% have achieved a perfect score.
                        </p>
                    </div>

                    <div className="flex items-center gap-4 mt-8">
                        <Button variant="brand" className="bg-white text-black hover:bg-quiz border-none shadow-xl h-12 px-6" icon="play_arrow">
                            Start Mission
                        </Button>
                        <span className="text-[10px] text-white/40 font-bold uppercase tracking-widest pl-2">+1.2k Joined Today</span>
                    </div>
                </div>
            </Card>
        </div>

        {/* COL 2: LEADERBOARD (Compact List) */}
        <Card variant="glass" padding="none" className="bg-[#121212] border-white/10 p-6 flex flex-col h-full min-h-[300px]">
            <div className="flex justify-between items-center mb-6">
                <Typography variant="h6" className="text-white flex items-center gap-2 text-sm uppercase">
                    <Icon name="leaderboard" className="text-quiz"/> Top Warriors
                </Typography>
                <button className="text-[9px] font-bold text-white/40 hover:text-white uppercase tracking-widest">Global</button>
            </div>

            <div className="space-y-2 flex-1">
                {LEADERBOARD.map((p, i) => (
                    <div key={i} className="flex items-center gap-3 p-2 rounded-xl hover:bg-white/5 transition-colors border border-transparent hover:border-white/5">
                        <div className={cn("size-6 rounded flex items-center justify-center font-black text-xs", 
                            i === 0 ? "bg-yellow-500 text-black shadow-lg shadow-yellow-500/20" : 
                            i === 1 ? "bg-gray-400 text-black" : 
                            i === 2 ? "bg-orange-700 text-white" : "bg-white/10 text-white/60")}>
                            {p.rank}
                        </div>
                        <div className="size-8 rounded-full bg-white/10 flex items-center justify-center text-sm">
                            {p.avatar}
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="font-bold text-white text-xs truncate">{p.name}</div>
                            <div className="text-[9px] text-quiz font-mono">{p.xp.toLocaleString()} XP</div>
                        </div>
                    </div>
                ))}
                
                {/* User Rank Divider */}
                <div className="border-t border-white/10 my-2 pt-2">
                    <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/10">
                        <div className="size-6 rounded bg-primary text-white flex items-center justify-center font-black text-xs">42</div>
                        <div className="flex-1 font-bold text-white text-xs">You</div>
                        <div className="text-[9px] text-white/60 font-mono">{xp.toLocaleString()} XP</div>
                    </div>
                </div>
            </div>
        </Card>

      </div>

      {/* 3. QUICK STATS (Footer Grid) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
         {[
            { label: "Quizzes Passed", val: completedCount },
            // ✅ FIX: Usa awardedBonuses.length che ora è definita nello state
            { label: "Artifacts", val: awardedBonuses.length },
            { label: "Accuracy", val: `${accuracy}%`, color: "text-action" },
            { label: "Total XP", val: xp, color: "text-quiz" }
         ].map((stat, i) => (
             <div key={i} className="bg-white/5 rounded-2xl p-4 border border-white/5 text-center hover:bg-white/10 transition-colors">
                <div className={cn("text-2xl font-black mb-1", stat.color || "text-white")}>{stat.val}</div>
                <div className="text-[9px] uppercase tracking-widest text-white/40">{stat.label}</div>
             </div>
         ))}
      </div>

    </div>
  );
};

export default QuizWidget;