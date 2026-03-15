import React, { useEffect, useState, useMemo } from 'react';
import { UserProfile } from '../../services/auth.service';
import { contentService } from '@thaiakha/shared/services';
import { getIcon } from '@thaiakha/shared/lib/icons';
import { LogoIconLight, LogoIconDark } from '@thaiakha/shared';

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
  const IconComponent = getIcon(icon);

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
        <IconComponent
          className={`
            w-8 h-8 transition-transform duration-300 group-active:scale-95
            ${isActive || highlight ? 'text-action' : ''}
          `}
        />
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

      // 🛡️ ADMIN & MANAGER: Hide from public front app
      if (level === 'admin' || level === 'manager') return false;

      // 🏢 AGENCY: Only show if user is agency
      if (level === 'agency') return userProfile?.role === 'agency';

      // 👤 USER: Show only if logged in
      if (level === 'user') return !!userProfile;

      // 🌍 PUBLIC: Always show
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

        {/* HAMBURGER TOGGLE (Aligned with other menu items) */}
        <div className="mb-8 space-y-1">
          <button
            onClick={onToggle}
            title="Toggle Sidebar"
            className={`relative flex items-center w-full h-14 mb-1 transition-all duration-200 group ${isDarkMode ? 'text-slate-400 hover:text-white' : 'text-slate-500 hover:text-action'}`}
          >
            {/* BACKGROUND */}
            <div className={`absolute inset-y-1 inset-x-2 rounded-xl transition-colors ${isDarkMode ? 'group-hover:bg-white/5' : 'group-hover:bg-slate-100'}`} />

            {/* ICON CONTAINER (Fixed position) */}
            <div className={`${CLOSED_WIDTH} shrink-0 flex items-center justify-center z-10`}>
              {(() => {
                const ToggleIcon = isOpen ? getIcon('ChevronLeft') : getIcon('Menu');
                return <ToggleIcon className={`w-8 h-8 transition-transform duration-500 ${isOpen ? 'rotate-180' : ''}`} />;
              })()}
            </div>

            {/* TEXT CONTAINER (Appears when open) */}
            <div className={`flex items-center flex-1 overflow-hidden whitespace-nowrap z-10 transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 -translate-x-5 pointer-events-none'}`}>
              <span className="font-display text-lb tracking-wide font-bold ml-1">Close Menu</span>
            </div>
          </button>
        </div>

        {/* ================= HEADER: LOGO ================= */}
        <div className="flex items-center mb-8 h-12">
          <div className={`${CLOSED_WIDTH} shrink-0 flex items-center justify-center`}>
            <img 
              src={isDarkMode ? LogoIconDark : LogoIconLight} 
              alt="Logo" 
              className="size-10 object-contain shadow-lg shadow-action/10" 
            />
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
        <div className={`mt-auto pt-4 space-y-1 border-t ${isDarkMode ? 'border-white/10' : 'border-slate-100'}`}>

          {/* AUTH BUTTON */}
          <button
            onClick={userProfile ? onLogout : () => onNavigate('auth')}
            className={`relative flex items-center w-full h-14 rounded-xl transition-all group ${isDarkMode ? 'text-slate-400 hover:text-red-400' : 'text-slate-500 hover:text-red-500'}`}
          >
            <div className={`absolute inset-y-1 inset-x-2 rounded-xl transition-colors ${isDarkMode ? 'group-hover:bg-white/5' : 'group-hover:bg-slate-100'}`} />
            <div className="w-[108px] shrink-0 flex items-center justify-center z-10">
              {(() => {
                const AuthIcon = userProfile ? getIcon('LogOut') : getIcon('LogIn');
                return <AuthIcon className="w-8 h-8" />;
              })()}
            </div>
            <div className={`flex items-center flex-1 overflow-hidden whitespace-nowrap z-10 transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0'}`}>
              <span className="font-display text-lb tracking-wide font-bold ml-1">{userProfile ? 'Sign Out' : 'Log In'}</span>
            </div>
          </button>

          {/* THEME BUTTON */}
          <button
            onClick={onToggleTheme}
            className={`relative flex items-center w-full h-14 rounded-xl transition-all group ${isDarkMode ? 'text-slate-400 hover:text-quiz' : 'text-slate-500 hover:text-action'}`}
          >
            <div className={`absolute inset-y-1 inset-x-2 rounded-xl transition-colors ${isDarkMode ? 'group-hover:bg-white/5' : 'group-hover:bg-slate-100'}`} />
            <div className="w-[108px] shrink-0 flex items-center justify-center z-10">
              {(() => {
                const ThemeIcon = isDarkMode ? getIcon('Sun') : getIcon('Moon');
                return <ThemeIcon className="w-8 h-8" />;
              })()}
            </div>
            <div className={`flex items-center flex-1 overflow-hidden whitespace-nowrap z-10 transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0'}`}>
              <span className="font-display text-lb tracking-wide font-bold ml-1">{isDarkMode ? 'Light Mode' : 'Dark Mode'}</span>
            </div>
          </button>
        </div>

      </div>
    </nav>
  );
};

export default Sidebar;