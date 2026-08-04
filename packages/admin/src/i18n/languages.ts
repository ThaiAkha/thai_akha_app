import type { LangCode } from './index';

/**
 * 🌍 LANGUAGE REGISTRY — single source of truth per lo switcher lingua.
 *
 * Aggiungere una lingua in futuro (fr, it, de, pt…):
 *   1. estendi `LangCode` / `LANGUAGES` in `./index.ts`
 *   2. crea la cartella `locales/<code>/` con i namespace (lo skill /i18n traduce)
 *   3. aggiungi lo SVG bandiera in `components/ui/flags/` e mappalo in `Flag.tsx`
 *   4. aggiungi UNA riga qui sotto
 * Lo switcher in UserDropdown legge da qui e si auto-adatta (4 → 5 → 6 lingue).
 *
 * `label` = nome nativo della lingua (mostrato all'utente).
 * `country` = codice ISO usato per scegliere la bandiera (non sempre == code lingua).
 */
export interface LanguageMeta {
  code: LangCode;
  label: string;
  country: string;
}

export const LANGUAGE_META: LanguageMeta[] = [
  { code: 'en', label: 'English',  country: 'gb' },
  { code: 'th', label: 'ไทย',       country: 'th' },
  { code: 'es', label: 'Español',  country: 'es' },
  { code: 'zh', label: '中文',       country: 'cn' },
  // Future: { code: 'fr', label: 'Français', country: 'fr' }, etc.
];

export const getLanguageMeta = (code: LangCode): LanguageMeta =>
  LANGUAGE_META.find((l) => l.code === code) ?? LANGUAGE_META[0];
