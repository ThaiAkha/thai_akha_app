// ─────────────────────────────────────────────────────────────────────────────
// Dati STATICI delle cooking class (fonte: tabella cooking_classes, 2 righe).
// Allineati a class_sessions (prezzi/orari usati da booking & disponibilità).
// Cambiano raramente → hardcoded qui, niente query. Aggiornare se cambiano.
// ─────────────────────────────────────────────────────────────────────────────

import type { CherryKnowledgeModule } from './types';

interface ClassInfo {
  id: 'morning_class' | 'evening_class';
  title: string;
  priceThb: number;
  time: string;
  marketTour: boolean;
  dishes: number;
  capacity: string;
}

export const COOKING_CLASSES: ClassInfo[] = [
  // capacity: fonte vincolante = Terms (legal_documents). Privata fino a 28 (12 cucina
  // A/C · 16 cucina giardino · 17-28 entrambe). NB: cooking_classes.capacity_text nel DB
  // dice ancora "16" → drift DB da correggere lato /database + /terms.
  { id: 'morning_class', title: 'Morning Cooking Class', priceThb: 1400, time: '9:00 am - 2:30 pm', marketTour: true, dishes: 11, capacity: 'up to 12 per class; private groups up to 28' },
  { id: 'evening_class', title: 'Evening Cooking Class', priceThb: 1300, time: '5:00 pm - 9:00 pm', marketTour: false, dishes: 11, capacity: 'up to 12 per class; private groups up to 28' },
];

/** Inclusioni comuni a entrambe le classi (la morning aggiunge il market tour). */
export const CLASS_INCLUSIONS = [
  'free hotel pickup & drop-off',
  'your own individual cooking station',
  'a 40-page colour cookbook',
  'an ingredient gift set',
  'unlimited Akha mountain coffee, water & teas',
  'free wifi',
];

export const classesModule: CherryKnowledgeModule = {
  id: 'classes',
  keywords: [
    'class', 'classes', 'cooking class', 'price', 'cost', 'how much', 'thb', 'baht',
    'include', 'included', 'inclusion', 'what do i get', 'duration', 'how long',
    'what time', 'market tour', 'morning class', 'evening class', 'schedule', 'dishes',
    'cookbook', 'lesson', 'course',
  ],
  build: () => {
    const lines = COOKING_CLASSES.map((c) =>
      `- ${c.title}: ${c.priceThb.toLocaleString('en-US')} THB · ${c.time} · ${c.marketTour ? 'includes a 1-hour local market tour · ' : 'no market tour (straight to cooking) · '}cook ${c.dishes} dishes · capacity ${c.capacity}.`,
    );
    return [
      `### CLASS INFO (authoritative - give prices, times and inclusions from here, never invent):`,
      ...lines,
      `Both classes include: ${CLASS_INCLUSIONS.join(', ')}.`,
      `STYLE: warm; answer exactly what is asked (price / time / what's included). Plain text kha.`,
    ].join('\n');
  },
};
