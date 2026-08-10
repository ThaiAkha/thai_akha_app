import React, { useEffect, useState, useMemo } from 'react';
import { UserProfile } from '../../services/auth.service';
import { contentService } from '@thaiakha/shared/services';
import { getIcon } from '@thaiakha/shared/lib/icons';
import { cn } from '@thaiakha/shared/lib/utils';
import { LogoIconLight, LogoIconDark } from '@thaiakha/shared';
import { ChevronLeft, ChevronDown, Menu, Sun, Moon } from 'lucide-react';
import Typography from '../ui/Typography';

// Step per DISPOSITIVO, non per larghezza finestra: pointer-coarse (touch: iPad landscape)
// = contenuta; mouse = piena a qualunque larghezza. Monta solo da lg in su (App.tsx).
const CLOSED_WIDTH = 'w-[88px] pointer-coarse:w-[76px]';
const ROW_H = 'h-12 pointer-coarse:h-11';
const ROW_ICON = 'w-6 h-6 pointer-coarse:w-5 pointer-coarse:h-5';
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

function NavItem({ icon, label, isActive, onClick, isOpen, badge, isVisible = true, index = 0, slug }: NavItemProps & { slug?: string }) {
  const IconComponent = getIcon(icon);
  const href = slug ? (slug === 'home' ? '/' : `/${slug}`) : '#';
  return (
    <a
      href={href}
      onClick={(e) => {
        if (!slug) return;
        if (e.ctrlKey || e.metaKey || e.button !== 0) return;
        e.preventDefault();
        onClick();
      }}
      title={label}
      className={cn(
        ROW_H,
        'relative flex items-center w-full rounded-xl pl-0 pr-1 cursor-pointer outline-none',
        isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4 pointer-events-none',
        isActive
          ? 'bg-action-500/20'
          : 'hover:bg-action-500/10'
      )}
      style={{
        transition: `background-color 80ms ease, opacity 500ms ease ${isVisible ? index * 50 : 0}ms, transform 500ms ease ${isVisible ? index * 50 : 0}ms`,
      }}
    >
      <div className={`${CLOSED_WIDTH} shrink-0 flex items-center justify-start pl-[24px] pointer-coarse:pl-[20px] relative z-10`}>
        <IconComponent className={cn(
          ROW_ICON,
          'transition-transform duration-300 group-active:scale-95',
          isActive ? 'text-action-700' : 'text-muted'
        )} />
      </div>
      <div className={cn(
        'flex items-center flex-1 overflow-hidden whitespace-nowrap z-10',
        `transition-all duration-300 ${EASE_CUBIC} origin-left`,
        isOpen ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-5 pointer-events-none'
      )}>
        <Typography
          variant="body"
          color={isActive ? 'action' : 'sub'}
          className="font-display font-bold tracking-wide text-sm pointer-coarse:text-xs"
        >
          {label}
        </Typography>
        {badge && (
          <Typography
            variant="badge"
            color={isActive ? 'white' : 'muted'}
            className={cn(
              'px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider ml-3',
              isActive ? 'bg-action-700 shadow-sm' : 'bg-border'
            )}
          >
            {badge}
          </Typography>
        )}
      </div>
    </a>
  );
}

interface ActionButtonProps {
  icon: string;
  label: string;
  onClick: () => void;
  isOpen: boolean;
  isVisible?: boolean;
  index?: number;
  isMainFooterButton?: boolean;
}

