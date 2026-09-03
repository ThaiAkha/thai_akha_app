import React from 'react';
import { cn } from '@thaiakha/shared/lib/utils';
import { IngredientListItem } from '@thaiakha/shared/types';
import { Typography, Icon, RippleLink, AkhaPixelPattern } from '../ui/index';
import { INGREDIENTS_HUB_SLUG } from '../../hooks/useIngredientsFeed';

interface IngredientCardProps {
  ingredient: IngredientListItem;
  /** Navigate handler — used when interactive (grids). Ignored when interactive={false}. */
  onOpen?: (slug: string) => void;
  /** false → static identity card (no link, no hover-lift). Default true (grid behavior). */
  interactive?: boolean;
  /** false → English name only (hide Thai + phonetic). Default true (grid behavior). */
  showNativeNames?: boolean;
}

/**
 * IngredientCard — 1:1 food card for the ingredient grids (hub category / category page).
 * Pantry world: paprika hover/focus accent, concentric radius, fluid spacing.
 * With `interactive={false}` it becomes a non-link identity card (e.g. sidebar of the
 * single ingredient page — clicking would just loop back to the same page).
 */
const IngredientCard: React.FC<IngredientCardProps> = ({
  ingredient,
  onOpen,
  interactive = true,
  showNativeNames = true,
}) => {
  const cover = ingredient.cover_data;

  const inner = (
    <>
      {/* Cover — full bleed 1:1 */}
      {cover?.image_url ? (
        <img
          src={cover.image_url}
          alt={cover.alt_text || ingredient.name}
          loading="lazy"
          decoding="async"
          className="absolute inset-0 z-0 w-full h-full object-cover transition-transform duration-700 md:group-hover:scale-[1.04]"
        />
      ) : (
        <div className="absolute inset-0 z-0 bg-pantry-4/5 flex items-center justify-center">
          <Icon name="grass" size="xl" className="text-pantry-4/40" />
        </div>
      )}

      {/* Bottom overlay — name EN (+ TH / phonetic when showNativeNames) */}
      <div className="absolute inset-x-0 bottom-0 z-20 flex flex-col">
        <div className="absolute inset-0 bg-[#000000]/75 mix-blend-multiply pointer-events-none" />
        <div className="relative [padding:var(--space-fluid-m)] flex flex-col [gap:var(--space-fluid-2xs)]">
          <Typography
            variant="h5"
            as="h3"
            className={cn(
              'text-white leading-tight line-clamp-2 transition-colors duration-300',
              interactive && 'md:group-hover:text-pantry-2',
            )}
          >
            {ingredient.name}
          </Typography>

          {showNativeNames && (ingredient.name_th || ingredient.phonetic) && (
            <div className="flex flex-wrap items-baseline [gap:var(--space-fluid-2xs)]">
              {ingredient.name_th && (
                <Typography as="span" variant="paragraphS" className="text-white/90">
                  {ingredient.name_th}
                </Typography>
              )}
              {ingredient.phonetic && (
                <Typography as="span" variant="microLabel" className="text-white/60 italic">
                  {ingredient.phonetic}
                </Typography>
              )}
            </div>
          )}

          <AkhaPixelPattern
            variant="line_simple_medium"
            size={6}
            opacity={0.9}
            theme="ingredients"
            className="[margin-top:var(--space-fluid-2xs)]"
          />
        </div>
      </div>
    </>
  );

  const baseClass = 'group relative w-full overflow-hidden aspect-square rounded-[2rem] border-2 border-border/30';

  // Static identity card — no link, no hover-lift (used in the single-page sidebar).
  if (!interactive) {
    return <div className={baseClass}>{inner}</div>;
  }

  return (
    <RippleLink
      href={`/${INGREDIENTS_HUB_SLUG}/${ingredient.slug}`}
      onNavigate={() => onOpen?.(ingredient.slug)}
      aria-label={ingredient.name}
      className={cn(
        baseClass,
        'transition-all duration-500 ease-out motion-reduce:transition-none',
        'md:hover:-translate-y-1 md:hover:border-pantry-4',
        'md:hover:shadow-[0_24px_64px_-12px_rgb(var(--pantry-4-ch)/0.28)]',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pantry-4/50',
      )}
    >
      {inner}
    </RippleLink>
  );
};

export default IngredientCard;
