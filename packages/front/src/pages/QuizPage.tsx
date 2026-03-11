import React, { useState, useMemo, useEffect } from 'react';
import { PageLayout } from '../components/layout/PageLayout';
import { HeaderQuiz } from '../components/layout/index'; // 🟢 Manteniamo l'Header
import { LevelQuiz, PlayQuiz, ResultQuiz } from '../components/quiz/index';
import { QuizCard, Typography, Button, Icon, Badge, Card } from '../components/ui/index';
import { contentService } from '../services/contentService';
import { BONUS_CARDS } from '../lib/bonusQuiz';
import { QuizLevel, QuizModule } from '../types/index';
import { cn } from '../lib/utils';

type View = 'HOME' | 'LEVEL_SELECT' | 'PLAYING' | 'RESULT';

const STORAGE_KEY = 'thai_akha_quiz_progress_v2';

const QuizPage: React.FC<{ onNavigate?: (p: string, t?: string) => void }> = ({ onNavigate }) => {
  // --- STATE: DATI ---
  const [quizLevels, setQuizLevels] = useState<QuizLevel[]>([]);
  const [loading, setLoading] = useState(true);

  // --- STATE: GAMEPLAY ---
  const [view, setView] = useState<View>('HOME');
  const [score, setScore] = useState(0);
  
  // Progressi
  const [completedModules, setCompletedModules] = useState<string[]>([]);
  const [perfectModules, setPerfectModules] = useState<string[]>([]);
  const [bestScores, setBestScores] = useState<Record<string, number>>({});
  const [awardedBonuses, setAwardedBonuses] = useState<number[]>([]);

  // Navigazione
  const [currentLevelId, setCurrentLevelId] = useState<number>(1);
  const [currentModuleId, setCurrentModuleId] = useState<string | null>(null);

  // Logica Partita
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [sessionScore, setSessionScore] = useState(0);
  const [showFeedback, setShowFeedback] = useState(false);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);

  // --- 1. INIT: CARICAMENTO DATI ---
  useEffect(() => {
    const init = async () => {
      setLoading(true);
      
      // A. Fetch Dati dal DB (Cache)
      const dbData = await contentService.getQuizData();
      if (dbData) {
        const adaptedLevels: QuizLevel[] = dbData.map((l: any) => ({
          id: l.id,
          title: l.title,
          subtitle: l.subtitle,
          image: l.image_url,
          rewardId: l.reward_id,
          modules: l.modules.map((m: any) => ({
            id: m.id,
            title: m.title,
            icon: m.icon,
            theme: m.theme,
            questions: m.questions
          }))
        }));
        setQuizLevels(adaptedLevels);
      }

      // B. Load Progressi da LocalStorage
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        try {
          const d = JSON.parse(saved);
          setCompletedModules(d.completedModules || []);
          setPerfectModules(d.perfectModules || []);
          setBestScores(d.bestScores || {});
          setAwardedBonuses(d.awardedBonuses || []);
          setScore(d.score || 0);
          
          // Auto-resume livello
          const calculatedLevel = Math.floor((d.score || 0) / 100) + 1;
          setCurrentLevelId(Math.min(calculatedLevel, 3)); 
        } catch (e) {
          console.error("Error parsing saved progress", e);
        }
      }
      setLoading(false);
    };
    init();
  }, []);

  // --- 2. SALVATAGGIO ---
  const saveProgress = (newScore: number, newBestScores: any, newCompleted: string[], newPerfect: string[], newBonuses: number[]) => {
    const payload = {
      score: newScore,
      bestScores: newBestScores,
      completedModules: newCompleted,
      perfectModules: newPerfect,
      awardedBonuses: newBonuses
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    
    setScore(newScore);
    setBestScores(newBestScores);
    setCompletedModules(newCompleted);
    setPerfectModules(newPerfect);
    setAwardedBonuses(newBonuses);
  };

  // --- COMPUTED ---
  const currentLevel = useMemo(() => quizLevels.find(l => l.id === currentLevelId) || null, [currentLevelId, quizLevels]);
  
  const currentModule = useMemo(() => {
    if (!currentLevel || !currentLevel.modules) return null;
    return currentLevel.modules.find(m => m.id === currentModuleId) || null;
  }, [currentLevel, currentModuleId]);

  const maxTotalScore = useMemo(() => {
    let total = 0;
    quizLevels.forEach(l => l.modules.forEach(m => total += m.questions.length * 10));
    return total;
  }, [quizLevels]);

  const rewardsList = useMemo(() => BONUS_CARDS.map(b => ({
      id: b.levelId,
      label: b.prizeTitle,
      icon: b.icon
  })), []);

  // --- HANDLERS ---
  const handleStartModule = (moduleId: string) => {
    setCurrentModuleId(moduleId);
    setCurrentQuestionIndex(0);
    setSessionScore(0);
    setShowFeedback(false);
    setSelectedOption(null);
    setView('PLAYING');
  };

  const handleAnswer = (option: string) => {
    if (!currentModule) return;
    setSelectedOption(option);
    setShowFeedback(true);
    
    const isCorrect = option === currentModule.questions[currentQuestionIndex].correctAnswer;
    if (isCorrect) setSessionScore(prev => prev + 1);

    setTimeout(() => {
      const nextIndex = currentQuestionIndex + 1;
      if (nextIndex < currentModule.questions.length) {
        setCurrentQuestionIndex(nextIndex);
        setShowFeedback(false);
        setSelectedOption(null);
      } else {
        finishModule(isCorrect ? sessionScore + 1 : sessionScore);
      }
    }, 1500);
  };

  const finishModule = (finalSessionScore: number) => {
    if (!currentModule || !currentLevel) return;

    const totalQuestions = currentModule.questions.length;
    const isPerfect = finalSessionScore === totalQuestions;
    
    const prevBest = bestScores[currentModule.id] || 0;
    const newBest = Math.max(prevBest, finalSessionScore);
    const newBestScores = { ...bestScores, [currentModule.id]: newBest };
    
    let newTotalScore = 0;
    Object.values(newBestScores).forEach(s => newTotalScore += (s * 10));

    let newCompleted = [...completedModules];
    if (!newCompleted.includes(currentModule.id)) newCompleted.push(currentModule.id);

    let newPerfect = [...perfectModules];
    if (isPerfect && !newPerfect.includes(currentModule.id)) newPerfect.push(currentModule.id);

    let newBonuses = [...awardedBonuses];
    const levelModuleIds = currentLevel.modules.map(m => m.id);
    const allPerfect = levelModuleIds.every(id => newPerfect.includes(id));
    
    if (allPerfect && currentLevel.rewardId && !newBonuses.includes(currentLevel.rewardId)) {
      newBonuses.push(currentLevel.rewardId);
    }

    saveProgress(newTotalScore, newBestScores, newCompleted, newPerfect, newBonuses);
    setView('RESULT');
  };

  const handleAskHint = (question: string) => {
    if (score >= 50) {
       // Logica Hint (In futuro dedurre XP reale)
       const topic = `I need a hint for this Akha quiz question: "${question}". Give me a subtle clue without telling the answer directly kha.`;
       window.dispatchEvent(new CustomEvent('trigger-chat-topic', { detail: { topic } }));
    } else {
       alert("Not enough XP! You need 50 XP to ask for a hint.");
    }
  };

  // --- RENDER ---
  if (loading) return <PageLayout slug="quiz" loading={true} hideDefaultHeader={true}><div className="h-screen"/></PageLayout>;

  return (
    <PageLayout 
      slug="quiz" 
      loading={false} 
      hideDefaultHeader={true} 
      // 🟢 Header Attuale Integrato
      customHeader={
        <HeaderQuiz 
            title={view === 'LEVEL_SELECT' && currentLevel ? currentLevel.title : "The Wisdom Path"} 
            currentLevel={currentLevelId} 
            totalLevels={quizLevels.length}
            score={score}
            maxScore={maxTotalScore}
        />
      }
    >
      <div className={`w-full ${view !== 'HOME' ? 'flex items-center justify-center' : ''}`}>

        {/* --- VIEW: DASHBOARD (HOME) --- */}
        {view === 'HOME' && (
          <div className="w-full max-w-[85rem] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 px-4 pb-32 animate-in fade-in slide-in-from-bottom-4 duration-700">
            
            {/* A. MAPPA LIVELLI (Colonna Sinistra 8/12) */}
            <div className="lg:col-span-8 space-y-8">
                <div className="flex items-center gap-4">
                    <Icon name="map" className="text-white/40" />
                    <Typography variant="h4" className="text-white italic">Mission Select</Typography>
                </div>

                <div className="grid grid-cols-1 gap-6">
                    {quizLevels.map((lvl) => {
                        const isLocked = lvl.id > currentLevelId;
                        const isCurrent = lvl.id === currentLevelId;
                        const completedCount = lvl.modules.filter(m => completedModules.includes(m.id)).length;
                        
                        return (
                            <button
                                key={lvl.id}
                                disabled={isLocked}
                                onClick={() => { setCurrentLevelId(lvl.id); setView('LEVEL_SELECT'); }}
                                className={cn(
                                    "relative w-full text-left p-1 rounded-[2.5rem] border-2 transition-all duration-500 group overflow-hidden",
                                    isLocked 
                                        ? "border-white/5 bg-white/5 opacity-50 grayscale cursor-not-allowed" 
                                        : "border-white/10 bg-[#1a1a1a] hover:border-quiz/50 hover:shadow-2xl"
                                )}
                            >
                                <div className="absolute inset-0 opacity-40 group-hover:opacity-60 transition-opacity">
                                    <img src={lvl.image} className="w-full h-full object-cover" alt={lvl.title} />
                                    <div className="absolute inset-0 bg-gradient-to-r from-black via-black/80 to-transparent" />
                                </div>
                                
                                <div className="relative z-10 p-8 flex items-center justify-between">
                                    <div>
                                        <div className="flex items-center gap-3 mb-2">
                                            <Badge variant={isLocked ? 'outline' : 'mineral'} className={cn(isLocked ? "text-white/40" : "bg-quiz text-black border-quiz")}>
                                                LEVEL {lvl.id}
                                            </Badge>
                                            {isCurrent && <span className="text-quiz text-[10px] font-black uppercase tracking-widest animate-pulse">Current Mission</span>}
                                        </div>
                                        <h3 className="text-3xl font-black text-white uppercase italic leading-none mb-1">{lvl.title}</h3>
                                        <p className="text-white/60 font-medium">{lvl.subtitle}</p>
                                    </div>

                                    <div className="text-right hidden sm:block">
                                        <div className="text-2xl font-black text-white">{completedCount}/{lvl.modules.length}</div>
                                        <div className="text-[10px] text-white/40 uppercase tracking-widest">Modules</div>
                                    </div>
                                </div>
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* B. SIDEBAR (Colonna Destra 4/12) */}
            <div className="lg:col-span-4 space-y-8">
                
                {/* 1. HERITAGE WALLET */}
                <QuizCard 
                    title="Heritage Wallet"
                    description="Collect artifacts & real rewards."
                    awardedBonuses={awardedBonuses} 
                    rewards={rewardsList} 
                    onCardClick={() => {}} 
                />

                {/* 2. CHERRY'S DOJO (Rules) */}
                <Card variant="glass" padding="lg" className="bg-[#121212]/80 border-white/10 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-16 bg-action/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"/>
                    
                    <div className="flex items-center gap-3 mb-6">
                        <div className="size-10 rounded-xl bg-action/20 flex items-center justify-center text-action">
                            <Icon name="school" />
                        </div>
                        <Typography variant="h5" className="text-white">Cherry's Rules</Typography>
                    </div>

                    <div className="space-y-4">
                        <div className="flex justify-between items-center p-3 rounded-xl bg-white/5 border border-white/5">
                            <span className="text-xs font-bold text-white/80">Need a Hint?</span>
                            <Badge variant="outline" className="text-red-400 border-red-500/30">-50 XP</Badge>
                        </div>
                        <div className="flex justify-between items-center p-3 rounded-xl bg-white/5 border border-white/5">
                            <span className="text-xs font-bold text-white/80">Wrong Answer</span>
                            <span className="text-xs font-mono text-white/40">0 XP</span>
                        </div>
                        <div className="flex justify-between items-center p-3 rounded-xl bg-white/5 border border-white/5">
                            <span className="text-xs font-bold text-white/80">Perfect Module</span>
                            <span className="text-xs font-mono text-quiz">+Bonus</span>
                        </div>
                    </div>

                    <Button 
                        variant="mineral" 
                        fullWidth 
                        size="sm" 
                        className="mt-6 border-white/10 hover:bg-white/5"
                        onClick={() => window.dispatchEvent(new CustomEvent('trigger-chat-topic', { detail: { topic: "How does the quiz scoring work kha?" } }))}
                    >
                        Ask Cherry
                    </Button>
                </Card>

            </div>

          </div>
        )}

        {/* --- GAME VIEWS --- */}
        {view === 'LEVEL_SELECT' && currentLevel && (
          <LevelQuiz 
            // @ts-ignore
            level={currentLevel}
            completedModules={completedModules}
            perfectModules={perfectModules}
            bestScores={bestScores}
            onStartModule={handleStartModule}
            onBack={() => setView('HOME')}
          />
        )}

        {view === 'PLAYING' && currentModule && currentLevel && (
          <PlayQuiz 
            // @ts-ignore
            level={currentLevel}
            // @ts-ignore
            module={currentModule}
            currentQuestionIndex={currentQuestionIndex}
            totalQuestions={currentModule.questions.length}
            score={score}
            onAnswer={handleAnswer}
            onBack={() => setView('LEVEL_SELECT')}
            onGetHint={handleAskHint}
            selectedOption={selectedOption}
            showFeedback={showFeedback}
          />
        )}

        {view === 'RESULT' && currentModule && currentLevel && (
          <ResultQuiz 
            // @ts-ignore
            level={currentLevel}
            // @ts-ignore
            module={currentModule}
            correctAnswers={sessionScore}
            totalQuestions={currentModule.questions.length}
            xpEarned={sessionScore * 10}
            onNext={() => setView('LEVEL_SELECT')}
            onPlayAgain={() => handleStartModule(currentModule.id)}
            onReturn={() => setView('LEVEL_SELECT')}
          />
        )}

      </div>
    </PageLayout>
  );
};

export default QuizPage;