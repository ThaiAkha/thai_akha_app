import React from 'react';
import { cn } from '@thaiakha/shared/lib/utils';
import { ContentCategoryDB } from '@thaiakha/shared/types';
import { Typography, Icon, RippleLink, MediaImage, AkhaPixelPattern } from '../ui/index';
import { getIcon } from '@thaiakha/shared/lib/icons';
import { INGREDIENTS_HUB_SLUG } from '../../hooks/useIngredientsFeed';

interface CategoryCardProps {
  category: ContentCategoryDB;
  count?: number;
  onOpen: (slug: string) => void;
}

/**
 * CategoryCard — hub tile (one per ingredient guide). Cover + title + count,
 * pantry hover/focus accent. Links to the category landing page.
 */
const CategoryCard: React.FC<CategoryCardProps> = ({ category, count, onOpen }) => {
  if (!category.slug) return null;
  const IconCmp = category.icon_name ? getIcon(category.icon_name) : null;

  return (
    <RippleLink
      href={`/${INGREDIENTS_HUB_SLUG}/${category.slug}`}
      onNavigate={() => onOpen(category.slug as string)}
      aria-label={category.title}
      className={cn(
        'group relative w-full overflow-hidden aspect-[4/3]',
        'rounded-[2.5rem] border-2 border-border/30',
        'transition-all duration-500 ease-out motion-reduce:transition-none',
        'md:hover:-translate-y-1 md:hover:border-pantry-4',
        'md:hover:shadow-[0_28px_72px_-14px_rgb(var(--pantry-4-ch)/0.30)]',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pantry-4/50',
      )}
    >
      {/* Cover */}
      {category.cover_asset_id ? (
        <MediaImage
          assetId={category.cover_asset_id}
          showCaption={false}
          fallbackAlt={category.title}
          className="absolute inset-0 w-full h-full"
          imgClassName="h-full object-cover transition-transform duration-700 md:group-hover:scale-[1.04]"
        />
      ) : (
        <div className="absolute inset-0 bg-pantry-4/5 flex items-center justify-center">
          <Icon name="grass" size="xl" className="text-pantry-4/40" />
        </div>
      )}

      {/* Overlay content */}
      <div className="absolute inset-0 z-20 flex flex-col justify-end">
        <div className="absolute inset-0 bg-gradient-to-t from-[#000000]/85 via-[#000000]/30 to-transparent pointer-events-none" />
        <div className="relative [padding:var(--space-fluid-l)] flex flex-col [gap:var(--space-fluid-2xs)]">
          {IconCmp && (
            <span className="inline-flex items-center justify-center size-11 rounded-full bg-white/10 backdrop-blur-md text-white [margin-bottom:var(--space-fluid-2xs)]">
              <IconCmp className="size-5" />
            </span>
          )}
          <Typography
            variant="h4"
            as="h2"
            className="text-white leading-tight md:group-hover:text-pantry-2 transition-colors duration-300"
          >
            {category.title}
            {category.title_highlight && (
              <span className="text-pantry-2"> {category.title_highlight}</span>
            )}
          </Typography>

          <AkhaPixelPattern variant="line_simple_medium" size={6} opacity={0.9} theme="ingredients" />

          <div className="flex items-center justify-between [margin-top:var(--space-fluid-2xs)]">
            {typeof count === 'number' && count > 0 && (
              <Typography variant="microLabel" className="text-white/70 uppercase tracking-widest">
                {count} ingredient{count === 1 ? '' : 's'}
              </Typography>
            )}
            <span className="flex items-center [gap:var(--space-fluid-2xs)] text-pantry-2 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity duration-300">
              <Typography as="span" variant="microLabel" className="uppercase">Explore</Typography>
              <Icon name="arrow_forward" size="sm" />
            </span>
          </div>
        </div>
      </div>
    </RippleLink>
  );
};

export default CategoryCard;
