/**
 * Quiz single - stato di gioco, progressi (localStorage + profilo attivo), premi, hint/retry.
 * Estratto da QuizPageSingle.tsx (#16 split monstre) a comportamento invariato: la pagina e le
 * viste ricevono questo oggetto.
 */
import { useState, useMemo, useEffect } from 'react';
import { supabase } from '@thaiakha/shared/lib/supabase';
import { scoreAnswer, type QuizAnswer } from '../../components/quiz/quizScoring';
import { contentService } from '@thaiakha/shared/services';
import { QuizLevel, QuizQuestion, type QuizRewardDB, type ContentCategoryDB, type QuizOption, type QuizQuestionType } from '@thaiakha/shared';
import type { NodeBlock } from '@thaiakha/shared/data';

// Raw shape returned by contentService.getQuizData (game.service normalizes most fields,
// legacy snake_case aliases are kept because the adapter below still reads them).
type RawQuizQuestion = {
  id: string; text: string; explanation: string;
  options?: QuizOption[]; correctAnswer?: string; questionType?: QuizQuestionType;
  imageUrl?: string | null; correctIndices?: number[] | null; points?: number;
  hint_prompt?: string | null; hintPrompt?: string | null;
  hint_response?: string | null; hintResponse?: string | null;
  hint_blocks?: NodeBlock[] | null; hintBlocks?: NodeBlock[] | null;
  explanation_wrong?: string | null; explanationWrong?: string | null;
};
type RawQuizModule = {
  id: string; title: string; icon_name?: string; icon: string; theme_color?: string; theme: string;
  image_url?: string | null; source_table?: string | null; sourceTable?: string | null;
  source_slug?: string | null; sourceSlug?: string | null; questions?: RawQuizQuestion[];
};
type RawQuizLevel = {
  id: number; title: string; subtitle: string; image_url: string; reward_id?: number;
  completion_bonus?: number; display_order?: number; displayOrder?: number; modules?: RawQuizModule[];
};
import { t } from '../../i18n';
import { useQuizProgress } from '../../hooks/useQuizProgress';
import { useActiveProfile } from '../../context/ActiveProfileContext';
import {
  PROGRESS_KEY, EXPLANATIONS_KEY, getLocalExplanations, saveLocalScore, getLocalScore, syncProgressToSupabase, type View,
} from './quizStorage';

export function useQuizGame(categoryId: string, onNavigate: (page: string, topic?: string, sectionId?: string) => void) {
  // --- Data state ---
  const [quizLevels, setQuizLevels] = useState<QuizLevel[]>([]);
  const [quizRewards, setQuizRewards] = useState<QuizRewardDB[]>([]);
  const [allCategories, setAllCategories] = useState<ContentCategoryDB[]>([]);
  const [loading, setLoading] = useState(true);
  const [categoryTitle, setCategoryTitle] = useState<string>(t('quiz:spiritQuizTitle'));
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
          // Cast once: the service returns Record<string, unknown>[] (see RawQuizLevel above)
          const adaptedLevels: QuizLevel[] = (dbData as RawQuizLevel[]).map((l) => ({
            id: l.id,
            title: l.title,
            subtitle: l.subtitle,
            image: l.image_url,
            rewardId: l.reward_id,
            completion_bonus: l.completion_bonus ?? 0,
            display_order: l.display_order ?? l.displayOrder ?? 0,
            modules: (l.modules ?? []).map((m) => ({
              id: m.id,
              title: m.title,
              icon: m.icon_name ?? m.icon,
              theme: m.theme_color ?? m.theme,
              image_url: m.image_url,
              // T8 — link "Learn more" del reveal (pagina sorgente del modulo).
              sourceTable: m.source_table ?? m.sourceTable ?? null,
              sourceSlug: m.source_slug ?? m.sourceSlug ?? null,
              questions: (m.questions ?? []).map((q) => ({
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
    if (score < 50) { alert(t('quiz:notEnoughXp')); return; }
    spendXp(50);            // ← FIX: addebita davvero −50 XP
    dispatchHint(question);
  };

  // T8 — "Ask Cherry & Retry": riapre la stessa domanda al costo doppio dell'hint.
  // Possibile perché explanation_wrong NON spoilera la risposta corretta.
  const handleRetry = (question: QuizQuestion) => {
    if (score < 100) { alert(t('quiz:notEnoughXpRetry')); return; }
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

  return {
    quizLevels, setQuizLevels, quizRewards, setQuizRewards, allCategories, setAllCategories, loading, setLoading, categoryTitle, setCategoryTitle, view, setView, score, setScore, completedModules, setCompletedModules, perfectModules, setPerfectModules, bestScores, setBestScores, awardedBonuses, setAwardedBonuses, currentLevelId, setCurrentLevelId, currentModuleId, setCurrentModuleId, currentQuestionIndex, setCurrentQuestionIndex, sessionScore, setSessionScore, showFeedback, setShowFeedback, selectedOption, setSelectedOption, sessionAnswers, setSessionAnswers, showExplanations, setShowExplanations, spentXp, setSpentXp, managedId, computeGross, computeBonuses, saveProgress, setExplanationPref, currentLevel, currentModule, maxTotalScore, rewardsList, handleStartModule, recordAnswer, handleAnswer, handleSubmitSelection, handleNext, finishModule, spendXp, dispatchHint, handleAskHint, handleRetry, handleLearnMore, categoryProg, getCategoryProgress, activeProfileId, isActingAsManaged,
  };
}

export type QuizGameState = ReturnType<typeof useQuizGame>;
