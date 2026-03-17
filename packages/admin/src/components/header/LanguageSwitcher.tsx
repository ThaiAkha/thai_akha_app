import { Globe } from 'lucide-react';
import { useI18n } from '../../context/I18nContext';
import type { LangCode } from '../../i18n';

export const LanguageSwitcher: React.FC = () => {
  const { lang, setLang, switching } = useI18n();

  const toggle = () => {
    const next: LangCode = lang === 'en' ? 'th' : 'en';
    setLang(next);
  };

  return (
    <button
      onClick={toggle}
      disabled={switching}
      className="flex items-center gap-1.5 h-10 px-3 rounded-lg
                 hover:bg-gray-100 dark:hover:bg-gray-800
                 transition-colors disabled:opacity-50 disabled:cursor-not-allowed
                 text-gray-600 dark:text-gray-400"
      aria-label={`Switch language — current: ${lang}`}
    >
      <Globe className="w-4 h-4 shrink-0" />
      <span className="text-sm font-bold uppercase tracking-widest">
        {lang}
      </span>
      {switching && (
        <span className="h-3 w-3 rounded-full border-2 border-current border-t-transparent animate-spin" />
      )}
    </button>
  );
};
