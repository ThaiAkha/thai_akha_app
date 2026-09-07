// ─────────────────────────────────────────────────────────────────────────────
// cherryKnowledge — registro + dispatcher del sapere statico di Cherry.
//
// getStaticKnowledge(text, lang)  → blocchi pertinenti all'intento (chat, per msg).
// getAllStaticKnowledge(lang)     → tutti i blocchi (voce: prompt una volta a sessione).
// getCherryFacts(lang)            → i fatti generati, per chi ne ha bisogno grezzi.
//
// I dati arrivano da `generated/facts.<lang>.ts` (pnpm gen-cherry-facts), un
// import dinamico per lingua con cache in memoria: nessuna query a runtime e nel
// bundle viaggia solo la lingua che serve. Lingua sconosciuta = inglese.
// Aggiungere un argomento: un modulo qui accanto, registrato in CHERRY_KNOWLEDGE.
// ─────────────────────────────────────────────────────────────────────────────

import type { CherryFacts, CherryKnowledgeModule } from './types';
import { CHERRY_FACTS_LOADERS } from './generated';
import { classesModule } from './classes';
import { meetingPointsModule } from './meetingPoints';
import { businessModule } from './business';
import { dishesModule } from './dishes';
import { dietsModule } from './diets';

export type { CherryKnowledgeModule, CherryFacts } from './types';
export { classesModule, meetingPointsModule, businessModule, dishesModule, dietsModule };

/** Registro dei moduli di sapere statico. */
export const CHERRY_KNOWLEDGE: CherryKnowledgeModule[] = [
  classesModule,
  meetingPointsModule,
  businessModule,
  dishesModule,
  dietsModule,
];

const factsCache = new Map<string, Promise<CherryFacts>>();

/** I fatti nella lingua data (inglese se non generata). Una promessa per lingua, condivisa. */
export function getCherryFacts(lang = 'en'): Promise<CherryFacts> {
  const l = Object.prototype.hasOwnProperty.call(CHERRY_FACTS_LOADERS, lang) ? lang : 'en';
  let p = factsCache.get(l);
  if (!p) {
    p = CHERRY_FACTS_LOADERS[l]().catch((err: unknown) => {
      factsCache.delete(l); // un chunk non scaricato non deve restare in cache come fallito
      throw err;
    });
    factsCache.set(l, p);
  }
  return p;
}

/** Moduli il cui intento combacia con il testo. Vuoto se nessuno. */
export function matchKnowledge(text: string): CherryKnowledgeModule[] {
  const hay = (text ?? '').toLowerCase();
  return CHERRY_KNOWLEDGE.filter((m) => m.keywords.some((k) => hay.includes(k)));
}

/** Blocchi pertinenti al testo (intento). Stringa vuota se nessun argomento combacia. */
export async function getStaticKnowledge(text: string, lang = 'en'): Promise<string> {
  const hit = matchKnowledge(text);
  if (hit.length === 0) return '';
  const facts = await getCherryFacts(lang);
  return hit.map((m) => m.build(facts)).join('\n');
}

/** Tutti i blocchi statici concatenati (per la voce, una volta a sessione). */
export async function getAllStaticKnowledge(lang = 'en'): Promise<string> {
  const facts = await getCherryFacts(lang);
  return CHERRY_KNOWLEDGE.map((m) => m.build(facts)).join('\n');
}
