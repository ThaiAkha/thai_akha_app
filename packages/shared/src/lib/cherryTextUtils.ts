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
