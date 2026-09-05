import React from 'react';
import { cn } from '@thaiakha/shared/lib/utils';
import { RecipeLink } from '@thaiakha/shared/types';
import { Typography, Icon, RippleLink } from '../ui/index';
import { AkhaThemedLine } from '../blog';
import { nativeNameFor } from '@thaiakha/shared/lib/nativeName';
import { useLanguage } from '../../context/LanguageContext';

const RECIPES_HUB_SLUG = 'authentic-thai-akha-recipes';

interface UsedInRecipesProps {
  recipes?: RecipeLink[];
  onOpenRecipe: (slug: string) => void;
  className?: string;
}

/**
 * UsedInRecipes — links to the recipe pages that use this ingredient.
 * Renders nothing when the list is empty. Mobile-first 2-up grid.
 */
const UsedInRecipes: React.FC<UsedInRecipesProps> = ({ recipes, onOpenRecipe, className }) => {
  const { lang } = useLanguage();
  if (!recipes || recipes.length === 0) return null;

  return (
    <section
      id="used-in-recipes"
      className={cn('scroll-mt-[100px] flex flex-col [gap:var(--space-fluid-s)]', className)}
    >
      <Typography variant="h3" as="h2" color="title">Used in these recipes</Typography>
      <AkhaThemedLine theme="ingredients" className="![padding-block:0] [margin-bottom:var(--space-fluid-2xs)]" />

      <div className="grid grid-cols-2 md:grid-cols-3 [gap:var(--space-fluid-s)]">
        {recipes.map((recipe) => (
          <RippleLink
            key={recipe.id}
            href={`/${RECIPES_HUB_SLUG}/${recipe.slug}`}
            onNavigate={() => onOpenRecipe(recipe.slug)}
            aria-label={recipe.name}
            className={cn(
              'group flex flex-col overflow-hidden rounded-[1.25rem] bg-surface border border-border',
              'transition-all duration-300 ease-out motion-reduce:transition-none',
              'md:hover:-translate-y-0.5 md:hover:border-pantry-4',
              'md:hover:shadow-[0_16px_40px_-16px_rgb(var(--pantry-4-ch)/0.28)]',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pantry-4/50',
            )}
          >
            <div className="relative w-full aspect-[4/3] overflow-hidden bg-pantry-4/5">
              {recipe.cover_data?.image_url ? (
                <img
                  src={recipe.cover_data.image_url}
                  alt={recipe.cover_data.alt_text || recipe.name}
                  loading="lazy"
                  decoding="async"
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 md:group-hover:scale-[1.04]"
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center">
                  <Icon name="CookingPot" size="lg" className="text-pantry-4/40" />
                </div>
              )}
            </div>
            <div className="flex flex-col [gap:var(--space-fluid-2xs)] [padding:var(--space-fluid-s)]">
              <Typography variant="paragraphM" color="title" className="font-semibold leading-snug line-clamp-2 md:group-hover:text-pantry-4 transition-colors duration-200">
                {recipe.name}
              </Typography>
              {nativeNameFor(recipe, lang).thai && (
                <Typography variant="microLabel" color="muted" className="line-clamp-1">
                  {nativeNameFor(recipe, lang).thai}
                </Typography>
              )}
            </div>
          </RippleLink>
        ))}
      </div>
    </section>
  );
};

export default UsedInRecipes;
