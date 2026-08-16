// ─────────────────────────────────────────────────────────────────────────────
// cherryNewsContext — RAG news/guide per Cherry (knowledge L2/L3)
//
// Stesso flusso a livelli di cultura/ricette:
//   L2  summary_ai dell'articolo → tema specifico. (fallback: excerpt)
//   L3  full content → solo se l'utente chiede il dettaglio completo.
// Match su title + slug. Broad/nessun match → null (non si inietta nulla).
// Tono: informativo, amichevole, con il takeaway pratico per l'ospite.
// ─────────────────────────────────────────────────────────────────────────────

import { newsService } from '../services/news.service';

const GENERIC_TOKENS = new Set([
  'the', 'and', 'akha', 'thai', 'guide', 'tips', 'how', 'your', 'what', 'about',
  'news', 'article', 'cooking', 'class', 'classes', 'food', 'kitchen', 'story',
  'with', 'for', 'tell', 'know', 'best', 'top', 'ultimate', 'complete',
]);

const FULL_DETAIL_SIGNALS = [
  'full', 'everything', 'in detail', 'detailed', 'complete article', 'read the',
  'more about', 'in depth', 'deep dive', 'tutto', 'dettagli', 'approfond', 'completo',
];

function tokenize(s: string): string[] {
  const matches: string[] = s.toLowerCase().match(/[a-z]+/g) ?? [];
  return matches.filter((t) => t.length >= 3);
}

/** Cerca l'articolo news pertinente (match su title + slug). null se broad. */
export function findNewsArticle(
  text: string,
  articles: Array<Record<string, unknown>>,
): Record<string, unknown> | null {
  const msgSet = new Set(tokenize(text));
  let best: { a: Record<string, unknown>; score: number } | null = null;

  for (const a of articles) {
    const hay = `${String(a.title ?? '')} ${String(a.slug ?? '').replace(/-/g, ' ')}`;
    let score = 0;
    let distinctive = 0;
    for (const tk of tokenize(hay)) {
      if (msgSet.has(tk)) {
        score++;
        if (!GENERIC_TOKENS.has(tk)) distinctive++;
      }
    }
    // Almeno DUE token distintivi per le news: i titoli sono lunghi e generici,
    // serve più specificità per evitare match casuali.
    if (distinctive >= 2 && (!best || score > best.score)) best = { a, score };
  }
  return best?.a ?? null;
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
 * Blocco NEWS DATA per il prompt, o null se nessun articolo specifico è
 * riconosciuto. Catena dati: summary_ai (L2) → excerpt → content (L3 se richiesto).
 */
export async function getNewsContextForCherry(text: string): Promise<string | null> {
  const feed = (await newsService.getNewsFeed()) as unknown as Array<Record<string, unknown>>;
  const match = findNewsArticle(text, feed);
  if (!match) return null;

  const detail = (await newsService.getNewsDetailBySlug(String(match.slug))) as unknown as Record<string, unknown> | null;
  if (!detail) return null;

  const wantFull = wantsFullDetail(text);
  const summary = String(detail.summary_ai ?? '').trim();
  const excerpt = String(detail.excerpt ?? match.excerpt ?? '').trim();
  const content = String(detail.content ?? '').trim();

  const body = wantFull && content
    ? truncate(content, 1800)
    : (summary || excerpt || truncate(content, 1000));
  if (!body) return null;

  const title = String(detail.title ?? match.title ?? 'Thai Akha guide');
  const lengthHint = wantFull && content
    ? 'You may go a bit longer since the guest asked for the full article (still concise).'
    : 'Keep it to ~150 words.';

  return [
    `### NEWS DATA — ${title} (authoritative — answer ONLY from this, never invent):`,
    body,
    `STYLE: informative and friendly — share the key point and the practical takeaway for the guest, then a gentle bridge to a class/recipe if natural. ${lengthHint} Plain text, no formatting, no labels kha.`,
  ].join('\n');
}
