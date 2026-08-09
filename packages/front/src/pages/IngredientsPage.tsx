import React, { useCallback } from 'react';
import { PageLayout } from '../components/layout/PageLayout';
import { HeaderMenu, SiblingInfoSection } from '../components/layout';
import PageEssentials from '../components/layout/PageEssentials';
import { Typography, Icon, FaqBottomPage } from '../components/ui/index';
import { CategoryCard } from '../components/ingredients';
import { BlogGridSkeleton } from '../components/skeleton';
import { useIngredientsFeed, INGREDIENTS_HUB_SLUG } from '../hooks/useIngredientsFeed';
import IngredientCategoryPage from './IngredientCategoryPage';
import IngredientPageSingle from './IngredientPageSingle';

interface IngredientsPageProps {
  onNavigate: (page: string, topic?: string, sectionId?: string) => void;
  targetSection?: string | null;
}

const IngredientsPage: React.FC<IngredientsPageProps> = ({ onNavigate, targetSection }) => {
  const {
    view,
    ingredients,
    categories,
    countByCategory,
    activeSlug,
    activeCategory,
    categoryIngredients,
    loading,
    error,
  } = useIngredientsFeed(targetSection);

  const openIngredient = useCallback(
    (slug: string) => onNavigate(INGREDIENTS_HUB_SLUG, undefined, slug),
    [onNavigate],
  );
  const openCategory = useCallback(
    (slug: string) => onNavigate(INGREDIENTS_HUB_SLUG, undefined, slug),
    [onNavigate],
  );
  const backToHub = useCallback(() => onNavigate(INGREDIENTS_HUB_SLUG), [onNavigate]);

  // ── Level 3: single ingredient ────────────────────────────────────────────
  if (view === 'detail' && activeSlug) {
    return (
      <IngredientPageSingle
        slug={activeSlug}
        ingredients={ingredients}
        onBack={backToHub}
        onOpen={openIngredient}
        onNavigate={onNavigate}
      />
    );
  }

  // ── Level 2: category landing ─────────────────────────────────────────────
  if (view === 'category') {
    return (
      <IngredientCategoryPage
        category={activeCategory}
        ingredients={categoryIngredients}
        loading={loading}
        onOpenIngredient={openIngredient}
        onBack={backToHub}
        onNavigate={onNavigate}
      />
    );
  }

  // ── Level 1: hub (category showcase) ──────────────────────────────────────
  return (
    <PageLayout
      slug={INGREDIENTS_HUB_SLUG}
      showPatterns={true}
      hideDefaultHeader={true}
      customHeader={<HeaderMenu customSlug={INGREDIENTS_HUB_SLUG} />}
    >
      {/* SEO: interamente di SEOHead (globale, slug-based). Niente PageSEO qui. */}

      <div className="contents">
        {loading && <BlogGridSkeleton />}

        {!loading && error && (
          <div className="flex flex-col items-center justify-center py-24 text-center [gap:var(--space-fluid-s)]">
            <Icon name="wifi_off" size="xl" className="text-pantry-4/40" />
            <Typography variant="h5" color="sub">Ingredients could not be loaded.</Typography>
            <Typography variant="paragraphS" color="muted">Please check your connection and try again.</Typography>
          </div>
        )}

        {!loading && !error && categories.length === 0 && (
          <div className="flex flex-col items-center justify-center py-24 text-center [gap:var(--space-fluid-s)]">
            <Icon name="grass" size="xl" className="text-pantry-4/40" />
            <Typography variant="h5" color="sub">No ingredient categories yet.</Typography>
          </div>
        )}

        {!loading && !error && categories.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 [gap:var(--space-fluid-m)] [padding-top:var(--space-fluid-s)]">
            {categories.map((cat) => (
              <CategoryCard
                key={cat.id}
                category={cat}
                count={cat.id ? countByCategory[cat.id] : undefined}
                onOpen={openCategory}
              />
            ))}
          </div>
        )}

        <PageEssentials slug={INGREDIENTS_HUB_SLUG} />

        <FaqBottomPage slug={INGREDIENTS_HUB_SLUG} onNavigate={onNavigate} />

        <SiblingInfoSection
          currentSlug={INGREDIENTS_HUB_SLUG}
          onNavigate={onNavigate}
          sectionId="sibiling_info"
        />
      </div>
    </PageLayout>
  );
};

export default IngredientsPage;
