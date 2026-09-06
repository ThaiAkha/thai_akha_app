/**
 * Utilità di testo condivise dai contesti che Cherry costruisce dal database.
 *
 * Erano copiate: `tokenize` in quattro file identica riga per riga, `truncate` in
 * tre. Le liste di parole invece NON erano uguali fra un contesto e l'altro, e
 * non lo diventano qui: `includesAny` prende la lista in ingresso, cosi' ogni
 * contesto tiene la sua e nessuno cambia comportamento per sbaglio.
 *
 * Fuori da qui resta il meccanismo che decide quale articolo agganciare a una
 * domanda: sembra copiato, ma le soglie differiscono davvero da un contesto
 * all'altro (una parola in comune contro due, il filtro sulla lunghezza minima
 * solo sugli ingredienti). Unificarlo cambierebbe le risposte di Cherry in modo
 * difficile da notare, ed e' un lavoro a parte.
 */

/** Parole di almeno tre lettere, minuscole. Il confronto fra testi parte da qui. */
export function tokenize(s: string): string[] {
  const matches: string[] = s.toLowerCase().match(/[a-z]+/g) ?? [];
  return matches.filter((t) => t.length >= 3);
}

/**
 * Punteggio di un nome contro le parole del messaggio.
 *
 * `english` e' la chiave che sopravvive alla traduzione (name_key, title_key,
 * slug), `localized` il nome nella lingua del sito. Le parole tradotte alzano il
 * punteggio ma NON bastano da sole a riconoscere il contenuto: le liste di
 * parole generiche dei contesti sono inglesi, e "con", "mit", "sopa" avrebbero
 * agganciato un piatto a "posso pagare con carta" (riprodotto in produzione il
 * 2026-09-06). In inglese `english` e `localized` coincidono. Il punteggio
 * conta le ripetizioni (titolo + slug), le parole distintive UNA volta: "Chiang
 * Mai" in titolo e slug non vale due parole, e "mai" da solo (che in italiano e'
 * "never") non deve superare la soglia delle news.
 */
export function scoreName(
  msgSet: ReadonlySet<string>,
  english: string,
  localized: string,
  isDistinctive: (token: string) => boolean,
): { score: number; distinctive: number; distinctiveHits: number } {
  const englishTokens = tokenize(english);
  const englishSet = new Set(englishTokens);
  let score = 0;
  let distinctive = 0;
  let distinctiveHits = 0;
  for (const tk of englishTokens) {
    if (!msgSet.has(tk)) continue;
    score++;
    // `distinctiveHits` conta le ripetizioni (la stessa parola in titolo e slug
    // vale due): e' la regola storica delle news, che la usa cosi'.
    if (isDistinctive(tk)) distinctiveHits++;
  }
  for (const tk of englishSet) if (msgSet.has(tk) && isDistinctive(tk)) distinctive++;
  for (const tk of new Set(tokenize(localized))) {
    if (!englishSet.has(tk) && msgSet.has(tk)) score++;
  }
  return { score, distinctive, distinctiveHits };
}

/** Taglia alla lunghezza massima senza spezzare a meta' una parola in coda. */
export function truncate(text: string, max: number): string {
  const clean = (text ?? '').trim();
  return clean.length <= max ? clean : clean.slice(0, max).trimEnd() + '…';
}

/** true se il testo contiene una qualsiasi delle parole date. La lista la passa il chiamante. */
export function includesAny(text: string, needles: readonly string[]): boolean {
  const hay = (text ?? '').toLowerCase();
  return needles.some((kw) => hay.includes(kw));
}
