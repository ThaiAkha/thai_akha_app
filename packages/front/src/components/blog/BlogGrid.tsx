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
  const step = index % 6;
  if (step === 1 || step === 5) return 'horizontal';
  if (step === 2 || step === 3) return 'hero';
  return 'chapter';
}

/**
 * Gestisce le campate delle colonne in base al ciclo di 6:
 * Desktop (lg): 1/3+2/3, 1/3+1/3+1/3, 3/3
 * Tablet (sm): 1/2+1/2, 1/2+1/2, 2/2, 2/2
 */
function resolveColSpan(index: number): string {
  const step = index % 6;
  switch (step) {
    case 0: return 'col-span-1'; 
    case 1: return 'col-span-1 lg:col-span-2';
    case 2: return 'col-span-1';
    case 3: return 'col-span-1';
    case 4: return 'sm:col-span-2 lg:col-span-1';
    case 5: return 'sm:col-span-2 lg:col-span-3';
    default: return 'col-span-1';
  }
}

interface BlogGridProps {
  sections: CultureSection[];
  onOpen: (slug: string) => void;
  className?: string;
}

/**
 * Standardized responsive grid for History/Blog cards.
 * Implements a custom 6-item sequence for editorial flow.
 */
export const BlogGrid: React.FC<BlogGridProps> = ({ sections, onOpen, className }) => (
  <div className={cn("grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 [gap:var(--space-fluid-m)]", className)}>
    {sections.map((section, index) => {
      const variant = resolveVariant(index);
      return (
        <div key={section.id} className={cn(resolveColSpan(index))}>
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
