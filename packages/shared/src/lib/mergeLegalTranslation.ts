import type { LegalDocument, LegalDocumentSection } from '../types/legal.types';

/**
 * mergeLegalTranslation - fonde un documento legale con la sua traduzione SEZIONE PER SEZIONE.
 *
 * Perche' esiste: le traduzioni possono essere PARZIALI. Un fallback sul documento intero
 * (`th ?? en`) sembra innocuo ma e' pericoloso: mostrerebbe il documento tradotto cosi'
 * com'e', cioe' con dei buchi. Oggi alla traduzione thai dei terms agenzia mancano proprio
 * la clausola pagamenti e quella cancellazioni: un'agenzia thai vedrebbe un contratto senza
 * quelle due sezioni, e nulla glielo direbbe.
 *
 * Regola: il risultato ha SEMPRE tutte le sezioni dell'originale. Ogni sezione e' tradotta
 * se la traduzione esiste, altrimenti resta nell'originale ed e' marcata come tale.
 *
 * ⚠️ Il match e' su `anchor`, MAI sull'indice. L'ancora e' stabile e non tradotta, mentre
 * gli indici slittano appena manca una sezione: nella privacy agenzia manca la §2, quindi
 * dal secondo elemento in poi un allineamento posizionale accoppierebbe testi sbagliati -
 * il modo peggiore di sbagliare, perche' il documento sembrerebbe completo.
 */

export type RenderedLang = 'source' | 'translated';

export interface MergedLegalSection extends LegalDocumentSection {
  /** Lingua in cui questa sezione viene effettivamente resa. */
  renderedLang: RenderedLang;
}

export interface MergedLegalDocument extends Omit<LegalDocument, 'sections'> {
  sections: MergedLegalSection[];
  /** Lingua della traduzione applicata (null = si sta mostrando l'originale). */
  translationLang: string | null;
  /** true se almeno una sezione ricade sull'originale mentre si voleva la traduzione. */
  isPartialTranslation: boolean;
  /** Ancore delle sezioni NON tradotte: utile per marcarle e per i log. */
  untranslatedAnchors: string[];
  /** Numero di sezioni effettivamente tradotte. */
  translatedCount: number;
  /**
   * true se esisteva una traduzione ma riferita a una versione precedente: e' stata
   * SCARTATA e si mostra l'originale intero.
   */
  isStaleTranslation: boolean;
}

/** Chiave di accoppiamento: solo l'ancora, che e' stabile e non tradotta. */
function sectionKey(s: LegalDocumentSection): string | null {
  const anchor = (s.anchor ?? '').trim();
  return anchor ? `a:${anchor}` : null;
}

/**
 * Una sezione tradotta "vuota" (nessun contenuto, sottosezione o nota) non e' una
 * traduzione: contarla come tale produrrebbe un titolo senza testo, cioe' proprio il
 * buco silenzioso che questa utility esiste per evitare. Si tratta come assente.
 */
function hasContent(s: LegalDocumentSection): boolean {
  const c = s.content;
  const hasBody = Array.isArray(c) ? c.some((x) => (x ?? '').trim() !== '') : (c ?? '').trim() !== '';
  return hasBody || (s.subsections?.length ?? 0) > 0 || (s.notes?.length ?? 0) > 0;
}

/**
 * @param source      documento nella lingua di riferimento (inglese: fa fede)
 * @param translation traduzione, anche parziale. null/undefined = nessuna traduzione
 * @param lang        codice lingua della traduzione (es. 'th'), usato solo per l'esito
 */
export function mergeLegalTranslation(
  source: LegalDocument,
  translation?: LegalDocument | null,
  lang?: string | null,
): MergedLegalDocument {
  const noTranslation = !translation
    || !Array.isArray(translation.sections)
    || translation.sections.length === 0;

  // TRADUZIONE STALE: riferita a una versione precedente dell'originale. Le ancore sono
  // stabili per costruzione, quindi una traduzione vecchia si accoppierebbe comunque -
  // mostrando il testo superato sotto il titolo giusto, marcato come "tradotto" e con in
  // testa il numero di versione nuovo. Si scarta e si mostra l'originale intero.
  const stale = !noTranslation
    && Boolean(source.version)
    && Boolean(translation!.version)
    && translation!.version !== source.version;

  if (noTranslation || stale) {
    return {
      ...source,
      sections: source.sections.map((s) => ({ ...s, renderedLang: 'source' as const })),
      translationLang: null,
      isPartialTranslation: false,
      untranslatedAnchors: [],
      translatedCount: 0,
      isStaleTranslation: stale,
    };
  }

  const byKey = new Map<string, LegalDocumentSection>();
  for (const s of translation!.sections) {
    const key = sectionKey(s);
    // Senza ancora non si puo' accoppiare in sicurezza, e una sezione vuota non e' una
    // traduzione: in entrambi i casi si lascia vincere l'originale.
    if (key && hasContent(s)) byKey.set(key, s);
  }

  const untranslatedAnchors: string[] = [];
  let translatedCount = 0;

  const sections: MergedLegalSection[] = source.sections.map((src) => {
    const key = sectionKey(src);
    const tr = key ? byKey.get(key) : undefined;
    if (!tr) {
      untranslatedAnchors.push(src.anchor || src.title);
      return { ...src, renderedLang: 'source' as const };
    }
    translatedCount++;
    // Il testo e' quello tradotto, ma l'ANCORA resta quella dell'originale: e' l'id di
    // deep-link (le FAQ e i documenti ci puntano) e non deve cambiare con la lingua.
    return {
      ...tr,
      anchor: src.anchor || tr.anchor,
      renderedLang: 'translated' as const,
    };
  });

  return {
    ...source,
    // Titolo del documento tradotto quando disponibile. La VERSIONE resta quella
    // dell'originale: e' l'unica che fa fede ed e' quella registrata all'accettazione.
    title: translation!.title || source.title,
    sections,
    translationLang: lang ?? null,
    isPartialTranslation: untranslatedAnchors.length > 0,
    untranslatedAnchors,
    translatedCount,
    isStaleTranslation: false,
  };
}

export default mergeLegalTranslation;
