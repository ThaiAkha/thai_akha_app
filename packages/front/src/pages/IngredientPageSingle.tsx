import React, { useState, useCallback, useMemo } from 'react';
import { PageLayout, StickyTabNav, PageSEO } from '../components/layout';
import {
  Typography,
  Button,
  Icon,
  FaqBottomPage,
  TableOfContents,
} from '../components/ui/index';
import { IngredientListItem } from '@thaiakha/shared/types';
import { AuthorBlock, HeaderSinglePost, AkhaThemedLine, ArticleBody } from '../components/blog';
import { TheEssentialBox, IngredientUsageNote, UsedInRecipes, IngredientCard } from '../components/ingredients';
import { CherryEntryCard } from '../components/chat/CherryEntryCard';
import SiblingPostNav from '../components/layout/SiblingPostNav';
import { ArticleDetailSkeleton } from '../components/skeleton';
import { useIngredientDetail } from '../hooks/useIngredientDetail';
import { INGREDIENTS_HUB_SLUG } from '../hooks/useIngredientsFeed';
import { t } from '../i18n';

interface TabItem { value: string; label: string; icon?: string; }

interface IngredientPageSingleProps {
  slug: string;
  onBack: () => void;
  onOpen?: (slug: string) => void;
  ingredients?: IngredientListItem[];
  tabItems?: TabItem[];
  activeCategory?: string;
  onCategoryChange?: (cat: string) => void;
  onNavigate?: (page: string, topic?: string, sectionId?: string) => void;
}

/** Injected-HTML body field (description/culinary_uses/…). Pantry-styled prose. */
const IngredientProse: React.FC<{ html: string }> = ({ html }) => (
  <div
    className="max-w-none text-desc leading-relaxed [&_p]:mb-4 [&_strong]:font-bold [&_strong]:text-title [&_em]:italic [&_a]:text-pantry-4 [&_a]:font-semibold hover:[&_a]:underline [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:mb-4 [&_li]:mb-1"
    dangerouslySetInnerHTML={{ __html: html }}
  />
);

