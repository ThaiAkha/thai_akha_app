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
import { coreModule } from './core';
import { classesModule } from './classes';
import { meetingPointsModule } from './meetingPoints';
import { businessModule } from './business';
import { dishesModule } from './dishes';
import { dietsModule } from './diets';

export type { CherryKnowledgeModule, CherryFacts } from './types';
export { coreModule, classesModule, meetingPointsModule, businessModule, dishesModule, dietsModule };

/** Registro dei moduli di sapere statico. */
export const CHERRY_KNOWLEDGE: CherryKnowledgeModule[] = [
  coreModule,
  classesModule,
  meetingPointsModule,
  businessModule,
  dishesModule,
  dietsModule,
];

const factsCache = new Map<string, Promise<CherryFacts>>();

function loadFacts(l: string): Promise<CherryFacts> {
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

/**
 * I fatti nella lingua data. Lingua non generata = inglese; chunk della lingua
 * non scaricabile (rete, deploy con hash nuovi a scheda aperta) = inglese, con
 * avviso: costa la traduzione, non il fatto. Se cade anche l'inglese, rigetta:
 * il chiamante decide (safeBlock lo tratta come blocco assente).
 */
export function getCherryFacts(lang = 'en'): Promise<CherryFacts> {
  const l = Object.prototype.hasOwnProperty.call(CHERRY_FACTS_LOADERS, lang) ? lang : 'en';
  if (l === 'en') return loadFacts('en');
  return loadFacts(l).catch((err: unknown) => {
    console.warn(`[cherry] fatti "${l}" non caricati, uso l'inglese:`, err);
    return loadFacts('en');
  });
}

/** Moduli da iniettare: quelli sempre presenti piu' quelli il cui intento combacia con il testo. */
export function matchKnowledge(text: string): CherryKnowledgeModule[] {
  const hay = (text ?? '').toLowerCase();
  return CHERRY_KNOWLEDGE.filter((m) => m.always || m.keywords.some((k) => hay.includes(k)));
}

/** Blocchi per il messaggio: il livello base sempre, il dettaglio su intento. */
export async function getStaticKnowledge(text: string, lang = 'en'): Promise<string> {
  const hit = matchKnowledge(text);
  const facts = await getCherryFacts(lang);
  return hit.map((m) => m.build(facts)).join('\n');
}

/**
 * Riga da mettere nel prompt quando i fatti NON si sono caricati: il prompt
 * fisso rimanda ai blocchi generati e vieta i numeri a memoria, quindi
 * l'assenza deve essere detta, non taciuta.
 */
export const STATIC_KNOWLEDGE_UNAVAILABLE =
  '### CORE FACTS unavailable this turn: do not state prices, times, capacity or pickup windows; invite the guest to the Cooking Classes page or to contact the school kha.';

/** Tutti i blocchi statici concatenati (per la voce, una volta a sessione). */
export async function getAllStaticKnowledge(lang = 'en'): Promise<string> {
  const facts = await getCherryFacts(lang);
  return CHERRY_KNOWLEDGE.map((m) => m.build(facts)).join('\n');
}
