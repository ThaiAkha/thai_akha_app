/**
 * Sidebar (desktop) - primitive del FOOTER: avatar utente, switch tema, gruppo espandibile.
 * Estratte da Sidebar.tsx (#16 split monstre) a comportamento invariato.
 */
import React from 'react';
import { getIcon } from '@thaiakha/shared/lib/icons';
import { cn } from '@thaiakha/shared/lib/utils';
import { ChevronDown, Sun, Moon } from 'lucide-react';
import Typography from '../../ui/Typography';
import { CLOSED_WIDTH, ROW_H, ROW_ICON, EASE_CUBIC } from './SidebarNavPrimitives';

interface AvatarProps {
  src?: string;
  name?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const AVATAR_SIZE = { sm: 'w-8 h-8 text-xs', md: 'w-10 h-10 text-sm', lg: 'w-12 h-12 text-base' };

export function Avatar({ src, name = 'User', size = 'md', className = '' }: AvatarProps) {
  const initials = name.split(' ').slice(0, 2).map(p => p[0]).join('').toUpperCase() || '?';
  return (
    <div className={cn(
      AVATAR_SIZE[size], 'rounded-full flex items-center justify-center',
      'bg-gradient-to-br from-primary-500 to-primary-600',
      'text-white font-bold overflow-hidden flex-shrink-0', className
    )}>
      {src ? <img src={src} alt={name} className="w-full h-full object-cover" /> : <Typography variant="body" color="white" className="font-bold">{initials}</Typography>}
    </div>
  );
}

interface ThemeSwitcherProps {
  isDarkMode: boolean;
  onToggle?: () => void;
  isOpen: boolean;
  isVisible?: boolean;
  index?: number;
}

export function ThemeSwitcher({ isDarkMode, onToggle, isOpen, isVisible = true, index = 0 }: ThemeSwitcherProps) {
  const ThemeIcon = isDarkMode ? Sun : Moon;

  const bgClasses = "bg-surface-2 border border-border hover:bg-action-500/10 hover:border-action-500/25";

  return (
    <button
      onClick={onToggle}
      title={isDarkMode ? 'Light' : 'Dark'}
      className={cn(
        ROW_H,
        "relative flex items-center w-full rounded-xl group cursor-pointer",
        "transition-[background-color,border-color,box-shadow,opacity,transform] duration-200",
        bgClasses,
        isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4 pointer-events-none'
      )}
      style={{ transitionDelay: isVisible ? `${index * 50}ms` : '0ms' }}
    >
      <div className={`${CLOSED_WIDTH} shrink-0 flex items-center justify-start pl-[24px] pointer-coarse:pl-[20px] z-10`}>
        <ThemeIcon className={cn(ROW_ICON, "text-muted group-hover:text-action-600 transition-colors duration-75")} />
      </div>
      <div className={cn(
        'flex items-center flex-1 overflow-hidden whitespace-nowrap z-10',
        `transition-all duration-300 ${EASE_CUBIC} origin-left`,
        isOpen ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-5 pointer-events-none'
      )}>
        <Typography
          variant="body"
          color="sub"
          className="font-display font-bold tracking-wide text-sm pointer-coarse:text-xs"
        >
          {isDarkMode ? 'Light' : 'Dark'}
        </Typography>
        <div className={cn(
          'relative inline-flex h-5 w-9 shrink-0 rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ml-auto mr-8',
          isDarkMode ? 'bg-action-600' : 'bg-gray-400'
        )}>
          <span className={cn(
            'pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out',
            isDarkMode ? 'translate-x-4' : 'translate-x-0'
          )} />
        </div>
      </div>
    </button>
  );
}

interface FooterGroupProps {
  icon: string;
  label: string;
  isOpen: boolean;
  isExpanded: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}

export function FooterGroup({ icon, label, isOpen, isExpanded, onToggle, children }: FooterGroupProps) {
  const IconComponent = getIcon(icon);

  // Header button colors — rest neutro, hover/aperto lime (action)
  const headerBase = 'bg-surface-2 border border-border hover:bg-action-500/10 hover:border-action-500/25';
  const headerExpanded = 'bg-action-500/10 border border-action-500/20';

  // Expanded container bg
  const expandedBg = 'bg-surface-2 border border-border';

  return (
    <div className={cn(
      'rounded-xl overflow-hidden transition-all duration-300',
      isExpanded && isOpen ? expandedBg : ''
    )}>
      <button
        onClick={onToggle}
        title={label}
        className={cn(
          ROW_H,
          'relative flex items-center w-full rounded-xl transition-all duration-200 group cursor-pointer',
          !isExpanded ? headerBase : headerExpanded
        )}
      >
        <div className={`${CLOSED_WIDTH} shrink-0 flex items-center justify-start pl-[24px] pointer-coarse:pl-[20px] z-10`}>
          <IconComponent className={cn(ROW_ICON, "text-muted group-hover:text-action-600 transition-colors duration-75")} />
        </div>
        <div className={cn(
          'flex items-center flex-1 overflow-hidden whitespace-nowrap z-10',
          `transition-all duration-300 ${EASE_CUBIC} origin-left`,
          isOpen ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-5 pointer-events-none'
        )}>
          <Typography
            variant="body"
            color="sub"
            className="font-display font-bold text-[15px] pointer-coarse:text-sm uppercase tracking-[0.14em]"
          >
            {label}
          </Typography>
          <ChevronDown className={cn(
            'w-3 h-3 ml-auto mr-4 text-muted transition-transform duration-200',
            isExpanded ? 'rotate-180' : 'rotate-0'
          )} />
        </div>
      </button>
      <div className={cn(
        'overflow-hidden transition-all duration-300',
        isExpanded && isOpen ? 'max-h-80 opacity-100' : 'max-h-0 opacity-0'
      )}>
        <div className="py-1.5 space-y-1.5 px-1">
          {children}
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────────────────────
