import React from 'react';
import { SiblingCardPost, SiblingPost } from '../ui/card/SiblingCardPost';
import { SiblingSection } from '../layout/SiblingSection';
import { cn } from '@thaiakha/shared/lib/utils';

interface RecipeSiblingNavProps {
  previous: Record<string, unknown> | null;
  next: Record<string, unknown> | null;
  onNavigate: (slugOrId: string) => void;
  className?: string;
}

const RecipeSiblingNav: React.FC<RecipeSiblingNavProps> = ({ previous, next, onNavigate, className }) => {
  if (!previous && !next) return null;

  return (
    <div className={cn('w-full max-w-[var(--container-section)] mx-auto', className)}>
      <SiblingSection sectionId="sibiling_recipes">
          {previous && (
            <SiblingCardPost
              item={{
                title: previous.name as string,
                subtitle: (previous.excerpt as string | null) || null,
                imageUrl: ((previous.cover as Record<string, unknown>)?.image_url as string | null) ?? null,
                href: `/recipes/${(previous.slug as string) || (previous.id as string)}`,
                slug: (previous.slug as string) || (previous.id as string),
              } satisfies SiblingPost}
              direction="prev"
              onClick={() => onNavigate((previous.slug as string) || (previous.id as string))}
            />
          )}
          {next && (
            <SiblingCardPost
              item={{
                title: next.name as string,
                subtitle: (next.excerpt as string | null) || null,
                imageUrl: ((next.cover as Record<string, unknown>)?.image_url as string | null) ?? null,
                href: `/recipes/${(next.slug as string) || (next.id as string)}`,
                slug: (next.slug as string) || (next.id as string),
              } satisfies SiblingPost}
              direction="next"
              onClick={() => onNavigate((next.slug as string) || (next.id as string))}
            />
          )}
      </SiblingSection>
    </div>
  );
};

export default RecipeSiblingNav;
