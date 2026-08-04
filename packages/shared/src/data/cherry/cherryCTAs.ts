// ─────────────────────────────────────────────────────────────────────────────
// cherryCTAs — micro-CTA sopra i bottoni, ROTANTE e PER-LIVELLO ("buttons header").
//
// Idea: a ogni transizione di livello sappiamo DOVE si va, quindi la label è
// coerente col livello (L1 = scegli un tema · L2 = vai più a fondo · L3 = la
// storia completa / torna su). Stessa famiglia per stesso livello, MAI banale:
// pesca a rotazione dal pool, mai due uguali di fila.
//
// Niente CTA scritte nei singoli cherry_response (zero ripetizione, zero lavoro
// per-record). Render: sostituisce la label statica sopra la griglia opzioni in
// ChatMessageList.tsx (~r.145) e ChatBox.tsx → getCherryCTA(message.id, node.level).
// ─────────────────────────────────────────────────────────────────────────────

/** Livello del nodo corrente (i bottoni portano al livello successivo). */
export type CtaLevel = 1 | 2 | 3 | 'quiz' | 'default';

const POOLS: Record<CtaLevel, string[]> = {
  // L1 — entry/hub → scegli un tema (apertura, broad)
  1: [
    'Where shall we start?',
    'Pick a thread to pull:',
    'So — which way first?',
    'Choose a direction, or just ask me kha',
    'Lots here. Where to begin?',
    'What pulls you in?',
    'Start anywhere — or ask me 🙏',
    'Which of these calls to you?',
  ],
  // L2 — vai più a fondo nel tema
  2: [
    'Want to go deeper?',
    "There's more beneath this — dig in?",
    'Ready for the detail?',
    'Shall we go one layer down?',
    'More to this one. Take your pick:',
    'Keep pulling the thread?',
    'Go deeper, or ask me directly kha',
    'Curious for the rest?',
  ],
  // L3 — terminale: leggi tutto / media / torna su
  3: [
    'Read the full story below 👇',
    "Here's the whole thing — or wander back:",
    'Take it all in, then choose where next:',
    'The full piece is below. Where to after?',
    'See it in full, or hop somewhere new kha',
    "That's the deep end — where next?",
    'All of it is here. Then where?',
  ],
  // contesto quiz/hint
  quiz: [
    'Need a nudge, or ready to guess?',
    'Want a clue, or keep playing kha?',
    'A little hint, or shall we move on?',
  ],
  // fallback generico (livello sconosciuto)
  default: [
    'Where shall we go next?',
    'Pick a thread below — or just ask me kha 🙏',
    'Curious about something else? Ask away.',
    'More under each button — or type your own question:',
    'Your turn: choose a path, or ask me anything kha',
    'Anything catch your eye? Tap or ask.',
  ],
};

// Ultimo indice usato per pool → mai due uguali di fila nello stesso pool.
const _last: Partial<Record<CtaLevel, number>> = {};

/**
 * Micro-CTA per il livello del nodo corrente, variata e mai ripetuta di fila.
 * @param seed  id messaggio/nodo → scelta deterministica stabile al re-render.
 * @param level livello del nodo (1|2|3) o 'quiz'; default = pool generico.
 */
export function getCherryCTA(seed?: string | number, level: CtaLevel = 'default'): string {
  const pool = POOLS[level] ?? POOLS.default;
  if (pool.length === 0) return POOLS.default[0];

  let idx: number;
  if (seed != null) {
    const h = typeof seed === 'number'
      ? Math.abs(Math.trunc(seed))
      : Array.from(String(seed)).reduce((a, c) => (a * 31 + c.charCodeAt(0)) >>> 0, 7);
    idx = h % pool.length;
  } else {
    idx = Math.floor(Math.random() * pool.length);
  }
  if (idx === _last[level] && pool.length > 1) idx = (idx + 1) % pool.length;
  _last[level] = idx;
  return pool[idx];
}
