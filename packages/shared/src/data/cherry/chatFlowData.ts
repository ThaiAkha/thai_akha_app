// ─────────────────────────────────────────────────────────────────────────────
// CHERRY CHAT FLOW — Thai Akha Kitchen · AGGREGATORE
// Ragnatela system: P1 (Booking & Logistics) · P2 (Menu & Experience) · P3 (Culture & Discovery)
//
// Questo file NON contiene più i nodi: li assembla dai moduli per tema in
// askCherry_*.ts. Per aggiungere domande/risposte, modifica il modulo giusto.
// I tipi vivono in chatFlowTypes.ts e sono ri-esportati qui per retro-compatibilità.
//
//   askCherry_General   → ROOT, Pickup, Meeting Point, Booking, Gifts
//   askCherry_Classes   → Morning / Evening class
//   askCherry_Recipes   → Menu, Diete, Allergie, Akha dishes, Curry
//   askCherry_News      → Guide pratiche How-To
//   askCherry_History   → Cultura Akha, Zang, Dress, Festival, Spirit Gate, Philosophy, Origins, Learn Thai
//   askCherry_Quiz      → Akha Wisdom Path teaser
//
// Last updated: 2026-06-08
// ─────────────────────────────────────────────────────────────────────────────

import type { ChatNode, ChatOption } from './chatFlowTypes';
import { flowGeneral } from './askCherry_General';
import { flowClasses } from './askCherry_Classes';
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

// ─── Random option pool (shown when hasRandomOption: true) ────────────────────
export const RANDOM_CHAT_OPTIONS: ChatOption[] = [
  { label: '🎁 Gifts & Certificate', nextId: 'GIFT_CERTIFICATE' },
  { label: '⛰️ Akha Culture',        nextId: 'AKHA_CULTURE_HUB' },
  { label: '📍 Meeting Point',        nextId: 'MEETING_POINT' },
  { label: '🗣️ Learn Thai',           nextId: 'LEARN_THAI_HUB' },
  { label: '🎮 Play Quiz',            nextId: 'QUIZ_TEASER' },
  { label: '🌿 Akha Dishes',          nextId: 'AKHA_DISHES_INFO' },
];

// ─────────────────────────────────────────────────────────────────────────────
// CHAT FLOW — merge trasparente di tutti i moduli
// ─────────────────────────────────────────────────────────────────────────────
export const CHAT_FLOW: Record<string, ChatNode> = {
  ...flowGeneral,
  ...flowClasses,
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
