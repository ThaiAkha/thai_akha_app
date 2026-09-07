// ─────────────────────────────────────────────────────────────────────────────
// CHERRY CHAT FLOW — Thai Akha Kitchen · AGGREGATORE
// Ragnatela system: P1 (Booking & Logistics) · P2 (Menu & Experience) · P3 (Culture & Discovery)
//
// Questo file NON contiene più i nodi: li assembla dai moduli per tema in
// askCherry_*.ts. Per aggiungere domande/risposte, modifica il modulo giusto.
// I tipi vivono in chatFlowTypes.ts e sono ri-esportati qui per retro-compatibilità.
//
//   askCherry_General   → ROOT, BOOK_NOW, GIFT_CERTIFICATE (ROOT e GIFT_CERTIFICATE sono
//                         sovrascritti dalle bozze L1/L2, che vincono sui nodi omonimi)
//   _drafts/askCherry_L1, L2, L3 → i nodi VIVI del nuovo standard: classi, pickup, punto
//                         d'incontro, hub. Non portano numeri: prezzi e orari li dice
//                         Cherry dai fatti generati (knowledge/generated).
//   (askCherry_Classes rimosso il 2026-09-07: i suoi tre nodi erano oscurati dalle bozze e
//   portavano orari e prezzi vecchi)
//   askCherry_Recipes   → Menu, Diete, Allergie, Akha dishes, Curry
//   askCherry_News      → Guide pratiche How-To
//   askCherry_History   → Cultura Akha, Zang, Dress, Festival, Spirit Gate, Philosophy, Origins, Learn Thai
//   askCherry_Quiz      → Akha Wisdom Path teaser
//
// Last updated: 2026-06-08
// ─────────────────────────────────────────────────────────────────────────────

import type { ChatNode } from './chatFlowTypes';
import { flowGeneral } from './askCherry_General';
import { flowRecipes } from './askCherry_Recipes';
import { flowNews } from './askCherry_News';
import { flowHistory } from './askCherry_History';
import { flowQuiz } from './askCherry_Quiz';
import { flowHomeDemo } from './askCherry_HomeDemo';
// Draft riscritti al nuovo standard (L1 neutro · L2 filtrato+media · L3 ricco-terminale).
// Spread DOPO i moduli storici → vincono sui nodi omonimi e aggiungono i nuovi
// hub condivisi (FLAVOURS_HUB, PLAN_VISIT, RECIPE_TECHNIQUE, ING_*, *_L2/*_L3).
import { flowL1 } from './_drafts/askCherry_L1';
import { flowL2 } from './_drafts/askCherry_L2';
import { flowL3 } from './_drafts/askCherry_L3';

// Ri-esporta i tipi (ChatNodeId, ChatAction, ChatOption, ChatNode, validateChatFlow…)
// così gli import esistenti da './chatFlowData' continuano a funzionare.
export * from './chatFlowTypes';

// Ri-esporta la micro-CTA rotante per-livello (getCherryCTA / CtaLevel) così i
// componenti la importano dal sottopercorso già esposto './data/chatFlowData'
// senza aggiungere una nuova entry alla exports map.
export { getCherryCTA } from './cherryCTAs';
export type { CtaLevel } from './cherryCTAs';

// ─────────────────────────────────────────────────────────────────────────────
// CHAT FLOW — merge trasparente di tutti i moduli
// ─────────────────────────────────────────────────────────────────────────────
export const CHAT_FLOW: Record<string, ChatNode> = {
  ...flowGeneral,
  ...flowRecipes,
  ...flowNews,
  ...flowHistory,
  ...flowQuiz,
  ...flowHomeDemo,
  // Draft al nuovo standard — override dei nodi omonimi + nuovi hub condivisi.
  ...flowL1,
  ...flowL2,
  ...flowL3,
};
