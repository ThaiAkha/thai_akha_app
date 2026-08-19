import React, { useState, useEffect, useRef } from 'react';
import { Icon, Typography } from '../ui/index';
import { Input } from '../ui/form';
import { cn } from '@thaiakha/shared/lib/utils';
import type { UserProfile } from '@thaiakha/shared/types';

export type MegaMenuVariant = 'diet' | 'grid' | 'search' | 'info';

export interface MenuItem {
  id: string;
  label: string;
  icon?: string;
  image?: string;
  badge?: string | number;
  description?: string;
  isActive?: boolean;
  onClick?: () => void;
}

interface MegaMenuProps {
  variant?: MegaMenuVariant;
  title: string;
  subtitle?: string;
  icon?: string;
  className?: string;
  items?: MenuItem[];
  activeLabel?: string;
  activeCount?: number;
  customContent?: React.ReactNode;
  searchQuery?: string;
  onSearchChange?: (val: string) => void;
  searchPlaceholder?: string;
  forceOpen?: boolean;
  onClose?: () => void;
  onRegisterClose?: (closeFn: () => void) => void;
  onRegisterOpen?: (openFn: () => void) => void;
  highlight?: boolean;
  onDietClick?: (isNewOpening: boolean) => void;
  onNavigate?: (slug: string) => void;
  userProfile?: UserProfile | null;
  disableOutsideClick?: boolean;
}

