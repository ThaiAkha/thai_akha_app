import { useTheme } from "../../context/ThemeContext";
import { Sun, Moon } from "lucide-react";
import { useMemo } from "react";

export const ThemeToggleButton: React.FC = () => {
  const { theme, toggleTheme } = useTheme();

  const icon = useMemo(() => {
    return theme === 'dark'
      ? <Sun size={20} className="text-gray-400" />
      : <Moon size={20} className="text-gray-500" />;
  }, [theme]);

  return (
    <button
      onClick={toggleTheme}
      className="relative flex items-center justify-center text-gray-500 transition-colors bg-white border border-gray-200 rounded-full hover:text-dark-900 h-10 w-10 hover:bg-gray-100 hover:text-gray-700 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white"
      aria-label="Toggle theme"
    >
      {icon}
    </button>
  );
};