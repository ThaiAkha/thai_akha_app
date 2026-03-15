import React, { useEffect, useState, useMemo } from 'react';
import { UserProfile } from '../../services/auth.service';
import { contentService } from '@thaiakha/shared/services';
import { getIcon } from '@thaiakha/shared/lib/icons';
import {
  LogoIconLight,
  LogoIconDark,
  SidebarNavItem,
  SidebarActionButton,
  SidebarDivider,
  SidebarAvatar,
  ThemeSwitcher,
  SIDEBAR_CONSTANTS
} from '@thaiakha/shared';
import { GraduationCap } from 'lucide-react'; // Aggiungi se non presente

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
  onToggleTheme?: () => void;
  userProfile?: UserProfile | null;
  onLogout?: () => void;
}

// --- SIDEBAR MAIN ---
const Sidebar: React.FC<SidebarProps> = ({
  currentPage, onNavigate, isOpen, onToggle, isDarkMode, userProfile, onToggleTheme, onLogout
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
  }, [userProfile?.role]);

  // Extract Student Hub metadata
  const studentHubItem = useMemo(() => {
    return menuItems.find((item) =>
      item.page_slug?.toLowerCase().includes('student-hub') || item.page_slug?.toLowerCase() === 'hub'
    );
  }, [menuItems]);

  const visibleItems = useMemo(() => {
    return menuItems.filter((item) => {
      const authSlugs = ['auth', 'login', 'logout', 'register', 'sign-in', 'sign-up'];
      if (authSlugs.includes(item.page_slug.toLowerCase())) return false;

      if (item.page_slug?.toLowerCase().includes('student-hub') || item.page_slug?.toLowerCase() === 'hub') return false;
      if (item.page_slug?.toLowerCase() === 'user') return false;

      const level = item.access_level || 'public';

      if (level === 'admin') return false;
      if (level === 'agency') return userProfile?.role === 'agency';
      if (level === 'user') return !!userProfile;
      return true;
    });
  }, [menuItems, userProfile]);

  return (
    <nav
      id="sidebar-nav"
      style={{ transitionDuration: SIDEBAR_CONSTANTS.SIDEBAR_TRANSITION_DURATION }}
      className={`
        relative h-full shrink-0 z-50 flex flex-col border-r border-gray-100 dark:border-gray-900
        transition-all ease-[cubic-bezier(0.32,0.72,0,1)]
        bg-white/20 dark:bg-black/20 backdrop-blur-sm
        ${isOpen ? 'w-80' : SIDEBAR_CONSTANTS.CLOSED_WIDTH}
      `}
    >
      <div className="flex flex-col h-full py-6 pt-[20px] px-2">

        {/* ========== TOP SECTION ========== */}

        {/* HAMBURGER TOGGLE */}
        <div className="mb-1 -mt-2">
          <button
            onClick={onToggle}
            title="Toggle Sidebar"
            className="relative flex items-center w-full h-14 transition-all duration-200 group"
          >
            <div className="absolute inset-1 rounded-xl transition-colors duration-300" />
            <div className={`${SIDEBAR_CONSTANTS.CLOSED_WIDTH} shrink-0 flex items-center justify-start pl-[2.1rem] z-10`}>
              {(() => {
                const ToggleIcon = isOpen ? getIcon('ChevronLeft') : getIcon('Menu');
                return <ToggleIcon className="w-6 h-6 transition-transform duration-500 text-gray-500 dark:text-gray-400" />;
              })()}
            </div>
            <div className={`flex items-center flex-1 overflow-hidden whitespace-nowrap z-10 transition-all duration-300 ease-[cubic-bezier(0.25,1,0.5,1)] origin-left ${isOpen ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-5 pointer-events-none'}`}>
              <span className="font-display font-bold tracking-wide text-gray-500 opacity-30">Close Menu</span>
            </div>
          </button>
        </div>

        {/* HEADER: LOGO */}
        <div className="flex items-center mt-4 mb-4 h-12">
          <div className={`${SIDEBAR_CONSTANTS.CLOSED_WIDTH} shrink-0 flex items-center justify-start pl-[2.1rem] -ml-2`}>
            <img
              src={isDarkMode ? LogoIconDark : LogoIconLight}
              alt="Logo"
              className="size-10 object-contain"
            />
          </div>
          <div className={`overflow-hidden whitespace-nowrap transition-all duration-500 ${isOpen ? 'opacity-100 w-auto' : 'opacity-0 w-0'}`}>
            <span className={`ml-2 font-display font-black text-2xl tracking-tighter text-gray-900 dark:text-white`}>
              Thai <span className="text-brand-500">Akha</span>
            </span>
          </div>
        </div>

        {/* DIVIDER 1 */}
        <div className="my-2">
          <SidebarDivider className="my-0" />
        </div>

        {/* USER AVATAR SECTION */}
        {userProfile && (
          <>
            <div className="mt-2 mb-2">
              <li>
                <button
                  onClick={() => onNavigate('user')}
                  className="relative flex items-center w-full h-14 rounded-xl transition-all group"
                  title="User Profile"
                >
                  <div className="absolute inset-1 rounded-xl transition-colors duration-300" />
                  <div className={`${SIDEBAR_CONSTANTS.CLOSED_WIDTH} shrink-0 flex items-center justify-start pl-[2.1rem] -ml-2 z-10`}>
                    <SidebarAvatar
                      name={userProfile.full_name || userProfile.email}
                      src={userProfile.avatar_url}
                      size="md"
                    />
                  </div>
                  <div className={`flex items-center flex-1 overflow-hidden whitespace-nowrap z-10 transition-all duration-300 ${isOpen ? 'opacity-100' : 'opacity-0'}`}>
                    <span className="font-display font-bold tracking-wide text-gray-700 dark:text-gray-300">
                      {userProfile.full_name || 'Profile'}
                    </span>
                  </div>
                </button>
              </li>
            </div>

            {/* DIVIDER 2 */}
            <div className="my-2">
              <SidebarDivider className="my-0 mb-4" />
            </div>
          </>
        )}

        {/* ========== MENU SECTION ========== */}
        <ul className="flex-1 overflow-y-auto overflow-x-hidden custom-scrollbar space-y-2">
          {visibleItems.map((item) => (
            <li key={item.page_slug}>
              <SidebarNavItem
                icon={item.header_icon || 'circle'}
                label={item.menu_label}
                isActive={currentPage === item.page_slug}
                onClick={() => onNavigate(item.page_slug)}
                isOpen={isOpen}
                isDarkMode={isDarkMode}
                badge={item.header_badge}
                accentColor="action"
                showPillOnHover={true}
                showPillOnActive={true}
                pillVariant="filled"
              />
            </li>
          ))}
        </ul>

        {/* ========== FOOTER SECTION ========== */}
        <div className="mt-auto space-y-2">

          {/* STUDENT HUB CARD (if available) */}
          {studentHubItem && isOpen && (
            <button
              onClick={() => onNavigate(studentHubItem.page_slug)}
              className="w-full p-3 rounded-xl bg-gradient-to-r from-amber-50 to-amber-100 dark:from-amber-900/20 dark:to-amber-800/20 border border-amber-200 dark:border-amber-800 hover:border-amber-300 dark:hover:border-amber-700 transition-all"
            >
              <div className="flex items-center gap-2">
                <GraduationCap className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                <span className="text-sm font-medium text-amber-800 dark:text-amber-300">
                  {studentHubItem.menu_label || 'Student Hub'}
                </span>
              </div>
            </button>
          )}

          {/* DIVIDER 3 */}
          <SidebarDivider className="my-1 mb-4" />

          {/* LANGUAGE SWITCHER */}
          <SidebarActionButton
            icon="Globe"
            label="Languages"
            onClick={() => { }}
            isOpen={isOpen}
            title="Languages"
          />

          {/* SIGN IN/OUT BUTTON */}
          <SidebarActionButton
            icon={userProfile ? 'LogOut' : 'LogIn'}
            label={userProfile ? 'Sign Out' : 'Log In'}
            onClick={userProfile ? onLogout : () => onNavigate('auth')}
            isOpen={isOpen}
            title={userProfile ? 'Sign Out' : 'Log In'}
          />

          {/* THEME TOGGLE BUTTON */}
          <ThemeSwitcher
            isDarkMode={isDarkMode}
            onToggle={onToggleTheme}
            variant="sidebar"
            accentColor="action"
            isOpen={isOpen}
          />

        </div>

      </div>
    </nav>
  );
};

export default Sidebar;