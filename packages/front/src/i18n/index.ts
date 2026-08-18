/**
 * 🌍 i18n FRONT — stringhe UI in 12 lingue, motore i18next.
 *
 * Speculare all'admin (packages/admin/src/i18n) — stesso motore, stesso
 * formato JSON per namespace, stesso traduttore (/i18n) — con DUE differenze
 * volute:
 *
 *   1. LA LINGUA VIENE DALL'URL, non dal browser. Nessun LanguageDetector:
 *      su /es/… la UI è spagnola per chiunque, coerente con contenuti, SEO e
 *      cache. La imposta il LanguageProvider (context/LanguageContext) via
 *      `syncI18nLanguage(lang)`. Se nessuno la imposta: inglese.
 *   2. LE CHIAVI SONO TIPIZZATE dai JSON inglesi (./types.ts): `t('quiz:x')`
 *      con una chiave inesistente è un ERRORE tsc, non un warning a runtime
 *      in giapponese quando nessuno guarda. L'inglese è lo SCHEMA; le altre
 *      11 lingue possono mancare di chiavi (fallback per chiave su EN, mai
 *      per file — la stessa regola dei sidecar DB).
 *
 * NAMESPACE = un file per dominio/pagina (23), gli stessi del vecchio
 * ui-strings.ts: common, nav, auth, booking, quiz, recipes, … Vedi
 * locales/en/ per la lista; ogni lingua ha la stessa cartella.
 *
 * Aggiungere una lingua = SUPPORTED_LANGS in @thaiakha/shared/lib/i18n
 * (una riga) + cartella locales/{lang}/ prodotta da /i18n. Qui zero righe.
 */
import i18next from 'i18next';
import resourcesToBackend from 'i18next-resources-to-backend';
import { initReactI18next } from 'react-i18next';
import { DEFAULT_LANG, SUPPORTED_LANGS, type SupportedLang } from '@thaiakha/shared/lib/i18n';

// Istanza dedicata (non il singleton globale): l'admin fa lo stesso, e in
// futuro le due app potrebbero convivere in un test o in uno storybook.
export const i18n = i18next.createInstance();

/**
 * I 23 namespace = i file in locales/en/. Elencati qui e non derivati a
 * runtime perché i18next li vuole all'init; il check `pnpm check-ui-strings`
 * verifica che la lista e la cartella coincidano.
 */
export const NAMESPACES = [
  'common', 'errors', 'components', 'nav', 'auth', 'booking',
  'history', 'faq', 'classes', 'news', 'recipes', 'recipeSingle',
  'quiz', 'user', 'location', 'menu', 'contact', 'about', 'home',
  'seo', 'alt', 'cherry', 'blog',
] as const;
export type Namespace = (typeof NAMESPACES)[number];

// Il primo paint deve avere l'inglese SINCRONO (niente flash di chiavi grezze):
// `common` e i namespace di shell si importano eager; il resto è lazy per
// lingua+namespace via resourcesToBackend (il giapponese si scarica su /ja/).
import enCommon from './locales/en/common.json';
import enNav from './locales/en/nav.json';
import enErrors from './locales/en/errors.json';
import enComponents from './locales/en/components.json';
const SHELL_NS = new Set(['common', 'nav', 'errors', 'components']);

// Accesso LETTERALE a import.meta.env (Vite lo inlina) in try/catch: fuori dal
// browser (test Node, tooling) `import.meta.env` non esiste → false.
let IS_DEV = false;
try { IS_DEV = Boolean(import.meta.env.DEV); } catch { /* Node */ }

let initPromise: Promise<typeof i18n> | null = null;

