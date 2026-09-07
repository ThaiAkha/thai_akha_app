// ─────────────────────────────────────────────────────────────────────────────
// Punti di ritrovo: walk-in, punti di pickup designati, riconsegne. Dati da
// CherryFacts (meeting_points + sidecar). I link mappa restano fuori dal prompt:
// la posizione esatta la mostra la pagina della mappa.
// ─────────────────────────────────────────────────────────────────────────────

import type { CherryKnowledgeModule, CherryFacts, CherryFactsMeetingPoint } from './types';

const window = (w: { from: string; to: string | null } | null) => (w ? (w.to ? `${w.from}-${w.to}` : w.from) : null);
/** Le descrizioni del DB finiscono col punto: si toglie, il separatore lo mette la riga. */
const tidy = (s: string) => s.trim().replace(/[.\s]+$/, '');

function times(p: CherryFactsMeetingPoint): string {
  const parts = [window(p.morning) ? `morning ${window(p.morning)}` : null, window(p.evening) ? `evening ${window(p.evening)}` : null].filter(Boolean);
  return parts.length ? ` (${parts.join(', ')})` : '';
}

export const meetingPointsModule: CherryKnowledgeModule = {
  id: 'meeting_points',
  keywords: [
    'meeting point', 'meet you', 'where do we meet', 'where to meet', 'meet at',
    'walk in', 'walk-in', 'come to the school', 'wat pan', 'maya', 'central festival',
    'tha phae', 'train station', 'north gate', 'outside zone', 'outside the zone',
    'airport', 'drop off', 'drop-off', 'dropoff', 'night market', 'saturday market', 'sunday market',
  ],
  build: (facts: CherryFacts) => {
    const walkIn = facts.meetingPoints.filter((p) => p.type === 'walk_in');
    const pickup = facts.meetingPoints.filter((p) => p.type === 'pickup');
    const dropOnly = facts.meetingPoints.filter((p) => p.type === 'dropoff');
    const dropNotes = facts.meetingPoints.filter((p) => p.dropoffDescription);
    const fmt = (p: CherryFactsMeetingPoint) => `${p.name}: ${tidy(p.description)}${times(p)}`;
    return [
      `### MEETING POINTS (authoritative - for walk-in guests, hotels outside the free pickup zone, and drop-offs):`,
      walkIn.length ? `Walk-in (no pickup): ${walkIn.map(fmt).join('; ')}.` : '',
      pickup.length ? `Designated pickup meeting points: ${pickup.map(fmt).join('; ')}.` : '',
      dropOnly.length ? `Drop-off only: ${dropOnly.map((p) => `${p.name}: ${tidy(p.description)}`).join('; ')}.` : '',
      dropNotes.length ? `Drop-off notes: ${dropNotes.map((p) => `${p.name}: ${tidy(p.dropoffDescription ?? '')}`).join('; ')}.` : '',
      `STYLE: warm; name the relevant point, where to wait and the time window. To show the exact spot, offer the pickup map. Plain text kha.`,
    ].filter(Boolean).join('\n');
  },
};
