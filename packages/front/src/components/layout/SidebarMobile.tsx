
import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { Typography, Icon } from '../ui/index';
import { Sun, Moon, ChevronDown } from 'lucide-react';
import { cn } from '@thaiakha/shared/lib/utils';
import { UserProfile } from '../../services/auth.service';
import { contentService } from '@thaiakha/shared/services';
import { LanguageSwitcher } from './LanguageSwitcher';
import { useLanguage } from '../../context/LanguageContext';

type Page = string;

interface SidebarMobileProps {
  currentPage: Page;
  onNavigate: (page: string, topic?: string) => void;
  isDarkMode: boolean;
  onToggleTheme: () => void;
  userProfile?: UserProfile | null;
  onLogout?: () => void;
}

interface MenuItem {
  page_slug: string;
  menu_label: string;
  header_icon: string;
  access_level: 'public' | 'user' | 'admin' | 'agency';
  menu_order: number;
}

interface FooterItem {
  page_slug: string;
  menu_label: string;
  header_icon: string;
  menu_order: number;
}

// ─────────────────────────────────────────────────────────────────────────────
// FOOTER GROUP — collapsible accordion for mobile drawer footer
// ─────────────────────────────────────────────────────────────────────────────

interface FooterGroupProps {
  icon: string;
  label: string;
  isExpanded: boolean;
  onToggle: () => void;
  children: React.ReactNode;
  bgClass?: string;
}

