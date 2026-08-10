/**
 * 🌍 FALLBACK PER CAMPO — la regola di merge di TUTTI i sidecar `*_translations`.
 *
 * Il fallback è per CAMPO, mai per riga: `coalesce(traduzione.campo, base.campo)`
 * campo per campo. Una riga spagnola con `summary_ai` pieno e `page_essentials`
 * vuoto serve il summary spagnolo e gli essentials inglesi — non fa sparire la
 * pagina, non torna tutta inglese, non lascia un buco.
 *
 * Questa è la differenza pratica: un merge per riga (`translation ?? base`)
 * butterebbe via 12 campi tradotti perché il tredicesimo non c'è ancora.
 *
 * COSA CONTA COME "manca" (e quindi ricade sulla base):
 *   null · undefined · stringa vuota o di soli spazi · array vuoto
 * Un `false` o uno `0` tradotti sono valori legittimi e vincono sulla base.
 *
 * ⚠️ Il sidecar porta SOLO i campi tradotti. Tutto il resto (id, asset, flag,
 * json_ld, date) vive sulla base e non va mai duplicato: json_ld, breadcrumbs,
 * hreflang e sibling_slugs si GENERANO a render dai campi tradotti + registro
 * slug, non si memorizzano tradotti.
 */

/**
 * Colonne che un sidecar ha per meccanica propria e che NON sono contenuto:
 * non devono mai sovrascrivere la base.
 *
 * · `id`/`page_id` sovrascriverebbero l'IDENTITÀ della riga madre.
 * · `lang`/`human_reviewed`/date sono metadati del sidecar, non della pagina.
 * · `language` è un mirror GENERATED read-only presente su 2 sidecar (drop
 *   previsto post-deploy, migration 20260805002000): mai letto, mai scritto.
 * · `page_slug`/`slug`: lo slug tradotto è REALE contenuto, ma la sua fonte
 *   unica è il registro `v_translated_slugs`, non il merge. Se il merge lo
 *   sovrascrivesse, l'oggetto perderebbe l'identità inglese con cui si rileggono
 *   DB e cache — e avremmo due fonti per la stessa cosa. Chi vuole lo slug
 *   localizzato lo chiede a translatedSlugService.
 */
export const SIDECAR_META_COLUMNS = new Set([
  'id',
  'page_id',
  'lang',
  'language',
  'human_reviewed',
  'created_at',
  'updated_at',
  'page_slug',
  'slug',
]);

/**
 * Un valore del sidecar è "assente" se non porta contenuto utile.
 *
 * L'oggetto vuoto conta come assente al pari di `[]`: un `{}` scritto per sbaglio
 * in una colonna JSONB (page_essentials, key_entities…) altrimenti VINCEREBBE
 * sulla base, svuotando in silenzio il campo inglese — un buco che non si vede
 * finché qualcuno non guarda quella pagina in quella lingua.
 * Convenzione a monte: per "non tradotto" si scrive NULL, mai `{}` o `''`.
 */
export const isMissingTranslationValue = (value: unknown): boolean => {
  if (value === null || value === undefined) return true;
  if (typeof value === 'string') return value.trim() === '';
  if (Array.isArray(value)) return value.length === 0;
  if (typeof value === 'object') return Object.keys(value as object).length === 0;
  return false;
};

/**
 * Fonde una riga base con la sua traduzione, campo per campo.
 *
 * @param base        la riga della tabella madre (inglese) — mai null
 * @param translation la riga del sidecar per la lingua richiesta, se esiste
 * @returns           un oggetto con la forma della base, campi tradotti dove ci sono
 */
export function mergeTranslation<Base extends Record<string, unknown>>(
  base: Base,
  translation: Record<string, unknown> | null | undefined,
): Base {
  if (!translation) return base;

  const merged: Record<string, unknown> = { ...base };
  for (const [key, value] of Object.entries(translation)) {
    if (SIDECAR_META_COLUMNS.has(key)) continue;
    if (isMissingTranslationValue(value)) continue;
    merged[key] = value;
  }
  return merged as Base;
}

/**
 * Sceglie dalla lista dei sidecar la riga della lingua richiesta.
 *
 * Nessun fallback a `en` qui: la base È l'inglese, e il fallback lo fa
 * `mergeTranslation` campo per campo. Cercare una riga `en` nel sidecar
 * reintrodurrebbe di nascosto il fallback per riga che stiamo evitando.
 */
export function pickTranslation<T extends { lang?: string | null }>(
  translations: T[] | null | undefined,
  lang: string,
): T | null {
  if (!translations?.length) return null;
  return translations.find((t) => t.lang === lang) ?? null;
}
