/**
 * Dynamic date formatter that respects user's selected language via i18n
 * Maps i18n language codes to Intl locale strings
 */

/**
 * Mappa le 4 lingue dell'interfaccia (LangCode) sui locale Intl.
 * SORGENTE UNICA: non ridefinire una `getLocale` locale nei componenti - era gia'
 * successo in 4 punti, tutti fermi a en/th, quindi in cinese e spagnolo date e numeri
 * uscivano in formato inglese.
 */
export const getLocaleCode = (language: string): string => {
  const localeMap: Record<string, string> = {
    en: 'en-GB',
    th: 'th-TH',
    es: 'es-ES',
    zh: 'zh-CN',
  };
  return localeMap[language] || 'en-GB';
};

/**
 * Format date respecting user's selected language
 * @param dateStr - ISO date string or Date object
 * @param language - i18n language code ('en', 'th', etc.)
 * @param options - Intl.DateTimeFormatOptions
 * @returns Formatted date string
 */
export const formatDateByLanguage = (
  dateStr: string | Date,
  language: string,
  options: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'short', year: 'numeric' }
): string => {
  const date = typeof dateStr === 'string' ? new Date(dateStr) : dateStr;
  const localeCode = getLocaleCode(language);
  return date.toLocaleDateString(localeCode, options);
};
