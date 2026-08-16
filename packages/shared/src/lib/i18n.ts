/**
 * 🌍 PERIMETRO LINGUE — fonte UNICA del sistema multilingua.
 *
 * Aggiungere una lingua (es. malese, hindi) = aggiungere una riga a SUPPORTED_LANGS
 * e la sua etichetta in LANG_LABELS + il suo og:locale in OG_LOCALES. Nient'altro:
 * router, hreflang, sitemap e switcher leggono tutti da qui.
 *
 * REGOLA DI ROUTING: l'inglese vive alla RADICE (`/about-thai-akha-kitchen`), le
 * altre 11 lingue a PREFISSO (`/es/sobre-thai-akha-kitchen`). Gli URL inglesi
 * attuali NON cambiano mai — è il ranking già acquisito.
 */

export const DEFAULT_LANG = 'en';

/** Le 12 lingue del perimetro. EN alla radice, le altre 11 a prefisso. */
export const SUPPORTED_LANGS = [
  'en', // radice — nessun prefisso
  'es', 'fr', 'de', 'pt', 'it', 'ca', 'nl',
  'th', 'zh', 'ko', 'ja',
] as const;

export type SupportedLang = (typeof SUPPORTED_LANGS)[number];

/** Le lingue che compaiono come prefisso di path (tutte tranne l'inglese). */
export const PREFIXED_LANGS: readonly SupportedLang[] =
  SUPPORTED_LANGS.filter((l) => l !== DEFAULT_LANG);

/**
 * Etichette NATIVE per lo switcher: un utente cerca "Deutsch", non "German".
 * Volutamente in minuscolo/maiuscolo come si scrivono nella lingua stessa.
 */
export const LANG_LABELS: Record<SupportedLang, string> = {
  en: 'English',
  es: 'Español',
  fr: 'Français',
  de: 'Deutsch',
  pt: 'Português',
  it: 'Italiano',
  ca: 'Català',
  nl: 'Nederlands',
  th: 'ไทย',
  zh: '中文',
  ko: '한국어',
  ja: '日本語',
};

/** og:locale per lingua (formato Open Graph `xx_XX`). */
export const OG_LOCALES: Record<SupportedLang, string> = {
  en: 'en_US',
  es: 'es_ES',
  fr: 'fr_FR',
  de: 'de_DE',
  pt: 'pt_PT',
  it: 'it_IT',
  ca: 'ca_ES',
  nl: 'nl_NL',
  th: 'th_TH',
  zh: 'zh_CN',
  ko: 'ko_KR',
  ja: 'ja_JP',
};

/**
 * Le lingue per cui `v_translated_slugs` contiene slug tradotti.
 * Per th/zh/ko/ja la view NON ha righe (verificato: 1.938 = 7 lingue × 277 entità):
 * quelle lingue usano lo slug inglese e traducono solo i CONTENUTI. È by design —
 * evita URL in percent-encoding e non produce mai un 404.
 */
export const LANGS_WITH_TRANSLATED_SLUGS: readonly SupportedLang[] =
  ['es', 'fr', 'de', 'pt', 'it', 'ca', 'nl'];

/** `dir` per lingua: tutto il perimetro è ltr (nessuna lingua rtl in programma). */
export const LANG_DIR = 'ltr' as const;

export const isSupportedLang = (value: unknown): value is SupportedLang =>
  typeof value === 'string' && (SUPPORTED_LANGS as readonly string[]).includes(value);

/** Normalizza un tag lingua: 'th-TH' → 'th', 'ZH' → 'zh'. */
export const normalizeLangTag = (lang: string | null | undefined): string =>
  lang?.split('-')[0].toLowerCase() || DEFAULT_LANG;

// ─── INTERRUTTORE DI ACCENSIONE ───────────────────────────────────────────────

/**
 * 🔴 UN SOLO INTERRUTTORE per: route a prefisso · hreflang · voci lingua in sitemap.
 *
 * Spento (default) il sito è esattamente quello di oggi: solo inglese alla radice,
 * hreflang com'è nel DB, sitemap monolingua. Acceso, le tre cose si accendono
 * INSIEME — mai hreflang senza route, o daremmo a Google 11 alternate che
 * rispondono 302: una mappa di link morti.
 *
 * Accensione:
 *   app (front/admin) → `VITE_I18N_ROUTES=true` nel .env del package, poi rebuild
 *   edge sitemap      → secret `I18N_ROUTES_ENABLED=true` (Deno non importa shared)
 * Sono due superfici dello stesso interruttore: vanno girate insieme.
 *
 * ⚠️ Vite inlina SOLO l'accesso LETTERALE `import.meta.env.VITE_X` (vedi supabase.ts):
 * niente chiavi dinamiche, o nel bundle browser resta undefined.
 */
let viteI18nRoutes: string | undefined;
try {
  viteI18nRoutes = import.meta.env.VITE_I18N_ROUTES;
} catch {
  /* Node/Deno: import.meta.env assente → si guarda process.env */
}

const readFlag = (): boolean => {
  if (typeof process !== 'undefined' && process.env?.I18N_ROUTES_ENABLED) {
    return process.env.I18N_ROUTES_ENABLED === 'true';
  }
  return viteI18nRoutes === 'true';
};

export const I18N_ROUTES_ENABLED: boolean = readFlag();

/**
 * Le lingue effettivamente navigabili ADESSO. A flag spento è solo `['en']`:
 * router, hreflang e switcher iterano su questa lista, non su SUPPORTED_LANGS,
 * così l'accensione è un fatto solo.
 */
export const ACTIVE_LANGS: readonly SupportedLang[] =
  I18N_ROUTES_ENABLED ? SUPPORTED_LANGS : [DEFAULT_LANG];
