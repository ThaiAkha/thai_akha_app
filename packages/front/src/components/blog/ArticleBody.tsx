import React from 'react';
import { cn } from '@thaiakha/shared/lib/utils';

interface ArticleBodyProps {
  /** Contenuto colonna principale (9/12). */
  children: React.ReactNode;
  /** Contenuto sidebar sticky (3/12, desktop-only): ToC e/o card extra. Assente = colonna unica. */
  aside?: React.ReactNode;
  /** Tag semantico della colonna principale. 'article' quando il wrapper esterno non lo è già. */
  mainAs?: 'div' | 'article';
  /** Gap verticale della colonna principale (token fluid). */
  mainGap?: 'm' | 'l';
  /** Extra sul grid (es. "pt-8 pb-6"). */
  className?: string;
  /** Extra sull'aside (es. gap tra card e ToC). */
  asideClassName?: string;
}

const MAIN_GAP: Record<'m' | 'l', string> = {
  m: '[gap:var(--space-fluid-m)]',
  l: '[gap:var(--space-fluid-l)]',
};

/**
 * ArticleBody — layout condiviso del corpo articolo (History/News/Ingredient single):
 * grid 12 colonne, main 9/12 + aside sticky 3/12 desktop-only.
 * Il container di pagina (max-w-6xl) e l'header restano alla pagina.
 */
export const ArticleBody: React.FC<ArticleBodyProps> = ({
  children,
  aside,
  mainAs = 'div',
  mainGap = 'l',
  className,
  asideClassName,
}) => {
  const Main = mainAs;
  return (
    <div className={cn('grid grid-cols-1 lg:grid-cols-12 [gap:var(--space-fluid-l)] items-start', className)}>
      <Main className={cn('col-span-1 w-full min-w-0 flex flex-col', aside ? 'lg:col-span-9' : 'lg:col-span-12', MAIN_GAP[mainGap])}>
        {children}
      </Main>
      {aside && (
        <aside className={cn('hidden lg:flex lg:col-span-3 flex-col sticky top-[100px] pt-4', asideClassName)}>
          {aside}
        </aside>
      )}
    </div>
  );
};

export default ArticleBody;
