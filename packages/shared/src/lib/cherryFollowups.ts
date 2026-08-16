// ─────────────────────────────────────────────────────────────────────────────
// cherryFollowups — suggerimenti di nodi CONTESTUALI per le risposte AI testuali
//
// Dopo una risposta AI in chat testo, mostriamo 4 pulsanti che riportano
// l'utente nel flusso curato (ragnatela). I 4 nodi sono scelti in base al
// CONTENUTO della conversazione (parole-chiave → nodi rilevanti), con fallback
// a un set di ingresso di default così da avere sempre 4 opzioni.
//
// I nextId puntano a nodi reali di CHAT_FLOW. Cliccando, ChatBox esegue
// l'azione (es. nav_booking) e poi injectStaticExchange(nextId) → flusso nodi.
// ─────────────────────────────────────────────────────────────────────────────

import type { ChatAction, ChatOption } from '../data/cherry/chatFlowTypes';
import { filterOptionsForProfile, type ChatProfileLite } from '../data/cherry/chatFlowTypes';
import { getChatFlow, type ChatLocale } from '../data/cherry/chatFlowI18n';

interface Suggestion {
  nextId: string;
  label: string;
  action?: ChatAction;
  /** Parole-chiave (lowercase) che attivano questo suggerimento. */
  keywords: string[];
  /** Peso di default per il fallback quando nessuna keyword matcha (più alto = prima). */
  weight: number;
  /** Label tradotte per lingua (fallback a `label` se mancante). Da riempire per i18n. */
  labelI18n?: Partial<Record<ChatLocale, string>>;
}

// Catalogo dei nodi suggeribili. Ordine = priorità di fallback (weight).
const SUGGESTIONS: Suggestion[] = [
  {
    nextId: 'INFO_CLASSES', label: '☀️ About the Classes', weight: 9,
    keywords: ['class', 'cooking class', 'lesson', 'course', 'morning', 'evening', 'schedule', 'hands-on', 'learn to cook'],
  },
  {
    nextId: 'MENU_DIET', label: '🍽️ Menu & Diet', weight: 8,
    keywords: ['menu', 'diet', 'vegan', 'vegetarian', 'pescatarian', 'dish', 'eat', 'food', 'meal', 'plant-based'],
  },
  {
    nextId: 'CURRY_SELECTION_INFO', label: '🍛 Curry Options', weight: 6,
    keywords: ['curry', 'paste', 'red curry', 'green curry', 'massaman', 'panang', 'mortar', 'spice', 'spicy', 'chili'],
  },
  {
    nextId: 'ALLERGY_INFO', label: '⚠️ Allergies', weight: 5,
    keywords: ['allergy', 'allergies', 'allergic', 'peanut', 'gluten', 'shellfish', 'dairy', 'egg', 'intolerance', 'nut'],
  },
  {
    nextId: 'AKHA_DISHES_INFO', label: '🌿 Akha Dishes', weight: 5,
    keywords: ['akha dish', 'mountain', 'salad', 'soup', 'herbal', 'sapi thong', 'specialty', 'specialties', 'jungle'],
  },
  {
    nextId: 'AKHA_CULTURE_HUB', label: '⛰️ Akha Culture', weight: 6,
    keywords: ['akha', 'culture', 'hill tribe', 'tradition', 'history', 'zang', 'village', 'heritage', 'spirit', 'festival', 'dress'],
  },
  {
    nextId: 'PICKUP_INFO', label: '🚐 Pickup & Transport', weight: 4,
    keywords: ['pickup', 'pick up', 'transport', 'transfer', 'hotel', 'ride', 'driver', 'how do i get'],
  },
  {
    nextId: 'MEETING_POINT', label: '📍 Meeting Point', weight: 3,
    keywords: ['meeting point', 'where are you', 'address', 'location', 'find you', 'map', 'old city'],
  },
  {
    nextId: 'LEARN_THAI_HUB', label: '🗣️ Learn Thai', weight: 2,
    keywords: ['thai language', 'learn thai', 'word', 'phrase', 'greeting', 'speak thai', 'sawasdee', 'aroi'],
  },
  {
    nextId: 'GIFT_CERTIFICATE', label: '🎁 Gifts', weight: 2,
    keywords: ['gift', 'certificate', 'voucher', 'present', 'surprise'],
  },
  {
    nextId: 'QUIZ_TEASER', label: '🎮 Quiz', weight: 1,
    keywords: ['quiz', 'game', 'test', 'knowledge', 'wisdom', 'play'],
  },
  {
    nextId: 'BOOK_NOW', label: '📅 Book a Class', action: 'nav_booking', weight: 7,
    keywords: ['book', 'booking', 'reserve', 'reservation', 'price', 'cost', 'available', 'availability', 'date', 'how much'],
  },
];

function toOption(s: Suggestion, locale: ChatLocale): ChatOption {
  const label = (locale !== 'en' && s.labelI18n?.[locale]) || s.label;
  return s.action
    ? { label, nextId: s.nextId, action: s.action, priority: 1 }
    : { label, nextId: s.nextId, priority: 2 };
}

/**
 * Sceglie fino a `count` nodi-suggerimento in base al testo della conversazione.
 * - Scoring: somma delle occorrenze di keyword nel testo (lowercase).
 * - I match (score > 0) vengono ordinati per score desc, poi per weight desc.
 * - Se i match sono < count, riempie con i nodi a weight più alto non già scelti.
 * - Salta i nodi assenti da CHAT_FLOW (difensivo) e applica il filtro profilo.
 */
export function getContextualFollowups(
  text: string,
  opts?: { count?: number; profile?: ChatProfileLite | null; locale?: ChatLocale },
): ChatOption[] {
  const count = opts?.count ?? 4;
  const locale = opts?.locale ?? 'en';
  const flow = getChatFlow(locale);
  const haystack = (text ?? '').toLowerCase();

  const scored = SUGGESTIONS
    .filter(s => flow[s.nextId]) // solo nodi realmente esistenti
    .map(s => {
      let score = 0;
      for (const kw of s.keywords) {
        if (haystack.includes(kw)) score += 1;
      }
      return { s, score };
    });

  // Match contestuali, ordinati per pertinenza poi peso
  const matched = scored
    .filter(x => x.score > 0)
    .sort((a, b) => (b.score - a.score) || (b.s.weight - a.s.weight))
    .map(x => x.s);

  // Fallback per riempire fino a `count`: nodi a weight più alto non già scelti
  const chosen: Suggestion[] = [...matched];
  if (chosen.length < count) {
    const fillers = scored
      .map(x => x.s)
      .filter(s => !chosen.includes(s))
      .sort((a, b) => b.weight - a.weight);
    for (const f of fillers) {
      if (chosen.length >= count) break;
      chosen.push(f);
    }
  }

  const options = chosen.slice(0, count).map(s => toOption(s, locale));
  return filterOptionsForProfile(options, opts?.profile);
}
