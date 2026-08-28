import { useState } from "react";
import { useTranslation } from "react-i18next";
import { DropdownItem } from "../ui/dropdown/DropdownItem";
import { Dropdown } from "../ui/dropdown/Dropdown";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";
import { useI18n } from "../../context/I18nContext";
import { LogOut, User, Sun, Moon, ChevronDown, Check } from "lucide-react";
import Tooltip from "../ui/Tooltip";
import { cn } from "@thaiakha/shared/lib/utils";
import Flag from "../ui/flags/Flag";
import { LANGUAGE_META, getLanguageMeta } from "../../i18n/languages";
import type { LangCode } from "../../i18n";

const AVATAR_FALLBACK = (name?: string) =>
  `https://ui-avatars.com/api/?name=${encodeURIComponent(name || "User")}`;

export default function UserDropdown() {
  const { t } = useTranslation('common');
  const { user, signOut } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { lang, setLang, switching } = useI18n();
  const [isOpen, setIsOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);

  function toggleDropdown() {
    setIsOpen(!isOpen);
  }

  function closeDropdown() {
    setIsOpen(false);
  }

  const handleSignOut = async () => {
    closeDropdown();
    try {
      await signOut();
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  const selectLang = async (code: LangCode) => {
    setLangOpen(false);
    if (code !== lang) await setLang(code);
  };

  return (
    <div className="relative flex items-center h-full">
      <Tooltip content={t('user.menu')} position="bottom">
        <button
          onClick={toggleDropdown}
          className="flex items-center text-gray-700 dropdown-toggle dark:text-gray-400 group h-full focus:outline-none"
        >
          {/* Desktop Name (Left of Avatar) */}
          <span className="hidden lg:block mr-3 font-black text-theme-sm text-body leading-none whitespace-nowrap">
            {user?.full_name || t('user.fallbackName')}
          </span>

          {/* Avatar (Right in Desktop, Main in Mobile) */}
          <span className="shrink-0 overflow-hidden rounded-full h-10 w-10 border-2 border-primary-500/10 group-hover:border-primary-500/30 transition-all relative flex items-center justify-center bg-gray-50 dark:bg-gray-800 shadow-sm">
            <img
              src={user?.avatar_url || AVATAR_FALLBACK(user?.full_name)}
              alt="User"
              className="object-cover w-full h-full"
            />
          </span>
        </button>
      </Tooltip>

      <Dropdown
        isOpen={isOpen}
        onClose={closeDropdown}
        className="absolute right-0 top-full mt-3 flex w-[280px] flex-col rounded-2xl border border-gray-100 bg-white/95 backdrop-blur-md p-2 shadow-2xl dark:border-gray-800 dark:bg-gray-900/95"
      >
        {/* Header Info — avatar + name/email */}
        <div className="flex items-center gap-3 px-4 py-4 mb-2 border-b border-gray-50 dark:border-gray-800/50">
          <span className="shrink-0 overflow-hidden rounded-full h-11 w-11 border-2 border-primary-500/10 flex items-center justify-center bg-gray-50 dark:bg-gray-800 shadow-sm">
            <img
              src={user?.avatar_url || AVATAR_FALLBACK(user?.full_name)}
              alt=""
              className="object-cover w-full h-full"
            />
          </span>
          <div className="min-w-0">
            <span className="block font-black text-gray-900 text-base dark:text-white uppercase tracking-tighter leading-none truncate">
              {user?.full_name || t('user.fallbackName')}
            </span>
            <span className="mt-1.5 block text-theme-xs text-muted truncate font-medium">
              {user?.email || ""}
            </span>
          </div>
        </div>

        {/* Menu Items */}
        <div className="flex flex-col gap-1 px-1">
          <DropdownItem
            onItemClick={closeDropdown}
            tag="a"
            to="/profile"
            className="flex items-center gap-3 px-3 py-2.5 font-bold text-gray-600 rounded-xl group text-theme-sm hover:bg-primary-50 hover:text-primary-600 dark:text-gray-400 dark:hover:bg-primary-500/10 dark:hover:text-primary-400 transition-all"
            baseClassName="" // Clear defaults
          >
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-gray-50 dark:bg-gray-800 group-hover:bg-primary-100 dark:group-hover:bg-primary-500/20 transition-colors">
              <User size={18} className="text-gray-400 group-hover:text-primary-500 transition-colors" />
            </div>
            <span className="flex-1">{t('user.editProfile')}</span>
          </DropdownItem>

          {/* Theme Switcher */}
          <div onClick={(e) => e.stopPropagation()}>
            <div
              className="flex items-center justify-between px-3 py-2.5 font-bold text-gray-600 rounded-xl group text-sm hover:bg-primary-50 hover:text-primary-600 dark:text-gray-400 dark:hover:bg-primary-500/10 dark:hover:text-primary-400 transition-all cursor-pointer"
              onClick={toggleTheme}
            >
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-gray-50 dark:bg-gray-800 group-hover:bg-primary-100 dark:group-hover:bg-primary-500/20 transition-colors">
                  {theme === 'dark' ? (
                    <Sun className="w-4.5 h-4.5 text-gray-400 group-hover:text-primary-400 transition-colors" />
                  ) : (
                    <Moon className="w-4.5 h-4.5 text-gray-400 group-hover:text-primary-500 transition-colors" />
                  )}
                </div>
                <span>{theme === 'dark' ? t('theme.lightMode') : t('theme.darkMode')}</span>
              </div>
              <div className={cn(
                'relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out',
                theme === 'dark' ? 'bg-primary-500' : 'bg-gray-200 dark:bg-gray-700'
              )}>
                <span className={cn(
                  'pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out',
                  theme === 'dark' ? 'translate-x-4' : 'translate-x-0'
                )} />
              </div>
            </div>
          </div>

          {/* Language Switcher — accordion data-driven (scala a N lingue) */}
          <div onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              onClick={() => setLangOpen((o) => !o)}
              disabled={switching}
              aria-expanded={langOpen}
              className={cn(
                "flex items-center justify-between w-full px-3 py-2.5 font-bold text-gray-600 rounded-xl group text-sm hover:bg-primary-50 hover:text-primary-600 dark:text-gray-400 dark:hover:bg-primary-500/10 dark:hover:text-primary-400 transition-all cursor-pointer",
                switching && "opacity-50 pointer-events-none"
              )}
            >
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-gray-50 dark:bg-gray-800 group-hover:bg-primary-100 dark:group-hover:bg-primary-500/20 transition-colors">
                  <Flag country={getLanguageMeta(lang).country} className="w-5 h-3.5" />
                </div>
                <span>{getLanguageMeta(lang).label}</span>
              </div>
              <ChevronDown className={cn("w-4 h-4 transition-transform duration-200", langOpen && "rotate-180")} />
            </button>

            <div className={cn(
              "overflow-hidden transition-all duration-300 ease-out",
              langOpen ? "max-h-80 opacity-100 mt-1" : "max-h-0 opacity-0"
            )}>
              <div className="flex flex-col gap-0.5 pl-3 pr-1 py-1">
                {LANGUAGE_META.map((l) => {
                  const active = l.code === lang;
                  return (
                    <button
                      key={l.code}
                      type="button"
                      onClick={() => selectLang(l.code)}
                      aria-current={active ? "true" : undefined}
                      className={cn(
                        "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-bold transition-colors",
                        active
                          ? "bg-primary-500/10 text-primary-600 dark:text-primary-400"
                          : "text-sub hover:bg-gray-50 dark:hover:bg-gray-800/60"
                      )}
                    >
                      <Flag country={l.country} className="w-6 h-4" />
                      <span className="flex-1 text-left">{l.label}</span>
                      {active && <Check className="w-4 h-4 shrink-0" />}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Footer (Sign Out) */}
        <div className="mt-2 pt-2 border-t border-gray-50 dark:border-gray-800/50 px-1 pb-1">
          <button
            onClick={handleSignOut}
            className="flex items-center gap-3 px-3 py-2.5 font-bold text-gray-500 rounded-xl group text-theme-sm hover:bg-red-50 hover:text-error dark:hover:bg-red-500/10 w-full text-left transition-all"
          >
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-gray-50 dark:bg-gray-800 group-hover:bg-red-100 dark:group-hover:bg-red-500/20 transition-colors">
              <LogOut size={18} className="text-gray-400 group-hover:text-red-500 transition-colors" />
            </div>
            <span className="flex-1">{t('user.signOut')}</span>
          </button>
        </div>
      </Dropdown>
    </div>
  );
}
