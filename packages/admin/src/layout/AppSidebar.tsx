import { Link, useLocation } from "react-router";
import { useState, useEffect } from "react";
import { getIcon } from "@thaiakha/shared/lib/icons";
import { useSidebar } from "../context/SidebarContext";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { contentService } from "@thaiakha/shared/services";
import { LogoIconLight, LogoIconDark } from "@thaiakha/shared";
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
  const { theme } = useTheme();
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
      <div className="flex flex-col h-full py-6 pt-[40px]">

        {/* HAMBURGER TOGGLE (Desktop only, aligned with menu items) */}
        <div className="hidden lg:block mb-8 space-y-1">
          <button
            onClick={() => toggleMobileSidebar()}
            title="Toggle Sidebar"
            className={`relative flex items-center w-full h-14 mb-1 transition-all duration-200 group`}
          >
            {/* BACKGROUND */}
            <div className={`absolute inset-y-1 inset-x-2 rounded-xl transition-colors duration-300 group-hover:bg-gray-100 dark:group-hover:bg-white/5`} />

            {/* ICON CONTAINER (Fixed position) */}
            <div className={`w-[108px] shrink-0 flex items-center justify-center z-10`}>
              {(() => {
                const ToggleIcon = isExpanded ? getIcon('ChevronLeft') : getIcon('Menu');
                return <ToggleIcon className={`w-6 h-6 transition-transform duration-500 text-gray-500 dark:text-gray-400`} />;
              })()}
            </div>

            {/* TEXT CONTAINER (Appears when open) */}
            <div className={`flex items-center flex-1 overflow-hidden whitespace-nowrap z-10 transition-all duration-300 ease-[cubic-bezier(0.25,1,0.5,1)] origin-left ${isSidebarOpen ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-5 pointer-events-none'}`}>
              <span className="font-bold tracking-wide text-gray-700 dark:text-gray-300 ml-1">Close Menu</span>
            </div>
          </button>
        </div>

        {/* HEADER: LOGO */}
        <div className="flex items-center mb-8 h-12">
          <div className={`w-[108px] shrink-0 flex items-center justify-center`}>
            <Link to="/">
              <img
                src={theme === "dark" ? LogoIconDark : LogoIconLight}
                alt="Logo"
                width={40}
                height={40}
              />
            </Link>
          </div>

          <div className={`overflow-hidden whitespace-nowrap transition-all duration-500 ${isSidebarOpen ? 'opacity-100 w-auto' : 'opacity-0 w-0'}`}>
            <span className={`font-display font-black text-2xl tracking-tighter text-gray-900 dark:text-white`}>
              Thai <span className="text-brand-500">Akha</span>
            </span>
          </div>
        </div>

        {/* MENU LIST */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden custom-scrollbar space-y-1">
          <ul className="flex flex-col gap-0">
            {filterByRole(menuItems).map(renderNavItem)}
          </ul>
        </div>

        {/* FOOTER */}
        <div className={`mt-auto pt-4 space-y-1 border-t border-gray-200 dark:border-gray-700`}>

          {/* SIGN IN/OUT BUTTON */}
          <button
            onClick={() => {
              if (user) {
                // Logout functionality would be added here
                window.location.href = '/signin';
              } else {
                window.location.href = '/signin';
              }
            }}
            className={`relative flex items-center w-full h-14 rounded-xl transition-all group text-gray-500 hover:text-red-500 dark:text-gray-400 dark:hover:text-red-400`}
          >
            <div className={`absolute inset-y-1 inset-x-2 rounded-xl transition-colors duration-300 group-hover:bg-gray-100 dark:group-hover:bg-white/5`} />
            <div className="w-[108px] shrink-0 flex items-center justify-center z-10">
              {(() => {
                const AuthIcon = user ? getIcon('LogOut') : getIcon('LogIn');
                return <AuthIcon className="w-6 h-6" />;
              })()}
            </div>
            <div className={`flex items-center flex-1 overflow-hidden whitespace-nowrap z-10 transition-all duration-300 ${isSidebarOpen ? 'opacity-100' : 'opacity-0'}`}>
              <span className="font-bold tracking-wide text-gray-700 dark:text-gray-300 ml-1">{user ? 'Sign Out' : 'Log In'}</span>
            </div>
          </button>

          {/* THEME TOGGLE BUTTON */}
          <button
            onClick={() => {
              // Theme toggle functionality already handled by ThemeContext
              const newTheme = theme === 'dark' ? 'light' : 'dark';
              localStorage.setItem('theme', newTheme);
              window.location.reload();
            }}
            className={`relative flex items-center w-full h-14 rounded-xl transition-all group text-gray-500 hover:text-brand-500 dark:text-gray-400 dark:hover:text-yellow-400`}
          >
            <div className={`absolute inset-y-1 inset-x-2 rounded-xl transition-colors duration-300 group-hover:bg-gray-100 dark:group-hover:bg-white/5`} />
            <div className="w-[108px] shrink-0 flex items-center justify-center z-10">
              {(() => {
                const ThemeIcon = theme === 'dark' ? getIcon('Sun') : getIcon('Moon');
                return <ThemeIcon className="w-6 h-6" />;
              })()}
            </div>
            <div className={`flex items-center flex-1 overflow-hidden whitespace-nowrap z-10 transition-all duration-300 ${isSidebarOpen ? 'opacity-100' : 'opacity-0'}`}>
              <span className="font-bold tracking-wide text-gray-700 dark:text-gray-300 ml-1">{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>
            </div>
          </button>

        </div>

      </div>

    </aside>
  );
};

export default AppSidebar;
