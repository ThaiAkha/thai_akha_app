import { Link, useLocation } from "react-router";
import { useState, useEffect } from "react";
import { getIcon } from "@thaiakha/shared/lib/icons";
import { useSidebar } from "../context/SidebarContext";
import { useAuth } from "../context/AuthContext";
import { contentService } from "@thaiakha/shared/services";
import Tooltip from "../components/ui/Tooltip";

type NavItem = {
  name: string;
  icon: string; // Icon name as string (from database)
  path: string;
  allowedRoles?: string[];
};

const AppSidebar: React.FC = () => {
  const { isExpanded, isMobileOpen, toggleMobileSidebar } = useSidebar();
  const { user } = useAuth();
  const location = useLocation();
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
    const IconComponent = getIcon(nav.icon); // Convert string to component
    const active = isActive(nav.path);

    const navLink = (
      <Link
        to={nav.path}
        onClick={() => isMobileOpen && toggleMobileSidebar()}
        className="relative flex items-center w-full h-14 group"
      >
        {/* FLOATING HOVER BACKGROUND */}
        <div className={`
          absolute inset-y-1 inset-x-2 rounded-xl transition-colors duration-200
          ${active
            ? 'bg-brand-50 dark:bg-brand-500/[0.12]'
            : 'group-hover:bg-gray-100 dark:group-hover:bg-white/5'
          }
        `} />

        {/* ACTIVE INDICATOR */}
        {active && (
          <div className="absolute left-0 top-1/2 -translate-y-1/2 h-8 w-1 bg-brand-500 rounded-r-full z-10" />
        )}

        {/* ICON SLOT */}
        <div className="w-[108px] shrink-0 flex items-center justify-center z-10">
          <IconComponent
            className={`w-6 h-6 transition-transform duration-300 group-active:scale-95 ${active
              ? 'text-brand-500 dark:text-brand-400'
              : 'text-gray-500 group-hover:text-gray-700 dark:text-gray-400 dark:group-hover:text-gray-300'
              }`}
          />
        </div>

        {/* LABEL SLOT */}
        <div className={`
          flex items-center flex-1 overflow-hidden whitespace-nowrap z-10
          transition-all duration-300 ease-[cubic-bezier(0.25,1,0.5,1)] origin-left
          ${isSidebarOpen ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-5 pointer-events-none'}
        `}>
          <span className={`font-bold tracking-wide ${active
            ? 'text-brand-500 dark:text-brand-400'
            : 'text-gray-700 dark:text-gray-300'
            }`}>
            {nav.name}
          </span>
        </div>
      </Link>
    );

    return (
      <li key={nav.path}>
        {!isSidebarOpen ? (
          <Tooltip content={nav.name} position="right" className="w-full">
            {navLink}
          </Tooltip>
        ) : (
          navLink
        )}
      </li>
    );
  };



  return (
    <aside
      className={`fixed mt-16 flex flex-col lg:mt-0 top-0 left-0 bg-white dark:bg-gray-900 dark:border-gray-800 text-gray-900 h-screen z-[99] border-r border-gray-200
        transition-all ease-[cubic-bezier(0.32,0.72,0,1)]
        ${isSidebarOpen ? "w-80" : "w-[108px]"}
        ${isMobileOpen ? "translate-x-0" : "-translate-x-full"}
        lg:translate-x-0 overflow-visible`}
      style={{ transitionDuration: '500ms' }}
    >
      {/* HEADER: LOGO + TOGGLE */}
      <div className="flex items-center h-16 lg:h-auto lg:py-8">
        {/* Logo icon — always centered in icon column */}
        <div className="w-[108px] shrink-0 flex items-center justify-center">
          <Link to="/">
            <img src="/favicon.svg" alt="Logo" width={32} height={32} />
          </Link>
        </div>

        {/* Logo text + toggle — visible when expanded */}
        <div className={`
          flex items-center justify-between flex-1 pr-4 overflow-hidden
          transition-all duration-300 ease-[cubic-bezier(0.25,1,0.5,1)]
          ${isSidebarOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}
        `}>
          <Link to="/" className="flex items-center gap-3">
            <span className="text-xl font-display font-bold tracking-tight text-gray-900 dark:text-white whitespace-nowrap">
              Thai Akha <span className="text-brand-500">Kitchen</span>
            </span>
          </Link>
        </div>
      </div>



      {/* NAV */}
      <div className={`flex flex-col flex-1 no-scrollbar ${isSidebarOpen ? 'overflow-y-auto overflow-x-hidden' : 'overflow-visible'}`} style={{ overflow: isSidebarOpen ? undefined : 'visible' }}>
        <nav className="mb-6" style={{ overflow: 'visible' }}>
          <div className="flex flex-col gap-4" style={{ overflow: 'visible' }}>
            {/* All Menu Items — loaded from database */}
            <div style={{ overflow: 'visible' }}>
              <ul className="flex flex-col gap-1" style={{ overflow: 'visible' }}>
                {filterByRole(menuItems).map(renderNavItem)}
              </ul>
            </div>
          </div>
        </nav>
      </div>

    </aside>
  );
};

export default AppSidebar;
