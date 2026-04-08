import React, { useState, useMemo, useEffect } from 'react';
import { supabase } from '@thaiakha/shared/lib/supabase';
import { PageLayout } from '../components/layout/PageLayout';
import { HeaderQuiz, LevelQuiz, PlayQuiz, ResultQuiz, QuizCard } from '../components/quiz/index';
import { Typography, Button, Icon, Badge, Card } from '../components/ui/index';
import { contentService } from '@thaiakha/shared/services';
import { QuizLevel } from '@thaiakha/shared';
import { cn } from '@thaiakha/shared/lib/utils';
import { getLocalScore } from './QuizPage';
import { t } from '@thaiakha/shared/lib/ui-strings';

// ── Constants ──────────────────────────────────────────────────────────────────
const PROGRESS_KEY = 'thai_akha_quiz_progress_v2';
const SCORE_KEY = 'thai_akha_quiz_points';

// ── Types ──────────────────────────────────────────────────────────────────────
type View = 'HOME' | 'LEVEL_SELECT' | 'PLAYING' | 'RESULT';

interface QuizPageSingleProps {
  categoryId: string;
  onNavigate: (page: string, topic?: string, sectionId?: string) => void;
}

// ── Score helpers ──────────────────────────────────────────────────────────────
const saveLocalScore = (score: number) => {
  try { localStorage.setItem(SCORE_KEY, String(score)); } catch { /* noop */ }
};

const syncScoreToSupabase = async (score: number) => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    await supabase.from('profiles').update({ quiz_points: score }).eq('id', user.id);
  } catch { /* noop */ }
};

