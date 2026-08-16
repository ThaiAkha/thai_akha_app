// ─────────────────────────────────────────────────────────────────────────────
// Dati STATICI dei meeting point (fonte: tabella meeting_points, ~12 righe).
// Per ospiti walk-in o con hotel fuori dalla zona di pickup gratuito.
// I link mappa NON sono nel prompt (URL lunghi = spreco token): la posizione
// esatta la mostra la pagina mappa pickup. Aggiornare se cambiano.
// ─────────────────────────────────────────────────────────────────────────────

import type { CherryKnowledgeModule } from './types';

interface MeetingPoint {
  name: string;
  type: 'pickup' | 'walk_in' | 'dropoff';
  where: string;
}

export const MEETING_POINTS: MeetingPoint[] = [
  { name: 'Thai Akha Kitchen (the school)', type: 'walk_in', where: 'come directly to the school - arrive by 8:50 am (morning) or 4:50 pm (evening)' },
  { name: 'Wat Pan Whean temple', type: 'walk_in', where: 'morning market meeting point - inside, near the big white pagoda' },
  { name: 'MAYA Shopping Center', type: 'pickup', where: 'in front of the entrance to ONE Nimman' },
  { name: 'Central Festival', type: 'pickup', where: 'on the main street, by the bus stop sign' },
  { name: 'Central Airport Plaza', type: 'pickup', where: 'in front of the Central Plaza gate entrance' },
  { name: 'MacDonald - Tha Phae Gate', type: 'pickup', where: 'on the main street, in front of the McDonald entrance' },
  { name: 'North Gate - B2 Hotel', type: 'pickup', where: 'on the main street in front of B2 Hotel' },
  { name: 'Chiang Mai Train Station', type: 'pickup', where: 'outside the mini-mart next to the clock tower' },
];

export const meetingPointsModule: CherryKnowledgeModule = {
  id: 'meeting_points',
  keywords: [
    'meeting point', 'meet you', 'where do we meet', 'where to meet', 'meet at',
    'walk in', 'walk-in', 'come to the school', 'wat pan', 'maya', 'central festival',
    'tha phae', 'train station', 'north gate', 'outside zone', 'outside the zone',
  ],
  build: () => {
    const walkIn = MEETING_POINTS.filter((m) => m.type === 'walk_in').map((m) => `${m.name} (${m.where})`);
    const pickup = MEETING_POINTS.filter((m) => m.type === 'pickup').map((m) => `${m.name} - ${m.where}`);
    return [
      `### MEETING POINTS (authoritative - for walk-in guests or hotels outside the free pickup zone):`,
      `Walk-in (no pickup): ${walkIn.join('; ')}.`,
      `Designated pickup meeting points: ${pickup.join('; ')}.`,
      `STYLE: warm; name the relevant point and where to wait. To show the exact spot, offer the pickup map. Plain text kha.`,
    ].join('\n');
  },
};