export const initI18n = (lng: SupportedLang = DEFAULT_LANG): Promise<typeof i18n> => {
  if (initPromise) return initPromise;
  initPromise = i18n
    .use(resourcesToBackend((language: string, namespace: string) => {
      // I 4 namespace di shell inglesi sono già in `resources` (eager):
      // saltarli qui evita che Vite li metta in due chunk.
      if (language === DEFAULT_LANG && SHELL_NS.has(namespace)) return Promise.resolve({});
      return import(`./locales/${language}/${namespace}.json`);
    }))
    .use(initReactI18next)
    .init({
      lng,
      fallbackLng: DEFAULT_LANG,
      supportedLngs: SUPPORTED_LANGS as unknown as string[],
      ns: NAMESPACES as unknown as string[],
      defaultNS: 'common',
      // Chiavi annidate a punti (`quiz:hint.title`), array con returnObjects.
      keySeparator: '.',
      nsSeparator: ':',
      returnObjects: false,
      interpolation: { escapeValue: false }, // React già escapa
      // Namespace di shell caricati subito, in inglese: zero flash.
      resources: {
        en: { common: enCommon, nav: enNav, errors: enErrors, components: enComponents },
      },
      partialBundledLanguages: true,
      react: { useSuspense: false },
      saveMissing: IS_DEV,
      missingKeyHandler: (_l, ns, key) => {
        if (IS_DEV) console.warn(`[i18n] chiave mancante: ${ns}:${key}`);
      },
    })
    .then(() => i18n);
  return initPromise;
};

/**
 * Ponte con il LanguageProvider: la lingua dell'URL diventa la lingua di i18n.
 * Idempotente e sicura da chiamare a ogni cambio route.
 */
export const syncI18nLanguage = (lang: SupportedLang): void => {
  if (!i18n.isInitialized) { void initI18n(lang); return; }
  if (i18n.language !== lang) void i18n.changeLanguage(lang);
};

export default i18n;

// ─── Facciata `t` a chiave — sostituto 1:1 del vecchio oggetto ─────────────
/**
 * `t('quiz:hint.title')` · `t('common:welcomeBack', { name })`.
 *
 * Perché una facciata e non `useTranslation()` in ogni componente: 66 file
 * usavano `t` come oggetto statico; iniettare un hook in ognuno è un
 * refactor strutturale senza beneficio, perché al cambio lingua il
 * LanguageProvider (sopra App) rimonta comunque l'albero — nessun componente
 * resta indietro. Chi vuole reattività fine può sempre importare
 * `useTranslation` da react-i18next: le due vie leggono la stessa istanza.
 *
 * Tipizzata: chiave inesistente = errore tsc (vedi types.ts). Prima del
 * primo `initI18n` risponde con la chiave stessa — mai un crash a import-time.
 */
export const t: typeof i18n.t = ((...args: Parameters<typeof i18n.t>) =>
  (i18n.t as unknown as (...a: unknown[]) => string)(...args)) as typeof i18n.t;

/**
 * `tObj('common:monthsShort')` → l'ARRAY/OGGETTO tipizzato dal JSON EN.
 * Per le poche chiavi non-stringa (mesi, card, mappe dieta/piccantezza):
 * i18next le restituisce solo con `returnObjects: true`, e il tipo di
 * ritorno lo prendiamo dal JSON inglese così `.map`/l'indicizzazione
 * restano controllate da tsc.
 */
type Res = import('./types').FrontResources;
// Tutte le path "a.b.c" di T il cui valore NON è una stringa (array/oggetti),
// a qualsiasi profondità — es. 'auth:onboarding.chef.cards'.
type ObjPaths<T, P extends string = ''> = T extends readonly unknown[] ? P
  : T extends object ? { [K in keyof T & string]:
      T[K] extends string ? never
      : ObjPaths<T[K], P extends '' ? K : `${P}.${K}`> | (P extends '' ? K : `${P}.${K}`)
    }[keyof T & string]
  : never;
type ObjKey = { [N in keyof Res & string]: `${N}:${ObjPaths<Res[N]>}` }[keyof Res & string];
type Get<T, P extends string> = P extends `${infer H}.${infer R}`
  ? H extends keyof T ? Get<T[H], R> : never : P extends keyof T ? T[P] : never;
type ObjOf<K extends ObjKey> = K extends `${infer N}:${infer P}`
  ? N extends keyof Res ? Get<Res[N], P> : never : never;

export const tObj = <K extends ObjKey>(key: K): ObjOf<K> =>
  (i18n.t as (k: string, o: Record<string, unknown>) => unknown)(key, { returnObjects: true }) as ObjOf<K>;
