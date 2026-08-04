import { Globe } from 'lucide-react';
import { useI18n } from '../../context/I18nContext';
import { LANGUAGES } from '../../i18n';

const LANG_LABELS: Record<string, string> = {
  en: 'EN',
  th: 'TH',
  es: 'ES',
  zh: 'ZH',
};

export const LanguageSwitcher: React.FC = () => {
  const { lang, setLang, switching } = useI18n();

  const cycle = () => {
    const idx = LANGUAGES.indexOf(lang);
    const next = LANGUAGES[(idx + 1) % LANGUAGES.length];
    setLang(next);
  };

  return (
    <button
      onClick={cycle}
      disabled={switching}
      className="flex items-center gap-1.5 h-10 px-3 rounded-lg
                 hover:bg-gray-100 dark:hover:bg-gray-800
                 transition-colors disabled:opacity-50 disabled:cursor-not-allowed
                 text-gray-600 dark:text-gray-400"
      aria-label={`Switch language — current: ${lang}`}
    >
      <Globe className="w-4 h-4 shrink-0" />
      <span className="text-sm font-bold uppercase tracking-widest">
        {LANG_LABELS[lang] ?? lang.toUpperCase()}
      </span>
      {switching && (
        <span className="h-3 w-3 rounded-full border-2 border-current border-t-transparent animate-spin" />
      )}
    </button>
  );
};
