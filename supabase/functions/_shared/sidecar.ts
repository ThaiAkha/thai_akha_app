// COPIA GENERATA da packages/shared/src/lib/mergeTranslation.ts - NON editare qui: `pnpm sync-sidecar` (controllo: `pnpm check-sidecar`).
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
 * · `source_hash`/`translated_at`/`verified_at`/`verified_by`: contabilita' del
 *   sistema di staleness (v_translations_stale, mark_fresh). Oggi nessuna select
 *   le chiede, ma un domani `select('*')` su un sidecar le porterebbe dentro la
 *   riga madre: qui non entrano per costruzione, non per attenzione di chi scrive.
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
  'source_hash',
  'translated_at',
  'verified_at',
  'verified_by',
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

// ─── Lettura generica dei sidecar ─────────────────────────────────────────────
//
// Tre funzioni, una regola: join, filtro e merge ricevono la STESSA variabile
// lingua e, se c'e' una relazione incorporata con un suo sidecar, la STESSA
// costante di chiavi (es. `const RECIPE_EMBEDDED = ['content_categories'] as const`).
// Il cast che PostgREST rende inevitabile sulle select concatenate vive UNA volta,
// dentro `mergeSidecarRow`: i call site passano `data` nudo e dichiarano la forma
// con `<T>`, senza `as unknown as` e senza commenti ripetuti (regola repo #20).

/**
 * Join PostgREST del sidecar, da CONCATENARE a una select esistente.
 *
 * A lingua inglese torna stringa vuota: la base È l'inglese, il join non serve
 * e la query resta identica a prima (zero costo sul 90% del traffico).
 *
 * Va SEMPRE in coppia con `sidecarFilter` sulla stessa query: il join incorpora,
 * il filtro sfoltisce. Senza filtro ci si porta a casa 11 traduzioni per riga.
 *
 * @param sidecarTable nome COMPLETO del sidecar (`page_sections_translations`)
 * @param fields       le sole colonne di CONTENUTO: mai id/lang/date/source_hash
 */
export const sidecarJoin = (
  sidecarTable: string,
  fields: readonly string[],
  lang: string,
): string =>
  lang === 'en' ? '' : `, translations:${sidecarTable}(lang, ${fields.join(', ')})`;

/**
 * Filtro lingua sulle righe incorporate dal join: la controparte obbligatoria di
 * `sidecarJoin`. In inglese non tocca la query (il join non c'e'). E' un filtro su
 * risorsa incorporata: sfoltisce l'array annidato senza togliere le righe madri
 * (niente `!inner`, o una pagina non ancora tradotta sparirebbe).
 *
 * `embedPaths` = alias delle relazioni incorporate che portano un loro sidecar
 * ('category', 'content_categories'): la STESSA costante passata poi a
 * `mergeSidecarRow(s)` come `embeddedKeys`. Alias del join e chiave del merge
 * coincidono per costruzione PostgREST, quindi una costante sola basta.
 *
 * Va chiamata PRIMA di `.single()`/`.maybeSingle()`: dopo non esiste piu' `.eq`, e
 * il vincolo strutturale lo segnala a compile time. Nessun import dei tipi
 * PostgREST: basta che `eq(column, value)` restituisca lo stesso builder.
 */
export const sidecarFilter = <Q extends { eq(column: string, value: string): Q }>(
  query: Q,
  lang: string,
  embedPaths: readonly string[] = [],
): Q => {
  if (lang === 'en') return query;
  let q = query.eq('translations.lang', lang);
  for (const p of embedPaths) q = q.eq(`${p}.translations.lang`, lang);
  return q;
};

/**
 * Fonde una riga che porta con sé `translations` (dal join qui sopra) e toglie
 * quella chiave dal risultato: il consumatore riceve la stessa forma di prima,
 * coi campi già nella lingua giusta. Fallback per CAMPO (mergeTranslation).
 *
 * `row` e' `unknown` di proposito: e' l'UNICO punto del repo dove si accetta che
 * PostgREST non inferisca una select concatenata. I call site passano `data` cosi'
 * com'e' e dichiarano la forma con `<T>`; senza `<T>` esce Record<string, unknown>.
 * `T` e' senza vincolo perche' le interfacce di dominio (NewsArticle, RecipeLink…)
 * non hanno index signature e non passerebbero `extends Record<string, unknown>`.
 */
export const mergeSidecarRow = <T = Record<string, unknown>>(
  row: unknown,
  lang: string,
  embeddedKeys: readonly string[] = [],
): T => {
  // Cast unico (regola repo #20): PostgREST tipizza la select concatenata come
  // GenericStringError, non come la riga. Il cast vive QUI e in nessun call site.
  const { translations, ...rest } = row as Record<string, unknown>;
  let base: Record<string, unknown> = rest;

  // Relazioni incorporate che portano a loro volta un sidecar: una ricetta porta
  // dentro la sua content_category, e il titolo della categoria va tradotto con la
  // stessa regola. Ricorsione a un livello per chiave dichiarata, mai automatica:
  // scendere da soli in ogni oggetto annidato romperebbe media_assets e authors,
  // che un sidecar non ce l'hanno.
  for (const key of embeddedKeys) {
    const child = base[key];
    if (Array.isArray(child)) {
      base = { ...base, [key]: child.map((c) => mergeSidecarRow(c, lang)) };
    } else if (child && typeof child === 'object') {
      base = { ...base, [key]: mergeSidecarRow(child, lang) };
    }
  }

  if (lang === 'en') return base as T;
  const t = pickTranslation(translations as Array<{ lang?: string | null }> | null, lang);
  return mergeTranslation(base, t as Record<string, unknown> | null) as T;
};

/** `mergeSidecarRow` su una lista. `rows` accetta `data` di qualsiasi select senza cast. */
export const mergeSidecarRows = <T = Record<string, unknown>>(
  rows: readonly unknown[] | null | undefined,
  lang: string,
  embeddedKeys: readonly string[] = [],
): T[] => (rows ?? []).map((r) => mergeSidecarRow<T>(r, lang, embeddedKeys));
