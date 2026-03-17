import React, { createContext, useContext, useEffect, useState } from 'react';
import { I18nextProvider } from 'react-i18next';
import type { i18n as I18nInstance } from 'i18next';
import { LangCode, LANG_STORAGE_KEY, initI18n } from '../i18n';

interface I18nContextValue {
  lang: LangCode;
  setLang: (l: LangCode) => Promise<void>;
  switching: boolean;
}

const I18nContext = createContext<I18nContextValue | undefined>(undefined);

export const useI18n = (): I18nContextValue => {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error('useI18n must be used inside <I18nProvider>');
  return ctx;
};

export const I18nProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [instance, setInstance] = useState<I18nInstance | null>(null);
  const [lang, setLangState] = useState<LangCode>('en');
  const [switching, setSwitching] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(LANG_STORAGE_KEY);
    const initial: LangCode = stored === 'th' ? 'th' : 'en';

    initI18n(initial).then((inst) => {
      setInstance(inst);
      setLangState(initial);
      document.documentElement.lang = initial;
    });
  }, []);

  const setLang = async (newLang: LangCode) => {
    if (!instance || newLang === lang) return;
    setSwitching(true);
    await instance.changeLanguage(newLang);
    localStorage.setItem(LANG_STORAGE_KEY, newLang);
    setLangState(newLang);
    document.documentElement.lang = newLang;
    setSwitching(false);
  };

  // Show full-screen spinner only during initial load
  if (!instance) {
    return (
      <div className="flex items-center justify-center h-screen bg-white dark:bg-gray-900">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-brand-500" />
      </div>
    );
  }

  return (
    <I18nContext.Provider value={{ lang, setLang, switching }}>
      <I18nextProvider i18n={instance}>
        {children}
      </I18nextProvider>
    </I18nContext.Provider>
  );
};
