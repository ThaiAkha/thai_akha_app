import { useTheme } from "../../context/ThemeContext";
import { Sun, Moon } from "lucide-react";
import { useTranslation } from "react-i18next";

export default function ThemeTogglerTwo() {
  const { theme, toggleTheme } = useTheme();
  const { t } = useTranslation('common');

  return (
    <button
      onClick={toggleTheme}
      className="inline-flex items-center justify-center text-white transition-colors rounded-full size-14 bg-primary-500 hover:bg-primary-600"
      aria-label={t('aria.toggleTheme')}
    >
      {theme === 'dark' ? (
        <Sun size={20} className="text-white" />
      ) : (
        <Moon size={20} className="text-white" />
      )}
    </button>
  );
}