function FooterGroup({ icon, label, isExpanded, onToggle, children, bgClass = '' }: FooterGroupProps) {
  return (
    <div className={cn('rounded-xl overflow-hidden transition-all duration-300', bgClass)}>
      <button
        onClick={onToggle}
        className="w-full h-12 flex items-center px-5 rounded-xl transition-all duration-200 cursor-pointer hover:brightness-125"
      >
        <Icon
          name={icon}
          className={cn('text-2xl mr-5 transition-colors duration-75', isExpanded ? 'text-sub' : 'text-muted')}
        />
        <span className={cn(
          'font-display font-bold text-xs uppercase tracking-[0.14em]',
          isExpanded ? 'text-sub' : 'text-muted'
        )}>
          {label}
        </span>
        <ChevronDown className={cn(
          'ml-auto w-4 h-4 text-muted transition-transform duration-200',
          isExpanded ? 'rotate-180' : 'rotate-0'
        )} />
      </button>

      <div className={cn(
        'overflow-hidden transition-all duration-300',
        isExpanded ? 'max-h-80 opacity-100' : 'max-h-0 opacity-0'
      )}>
        <div className="py-1.5 space-y-1.5 px-1">
          {children}
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SIDEBAR MOBILE
// ─────────────────────────────────────────────────────────────────────────────

const SidebarMobile: React.FC<SidebarMobileProps> = ({
  currentPage,
  onNavigate,
  isDarkMode,
  onToggleTheme,
  userProfile,
  onLogout
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [stage, setStage] = useState<'closed' | 'opening' | 'open' | 'exiting'>('closed');

  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const { lang } = useLanguage();
  const [footerItems, setFooterItems] = useState<FooterItem[]>([]);
  const [visibleIndices, setVisibleIndices] = useState<number[]>([]);
  const [, setSelectedId] = useState<string | null>(null);
  const [footerExpanded, setFooterExpanded] = useState<'info' | 'settings' | null>(null);

  const navRef = useRef<HTMLElement>(null);

  // ── FETCH ──
  useEffect(() => {
    let cancelled = false;
    let attempts = 0;
    const MAX_ATTEMPTS = 3;

    const loadMenu = async () => {
      if (cancelled) return;
      try {
        const [items, footer] = await Promise.all([
          contentService.getMenuItems('site_metadata', lang),
          contentService.getFooterItems(lang),
        ]);
        if (cancelled) return;

        // Keep a good menu and retry on empty (transient session/RLS race at mount)
        // so the mobile menu fills in without needing a manual refresh.
        if (items && items.length > 0) {
          // vedi nota in Sidebar.tsx: service non tipizzato -> cast via unknown
          setMenuItems(items as unknown as MenuItem[]);
        } else if (attempts < MAX_ATTEMPTS) {
          attempts += 1;
          setTimeout(loadMenu, 400 * attempts);
          return;
        }
        if (footer && footer.length > 0) setFooterItems(footer as unknown as MenuItem[]);
      } catch (err) {
        console.error('Mobile Menu Error:', err);
        if (!cancelled && attempts < MAX_ATTEMPTS) {
          attempts += 1;
          setTimeout(loadMenu, 400 * attempts);
        }
      }
    };

    loadMenu();
    return () => { cancelled = true; };
  // `lang` nelle deps: al cambio lingua il menu si ricarica dal sidecar.
  }, [lang]);

  // ── FILTER ──
  const filteredNavItems = useMemo(() => {
    return menuItems.filter(item => {
      const level = item.access_level || 'public';
      if (['auth', 'login'].includes(item.page_slug)) return false;
      if (item.page_slug?.toLowerCase().includes('student-hub') || item.page_slug?.toLowerCase() === 'hub') return false;
      if (level === 'admin') return false;
      if (level === 'agency') return userProfile?.role === 'agency';
      if (level === 'user') return !!userProfile;
      return true;
    });
  }, [menuItems, userProfile]);

  // ── CASCADE ANIMATION ──
  useEffect(() => {
    if (isOpen && stage === 'opening' && filteredNavItems.length > 0) {
      const timers = filteredNavItems.map((_, i) =>
        setTimeout(() => {
          setVisibleIndices(prev => [...prev, i]);
          if (i === filteredNavItems.length - 1) setStage('open');
        }, 80 + i * 60)
      );
      return () => timers.forEach(clearTimeout);
    }
  }, [isOpen, stage, filteredNavItems]);

  const handleToggle = useCallback(() => {
    if (isOpen) {
      setStage('exiting');
      setTimeout(() => {
        setIsOpen(false);
        setStage('closed');
        setVisibleIndices([]);
        setFooterExpanded(null);
      }, 300);
    } else {
      setIsOpen(true);
      setStage('opening');
    }
  }, [isOpen]);

  const handleItemClick = (slug: string) => {
    setSelectedId(slug);
    setStage('exiting');
    setTimeout(() => {
      onNavigate(slug);
      setIsOpen(false);
      setStage('closed');
      setVisibleIndices([]);
      setSelectedId(null);
      setFooterExpanded(null);
    }, 400);
  };

  return (
    <div className="lg:hidden no-print">

      {/* HAMBURGER BUTTON */}
      <button
        onClick={handleToggle}
        aria-label="Open navigation menu"
        aria-expanded={isOpen}
        aria-controls="mobile-nav-drawer"
        className={cn(
          'fixed bottom-6 left-6 z-[1] size-12 rounded-2xl flex items-center justify-center transition-all duration-500 ease-cinematic',
          'shadow-2xl backdrop-blur-xl border',
          'bg-surface/90 border-white/10 text-title',
          isOpen ? 'opacity-0 scale-75 pointer-events-none' : 'opacity-100 scale-100'
        )}
      >
        <Icon name="Menu" className="text-2xl" />
      </button>

      {/* BACKDROP */}
      <div
        className={cn(
          'fixed inset-0 z-[2] transition-all duration-500 bg-black/60 backdrop-blur-md',
          (stage === 'open' || stage === 'opening') ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        )}
        onClick={handleToggle}
      />

      {/* DRAWER PANEL */}
      <nav
        ref={navRef}
        id="mobile-nav-drawer"
        aria-label="Mobile navigation"
        className={cn(
          'fixed inset-y-0 left-0 z-[3] w-[min(320px,85vw)] pointer-coarse:md:w-[min(288px,80vw)] flex flex-col',
          'transition-transform duration-500 ease-cinematic border-r',
          'bg-surface border-border shadow-[20px_0_60px_rgba(0,0,0,0.5)]',
          (stage === 'opening' || stage === 'open') ? 'translate-x-0' : '-translate-x-full'
        )}
      >

        {/* HEADER */}
        <div className="h-28 flex items-start justify-between px-6 pt-6 border-b border-border">
          <button
            onClick={handleToggle}
            aria-label="Close navigation menu"
            className="size-12 rounded-2xl bg-surface border border-border flex items-center justify-center text-sub hover:bg-border hover:border-primary-500 transition-all active:scale-95 shadow-lg backdrop-blur-xl"
          >
            <Icon name="X" className="text-2xl" />
          </button>
          <div className="text-right ml-2 mt-1">
            {/* as="p": logo branding inside nav drawer — not a page heading.
                Prevents H3 from appearing before H1 in DOM order (D04). */}
            <Typography variant="h3" as="p" className="text-base font-black italic uppercase tracking-tighter text-sub leading-none">
              Thai <span className="text-primary-500">Akha</span>
            </Typography>
            <Typography variant="caption" className="text-muted font-bold tracking-[0.3em] text-xs mt-1 block">
              COOKING SCHOOL
            </Typography>
          </div>
        </div>

        {/* NAV LIST */}
        <div
          className={cn(
            'flex-1 px-4 space-y-2 overflow-y-auto no-scrollbar py-6',
            'transition-all duration-500',
            footerExpanded !== null
              ? 'blur-sm opacity-40 cursor-pointer [&_a]:pointer-events-none [&_button]:pointer-events-none select-none'
              : ''
          )}
          onClick={footerExpanded !== null ? () => setFooterExpanded(null) : undefined}
        >
          {filteredNavItems.length === 0 ? (
            <div className="space-y-4 px-2 opacity-50">
              {[4, 5, 6, 7].map(i => <div key={i} className="h-14 rounded-2xl bg-border animate-pulse" />)}
            </div>
          ) : (
            filteredNavItems.map((item, index) => {
              const isVisible = visibleIndices.includes(index);
              const isActive = currentPage === item.page_slug;
              return (
                <a
                  key={item.page_slug}
                  href={item.page_slug === 'home' ? '/' : `/${item.page_slug}`}
                  onClick={(e) => {
                    if (e.ctrlKey || e.metaKey || e.button !== 0) return;
                    e.preventDefault();
                    handleItemClick(item.page_slug);
                  }}
                  className={cn(
                    'relative w-full h-14 pointer-coarse:md:h-12 rounded-2xl flex items-center px-5 transition-colors duration-75 overflow-hidden group outline-none',
                    isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-8',
                    isActive
                      ? 'bg-action-500/20 text-action-700 shadow-[inset_4px_0_0_0_var(--color-action-500)]'
                      : 'text-muted hover:bg-surface hover:text-sub'
                  )}
                >
                  <Icon
                    name={item.header_icon || 'Circle'}
                    className={cn('text-2xl pointer-coarse:md:text-xl mr-5 transition-colors', isActive ? 'text-action-700' : 'text-muted group-hover:text-sub')}
                  />
                  <Typography variant="h6" as="span" className={cn('font-bold tracking-tight text-base pointer-coarse:md:text-sm', isActive ? 'text-action-700' : 'text-current')}>
                    {item.menu_label}
                  </Typography>
                  <Icon
                    name="chevron_right"
                    className="absolute right-4 opacity-0 -translate-x-4 group-hover:opacity-30 group-hover:translate-x-0 transition-all duration-300 text-sm"
                  />
                </a>
              );
            })
          )}
        </div>

        {/* FOOTER — two collapsible groups */}
        <div className="px-4 pb-6 pt-2 border-t border-border bg-surface/50 space-y-1">

          {/* INFORMATION GROUP */}
          {footerItems.length > 0 && (
            <FooterGroup
              icon="Info"
              label="Information"
              isExpanded={footerExpanded === 'info'}
              onToggle={() => setFooterExpanded(prev => prev === 'info' ? null : 'info')}
              bgClass="bg-surface-2"
            >
              {footerItems.map(item => (
                <a
                  key={item.page_slug}
                  href={item.page_slug === 'home' ? '/' : `/${item.page_slug}`}
                  onClick={(e) => {
                    if (e.ctrlKey || e.metaKey || e.button !== 0) return; // nuova scheda / long-press nativo
                    e.preventDefault();
                    handleItemClick(item.page_slug);
                  }}
                  className={cn(
                    'group w-full h-12 flex items-center px-5 rounded-2xl outline-none',
                    'bg-surface-2 border border-border',
                    'transition-[background-color,border-color,box-shadow] duration-75',
                    'hover:bg-action-500/[0.12] hover:border-action-500/25',
                    'hover:shadow-[inset_0_1px_0_rgba(152,201,60,0.25),0_4px_14px_rgba(152,201,60,0.08)]',
                  )}
                >
                  <Icon name={item.header_icon || 'Circle'} className="text-xl mr-5 text-muted group-hover:text-action-600 transition-colors duration-75" />
                  <Typography variant="h6" as="span" className="font-bold text-sm text-sub group-hover:text-action-700 transition-colors duration-75">{item.menu_label}</Typography>
                </a>
              ))}
            </FooterGroup>
          )}

          {/* SETTINGS GROUP */}
          <FooterGroup
            icon="Settings"
            label="Settings"
            isExpanded={footerExpanded === 'settings'}
            onToggle={() => setFooterExpanded(prev => prev === 'settings' ? null : 'settings')}
            bgClass="bg-surface-2"
          >
            {/* Language — righe piene, non un dropdown: dentro un pannello che
                già scorre, un secondo scroll annidato è la cosa più scomoda da
                usare col pollice. A flag i18n spento non renderizza nulla, quindi
                oggi il pannello resta identico a prima (prima qui c'era un
                pulsante "Languages" senza alcun onClick). */}
            <LanguageSwitcher />

            {/* Theme Toggle */}
            <div
              onClick={onToggleTheme}
              className={cn(
                'group flex items-center h-12 px-5 rounded-2xl cursor-pointer',
                'bg-surface-2 border border-border',
                'transition-[background-color,border-color,box-shadow] duration-75',
                'hover:bg-action-500/[0.12] hover:border-action-500/25',
                'hover:shadow-[inset_0_1px_0_rgba(152,201,60,0.25),0_4px_14px_rgba(152,201,60,0.08)]',
              )}
            >
              {isDarkMode
                ? <Sun className="w-5 h-5 mr-5 text-muted group-hover:text-action-600 shrink-0 transition-colors duration-75" />
                : <Moon className="w-5 h-5 mr-5 text-muted group-hover:text-action-600 shrink-0 transition-colors duration-75" />
              }
              <Typography variant="h6" as="span" className="font-bold text-sm text-sub group-hover:text-action-700 transition-colors duration-75">
                {isDarkMode ? 'Dark Mode' : 'Light Mode'}
              </Typography>
              <div className={cn(
                'relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ml-auto',
                isDarkMode ? 'bg-action-600' : 'bg-gray-400'
              )}>
                <span className={cn(
                  'pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out',
                  isDarkMode ? 'translate-x-4' : 'translate-x-0'
                )} />
              </div>
            </div>

            {/* Login / Logout */}
            <button
              onClick={userProfile ? onLogout : () => handleItemClick('auth')}
              className={cn(
                'group w-full h-12 flex items-center px-5 rounded-2xl',
                'bg-surface-2 border border-border',
                'transition-[background-color,border-color,box-shadow] duration-75',
                userProfile
                  ? 'hover:bg-sys-error/10 hover:border-sys-error/25 hover:shadow-[inset_0_1px_0_rgba(239,68,68,0.2)]'
                  : 'hover:bg-action-500/[0.12] hover:border-action-500/25 hover:shadow-[inset_0_1px_0_rgba(152,201,60,0.25),0_4px_14px_rgba(152,201,60,0.08)]',
              )}
            >
              <Icon
                name={userProfile ? 'LogOut' : 'LogIn'}
                className={cn(
                  'text-xl mr-5 text-muted transition-colors duration-75',
                  userProfile ? 'group-hover:text-sys-error' : 'group-hover:text-action-600'
                )}
              />
              <Typography variant="h6" as="span" className={cn(
                'font-bold text-sm text-sub transition-colors duration-75',
                userProfile ? 'group-hover:text-sys-error' : 'group-hover:text-action-700'
              )}>
                {userProfile ? 'Sign Out' : 'Log In'}
              </Typography>
            </button>
          </FooterGroup>

        </div>

      </nav>
    </div>
  );
};

export default SidebarMobile;
