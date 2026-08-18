import React, { useState, useEffect } from 'react';
import { QuizLevel, QuizModule, QuizQuestion } from '@thaiakha/shared';
import { cn } from '@thaiakha/shared/lib/utils';
import { Icon, Typography, Button, AkhaPixelPattern } from '../ui';
import Toggle from '../ui/navigation/Toggle';
import { CherryFormatter } from '../chat/CherryFormatter';
import { useMediaAssets } from '../../hooks/useMediaAssets';
import { t } from '../../i18n';
import PhotoGrid from './PhotoGrid';
import { scoreAnswer } from './quizScoring';

interface PlayQuizProps {
  level: QuizLevel;
  module: QuizModule;
  currentQuestionIndex: number;
  totalQuestions: number;
  score: number;
  onAnswer: (option: string) => void;
  /** photo_multi / photo_order — conferma la selezione di indici (lo scoring distingue per tipo). */
  onSubmitSelection: (selectedIndices: number[]) => void;
  onNext: () => void;
  onBack: () => void;
  onGetHint: (question: QuizQuestion) => void;
  /** T8 — retry a pagamento (costo doppio dell'hint) su risposta sbagliata. */
  onRetry?: (question: QuizQuestion) => void;
  /** T8 — "Learn more" → pagina sorgente del modulo (recipes/culture_sections). */
  onLearnMore?: (sourceTable?: string | null, sourceSlug?: string | null) => void;
  selectedOption: string | null;
  showFeedback: boolean;
  /** Preferenza explanation: true=On · false=Off · null=undecided(→On) */
  showExplanations: boolean | null;
  onToggleExplanations: (value: boolean) => void;
  categoryImage?: string;
}

