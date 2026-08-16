import React from 'react';
import { Typography, Icon } from '../ui/index';
import { cn } from '@thaiakha/shared/lib/utils';
import type { IngredientDetail } from '../../hooks/useRecipePageData';

// ─── Component ────────────────────────────────────────────────────────────────

interface IngredientsGridProps {
  ingredients: IngredientDetail[];
  onIngredientClick: (index: number) => void;
  multiplier?: 1 | 2 | 4;
}

const IngredientsGrid: React.FC<IngredientsGridProps> = ({
  ingredients,
  onIngredientClick,
  multiplier = 1,
}) => {
  // Sort: 'main' always first, then preserve display order (which comes sorted from the hook)
  const topLevel = ingredients
    .filter(ing => ing.ui_role !== 'base')
    .sort((a, b) => {
      if (a.ui_role === 'main' && b.ui_role !== 'main') return -1;
      if (b.ui_role === 'main' && a.ui_role !== 'main') return 1;
      return 0;
    });
  const baseLevel = ingredients.filter(ing => ing.ui_role === 'base');

  const renderCard = (ing: IngredientDetail, index: number, isBase = false) => {
    const isMain = ing.ui_role === 'main';
    
    // Create base array so that the index points to the original ingredient list in the parent
    const realIndex = ingredients.findIndex(i => i.id === ing.id);

    return (
      <button
        key={ing.id}
        onClick={() => onIngredientClick(realIndex)}
        className={cn(
          'group relative w-full overflow-hidden cursor-pointer outline-none',
          'focus:ring-2 focus:ring-action focus:ring-offset-2',
          'transition-all duration-500 ease-cinematic',
          'hover:-translate-y-1 hover:shadow-[0_20px_60px_-10px_rgba(0,0,0,0.5)]',
          'active:scale-[0.98] active:duration-150',
          isBase ? 'rounded-xl aspect-square' : 'rounded-2xl',
          // Main: card larga con aspect-ratio FISSO a tutti i breakpoint. Niente
          // row-span/h-full: dipendevano dall'avere 2 righe di card regolari a
          // fianco e collassavano (main "compresso") quando non c'erano.
          !isBase && (isMain ? 'col-span-2 aspect-[4/3] md:aspect-[16/10]' : 'col-span-1 aspect-square')
        )}
        aria-label={ing.name_en}
      >
        {/* ── Foto full-card ─────────────────────────────────────────────── */}
        {ing.image_url && !ing.substituted ? (
          <img
            src={ing.image_url}
            alt={ing.name_en}
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
            loading="lazy"
          />
        ) : (
          <div className="absolute inset-0 bg-surface-2 flex items-center justify-center">
            <Icon name="eco" size="lg" className="text-muted opacity-30" />
          </div>
        )}

        {/* ── Gradient overlay sfumato nero ─────────────────────────────── */}
        <div
          className="absolute inset-0 pointer-events-none transition-opacity duration-500 group-hover:opacity-90"
          style={{
            background: 'linear-gradient(to top, rgba(0,0,0,0.80) 0%, rgba(0,0,0,0.35) 50%, rgba(0,0,0,0.0) 100%)',
          }}
        />

        {/* ── Flash hover ───────────────────────────────────────────────── */}
        <div className="absolute inset-0 z-10 bg-white opacity-0 transition-opacity duration-300 group-hover:opacity-[0.06] pointer-events-none" />

        {/* ── Testo centrato in basso ───────────────────────────────────── */}
        <div className={cn(
          "absolute inset-x-0 bottom-0 z-20 flex flex-col items-center justify-end text-center",
          isBase ? "p-3" : "[padding:var(--space-fluid-s)]"
        )}>
          {ing.substituted && (
            <span className="mb-1 px-1.5 py-0.5 rounded border border-action/80 text-action-light font-bold text-[10px] tracking-widest uppercase bg-black/60 drop-shadow-md">
              Substitute
            </span>
          )}
          <Typography
            variant={isMain ? "h3" : (isBase ? "caption" : "h4")}
            color="white"
            className="leading-snug line-clamp-2 drop-shadow-md"
          >
            {ing.name_en}
          </Typography>
        </div>
      </button>
    );
  };

  return (
    <div className="flex flex-col gap-[var(--space-fluid-l)]">
      {/* TOP LEVEL: Main & Regulars */}
      {topLevel.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 [gap:var(--space-fluid-m)]">
          {topLevel.map((ing, i) => renderCard(ing, i, false))}
        </div>
      )}

      {/* BASE LEVEL: Base flavors */}
      {baseLevel.length > 0 && (
        <div>
          <Typography variant="microLabel" className="text-muted mb-4 block uppercase tracking-widest">Base Flavors</Typography>
          <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-[var(--space-fluid-s)]">
            {baseLevel.map((ing, i) => renderCard(ing, i, true))}
          </div>
        </div>
      )}
    </div>
  );
};

export default IngredientsGrid;
