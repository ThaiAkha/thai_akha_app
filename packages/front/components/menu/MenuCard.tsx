import React, { useState } from 'react';
import { cn } from '../../lib/utils';
import { Icon, Badge } from '../ui/index';

interface MenuCardProps {
  dish: any;
  isSelected: boolean;
  onClick: () => void;
  onAskCherry?: (dish: any) => void;
  onPreview?: (dish: any) => void;
  isDemo?: boolean;
  actionLabel?: string;
  disableBodyCursor?: boolean;
  dietLabel?: string;
}

const MenuCard: React.FC<MenuCardProps> = ({
  dish,
  isSelected,
  onClick,
  onAskCherry,
  onPreview,
  isDemo = false,
  actionLabel = "Select",
  disableBodyCursor = false,
  dietLabel
}) => {
  const [imgError, setImgError] = useState(false);

  const handleAskClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onAskCherry) onAskCherry(dish);
  };

  const handlePreviewClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onPreview) onPreview(dish);
  };

  return (
    <div
      onClick={onClick}
      className={cn(
        "group relative flex flex-col h-full rounded-[2rem] overflow-hidden isolate border-2 transition-all duration-500 ease-cinematic",
        isSelected
          ? "bg-action/10 border-action shadow-[0_20px_50px_-10px_rgba(152,201,60,0.3)] scale-[1.02] z-20"
          : cn(
              "bg-surface border-border",
              "hover:border-action hover:shadow-[0_10px_40px_-10px_rgba(152,201,60,0.25)]"
            ),
        disableBodyCursor ? "cursor-default" : "cursor-pointer"
      )}
    >
      {/* ================= 1. FOTO ================= */}
      {/* Mobile: Altezza ridotta (h-48). Desktop: Altezza standard (h-56) */}
      <div className="relative h-48 md:h-56 w-full overflow-hidden shrink-0 border-b border-border bg-black">
        
        {/* DIET BADGE: Sempre visibile */}
        {dietLabel && (
          <div className="absolute top-3 left-3 z-30 animate-in fade-in slide-in-from-top-2 duration-500">
            <Badge
              variant="mineral"
              className={cn(
                "backdrop-blur-md shadow-lg border-white/20 font-black tracking-widest text-[9px]",
                dietLabel === 'ORIGINAL' || dietLabel === 'REGULAR'
                  ? "bg-black/40 text-white"
                  : "bg-action/90 text-white border-action"
              )}
            >
              {dietLabel}
            </Badge>
          </div>
        )}

        {!imgError ? (
          <img
            src={dish.image}
            alt={dish.name}
            onError={() => setImgError(true)}
            className={cn(
              "w-full h-full object-cover transition-transform duration-[2s] ease-out",
              "group-hover:scale-105",
              isDemo ? "grayscale opacity-50" : "opacity-90 md:opacity-100" // Mobile leggermente più scuro per testo
            )}
          />
        ) : (
          <div className="w-full h-full bg-surface flex items-center justify-center">
            <Icon name="restaurant" size="xl" className="opacity-20 text-desc" />
          </div>
        )}

        {/* 📱 MOBILE TITLE OVERLAY (Solo Mobile) */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent md:hidden pointer-events-none" />
        
        <div className="absolute bottom-0 left-0 right-0 p-4 md:hidden z-20">
           <div className="flex items-center justify-between mb-1 opacity-80">
              <span className={cn("text-[9px] font-black uppercase tracking-widest text-white/70")}>
                {dish.category?.replace('_', ' ') || 'Classic'}
              </span>
           </div>
           <h3 className="font-display font-black uppercase text-xl leading-[0.9] tracking-tight text-white drop-shadow-md">
             {dish.name}
           </h3>
        </div>

        {/* Checkmark (Angolo Destro) */}
        {isSelected && !isDemo && (
          <div className="absolute top-3 right-3 z-30 size-8 md:size-9 rounded-full bg-action text-white flex items-center justify-center shadow-lg animate-in zoom-in spin-in-12 duration-300 border-2 border-white dark:border-[#121212]">
            <Icon name="check" size="sm" className="font-black" />
          </div>
        )}
      </div>

      {/* ================= 2. CONTENUTO ================= */}
      <div className="flex flex-col flex-grow p-4 md:p-6 relative bg-surface">
        
        {/* 💻 DESKTOP TITLE (Nascosto su Mobile) */}
        <div className="hidden md:block mb-3">
          <div className="flex items-center justify-between mb-2 opacity-60 text-[10px] font-black uppercase tracking-widest">
            <span className={cn("text-desc", isSelected && "text-action")}>
              {dish.category?.replace('_', ' ') || 'Classic'}
            </span>
          </div>
          <h3 className={cn(
            "font-display font-black uppercase text-2xl leading-[0.9] tracking-tight transition-colors duration-300",
            isSelected ? "text-action" : "text-title group-hover:text-action"
          )}>
            {dish.name}
          </h3>
        </div>

        {/* DESCRIZIONE (Compact su mobile) */}
        <p className="text-xs md:text-base font-medium text-desc/80 leading-relaxed line-clamp-2 md:line-clamp-3 mb-4 md:mb-6">
          {dish.description}
        </p>

        <div className="mt-auto grid grid-cols-2 gap-2 md:gap-3 pt-3 md:pt-4 border-t border-white/5">
          <button
            onClick={handlePreviewClick}
            disabled={isDemo}
            className="h-10 md:h-12 rounded-xl bg-action/10 border border-white/20 hover:bg-action hover:text-white text-action font-black uppercase text-[10px] md:text-xs tracking-widest flex items-center justify-center gap-2 transition-all shadow-sm hover:shadow-action/20 group/btn"
          >
            <Icon name="visibility" size="sm"/>
            Details
          </button>

          <button
            onClick={handleAskClick}
            disabled={isDemo}
            className="h-10 md:h-12 rounded-xl bg-primary/10 border border-white/20 hover:bg-primary hover:text-white text-primary font-black uppercase text-[10px] md:text-xs tracking-widest flex items-center justify-center gap-2 transition-all shadow-sm hover:shadow-primary/20 group/cherry"
          >
            <Icon name="chat" size="sm" />
            Ask Cherry
          </button>
        </div>
      </div>
    </div>
  );
};

export default MenuCard;