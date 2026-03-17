import i18next from 'i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import resourcesToBackend from 'i18next-resources-to-backend';
import { initReactI18next } from 'react-i18next';

export type LangCode = 'en' | 'th';
export const LANGUAGES: readonly LangCode[] = ['en', 'th'] as const;
export const DEFAULT_LANGUAGE: LangCode = 'en';
export const LANG_STORAGE_KEY = 'thaiakha_admin_lang';

// Use a dedicated instance (not the global i18next) to avoid collisions
export const i18n = i18next.createInstance();

export const initI18n = async (lng?: LangCode) => {
  if (i18n.isInitialized) return i18n;

  await i18n
    .use(resourcesToBackend((language: string, namespace: string) =>
      import(`./locales/${language}/${namespace}.json`)
    ))
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
      lng,
      fallbackLng: DEFAULT_LANGUAGE,
      supportedLngs: LANGUAGES,
      ns: [
        'common', 'auth', 'navigation',
        'profile', 'dashboard', 'calendar',
        'booking', 'hotels', 'database',
        'storage', 'inventory', 'logistics',
        'reservation', 'pos', 'pages',
      ],
      defaultNS: 'common',
      interpolation: { escapeValue: false },
      detection: {
        order: ['localStorage'],
        lookupLocalStorage: LANG_STORAGE_KEY,
        caches: ['localStorage'],
      },
      saveMissing: import.meta.env.DEV,
      missingKeyHandler: (_lngs, _ns, key) => {
        if (import.meta.env.DEV) console.warn(`[i18n] missing key: ${key}`);
      },
    });

  return i18n;
};

export default i18n;