const IngredientPageSingle: React.FC<IngredientPageSingleProps> = ({
  slug,
  onBack,
  onOpen,
  ingredients = [],
  tabItems = [],
  activeCategory = 'all',
  onCategoryChange,
  onNavigate,
}) => {
  const { ingredient, previous, next, loading: dataLoading, error } = useIngredientDetail(slug, ingredients);
  const [copied, setCopied] = useState(false);

  const handleShare = useCallback(() => {
    if (navigator.share) {
      navigator.share({
        title: ingredient?.name_en ?? 'Thai Akha',
        text: ingredient?.summary_ai ?? '',
        url: window.location.href,
      }).catch(console.error);
    } else {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }, [ingredient]);

  const handleSiblingOpen = useCallback((newSlug: string) => {
    if (onOpen) onOpen(newSlug);
  }, [onOpen]);

  const openRecipe = useCallback((recipeSlug: string) => {
    if (onNavigate) onNavigate('authentic-thai-akha-recipes', undefined, recipeSlug);
  }, [onNavigate]);

  // Body sections from discrete columns (no `content` block array on ingredients).
  const bodySections = useMemo(() => {
    if (!ingredient) return [] as Array<{ id: string; label: string; html: string }>;
    return [
      { id: 'overview', label: 'Overview', html: ingredient.description },
      { id: 'in-the-kitchen', label: 'In the Kitchen', html: ingredient.culinary_uses },
      { id: 'health-benefits', label: 'Health & Benefits', html: ingredient.health_benefits },
      { id: 'good-to-know', label: 'Good to Know', html: ingredient.conclusion },
    ].filter((s): s is { id: string; label: string; html: string } => !!s.html && String(s.html).trim() !== '');
  }, [ingredient]);

  const tocItems = useMemo(() => {
    const items = bodySections.map(s => ({ id: s.id, label: s.label }));
    if (ingredient?.used_in_recipes && ingredient.used_in_recipes.length > 0) {
      items.push({ id: 'used-in-recipes', label: 'Used in recipes' });
    }
    return items;
  }, [bodySections, ingredient]);

  const subtitle = ingredient
    ? [ingredient.name_th, ingredient.phonetic ? `[${ingredient.phonetic}]` : null].filter(Boolean).join('  ')
    : '';

  return (
    <PageLayout
      slug="thai-cooking-ingredients-single"
      customMetadata={ingredient ? {
        titleMain: ingredient.name_en,
        description: ingredient.seo_description || ingredient.summary_ai || '',
        imageUrl: ingredient.cover_data?.image_url || '',
      } : undefined}
      showPatterns={true}
      hideDefaultHeader={true}
    >
      {ingredient && (
        <PageSEO
          title={ingredient.seo_title || ingredient.name_en}
          description={ingredient.seo_description || ingredient.summary_ai || ''}
          canonical={ingredient.canonical_url || `${window.location.origin}/${INGREDIENTS_HUB_SLUG}/${ingredient.slug}`}
          ogImage={ingredient.cover_data?.image_url || ''}
          ogType="article"
          jsonLd={(ingredient.json_ld as object) || undefined}
          hreflang={ingredient.hreflang as Record<string, string> | undefined}
        />
      )}

      <div className="contents">
        {onCategoryChange && tabItems.length > 0 && (
          <StickyTabNav items={tabItems} value={activeCategory} onChange={onCategoryChange} />
        )}

        <div className="w-full max-w-6xl mx-auto">
          {dataLoading && <ArticleDetailSkeleton />}

          {!dataLoading && (error || !ingredient) && (
            <div className="flex flex-col items-center justify-center py-24 text-center [gap:var(--space-fluid-s)]">
              <Icon name="wifi_off" size="xl" className="text-pantry-4/40" />
              <Typography variant="h5" color="sub">This ingredient could not be loaded.</Typography>
              <Button variant="outline" size="sm" onClick={onBack} icon="arrow_back">{t('common:goBack')}</Button>
            </div>
          )}

          {!dataLoading && ingredient && (
            <article className="flex flex-col [gap:var(--space-fluid-m)] animate-in fade-in slide-in-from-bottom-4 duration-700">
              <HeaderSinglePost
                title={ingredient.name_en}
                subtitle={subtitle || undefined}
                primaryImage={ingredient.cover_data?.image_url ?? undefined}
                primaryImageAlt={ingredient.cover_data?.alt_text ?? undefined}
                quote={ingredient.summary_ai ?? undefined}
                categoryName={ingredient.category?.title}
                onShare={handleShare}
                isCopied={copied}
                theme="ingredients"
              />

              <ArticleBody
                className="pt-8 pb-6"
                asideClassName="[gap:var(--space-fluid-m)]"
                aside={
                  <>
                    <IngredientCard ingredient={ingredient} interactive={false} showNativeNames={false} />
                    {tocItems.length > 0 && (
                      <TableOfContents
                        items={tocItems}
                        title={t('blog:contents')}
                        dividerTheme="ingredients"
                        accent="ingredients"
                      />
                    )}
                  </>
                }
              >
                  {/* Context callout (market_tour / support) — text verbatim from usage_note */}
                  <IngredientUsageNote
                    usageNote={ingredient.usage_note}
                    kitchenUsage={ingredient.kitchen_usage}
                  />

                  <TheEssentialBox data={ingredient.the_essential} />

                  {bodySections.map((s) => (
                    <section key={s.id} id={s.id} className="scroll-mt-[100px] flex flex-col [gap:var(--space-fluid-s)]">
                      <Typography variant="h3" as="h2" color="title">{s.label}</Typography>
                      <AkhaThemedLine theme="ingredients" className="![padding-block:0] [margin-bottom:var(--space-fluid-2xs)]" />
                      <IngredientProse html={s.html} />
                    </section>
                  ))}

                  {/* Recipes that use this ingredient (hidden when none) */}
                  <UsedInRecipes recipes={ingredient.used_in_recipes} onOpenRecipe={openRecipe} />

                  <AuthorBlock
                    author={ingredient.author}
                    auditDate={ingredient.last_content_audit_ai}
                    theme="ingredients"
                    className="[margin-top:var(--space-fluid-m)]"
                  />
              </ArticleBody>
            </article>
          )}
        </div>

        {/* Ask Cherry */}
        {!dataLoading && ingredient && (ingredient.cherry_prompt || ingredient.cherry_response) && (
          <div className="w-full max-w-6xl mx-auto [margin-bottom:var(--space-fluid-l)]">
            <CherryEntryCard
              cherry_prompt={ingredient.cherry_prompt}
              cherry_response={ingredient.cherry_response}
              cherry_button_ids={ingredient.cherry_button_ids}
            />
          </div>
        )}

        {/* FAQ — entity mode, reads faq_questions (entity_type='ingredient') */}
        {!dataLoading && ingredient && (
          <div className="w-full">
            <FaqBottomPage
              entityType="ingredient"
              slug={ingredient.slug}
              onNavigate={onNavigate}
            />
          </div>
        )}

        {/* Sibling nav */}
        {!dataLoading && ingredient && (previous || next) && (
          <>
            <SiblingPostNav
              sectionId="sibiling_ingredients"
              onOpen={handleSiblingOpen}
              previous={previous ? {
                title: previous.name_en,
                subtitle: previous.phonetic ?? previous.name_th ?? null,
                imageUrl: previous.cover_data?.image_url ?? null,
                href: `/${INGREDIENTS_HUB_SLUG}/${previous.slug}`,
                slug: previous.slug,
              } : null}
              next={next ? {
                title: next.name_en,
                subtitle: next.phonetic ?? next.name_th ?? null,
                imageUrl: next.cover_data?.image_url ?? null,
                href: `/${INGREDIENTS_HUB_SLUG}/${next.slug}`,
                slug: next.slug,
              } : null}
            />
          </>
        )}
      </div>
    </PageLayout>
  );
};

export default IngredientPageSingle;
