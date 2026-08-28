import { useLocation, Link, useNavigate } from "react-router";
import { useState, useEffect, useCallback } from "react";
import { useSidebar } from "../context/SidebarContext";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { contentService } from "@thaiakha/shared/services";
import { LogoIconLight, LogoIconDark } from "@thaiakha/shared";
import { getIcon } from "@thaiakha/shared/lib/icons";
import Tooltip from "../components/ui/Tooltip";
import { ExternalLink, RotateCw } from "lucide-react";
import { useTranslation } from "react-i18next";

const FRONT_APP_URL = import.meta.env.VITE_FRONT_APP_URL || 'https://www.thaiakha.com';
const SIDEBAR_TRANSITION = '800ms';
const SIDEBAR_Z_INDEX = 'z-[99]';
const SKELETON_ITEMS = 6;
// Step per DISPOSITIVO, non per larghezza finestra: pointer-coarse (touch: iPad/telefono)
// = contenuta; mouse = piena a qualunque larghezza. Una finestra desktop stretta resta piena.
const RAIL = 'w-[108px] pointer-coarse:w-[92px]';
const ROW_H = 'h-12 pointer-coarse:h-11';
const ROW_ICON = 'w-6 h-6 pointer-coarse:w-5 pointer-coarse:h-5';

// ─────────────────────────────────────────────────────────────────────────────
// LOCAL SUB-COMPONENTS
// ─────────────────────────────────────────────────────────────────────────────

interface NavItemProps {
  icon: string;
  label: string;
  href: string;
  isActive: boolean;
  onClick: () => void;
  isOpen: boolean;
}

function NavItem({ icon, label, href, isActive, onClick, isOpen }: NavItemProps) {
  const IconComponent = getIcon(icon);
  return (
    <a
      href={href}
      onClick={(e) => {
        // Let the browser handle new-tab / middle-click natively (Cmd/Ctrl/middle).
        if (e.ctrlKey || e.metaKey || e.button !== 0) return;
        e.preventDefault();
        onClick();
      }}
      aria-current={isActive ? 'page' : undefined}
      className={`
        group relative flex items-center w-full ${ROW_H} no-underline
        transition-colors duration-200 rounded-xl pl-0 pr-1 cursor-pointer
        ${isActive ? 'bg-primary-500/20 dark:bg-primary-500/20' : 'hover:bg-primary-500/10 dark:hover:bg-primary-500/10'}
      `}
    >
      <div className={`${RAIL} shrink-0 flex items-center justify-center pr-4 z-10`}>
        <IconComponent className={`
          ${ROW_ICON} transition-transform duration-300 group-active:scale-95
          ${isActive ? 'text-primary-500 dark:text-primary-400' : 'text-sub'}
        `} />
      </div>
      <div className={`
        flex items-center flex-1 overflow-hidden whitespace-nowrap z-10
        transition-all duration-300 ease-[cubic-bezier(0.25,1,0.5,1)] origin-left
        ${isOpen ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-5 pointer-events-none'}
      `}>
        <span className={`font-display font-bold tracking-wide text-base pointer-coarse:text-sm ${isActive ? 'text-primary-500 dark:text-primary-400' : 'text-body'}`}>
          {label}
        </span>
      </div>
    </a>
  );
}

function Divider({ className = 'my-1' }: { className?: string }) {
  return <div className={`h-px bg-gray-100 dark:bg-gray-900 ${className}`} role="separator" />;
}

function SkeletonNavItem({ isOpen }: { isOpen: boolean }) {
  return (
    <li aria-hidden="true" className={`flex items-center w-full ${ROW_H}`}>
      <div className={`${RAIL} shrink-0 flex items-center justify-center pr-4`}>
        <div className={`${ROW_ICON} rounded-md bg-gray-200 dark:bg-gray-800 animate-pulse`} />
      </div>
      {isOpen && (
        <div className="flex-1 pr-4">
          <div className="h-3.5 w-2/3 rounded bg-gray-200 dark:bg-gray-800 animate-pulse" />
        </div>
      )}
    </li>
  );
}

// ─────────────────────────────────────────────────────────────────────────────

type NavItemData = {
  name: string;
  icon: string;
  path: string;
  allowedRoles?: string[];
};

/** Riga menu admin da contentService.getMenuItems('site_metadata_admin') (unione front/admin nel service). */
type AdminMenuRow = {
  page_slug: string;
  menu_label: string;
  header_icon?: string | null;
  access_level?: string | null;
};

