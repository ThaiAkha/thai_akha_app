import React, { useState } from 'react';
import { cn } from '@thaiakha/shared/lib/utils';
import { Icon, Badge, Typography, RippleLink } from '../ui/index';

/** Minimal shape MenuCard reads: RecipeData, raw recipe rows and DB previews all satisfy it. */
export interface MenuCardDish {
  name: string;
  description?: string | null;
  excerpt?: string | null;
  image?: string | null;
}

interface MenuCardProps {
  dish: MenuCardDish;
  isSelected: boolean;
  onClick: () => void;
  onPreview?: (dish: MenuCardDish) => void;
  isDemo?: boolean;
  disableBodyCursor?: boolean;
  dietLabel?: string;
  actionLabel?: string;
  onAskCherry?: (dish: MenuCardDish) => void;
  /** Enables Cmd/Ctrl+click → open in new tab */
  href?: string;
}

const MenuCard: React.FC<MenuCardProps> = ({
  dish,
  isSelected,
  onClick,
  onPreview,
  isDemo = false,
  disableBodyCursor = false,
  dietLabel,
  href,
}) => {
  const [imgError, setImgError] = useState(false);

  const handlePreviewClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onPreview) onPreview(dish);
  };

  return (
    <div
      className={cn(
        "group relative flex flex-col h-full rounded-[2rem] overflow-hidden isolate border-2 transition-all duration-500 ease-cinematic",
        isSelected
          ? "bg-action/10 border-action shadow-[0_20px_50px_-10px_rgba(152,201,60,0.3)] scale-[1.02] z-20"
          : cn(
              "bg-surface border-border",
              "hover:border-action hover:shadow-[0_10px_40px_-10px_rgba(152,201,60,0.25)]"
            ),
        !href && (disableBodyCursor ? "cursor-default" : "cursor-pointer")
      )}
      onClick={!href ? onClick : undefined}
    >
      {/* Stretch link — covers full card for Cmd/Ctrl+click → new tab support */}
      {href && (
        <RippleLink
          href={href}
          onNavigate={onClick}
          className="absolute inset-0 z-10 rounded-[2rem]"
          aria-label={dish.name}
        >{/* stretch link — no content needed */}</RippleLink>
      )}
      {/* IMAGE */}
      <div className="relative h-48 md:h-56 w-full overflow-hidden shrink-0 border-b border-border bg-black">

        {/* Diet Badge */}
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

        {!imgError && dish.image ? (
          <img
            src={dish.image}
            alt={dish.name}
            onError={() => setImgError(true)}
            className={cn(
              "w-full h-full object-cover transition-transform duration-[2s] ease-out",
              "group-hover:scale-105",
              isDemo ? "grayscale opacity-50" : "opacity-90 md:opacity-100"
            )}
          />
        ) : (
          <div className="w-full h-full bg-surface flex items-center justify-center">
            <Icon name="restaurant" size="xl" className="opacity-20 text-muted" />
          </div>
        )}

        {/* Mobile title overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent md:hidden pointer-events-none" />
        <div className="absolute bottom-0 left-0 right-0 [padding:var(--space-fluid-s)] md:hidden z-20">
          {/* as="p": mobile overlay is purely visual — semantic H3 lives in the desktop block below (fixes D04 duplicate H3). */}
          <Typography variant="h3" as="p" className="font-display font-black uppercase leading-[0.9] tracking-tight text-white drop-shadow-md">
            {dish.name}
          </Typography>
        </div>

        {/* Checkmark selected */}
        {isSelected && !isDemo && (
          <div className="absolute top-3 right-3 z-30 size-8 md:size-9 rounded-full bg-action text-white flex items-center justify-center shadow-lg animate-in zoom-in spin-in-12 duration-300 border-2 border-white dark:border-surface">
            <Icon name="check" size="sm" className="font-black" />
          </div>
        )}
      </div>

      {/* CONTENT */}
      <div className="flex flex-col flex-grow [padding:var(--space-fluid-m)] relative bg-surface">

        {/* Desktop title */}
        <div className="hidden md:block [margin-bottom:var(--space-fluid-xs)]">
          <Typography variant="h3" className={cn(
            "font-display font-black uppercase leading-[0.9] tracking-tight transition-colors duration-300",
            isSelected ? "text-action" : "text-title group-hover:text-action"
          )}>
            {dish.name}
          </Typography>
        </div>

        {/* Description */}
        <Typography variant="paragraphS" className="text-desc/80 leading-relaxed line-clamp-2 md:line-clamp-3 [margin-bottom:var(--space-fluid-m)]">
          {dish.excerpt || dish.description}
        </Typography>

        {/* Action: solo "Details" — relative z-20 sits above the stretch link */}
        <div className="relative z-20 mt-auto [padding-top:var(--space-fluid-xs)] border-t border-border">
          <button
            onClick={handlePreviewClick}
            disabled={isDemo}
            className="w-full h-10 md:h-12 rounded-xl bg-action/10 border border-border hover:bg-action hover:text-white text-action font-black uppercase text-[10px] md:text-xs tracking-widest flex items-center justify-center [gap:var(--space-fluid-2xs)] transition-all shadow-sm hover:shadow-action/20"
          >
            <Icon name="visibility" size="sm" />
            Details
          </button>
        </div>
      </div>
    </div>
  );
};

export default MenuCard;