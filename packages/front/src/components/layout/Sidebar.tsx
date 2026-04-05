import React, { useEffect, useState, useMemo } from 'react';
import { UserProfile } from '../../services/auth.service';
import { contentService } from '@thaiakha/shared/services';
import { getIcon } from '@thaiakha/shared/lib/icons';
import { cn } from '@thaiakha/shared/lib/utils';
import { LogoIconLight, LogoIconDark } from '@thaiakha/shared';
import { GraduationCap, ChevronLeft, ChevronDown, Menu, Sun, Moon } from 'lucide-react';

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
        'relative flex items-center w-full h-12 transition-all duration-500 rounded-xl pl-0 pr-1 cursor-pointer',
        isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4 pointer-events-none',
        isActive
          ? 'bg-action-500/20'
          : 'hover:bg-action-500/10'
      )}
      style={{ transitionDelay: isVisible ? `${index * 50}ms` : '0ms' }}
    >
      <div className={`${CLOSED_WIDTH} shrink-0 flex items-center justify-start pl-[2.1rem] relative z-10`}>
        <IconComponent className={cn(
          'w-6 h-6 transition-transform duration-300 group-active:scale-95',
          isActive ? 'text-action-700' : 'text-muted'
        )} />
      </div>
      <div className={cn(
        'flex items-center flex-1 overflow-hidden whitespace-nowrap z-10',
        `transition-all duration-300 ${EASE_CUBIC} origin-left`,
        isOpen ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-5 pointer-events-none'
      )}>
        <span className={cn(
          'font-display font-bold tracking-wide',
          isActive ? 'text-action-700' : 'text-sub'
        )}>
          {label}
        </span>
        {badge && (
          <span className={cn(
            'px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider ml-3',
            isActive ? 'bg-action-700 text-white shadow-sm' : 'bg-border text-muted'
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
        "relative flex items-center w-full h-14 transition-all duration-500 group cursor-pointer",
        isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4 pointer-events-none'
      )}
      style={{ transitionDelay: isVisible ? `${index * 50}ms` : '0ms' }}
    >
      <div className={`absolute inset-1 rounded-xl transition-colors duration-200 group-hover:bg-surface`} />
      <div className={`${CLOSED_WIDTH} shrink-0 flex items-center justify-start pl-[2.1rem] z-10`}>
        <IconComponent className="w-6 h-6 text-muted group-hover:text-sub" />
      </div>
      <div className={cn(
        'flex items-center flex-1 overflow-hidden whitespace-nowrap z-10',
        'transition-all duration-300 origin-left',
        isOpen ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-5 pointer-events-none'
      )}>
        <span className="font-display font-bold tracking-wide text-sub">{label}</span>
      </div>
    </button>
  );
}

const SUB_COLOR = {
  primary: {
    bg: 'bg-primary-500/20',
    bgHover: 'hover:bg-primary-500/10',
    icon: 'text-primary-600',
    text: 'text-primary-700',
  },
  action: {
    bg: 'bg-action-500/20',
    bgHover: 'hover:bg-action-500/10',
    icon: 'text-action-600',
    text: 'text-action-700',
  },
} as const;

interface SubNavItemProps {
  icon: string;
  label: string;
  isActive: boolean;
  onClick: () => void;
  isOpen: boolean;
  color?: 'primary' | 'action';
}

function SubNavItem({ icon, label, isActive, onClick, isOpen, color = 'action' }: SubNavItemProps) {
  const IconComponent = getIcon(icon);
  const c = SUB_COLOR[color];
  return (
    <button
      onClick={onClick}
      title={label}
      className={cn(
        'relative flex items-center w-full h-12 transition-all duration-300 rounded-xl pl-0 pr-1 cursor-pointer',
        isActive ? c.bg : c.bgHover
      )}
    >
      {/* Indent: small vertical line indicator on the left */}
      <div className={`${CLOSED_WIDTH} shrink-0 flex items-center justify-start pl-[2.6rem]`}>
        <div className={cn('w-0.5 h-5 rounded-full mr-2 transition-colors duration-200', isActive ? c.icon : 'bg-border')} />
        <IconComponent className={cn('w-5 h-5 transition-colors duration-200', isActive ? c.icon : 'text-muted')} />
      </div>
      <div className={cn(
        'flex items-center flex-1 overflow-hidden whitespace-nowrap',
        `transition-all duration-300 ${EASE_CUBIC} origin-left`,
        isOpen ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-5 pointer-events-none'
      )}>
        <span className={cn(
          'font-display font-bold tracking-wide',
          isActive ? c.text : 'text-sub'
        )}>
          {label}
        </span>
      </div>
    </button>
  );
}