function ActionButton({ icon, label, onClick, isOpen, isVisible = true, index = 0, isMainFooterButton = false, slug }: ActionButtonProps & { slug?: string }) {
  const IconComponent = getIcon(icon);

  // Rest = neutral surface; hover = lime (action) — coerente con NavItem e con la mobile.
  const bgClasses = "bg-surface-2 border border-border hover:bg-action-500/10 hover:border-action-500/25";
  const iconClass = "text-muted group-hover:text-action-600";

  const className = cn(
    ROW_H,
    "relative flex items-center w-full group cursor-pointer rounded-xl outline-none",
    "transition-[background-color,border-color,box-shadow,opacity,transform] duration-200",
    bgClasses,
    isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4 pointer-events-none'
  );
  const style = { transitionDelay: isVisible ? `${index * 50}ms` : '0ms' };

  const inner = (
    <>
      <div className={`${CLOSED_WIDTH} shrink-0 flex items-center justify-start pl-[24px] pointer-coarse:pl-[20px] z-10`}>
        <IconComponent className={cn(ROW_ICON, "transition-colors duration-75", iconClass)} />
      </div>
      <div className={cn(
        'flex items-center flex-1 overflow-hidden whitespace-nowrap z-10',
        `transition-all duration-300 ${EASE_CUBIC} origin-left`,
        isOpen ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-5 pointer-events-none'
      )}>
        <Typography
          variant="body"
          color="sub"
          className={cn(
            "font-display font-bold tracking-wide group-hover:text-action-700",
            isMainFooterButton ? "text-[15px] pointer-coarse:text-sm" : "text-sm pointer-coarse:text-xs"
          )}
        >
          {label}
        </Typography>
      </div>
    </>
  );

  // Voci di navigazione (slug presente) → <a href> per cmd/ctrl-click + long-press mobile.
  if (slug) {
    const href = slug === 'home' ? '/' : `/${slug}`;
    return (
      <a
        href={href}
        onClick={(e) => {
          if (e.ctrlKey || e.metaKey || e.button !== 0) return; // nuova scheda nativa
          e.preventDefault();
          onClick();
        }}
        title={label}
        className={className}
        style={style}
      >
        {inner}
      </a>
    );
  }

  return (
    <button onClick={onClick} title={label} className={className} style={style}>
      {inner}
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

function SubNavItem({ icon, label, isActive, onClick, isOpen, color = 'action', slug }: SubNavItemProps & { slug?: string }) {
  const IconComponent = getIcon(icon);
  const c = SUB_COLOR[color];
  const href = slug ? (slug === 'home' ? '/' : `/${slug}`) : '#';
  return (
    <a
      href={href}
      onClick={(e) => {
        if (!slug) return;
        if (e.ctrlKey || e.metaKey || e.button !== 0) return;
        e.preventDefault();
        onClick();
      }}
      title={label}
      className={cn(
        ROW_H,
        'relative flex items-center w-full transition-all duration-300 rounded-xl pl-0 pr-1 cursor-pointer outline-none',
        isActive ? c.bg : c.bgHover
      )}
    >
      {/* Indent: small vertical line indicator on the left */}
      <div className={`${CLOSED_WIDTH} shrink-0 flex items-center justify-start pl-[24px] pointer-coarse:pl-[20px]`}>
        <IconComponent className={cn(ROW_ICON, 'transition-colors duration-75', isActive ? c.icon : 'text-muted')} />
      </div>
      <div className={cn(
        'flex items-center flex-1 overflow-hidden whitespace-nowrap',
        `transition-all duration-300 ${EASE_CUBIC} origin-left`,
        isOpen ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-5 pointer-events-none'
      )}>
        <Typography
          variant="body"
          color={isActive ? color : 'sub'}
          className="font-display font-bold tracking-wide text-sm pointer-coarse:text-xs"
        >
          {label}
        </Typography>
      </div>
    </a>
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
      {src ? <img src={src} alt={name} className="w-full h-full object-cover" /> : <Typography variant="body" color="white" className="font-bold">{initials}</Typography>}
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

  const bgClasses = "bg-surface-2 border border-border hover:bg-action-500/10 hover:border-action-500/25";

  return (
    <button
      onClick={onToggle}
      title={isDarkMode ? 'Light' : 'Dark'}
      className={cn(
        ROW_H,
        "relative flex items-center w-full rounded-xl group cursor-pointer",
        "transition-[background-color,border-color,box-shadow,opacity,transform] duration-200",
        bgClasses,
        isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4 pointer-events-none'
      )}
      style={{ transitionDelay: isVisible ? `${index * 50}ms` : '0ms' }}
    >
      <div className={`${CLOSED_WIDTH} shrink-0 flex items-center justify-start pl-[24px] pointer-coarse:pl-[20px] z-10`}>
        <ThemeIcon className={cn(ROW_ICON, "text-muted group-hover:text-action-600 transition-colors duration-75")} />
      </div>
      <div className={cn(
        'flex items-center flex-1 overflow-hidden whitespace-nowrap z-10',
        `transition-all duration-300 ${EASE_CUBIC} origin-left`,
        isOpen ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-5 pointer-events-none'
      )}>
        <Typography
          variant="body"
          color="sub"
          className="font-display font-bold tracking-wide text-sm pointer-coarse:text-xs"
        >
          {isDarkMode ? 'Light' : 'Dark'}
        </Typography>
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

interface FooterGroupProps {
  icon: string;
  label: string;
  isOpen: boolean;
  isExpanded: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}

function FooterGroup({ icon, label, isOpen, isExpanded, onToggle, children }: FooterGroupProps) {
  const IconComponent = getIcon(icon);

  // Header button colors — rest neutro, hover/aperto lime (action)
  const headerBase = 'bg-surface-2 border border-border hover:bg-action-500/10 hover:border-action-500/25';
  const headerExpanded = 'bg-action-500/10 border border-action-500/20';

  // Expanded container bg
  const expandedBg = 'bg-surface-2 border border-border';

  return (
    <div className={cn(
      'rounded-xl overflow-hidden transition-all duration-300',
      isExpanded && isOpen ? expandedBg : ''
    )}>
      <button
        onClick={onToggle}
        title={label}
        className={cn(
          ROW_H,
          'relative flex items-center w-full rounded-xl transition-all duration-200 group cursor-pointer',
          !isExpanded ? headerBase : headerExpanded
        )}
      >
        <div className={`${CLOSED_WIDTH} shrink-0 flex items-center justify-start pl-[24px] pointer-coarse:pl-[20px] z-10`}>
          <IconComponent className={cn(ROW_ICON, "text-muted group-hover:text-action-600 transition-colors duration-75")} />
        </div>
        <div className={cn(
          'flex items-center flex-1 overflow-hidden whitespace-nowrap z-10',
          `transition-all duration-300 ${EASE_CUBIC} origin-left`,
          isOpen ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-5 pointer-events-none'
        )}>
          <Typography
            variant="body"
            color="sub"
            className="font-display font-bold text-[15px] pointer-coarse:text-sm uppercase tracking-[0.14em]"
          >
            {label}
          </Typography>
          <ChevronDown className={cn(
            'w-3 h-3 ml-auto mr-4 text-muted transition-transform duration-200',
            isExpanded ? 'rotate-180' : 'rotate-0'
          )} />
        </div>
      </button>
      <div className={cn(
        'overflow-hidden transition-all duration-300',
        isExpanded && isOpen ? 'max-h-80 opacity-100' : 'max-h-0 opacity-0'
      )}>
        <div className="py-1.5 space-y-1.5 px-1">
          {children}
        </div>
      </div>
    </div>
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
  const [footerItems, setFooterItems] = useState<MenuItem[]>([]);
  const [visibleIndices, setVisibleIndices] = useState<number[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [footerExpanded, setFooterExpanded] = useState<'info' | 'settings' | null>(null);

  useEffect(() => {
    let cancelled = false;
    let attempts = 0;
    const MAX_ATTEMPTS = 3;

    const loadMenu = async () => {
      if (cancelled) return;
      try {
        const [items, footer] = await Promise.all([
          contentService.getMenuItems(),
          contentService.getFooterItems(),
        ]);
        if (cancelled) return;

        // Never blank a good menu with an empty result: an empty fetch here is
        // almost always a transient race (Sidebar mounts before the Supabase
        // session is restored → RLS yields 0 rows). Keep prior items and retry
        // with backoff so the menu fills in WITHOUT needing a manual refresh.
        if (items && items.length > 0) {
          setMenuItems(items as MenuItem[]);
          setIsLoaded(true);
        } else if (attempts < MAX_ATTEMPTS) {
          attempts += 1;
          setTimeout(loadMenu, 400 * attempts);
          return;
        }
        if (footer && footer.length > 0) setFooterItems(footer as MenuItem[]);
      } catch (error) {
        console.error("Menu error", error);
        if (!cancelled && attempts < MAX_ATTEMPTS) {
          attempts += 1;
          setTimeout(loadMenu, 400 * attempts);
        }
      }
    };

    loadMenu();
    return () => { cancelled = true; };
  }, [userProfile?.role]);


  const [expandedParent, setExpandedParent] = useState<string | null>(null);



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

  // Cascading reveal — staggered over the ACTUAL rendered list (topLevelItems),
  // so the reveal index lines up 1:1 with the map index in the render. Previously
  // the timers were keyed to `menuItems` indices (incl. filtered/child items),
  // which scheduled stray timers and required an O(n) indexOf lookup per row.
  useEffect(() => {
    if (!isLoaded || topLevelItems.length === 0) return;
    setVisibleIndices([]);
    const timers = topLevelItems.map((_, i) =>
      setTimeout(() => {
        setVisibleIndices(prev => [...prev, i]);
      }, 100 + i * 40)
    );
    return () => timers.forEach(clearTimeout);
  }, [isLoaded, topLevelItems]);

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
        isOpen ? 'w-80 pointer-coarse:w-72' : CLOSED_WIDTH
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
            <div className={`${CLOSED_WIDTH} shrink-0 flex items-center justify-start pl-[24px] pointer-coarse:pl-[20px] z-10`}>
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
          <div className={`${CLOSED_WIDTH} shrink-0 flex items-center justify-start pl-[24px] pointer-coarse:pl-[20px] -ml-2`}>
            <img src={isDarkMode ? LogoIconDark : LogoIconLight} alt="Logo" className="size-10 object-contain" />
          </div>
          <div className={`overflow-hidden whitespace-nowrap transition-all duration-500 ${isOpen ? 'opacity-100 w-auto' : 'opacity-0 w-0'}`}>
            <span className="ml-2 font-display font-black text-2xl tracking-tighter text-title">
              Thai <span className="text-primary-500">Akha</span>
            </span>
          </div>
        </div>

        <Divider className="my-0 mb-4" />


        {/* USER AVATAR — blurs when footer group is open */}
        {userProfile && (userProfile.role as string) !== 'guest_virtual' && (
          <div
            className={cn(
              'transition-all duration-500',
              footerExpanded !== null
                ? 'blur-sm opacity-40 cursor-pointer [&_button]:pointer-events-none select-none'
                : ''
            )}
            onClick={footerExpanded !== null ? () => setFooterExpanded(null) : undefined}
          >
            <div className="mt-2 mb-2">
              <button
                onClick={() => onNavigate('user')}
                className="relative flex items-center w-full h-14 rounded-xl transition-all group cursor-pointer"
                title="User Profile"
              >
                <div className="absolute inset-1 rounded-xl transition-colors duration-300" />
                <div className={`${CLOSED_WIDTH} shrink-0 flex items-center justify-start pl-[24px] pointer-coarse:pl-[20px] -ml-2 z-10`}>
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
          </div>
        )}

        {/* MENU — blurs + click-to-dismiss when footer group is open */}
        <ul
          className={cn(
            'flex-1 min-h-0 overflow-y-auto overflow-x-hidden custom-scrollbar space-y-2',
            'transition-all duration-500',
            footerExpanded !== null
              ? 'blur-sm opacity-40 cursor-pointer [&_a]:pointer-events-none [&_button]:pointer-events-none select-none'
              : ''
          )}
          onClick={footerExpanded !== null ? () => setFooterExpanded(null) : undefined}
        >
          {topLevelItems.map((item, index) => {
            const isVisible = visibleIndices.includes(index);
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
                    slug={item.page_slug}
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
                            slug={child.page_slug}
                            onClick={() => onNavigate(child.page_slug)}
                            isOpen={isOpen}
                            color={(child.page_slug === 'morning-class' || child.page_slug === 'morning-cooking-class-market-tour') ? 'primary' : 'action'}
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
        <div className="mt-auto pb-[20px]">

          <Divider className="-mt-2 mb-[20px]" />

          <div className="flex flex-col gap-3">
            {/* INFORMATION GROUP */}
            {footerItems.length > 0 && (
              <FooterGroup
                icon="Info"
                label="Information"
                isOpen={isOpen}
                isExpanded={footerExpanded === 'info'}
                onToggle={() => {
                  if (!isOpen) onToggle();
                  setFooterExpanded(prev => prev === 'info' ? null : 'info');
                }}
              >
                {footerItems.map(item => (
                  <ActionButton
                    key={item.page_slug}
                    icon={item.header_icon || 'Circle'}
                    label={item.menu_label}
                    slug={item.page_slug}
                    onClick={() => { setFooterExpanded(null); onNavigate(item.page_slug); }}
                    isOpen={isOpen}
                  />
                ))}
              </FooterGroup>
            )}

            {/* SETTINGS GROUP */}
            <FooterGroup
              icon="Settings"
              label="Settings"
              isOpen={isOpen}
              isExpanded={footerExpanded === 'settings'}
              onToggle={() => {
                if (!isOpen) onToggle();
                setFooterExpanded(prev => prev === 'settings' ? null : 'settings');
              }}
            >
              <ActionButton
                icon="Globe"
                label="Languages"
                onClick={() => { setFooterExpanded(null); }}
                isOpen={isOpen}
              />
              <ThemeSwitcher
                isDarkMode={isDarkMode}
                onToggle={() => { setFooterExpanded(null); onToggleTheme?.(); }}
                isOpen={isOpen}
                isVisible={isLoaded}
              />
            </FooterGroup>

            {/* LOGIN / LOGOUT (OUTSIDE SETTINGS) */}
            <ActionButton
              icon={userProfile && (userProfile.role as string) !== 'guest_virtual' ? 'LogOut' : 'LogIn'}
              label={userProfile && (userProfile.role as string) !== 'guest_virtual' ? 'Sign Out' : 'Log In'}
              onClick={userProfile && (userProfile.role as string) !== 'guest_virtual'
                ? () => { setFooterExpanded(null); onLogout!(); }
                : () => { setFooterExpanded(null); onNavigate('auth'); }
              }
              isOpen={isOpen}
              isMainFooterButton={true}
            />
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Sidebar;
