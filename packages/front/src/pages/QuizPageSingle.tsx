import React, { useState, useMemo, useEffect } from 'react';
import { supabase } from '@thaiakha/shared/lib/supabase';
import { PageLayout } from '../components/layout/PageLayout';
import { SiblingInfoSection } from '../components/layout/SiblingInfoSection';
import { SmartHeaderSection } from '../components/layout/SmartHeaderSection';
import { HeaderQuiz, LevelQuiz, PlayQuiz, ResultQuiz, QuizCard, QuizCardLevel, QuizCardCategory } from '../components/quiz/index';
import { scoreAnswer, type QuizAnswer } from '../components/quiz/quizScoring';
import { Typography, Button, Icon, Card, GlassCardFull, FaqBottomPage } from '../components/ui/index';
import { AkhaThemedLine } from '../components/blog';
import { contentService } from '@thaiakha/shared/services';
import { QuizLevel, QuizQuestion } from '@thaiakha/shared';
import { t } from '@thaiakha/shared/lib/ui-strings';
import { useQuizProgress } from '../hooks/useQuizProgress';
import { useActiveProfile } from '../context/ActiveProfileContext';

// ── Constants ──────────────────────────────────────────────────────────────────
const PROGRESS_KEY = 'thai_akha_quiz_progress_v2';
const SCORE_KEY = 'thai_akha_quiz_points';
const EXPLANATIONS_KEY = 'thai_akha_quiz_explanations';

// Explanation preference (guest): 'on' | 'off' | assente(undecided→null)
const getLocalExplanations = (): boolean | null => {
  try {
    const v = localStorage.getItem(EXPLANATIONS_KEY);
    return v === 'on' ? true : v === 'off' ? false : null;
  } catch { return null; }
};

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
const getLocalScore = () => {
  try { return Number(localStorage.getItem(SCORE_KEY)) || 0; } catch { return 0; }
};

const syncProgressToSupabase = async (score: number, progressJson: any, targetId?: string) => {
  try {
    // targetId presente = profilo gestito attivo (F2); altrimenti l'host loggato.
    let id = targetId;
    if (!id) {
      const { data: { user } } = await supabase.auth.getUser();
      id = user?.id;
    }
    if (!id) return;
    await supabase.from('profiles').update({
      quiz_points: score,
      quiz_progress: progressJson
    }).eq('id', id);
  } catch { /* noop */ }
};

