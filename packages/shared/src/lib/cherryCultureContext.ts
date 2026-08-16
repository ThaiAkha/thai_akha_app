// ─────────────────────────────────────────────────────────────────────────────
// cherryCultureContext — RAG cultura/history per Cherry (knowledge L2/L3)
//
// Flusso a livelli (token-efficiente):
//   L1  intro statica (subagent 04-akha-history) → domande broad ("raccontami
//       degli Akha"). Nessun fetch.
//   L2  summary_ai della sezione pertinente → quando l'utente chiede uno specifico
//       tema. Compatto ma corposo.
//   L3  full content di UNA sezione → solo se l'utente chiede esplicitamente il
//       dettaglio completo.
//
// Match su title + slug (gli slug contengono le keyword: spirit-gate, swing-
// festival, zang, tibetan-plateau…). Broad → null → risponde l'intro statica.
// Tono: storyteller (narrativo, caldo), ma sempre plain text.
// ─────────────────────────────────────────────────────────────────────────────

import { cultureService } from '../services/culture.service';

// Token generici che NON identificano una sezione specifica.
const GENERIC_TOKENS = new Set([
  'the', 'and', 'akha', 'sacred', 'traditional', 'history', 'historical', 'culture',
  'cultural', 'guide', 'northern', 'thailand', 'thai', 'living', 'story', 'stories',
  'way', 'world', 'people', 'tribe', 'tribes', 'about', 'tell', 'know', 'roots',
  // troppo generici per identificare una sezione (evitano falsi match con domande
  // su cibo/classe): es. "how spicy is the food" non deve attivare la cultura.
  'food', 'table', 'mountain', 'highland', 'highlands', 'kitchen', 'recipe',
  'recipes', 'dish', 'dishes', 'spicy', 'spice', 'signature', 'power',
]);

// Segnali che l'utente vuole il dettaglio COMPLETO (L3) e non la sintesi.
const FULL_DETAIL_SIGNALS = [
  'full', 'everything', 'in detail', 'detailed', 'complete', 'more about', 'in depth',
  'deep dive', 'all about', 'tutto', 'dettagli', 'dettaglio', 'approfond', 'completo',
];

function tokenize(s: string): string[] {
  const matches: string[] = s.toLowerCase().match(/[a-z]+/g) ?? [];
  return matches.filter((t) => t.length >= 3);
}

/** Cerca la sezione cultura pertinente (match su title + slug). null se broad. */
export function findCultureSection(
  text: string,
  sections: Array<Record<string, unknown>>,
): Record<string, unknown> | null {
  const msgSet = new Set(tokenize(text));
  let best: { s: Record<string, unknown>; score: number } | null = null;

  for (const s of sections) {
    const hay = `${String(s.title ?? '')} ${String(s.slug ?? '').replace(/-/g, ' ')}`;
    let score = 0;
    let distinctive = 0;
    for (const tk of tokenize(hay)) {
      if (msgSet.has(tk)) {
        score++;
        if (!GENERIC_TOKENS.has(tk)) distinctive++;
      }
    }
    if (distinctive >= 1 && (!best || score > best.score)) best = { s, score };
  }
  return best?.s ?? null;
}

function wantsFullDetail(text: string): boolean {
  const hay = (text ?? '').toLowerCase();
  return FULL_DETAIL_SIGNALS.some((kw) => hay.includes(kw));
}

function truncate(text: string, max: number): string {
  const clean = (text ?? '').trim();
  return clean.length <= max ? clean : clean.slice(0, max).trimEnd() + '…';
}

/**
 * Blocco CULTURE DATA per il prompt, o null se nessuna sezione specifica è
 * riconosciuta (→ risponde l'intro statica L1).
 */
export async function getCultureContextForCherry(text: string): Promise<string | null> {
  const sections = (await cultureService.getCultureSections()) as unknown as Array<Record<string, unknown>>;
  const match = findCultureSection(text, sections);
  if (!match) return null;

  const detail = (await cultureService.getCultureSectionBySlug(String(match.slug))) as unknown as Record<string, unknown> | null;
  if (!detail) return null;

  const wantFull = wantsFullDetail(text);
  const summary = String(detail.summary_ai ?? '').trim();
  const content = String(detail.content ?? '').trim();

  // L3 (full) solo se richiesto E disponibile; altrimenti L2 (summary_ai).
  const body = wantFull && content ? truncate(content, 1800) : (summary || truncate(content, 1200));
  if (!body) return null;

  const title = String(detail.title ?? match.title ?? 'Akha culture');
  const lengthHint = wantFull && content
    ? 'You may go a bit longer since the guest asked for the full detail (still concise).'
    : 'Keep it to ~150 words.';

  return [
    `### CULTURE DATA — ${title} (authoritative — tell this story ONLY from here, never invent):`,
    body,
    `STYLE: storyteller register — warm, evocative, narrative; plain text, no formatting, no labels. ${lengthHint} Bridge back to the food, the table or the community when it feels natural kha.`,
  ].join('\n');
}
