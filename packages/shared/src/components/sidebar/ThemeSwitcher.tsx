/**
 * ThemeSwitcher Component
 * Unified theme toggle component used in multiple places:
 * - Front sidebar (desktop)
 * - Front sidebar (mobile drawer)
 * - Admin header dropdown
 *
 * Supports three variants for different UI contexts
 */

import React from 'react';
import { getIcon } from '../../lib/icons';
import { SIDEBAR_CONSTANTS } from '../../lib/sidebar.constants';
import { cn } from '../../lib/utils';

export type ThemeSwitcherVariant = 'sidebar' | 'mobile' | 'dropdown';

export interface ThemeSwitcherProps {
  /** Current theme: 'dark' or 'light' */
  isDarkMode: boolean;

  /** Callback when theme is toggled */
  onToggle: () => void;

  /** Display variant */
  variant?: ThemeSwitcherVariant;

  /** Accent color scheme: 'brand' (cherry/admin) or 'action' (lime/front) */
  accentColor?: 'brand' | 'action';

  /** Optional className for customization */
  className?: string;

  /** For sidebar variant only: is sidebar open */
  isOpen?: boolean;
}

const ThemeSwitcher: React.FC<ThemeSwitcherProps> = ({
  isDarkMode,
  onToggle,
  variant = 'sidebar',
  accentColor = 'brand',
  className = '',
  isOpen = true,
}) => {
  const SunIcon = getIcon('Sun');
  const MoonIcon = getIcon('Moon');
  const ThemeIcon = isDarkMode ? SunIcon : MoonIcon;

  // Map accent to Tailwind classes for toggle switch
  const toggleDarkColor = accentColor === 'brand' ? 'bg-cherry-500' : 'bg-lime-600';

  // ========== SIDEBAR VARIANT (Desktop) ==========
  if (variant === 'sidebar') {
    return (
      <button
        onClick={onToggle}
        title={isDarkMode ? 'Light' : 'Dark'}
        className={cn(
          'relative flex items-center w-full h-14 rounded-xl transition-all group',
          className
        )}
      >
        {/* BACKGROUND - Hover state */}
        <div
          className="absolute inset-1 rounded-xl transition-colors duration-300 group-hover:bg-gray-100 dark:group-hover:bg-white/5"
        />

        {/* Icon Container - Fixed width, always visible */}
        <div className={`${SIDEBAR_CONSTANTS.ICON_CONTAINER_WIDTH} shrink-0 flex items-center justify-center z-10`}>
          <ThemeIcon className="w-6 h-6 text-gray-500 group-hover:text-gray-700 dark:text-gray-400 dark:group-hover:text-gray-300" />
        </div>

        {/* Text Container + Toggle - Collapse when sidebar is closed */}
        <div
          className={`
            flex items-center flex-1 overflow-hidden whitespace-nowrap z-10
            transition-all duration-300 ${SIDEBAR_CONSTANTS.EASE_CUBIC} origin-left
            ${isOpen ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-5 pointer-events-none'}
          `}
        >
          <span className="font-display font-bold tracking-wide text-gray-700 dark:text-gray-300 ml-1">
            {isDarkMode ? 'Light' : 'Dark'}
          </span>

          {/* Toggle Switch - Inside collapsible text container */}
          <div
            className={cn(
              'relative inline-flex h-5 w-9 shrink-0 rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ml-auto mr-1',
              isDarkMode ? toggleDarkColor : 'bg-gray-300 dark:bg-gray-600'
            )}
          >
            <span
              className={cn(
                'pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out',
                isDarkMode ? 'translate-x-4' : 'translate-x-0'
              )}
            />
          </div>
        </div>
      </button>
    );
  }

  // ========== MOBILE VARIANT (Drawer) ==========
  if (variant === 'mobile') {
    return (
      <div className="flex h-16 items-center justify-between px-5 rounded-2xl border border-white/5 bg-white/5">
        <div className="flex items-center gap-3">
          <ThemeIcon
            className={cn(
              'text-xl',
              isDarkMode ? 'text-quiz' : 'text-slate-400'
            )}
          />
          <span className="font-black uppercase tracking-widest text-[10px] text-white/80">
            {isDarkMode ? 'Dark' : 'Light'}
          </span>
        </div>

        {/* Custom Toggle Switch */}
        <div
          onClick={onToggle}
          className={cn(
            'relative inline-flex h-6 w-10 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none',
            isDarkMode ? toggleDarkColor : 'bg-gray-300 dark:bg-gray-700'
          )}
        >
          <span
            className={cn(
              'pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out',
              isDarkMode ? 'translate-x-4' : 'translate-x-0'
            )}
          />
        </div>
      </div>
    );
  }

  // ========== DROPDOWN VARIANT (Admin Header) ==========
  if (variant === 'dropdown') {
    return (
      <div
        className="flex items-center justify-between px-3 py-2.5 font-bold text-gray-600 rounded-xl group text-sm hover:bg-brand-50 hover:text-brand-600 dark:text-gray-400 dark:hover:bg-brand-500/10 dark:hover:text-brand-400 transition-all cursor-pointer"
        onClick={onToggle}
      >
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-gray-50 dark:bg-gray-800 group-hover:bg-brand-100 dark:group-hover:bg-brand-500/20 transition-colors">
            {isDarkMode ? (
              <SunIcon className="w-4.5 h-4.5 text-gray-400 group-hover:text-brand-400 transition-colors" />
            ) : (
              <MoonIcon className="w-4.5 h-4.5 text-gray-400 group-hover:text-brand-500 transition-colors" />
            )}
          </div>
          <span>{isDarkMode ? 'Light' : 'Dark'}</span>
        </div>

        {/* Custom Toggle Switch */}
        <div
          className={cn(
            'relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none',
            isDarkMode ? toggleDarkColor : 'bg-gray-200 dark:bg-gray-700'
          )}
        >
          <span
            className={cn(
              'pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out',
              isDarkMode ? 'translate-x-4' : 'translate-x-0'
            )}
          />
        </div>
      </div>
    );
  }

  return null;
};

export default ThemeSwitcher;
