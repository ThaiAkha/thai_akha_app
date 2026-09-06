/**
 * Le due schede "precedente e successivo" in fondo a un articolo.
 *
 * La regola e' in tre gradini: se l'articolo dichiara dei collegati, si usano
 * quelli; altrimenti si prende chi viene prima e dopo nell'elenco; e in ogni caso
 * si garantiscono DUE schede, riempiendo i buchi con altri articoli qualsiasi
 * (mai se stesso, mai due volte lo stesso).
 *
 * Stava scritta due volte, in useCultureDetail e useNewsDetail, identica a meno
 * dei nomi delle variabili. Una regola scritta due volte e' una regola che
 * domani cambia in un posto solo.
 */

/** Il minimo che serve per riconoscere un elemento e non ripeterlo. */
export interface RelatedItem {
  id: string;
  slug?: string;
}

interface Params<T extends RelatedItem> {
  /** Gli identificativi dichiarati dall'articolo, se ci sono. */
  relatedIds: string[] | null | undefined;
  /** L'elenco completo in cui pescare. */
  items: T[];
  /** Lo slug dell'articolo aperto: non deve mai comparire fra le due schede. */
  slug: string;
  /** Precedente e successivo secondo l'ordine dell'elenco. */
  seqPrev: T | null;
  seqNext: T | null;
}

export function pickRelatedPair<T extends RelatedItem>({
  relatedIds, items, slug, seqPrev, seqNext,
}: Params<T>): { previous: T | null; next: T | null } {
  let prev: T | null = null;
  let nxt: T | null = null;

  if (relatedIds && relatedIds.length > 0) {
    const byIdOrSlug = (needle: string) =>
      items.find(i => i.slug === needle || i.id === needle) ?? null;
    prev = byIdOrSlug(relatedIds[0]);
    nxt = relatedIds.length > 1 ? byIdOrSlug(relatedIds[1]) : null;
  } else {
    prev = seqPrev;
    nxt = seqNext;
  }

  // Sempre due schede: i buchi si riempiono con altri elementi dell'elenco.
  const other = (...exclude: (string | undefined)[]) =>
    items.find(i => i.slug !== slug && !exclude.includes(i.slug)) ?? null;

  if (!prev && !nxt) {
    prev = other();
    nxt = other(prev?.slug);
  } else if (!prev && nxt) {
    prev = other(nxt.slug);
  } else if (!nxt && prev) {
    nxt = other(prev.slug);
  }

  return { previous: prev, next: nxt };
}
