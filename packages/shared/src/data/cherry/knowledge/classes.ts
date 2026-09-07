// ─────────────────────────────────────────────────────────────────────────────
// Classi: prezzi, orari, cronologia, inclusioni, capienza. Dati da CherryFacts
// (generati dal database: cooking_classes + class_sessions + sidecar). Qui solo
// la forma del blocco. Le parole chiave restano inglesi come il prompt.
// ─────────────────────────────────────────────────────────────────────────────

import type { CherryKnowledgeModule, CherryFacts, CherryFactsClass } from './types';

const thb = (n: number) => n.toLocaleString('en-US');

function classLine(c: CherryFactsClass): string {
  const tour = c.marketTour
    ? `includes a 1-hour local market tour ${c.marketTour.start}-${c.marketTour.end}`
    : c.hasMarketTour ? 'includes a local market tour' : 'no market tour (straight to cooking)';
  const head = `- ${c.title}${c.badge ? ` (${c.badge})` : ''}: ${thb(c.priceThb)} ${c.currency} ${c.unit} · ${c.startTime}-${c.endTime}${c.durationText ? ` (${c.durationText})` : ''} · ${tour}${c.capacityText ? ` · capacity: ${c.capacityText}` : ''}.`;
  const timeline = c.schedule.length ? `  Timeline: ${c.schedule.map((s) => `${s.label} ${s.time}`).join('; ')}.` : '';
  const walkIn = c.walkIn.length ? `  Walk-in (no pickup): ${c.walkIn.map((w) => `${w.name} at ${w.time}`).join('; ')}.` : '';
  const includes = c.inclusions.length ? `  Includes: ${c.inclusions.join(', ')}.` : '';
  return [head, timeline, walkIn, includes].filter(Boolean).join('\n');
}

export const classesModule: CherryKnowledgeModule = {
  id: 'classes',
  keywords: [
    'class', 'classes', 'cooking class', 'price', 'cost', 'how much', 'thb', 'baht',
    'include', 'included', 'inclusion', 'what do i get', 'duration', 'how long',
    'what time', 'market tour', 'morning class', 'evening class', 'schedule', 'dishes',
    'cookbook', 'lesson', 'course', 'capacity', 'how many', 'group', 'private',
  ],
  build: (facts: CherryFacts) => [
    `### CLASS INFO (authoritative - give prices, times, timeline and inclusions from here, never invent; zone pickup windows are in CORE FACTS):`,
    ...facts.classes.map(classLine),
    `STYLE: warm; answer exactly what is asked (price / time / what's included). Plain text kha.`,
  ].join('\n'),
};
