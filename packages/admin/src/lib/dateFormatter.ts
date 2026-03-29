/**
 * Dynamic date formatter that respects user's selected language via i18n
 * Maps i18n language codes to Intl locale strings
 */

export const getLocaleCode = (language: string): string => {
  const localeMap: Record<string, string> = {
    en: 'en-US',
    th: 'th-TH',
    it: 'it-IT',
  };
  return localeMap[language] || 'en-US';
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
