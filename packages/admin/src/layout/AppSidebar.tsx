import { useLocation, Link, useNavigate } from "react-router";
import { useState, useEffect, useCallback } from "react";
import { useSidebar } from "../context/SidebarContext";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { contentService } from "@thaiakha/shared/services";
import { LogoIconLight, LogoIconDark } from "@thaiakha/shared";
import { getIcon } from "@thaiakha/shared/lib/icons";
import { supabase } from "@thaiakha/shared/lib/supabase";
import Tooltip from "../components/ui/Tooltip";
import { ExternalLink } from "lucide-react";
import { useTranslation } from "react-i18next";

const FRONT_APP_URL = import.meta.env.VITE_FRONT_APP_URL || 'http://localhost:3000';
const SIDEBAR_TRANSITION = '800ms';

// ─────────────────────────────────────────────────────────────────────────────
// LOCAL SUB-COMPONENTS
// ─────────────────────────────────────────────────────────────────────────────

interface NavItemProps {
  icon: string;
  label: string;
  isActive: boolean;
  onClick: () => void;
  isOpen: boolean;
}

function NavItem({ icon, label, isActive, onClick, isOpen }: NavItemProps) {
  const IconComponent = getIcon(icon);
  return (
    <button
      onClick={onClick}
      title={label}
      className={`
        relative flex items-center w-full h-12
        transition-colors duration-200 rounded-xl pl-0 pr-1
        ${isActive ? 'bg-primary-500/20 dark:bg-primary-500/20' : 'hover:bg-primary-500/10 dark:hover:bg-primary-500/10'}
      `}
    >
      <div className="w-[108px] shrink-0 flex items-center justify-center pr-4 z-10">
        <IconComponent className={`
          w-6 h-6 transition-transform duration-300 group-active:scale-95
          ${isActive ? 'text-primary-500 dark:text-primary-400' : 'text-gray-500 dark:text-gray-400'}
        `} />
      </div>
      <div className={`
        flex items-center flex-1 overflow-hidden whitespace-nowrap z-10
        transition-all duration-300 ease-[cubic-bezier(0.25,1,0.5,1)] origin-left
        ${isOpen ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-5 pointer-events-none'}
      `}>
        <span className={`font-display font-bold tracking-wide ${isActive ? 'text-primary-500 dark:text-primary-400' : 'text-gray-700 dark:text-gray-300'}`}>
          {label}
        </span>
      </div>
    </button>
  );
}

function Divider({ className = 'my-1' }: { className?: string }) {
  return <div className={`h-px bg-gray-100 dark:bg-gray-900 ${className}`} role="separator" />;
}

// ─────────────────────────────────────────────────────────────────────────────

type NavItemData = {
  name: string;
  icon: string;
  path: string;
  allowedRoles?: string[];
};

