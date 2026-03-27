import React from 'react';
import { CultureSection } from '@thaiakha/shared/types';
import { cn } from '@thaiakha/shared/lib/utils';
import {
  ChapterCard,
  HeroCard,
  FilmStripCard,
} from './index';

type GridVariant = 'chapter' | 'hero' | 'horizontal';

function resolveVariant(index: number): GridVariant {
  if (index % 7 === 6) return 'horizontal';
  if (index % 4 === 3) return 'hero';
  return 'chapter';
}

function variantColSpan(variant: GridVariant): string {
  if (variant === 'horizontal') return 'col-span-1 sm:col-span-2 lg:col-span-3';
  return '';
}

interface BlogGridProps {
  sections: CultureSection[];
  onOpen: (slug: string) => void;
  className?: string;
}

/**
 * Standardized responsive grid for History/Blog cards.
 * Handles internal layout logic (chapter, hero, horizontal variants).
 */
export const BlogGrid: React.FC<BlogGridProps> = ({ sections, onOpen, className }) => (
  <div className={cn("grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6", className)}>
    {sections.map((section, index) => {
      const variant = resolveVariant(index);
      return (
        <div key={section.id} className={cn(variantColSpan(variant))}>
          {variant === 'horizontal' && (
            <FilmStripCard section={section} index={index} onOpen={onOpen} />
          )}
          {variant === 'hero' && (
            <HeroCard section={section} index={index} onOpen={onOpen} />
          )}
          {variant === 'chapter' && (
            <ChapterCard section={section} index={index} onOpen={onOpen} />
          )}
        </div>
      );
    })}
  </div>
);

export default BlogGrid;
