import React, { useEffect, useState, useMemo } from 'react';
import { UserProfile } from '../../services/authService';
import { contentService } from '../../services/contentService';

// --- TYPES ---
interface MenuItem {
  id: string;
  page_slug: string;
  menu_label: string;
  header_icon: string;
  menu_order: number;
  access_level: 'public' | 'user' | 'admin' | 'agency';
  header_badge?: string;
  is_highlighted?: boolean;
}

interface SidebarProps {
  currentPage: string;
  onNavigate: (page: string, topic?: string) => void;
  isOpen: boolean;
  onToggle: () => void;
  isDarkMode: boolean;
  onToggleTheme: () => void;
  userProfile?: UserProfile | null;
  onLogout?: () => void;
}

// COSTANTE PER LA LARGHEZZA DELLA BARRA CHIUSA
const CLOSED_WIDTH = 'w-[108px]';

// --- NAV ITEM (Icona immobile + Testo a comparsa) ---
const NavItem: React.FC<{
  icon: string; 
  label: string; 
  isActive: boolean; 
  onClick: () => void;
  isOpen: boolean;
  isDarkMode: boolean;
  badge?: string;
  highlight?: boolean;
}> = ({ icon, label, isActive, onClick, isOpen, isDarkMode, badge, highlight }) => {
  
  return (
    <button
      onClick={onClick}
      title={label}
      className={`
        relative flex items-center w-full h-14 mb-1 transition-all duration-200 group
        ${isActive 
          ? 'text-action font-bold' 
          : highlight 
            ? 'text-action' 
            : `text-slate-500 ${isDarkMode ? 'hover:text-white' : 'hover:text-action'}`
        }
      `}
    >
      {/* SFONDO ACTIVE/HOVER */}
      <div className={`
        absolute inset-y-1 inset-x-2 rounded-xl transition-all duration-300
        ${isActive 
          ? 'bg-action/10' 
          : highlight 
            ? 'bg-action/5' 
            : isDarkMode ? 'group-hover:bg-white/5' : 'group-hover:bg-slate-100'}
      `} />

      {/* 1. CONTENITORE ICONA (FISSO E IMMOBILE) */}
      <div className={`${CLOSED_WIDTH} shrink-0 flex items-center justify-center z-10`}>
        <span className={`
          material-symbols-outlined text-3xl transition-transform duration-300 group-active:scale-95
          ${isActive || highlight ? 'text-action' : ''}
        `}>
          {icon}
        </span>
      </div>

      {/* 2. CONTENITORE TESTO (Scorre a destra) */}
      <div className={`
        flex items-center flex-1 overflow-hidden whitespace-nowrap z-10 
        transition-all duration-300 ease-[cubic-bezier(0.25,1,0.5,1)] origin-left
        ${isOpen ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-5 pointer-events-none'}
      `}>
        <span className="font-display text-lb tracking-wide font-bold ml-1">
          {label}
        </span>
        
        {badge && (
          <span className={`
            px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider ml-3
            ${isActive 
              ? "bg-action text-white shadow-sm" 
              : "bg-slate-200 dark:bg-white/10 text-slate-500 dark:text-slate-300"}
          `}>
            {badge}
          </span>
        )}
      </div>

      {/* Indicatore Laterale */}
      {isActive && (
        <div className="absolute left-0 top-1/2 -translate-y-1/2 h-8 w-1 bg-action rounded-r-full" />
      )}
    </button>
  );
};