function Divider({ className = 'my-1' }: { className?: string }) {
  return <div className={`h-px bg-border ${className}`} role="separator" />;
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
      'bg-gradient-to-br from-primary-500 to-primary-600',
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
        "relative flex items-center w-full h-14 rounded-xl transition-all duration-500 group cursor-pointer",
        isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4 pointer-events-none'
      )}
      style={{ transitionDelay: isVisible ? `${index * 50}ms` : '0ms' }}
    >
      <div className="absolute inset-1 rounded-xl transition-colors duration-300 group-hover:bg-surface" />
      <div className={`${CLOSED_WIDTH} shrink-0 flex items-center justify-start pl-[2.1rem] z-10`}>
        <ThemeIcon className="w-6 h-6 text-muted group-hover:text-sub" />
      </div>
      <div className={cn(
        'flex items-center flex-1 overflow-hidden whitespace-nowrap z-10',
        `transition-all duration-300 ${EASE_CUBIC} origin-left`,
        isOpen ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-5 pointer-events-none'
      )}>
        <span className="font-display font-bold tracking-wide text-sub">
          {isDarkMode ? 'Light' : 'Dark'}
        </span>
        <div className={cn(
          'relative inline-flex h-5 w-9 shrink-0 rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ml-auto mr-8',
          isDarkMode ? 'bg-action-600' : 'bg-gray-400'
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
  parent_id?: string | null;
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
      setVisibleIndices([]);
      const timers = menuItems.map((_, i) =>
        setTimeout(() => {
          setVisibleIndices(prev => [...prev, i]);
        }, 100 + i * 40)
      );
      return () => timers.forEach(clearTimeout);
    }
  }, [isLoaded, menuItems]);

  const [expandedParent, setExpandedParent] = useState<string | null>(null);

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
      if (level === 'user') return !!userProfile && (userProfile.role as string) !== 'guest_virtual';
      return true;
    }), [menuItems, userProfile]);

  // Build children map keyed by parent id
  const childrenMap = useMemo(() => {
    const map: Record<string, MenuItem[]> = {};
    visibleItems.forEach(item => {
      if (item.parent_id) {
        if (!map[item.parent_id]) map[item.parent_id] = [];
        map[item.parent_id].push(item);
      }
    });
    return map;
  }, [visibleItems]);

  const topLevelItems = useMemo(() =>
    visibleItems.filter(item => !item.parent_id),
    [visibleItems]);

  // Auto-expand parent when current page is a child
  useEffect(() => {
    const parentItem = topLevelItems.find(item =>
      childrenMap[item.id]?.some(child => child.page_slug === currentPage)
    );
    if (parentItem) setExpandedParent(parentItem.id);
  }, [currentPage, topLevelItems, childrenMap]);

  const ToggleIcon = isOpen ? ChevronLeft : Menu;

  return (
    <nav
      id="sidebar-nav"
      style={{ transitionDuration: SIDEBAR_TRANSITION }}
      className={cn(
        'relative h-full shrink-0 z-50 flex flex-col border-r border-border',
        'transition-all ease-[cubic-bezier(0.32,0.72,0,1)]',
        'bg-surface/90 backdrop-blur-md',
        isOpen ? 'w-80' : CLOSED_WIDTH
      )}
    >
      <div className="flex flex-col h-full py-6 pt-[20px] px-2">

        {/* HAMBURGER TOGGLE */}
        <div className="mb-1 -mt-2">
          <button
            onClick={onToggle}
            title="Toggle Sidebar"
            className="relative flex items-center w-full h-14 transition-all duration-200 group cursor-pointer"
          >
            <div className="absolute inset-1 rounded-xl transition-colors duration-300" />
            <div className={`${CLOSED_WIDTH} shrink-0 flex items-center justify-start pl-[2.1rem] z-10`}>
              <ToggleIcon className="w-6 h-6 transition-transform duration-500 text-muted" />
            </div>
            <div className={cn(
              'flex items-center flex-1 overflow-hidden whitespace-nowrap z-10',
              `transition-all duration-300 ${EASE_CUBIC} origin-left`,
              isOpen ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-5 pointer-events-none'
            )}>
              <span className="font-display font-bold tracking-wide text-muted opacity-30">Close Menu</span>
            </div>
          </button>
        </div>

        {/* LOGO */}
        <div className="flex items-center mt-4 mb-4 h-12">
          <div className={`${CLOSED_WIDTH} shrink-0 flex items-center justify-start pl-[2.1rem] -ml-2`}>
            <img src={isDarkMode ? LogoIconDark : LogoIconLight} alt="Logo" className="size-10 object-contain" />
          </div>
          <div className={`overflow-hidden whitespace-nowrap transition-all duration-500 ${isOpen ? 'opacity-100 w-auto' : 'opacity-0 w-0'}`}>
            <span className="ml-2 font-display font-black text-2xl tracking-tighter text-title">
              Thai <span className="text-primary-500">Akha</span>
            </span>
          </div>
        </div>

        <Divider className="my-0 mb-4" />

        {/* USER AVATAR */}
        {userProfile && (userProfile.role as string) !== 'guest_virtual' && (
          <>
            <div className="mt-2 mb-2">
              <button
                onClick={() => onNavigate('user')}
                className="relative flex items-center w-full h-14 rounded-xl transition-all group cursor-pointer"
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
                  <span className="ml-2 font-display font-bold tracking-wide text-sub">
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
          {topLevelItems.map((item, index) => {
            const isVisible = visibleIndices.includes(visibleItems.indexOf(item));
            const children = childrenMap[item.id] ?? [];
            const hasChildren = children.length > 0;
            const isParentExpanded = expandedParent === item.id;
            const isChildActive = children.some(c => c.page_slug === currentPage);

            return (
              <li key={item.page_slug}>
                <div className="relative">
                  <NavItem
                    icon={item.header_icon || 'circle'}
                    label={item.menu_label}
                    isActive={currentPage === item.page_slug || isChildActive}
                    onClick={() => {
                      onNavigate(item.page_slug);
                      if (hasChildren) {
                        setExpandedParent(isParentExpanded ? null : item.id);
                      }
                    }}
                    isOpen={isOpen}
                    badge={item.header_badge}
                    isVisible={isVisible}
                    index={index}
                  />
                  {/* Chevron for parent items — visible only when sidebar is open */}
                  {hasChildren && isOpen && (
                    <div className={cn(
                      'absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none transition-transform duration-300',
                      isParentExpanded ? 'rotate-180' : 'rotate-0'
                    )}>
                      <ChevronDown className="w-4 h-4 text-muted" />
                    </div>
                  )}
                </div>

                {/* Submenu children */}
                {hasChildren && (
                  <div className={cn(
                    'overflow-hidden transition-all duration-300',
                    isParentExpanded ? 'max-h-60 opacity-100' : 'max-h-0 opacity-0'
                  )}>
                    <ul className="mt-1 space-y-1">
                      {children.map(child => (
                        <li key={child.page_slug}>
                          <SubNavItem
                            icon={child.header_icon || 'circle'}
                            label={child.menu_label}
                            isActive={currentPage === child.page_slug}
                            onClick={() => onNavigate(child.page_slug)}
                            isOpen={isOpen}
                            color={child.page_slug === 'morning-class' ? 'primary' : 'action'}
                          />
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
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
            icon={userProfile && (userProfile.role as string) !== 'guest_virtual' ? 'LogOut' : 'LogIn'}
            label={userProfile && (userProfile.role as string) !== 'guest_virtual' ? 'Sign Out' : 'Log In'}
            onClick={userProfile && (userProfile.role as string) !== 'guest_virtual' ? onLogout! : () => onNavigate('auth')}
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
