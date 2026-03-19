import React, { useEffect, useState, useMemo } from 'react';
import { UserProfile } from '../../services/auth.service';
import { contentService } from '@thaiakha/shared/services';
import { getIcon } from '@thaiakha/shared/lib/icons';
import { cn } from '@thaiakha/shared/lib/utils';
import { LogoIconLight, LogoIconDark } from '@thaiakha/shared';
import { GraduationCap, ChevronLeft, Menu, Sun, Moon } from 'lucide-react';

const CLOSED_WIDTH = 'w-[108px]';
const SIDEBAR_TRANSITION = '800ms';
const EASE_CUBIC = 'ease-[cubic-bezier(0.25,1,0.5,1)]';

// ─────────────────────────────────────────────────────────────────────────────
// LOCAL SUB-COMPONENTS
// ─────────────────────────────────────────────────────────────────────────────

interface NavItemProps {
  icon: string;
  label: string;
  isActive: boolean;
  onClick: () => void;
  isOpen: boolean;
  badge?: string;
  isVisible?: boolean;
  index?: number;
}

function NavItem({ icon, label, isActive, onClick, isOpen, badge, isVisible = true, index = 0 }: NavItemProps) {
  const IconComponent = getIcon(icon);
  return (
    <button
      onClick={onClick}
      title={label}
      className={cn(
        'relative flex items-center w-full h-12 transition-all duration-500 rounded-xl pl-0 pr-1',
        isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4 pointer-events-none',
        isActive
          ? 'bg-action-500/20 dark:bg-action-500/20'
          : 'hover:bg-action-500/10 dark:hover:bg-action-500/10'
      )}
      style={{ transitionDelay: isVisible ? `${index * 50}ms` : '0ms' }}
    >
      <div className={`${CLOSED_WIDTH} shrink-0 flex items-center justify-start pl-[2.1rem] relative z-10`}>
        <IconComponent className={cn(
          'w-6 h-6 transition-transform duration-300 group-active:scale-95',
          isActive ? 'text-action-700 dark:text-action-400' : 'text-gray-500 dark:text-gray-400'
        )} />
      </div>
      <div className={cn(
        'flex items-center flex-1 overflow-hidden whitespace-nowrap z-10',
        `transition-all duration-300 ${EASE_CUBIC} origin-left`,
        isOpen ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-5 pointer-events-none'
      )}>
        <span className={cn(
          'font-display font-bold tracking-wide',
          isActive ? 'text-action-700 dark:text-action-400' : 'text-gray-700 dark:text-gray-300'
        )}>
          {label}
        </span>
        {badge && (
          <span className={cn(
            'px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider ml-3',
            isActive ? 'bg-action-700 text-white shadow-sm' : 'bg-gray-200 dark:bg-white/10 text-gray-600 dark:text-gray-300'
          )}>
            {badge}
          </span>
        )}
      </div>
    </button>
  );
}

interface ActionButtonProps {
  icon: string;
  label: string;
  onClick: () => void;
  isOpen: boolean;
  isVisible?: boolean;
  index?: number;
}

function ActionButton({ icon, label, onClick, isOpen, isVisible = true, index = 0 }: ActionButtonProps) {
  const IconComponent = getIcon(icon);
  return (
    <button
      onClick={onClick}
      title={label}
      className={cn(
        "relative flex items-center w-full h-14 transition-all duration-500 group",
        isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4 pointer-events-none'
      )}
      style={{ transitionDelay: isVisible ? `${index * 50}ms` : '0ms' }}
    >
      <div className={`absolute inset-1 rounded-xl transition-colors duration-200 group-hover:bg-gray-100 dark:group-hover:bg-white/5`} />
      <div className={`${CLOSED_WIDTH} shrink-0 flex items-center justify-start pl-[2.1rem] z-10`}>
        <IconComponent className="w-6 h-6 text-gray-500 group-hover:text-gray-700 dark:text-gray-400 dark:group-hover:text-gray-300" />
      </div>
      <div className={cn(
        'flex items-center flex-1 overflow-hidden whitespace-nowrap z-10',
        'transition-all duration-300 origin-left',
        isOpen ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-5 pointer-events-none'
      )}>
        <span className="font-display font-bold tracking-wide text-gray-700 dark:text-gray-300">{label}</span>
      </div>
    </button>
  );
}

function Divider({ className = 'my-1' }: { className?: string }) {
  return <div className={`h-px bg-gray-200 dark:bg-gray-900 ${className}`} role="separator" />;
}

