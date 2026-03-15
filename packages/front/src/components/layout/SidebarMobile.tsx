
import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { Typography, Toggle, Badge, Icon } from '../ui/index';
import { ThemeSwitcher, SidebarAvatar, SidebarDivider, SidebarActionButton } from '@thaiakha/shared';
import { getIcon } from '@thaiakha/shared/lib/icons';
import { cn } from '@thaiakha/shared/lib/utils';
import { UserProfile } from '../../services/auth.service';
import { contentService } from '@thaiakha/shared/services';
import { GraduationCap } from 'lucide-react';

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

  // Lista Menu Dinamica
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [visibleIndices, setVisibleIndices] = useState<number[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const navRef = useRef<HTMLElement>(null);

  // 1. FETCH DATI DAL DATABASE
  useEffect(() => {
    const loadMenu = async () => {
      try {
        const items = await contentService.getMenuItems();
        setMenuItems(items || []);
      } catch (err) { console.error("Mobile Menu Error:", err); }
    };
    loadMenu();
  }, []);

  // 2. FILTRO LOGICO (Allineato con Desktop)
  const filteredNavItems = useMemo(() => {
    return menuItems.filter(item => {
      const level = item.access_level || 'public';

      // Nascondi pagine Auth tecniche
      if (['auth', 'login'].includes(item.page_slug)) return false;

      // 🚫 EXCLUDE: Student Hub (will be shown in avatar menu)
      if (item.page_slug?.toLowerCase().includes('student-hub') || item.page_slug?.toLowerCase() === 'hub') return false;

      // 🛡️ ADMIN: Nascondi voci operative dalla sidebar pubblica
      if (level === 'admin' || level === 'manager') return false;

      // 🏢 AGENCY: Mostra SOLO se l'utente è un'agenzia
      if (level === 'agency') return userProfile?.role === 'agency';

      // 👤 USER: Mostra solo se loggato
      if (level === 'user') return !!userProfile;

      return true;
    });
  }, [menuItems, userProfile]);

  // 3. ANIMAZIONE A CASCATA
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
    }, 400);
  };

  return (
    <div className="lg:hidden no-print">

      {/* HAMBURGER BUTTON */}
      <button
        onClick={handleToggle}
        className={cn(
          "fixed top-6 left-6 z-[1] size-12 rounded-2xl flex items-center justify-center transition-all duration-500 ease-cinematic",
          "shadow-2xl backdrop-blur-xl border",
          "bg-surface/90 border-white/10 text-title",
          isOpen ? "opacity-0 scale-75 pointer-events-none" : "opacity-100 scale-100"
        )}
      >
        <Icon name="Menu" className="text-2xl" />
      </button>

      {/* BACKDROP */}
      <div
        className={cn(
          "fixed inset-0 z-[2] transition-all duration-500 bg-black/60 backdrop-blur-md",
          (stage === 'open' || stage === 'opening') ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        )}
        onClick={handleToggle}
      />

      {/* DRAWER PANEL */}
      <nav
        ref={navRef}
        className={cn(
          "fixed inset-y-0 left-0 z-[3] w-[min(320px,85vw)] flex flex-col",
          "transition-transform duration-500 ease-cinematic border-r",
          "bg-white dark:bg-gray-dark backdrop-blur-sm border-gray-100 dark:border-gray-900 shadow-[20px_0_60px_rgba(0,0,0,0.5)]",
          (stage === 'opening' || stage === 'open') ? "translate-x-0" : "-translate-x-full"
        )}
      >

        {/* HEADER */}
        <div className="h-28 flex items-start justify-between px-6 pt-6 border-b border-gray-100 dark:border-gray-900">
          <button
            onClick={handleToggle}
            className="size-12 rounded-2xl bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 flex items-center justify-center text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-white/10 hover:border-brand-500 dark:hover:border-brand-400 transition-all active:scale-95 shadow-lg backdrop-blur-xl"
          >
            <Icon name="X" className="text-2xl" />
          </button>
          <div className="text-right ml-2 mt-1">
            <Typography variant="h3" className="text-base font-black italic uppercase tracking-tighter text-gray-700 dark:text-gray-300 leading-none">
              Thai <span className="text-brand-500 dark:text-brand-400">Akha</span>
            </Typography>
            <Typography variant="caption" className="text-gray-500 dark:text-gray-400 font-bold tracking-[0.3em] text-xs mt-1 block">
              COOKING SCHOOL
            </Typography>
          </div>
        </div>

        {/* LISTA DINAMICA */}
        <div className="flex-1 px-4 space-y-2 overflow-y-auto no-scrollbar py-6">
          {filteredNavItems.length === 0 ? (
            // Loading Skeleton
            <div className="space-y-4 px-2 opacity-50">
              {[4, 5, 6, 7].map(i => <div key={i} className="h-14 rounded-2xl bg-gray-100 dark:bg-white/5 animate-pulse" />)}
            </div>
          ) : (
            filteredNavItems.map((item, index) => {
              const isVisible = visibleIndices.includes(index);
              const isActive = currentPage === item.page_slug;
              return (
                <button
                  key={item.page_slug}
                  onClick={() => handleItemClick(item.page_slug)}
                  className={cn(
                    "relative w-full h-14 rounded-2xl flex items-center px-5 transition-all duration-500 overflow-hidden group",
                    // Waterfall Animation
                    isVisible ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-8",
                    // Active State
                    isActive
                      ? "bg-brand-50 dark:bg-brand-500/[0.12] text-brand-500 dark:text-brand-400 shadow-[inset_4px_0_0_0_rgb(var(--color-brand))]"
                      : "text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5 hover:text-gray-700 dark:hover:text-gray-300"
                  )}
                  style={{ transitionDelay: stage === 'opening' ? '0ms' : '0ms' }}
                >
                  <Icon
                    name={item.header_icon || 'Circle'}
                    className={cn("text-2xl mr-5 transition-colors", isActive ? "text-brand-500 dark:text-brand-400" : "text-gray-400 dark:text-gray-500 group-hover:text-gray-700 dark:group-hover:text-gray-300")}
                  />
                  <Typography variant="h6" className={cn("font-bold tracking-tight text-base", isActive ? "text-brand-500 dark:text-brand-400" : "text-current")}>
                    {item.menu_label}
                  </Typography>
                  {/* Freccia Hover */}
                  <Icon
                    name="ArrowForward"
                    className="absolute right-4 opacity-0 -translate-x-4 group-hover:opacity-30 group-hover:translate-x-0 transition-all duration-300 text-sm"
                  />
                </button>
              );
            })
          )}
        </div>

        {/* FOOTER */}
        <div className="p-6 border-t border-gray-100 dark:border-gray-900 bg-gray-50 dark:bg-white/5 space-y-4">

          {/* Theme Toggle */}
          <ThemeSwitcher
            isDarkMode={isDarkMode}
            onToggle={onToggleTheme}
            variant="mobile"
            accentColor="brand"
          />

          {/* Auth Action (Login/Logout) */}
          <button
            onClick={userProfile ? onLogout : () => handleItemClick('auth')}
            className={cn(
              "w-full flex items-center justify-center gap-2 py-3 rounded-2xl transition-colors text-xs font-black uppercase tracking-widest",
              userProfile
                ? "text-gray-400 dark:text-gray-500 hover:text-red-500 dark:hover:text-red-400"
                : "bg-brand-500 text-white shadow-lg hover:brightness-110"
            )}
          >
            <Icon name={userProfile ? 'LogOut' : 'LogIn'} className="text-sm" />
            {userProfile ? 'Sign Out' : 'Log In'}
          </button>
        </div>

      </nav>
    </div>
  );
};

export default SidebarMobile;