// --- SIDEBAR MAIN ---
const Sidebar: React.FC<SidebarProps> = ({ 
  currentPage, onNavigate, isOpen, onToggle, isDarkMode, onToggleTheme, userProfile, onLogout 
}) => {
  
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);

  useEffect(() => {
    const loadMenu = async () => {
      try {
        const items = await contentService.getMenuItems();
        setMenuItems(items || []);
      } catch (error) { console.error("Menu error", error); }
    };
    loadMenu();
  }, [userProfile?.role]); // Ricarica se cambia il ruolo

  const visibleItems = useMemo(() => {
    return menuItems.filter((item) => {
      const authSlugs = ['auth', 'login', 'logout', 'register', 'sign-in', 'sign-up'];
      if (authSlugs.includes(item.page_slug.toLowerCase())) return false;
      
      const level = item.access_level || 'public';

      // 🛡️ ADMIN: Nascondi pagine admin dalla sidebar pubblica (ha la Console dedicata)
      if (level === 'admin') return false; 

      // 🏢 AGENCY: Mostra SOLO se l'utente è agency
      if (level === 'agency') return userProfile?.role === 'agency';

      // 👤 USER: Mostra solo se loggato
      if (level === 'user') return !!userProfile;

      // 🌍 PUBLIC: Mostra sempre
      return true;
    });
  }, [menuItems, userProfile]);

  return (
    <nav 
      id="sidebar-nav"
      className={`
        relative h-full shrink-0 z-50 flex flex-col border-r 
        transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)]
        ${isDarkMode ? 'bg-[#0a0b0d]/95 border-white/5' : 'bg-white border-slate-200 shadow-xl'}
        backdrop-blur-xl
        ${isOpen ? 'w-80' : CLOSED_WIDTH}
      `}
    >
      <div className="flex flex-col h-full py-6 pt-[40px]">
        
        {/* HAMBURGER TOGGLE (Spostato in alto per ergonomia mobile-like) */}
        <div className="pt-2 pb-3 flex justify-center">
            <button 
                onClick={onToggle}
                className={`
                    w-full h-14 rounded-2xl flex items-center justify-center transition-all border 
                    ${isDarkMode 
                        ? 'bg-white/5 border-white/10 text-white hover:bg-white/10 hover:border-white/20' 
                        : 'bg-slate-100 border-slate-200 text-slate-900 hover:bg-slate-200 hover:border-slate-300'}
                    ${isOpen ? 'mx-0' : 'mx-0 aspect-square'}
                `}
                title="Toggle Sidebar"
            >
                <span className={`material-symbols-outlined text-3xl transition-transform duration-500 ${isOpen ? 'rotate-180' : ''}`}>
                    {isOpen ? 'chevron_left' : 'menu'}
                </span>
            </button>
        </div>

        {/* ================= HEADER: LOGO ================= */}
        <div className="flex items-center mb-8 h-12">
           <div className={`${CLOSED_WIDTH} shrink-0 flex items-center justify-center`}>
              <div className="size-10 bg-action rounded-xl flex items-center justify-center shadow-lg shadow-action/30">
                 <span className="font-display font-black text-white text-xl">TA</span>
              </div>
           </div>
           
           <div className={`overflow-hidden whitespace-nowrap transition-all duration-500 ${isOpen ? 'opacity-100 w-auto' : 'opacity-0 w-0'}`}>
              <span className={`font-display font-black text-2xl tracking-tighter ${isDarkMode ? "text-white" : "text-slate-900"}`}>
                 Thai <span className="text-action">Akha</span>
              </span>
           </div>
        </div>

        {/* ================= LISTA MENU ================= */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden custom-scrollbar space-y-1">
          {visibleItems.map((item) => (
            <NavItem 
              key={item.id} 
              icon={item.header_icon || 'circle'} 
              label={item.menu_label} 
              isActive={currentPage === item.page_slug} 
              onClick={() => onNavigate(item.page_slug)} 
              isOpen={isOpen}
              isDarkMode={isDarkMode}
              badge={item.header_badge}
              highlight={item.is_highlighted}
            />
          ))}
        </div>

        {/* ================= FOOTER ================= */}
        <div className={`mt-auto pt-4 space-y-2 border-t mx-2 ${isDarkMode ? 'border-white/10' : 'border-slate-100'}`}>
            
            {/* 🔴 ADMIN CONSOLE ENTRY (Solo se l'utente è admin) */}
            {userProfile?.role === 'admin' && (
                <button
                    onClick={() => onNavigate('admin-kitchen')}
                    className="relative flex items-center w-full h-14 mb-2 rounded-xl transition-all group bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white border border-red-500/20"
                >
                    <div className="w-[92px] shrink-0 flex items-center justify-center z-10">
                        <span className="material-symbols-outlined text-3xl">admin_panel_settings</span>
                    </div>
                    <div className={`flex-1 overflow-hidden whitespace-nowrap transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0'}`}>
                        <span className="font-bold text-base uppercase tracking-widest">Console</span>
                    </div>
                </button>
            )}

            {/* AUTH BUTTON */}
            <button
                onClick={userProfile ? onLogout : () => onNavigate('auth')}
                className={`relative flex items-center w-full h-14 rounded-xl transition-all group ${isDarkMode ? 'text-slate-400 hover:text-red-400' : 'text-slate-500 hover:text-red-500'}`}
            >
                <div className={`absolute inset-0 rounded-xl transition-colors ${isDarkMode ? 'group-hover:bg-white/5' : 'group-hover:bg-slate-100'}`} />
                <div className="w-[92px] shrink-0 flex items-center justify-center z-10">
                    <span className="material-symbols-outlined text-3xl">{userProfile ? 'logout' : 'login'}</span>
                </div>
                <div className={`flex-1 overflow-hidden whitespace-nowrap transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0'}`}>
                    <span className="font-bold text-base">{userProfile ? 'Sign Out' : 'Log In'}</span>
                </div>
            </button>

            {/* THEME BUTTON */}
            <button
                onClick={onToggleTheme}
                className={`relative flex items-center w-full h-14 rounded-xl transition-all group ${isDarkMode ? 'text-slate-400 hover:text-quiz' : 'text-slate-500 hover:text-action'}`}
            >
                <div className={`absolute inset-0 rounded-xl transition-colors ${isDarkMode ? 'group-hover:bg-white/5' : 'group-hover:bg-slate-100'}`} />
                <div className="w-[92px] shrink-0 flex items-center justify-center z-10">
                    <span className="material-symbols-outlined text-3xl">{isDarkMode ? 'light_mode' : 'dark_mode'}</span>
                </div>
                <div className={`flex-1 overflow-hidden whitespace-nowrap transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0'}`}>
                    <span className="font-bold text-base">{isDarkMode ? 'Light Mode' : 'Dark Mode'}</span>
                </div>
            </button>
        </div>

      </div>
    </nav>
  );
};

export default Sidebar;