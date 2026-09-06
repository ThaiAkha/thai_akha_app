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
import { tokenize, truncate, includesAny, scoreName } from './cherryTextUtils';

const GENERIC_TOKENS = new Set([
  'the', 'and', 'akha', 'thai', 'guide', 'tips', 'how', 'your', 'what', 'about',
  'news', 'article', 'cooking', 'class', 'classes', 'food', 'kitchen', 'story',
  'with', 'for', 'tell', 'know', 'best', 'top', 'ultimate', 'complete',
]);

/**
 * Domanda di rassegna ("what's new?", "any news?"), che non nomina un articolo e
 * quindi non fa match su nessun titolo. Prima cadeva nel null e Cherry rispondeva
 * "I don't have that information right now kha" a una domanda del tutto legittima:
 * ora le si passa l'elenco delle ultime uscite. "new" da solo non basta (compare
 * in "I'm new to Thai cooking"), serve un segnale esplicito di attualita'.
 */
const BROAD_NEWS_INTENT = /\b(news|latest|recent|updates?|blog|articles?)\b|what'?s new|anything new/i;

const FULL_DETAIL_SIGNALS = [
  'full', 'everything', 'in detail', 'detailed', 'complete article', 'read the',
  'more about', 'in depth', 'deep dive', 'tutto', 'dettagli', 'approfond', 'completo',
];

/** La lista sopra e' di QUESTO contesto: la funzione e' condivisa, le parole no. */
const wantsFullDetail = (text: string): boolean => includesAny(text, FULL_DETAIL_SIGNALS);


/** Cerca l'articolo news pertinente (match su title + slug). null se broad. */
export function findNewsArticle(
  text: string,
  articles: Array<Record<string, unknown>>,
): Record<string, unknown> | null {
  const msgSet = new Set(tokenize(text));
  let best: { a: Record<string, unknown>; score: number } | null = null;

  for (const a of articles) {
    // Titolo inglese (`title_key`) + slug per riconoscere; titolo tradotto solo
    // per il punteggio (vedi scoreName). Almeno DUE token distintivi per le
    // news: i titoli sono lunghi e generici, serve piu' specificita'.
    const slugWords = String(a.slug ?? '').replace(/-/g, ' ');
    const { score, distinctive } = scoreName(
      msgSet, `${String(a.title_key ?? a.title ?? '')} ${slugWords}`, String(a.title ?? ''), (tk) => !GENERIC_TOKENS.has(tk),
    );
    if (distinctive >= 2 && (!best || score > best.score)) best = { a, score };
  }
  return best?.a ?? null;
}



/** Le ultime 3 uscite (il feed arriva già ordinato per published_at desc). */
function buildHeadlines(feed: Array<Record<string, unknown>>): string | null {
  const righe = feed
    .slice(0, 3)
    .map((a) => {
      const titolo = String(a.title ?? '').trim();
      if (!titolo) return '';
      const excerpt = truncate(String(a.excerpt ?? '').trim(), 160);
      return excerpt ? `- ${titolo}: ${excerpt}` : `- ${titolo}`;
    })
    .filter(Boolean);
  if (righe.length === 0) return null;

  return [
    '### NEWS DATA — latest stories (authoritative — answer ONLY from this, never invent):',
    ...righe,
    'STYLE: mention what is new in a warm sentence or two, then offer to go deeper on the one that interests the guest. Keep it to ~120 words. Plain text, no formatting, no labels kha.',
  ].join('\n');
}

/**
 * Blocco NEWS DATA per il prompt, o null se nessun articolo specifico è
 * riconosciuto. Catena dati: summary_ai (L2) → excerpt → content (L3 se richiesto).
 */
export async function getNewsContextForCherry(text: string, lang = 'en'): Promise<string | null> {
  // Titoli nella lingua del sito; lo slug resta inglese (vedi cultura).
  const feed = (await newsService.getNewsFeed(lang)) as unknown as Array<Record<string, unknown>>;
  const match = findNewsArticle(text, feed);
  if (!match) return BROAD_NEWS_INTENT.test(text) ? buildHeadlines(feed) : null;

  const detail = (await newsService.getNewsDetailBySlug(String(match.slug), lang)) as unknown as Record<string, unknown> | null;
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