// ── Component ──────────────────────────────────────────────────────────────────
const QuizPageSingle: React.FC<QuizPageSingleProps> = ({ categoryId, onNavigate }) => {
  // --- Data state ---
  const [quizLevels, setQuizLevels] = useState<QuizLevel[]>([]);
  const [quizRewards, setQuizRewards] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [categoryTitle, setCategoryTitle] = useState<string>(t.quiz.spiritQuizTitle);

  // --- Gameplay state ---
  const [view, setView] = useState<View>('HOME');
  const [score, setScore] = useState(0);
  const [completedModules, setCompletedModules] = useState<string[]>([]);
  const [perfectModules, setPerfectModules] = useState<string[]>([]);
  const [bestScores, setBestScores] = useState<Record<string, number>>({});
  const [awardedBonuses, setAwardedBonuses] = useState<number[]>([]);

  // --- Navigation state ---
  const [currentLevelId, setCurrentLevelId] = useState<number>(1);
  const [currentModuleId, setCurrentModuleId] = useState<string | null>(null);

  // --- Question state ---
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [sessionScore, setSessionScore] = useState(0);
  const [showFeedback, setShowFeedback] = useState(false);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);

  // --- Init ---
  useEffect(() => {
    const init = async () => {
      setLoading(true);
      try {
        const [dbData, rewards, categories] = await Promise.all([
          contentService.getQuizData(categoryId),
          contentService.getQuizRewards(),
          contentService.getQuizCategories(),
        ]);

        setQuizRewards(rewards);

        const cat = categories.find(c => c.id === categoryId);
        if (cat) setCategoryTitle(cat.title);

        if (dbData) {
          const adaptedLevels: QuizLevel[] = dbData.map((l: any) => ({
            id: l.id,
            title: l.title,
            subtitle: l.subtitle,
            image: l.image_url,
            rewardId: l.reward_id,
            completion_bonus: l.completion_bonus ?? 0,
            modules: (l.modules ?? []).map((m: any) => ({
              id: m.id,
              title: m.title,
              icon: m.icon_name ?? m.icon,
              theme: m.theme_color ?? m.theme,
              image_url: m.image_url,
              questions: (m.questions ?? []).map((q: any) => ({
                id: q.id,
                text: q.question_text ?? q.text,
                options: q.options,
                // DB uses correct_index (integer) — convert to string option value
                correctAnswer: Array.isArray(q.options)
                  ? q.options[q.correct_index] ?? q.options[q.correct_answer] ?? q.correctAnswer
                  : q.correct_answer ?? q.correctAnswer,
                explanation: q.explanation,
                points: q.points ?? 10, // XP per correct answer (default 10)
              })),
            })),
          }));
          setQuizLevels(adaptedLevels);
        }

        // Load saved progress
        const saved = localStorage.getItem(PROGRESS_KEY);
        if (saved) {
          const d = JSON.parse(saved);
          setCompletedModules(d.completedModules || []);
          setPerfectModules(d.perfectModules || []);
          setBestScores(d.bestScores || {});
          setAwardedBonuses(d.awardedBonuses || []);
          setCurrentLevelId(Math.max(1, Math.floor((d.score || 0) / 100) + 1));
        }

        // Load score: Supabase if logged in, else localStorage
        const localScore = getLocalScore();
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data: profile } = await supabase
            .from('profiles').select('quiz_points').eq('id', user.id).single();
          setScore(profile?.quiz_points ?? localScore);
        } else {
          setScore(localScore);
        }
      } catch (e) {
        console.error('[QuizPageSingle]', e);
      } finally {
        setLoading(false);
      }
    };
    init();
  }, [categoryId]);

  // --- Save progress ---
  const saveProgress = (
    newScore: number,
    newBestScores: Record<string, number>,
    newCompleted: string[],
    newPerfect: string[],
    newBonuses: number[],
  ) => {
    localStorage.setItem(PROGRESS_KEY, JSON.stringify({
      score: newScore,
      bestScores: newBestScores,
      completedModules: newCompleted,
      perfectModules: newPerfect,
      awardedBonuses: newBonuses,
    }));
    saveLocalScore(newScore);
    syncScoreToSupabase(newScore);
    setScore(newScore);
    setBestScores(newBestScores);
    setCompletedModules(newCompleted);
    setPerfectModules(newPerfect);
    setAwardedBonuses(newBonuses);
  };

  // --- Computed ---
  const currentLevel = useMemo(
    () => quizLevels.find(l => l.id === currentLevelId) || null,
    [currentLevelId, quizLevels],
  );

  const currentModule = useMemo(() => {
    if (!currentLevel?.modules) return null;
    return currentLevel.modules.find(m => m.id === currentModuleId) || null;
  }, [currentLevel, currentModuleId]);

  const maxTotalScore = useMemo(() => {
    let total = 0;
    quizLevels.forEach(l => {
      l.modules.forEach(m => m.questions.forEach(q => (total += q.points ?? 10)));
      total += l.completion_bonus ?? 0;
    });
    return Math.max(total, 100);
  }, [quizLevels]);

  const rewardsList = useMemo(
    () => quizRewards.map(r => ({ id: r.id, label: r.label, icon: r.icon_name })),
    [quizRewards],
  );

  // --- Handlers ---
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

    const question = currentModule.questions[currentQuestionIndex];
    const isCorrect = option === question.correctAnswer;
    const pts = isCorrect ? (question.points ?? 10) : 0;
    if (isCorrect) setSessionScore(prev => prev + pts);

    setTimeout(() => {
      const nextIndex = currentQuestionIndex + 1;
      if (nextIndex < currentModule.questions.length) {
        setCurrentQuestionIndex(nextIndex);
        setShowFeedback(false);
        setSelectedOption(null);
      } else {
        finishModule(isCorrect ? sessionScore + pts : sessionScore);
      }
    }, 1500);
  };

  const finishModule = (finalSessionScore: number) => {
    if (!currentModule || !currentLevel) return;

    // isPerfect: user earned the max possible points for this module
    const maxModulePoints = currentModule.questions.reduce((sum, q) => sum + (q.points ?? 10), 0);
    const isPerfect = finalSessionScore >= maxModulePoints;

    const prevBest = bestScores[currentModule.id] || 0;
    const newBest = Math.max(prevBest, finalSessionScore);
    const newBestScores = { ...bestScores, [currentModule.id]: newBest };

    // Sum best scores per module (already in XP points, no * 10)
    let newTotalScore = Object.values(newBestScores).reduce((sum, s) => sum + s, 0);

    const newCompleted = completedModules.includes(currentModule.id)
      ? completedModules
      : [...completedModules, currentModule.id];

    const newPerfect = (isPerfect && !perfectModules.includes(currentModule.id))
      ? [...perfectModules, currentModule.id]
      : perfectModules;

    // completion_bonus: if all modules in this level are now completed
    const allLevelModulesCompleted = currentLevel.modules.every(m => newCompleted.includes(m.id));
    if (allLevelModulesCompleted && currentLevel.completion_bonus > 0) {
      newTotalScore += currentLevel.completion_bonus;
    }

    // Sblocco reward per soglia XP cumulativa (required_points)
    const newBonuses = quizRewards
      .filter(r => newTotalScore >= r.required_points)
      .map(r => r.id);

    saveProgress(newTotalScore, newBestScores, newCompleted, newPerfect, newBonuses);
    setView('RESULT');
  };

  const handleAskHint = (question: string) => {
    if (score >= 50) {
      const topic = `I need a hint for this Akha quiz question: "${question}". Give me a subtle clue without telling the answer directly kha.`;
      window.dispatchEvent(new CustomEvent('trigger-chat-topic', { detail: { topic } }));
    } else {
      alert(t.quiz.notEnoughXp);
    }
  };

  // --- Render ---
  if (loading) {
    return (
      <PageLayout slug="quiz" loading={true} hideDefaultHeader={true}>
        <div className="h-screen" />
      </PageLayout>
    );
  }

  return (
    <PageLayout
      slug="quiz"
      loading={false}
      hideDefaultHeader={true}
      customHeader={
        <HeaderQuiz
          title={view === 'LEVEL_SELECT' && currentLevel ? currentLevel.title : categoryTitle}
          currentLevel={currentLevelId}
          totalLevels={quizLevels.length || 3}
          score={score}
          maxScore={maxTotalScore}
        />
      }
    >
      <div className={`w-full [padding-top:var(--space-fluid-xl)] ${view !== 'HOME' ? 'flex items-center justify-center' : ''}`}>

        {/* HOME — level list */}
        {view === 'HOME' && (
          <div className="w-full max-w-[85rem] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 px-4 pb-32 animate-in fade-in slide-in-from-bottom-4 duration-700">

            {/* Left column — levels */}
            <div className="lg:col-span-8 flex flex-col [gap:var(--space-fluid-m)]">
              <div className="flex items-center [gap:var(--space-fluid-s)]">
                <button
                  type="button"
                  onClick={() => onNavigate('quiz')}
                  className="flex items-center [gap:var(--space-fluid-2xs)] text-white/40 hover:text-white transition-colors"
                >
                  <Icon name="arrow_back" size="sm" />
                  <Typography variant="microLabel" color="muted">{t.quiz.backToCategories}</Typography>
                </button>
              </div>

              {quizLevels.length === 0 ? (
                <div className="mineral-panel rounded-2xl [padding:var(--space-fluid-l)] text-center">
                  <Typography variant="paragraphM" color="muted">{t.quiz.noLevels}</Typography>
                </div>
              ) : (
                <div className="flex flex-col [gap:var(--space-fluid-s)]">
                  {quizLevels.map(lvl => {
                    const isLocked = lvl.id > currentLevelId;
                    const isCurrent = lvl.id === currentLevelId;
                    const completedCount = lvl.modules.filter(m => completedModules.includes(m.id)).length;

                    return (
                      <button
                        key={lvl.id}
                        disabled={isLocked}
                        onClick={() => {
                          setCurrentLevelId(lvl.id);
                          setView('LEVEL_SELECT');
                        }}
                        className={cn(
                          'relative w-full text-left p-1 rounded-[2.5rem] border-2 transition-all duration-500 group overflow-hidden brand-btn-animation',
                          isLocked
                            ? 'border-white/5 bg-white/5 opacity-50 grayscale cursor-not-allowed'
                            : 'border-white/10 bg-surface-elevated hover:border-quiz/50 hover:shadow-2xl',
                        )}
                      >
                        <div className="absolute inset-0 opacity-40 group-hover:opacity-60 transition-opacity">
                          {lvl.image && (
                            <img src={lvl.image} className="w-full h-full object-cover" alt={lvl.title} />
                          )}
                          <div className="absolute inset-0 bg-gradient-to-r from-black via-black/80 to-transparent" />
                        </div>

                        <div className="relative z-10 [padding:var(--space-fluid-m)] flex items-center justify-between">
                          <div>
                            <div className="flex items-center [gap:var(--space-fluid-xs)] [margin-bottom:var(--space-fluid-xs)]">
                              <Badge
                                variant={isLocked ? 'outline' : 'mineral'}
                                className={cn(!isLocked && 'bg-quiz text-black border-quiz')}
                              >
                                {t.quiz.levelPrefix} {lvl.id}
                              </Badge>
                              {isCurrent && (
                                <Typography variant="microLabel" className="text-quiz animate-pulse">
                                  {t.quiz.currentMission}
                                </Typography>
                              )}
                            </div>
                            <Typography variant="h3" className="text-white italic uppercase leading-none [margin-bottom:var(--space-fluid-2xs)]">
                              {lvl.title}
                            </Typography>
                            {lvl.subtitle && (
                              <Typography variant="paragraphS" color="muted">{lvl.subtitle}</Typography>
                            )}
                          </div>

                          <div className="text-right hidden sm:flex flex-col items-end [gap:var(--space-fluid-2xs)]">
                            <Typography variant="numericStat" className="text-white">{completedCount}/{lvl.modules.length}</Typography>
                            <Typography variant="microLabel" color="muted">{t.quiz.modules}</Typography>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Right column — sidebar */}
            <div className="lg:col-span-4 flex flex-col [gap:var(--space-fluid-m)]">
              <QuizCard
                title={t.quiz.heritageWalletTitle}
                description={t.quiz.heritageWalletDesc}
                awardedBonuses={awardedBonuses}
                rewards={rewardsList}
                onCardClick={() => {}}
              />

              <Card variant="glass" padding="lg" className="bg-surface/80 border-white/10 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-16 bg-action/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
                <div className="flex items-center [gap:var(--space-fluid-s)] [margin-bottom:var(--space-fluid-m)]">
                  <div className="size-10 rounded-xl bg-action/20 flex items-center justify-center text-action">
                    <Icon name="school" />
                  </div>
                  <Typography variant="h5" className="text-white">{t.quiz.cherryRulesTitle}</Typography>
                </div>

                <div className="flex flex-col [gap:var(--space-fluid-xs)]">
                  {[
                    { label: t.quiz.hintLabel, val: t.quiz.hintCost, color: 'text-red-400' },
                    { label: t.quiz.wrongAnswer, val: t.quiz.zeroXp, color: 'text-white/40' },
                    { label: t.quiz.perfectModule, val: t.quiz.bonus, color: 'text-quiz' },
                  ].map(row => (
                    <div key={row.label} className="flex justify-between items-center [padding:var(--space-fluid-xs)] rounded-xl bg-white/5 border border-white/5">
                      <Typography variant="paragraphS" className="text-white/80">{row.label}</Typography>
                      <Typography variant="badge" className={row.color}>{row.val}</Typography>
                    </div>
                  ))}
                </div>

                <div className="[margin-top:var(--space-fluid-m)]">
                  <Button
                    variant="mineral"
                    fullWidth
                    size="sm"
                    className="border-white/10 hover:bg-white/5"
                    onClick={() => window.dispatchEvent(new CustomEvent('trigger-chat-topic', {
                      detail: { topic: t.quiz.scoringTopic },
                    }))}
                  >
                    {t.quiz.askCherry}
                  </Button>
                </div>
              </Card>
            </div>
          </div>
        )}

        {/* LEVEL_SELECT */}
        {view === 'LEVEL_SELECT' && currentLevel && (
          <LevelQuiz
            level={currentLevel as any}
            completedModules={completedModules}
            perfectModules={perfectModules}
            bestScores={bestScores}
            onStartModule={handleStartModule}
            onBack={() => setView('HOME')}
          />
        )}

        {/* PLAYING */}
        {view === 'PLAYING' && currentModule && currentLevel && (
          <PlayQuiz
            level={currentLevel as any}
            module={currentModule as any}
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

        {/* RESULT */}
        {view === 'RESULT' && currentModule && currentLevel && (
          <ResultQuiz
            level={currentLevel as any}
            module={currentModule as any}
            correctAnswers={sessionScore}
            totalQuestions={currentModule.questions.length}
            xpEarned={sessionScore}
            onNext={() => setView('LEVEL_SELECT')}
            onPlayAgain={() => handleStartModule(currentModule.id)}
            onReturn={() => setView('LEVEL_SELECT')}
          />
        )}

      </div>
    </PageLayout>
  );
};

export default QuizPageSingle;