const PlayQuiz: React.FC<PlayQuizProps> = ({
  module,
  currentQuestionIndex,
  totalQuestions,
  score,
  onAnswer,
  onSubmitSelection,
  onNext,
  onBack,
  onGetHint,
  onRetry,
  onLearnMore,
  selectedOption,
  showFeedback,
  showExplanations,
  onToggleExplanations,
  categoryImage
}) => {

  const currentQuestion = module.questions[currentQuestionIndex];
  const canAffordHint = score >= 50;
  // T8 — retry costa il doppio dell'hint (gate XP, niente deduzione, come l'hint).
  const canAffordRetry = score >= 100;

  // photo_multi (insieme) + photo_order (sequenza) condividono UNA selezione a foto: stato
  // locale, reset a ogni domanda. Il toggle è identico (append/rimuovi); lo scoring distingue.
  const questionType = currentQuestion?.questionType ?? 'single';
  const isMulti = questionType === 'photo_multi';
  const isOrder = questionType === 'photo_order';
  const isSelectType = isMulti || isOrder;
  const correctIndices = currentQuestion?.correctIndices ?? [];
  const totalOptions = currentQuestion?.options.length ?? 0;

  const [selection, setSelection] = useState<number[]>([]);
  useEffect(() => { setSelection([]); }, [currentQuestionIndex]);
  const toggleSelection = (i: number) => {
    if (showFeedback) return;
    setSelection(prev => prev.includes(i) ? prev.filter(x => x !== i) : [...prev, i]);
  };

  const selectionCorrect = isSelectType && !!currentQuestion && scoreAnswer(currentQuestion, selection);

  // Difesa: la corretta DEVE essere una label (string). Se per dati stale/malformati
  // arrivasse l'oggetto opzione grezzo, estraggo .label invece di crashare React (#31).
  const correctText: string = (currentQuestion?.correctAnswer as unknown as { label?: string })?.label
    ?? (currentQuestion?.correctAnswer as string)
    ?? '';

  // Reveal: explanation attiva se non esplicitamente Off (null/undecided → On)
  const explanationsOn = showExplanations !== false;
  const answeredWrong = isSelectType
    ? (showFeedback && !selectionCorrect)
    : (selectedOption != null && selectedOption !== correctText);
  // T8 — reveal: testo per giusto vs sbagliato; link "Learn more" se il modulo ha una sorgente.
  const revealText = answeredWrong ? currentQuestion?.explanationWrong : currentQuestion?.explanation;
  const learnMoreSlug = (module as QuizModule).sourceSlug;
  const learnMoreTable = (module as QuizModule).sourceTable;
  const correctIndex = currentQuestion?.options.findIndex(o => o.label === correctText) ?? -1;
  const correctBadge = correctIndex >= 0 ? ['A', 'B', 'C', 'D'][correctIndex] ?? '✓' : '✓';

  // Gameplay foto: il tipo non-'single' usa le foto. Risolvo gli asset_id delle opzioni
  // → URL (media_assets). Hook chiamato SEMPRE (prima del guard) per le regole React.
  const isPhotoType = (currentQuestion?.questionType ?? 'single') !== 'single';
  const optionAssetIds = isPhotoType
    ? (currentQuestion?.options.map(o => o.assetId).filter(Boolean) as string[])
    : [];
  const { assets: optionAssets } = useMediaAssets(optionAssetIds);
  const urlFor = (assetId?: string) => assetId ? optionAssets[assetId]?.url : undefined;
  const correctOption = correctIndex >= 0 ? currentQuestion?.options[correctIndex] : undefined;
  const correctPhotoUrl = correctOption?.assetId ? optionAssets[correctOption.assetId]?.url : undefined;

  // Guard: se la domanda non esiste (modulo vuoto o indice errato) non renderizzare
  if (!currentQuestion) return null;

  return (
    <div className={cn(
      "relative z-10 w-full max-w-[var(--container-page)] mx-auto flex flex-col animate-in fade-in zoom-in-95 duration-500",
      "[padding:var(--space-fluid-m)]"
    )}>


      {/* ── BACKGROUND CINEMATOGRAFICO (PhotoModal Style) ── */}
      {categoryImage && (
        <div className="fixed inset-0 z-[-1] overflow-hidden pointer-events-none bg-black">
          <img
            src={categoryImage}
            alt="Atmosphere"
            className="w-full h-full object-cover opacity-40 transition-opacity duration-1000"
          />
          {/* Layer 2: Subtle secondary tint overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-secondary/20 via-black/20 to-black/0" />

          {/* Overlay gradiente per mantenere leggibilità in alto */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-transparent to-black/20" />
        </div>
      )}

      {/* ── HEADER DOMANDA (Fuori dalla Card, stile PhotoModal) ── */}
      <div key={currentQuestionIndex} className="relative z-20 w-full max-w-5xl mx-auto flex flex-col items-center text-center animate-in fade-in slide-in-from-bottom-4 duration-500 [margin-bottom:var(--space-fluid-m)]">
        {/* Badge Question */}
        <div className="[margin-bottom:var(--space-fluid-s)] inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-quiz-p/10 border border-quiz-p/20 backdrop-blur-md">
          <Icon name="psychology" size="xs" className="text-quiz-p" />
          <Typography variant="microLabel" color="quiz-p" className="font-black uppercase tracking-[0.2em]">
            {t('quiz:questionOf', { current: currentQuestionIndex + 1, total: totalQuestions })}
          </Typography>
        </div>

        {/* Testo Domanda */}
        <Typography
          variant="h3"
          color="title"
          className="font-black leading-tight max-w-4xl drop-shadow-[0_4px_12px_rgba(0,0,0,0.5)] [font-size:var(--text-fluid-h3)]"
        >
          {currentQuestion.text}
        </Typography>

        {/* Divider Akha */}
        <div className="flex justify-center [margin-top:var(--space-fluid-m)]">
          <AkhaPixelPattern variant="line_simple" size={8} theme="history" />
        </div>
      </div>

      {/* ── CARD RISPOSTE (Cinematic Glass) ── */}
      <div className={cn(
        "bg-surface-elevated/40 backdrop-blur-3xl border-2 border-white/10 rounded-[3rem] w-full max-w-5xl mx-auto flex flex-col shadow-2xl relative overflow-hidden z-10",
        "pt-8 md:pt-10 lg:pt-12 px-6 md:px-8 lg:px-12"
      )}>

        {/* Glow Ambientale */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-px bg-gradient-to-r from-transparent via-quiz-p/50 to-transparent blur-[2px]" />

        {/* Foto hero della domanda (1:1) — vale per tutti i tipi, se presente */}
        {currentQuestion.imageUrl && (
          <div className="w-full max-w-xs mx-auto [margin-bottom:var(--space-fluid-m)] rounded-[2rem] overflow-hidden border border-white/10 aspect-square shrink-0">
            <img src={currentQuestion.imageUrl} alt={currentQuestion.text} className="w-full h-full object-cover" />
          </div>
        )}

        {!showFeedback ? (
          /* ── OPZIONI DI RISPOSTA ── */
          <div className="flex-1 w-full flex flex-col items-center justify-start animate-in fade-in slide-in-from-right-4 duration-300 min-h-0 overflow-y-auto no-scrollbar pb-10 pt-4 md:pt-6">
            {isSelectType ? (
              /* photo_multi / photo_order — griglia foto a selezione + Conferma */
              <div className="w-full max-w-3xl mx-auto px-2 shrink-0 flex flex-col [gap:var(--space-fluid-m)]">
                <PhotoGrid
                  options={currentQuestion.options}
                  urlFor={urlFor}
                  questionType={questionType}
                  phase="question"
                  selection={selection}
                  correctIndices={correctIndices}
                  onPick={toggleSelection}
                />
                <Button
                  variant="action"
                  size="lg"
                  fullWidth
                  icon="check_circle"
                  iconPosition="right"
                  disabled={isOrder ? selection.length !== totalOptions : selection.length === 0}
                  onClick={() => onSubmitSelection(selection)}
                >
                  {isOrder
                    ? (selection.length < totalOptions ? `${t('quiz:orderPrompt')} (${selection.length}/${totalOptions})` : t('quiz:confirm'))
                    : (selection.length === 0 ? t('quiz:selectPrompt') : `${t('quiz:confirm')} (${selection.length})`)}
                </Button>
              </div>
            ) : currentQuestion.questionType === 'photo_single' ? (
              /* photo_single — 3 card-foto, scegli 1 (ingredient identification) */
              <div className="w-full max-w-3xl mx-auto px-2 shrink-0">
                <PhotoGrid
                  options={currentQuestion.options}
                  urlFor={urlFor}
                  questionType="photo_single"
                  phase="question"
                  selection={[]}
                  correctIndices={correctIndices}
                  onPick={(i) => onAnswer(currentQuestion.options[i].label)}
                />
              </div>
            ) : (
              /* single — opzioni testuali (default) */
              <div className="flex flex-col [gap:var(--space-fluid-m)] w-full max-w-3xl mx-auto shrink-0 px-2">
                {currentQuestion.options.map((opt, i) => (
                  <button
                    key={i}
                    onClick={() => onAnswer(opt.label)}
                    className={cn(
                      "relative flex items-center [gap:var(--space-fluid-m)] [padding:var(--space-fluid-s)] rounded-[2rem] border transition-all duration-300 group overflow-hidden text-left shadow-lg",
                      "bg-white/5 border-white/10 hover:border-white/30 hover:bg-white/10",
                      "hover:scale-[1.02] active:scale-[0.98] hover:shadow-xl"
                    )}
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    <div className="size-10 rounded-xl border border-white/10 flex items-center justify-center shrink-0 z-10 bg-black/20 text-muted">
                      <Typography variant="microLabel" className="font-mono font-bold">{['A', 'B', 'C', 'D'][i] ?? ''}</Typography>
                    </div>
                    <Typography variant="h4" color="title" className="flex-grow z-10 leading-snug group-hover:translate-x-1 transition-transform">
                      {opt.label}
                    </Typography>
                  </button>
                ))}
              </div>
            )}
          </div>
        ) : (
          /* ── REVEAL POST-RISPOSTA: corretta-in-alto + explanation + Next ── */
          <div className="flex-1 w-full flex flex-col items-center justify-start animate-in fade-in slide-in-from-bottom-4 duration-500 min-h-0 overflow-y-auto no-scrollbar pb-10 pt-4 md:pt-6">
            <div className="flex flex-col [gap:var(--space-fluid-m)] w-full max-w-3xl mx-auto shrink-0 px-2">

              {isSelectType ? (
                /* ── REVEAL photo_multi / photo_order: verdetto + griglia stati (PhotoGrid) ── */
                <div className="w-full shrink-0">
                  <div className="flex items-center justify-center [gap:var(--space-fluid-xs)] [margin-bottom:var(--space-fluid-m)]">
                    <Icon name={selectionCorrect ? "check_circle" : "info"} size="md" className={selectionCorrect ? "text-action" : "text-primary"} />
                    <Typography variant="microLabel" className={cn("font-black uppercase tracking-[0.2em]", selectionCorrect ? "text-action" : "text-primary")}>
                      {selectionCorrect ? t('quiz:correctLabel') : t('quiz:notQuite')}
                    </Typography>
                  </div>
                  <PhotoGrid
                    options={currentQuestion.options}
                    urlFor={urlFor}
                    questionType={questionType}
                    phase="reveal"
                    selection={selection}
                    correctIndices={correctIndices}
                  />
                </div>
              ) : (
                <>
                  {/* Risposta corretta in alto */}
                  <div className="relative flex items-center [gap:var(--space-fluid-m)] [padding:var(--space-fluid-s)] rounded-[2rem] border border-action bg-action/20 shadow-[0_0_40px_-10px_var(--color-action)] ring-1 ring-action/50 animate-in slide-in-from-top-2 duration-500">
                    <div className="size-12 rounded-xl border border-white/10 flex items-center justify-center shrink-0 bg-action text-white overflow-hidden">
                      {isPhotoType && correctPhotoUrl
                        ? <img src={correctPhotoUrl} alt={correctText} className="w-full h-full object-cover" />
                        : <Typography variant="microLabel" className="font-mono font-bold">{correctBadge}</Typography>}
                    </div>
                    <Typography variant="h4" color="title" className="flex-grow leading-snug">{correctText}</Typography>
                    <Icon name="check_circle" className="text-action shrink-0" size="lg" />
                  </div>

                  {/* La tua risposta (se sbagliata) */}
                  {answeredWrong && (
                    <div className="flex items-center [gap:var(--space-fluid-xs)] px-3 -mt-1">
                      <Icon name="cancel" size="sm" className="text-primary shrink-0" />
                      <Typography variant="caption" color="muted">
                        {t('quiz:yourAnswer')}: <span className="text-primary/80 line-through">{selectedOption}</span>
                      </Typography>
                    </div>
                  )}
                </>
              )}

              {/* Pannello explanation — giusto (congrats) vs sbagliato (supporto, spoiler-free) */}
              {explanationsOn && revealText && (
                <div className={cn(
                  "rounded-[2rem] [padding:var(--space-fluid-m)] flex flex-col [gap:var(--space-fluid-s)] animate-in fade-in slide-in-from-bottom-2 duration-500 border",
                  answeredWrong ? "border-primary/20 bg-primary/5" : "border-quiz-p/20 bg-quiz-p/5",
                )}>
                  <div className="flex items-center [gap:var(--space-fluid-xs)]">
                    <Icon name={answeredWrong ? "volunteer_activism" : "menu_book"} size="sm" className={answeredWrong ? "text-primary" : "text-quiz-p"} />
                    <Typography variant="microLabel" color={answeredWrong ? "primary" : "quiz-p"} className="font-black uppercase tracking-[0.2em]">
                      {answeredWrong ? t('quiz:keepGoingLabel') : t('quiz:explanationLabel')}
                    </Typography>
                  </div>
                  <CherryFormatter text={revealText} className="text-desc" />

                  {/* Learn more → pagina sorgente del modulo (graceful se assente) */}
                  {learnMoreSlug && onLearnMore && (
                    <button
                      onClick={() => onLearnMore(learnMoreTable, learnMoreSlug)}
                      className="group inline-flex items-center [gap:var(--space-fluid-2xs)] w-fit mt-1 [padding-inline:var(--space-fluid-s)] [padding-block:var(--space-fluid-2xs)] rounded-full border border-ocean-blue/30 bg-ocean-blue/5 hover:bg-ocean-blue/10 hover:border-ocean-blue/50 transition-all"
                    >
                      <Icon name="auto_stories" size="xs" className="text-ocean-blue" />
                      <Typography as="span" variant="microLabel" className="font-black uppercase tracking-[0.2em] text-ocean-blue">
                        {t('quiz:learnMore')}
                      </Typography>
                      <span className="material-symbols-outlined text-sm text-ocean-blue group-hover:translate-x-0.5 transition-transform">arrow_forward</span>
                    </button>
                  )}
                </div>
              )}

              {/* Azioni: retry (solo se sbagliata) + Next */}
              <div className="flex flex-col items-center [gap:var(--space-fluid-xs)] pt-2 pb-2">
                {answeredWrong && onRetry && !isSelectType && (
                  <button
                    onClick={() => onRetry(currentQuestion)}
                    disabled={!canAffordRetry}
                    className={cn(
                      "flex items-center [gap:var(--space-fluid-xs)] [padding-inline:var(--space-fluid-m)] [padding-block:var(--space-fluid-xs)] rounded-full transition-all border",
                      canAffordRetry
                        ? "bg-primary/10 border-primary/30 text-primary hover:bg-primary hover:text-white hover:shadow-[0_0_20px_-5px_var(--color-primary)]"
                        : "bg-white/5 border-transparent text-muted cursor-not-allowed",
                    )}
                  >
                    <Icon name="restart_alt" size="xs" />
                    <Typography variant="microLabel" className="font-black uppercase tracking-[0.2em]">{t('quiz:retryWithCherry')}</Typography>
                  </button>
                )}
                <Button variant="action" size="md" icon="arrow_forward" iconPosition="right" onClick={onNext}>
                  {t('quiz:next')}
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* ── FOOTER PERSISTENTE (posizione fissa in ogni stato): Hint + Explanation switch ── */}
        <div className="flex justify-between items-center w-full mt-auto border-t border-white/5 [padding-top:var(--space-fluid-s)] [padding-bottom:var(--space-fluid-s)] [padding-inline:var(--space-fluid-s)] [gap:var(--space-fluid-s)] shrink-0">
          <button
            onClick={() => canAffordHint && !showFeedback && onGetHint(currentQuestion)}
            disabled={!canAffordHint || showFeedback}
            className={cn(
              "flex items-center [gap:var(--space-fluid-xs)] [padding-inline:var(--space-fluid-m)] [padding-block:var(--space-fluid-xs)] rounded-full transition-all border",
              canAffordHint && !showFeedback
                ? "bg-action/10 border-action/20 text-action hover:bg-action hover:text-black hover:shadow-[0_0_20px_-5px_rgba(152,201,60,0.4)]"
                : "bg-white/5 border-transparent text-muted cursor-not-allowed"
            )}
          >
            <Icon name="lightbulb" size="xs" />
            <Typography variant="microLabel" className="font-black uppercase tracking-[0.2em]">{t('quiz:requestHint')}</Typography>
          </button>

          {/* Switch Explanation — sempre qui, identico su domanda e reveal */}
          <Toggle checked={explanationsOn} onChange={onToggleExplanations} label={t('quiz:explanationLabel')} />
        </div>
      </div>

      {/* ── FOOTER ABORT MISSION ── */}
      <div className="pointer-events-auto flex justify-center w-full [margin-top:var(--space-fluid-l)] relative z-50">
        <Button
          variant="outline"
          size="sm"
          icon="close"
          onClick={onBack}
          className="text-action border-action/30 hover:bg-action/10 hover:border-action/50 transition-all"
        >
          {t('quiz:abort')}
        </Button>
      </div>
    </div>
  );
};

export default PlayQuiz;