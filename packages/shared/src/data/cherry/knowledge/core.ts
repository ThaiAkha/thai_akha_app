// ─────────────────────────────────────────────────────────────────────────────
// CORE FACTS: il livello sempre presente. Prezzi, orari, capienza, zone di
// pickup con le finestre, contatti. Poche righe, in OGNI messaggio e nella voce:
// il prompt fisso rimanda ai blocchi generati e non deve mai trovarli assenti.
// I dettagli (cronologia, inclusioni, punti di ritrovo, menu, diete) restano
// nei moduli a intento.
// ─────────────────────────────────────────────────────────────────────────────

import type { CherryKnowledgeModule, CherryFacts } from './types';

const thb = (n: number) => n.toLocaleString('en-US');
const win = (w: { from: string; to: string } | null) => (w ? `${w.from}-${w.to}` : 'n/a');

export const coreModule: CherryKnowledgeModule = {
  id: 'core',
  always: true,
  keywords: [],
  build: (facts: CherryFacts) => {
    const classes = facts.classes
      .map((c) => `${c.title} ${thb(c.priceThb)} ${c.currency} ${c.unit}, ${c.startTime}-${c.endTime}, ${c.marketTour ? `with a 1-hour market tour ${c.marketTour.start}-${c.marketTour.end}` : c.hasMarketTour ? 'with a market tour' : 'no market tour'}`)
      .join('; ');
    const capacity = facts.classes.find((c) => c.capacityText)?.capacityText;
    const zones = facts.pickupZones.map((z) => `${z.name} ${win(z.morning)} / ${win(z.evening)}`).join('; ');
    const b = facts.business;
    const contact = [b.telephone ? `${b.telephone} (phone/WhatsApp)` : null, b.email].filter(Boolean).join(', ');
    return [
      `### CORE FACTS (authoritative, always valid - never quote other numbers from memory):`,
      `Classes: ${classes}.${capacity ? ` Capacity: ${capacity}.` : ''}`,
      zones ? `Free hotel pickup zones, morning / evening windows (exact time depends on the hotel): ${zones}.` : '',
      contact ? `Contact: ${contact}. Address: ${b.address}.` : `Address: ${b.address}.`,
    ].filter(Boolean).join('\n');
  },
};
