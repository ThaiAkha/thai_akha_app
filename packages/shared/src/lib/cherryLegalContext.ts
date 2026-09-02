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

/**
 * Sinonimi che la radice non puo' unire: l'ospite chiede dei "children", la
 * sezione dei Terms si chiama "Kids". Senza questa riga la domanda finiva sulla
 * clausola privacy sui dati dei minori invece che sulle regole di partecipazione.
 * Chiavi gia' stemmate e tagliate a 4.
 */
const SYNONYMS: Record<string, string> = {
  chil: 'kid',   // child, children → kids
  mino: 'kid',   // minor, minors  → kids
};

/** Plurale → singolare: "cancellations"→"cancellation", "allergies"→"allergy". */
function stem(w: string): string {
  if (w.endsWith('ies') && w.length > 4) return `${w.slice(0, -3)}y`;
  // >3 e non >4: la sezione dei Terms si chiama "Kids", quattro lettere. Con la
  // soglia a 4 restava "kids" e non incontrava mai "kid"/"children".
  if (w.endsWith('s') && !w.endsWith('ss') && w.length > 3) return w.slice(0, -1);
  return w;
}

/**
 * Chiave di confronto: radice a 4 lettere della parola stemmata. Serve perche' il
 * confronto era per parola INTERA: l'ospite scrive "cancellation policy" ma la
 * sezione si chiama "Cancellations, Date Changes & No-Shows", e i due token non
 * combaciavano mai. Con la radice "canc" (e "pick" per pick/pickup, "alle" per
 * allergy/allergies) domanda e clausola finiscono nello stesso secchio.
 */
function keys(s: string): string[] {
  const m: string[] = (s ?? '').toLowerCase().match(/[a-z]{4,}/g) ?? [];
  return m.filter((t) => !STOPWORDS.has(t)).map((t) => {
    const k = stem(t).slice(0, 4);
    return SYNONYMS[k] ?? k;
  });
}

/**
 * Voce indicizzata. I token di titolo e corpo sono calcolati UNA VOLTA alla
 * costruzione dell'indice: prima venivano ricalcolati per ogni voce a ogni messaggio,
 * cioe' si ri-tokenizzava l'intero corpus a ogni domanda dell'utente.
 */
interface Entry {
  title: string;
  text: string;
  /** Titolo della SEZIONE: e' il tema, pesa 3. */
  sectionKeys: string[];
  /** Titolo del DOCUMENTO ("Privacy Policy…"): pesa 1, perche' e' uguale per
   *  tutte le sezioni di quel documento e da solo non identifica la clausola.
   *  Prima era fuso col titolo di sezione: ogni voce della Privacy pescava su
   *  "policy" e una domanda sulle cancellazioni finiva sull'introduzione privacy. */
  docKeys: string[];
  bodyKeys: Set<string>;
}

/** Un blocco di testo di una sezione: content puo' essere stringa o array. */
function flatten(content: LegalDocumentSection['content']): string {
  if (Array.isArray(content)) return content.join(' ');
  return content ?? '';
}

function addEntry(out: Entry[], docTitle: string, sectionTitle: string, text: string): void {
  if (!text) return;
  out.push({
    title: `${docTitle} - ${sectionTitle}`,
    text,
    sectionKeys: [...new Set(keys(sectionTitle))],
    docKeys: [...new Set(keys(docTitle))],
    bodyKeys: new Set(keys(text)),
  });
}

function buildIndex(): Entry[] {
  const out: Entry[] = [];
  // I Terms vanno per primi: a parita' di punteggio lo scorer tiene il primo
  // trovato, e per una domanda di comportamento ("posso portare i bambini?")
  // la regola di partecipazione batte la clausola privacy sui dati dei minori.
  for (const doc of [TERMS_OF_SERVICE, PRIVACY_POLICY] as LegalDocument[]) {
    const docTitle = doc.title ?? '';
    for (const section of doc.sections ?? []) {
      addEntry(out, docTitle, section.title, flatten(section.content));
      for (const sub of section.subsections ?? []) {
        addEntry(out, docTitle, sub.title, flatten(sub.content));
      }
    }
  }
  return out;
}

const INDEX = buildIndex();

/** Trova la clausola legale più pertinente e la inietta. null se nessun match deciso. */
export function getLegalContext(text: string): string | null {
  const qSet = new Set(keys(text));
  if (qSet.size === 0) return null;

  let best: Entry | null = null;
  let bestScore = 0;

  for (const e of INDEX) {
    let score = 0;
    for (const k of e.sectionKeys) if (qSet.has(k)) score += 3; // il tema della sezione decide
    for (const k of e.docKeys) if (qSet.has(k)) score += 1;     // il documento orienta soltanto
    for (const k of qSet) if (e.bodyKeys.has(k)) score += 1;
    if (score > bestScore) { best = e; bestScore = score; }
  }

  // Soglia: serve un match deciso per non iniettare a caso.
  if (!best || bestScore < 4) return null;

  const body = best.text.length > 700 ? `${best.text.slice(0, 700).trimEnd()}…` : best.text;
  return [
    `### POLICY — ${best.title} (authoritative — answer from this):`,
    body,
    `STYLE: warm; answer the guest's question concisely from this. Plain text kha.`,
  ].join('\n');
}
