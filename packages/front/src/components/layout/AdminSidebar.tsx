import React, { useMemo } from 'react';
import { cn } from '../../lib/utils';
import { UserProfile } from '../../services/authService';

// --- NAV ITEM ---
const NavItem: React.FC<{
  icon: string;
  label: string;
  isActive: boolean;
  onClick: () => void;
  isOpen: boolean;
  isDarkMode: boolean;
  badge?: string;
  isAction?: boolean;
}> = ({ icon, label, isActive, onClick, isOpen, isDarkMode, badge, isAction }) => {
  return (
    <button
      onClick={onClick}
      title={label}
      className={cn(
        "relative flex items-center w-full h-14 mb-1 transition-all duration-200 group",
        isActive 
          ? "text-action font-bold" 
          : isAction 
            ? "text-blue-500 hover:text-blue-600"
            : `text-slate-500 ${isDarkMode ? 'hover:text-white' : 'hover:text-action'}`
      )}
    >
      {/* SFONDO ACTIVE/HOVER */}
      <div className={cn(
        "absolute inset-y-1 inset-x-2 rounded-xl transition-all duration-300",
        isActive 
          ? "bg-action/10" 
          : isDarkMode ? "group-hover:bg-white/5" : "group-hover:bg-slate-100"
      )} />

      {/* ICONA */}
      <div className="w-[108px] shrink-0 flex items-center justify-center z-10">
        <span className={cn(
          "material-symbols-outlined text-3xl transition-transform duration-300 group-active:scale-95",
          isActive ? "text-action" : ""
        )}>
          {icon}
        </span>
      </div>

      {/* TESTO */}
      <div className={cn(
        "flex items-center flex-1 overflow-hidden whitespace-nowrap z-10 transition-all duration-300 ease-[cubic-bezier(0.25,1,0.5,1)] origin-left",
        isOpen ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-5 pointer-events-none"
      )}>
        <span className="font-display text-base tracking-wide font-bold ml-1">
          {label}
        </span>
        {badge && (
          <span className={cn(
            "px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider ml-3",
            isActive ? "bg-action text-white shadow-sm" : "bg-slate-200 dark:bg-white/10 text-slate-500 dark:text-slate-300"
          )}>
            {badge}
          </span>
        )}
      </div>

      {isActive && (
        <div className="absolute left-0 top-1/2 -translate-y-1/2 h-8 w-1 bg-action rounded-r-full" />
      )}
    </button>
  );
};

// --- MENU DATA ---
const ADMIN_MENU = [
  // Core Ops
  { id: 'calendar', label: 'Master Calendar', icon: 'calendar_month', page: 'admin-calendar' },
  { id: 'kitchen', label: 'Kitchen Ops', icon: 'skillet', page: 'admin-kitchen' },
  { id: 'market-plan', label: 'Market Reports (T/L)', icon: 'description', page: 'admin-market-plan' },
  { id: 'market-run', label: 'Start Shopping', icon: 'shopping_cart', page: 'admin-market-run' },
  { id: 'logistics', label: 'Logistics Manager', icon: 'local_shipping', page: 'admin-logistics' },
  { id: 'store', label: 'POS Store', icon: 'storefront', page: 'admin-store' },
  { id: 'inventory', label: 'Store Manager', icon: 'inventory_2', page: 'admin-store-manager' },
  { id: 'driver', label: 'Driver App', icon: 'local_taxi', page: 'admin-driver' },
  
  // Public Shortcuts (Admin Only)
  { id: 'booking', label: 'New Booking', icon: 'calendar_add_on', page: 'booking', isAction: true },
  { id: 'location', label: 'Location Map', icon: 'map', page: 'location', isAction: true },
  
  // B2B
  { id: 'agency', label: 'Agency B2B', icon: 'business_center', page: 'agency-portal' },
];

interface AdminSidebarProps {
  currentPage: string;
  onNavigate: (page: string) => void;
  isOpen: boolean;
  onToggle: () => void;
  isDarkMode: boolean;
  onToggleTheme: () => void;
  onLogout: () => void;
  userProfile?: UserProfile | null;
}

const CLOSED_WIDTH = 'w-[108px]';

