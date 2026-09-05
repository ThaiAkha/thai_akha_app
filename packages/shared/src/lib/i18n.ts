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

/**
 * Lingue delle email automatiche (#142 agenzie, #172 clienti): `profiles.preferred_language`
 * accetta solo queste (check `profiles_preferred_language_check`, migration 20260903100000).
 * Il front ha 12 lingue: `pickEmailLang` riduce la lingua del sito a questo set, altrimenti 'en'.
 * Le edge scelgono poi il pack che hanno davvero (oggi B2C solo EN) e ricadono su 'en'.
 */
export const EMAIL_LANGS = ['en', 'th', 'es', 'zh'] as const;
export type EmailLang = (typeof EMAIL_LANGS)[number];
export const pickEmailLang = (lang: string | null | undefined): EmailLang =>
  (EMAIL_LANGS as readonly string[]).includes(lang ?? '') ? (lang as EmailLang) : 'en';

export const isSupportedLang = (value: unknown): value is SupportedLang =>
  typeof value === 'string' && (SUPPORTED_LANGS as readonly string[]).includes(value);

/** Normalizza un tag lingua: 'th-TH' → 'th', 'ZH' → 'zh'. */
export const normalizeLangTag = (lang: string | null | undefined): string =>
  lang?.split('-')[0].toLowerCase() || DEFAULT_LANG;

// ─── LINGUE ATTIVE: UNA variabile a LISTA ─────────────────────────────────────

/**
 * 🔴 UN SOLO INTERRUTTORE, a LISTA: `VITE_I18N_LANGS` (front, inlinata da Vite al
 * build; in CI arriva dal workflow come repository variable) e `I18N_LANGS`
 * (Node e tooling; stesso nome nelle edge Deno come secret e nel worker come var).
 *
 * Valore = codici a 2 lettere separati da virgola: 'es' oppure 'es,fr'.
 * Vuota o assente = solo inglese, il sito di oggi. Codici fuori da SUPPORTED_LANGS
 * scartati, 'en' sempre dentro, ordine = SUPPORTED_LANGS (mai quello digitato).
 * Nessuna parola magica: accendere tutto si scrive per esteso, cosi' allargare il
 * perimetro a ms/hi non accende una lingua che nessuno ha scritto.
 * Fail-closed per costruzione: un refuso ('es;fr') produce una lista PIU' CORTA.
 *
 * Perche' una lista e non un booleano (2026-09-05): acceso/spento poteva accendere
 * solo tutte e 11 le lingue insieme, ma solo `es` ha page_sections,
 * info_page_sections e legal_documents completi. Con la lista si accende una
 * lingua per volta, e il cluster hreflang da smontare in un rollback e' di 2 voci.
 *
 * Il vecchio booleano VITE_I18N_ROUTES / I18N_ROUTES_ENABLED non e' piu' letto da
 * nessuno, e scripts/check-env.mjs interrompe il build se lo trova: un 'true'
 * dimenticato deve fare rumore, non riaccendere 11 lingue.
 *
 * Le altre copie del perimetro, con lo STESSO parser da tenere identico a mano:
 *   supabase/functions/_shared/langPerimeter.ts  (Deno: sitemap + og-meta-tags)
 *   brain 052_Cloudflare/worker-og-meta-tags.js   (Cloudflare Worker)
 *
 * ⚠️ Vite inlina SOLO l'accesso LETTERALE `import.meta.env.VITE_X` (vedi supabase.ts):
 * niente chiavi dinamiche, o nel bundle browser resta undefined.
 */
export const parseLangList = (raw: string | null | undefined): readonly SupportedLang[] => {
  const wanted = new Set(
    (raw ?? '').toLowerCase().split(',').map((s) => s.trim()).filter(Boolean),
  );
  return SUPPORTED_LANGS.filter((l) => l === DEFAULT_LANG || wanted.has(l));
};

let viteI18nLangs: string | undefined;
try {
  viteI18nLangs = import.meta.env.VITE_I18N_LANGS;
} catch {
  /* Node/Deno: import.meta.env assente → si guarda process.env */
}

const readLangListRaw = (): string | undefined => {
  if (typeof process !== 'undefined' && process.env?.I18N_LANGS !== undefined) {
    return process.env.I18N_LANGS;
  }
  return viteI18nLangs;
};

/**
 * Le lingue effettivamente navigabili ADESSO. Router, hreflang, switcher e sitemap
 * iterano su questa lista, non su SUPPORTED_LANGS: l'accensione e' un fatto solo.
 */
export const ACTIVE_LANGS: readonly SupportedLang[] = parseLangList(readLangListRaw());

/** DERIVATO (non letto dall'ambiente): esiste almeno una lingua a prefisso attiva. */
export const PREFIX_ROUTES_ACTIVE: boolean = ACTIVE_LANGS.length > 1;

/** Una lingua e' navigabile solo se e' nel perimetro E nella lista attiva. */
export const isActiveLang = (value: unknown): value is SupportedLang =>
  isSupportedLang(value) && (ACTIVE_LANGS as readonly string[]).includes(value);