const MegaMenu: React.FC<MegaMenuProps> = ({
  variant = 'grid',
  title,
  subtitle: _subtitle,
  icon = 'tune',
  items = [],
  activeLabel,
  activeCount,
  customContent,
  searchQuery,
  onSearchChange,
  searchPlaceholder,
  className,
  onClose,
  onRegisterClose,
  onRegisterOpen,
  highlight = false,
  onDietClick,
  disableOutsideClick = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const hasInteracted = useRef(false);

  const handleClose = () => {
    if (onClose) onClose();
    setIsOpen(false);
  };

  // Register close/open fns with parent
  useEffect(() => {
    onRegisterClose?.(handleClose);
  // eslint-disable-next-line react-hooks/exhaustive-deps -- handleClose e' ricreata a ogni render: si registra solo al cambio callback
  }, [onRegisterClose]);

  useEffect(() => {
    onRegisterOpen?.(() => { handleOpen(); });
  // eslint-disable-next-line react-hooks/exhaustive-deps -- handleOpen e' ricreata a ogni render: si registra solo al cambio callback
  }, [onRegisterOpen]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (disableOutsideClick) return;
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        handleClose();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  // eslint-disable-next-line react-hooks/exhaustive-deps -- handleClose ricreata a ogni render: listener rimontato solo su open/flag
  }, [isOpen, disableOutsideClick]);

  // Prevent background scrolling when open — use rAF so any pending scrollIntoView fires first
  useEffect(() => {
    if (isOpen) {
      requestAnimationFrame(() => {
        document.body.style.overflow = 'hidden';
      });
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const handleToggle = () => {
    if (isOpen) {
      handleClose();
    } else {
      menuRef.current?.scrollIntoView({ behavior: 'instant' as ScrollBehavior, block: 'nearest' });
      setIsOpen(true);
      hasInteracted.current = true;
    }
  };

  const handleOpen = () => {
    if (!isOpen) {
      // Scroll the pill into view synchronously BEFORE locking body scroll
      menuRef.current?.scrollIntoView({ behavior: 'instant' as ScrollBehavior, block: 'nearest' });
      setIsOpen(true);
      hasInteracted.current = true;
      return true;
    }
    return false;
  };

  const handleItemClick = (item: MenuItem) => {
    item.onClick?.();
    if (variant !== 'diet') handleClose();
  };

  const renderContent = () => {
    switch (variant) {
      case 'diet':
        return (
          <div className="flex flex-col h-full bg-surface">
            <div className="flex-1 overflow-y-auto overscroll-contain custom-scrollbar p-6 md:p-8 flex flex-col [gap:var(--space-fluid-m)]">
              {customContent}
            </div>
          </div>
        );

      case 'search':
        return (
          <div className="flex flex-col h-full [padding:var(--space-fluid-m)] bg-surface">
            <div className="relative [margin-bottom:var(--space-fluid-s)] shrink-0">
              <Input
                value={searchQuery}
                onChange={(e) => onSearchChange?.(e.target.value)}
                placeholder={searchPlaceholder || "Type to search..."}
                className="pl-12 bg-background border-border h-14 text-lg font-bold text-title placeholder:text-muted/40"
              />
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-muted/40">
                <Icon name="search" size="md" />
              </div>
            </div>
            <div className="flex-1 overflow-y-auto custom-scrollbar flex flex-col [gap:var(--space-fluid-2xs)] pr-2">
              {items?.map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleItemClick(item)}
                  className="w-full flex items-center [gap:var(--space-fluid-s)] [padding:var(--space-fluid-s)] rounded-2xl hover:bg-black/5 dark:hover:bg-white/5 text-left transition-all border border-transparent hover:border-border group shrink-0"
                >
                  <div className="size-12 rounded-xl bg-black/5 dark:bg-white/5 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform shadow-inner text-title">
                    {item.image ? <img src={item.image} className="w-full h-full object-cover rounded-xl" /> : <Icon name={item.icon || 'circle'} />}
                  </div>
                  <div>
                    <Typography variant="paragraphM" color="title" className="font-bold group-hover:text-action transition-colors">{item.label}</Typography>
                    {item.description && <Typography variant="caption" color="sub" className="block">{item.description}</Typography>}
                  </div>
                  {item.isActive && <Icon name="check" className="ml-auto text-action" />}
                </button>
              ))}
            </div>
          </div>
        );

      case 'grid':
      default:
        return (
          <div className="[padding:var(--space-fluid-m)] overflow-y-auto custom-scrollbar bg-surface">
            <div className="grid grid-cols-2 md:grid-cols-3 [gap:var(--space-fluid-s)]">
              {items?.map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleItemClick(item)}
                  className={cn(
                    "flex flex-col items-center justify-center [padding:var(--space-fluid-m)] [gap:var(--space-fluid-s)] rounded-[2rem] border transition-all duration-300 group min-h-[140px]",
                    item.isActive
                      ? "bg-surface text-title border-action shadow-xl scale-[1.02]"
                      : "bg-black/5 dark:bg-white/5 border-transparent hover:border-border text-sub hover:text-title"
                  )}
                >
                  <div className={cn(
                    "size-12 rounded-full flex items-center justify-center transition-all shadow-sm",
                    item.isActive ? "bg-action text-white" : "bg-surface group-hover:scale-110 border border-border"
                  )}>
                    <Icon name={item.icon || 'star'} size="md" />
                  </div>
                  <div className="text-center leading-tight">
                    <Typography variant="badge" color="inherit" className="block">{item.label}</Typography>
                    {item.badge && <Typography variant="badge" className="mt-1 block opacity-60">{item.badge}</Typography>}
                  </div>
                </button>
              ))}
            </div>
          </div>
        );
    }
  };

  return (
    <div ref={menuRef} className={cn("sticky top-[20px] z-[9995] w-full flex flex-col items-center transition-all pb-4 pt-0", className)}>
      <div className="w-full relative z-[9995]">

        {/* SUPER PILL TRIGGER - NO BORDER (as per InfoClasses wrapper) */}
        <div
          className={cn(
            "w-full max-w-2xl mx-auto flex items-center justify-between p-2 md:p-2.5 [margin-bottom:var(--space-fluid-s)] rounded-full transition-all duration-500 backdrop-blur-xl md:scale-110 origin-top shrink-0 relative group",
            isOpen
              ? "bg-surface dark:bg-surface border border-border/50 shadow-2xl"
              : highlight
                ? "bg-action/5 border border-action/30"
                : "bg-white/5 dark:bg-gray-950/90 border-transparent shadow-lg"
          )}
          onClick={handleToggle}
        >
          {/* Pulsing glow ring — only shadow animates, content stays fully visible */}
          {(!isOpen && highlight) && (
            <div
              className="absolute inset-0 rounded-full pointer-events-none"
              style={{ animation: 'megamenu-glow 2.5s ease-in-out infinite' }}
            />
          )}

          {/* Internal Container - MATCHES TABS CONTAINER CLASS (with border) */}
          <div className="relative z-10 flex items-center gap-2 w-full p-2 bg-black/[0.03] dark:bg-white/[0.03] border border-black/10 dark:border-white/10 rounded-full h-[52px] md:h-[64px] overflow-hidden">

            {/* 1. Diet Selection Pill (w-1/2) - Style: Active Pill if Open */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                const isNew = handleOpen();
                onDietClick?.(isNew);
              }}
              className={cn(
                "group w-1/2 h-full flex items-center justify-center gap-2.5 md:gap-3 px-2 md:px-4 rounded-full transition-all border overflow-hidden select-none",
                isOpen
                  ? "bg-primary/5 text-title border-primary/30 hover:bg-primary/10"
                  : "bg-white/30 dark:bg-white/5 text-title border-action/30 hover:bg-action/5 hover:border-action/60 hover:text-primary"
              )}
            >
              <span className="hidden md:flex items-center justify-center shrink-0 text-primary transition-transform duration-300 md:group-hover:scale-110">
                {icon && isNaN(parseInt(icon)) ? <Icon name={icon} size="sm" /> : icon}
              </span>
              <Typography variant="badge" color="inherit" className="truncate max-w-full leading-none pt-0.5">
                {activeLabel || title}
              </Typography>
            </button>

            {/* 3. Allergies Pill (w-1/2) - Style: Allergy Badge Equivalent */}
            {(!activeCount || activeCount === 0) ? (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  const isNew = handleOpen();
                  onDietClick?.(isNew);
                }}
                className="flex w-1/2 h-full items-center justify-center gap-2.5 md:gap-3 px-2 md:px-4 bg-allergy/5 text-allergy border border-allergy/20 rounded-full opacity-60 hover:opacity-100 hover:bg-allergy/10 transition-colors"
              >
                <Icon name="warning" size="md" className="hidden md:block shrink-0" />
                <Typography variant="badge" color="inherit" className="truncate">0 ALLERGIES</Typography>
              </button>
            ) : (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  const isNew = handleOpen();
                  onDietClick?.(isNew);
                }}
                className={cn(
                  "w-1/2 h-full flex items-center justify-center gap-2.5 md:gap-3 px-2 md:px-4 rounded-full transition-all border overflow-hidden",
                  "bg-allergy/5 text-allergy border-allergy/30 hover:bg-allergy/10"
                )}
              >
                <Icon name="warning" size="xs" className="hidden md:block text-allergy shrink-0" />
                <Typography variant="badge" color="inherit" className="truncate">
                  {activeCount} ALLERGIES
                </Typography>
              </button>
            )}
          </div>
        </div>

        {isOpen && (
          <div className="fixed md:absolute inset-x-0 md:inset-x-auto md:left-0 md:right-0 top-[76px] md:top-full md:mt-2 z-[9999] md:z-40 px-3 md:px-0 animate-in fade-in slide-in-from-top-4 duration-500 origin-top">
            <div className={cn(
              "max-w-4xl mx-auto bg-surface/90 backdrop-blur-3xl border border-border rounded-3xl shadow-sm overflow-hidden",
              "h-[calc(100dvh-92px)] md:max-h-[calc(100dvh-160px)] flex flex-col"
            )}>
              {renderContent()}
            </div>
          </div>
        )}
      </div>

      {isOpen && (
        <div className="fixed inset-0 z-[9990] bg-black/40 backdrop-blur-[4px]" onClick={handleClose} aria-hidden="true" />
      )}
    </div>
  );
};

export default MegaMenu;