const AppSidebar: React.FC = () => {
  const { t, i18n } = useTranslation('navigation');
  const { isExpanded, isMobileOpen, toggleMobileSidebar } = useSidebar();
  const { user } = useAuth();
  const { theme } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  const [menuItems, setMenuItems] = useState<NavItemData[]>([]);

  useEffect(() => {
    const loadMenu = async () => {
      try {
        const items = await contentService.getMenuItems('site_metadata_admin', i18n.language);
        if (!items) { console.error('No menu items returned from database'); return; }
        setMenuItems(items.map((item: any) => ({
          name: item.menu_label,
          icon: item.header_icon || 'LayoutDashboard',
          path: `/${item.page_slug}`,
          allowedRoles: item.access_level ? [item.access_level] : [],
        })));
      } catch (error) { console.error('Failed to load menu items:', error); }
    };
    loadMenu();
  }, [i18n.language]);

  const isSidebarOpen = isExpanded || isMobileOpen;
  const isActive = (path: string) => location.pathname === path;

  const filterByRole = (items: NavItemData[]) =>
    items.filter(item => {
      if (!item.allowedRoles || item.allowedRoles.length === 0) return true;
      if (user?.role) return item.allowedRoles.some(r => r.toLowerCase() === user.role.toLowerCase());
      return false;
    });

  const renderNavItem = (nav: NavItemData) => {
    const active = isActive(nav.path);
    const item = (
      <NavItem
        icon={nav.icon}
        label={nav.name}
        isActive={active}
        onClick={() => {
          if (location.pathname !== nav.path) navigate(nav.path);
          isMobileOpen && toggleMobileSidebar();
        }}
        isOpen={isSidebarOpen}
      />
    );
    return (
      <li key={nav.path}>
        {!isSidebarOpen ? (
          <Tooltip content={nav.name} position="right" className="w-full">{item}</Tooltip>
        ) : item}
      </li>
    );
  };

  const handleGoToLiveWeb = useCallback(async (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.access_token && session?.refresh_token) {
        const url = `${FRONT_APP_URL}#access_token=${encodeURIComponent(session.access_token)}&refresh_token=${encodeURIComponent(session.refresh_token)}&token_type=bearer`;
        window.open(url, '_blank', 'noopener,noreferrer');
      } else {
        window.open(FRONT_APP_URL, '_blank', 'noopener,noreferrer');
      }
    } catch {
      window.open(FRONT_APP_URL, '_blank', 'noopener,noreferrer');
    }
  }, []);

  return (
    <aside
      style={{ transitionDuration: SIDEBAR_TRANSITION }}
      className={`fixed mt-16 flex flex-col lg:mt-0 top-0 left-0 bg-white/20 dark:bg-gray-dark dark:border-gray-900 text-gray-900 h-screen z-[99] border-r border-gray-100
        transition-all ease-[cubic-bezier(0.32,0.72,0,1)]
        ${isSidebarOpen ? "w-80" : "w-[108px]"}
        ${isMobileOpen ? "translate-x-0" : "-translate-x-full"}
        lg:translate-x-0 overflow-visible`}
    >
      <div className="flex flex-col h-full py-6 pt-[40px] px-2">

        {/* HEADER: LOGO */}
        <div className="flex items-center mb-8 h-12">
          <div className="w-[108px] shrink-0 flex items-center justify-center pr-4">
            <Link to="/">
              <img
                src={theme === "dark" ? LogoIconDark : LogoIconLight}
                alt={t('sidebar.logoAlt')}
                width={60}
                height={60}
              />
            </Link>
          </div>
          <div className={`overflow-hidden whitespace-nowrap transition-all duration-500 ${isSidebarOpen ? 'opacity-100 w-auto' : 'opacity-0 w-0'}`}>
            <span className="font-display font-black text-2xl tracking-tighter text-gray-900 dark:text-white">
              Thai <span className="text-primary-500">Akha</span>
            </span>
          </div>
        </div>

        {/* DIVIDER */}
        <div className="my-2">
          <Divider className="my-0 mb-4" />
        </div>

        {/* MENU LIST */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden custom-scrollbar">
          <ul className="flex flex-col gap-2">
            {filterByRole(menuItems).map(renderNavItem)}
          </ul>
        </div>

        {/* FOOTER - GO LIVE WEB CARD */}
        <div className={`mt-auto mx-1 pb-6 transition-all duration-500 ${isSidebarOpen ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none'}`}>
          <a
            href={FRONT_APP_URL}
            onClick={handleGoToLiveWeb}
            className="block p-4 rounded-2xl bg-gradient-to-br from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 transition-all duration-300 no-underline"
          >
            <div className="flex items-start justify-between gap-2 mb-2">
              <div className="flex-1">
                <h3 className="text-sm font-bold text-white">{t('sidebar.visitSite')}</h3>
                <p className="text-xs text-primary-100 mt-1">{t('sidebar.exploreSite')}</p>
              </div>
              <ExternalLink size={16} className="text-white shrink-0 mt-1" />
            </div>
            <button className="w-full py-2 px-3 mt-2 bg-white hover:bg-gray-50 text-primary-600 font-bold text-sm rounded-lg transition-colors duration-200">
              {t('sidebar.goLive')}
            </button>
          </a>
        </div>

      </div>
    </aside>
  );
};

export default AppSidebar;
