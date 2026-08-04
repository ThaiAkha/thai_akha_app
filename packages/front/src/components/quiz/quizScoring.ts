import type { QuizQuestion } from '@thaiakha/shared';

/** Insiemi di indici uguali (ordine irrilevante) — scoring photo_multi. */
export const sameSet = (a: number[], b: number[]) => a.length === b.length && a.every(x => b.includes(x));

/** Sequenze di indici uguali (ordine RILEVANTE) — scoring photo_order. */
export const arraysEqualOrdered = (a: number[], b: number[]) => a.length === b.length && a.every((x, i) => x === b[i]);

/** Risposta unificata: label scelta (single / photo_single) o indici (photo_multi / photo_order). */
export type QuizAnswer = string | number[];

/**
 * Unica fonte di verità per la correttezza, keyed su `questionType`.
 * - single / photo_single → la label scelta == `correctAnswer`
 * - photo_multi          → set-equality vs `correctIndices` (tutto-o-niente)
 * - photo_order          → sequenza esatta vs `correctIndices`
 */
export function scoreAnswer(question: QuizQuestion, answer: QuizAnswer): boolean {
  const correct = question.correctIndices ?? [];
  switch (question.questionType) {
    case 'photo_multi': return Array.isArray(answer) && sameSet(answer, correct);
    case 'photo_order': return Array.isArray(answer) && arraysEqualOrdered(answer, correct);
    default:            return typeof answer === 'string' && answer === question.correctAnswer;
  }
}