const AppSidebar: React.FC = () => {
  const { t, i18n } = useTranslation('navigation');
  const { isExpanded, isMobileOpen, toggleMobileSidebar } = useSidebar();
  const { user, session } = useAuth();
  const { theme } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  const [menuItems, setMenuItems] = useState<NavItemData[]>([]);
  const [menuState, setMenuState] = useState<'loading' | 'ready' | 'error'>('loading');

  const loadMenu = useCallback(async () => {
    setMenuState('loading');
    try {
      const items = await contentService.getMenuItems('site_metadata_admin', i18n.language);
      if (!items) { console.error('No menu items returned from database'); setMenuState('error'); return; }
      setMenuItems((items as AdminMenuRow[]).map((item) => ({
        name: item.menu_label,
        icon: item.header_icon || 'LayoutDashboard',
        path: `/${item.page_slug}`,
        allowedRoles: item.access_level ? [item.access_level] : [],
      })));
      setMenuState('ready');
    } catch (error) {
      console.error('Failed to load menu items:', error);
      setMenuState('error');
    }
  }, [i18n.language]);

  useEffect(() => { loadMenu(); }, [loadMenu]);

  const isSidebarOpen = isExpanded || isMobileOpen;
  // Active on the exact route AND its sub-routes (e.g. /admin-news/123 lights up /admin-news).
  // '/' must stay exact, otherwise it would match every path.
  const isActive = (path: string) =>
    path === '/'
      ? location.pathname === '/'
      : location.pathname === path || location.pathname.startsWith(`${path}/`);

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
        href={nav.path}
        isActive={active}
        onClick={() => {
          if (location.pathname !== nav.path) navigate(nav.path);
          if (isMobileOpen) toggleMobileSidebar();
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

  const handleGoToLiveWeb = useCallback((e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    // Build the URL synchronously from the in-context session: opening the tab
    // after an `await` makes the browser treat window.open as non-user-initiated
    // and the popup gets blocked. Session is already available via useAuth().
    const url = session?.access_token && session?.refresh_token
      ? `${FRONT_APP_URL}#access_token=${encodeURIComponent(session.access_token)}&refresh_token=${encodeURIComponent(session.refresh_token)}&token_type=bearer`
      : FRONT_APP_URL;
    window.open(url, '_blank', 'noopener,noreferrer');
  }, [session]);

  return (
    <aside
      style={{ transitionDuration: SIDEBAR_TRANSITION }}
      className={`fixed mt-16 flex flex-col lg:mt-0 top-0 left-0 bg-white dark:bg-gray-900 dark:border-gray-800 text-title h-screen ${SIDEBAR_Z_INDEX} border-r border-gray-100
        transition-all ease-[cubic-bezier(0.32,0.72,0,1)]
        ${isSidebarOpen ? "w-80 pointer-coarse:w-72" : RAIL}
        ${isMobileOpen ? "translate-x-0" : "-translate-x-full"}
        lg:translate-x-0 overflow-visible`}
    >
      <div className="flex flex-col h-full py-6 pt-[40px] px-2">

        {/* HEADER: LOGO */}
        <div className={`flex items-center mb-8 ${ROW_H}`}>
          <div className={`${RAIL} shrink-0 flex items-center justify-center pr-4`}>
            <Link to="/">
              <img
                src={theme === "dark" ? LogoIconDark : LogoIconLight}
                alt={t('sidebar.logoAlt')}
                width={60}
                height={60}
                className="size-[60px] pointer-coarse:size-12 object-contain"
              />
            </Link>
          </div>
          <div className={`overflow-hidden whitespace-nowrap transition-all duration-500 ${isSidebarOpen ? 'opacity-100 w-auto' : 'opacity-0 w-0'}`}>
            <span className="font-display font-black text-2xl tracking-tighter text-title">
              Thai <span className="text-primary-500">Akha</span>
            </span>
          </div>
        </div>

        {/* DIVIDER */}
        <div className="my-2">
          <Divider className="my-0 mb-4" />
        </div>

        {/* MENU LIST */}
        <nav
          aria-label={t('sidebar.menuLabel', { defaultValue: 'Main navigation' })}
          className="flex-1 overflow-y-auto overflow-x-hidden custom-scrollbar"
        >
          <ul className="flex flex-col gap-2 pointer-coarse:gap-1.5">
            {menuState === 'loading' ? (
              Array.from({ length: SKELETON_ITEMS }).map((_, i) => (
                <SkeletonNavItem key={i} isOpen={isSidebarOpen} />
              ))
            ) : menuState === 'error' ? (
              <li className={`px-2 ${isSidebarOpen ? '' : 'flex justify-center'}`}>
                <button
                  onClick={loadMenu}
                  className={`flex items-center gap-2 w-full ${ROW_H} px-3 rounded-xl text-sm font-bold text-primary-600 dark:text-primary-400 hover:bg-primary-500/10 transition-colors`}
                  title={t('sidebar.retry', { defaultValue: 'Retry' })}
                >
                  <RotateCw className="w-5 h-5 shrink-0" />
                  {isSidebarOpen && <span>{t('sidebar.retry', { defaultValue: 'Retry' })}</span>}
                </button>
              </li>
            ) : (
              filterByRole(menuItems).map(renderNavItem)
            )}
          </ul>
        </nav>

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
            <button className="w-full py-2 px-3 mt-2 bg-white hover:bg-gray-50 text-primary-600 font-bold text-sm rounded-lg transition-colors duration-200 cursor-pointer">
              {t('sidebar.goLive')}
            </button>
          </a>
        </div>

      </div>
    </aside>
  );
};

export default AppSidebar;
