import { useLocation, Link, useNavigate } from "react-router";
import { useState, useEffect, useCallback } from "react";
import { useSidebar } from "../context/SidebarContext";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { contentService } from "@thaiakha/shared/services";
import { LogoIconLight, LogoIconDark, SidebarNavItem, SidebarDivider } from "@thaiakha/shared";
import { supabase } from "@thaiakha/shared/lib/supabase";
import Tooltip from "../components/ui/Tooltip";
import { ExternalLink } from "lucide-react";

const FRONT_APP_URL = import.meta.env.VITE_FRONT_APP_URL || 'http://localhost:3000';

type NavItem = {
  name: string;
  icon: string; // Icon name as string (from database)
  path: string;
  allowedRoles?: string[];
};

const AppSidebar: React.FC = () => {
  const { isExpanded, isMobileOpen, toggleMobileSidebar } = useSidebar();
  const { user } = useAuth();
  const { theme } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  const [menuItems, setMenuItems] = useState<NavItem[]>([]);

  // Load menu items from database
  useEffect(() => {
    const loadMenu = async () => {
      try {
        const items = await contentService.getMenuItems('site_metadata_admin');

        if (!items) {
          console.error('No menu items returned from database');
          return;
        }

        // Transform database items to NavItem format
        const navItems: NavItem[] = items.map((item: any) => ({
          name: item.menu_label,
          icon: item.header_icon || 'LayoutDashboard', // Fallback icon
          path: `/${item.page_slug}`,
          allowedRoles: item.access_level ? [item.access_level] : []
        }));

        setMenuItems(navItems);
      } catch (error) {
        console.error('Failed to load menu items:', error);
      }
    };

    loadMenu();
  }, []);

  const isSidebarOpen = isExpanded || isMobileOpen;
  const isActive = (path: string) => location.pathname === path;

  const filterByRole = (items: NavItem[]) => {
    return items.filter(item => {
      if (!item.allowedRoles || item.allowedRoles.length === 0) return true;
      if (user?.role) {
        return item.allowedRoles.some(r => r.toLowerCase() === user.role.toLowerCase());
      }
      return false;
    });
  };

  const renderNavItem = (nav: NavItem) => {
    const active = isActive(nav.path);

    const navItem = (
      <SidebarNavItem
        icon={nav.icon}
        label={nav.name}
        isActive={active}
        onClick={() => {
          if (location.pathname !== nav.path) {
            navigate(nav.path);
          }
          isMobileOpen && toggleMobileSidebar();
        }}
        isOpen={isSidebarOpen}
        isDarkMode={theme === 'dark'}
      />
    );

    return (
      <li key={nav.path} className="mx-3">
        {!isSidebarOpen ? (
          <Tooltip content={nav.name} position="right" className="w-full">
            {navItem}
          </Tooltip>
        ) : (
          navItem
        )}
      </li>
    );
  };

  /**
   * Hand-off the current Supabase session to the front app via URL tokens.
   * The front app will pick up #access_token&refresh_token and call setSession().
   */
  const handleGoToLiveWeb = useCallback(async (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.access_token && session?.refresh_token) {
        // Pass tokens in the URL fragment (never in query string — it looks cleaner & avoids server logs)
        const url = `${FRONT_APP_URL}#access_token=${encodeURIComponent(session.access_token)}&refresh_token=${encodeURIComponent(session.refresh_token)}&token_type=bearer`;
        window.open(url, '_blank', 'noopener,noreferrer');
      } else {
        // No active session — just open the front app normally
        window.open(FRONT_APP_URL, '_blank', 'noopener,noreferrer');
      }
    } catch {
      window.open(FRONT_APP_URL, '_blank', 'noopener,noreferrer');
    }
  }, []);



  return (
    <aside
      className={`fixed mt-16 flex flex-col lg:mt-0 top-0 left-0 bg-white dark:bg-gray-900 dark:border-gray-800 text-gray-900 h-screen z-[99] border-r border-gray-200
        transition-all ease-[cubic-bezier(0.32,0.72,0,1)]
        ${isSidebarOpen ? "w-80" : "w-[108px]"}
        ${isMobileOpen ? "translate-x-0" : "-translate-x-full"}
        lg:translate-x-0 overflow-visible`}
      style={{ transitionDuration: '500ms' }}
    >
      <div className="flex flex-col h-full py-6 pt-[40px]">

        {/* HEADER: LOGO */}
        <div className="flex items-center mb-8 h-12">
          <div className={`w-[108px] shrink-0 flex items-center justify-center`}>
            <Link to="/">
              <img
                src={theme === "dark" ? LogoIconDark : LogoIconLight}
                alt="Logo"
                width={60}
                height={60}
              />
            </Link>
          </div>

          <div className={`overflow-hidden whitespace-nowrap transition-all duration-500 ${isSidebarOpen ? 'opacity-100 w-auto' : 'opacity-0 w-0'}`}>
            <span className={`font-display font-black text-2xl tracking-tighter text-gray-900 dark:text-white`}>
              Thai <span className="text-brand-500">Akha</span>
            </span>
          </div>
        </div>

        {/* DIVIDER */}
        <div className="my-2">
          <SidebarDivider className="my-0" />
        </div>

        {/* MENU LIST */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden custom-scrollbar space-y-2">
          <ul className="flex flex-col gap-0">
            {filterByRole(menuItems).map(renderNavItem)}
          </ul>
        </div>

        {/* FOOTER - GO LIVE WEB CARD */}
        <div className={`mt-auto mx-1 pb-6 transition-all duration-500 ${isSidebarOpen ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none'}`}>
          <a
            href={FRONT_APP_URL}
            onClick={handleGoToLiveWeb}
            className="block p-4 rounded-2xl bg-gradient-to-br from-brand-500 to-brand-600 hover:from-brand-600 hover:to-brand-700 transition-all duration-300 no-underline"
          >
            <div className="flex items-start justify-between gap-2 mb-2">
              <div className="flex-1">
                <h3 className="text-sm font-bold text-white">Visit Live Site</h3>
                <p className="text-xs text-brand-100 mt-1">Explore the public website</p>
              </div>
              <ExternalLink size={16} className="text-white shrink-0 mt-1" />
            </div>
            <button className="w-full py-2 px-3 mt-2 bg-white hover:bg-gray-50 text-brand-600 font-bold text-sm rounded-lg transition-colors duration-200">
              Go Live Web
            </button>
          </a>
        </div>

      </div>

    </aside>
  );
};

export default AppSidebar;
