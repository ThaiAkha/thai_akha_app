import React from 'react';
import { cn } from '@thaiakha/shared/lib/utils';
import type { QuizOption, QuizQuestionType } from '@thaiakha/shared';
import { Icon, Typography } from '../ui';
import { t } from '../../i18n';

/**
 * Griglia foto unica per i gameplay a foto (photo_single / photo_multi / photo_order),
 * sia in fase domanda che reveal. Sostituisce i blocchi JSX paralleli di PlayQuiz a
 * comportamento/UI invariati. La risoluzione foto (asset_id → url) arriva da `urlFor`.
 */
interface PhotoGridProps {
  options: QuizOption[];
  urlFor: (assetId?: string) => string | undefined;
  questionType: QuizQuestionType;
  phase: 'question' | 'reveal';
  /** Selezione tenuta (multi/order). Per photo_single è `[]`. */
  selection: number[];
  correctIndices: number[];
  /** Solo in fase domanda: single = submit immediato · multi/order = toggle. */
  onPick?: (i: number) => void;
}

const CardImg: React.FC<{ url?: string; alt: string }> = ({ url, alt }) =>
  url
    ? <img src={url} alt={alt} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
    : <div className="w-full h-full flex items-center justify-center bg-black/30"><Icon name="image" size="lg" className="text-muted" /></div>;

const CardLabel: React.FC<{ label: string; small?: boolean }> = ({ label, small }) => (
  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent [padding:var(--space-fluid-s)] pt-8 text-left">
    <Typography variant="badge" className={cn("text-white font-bold drop-shadow", small && "text-xs")}>{label}</Typography>
  </div>
);

const PhotoGrid: React.FC<PhotoGridProps> = ({ options, urlFor, questionType, phase, selection, correctIndices, onPick }) => {
  const isSingle = questionType === 'photo_single';
  const isOrder = questionType === 'photo_order';
  // gap: photo_single domanda usa fluid-m; ogni altro caso fluid-s (UI invariata).
  const gap = isSingle && phase === 'question' ? '[gap:var(--space-fluid-m)]' : '[gap:var(--space-fluid-s)]';

  return (
    <div className={cn("grid grid-cols-2 sm:grid-cols-3", gap)}>
      {options.map((opt, i) => {
        const url = urlFor(opt.assetId);

        // ── REVEAL ──────────────────────────────────────────────────────────
        if (phase === 'reveal') {
          if (isOrder) {
            const correctPos = correctIndices.indexOf(i); // posizione giusta (0-based)
            const hit = correctPos >= 0 && correctPos === selection.indexOf(i);
            return (
              <div key={i} className={cn(
                "relative rounded-[2rem] overflow-hidden border-2 aspect-square transition-all",
                hit ? "border-action ring-2 ring-action/60" : "border-primary ring-2 ring-primary/60"
              )}>
                <CardImg url={url} alt={opt.label} />
                {correctPos >= 0 && (
                  <div className={cn("absolute top-2 right-2 size-8 rounded-full flex items-center justify-center z-10 text-white font-mono font-bold text-sm", hit ? "bg-action" : "bg-primary")}>
                    {correctPos + 1}
                  </div>
                )}
                <CardLabel label={opt.label} small />
              </div>
            );
          }
          // photo_multi reveal: giusti (verde) · intrusi scelti (rosso) · mancati (ambra)
          const belongs = correctIndices.includes(i);
          const picked = selection.includes(i);
          const hit = belongs && picked;
          const wrongPick = !belongs && picked;
          const missed = belongs && !picked;
          return (
            <div key={i} className={cn(
              "relative rounded-[2rem] overflow-hidden border-2 aspect-square transition-all",
              hit ? "border-action ring-2 ring-action/60" :
              wrongPick ? "border-primary ring-2 ring-primary/60" :
              missed ? "border-amber-400/70 ring-2 ring-amber-400/40" :
              "border-white/10 opacity-40 grayscale"
            )}>
              <CardImg url={url} alt={opt.label} />
              {(hit || wrongPick || missed) && (
                <div className={cn("absolute top-2 right-2 size-8 rounded-full flex items-center justify-center z-10 text-white", hit ? "bg-action" : wrongPick ? "bg-primary" : "bg-amber-400")}>
                  <Icon name={hit ? "check" : wrongPick ? "close" : "priority_high"} size="xs" />
                </div>
              )}
              <CardLabel label={opt.label} small />
            </div>
          );
        }

        // ── QUESTION ────────────────────────────────────────────────────────
        // #126: in fase domanda niente label visibile e alt NEUTRO — il nome
        // dell'opzione (ingrediente/ricetta) e' spesso la risposta: non deve
        // stare nel DOM prima del reveal. Al reveal tornano nome e alt veri.
        if (isSingle) {
          return (
            <button key={i} onClick={() => onPick?.(i)}
              className="group relative rounded-[2rem] overflow-hidden border-2 border-white/10 bg-white/5 hover:border-quiz-p/60 hover:scale-[1.03] active:scale-[0.98] transition-all shadow-lg aspect-square">
              <CardImg url={url} alt={t('quiz:photoAlt')} />
              <div className="absolute top-2 left-2 size-7 rounded-lg bg-black/40 backdrop-blur flex items-center justify-center z-10">
                <Typography variant="microLabel" className="font-mono font-bold text-white">{['A', 'B', 'C', 'D'][i] ?? ''}</Typography>
              </div>
            </button>
          );
        }
        // photo_multi / photo_order domanda — toggle; badge: check (multi) o numero (order)
        const pos = selection.indexOf(i);
        const sel = pos >= 0;
        return (
          <button key={i} onClick={() => onPick?.(i)}
            className={cn(
              "group relative rounded-[2rem] overflow-hidden border-2 transition-all shadow-lg aspect-square",
              sel
                ? "border-quiz-p ring-2 ring-quiz-p/60 scale-[0.97] shadow-[0_0_30px_-8px_var(--color-quiz-p)]"
                : "border-white/10 hover:border-quiz-p/40 hover:scale-[1.02] active:scale-[0.98]"
            )}>
            <CardImg url={url} alt={t('quiz:photoAlt')} />
            <div className={cn(
              "absolute top-2 right-2 size-8 rounded-full flex items-center justify-center transition-all z-10 border",
              isOrder && "font-mono font-bold text-sm",
              sel ? "bg-quiz-p border-quiz-p text-white scale-100" : cn("bg-black/40 border-white/20 scale-90", isOrder ? "text-white/50" : "text-white/60")
            )}>
              {isOrder ? (sel ? pos + 1 : '+') : <Icon name={sel ? "check" : "add"} size="xs" />}
            </div>
          </button>
        );
      })}
    </div>
  );
};

export default PhotoGrid;
