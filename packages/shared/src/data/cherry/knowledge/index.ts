// ─────────────────────────────────────────────────────────────────────────────
// cherryKnowledge — registro + dispatcher del sapere statico di Cherry.
//
// getStaticKnowledge(text)  → blocchi pertinenti all'intento (chat testo, per msg).
// getAllStaticKnowledge()   → tutti i blocchi (voce: prompt una volta a sessione).
//
// Tutto in-memory, zero query. Aggiungere un argomento: importa il modulo e
// registralo nell'array CHERRY_KNOWLEDGE.
// ─────────────────────────────────────────────────────────────────────────────

import type { CherryKnowledgeModule } from './types';
import { classesModule } from './classes';
import { meetingPointsModule } from './meetingPoints';
import { businessModule } from './business';

export type { CherryKnowledgeModule } from './types';
export * from './classes';
export * from './meetingPoints';
export * from './business';

/** Registro dei moduli di sapere statico. */
export const CHERRY_KNOWLEDGE: CherryKnowledgeModule[] = [
  classesModule,
  meetingPointsModule,
  businessModule,
];

/** Blocchi pertinenti al testo (intento). Vuoto se nessun argomento combacia. */
export function getStaticKnowledge(text: string): string {
  const hay = (text ?? '').toLowerCase();
  return CHERRY_KNOWLEDGE
    .filter((m) => m.keywords.some((k) => hay.includes(k)))
    .map((m) => m.build())
    .join('\n');
}

/** Tutti i blocchi statici concatenati (per la voce, una volta a sessione). */
export function getAllStaticKnowledge(): string {
  return CHERRY_KNOWLEDGE.map((m) => m.build()).join('\n');
}