// ── Component ──────────────────────────────────────────────────────────────────
const QuizPageSingle: React.FC<QuizPageSingleProps> = ({ categoryId, onNavigate }) => {
  // --- Data state ---
  const [quizLevels, setQuizLevels] = useState<QuizLevel[]>([]);
  const [quizRewards, setQuizRewards] = useState<any[]>([]);
  const [allCategories, setAllCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [categoryTitle, setCategoryTitle] = useState<string>(t.quiz.spiritQuizTitle);
  const { getCategoryProgress } = useQuizProgress();

  // F2 — quiz per PROFILO ATTIVO. Quando si agisce come gestito: DB-only su
  // activeProfileId, bypassando localStorage (cache per-device dell'host).
  const { activeProfileId, isActingAsManaged } = useActiveProfile();
  const managedId = isActingAsManaged && activeProfileId ? activeProfileId : null;

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
  const [sessionAnswers, setSessionAnswers] = useState<('correct' | 'wrong')[]>([]);

  // --- Explanation preference (tri-state: null=undecided→trattato come ON) ---
  const [showExplanations, setShowExplanations] = useState<boolean | null>(getLocalExplanations);

  // --- XP spesi in hint/retry: ledger persistente (in quiz_progress), sottratto dal lordo ---
  const [spentXp, setSpentXp] = useState(0);

  // --- Init ---
  useEffect(() => {
    window.scrollTo(0, 0);
    const init = async () => {
      setLoading(true);
      try {
        const [dbData, rewards, categories] = await Promise.all([
          contentService.getQuizData(categoryId),
          contentService.getQuizRewards(),
          contentService.getQuizCategories(),
        ]);

        setQuizRewards(rewards);
        setAllCategories(categories);

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
            display_order: l.display_order ?? l.displayOrder ?? 0,
            modules: (l.modules ?? []).map((m: any) => ({
              id: m.id,
              title: m.title,
              icon: m.icon_name ?? m.icon,
              theme: m.theme_color ?? m.theme,
              image_url: m.image_url,
              // T8 — link "Learn more" del reveal (pagina sorgente del modulo).
              sourceTable: m.source_table ?? m.sourceTable ?? null,
              sourceSlug: m.source_slug ?? m.sourceSlug ?? null,
              questions: (m.questions ?? []).map((q: any) => ({
                id: q.id,
                text: q.text,
                // game.service normalizza già: options = QuizOption[] · correctAnswer = label corretta.
                options: q.options ?? [],
                correctAnswer: q.correctAnswer ?? '',
                // Gameplay types (photo_single/order/multi). Default 'single' (testo).
                questionType: q.questionType ?? 'single',
                imageUrl: q.imageUrl ?? null,           // foto hero della domanda
                correctIndices: q.correctIndices ?? null, // photo_order/photo_multi
                explanation: q.explanation,
                points: q.points ?? 10, // XP per correct answer (default 10)
                // T6 — Quiz Hint Preset (passa fino al tasto "Request Hint").
                hintPrompt: q.hint_prompt ?? q.hintPrompt ?? null,
                hintResponse: q.hint_response ?? q.hintResponse ?? null,
                hintBlocks: q.hint_blocks ?? q.hintBlocks ?? null,
                // T8 — reveal per risposta sbagliata (supporto, spoiler-free).
                explanationWrong: q.explanation_wrong ?? q.explanationWrong ?? null,
              })),
            })),
          }));
          setQuizLevels(adaptedLevels);

          // Load score and progress. Profilo gestito (F2): SOLO DB su managedId,
          // nessun uso del localStorage (cache per-device dell'host). Host: come prima.
          const localScore = managedId ? 0 : getLocalScore();
          let savedProgress = null;
          if (!managedId) {
            try {
              const rawLocal = localStorage.getItem(PROGRESS_KEY);
              if (rawLocal) savedProgress = JSON.parse(rawLocal);
            } catch { /* noop */ }
          }

          const { data: { user } } = await supabase.auth.getUser();
          const dbId = managedId ?? user?.id ?? null;
          if (dbId) {
            const { data: profile } = await supabase
              .from('profiles').select('quiz_points, quiz_progress, quiz_show_explanations').eq('id', dbId).single();

            // Explanation pref: il profilo (attivo) è la sorgente (null = undecided → ON)
            if (profile && profile.quiz_show_explanations !== undefined) {
              setShowExplanations(profile.quiz_show_explanations);
            }

            const dbProgress = profile?.quiz_progress;
            if (dbProgress && Object.keys(dbProgress).length > 0) {
              // DB wins
              savedProgress = dbProgress;
              // Keep local hot solo per l'host (non per i gestiti)
              if (!managedId) localStorage.setItem(PROGRESS_KEY, JSON.stringify(dbProgress));
            } else if (savedProgress && !managedId) {
              // Local wins (host appena loggato dopo aver giocato da guest) → sync UP
              syncProgressToSupabase(localScore, savedProgress);
            }

            setScore(profile?.quiz_points ?? localScore);
          } else {
            setScore(localScore);
          }

          // Apply progress (either from DB or LocalStorage)
          if (savedProgress) {
            setCompletedModules(savedProgress.completedModules || []);
            setPerfectModules(savedProgress.perfectModules || []);
            setBestScores(savedProgress.bestScores || {});
            setAwardedBonuses(savedProgress.awardedBonuses || []);
            setSpentXp(savedProgress.spentXp || 0); // legacy: assente → 0
            const savedLevelId = savedProgress.currentLevelId;
            const levelExists = adaptedLevels?.some(l => l.id === savedLevelId);
            setCurrentLevelId(levelExists ? savedLevelId : (adaptedLevels?.[0]?.id || 1));
          } else {
            setCompletedModules([]);
            setPerfectModules([]);
            setBestScores({});
            setAwardedBonuses([]);
            setSpentXp(0);
            setCurrentLevelId(adaptedLevels?.[0]?.id || 1);
          }
        }
      } catch (e) {
        console.error('[QuizPageSingle]', e);
      } finally {
        setLoading(false);
      }
    };
    init();
  }, [categoryId, managedId]);

  // Lordo = somma best per modulo + completion_bonus di OGNI livello interamente completato (F3).
  const computeGross = (bs: Record<string, number>, completed: string[]) => {
    let total = Object.values(bs).reduce((s, v) => s + v, 0);
    quizLevels.forEach(l => {
      const allDone = l.modules.length > 0 && l.modules.every(m => completed.includes(m.id));
      if (allDone) total += l.completion_bonus ?? 0;
    });
    return total;
  };

  // Premi sticky (F2): una volta sbloccati restano, anche se il netto cala per le spese hint.
  const computeBonuses = (prev: number[], net: number) =>
    Array.from(new Set([...prev, ...quizRewards.filter(r => net >= r.required_points).map(r => r.id)]));

  // --- Save progress ---
  const saveProgress = (
    newScore: number,
    newBestScores: Record<string, number>,
    newCompleted: string[],
    newPerfect: string[],
    newBonuses: number[],
    newSpent: number,
  ) => {
    const payload = {
      score: newScore,
      bestScores: newBestScores,
      completedModules: newCompleted,
      perfectModules: newPerfect,
      awardedBonuses: newBonuses,
      spentXp: newSpent,
      currentLevelId,
    };
    // Gestito (F2): solo DB su managedId, niente localStorage. Host: come prima.
    if (!managedId) {
      localStorage.setItem(PROGRESS_KEY, JSON.stringify(payload));
      saveLocalScore(newScore);
    }
    syncProgressToSupabase(newScore, payload, managedId ?? undefined);
    setScore(newScore);
    setBestScores(newBestScores);
    setCompletedModules(newCompleted);
    setPerfectModules(newPerfect);
    setAwardedBonuses(newBonuses);
    setSpentXp(newSpent);
  };

  // --- Explanation preference: flip + persist (profilo se loggato, sempre localStorage) ---
  const setExplanationPref = (value: boolean) => {
    setShowExplanations(value);
    // localStorage solo per l'host (cache per-device); i gestiti scrivono solo su DB.
    if (!managedId) {
      try { localStorage.setItem(EXPLANATIONS_KEY, value ? 'on' : 'off'); } catch { /* noop */ }
    }
    (async () => {
      try {
        const targetId = managedId ?? (await supabase.auth.getUser()).data.user?.id ?? null;
        if (targetId) {
          await supabase.from('profiles').update({ quiz_show_explanations: value }).eq('id', targetId);
        }
      } catch { /* noop */ }
    })();
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
    () => quizRewards.map(r => ({ ...r, icon: r.icon_name })),
    [quizRewards],
  );

  // --- Handlers ---
  const handleStartModule = (moduleId: string) => {
    setCurrentModuleId(moduleId);
    setCurrentQuestionIndex(0);
    setSessionScore(0);
    setShowFeedback(false);
    setSelectedOption(null);
    setSessionAnswers([]);
    setView('PLAYING');
  };

  // Registrazione risposta UNIFICATA: la correttezza è centralizzata in `scoreAnswer`
  // (keyed su questionType). Reveal post-risposta, avanzamento manuale (Next).
  const recordAnswer = (answer: QuizAnswer) => {
    if (!currentModule) return;
    const question = currentModule.questions[currentQuestionIndex];
    if (typeof answer === 'string') setSelectedOption(answer); // single / photo_single
    setShowFeedback(true);
    const ok = scoreAnswer(question, answer);
    const pts = ok ? (question.points ?? 10) : 0;
    if (ok) setSessionScore(prev => prev + pts);
    setSessionAnswers(prev => [...prev, ok ? 'correct' : 'wrong']);
  };
  const handleAnswer = (option: string) => recordAnswer(option);
  const handleSubmitSelection = (indices: number[]) => recordAnswer(indices); // photo_multi / photo_order

  const handleNext = () => {
    if (!currentModule) return;
    const nextIndex = currentQuestionIndex + 1;
    if (nextIndex < currentModule.questions.length) {
      setCurrentQuestionIndex(nextIndex);
      setShowFeedback(false);
      setSelectedOption(null);
    } else {
      finishModule(sessionScore);
    }
  };

  const finishModule = (finalSessionScore: number) => {
    if (!currentModule || !currentLevel) return;

    // isPerfect: user earned the max possible points for this module
    const maxModulePoints = currentModule.questions.reduce((sum, q) => sum + (q.points ?? 10), 0);
    const isPerfect = finalSessionScore >= maxModulePoints;

    const prevBest = bestScores[currentModule.id] || 0;
    const newBest = Math.max(prevBest, finalSessionScore);
    const newBestScores = { ...bestScores, [currentModule.id]: newBest };

    const newCompleted = completedModules.includes(currentModule.id)
      ? completedModules
      : [...completedModules, currentModule.id];

    const newPerfect = (isPerfect && !perfectModules.includes(currentModule.id))
      ? [...perfectModules, currentModule.id]
      : perfectModules;

    // Netto = lordo (best + bonus di TUTTI i livelli completati, F3) − XP spesi in hint/retry.
    const net = computeGross(newBestScores, newCompleted) - spentXp;
    const newBonuses = computeBonuses(awardedBonuses, net); // sticky (F2)

    saveProgress(net, newBestScores, newCompleted, newPerfect, newBonuses, spentXp);
    setView('RESULT');
  };

  // Spesa XP (hint/retry): aggiorna il ledger e ricalcola/persisti il netto.
  // Premi sticky → spendere non ri-blocca mai un reward già ottenuto (F2).
  const spendXp = (cost: number) => {
    const newSpent = spentXp + cost;
    const net = computeGross(bestScores, completedModules) - newSpent;
    const newBonuses = computeBonuses(awardedBonuses, net);
    saveProgress(net, bestScores, completedModules, perfectModules, newBonuses, newSpent);
  };

  // Dispatch dell'hint a Cherry. NON addebita (il costo lo gestisce il chiamante via spendXp).
  // T6 — preset zero-latency (hint_prompt + hint_response + hint_blocks) o fallback AI.
  const dispatchHint = (question: QuizQuestion) => {
    if (question.hintResponse) {
      window.dispatchEvent(new CustomEvent('trigger-chat-topic', {
        detail: {
          topic: question.hintPrompt ?? 'A clue please kha 🙏',
          presetResponse: question.hintResponse,
          presetBlocks: question.hintBlocks ?? undefined,
        },
      }));
    } else {
      const topic = `I need a hint for this Akha quiz question: "${question.text}". Give me a subtle clue without telling the answer directly kha.`;
      window.dispatchEvent(new CustomEvent('trigger-chat-topic', { detail: { topic } }));
    }
  };

  const handleAskHint = (question: QuizQuestion) => {
    if (score < 50) { alert(t.quiz.notEnoughXp); return; }
    spendXp(50);            // ← FIX: addebita davvero −50 XP
    dispatchHint(question);
  };

  // T8 — "Ask Cherry & Retry": riapre la stessa domanda al costo doppio dell'hint.
  // Possibile perché explanation_wrong NON spoilera la risposta corretta.
  const handleRetry = (question: QuizQuestion) => {
    if (score < 100) { alert(t.quiz.notEnoughXpRetry); return; }
    spendXp(100);          // ← FIX: addebita −100 XP (non passa più da handleAskHint)
    dispatchHint(question);
    setSessionAnswers(prev => prev.slice(0, -1));     // annulla la 'wrong' appena registrata
    setSelectedOption(null);                          // Retry: torna allo stato domanda
    setShowFeedback(false);
  };

  // T8 — "Learn more" → pagina sorgente del modulo (recipes / culture_sections).
  const handleLearnMore = (sourceTable?: string | null, sourceSlug?: string | null) => {
    if (!sourceSlug) return;
    const base = sourceTable === 'culture_sections'
      ? 'akha-culture-highland-heritage'
      : 'authentic-thai-akha-recipes';
    onNavigate(`${base}/${sourceSlug}`);
  };

  // --- Render ---
  const categoryProg = getCategoryProgress(categoryId || '');

  return (
    <PageLayout
      slug="quiz"
      loading={loading}
      hideDefaultHeader={true}
    >
      <div className="sticky top-[20px] z-30 w-full [margin-bottom:var(--space-fluid-xl)]">
        <HeaderQuiz
          title={view === 'LEVEL_SELECT' && currentLevel ? currentLevel.title : (currentModule ? currentModule.title : categoryTitle)}
          currentLevel={currentLevelId}
          totalLevels={quizLevels.length || 3}
          score={score}
          maxScore={maxTotalScore}
          view={view}
          questionResults={view === 'PLAYING' ? sessionAnswers : undefined}
          totalQuestions={currentModule?.questions?.length || 0}
          progressTextLeft={t.quiz.progress || 'Progress'}
          progressTextRight={view === 'PLAYING' ? undefined : `${categoryProg.completed} / ${categoryProg.total} Modules`}
          progressPercentage={view === 'PLAYING' ? 0 : categoryProg.percentage}
          onBackClick={() => {
            if (view === 'LEVEL_SELECT' || view === 'PLAYING' || view === 'RESULT') setView('HOME');
            else onNavigate('quiz');
          }}
        />
      </div>
      <main className={`flex flex-col [gap:var(--space-fluid-xl)] [padding-bottom:var(--space-fluid-section)] ${view !== 'HOME' ? 'items-center justify-center' : ''}`}>

        {/* HOME — level list */}
        {view === 'HOME' && (
          <>
          <SmartHeaderSection
            sectionId="quiz-single-01"
            variant="section"
            align="center"
            gradientFrom="quiz-p"
            gradientTo="quiz-s"
          />
          <div className="w-full max-w-[85rem] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 px-4 animate-in fade-in slide-in-from-bottom-4 duration-700">

            {/* Left column — levels */}
            <div className="lg:col-span-7 flex flex-col [gap:var(--space-fluid-m)]">

              {allCategories.find(c => c.id === categoryId) && (
                <QuizCardCategory
                  category={allCategories.find(c => c.id === categoryId)}
                  progress={getCategoryProgress(categoryId)}
                  onClick={() => { }}
                  hidePlayButton={true}
                  isStatic={true}
                />
              )}

              {quizLevels.length === 0 ? (
                <div className="mineral-panel rounded-2xl [padding:var(--space-fluid-l)] text-center">
                  <Typography variant="paragraphM" color="muted">{t.quiz.noLevels}</Typography>
                </div>
              ) : (
                <div className="grid grid-cols-1 [gap:var(--space-fluid-m)]">
                  {quizLevels.map((lvl, lvlIndex) => {
                    // Il livello 1 (index 0) è sempre sbloccato.
                    // I successivi si sbloccano solo se TUTTI i moduli del livello precedente sono completati.
                    const completedCount = lvl.modules.filter(m => completedModules.includes(m.id)).length;
                    const isFullyCompleted = completedCount > 0 && completedCount === lvl.modules.length;

                    let isLocked = false;
                    if (lvlIndex > 0) {
                      const prevLvl = quizLevels[lvlIndex - 1];
                      const prevCompletedCount = prevLvl.modules.filter(m => completedModules.includes(m.id)).length;
                      isLocked = prevCompletedCount < prevLvl.modules.length;
                    }
                    const isCurrent = !isLocked && !isFullyCompleted;

                    return (
                      <QuizCardLevel
                        key={lvl.id}
                        level={lvl}
                        levelNumber={lvl.display_order || (lvlIndex + 1)}
                        isLocked={isLocked}
                        isCurrent={isCurrent}
                        completedCount={completedCount}
                        onClick={() => {
                          setCurrentLevelId(lvl.id);
                          setView('LEVEL_SELECT');
                        }}
                      />
                    );
                  })}
                </div>
              )}

              {/* Divider and QuizCard added to the left column */}
              <div className="[padding-top:var(--space-fluid-l)]">
                <AkhaThemedLine theme="quiz" />
              </div>

              <div className="w-full [padding-top:var(--space-fluid-m)]">
                <QuizCard
                  title={t.quiz.heritageWalletTitle}
                  description={t.quiz.heritageWalletDesc}
                  awardedBonuses={awardedBonuses}
                  rewards={rewardsList}
                  currentScore={score}
                  onCardClick={() => { }}
                />
              </div>
            </div>

            {/* Right column — sidebar */}
            <div className="lg:col-span-5 flex flex-col [gap:var(--space-fluid-m)]">

              {/* 1. SAVE CTA (Top) */}
              <AkhaThemedLine
                theme="quiz"
                className="py-4"
              />
              <GlassCardFull
                sectionId="quiz-cta-save"
                onNavigate={(path) => onNavigate(path.split('/')[0] || 'home', path.split('/')[1])}
                glassVariant="subtle"
                buttonSize="sm"
                hideImage={true}
                hideSubtitle={true}
                radius="2.5rem"
              />


              {allCategories.filter(c => c.id !== categoryId).length > 0 && (
                <>
                  <AkhaThemedLine
                    theme="quiz"
                    className="py-4"
                  />
                  <div className="flex flex-col [gap:var(--space-fluid-m)]">
                    {allCategories.filter(c => c.id !== categoryId).map(cat => (
                      <QuizCardCategory
                        key={cat.id}
                        category={cat}
                        progress={getCategoryProgress(cat.id)}
                        variant="compact"
                        onClick={(id) => onNavigate('quiz', undefined, id)}
                      />
                    ))}
                  </div>
                </>
              )}


              {/* 2. BOOK CTA (Bottom) */}
              <AkhaThemedLine
                theme="quiz"
                className="py-4"
              />
              <GlassCardFull
                sectionId="quiz-cta-book"
                onNavigate={(path) => onNavigate(path.split('/')[0] || 'home', path.split('/')[1])}
                glassVariant="action"
                buttonSize="sm"
                hideImage={true}
                hideSubtitle={true}
                radius="2.5rem"
              />


              <AkhaThemedLine
                theme="quiz"
                className="py-4"
              />
              <Card variant="glass" padding="lg" rounded="quiz" className="bg-surface/80 border-white/10 relative overflow-hidden">
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
                    variant="action"
                    fullWidth
                    size="sm"
                    icon="arrow_forward"
                    iconPosition="right"
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

          {/* FAQ + Sibling — bottom of HOME view, inside main to use gap:xl correctly */}
          <div className="w-full max-w-8xl mx-auto [padding-inline:var(--space-fluid-m)]">
            <FaqBottomPage slug="akha-wisdom-path-quiz" onNavigate={onNavigate} />
          </div>
          <SiblingInfoSection
            currentSlug="akha-wisdom-path-quiz"
            onNavigate={onNavigate}
            sectionId="sibiling_quiz"
          />
          </>
        )}

        {/* LEVEL_SELECT */}
        {view === 'LEVEL_SELECT' && currentLevel && (
          <LevelQuiz
            level={currentLevel as any}
            levelNumber={currentLevel.display_order || (quizLevels.findIndex(l => l.id === currentLevelId) + 1)}
            completedModules={completedModules}
            perfectModules={perfectModules}
            bestScores={bestScores}
            onStartModule={handleStartModule}
            onBack={() => setView('HOME')}
            categoryImage={currentLevel.image}
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
            onSubmitSelection={handleSubmitSelection}
            onNext={handleNext}
            onBack={() => setView('LEVEL_SELECT')}
            onGetHint={handleAskHint}
            onRetry={handleRetry}
            onLearnMore={handleLearnMore}
            selectedOption={selectedOption}
            showFeedback={showFeedback}
            showExplanations={showExplanations}
            onToggleExplanations={setExplanationPref}
            categoryImage={currentModule.image_url}
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

      </main>

    </PageLayout>
  );
};

export default QuizPageSingle;