const AdminSidebar: React.FC<AdminSidebarProps> = ({ 
  currentPage, onNavigate, isOpen, onToggle, isDarkMode, onToggleTheme, onLogout, userProfile
}) => {

  // 🛡️ FILTRO MENU INTELLIGENTE
  const visibleItems = useMemo(() => {
    if (!userProfile) return [];

    if (userProfile.role === 'driver') {
      return ADMIN_MENU.filter(item => item.id === 'driver' || item.id === 'market-run');
    }
    if (userProfile.role === 'kitchen') {
      return ADMIN_MENU.filter(item => item.id === 'kitchen' || item.id === 'store' || item.id === 'market-plan');
    }
    // Admin / Manager vedono tutto
    return ADMIN_MENU;
  }, [userProfile]);

  return (
    <aside 
      className={cn(
        "relative h-full shrink-0 z-50 flex flex-col border-r transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)]",
        isDarkMode ? "bg-[#0a0b0d]/95 border-white/5" : "bg-white border-slate-200 shadow-xl",
        "backdrop-blur-xl",
        isOpen ? 'w-80' : CLOSED_WIDTH
      )}
    >
      <div className="flex flex-col h-full py-6 pt-[40px]">
        
        {/* TOGGLE BUTTON */}
        <div className="pt-2 pb-3 flex justify-center">
          <button 
            onClick={onToggle}
            className={cn(
              "w-full h-14 rounded-2xl flex items-center justify-center transition-all border",
              isDarkMode 
                ? "bg-white/5 border-white/10 text-white hover:bg-white/10 hover:border-white/20" 
                : "bg-slate-100 border-slate-200 text-slate-900 hover:bg-slate-200 hover:border-slate-300",
              isOpen ? "mx-0" : "mx-0 aspect-square"
            )}
          >
            <span className={cn("material-symbols-outlined text-3xl transition-transform duration-500", isOpen && "rotate-180")}>
              {isOpen ? 'chevron_left' : 'menu'}
            </span>
          </button>
        </div>

        {/* HEADER: LOGO */}
        <div className="flex items-center mb-8 h-12">
          <div className={`${CLOSED_WIDTH} shrink-0 flex items-center justify-center`}>
            <div className="size-10 bg-action rounded-xl flex items-center justify-center shadow-lg shadow-action/30">
              <span className="font-display font-black text-white text-xl">TA</span>
            </div>
          </div>
          <div className={cn("overflow-hidden whitespace-nowrap transition-all duration-500", isOpen ? "opacity-100 w-auto" : "opacity-0 w-0")}>
            <div className="flex flex-col leading-none">
              <span className={cn("font-display font-black text-2xl tracking-tighter", isDarkMode ? "text-white" : "text-slate-900")}>
                Thai <span className="text-action">Akha</span>
              </span>
              <span className="text-[9px] font-black uppercase tracking-[0.3em] text-red-500 ml-0.5">
                {userProfile?.role === 'driver' ? 'Driver App' : 'Admin Console'}
              </span>
            </div>
          </div>
        </div>

        {/* MENU ITEMS */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden custom-scrollbar space-y-1">
          {visibleItems.map((item) => (
            <NavItem 
              key={item.id}
              icon={item.icon}
              label={item.label}
              isActive={currentPage === item.page}
              onClick={() => onNavigate(item.page)}
              isOpen={isOpen}
              isDarkMode={isDarkMode}
              isAction={(item as any).isAction}
            />
          ))}
        </div>

        {/* FOOTER ACTIONS */}
        <div className={cn("mt-auto pt-4 space-y-2 border-t mx-2", isDarkMode ? "border-white/10" : "border-slate-100")}>
          
          <button 
            onClick={onToggleTheme}
            className={cn(
              "relative flex items-center w-full h-14 rounded-xl transition-all group",
              isDarkMode ? "text-slate-400 hover:text-quiz" : "text-slate-500 hover:text-action"
            )}
          >
            <div className={cn("absolute inset-0 rounded-xl transition-colors", isDarkMode ? "group-hover:bg-white/5" : "group-hover:bg-slate-100")} />
            <div className="w-[108px] shrink-0 flex items-center justify-center z-10">
              <span className="material-symbols-outlined text-3xl">{isDarkMode ? 'light_mode' : 'dark_mode'}</span>
            </div>
            <div className={cn("flex-1 overflow-hidden whitespace-nowrap transition-opacity duration-300", isOpen ? "opacity-100" : "opacity-0")}>
              <span className="font-bold text-base">{isDarkMode ? 'Light Mode' : 'Dark Mode'}</span>
            </div>
          </button>

          <button 
            onClick={onLogout}
            className={cn(
              "relative flex items-center w-full h-14 rounded-xl transition-all group",
              isDarkMode ? "text-slate-400 hover:text-red-400" : "text-slate-500 hover:text-red-500"
            )}
          >
            <div className={cn("absolute inset-0 rounded-xl transition-colors", isDarkMode ? "group-hover:bg-white/5" : "group-hover:bg-slate-100")} />
            <div className="w-[108px] shrink-0 flex items-center justify-center z-10">
              <span className="material-symbols-outlined text-3xl">logout</span>
            </div>
            <div className={cn("flex-1 overflow-hidden whitespace-nowrap transition-opacity duration-300", isOpen ? "opacity-100" : "opacity-0")}>
              <span className="font-bold text-base">Sign Out</span>
            </div>
          </button>

        </div>
      </div>
    </aside>
  );
};

export default AdminSidebar;