/**
 * 🌍 PERIMETRO LINGUE + LISTA ATTIVA - copia Deno di packages/shared/src/lib/i18n.ts.
 *
 * Le Edge Functions girano su Deno e non importano da @thaiakha/shared: questa e'
 * la copia per sitemap e og-meta-tags (prima erano DUE copie, una per funzione).
 * La terza copia e' il Cloudflare Worker (brain 052). Il parser va tenuto
 * IDENTICO nelle tre: una divergenza non da' errori, produce gruppi hreflang non
 * reciproci o un 302 su una lingua annunciata in sitemap, in silenzio.
 *
 * Interruttore a LISTA: secret `I18N_LANGS` = codici a 2 lettere separati da
 * virgola ('es' | 'es,fr'). Vuoto o assente = solo inglese. Codici ignoti
 * scartati, 'en' sempre dentro, ordine = SUPPORTED_LANGS. Nessuna parola magica.
 * Il vecchio I18N_ROUTES_ENABLED non e' piu' letto: un 'true' dimenticato non
 * accende nulla.
 *
 * `activeLangs()` legge l'env PER RICHIESTA, non al load del modulo: se la
 * piattaforma propaga il secret agli isolate vivi il cambio e' immediato; se non
 * lo fa, il redeploy resta l'unico costo e nessun comportamento cambia.
 */
export const DEFAULT_LANG = "en";
export const SUPPORTED_LANGS = [
  "en", "es", "fr", "de", "pt", "it", "ca", "nl", "th", "zh", "ko", "ja",
] as const;
export type SupportedLang = (typeof SUPPORTED_LANGS)[number];

export const OG_LOCALES: Record<string, string> = {
  en: "en_US", es: "es_ES", fr: "fr_FR", de: "de_DE", pt: "pt_PT", it: "it_IT",
  ca: "ca_ES", nl: "nl_NL", th: "th_TH", zh: "zh_CN", ko: "ko_KR", ja: "ja_JP",
};

/** 'es, FR,xx' -> ['en','es','fr']. Identica a parseLangList di shared/lib/i18n.ts. */
export function parseLangList(raw: string | null | undefined): readonly string[] {
  const wanted = new Set(
    (raw ?? "").toLowerCase().split(",").map((s) => s.trim()).filter(Boolean),
  );
  return SUPPORTED_LANGS.filter((l) => l === DEFAULT_LANG || wanted.has(l));
}

/** Lingue attive ADESSO, lette per richiesta dal secret I18N_LANGS. */
export const activeLangs = (): readonly string[] => parseLangList(Deno.env.get("I18N_LANGS"));

/** DERIVATO: almeno una lingua a prefisso e' attiva. */
export const prefixRoutesActive = (): boolean => activeLangs().length > 1;

/** Le lingue attive a prefisso (senza 'en'): per le letture del registro slug. */
export const prefixedActiveLangs = (): readonly string[] => activeLangs().filter((l) => l !== DEFAULT_LANG);
