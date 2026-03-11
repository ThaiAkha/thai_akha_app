import React, { useState, useEffect, useRef } from 'react';
import { Icon, Badge, Button, Input } from '../ui/index';
import { cn } from '../../lib/utils';

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
  highlight?: boolean; 
}

const MegaMenu: React.FC<MegaMenuProps> = ({
  variant = 'grid',
  title,
  subtitle,
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
  highlight = false 
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        handleClose();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const handleToggle = () => {
    if (isOpen) handleClose();
    else setIsOpen(true);
  };

  const handleClose = () => {
    if (onClose) onClose();
    setIsOpen(false);
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
            <div className="flex-1 overflow-y-auto custom-scrollbar p-8 space-y-8">
              {customContent}
            </div>
            <div className="p-6 pt-4 border-t border-border bg-surface/90 backdrop-blur-xl sticky bottom-0 z-50">
              <Button variant="action" fullWidth size="xl" onClick={handleClose} className="rounded-2xl h-16 text-lg font-black tracking-widest shadow-action-glow text-white">
                Confirm & Explore
              </Button>
            </div>
          </div>
        );

      case 'search':
        return (
          <div className="flex flex-col h-full p-8 bg-surface">
            <div className="relative mb-6 shrink-0">
              <Input 
                value={searchQuery}
                onChange={(e) => onSearchChange?.(e.target.value)}
                placeholder={searchPlaceholder || "Type to search..."}
                className="pl-12 bg-background border-border h-14 text-lg font-bold text-title placeholder:text-desc/40"
              />
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-desc/40">
                <Icon name="search" size="md"/>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto custom-scrollbar space-y-2 pr-2">
              {items?.map((item) => (
                <button 
                  key={item.id} 
                  onClick={() => handleItemClick(item)}
                  className="w-full flex items-center gap-4 p-4 rounded-2xl hover:bg-black/5 dark:hover:bg-white/5 text-left transition-all border border-transparent hover:border-border group shrink-0"
                >
                  <div className="size-12 rounded-xl bg-black/5 dark:bg-white/5 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform shadow-inner text-desc dark:text-white">
                    {item.image ? <img src={item.image} className="w-full h-full object-cover rounded-xl"/> : <Icon name={item.icon || 'circle'} />}
                  </div>
                  <div>
                    <div className="font-bold text-title text-base group-hover:text-action transition-colors">{item.label}</div>
                    {item.description && <div className="text-xs text-desc/60">{item.description}</div>}
                  </div>
                  {item.isActive && <Icon name="check" className="ml-auto text-action"/>}
                </button>
              ))}
            </div>
          </div>
        );

      case 'grid':
      default:
        return (
          <div className="p-8 overflow-y-auto custom-scrollbar bg-surface">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {items?.map((item) => (
                <button 
                  key={item.id} 
                  onClick={() => handleItemClick(item)}
                  className={cn(
                    "flex flex-col items-center justify-center p-6 gap-3 rounded-[2rem] border transition-all duration-300 group min-h-[140px]",
                    item.isActive 
                      ? "bg-surface text-title border-action shadow-xl scale-[1.02]" 
                      : "bg-black/5 dark:bg-white/5 border-transparent hover:border-border text-desc dark:text-white/60 hover:text-title dark:hover:text-white"
                  )}
                >
                  <div className={cn(
                    "size-12 rounded-full flex items-center justify-center transition-all shadow-sm",
                    item.isActive ? "bg-action text-white" : "bg-surface group-hover:scale-110 border border-border"
                  )}>
                    <Icon name={item.icon || 'star'} size="md"/>
                  </div>
                  <div className="text-center leading-tight">
                    <span className="block text-xs font-black uppercase tracking-wide">{item.label}</span>
                    {item.badge && <span className="text-[10px] opacity-60 font-mono mt-1 block">{item.badge}</span>}
                  </div>
                </button>
              ))}
            </div>
          </div>
        );
    }
  };

  return (
    <div ref={menuRef} className={cn("sticky top-1 z-50 w-full flex flex-col items-center transition-all px-4 pb-4 pt-0", className)}>
      <div className="w-full max-w-2xl relative z-50">
        <button
          onClick={handleToggle}
          className={cn(
            "w-full flex items-center justify-between p-4 rounded-2xl border-2 transition-all duration-500 ease-cinematic shadow-2xl relative overflow-hidden group backdrop-blur-xl",
            isOpen
              ? "bg-surface border-action text-title ring-1 ring-action/50" 
              : highlight 
                ? "bg-surface border-action text-title shadow-[0_0_25px_-5px_rgba(251,46,88,0.2)]" 
                : "bg-surface border-action text-title hover:border-action/50" 
          )}
        >
          <div className="flex items-center gap-4 relative z-10">
            <div className={cn(
              "size-12 rounded-xl flex items-center justify-center text-2xl transition-colors duration-300 shadow-inner",
              isOpen 
                ? "bg-action text-white" 
                : "bg-black/5 dark:bg-white/10 text-desc dark:text-white border border-border" 
            )}>
              <Icon name={icon} size="md"/>
            </div>

            <div className="text-left">
              <span className={cn(
                "text-[10px] font-black uppercase tracking-widest block mb-0.5",
                highlight || isOpen ? "text-primary" : "text-desc/60 dark:text-white/50"
              )}>
                {subtitle || 'Personalize'}
              </span>
              
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-display font-black text-xl leading-none truncate max-w-[200px] md:max-w-xs text-title">
                  {activeLabel || title}
                </span>
                
                {activeCount && activeCount > 0 ? (
                  <Badge variant="mineral" className="bg-action/10 text-action border-action/20 px-2 h-6 text-xs animate-pulse">
                    +{activeCount}
                  </Badge>
                ) : null}
              </div>
            </div>
          </div>

          <div className={cn(
            "size-10 rounded-full border border-border flex items-center justify-center transition-all duration-500 relative z-10",
            isOpen ? "bg-black/5 dark:bg-white/10 rotate-180 text-title" : "bg-transparent text-desc hover:bg-black/5"
          )}>
            <Icon name="expand_more" size="md"/>
          </div>
        </button>

        {isOpen && (
          <div className="absolute top-full left-0 right-0 mt-2 z-40 animate-in fade-in slide-in-from-top-4 duration-500 origin-top">
            <div className={cn(
              "bg-surface/95 backdrop-blur-3xl border-2 border-border rounded-2xl shadow-[0_50px_100px_-20px_rgba(0,0,0,0.4)] overflow-hidden",
              "max-h-[calc(100dvh-160px)] flex flex-col"
            )}>
              {renderContent()}
            </div>
          </div>
        )}
      </div>

      {isOpen && (
        <div className="fixed inset-0 z-30 bg-black/40 backdrop-blur-[4px]" onClick={handleClose} aria-hidden="true" />
      )}
    </div>
  );
};

export default MegaMenu;