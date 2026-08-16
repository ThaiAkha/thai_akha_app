// ─────────────────────────────────────────────────────────────────────────────
// cherryLegalContext — clausole LEGALI per Cherry (RAG locale, zero DB).
//
// Indicizza Terms e Privacy CONSUMER dai file generati da `pnpm gen-legal`. Su una
// domanda pertinente inietta la singola clausola migliore (solo quella → token-efficiente).
//
// Perche' esiste solo il legale: gli altri temi (ricette, ingredienti, news, cultura,
// booking, diete, menu, pickup, quiz) hanno gia' un contesto dedicato che legge le
// SORGENTI ORIGINALI dal database. Il legale no: senza questo indice Cherry non avrebbe
// alcuna fonte su cancellazioni, rimborsi, visitatori, pagamenti, privacy.
//
// 🗑️ Storia (2026-07-31): qui c'era anche un indice di 31 FAQ da `data/faqQuestion.ts`.
// Eliminato: erano riformulazioni di contenuti che Cherry riceve gia' dalle sorgenti
// originali, e derivavano (contenevano un indirizzo non piu' valido mentre il DB aveva
// quello corretto). Meno testo duplicato = meno posti dove la verita' puo' divergere.
//
// ⚠️ SOLO DOCUMENTI CONSUMER. Questa e' la Cherry del front, parla con gli OSPITI:
// indicizza esclusivamente front_terms e front_policy. I documenti agenzia
// (AGENCY_TERMS / AGENCY_PRIVACY) hanno destinatario, obblighi e base giuridica diversi:
// iniettarli qui significherebbe rispondere a un ospite con le regole scritte per un
// partner B2B, per giunta su dati sanitari.
// NB: i documenti agency NON sono indicizzati da NESSUNA Cherry — la Cherry admin non ha
// un indice legale. Un eventuale indice agency-only e' una feature da progettare.
// ─────────────────────────────────────────────────────────────────────────────

import type { LegalDocument, LegalDocumentSection } from '../types/legal.types';
import { TERMS_OF_SERVICE } from '../data/legal/legalFrontTerms';
import { PRIVACY_POLICY } from '../data/legal/legalFrontPolicy';

const STOPWORDS = new Set([
  'what', 'when', 'where', 'which', 'your', 'with', 'this', 'that', 'have', 'does',
  'will', 'they', 'them', 'from', 'about', 'can', 'the', 'and', 'you', 'are', 'for',
  'thai', 'akha', 'kitchen', 'class', 'cooking', 'please', 'tell', 'know',
]);

function tokens(s: string): string[] {
  const m: string[] = (s ?? '').toLowerCase().match(/[a-z]{4,}/g) ?? [];
  return m.filter((t) => !STOPWORDS.has(t));
}

/**
 * Voce indicizzata. I token di titolo e corpo sono calcolati UNA VOLTA alla
 * costruzione dell'indice: prima venivano ricalcolati per ogni voce a ogni messaggio,
 * cioe' si ri-tokenizzava l'intero corpus a ogni domanda dell'utente.
 */
interface Entry {
  title: string;
  text: string;
  titleTokens: string[];
  bodyTokens: Set<string>;
}

/** Un blocco di testo di una sezione: content puo' essere stringa o array. */
function flatten(content: LegalDocumentSection['content']): string {
  if (Array.isArray(content)) return content.join(' ');
  return content ?? '';
}

function addEntry(out: Entry[], title: string, text: string): void {
  if (!text) return;
  out.push({ title, text, titleTokens: tokens(title), bodyTokens: new Set(tokens(text)) });
}

function buildIndex(): Entry[] {
  const out: Entry[] = [];
  for (const doc of [TERMS_OF_SERVICE, PRIVACY_POLICY] as LegalDocument[]) {
    const docTitle = doc.title ?? '';
    for (const section of doc.sections ?? []) {
      addEntry(out, `${docTitle} - ${section.title}`, flatten(section.content));
      for (const sub of section.subsections ?? []) {
        addEntry(out, `${docTitle} - ${sub.title}`, flatten(sub.content));
      }
    }
  }
  return out;
}

const INDEX = buildIndex();

/** Trova la clausola legale più pertinente e la inietta. null se nessun match deciso. */
export function getLegalContext(text: string): string | null {
  const qSet = new Set(tokens(text));
  if (qSet.size === 0) return null;

  let best: Entry | null = null;
  let bestScore = 0;

  for (const e of INDEX) {
    let score = 0;
    for (const tk of e.titleTokens) if (qSet.has(tk)) score += 2; // il titolo pesa di più
    for (const tk of qSet) if (e.bodyTokens.has(tk)) score += 1;
    if (score > bestScore) { best = e; bestScore = score; }
  }

  // Soglia: serve un match deciso (≈2 token del titolo) per non iniettare a caso.
  if (!best || bestScore < 4) return null;

  const body = best.text.length > 700 ? `${best.text.slice(0, 700).trimEnd()}…` : best.text;
  return [
    `### POLICY — ${best.title} (authoritative — answer from this):`,
    body,
    `STYLE: warm; answer the guest's question concisely from this. Plain text kha.`,
  ].join('\n');
}
