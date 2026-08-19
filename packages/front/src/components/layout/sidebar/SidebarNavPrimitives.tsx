/**
 * Sidebar (desktop) - primitive di NAVIGAZIONE: costanti di layout, riga nav, azione,
 * sotto-voce, divider. (Avatar/tema/gruppi footer: SidebarFooterPrimitives.tsx.) Estratte da Sidebar.tsx (#16 split
 * monstre) a comportamento invariato: stesso markup, stesse classi, stesse transizioni.
 */
import { getIcon } from '@thaiakha/shared/lib/icons';
import { cn } from '@thaiakha/shared/lib/utils';
import Typography from '../../ui/Typography';

// Step per DISPOSITIVO, non per larghezza finestra: pointer-coarse (touch: iPad landscape)
// = contenuta; mouse = piena a qualunque larghezza. Monta solo da lg in su (App.tsx).
export const CLOSED_WIDTH = 'w-[88px] pointer-coarse:w-[76px]';
export const ROW_H = 'h-12 pointer-coarse:h-11';
export const ROW_ICON = 'w-6 h-6 pointer-coarse:w-5 pointer-coarse:h-5';
export const SIDEBAR_TRANSITION = '800ms';
export const EASE_CUBIC = 'ease-[cubic-bezier(0.25,1,0.5,1)]';

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

export function NavItem({ icon, label, isActive, onClick, isOpen, badge, isVisible = true, index = 0, slug }: NavItemProps & { slug?: string }) {
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

export function ActionButton({ icon, label, onClick, isOpen, isVisible = true, index = 0, isMainFooterButton = false, slug }: ActionButtonProps & { slug?: string }) {
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

export const SUB_COLOR = {
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

export interface SubNavItemProps {
  icon: string;
  label: string;
  isActive: boolean;
  onClick: () => void;
  isOpen: boolean;
  color?: 'primary' | 'action';
}

export function SubNavItem({ icon, label, isActive, onClick, isOpen, color = 'action', slug }: SubNavItemProps & { slug?: string }) {
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

export function Divider({ className = 'my-1' }: { className?: string }) {
  return <div className={`h-px bg-border ${className}`} role="separator" />;
}