interface AvatarProps {
  src?: string;
  name?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const AVATAR_SIZE = { sm: 'w-8 h-8 text-xs', md: 'w-10 h-10 text-sm', lg: 'w-12 h-12 text-base' };

function Avatar({ src, name = 'User', size = 'md', className = '' }: AvatarProps) {
  const initials = name.split(' ').slice(0, 2).map(p => p[0]).join('').toUpperCase() || '?';
  return (
    <div className={cn(
      AVATAR_SIZE[size], 'rounded-full flex items-center justify-center',
      'bg-gradient-to-br from-primary-500 to-primary-600 dark:from-primary-600 dark:to-primary-700',
      'text-white font-bold overflow-hidden flex-shrink-0', className
    )}>
      {src ? <img src={src} alt={name} className="w-full h-full object-cover" /> : <span>{initials}</span>}
    </div>
  );
}

interface ThemeSwitcherProps {
  isDarkMode: boolean;
  onToggle?: () => void;
  isOpen: boolean;
  isVisible?: boolean;
  index?: number;
}

function ThemeSwitcher({ isDarkMode, onToggle, isOpen, isVisible = true, index = 0 }: ThemeSwitcherProps) {
  const ThemeIcon = isDarkMode ? Sun : Moon;
  return (
    <button
      onClick={onToggle}
      title={isDarkMode ? 'Light' : 'Dark'}
      className={cn(
        "relative flex items-center w-full h-14 rounded-xl transition-all duration-500 group",
        isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4 pointer-events-none'
      )}
      style={{ transitionDelay: isVisible ? `${index * 50}ms` : '0ms' }}
    >
      <div className="absolute inset-1 rounded-xl transition-colors duration-300 group-hover:bg-gray-100 dark:group-hover:bg-white/5" />
      <div className={`${CLOSED_WIDTH} shrink-0 flex items-center justify-start pl-[2.1rem] z-10`}>
        <ThemeIcon className="w-6 h-6 text-gray-500 group-hover:text-gray-700 dark:text-gray-400 dark:group-hover:text-gray-300" />
      </div>
      <div className={cn(
        'flex items-center flex-1 overflow-hidden whitespace-nowrap z-10',
        `transition-all duration-300 ${EASE_CUBIC} origin-left`,
        isOpen ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-5 pointer-events-none'
      )}>
        <span className="font-display font-bold tracking-wide text-gray-700 dark:text-gray-300">
          {isDarkMode ? 'Light' : 'Dark'}
        </span>
        <div className={cn(
          'relative inline-flex h-5 w-9 shrink-0 rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ml-auto mr-8',
          isDarkMode ? 'bg-action-600' : 'bg-gray-300 dark:bg-gray-600'
        )}>
          <span className={cn(
            'pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out',
            isDarkMode ? 'translate-x-4' : 'translate-x-0'
          )} />
        </div>
      </div>
    </button>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────────────────────

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

// ─────────────────────────────────────────────────────────────────────────────
// SIDEBAR
// ─────────────────────────────────────────────────────────────────────────────

const Sidebar: React.FC<SidebarProps> = ({
  currentPage, onNavigate, isOpen, onToggle, isDarkMode, userProfile, onToggleTheme, onLogout
}) => {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [visibleIndices, setVisibleIndices] = useState<number[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const loadMenu = async () => {
      try {
        const items = await contentService.getMenuItems();
        setMenuItems(items || []);
        setIsLoaded(true);
      } catch (error) { console.error("Menu error", error); }
    };
    loadMenu();
  }, [userProfile?.role]);

  // Handle Cascading Reveal
  useEffect(() => {
    if (isLoaded && menuItems.length > 0) {
      // Clear previous reveal if necessary, then start fresh
      setVisibleIndices([]);
      const timers = menuItems.map((_, i) => 
        setTimeout(() => {
          setVisibleIndices(prev => [...prev, i]);
        }, 100 + i * 40)
      );
      return () => timers.forEach(clearTimeout);
    }
  }, [isLoaded, menuItems]);

  const studentHubItem = useMemo(() =>
    menuItems.find(item =>
      item.page_slug?.toLowerCase().includes('student-hub') || item.page_slug?.toLowerCase() === 'hub'
    ), [menuItems]);

  const visibleItems = useMemo(() =>
    menuItems.filter(item => {
      const authSlugs = ['auth', 'login', 'logout', 'register', 'sign-in', 'sign-up'];
      if (authSlugs.includes(item.page_slug.toLowerCase())) return false;
      if (item.page_slug?.toLowerCase().includes('student-hub') || item.page_slug?.toLowerCase() === 'hub') return false;
      if (item.page_slug?.toLowerCase() === 'user') return false;
      const level = item.access_level || 'public';
      if (level === 'admin') return false;
      if (level === 'agency') return userProfile?.role === 'agency';
      if (level === 'user') return !!userProfile;
      return true;
    }), [menuItems, userProfile]);

  const ToggleIcon = isOpen ? ChevronLeft : Menu;

  return (
    <nav
      id="sidebar-nav"
      style={{ transitionDuration: SIDEBAR_TRANSITION }}
      className={cn(
        'relative h-full shrink-0 z-50 flex flex-col border-r border-gray-200 dark:border-gray-900',
        'transition-all ease-[cubic-bezier(0.32,0.72,0,1)]',
        'bg-white/90 dark:bg-black/30 backdrop-blur-md',
        isOpen ? 'w-80' : CLOSED_WIDTH
      )}
    >
      <div className="flex flex-col h-full py-6 pt-[20px] px-2">

        {/* HAMBURGER TOGGLE */}
        <div className="mb-1 -mt-2">
          <button
            onClick={onToggle}
            title="Toggle Sidebar"
            className="relative flex items-center w-full h-14 transition-all duration-200 group"
          >
            <div className="absolute inset-1 rounded-xl transition-colors duration-300" />
            <div className={`${CLOSED_WIDTH} shrink-0 flex items-center justify-start pl-[2.1rem] z-10`}>
              <ToggleIcon className="w-6 h-6 transition-transform duration-500 text-gray-500 dark:text-gray-400" />
            </div>
            <div className={cn(
              'flex items-center flex-1 overflow-hidden whitespace-nowrap z-10',
              `transition-all duration-300 ${EASE_CUBIC} origin-left`,
              isOpen ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-5 pointer-events-none'
            )}>
              <span className="font-display font-bold tracking-wide text-gray-500 opacity-30">Close Menu</span>
            </div>
          </button>
        </div>

        {/* LOGO */}
        <div className="flex items-center mt-4 mb-4 h-12">
          <div className={`${CLOSED_WIDTH} shrink-0 flex items-center justify-start pl-[2.1rem] -ml-2`}>
            <img src={isDarkMode ? LogoIconDark : LogoIconLight} alt="Logo" className="size-10 object-contain" />
          </div>
          <div className={`overflow-hidden whitespace-nowrap transition-all duration-500 ${isOpen ? 'opacity-100 w-auto' : 'opacity-0 w-0'}`}>
            <span className="ml-2 font-display font-black text-2xl tracking-tighter text-gray-900 dark:text-white">
              Thai <span className="text-primary-500">Akha</span>
            </span>
          </div>
        </div>

        <Divider className="my-0 mb-4" />

        {/* USER AVATAR */}
        {userProfile && (
          <>
            <div className="mt-2 mb-2">
              <button
                onClick={() => onNavigate('user')}
                className="relative flex items-center w-full h-14 rounded-xl transition-all group"
                title="User Profile"
              >
                <div className="absolute inset-1 rounded-xl transition-colors duration-300" />
                <div className={`${CLOSED_WIDTH} shrink-0 flex items-center justify-start pl-[2.1rem] -ml-2 z-10`}>
                  <Avatar name={userProfile.full_name || userProfile.email} src={userProfile.avatar_url} size="md" />
                </div>
                <div className={cn(
                  'flex items-center flex-1 overflow-hidden whitespace-nowrap z-10 transition-all duration-300',
                  isOpen ? 'opacity-100' : 'opacity-0'
                )}>
                  <span className="ml-2 font-display font-bold tracking-wide text-gray-700 dark:text-gray-300">
                    {userProfile.full_name || 'Profile'}
                  </span>
                </div>
              </button>
            </div>
            <Divider className="my-0 mb-4" />
          </>
        )}

        {/* MENU */}
        <ul className="flex-1 overflow-y-auto overflow-x-hidden custom-scrollbar space-y-2">
          {visibleItems.map((item, index) => {
            const isVisible = visibleIndices.includes(index);
            return (
              <li key={item.page_slug}>
                <NavItem
                  icon={item.header_icon || 'circle'}
                  label={item.menu_label}
                  isActive={currentPage === item.page_slug}
                  onClick={() => onNavigate(item.page_slug)}
                  isOpen={isOpen}
                  badge={item.header_badge}
                  isVisible={isVisible}
                  index={index}
                />
              </li>
            );
          })}
        </ul>

        {/* FOOTER */}
        <div className="mt-auto space-y-2">

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

          <Divider className="my-1 mb-4" />

          <ActionButton 
            icon="Globe" 
            label="Languages" 
            onClick={() => {}} 
            isOpen={isOpen} 
            isVisible={isLoaded}
            index={visibleItems.length + 1}
          />

          <ActionButton
            icon={userProfile ? 'LogOut' : 'LogIn'}
            label={userProfile ? 'Sign Out' : 'Log In'}
            onClick={userProfile ? onLogout! : () => onNavigate('auth')}
            isOpen={isOpen}
            isVisible={isLoaded}
            index={visibleItems.length + 2}
          />

          <ThemeSwitcher 
            isDarkMode={isDarkMode} 
            onToggle={onToggleTheme} 
            isOpen={isOpen} 
            isVisible={isLoaded}
            index={visibleItems.length + 3}
          />

        </div>
      </div>
    </nav>
  );
};

export default Sidebar;
