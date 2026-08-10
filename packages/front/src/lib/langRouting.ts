import {
  ACTIVE_LANGS,
  DEFAULT_LANG,
  isSupportedLang,
  type SupportedLang,
} from '@thaiakha/shared/lib/i18n';
// Import dal sottopath `services`, non dal barrel root: quello ri-esporta anche
// gli asset (SVG) e trascinerebbe dentro mezza libreria per due funzioni.
import { translatedSlugService, type SlugMap } from '@thaiakha/shared/services';

/**
 * 🌍 ROUTING LINGUA — parsing e costruzione dei path multilingua.
 *
 * FORMA DELL'URL
 *   inglese      /authentic-thai-akha-recipes/pad-thai
 *   altra lingua /es/recetas-autenticas-thai-akha/pad-thai-autentico
 *
 * L'inglese vive alla RADICE e non ha mai prefisso: gli URL attuali non cambiano,
 * il ranking acquisito non si tocca. Il prefisso è la sola cosa che distingue.
 *
 * SEGMENTO A 2 LETTERE = SEMPRE LINGUA. Nessuno slug reale è di 2 lettere in
 * nessuna delle 12 lingue (verificato sul registro), quindi la regola non ha
 * ambiguità: un primo segmento di 2 lettere o è una lingua attiva, o è un
 * prefisso da rimuovere.
 *
 * ⚠️ Qui si fa il redirect LATO CLIENT (replaceState). Il 302 HTTP vero lo emette
 * il Cloudflare Worker, che è l'unico punto in cui passa ogni richiesta: senza
 * quello un crawler su /xx/qualcosa riceverebbe 200 invece di un redirect.
 * Le due regole devono restare identiche — vedi cloudflare-worker.js.
 */

const TWO_LETTER = /^[a-z]{2}$/i;

export interface LangRoute {
  /** Lingua da servire. Sempre una lingua ATTIVA (a flag spento è sempre 'en'). */
  lang: SupportedLang;
  /** Segmenti del path SENZA il prefisso lingua. */
  segments: string[];
  /** true se l'URL portava un prefisso lingua valido. */
  hasPrefix: boolean;
  /**
   * Path verso cui normalizzare, o null se l'URL va già bene.
   * Vale per: prefisso ignoto (/xx/), lingua spenta dal flag, prefisso /en/
   * (l'inglese non ha prefisso, mai).
   */
  redirectTo: string | null;
}

/** Una lingua è navigabile solo se è nel perimetro E accesa dal flag. */
const isActiveLang = (value: string): value is SupportedLang =>
  isSupportedLang(value) && (ACTIVE_LANGS as readonly string[]).includes(value);

/**
 * Legge il prefisso lingua da un pathname.
 *
 * Il redirect CONSERVA il resto del path: `/xx/qualcosa` → `/qualcosa`, non `/`.
 * Buttare l'utente in home per un prefisso sbagliato gli farebbe perdere la
 * pagina che stava cercando — e a un crawler direbbe che quel contenuto non esiste.
 */
export function parseLangPath(pathname: string): LangRoute {
  const segments = pathname.split('/').filter(Boolean);
  const first = segments[0];

  if (first && TWO_LETTER.test(first)) {
    const candidate = first.toLowerCase();
    const rest = segments.slice(1);

    // Lingua attiva e diversa dall'inglese → prefisso valido.
    if (candidate !== DEFAULT_LANG && isActiveLang(candidate)) {
      return { lang: candidate, segments: rest, hasPrefix: true, redirectTo: null };
    }

    // Tutto il resto è un prefisso da togliere, conservando il path:
    //  · /en/... → l'inglese non ha prefisso, mai
    //  · /es/... a flag spento → quella lingua non è ancora accesa
    //  · /xx/... → lingua inesistente
    // Deliberatamente TEMPORANEO (302, non 301): malese e hindi arriveranno, e
    // nessun browser o crawler deve avere in cache un permanente da smontare.
    return {
      lang: DEFAULT_LANG,
      segments: rest,
      hasPrefix: false,
      redirectTo: `/${rest.join('/')}`,
    };
  }

  return { lang: DEFAULT_LANG, segments, hasPrefix: false, redirectTo: null };
}

/**
 * Costruisce un path per una lingua a partire dagli slug INGLESI.
 * Gli slug inglesi sono l'identità interna: ogni link nasce in inglese e viene
 * localizzato qui, in un punto solo.
 */
export function buildLangPath(
  lang: SupportedLang,
  enSegments: string[],
  slugMap: SlugMap | null,
): string {
  const localized = enSegments
    .filter(Boolean)
    .map((seg) => translatedSlugService.toLocalizedSlug(slugMap, seg));

  const prefix = lang === DEFAULT_LANG ? '' : `/${lang}`;
  if (localized.length === 0) return prefix === '' ? '/' : `${prefix}/`;
  return `${prefix}/${localized.join('/')}`;
}

/**
 * Traduce i segmenti in ingresso (URL utente) in segmenti INGLESI (identità DB).
 *
 * Due passaggi: prima la mappa della lingua corrente, poi — per gli slug che
 * quella mappa non conosce — il soccorso cross-lingua sulle mappe già in cache
 * (sincrono, zero rete). Il soccorso copre lo slug "straniero" finito sotto il
 * prefisso sbagliato: senza, /zh/ingredientes-cozinha-tailandesa non sarebbe
 * risolvibile mai (la mappa zh è vuota per design). Uno slug che nessuno
 * conosce resta com'è: o è già inglese o è un alias legacy (li gestisce App).
 */
export function toEnglishSegments(segments: string[], slugMap: SlugMap | null): string[] {
  return segments.map((seg) => {
    const viaCurrent = translatedSlugService.toEnglishSlug(slugMap, seg);
    if (viaCurrent !== seg) return viaCurrent;
    return translatedSlugService.peekReverseToEnglish(seg) ?? seg;
  });
}

/**
 * Path canonico della pagina NELLA lingua corrente, se l'URL attuale non lo è.
 *
 * Copre, con una regola sola:
 *  · slug inglese sotto prefisso   → /es/about-…      → /es/sobre-…
 *  · slug di un'ALTRA lingua       → /zh/ingredientes-… → /zh/thai-cooking-ingredients
 *  · slug straniero alla radice EN → /ingredientes-…  → /thai-cooking-ingredients
 *    (ci si arriva via strip del prefisso: /xx/ingredientes-… → radice)
 *
 * Restituisce null quando l'URL è già quello giusto — che è il caso di ogni
 * navigazione normale: la correzione è un binario di soccorso, non la via.
 */
export function canonicalSlugRedirect(
  lang: SupportedLang,
  segments: string[],
  slugMap: SlugMap | null,
): string | null {
  // Mappa non ancora caricata (lingue europee al primo giro): niente correzione
  // ora — l'effetto rifarà il check quando la mappa arriva.
  if (!slugMap) return null;

  const enSegments = toEnglishSegments(segments, slugMap);
  const canonical = buildLangPath(lang, enSegments, slugMap);
  const current = lang === DEFAULT_LANG
    ? (segments.length ? `/${segments.join('/')}` : '/')
    : `/${lang}/${segments.join('/')}`;

  return canonical !== current ? canonical : null;
}
