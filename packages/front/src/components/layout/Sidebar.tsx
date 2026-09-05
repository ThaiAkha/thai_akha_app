import React, { lazy, Suspense, useState, useRef } from 'react';
import { UserProfile } from '../../services/auth.service';
import { cn } from '@thaiakha/shared/lib/utils';
import { LogoIconLight, LogoIconDark } from '@thaiakha/shared';
// lazy: il pannello e' l'unico pezzo di sidebar che usa framer-motion. Statico,
// teneva 41 KB compressi di libreria nel chunk d'ingresso di ogni pagina per una
// cosa che a interruttore i18n spento non si vede mai.
const LanguageFlagPanel = lazy(() => import('./LanguageFlagPanel'));
import { useLanguage } from '../../context/LanguageContext';
import { ChevronLeft, ChevronDown, Menu } from 'lucide-react';
import { CLOSED_WIDTH, SIDEBAR_TRANSITION, EASE_CUBIC, NavItem, ActionButton, SubNavItem, Divider } from './sidebar/SidebarNavPrimitives';
import { Avatar, ThemeSwitcher, FooterGroup } from './sidebar/SidebarFooterPrimitives';
import { useSidebarNav } from './sidebar/useSidebarNav';

// Sidebar desktop (monta solo da lg in su, App.tsx). Struttura (#16 split monstre):
// primitive UI in ./sidebar/Sidebar{Nav,Footer}Primitives, menu+albero+reveal in ./sidebar/useSidebarNav,
// fetch del menu condiviso con SidebarMobile in ./sidebar/useSidebarMenuData. Qui solo la composizione.

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

const Sidebar: React.FC<SidebarProps> = ({
  currentPage, onNavigate, isOpen, onToggle, isDarkMode, userProfile, onToggleTheme, onLogout
}) => {
  const [footerExpanded, setFooterExpanded] = useState<'info' | 'settings' | null>(null);

  // Switcher lingua: il bottone "Languages" apre il pannello bandierine FUORI
  // dalla sidebar (portal), ancorato al bottone stesso. A flag i18n spento
  // availableLangs = ['en'] → né bottone né pannello (oggi: tutto com'era).
  const { availableLangs, lang } = useLanguage();
  const [langPanelOpen, setLangPanelOpen] = useState(false);
  const langBtnRef = useRef<HTMLDivElement>(null);

  const { footerItems, isLoaded, visibleIndices, expandedParent, setExpandedParent, childrenMap, topLevelItems } =
    useSidebarNav(currentPage, userProfile, lang);

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
              {/* Languages → pannello bandierine fuori dalla sidebar, ancorato
                  qui. Il div fa da ancora (ActionButton non espone ref).
                  A flag i18n spento la voce sparisce del tutto: prima era un
                  bottone con onClick vuoto, una voce che non faceva nulla. */}
              {availableLangs.length > 1 && (
                <div ref={langBtnRef}>
                  <ActionButton
                    icon="Globe"
                    label="Languages"
                    onClick={() => setLangPanelOpen((v) => !v)}
                    isOpen={isOpen}
                  />
                </div>
              )}
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

      {/* Pannello bandierine — portal su body, quindi il punto in cui sta nel
          JSX è irrilevante per il layout: conta solo l'ancora (langBtnRef). */}
      {availableLangs.length > 1 && (
        <Suspense fallback={null}>
          <LanguageFlagPanel
            open={langPanelOpen}
            onClose={() => setLangPanelOpen(false)}
            anchorRef={langBtnRef}
          />
        </Suspense>
      )}
    </nav>
  );
};

export default Sidebar;
