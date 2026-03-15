
import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { Typography, Toggle, Badge, Icon } from '../ui/index';
import { ThemeSwitcher } from '@thaiakha/shared';
import { cn } from '@thaiakha/shared/lib/utils';
import { UserProfile } from '../../services/auth.service';
import { contentService } from '@thaiakha/shared/services';

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
          "bg-[#0a0b0d]/95 backdrop-blur-2xl border-white/5 shadow-[20px_0_60px_rgba(0,0,0,0.5)]",
          (stage === 'opening' || stage === 'open') ? "translate-x-0" : "-translate-x-full"
        )}
      >
        
        {/* HEADER */}
        <div className="h-28 flex items-center justify-between px-6 pt-4 border-b border-white/5">
            <button 
                onClick={handleToggle}
                className="size-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white hover:bg-white/10 hover:border-action/50 transition-all active:scale-95"
            >
                <Icon name="X" className="text-xl" />
            </button>
            <div className="text-right">
                <Typography variant="h3" className="font-black italic uppercase tracking-tighter text-white leading-none">
                    Thai <span className="text-primary">Akha</span>
                </Typography>
                <Typography variant="caption" className="text-white/40 font-bold tracking-[0.3em] text-[10px] mt-1 block">
                    COOKING SCHOOL
                </Typography>
            </div>
        </div>

        {/* LISTA DINAMICA */}
        <div className="flex-1 px-4 space-y-2 overflow-y-auto no-scrollbar py-6">
            {filteredNavItems.length === 0 ? (
                // Loading Skeleton
                <div className="space-y-4 px-2 opacity-50">
                    {[4, 5, 6, 7].map(i => <div key={i} className="h-14 rounded-2xl bg-white/5 animate-pulse" />)}
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
                                    ? "bg-action/10 text-action shadow-[inset_4px_0_0_0_#98C93C]" 
                                    : "text-white/60 hover:bg-white/5 hover:text-white"
                            )}
                            style={{ transitionDelay: stage === 'opening' ? '0ms' : '0ms' }}
                        >
                            <Icon 
                              name={item.header_icon || 'Circle'} 
                              className={cn("text-2xl mr-5 transition-colors", isActive ? "text-action" : "text-white/40 group-hover:text-white")} 
                            />
                            <Typography variant="h6" className={cn("font-bold tracking-tight text-base", isActive ? "text-action" : "text-current")}>
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
        <div className="p-6 border-t border-white/5 bg-black/20 space-y-4">

            {/* Theme Toggle */}
            <ThemeSwitcher
              isDarkMode={isDarkMode}
              onToggle={onToggleTheme}
              variant="mobile"
            />

            {/* Auth Action (Login/Logout) */}
            <button 
                onClick={userProfile ? onLogout : () => handleItemClick('auth')}
                className={cn(
                    "w-full flex items-center justify-center gap-2 py-3 rounded-2xl transition-colors text-xs font-black uppercase tracking-widest",
                    userProfile 
                        ? "text-white/40 hover:text-red-400" 
                        : "bg-primary text-white shadow-lg hover:brightness-110"
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
