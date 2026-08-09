import React, { useCallback } from 'react';
import { PageLayout, PageSEO, SiblingInfoSection } from '../components/layout';
import { HeaderSection } from '../components/layout/HeaderSection';
import { Typography, Icon, Button, AkhaThemedLine, FaqBottomPage } from '../components/ui/index';
import { ContentCategoryDB, IngredientListItem } from '@thaiakha/shared/types';
import { IngredientCard } from '../components/ingredients';
import { BlogGridSkeleton } from '../components/skeleton';
import { INGREDIENTS_HUB_SLUG } from '../hooks/useIngredientsFeed';

interface IngredientCategoryPageProps {
  category: ContentCategoryDB | null;
  ingredients: IngredientListItem[];
  loading: boolean;
  onOpenIngredient: (slug: string) => void;
  onBack: () => void;
  onNavigate?: (page: string) => void;
}

/**
 * Category landing page (level 2): hero from content_categories + grid of its ingredients.
 * FAQ + sibling categories at the bottom.
 */
const IngredientCategoryPage: React.FC<IngredientCategoryPageProps> = ({
  category,
  ingredients,
  loading,
  onOpenIngredient,
  onBack,
  onNavigate,
}) => {
  const handleOpen = useCallback((slug: string) => onOpenIngredient(slug), [onOpenIngredient]);

  return (
    <PageLayout
      slug="thai-cooking-ingredients-category"
      customMetadata={category ? {
        titleMain: category.title,
        description: category.seo_description || category.description || '',
        imageUrl: undefined,
      } : undefined}
      showPatterns={true}
      hideDefaultHeader={true}
    >
      {category && (
        <PageSEO
          title={category.seo_title || category.title}
          description={category.seo_description || category.description || ''}
          canonical={category.canonical_url || `${window.location.origin}/${INGREDIENTS_HUB_SLUG}/${category.slug}`}
          ogType={(category.og_type as 'website' | 'article' | 'profile') || 'website'}
          jsonLd={(category.json_ld as object) || undefined}
          hreflang={category.hreflang as Record<string, string> | undefined}
        />
      )}

      <div className="contents">
        <div className="w-full flex flex-col [gap:var(--space-fluid-l)]">
          {/* Back to hub */}
          <div>
            <Button variant="ghost" size="sm" icon="arrow_back" onClick={onBack}>
              All ingredients
            </Button>
          </div>

          {category && (
            <HeaderSection
              variant="hero"
              align="center"
              title={category.title}
              highlight={category.title_highlight ?? undefined}
              subtitle={category.subtitle ?? undefined}
              description={category.description ?? undefined}
              dividerTheme="ingredients"
            />
          )}

          {loading && <BlogGridSkeleton />}

          {!loading && ingredients.length === 0 && (
            <div className="flex flex-col items-center justify-center py-24 text-center [gap:var(--space-fluid-s)]">
              <Icon name="grass" size="xl" className="text-pantry-4/40" />
              <Typography variant="h5" color="sub">No ingredients here yet.</Typography>
              <Button variant="outline" size="sm" onClick={onBack} icon="arrow_back">All ingredients</Button>
            </div>
          )}

          {!loading && ingredients.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 [gap:var(--space-fluid-m)] [padding-top:var(--space-fluid-s)]">
              {ingredients.map((ing) => (
                <IngredientCard key={ing.id} ingredient={ing} onOpen={handleOpen} />
              ))}
            </div>
          )}

          <AkhaThemedLine theme="ingredients" />
        </div>

        {category?.slug && (
          <div className="w-full">
            <FaqBottomPage
              entityType="category"
              slug={category.slug}
              onNavigate={onNavigate}
            />
          </div>
        )}

        {onNavigate && (
          <SiblingInfoSection
            currentSlug={INGREDIENTS_HUB_SLUG}
            onNavigate={onNavigate}
            sectionId="sibiling_info"
          />
        )}
      </div>
    </PageLayout>
  );
};

export default IngredientCategoryPage;
