import React, { useState, useEffect } from 'react';
import { PageLayout, PageSEO } from '../components/layout/index';
import { Typography, Button, AkhaLoader, Card } from '../components/ui/index';
import GalleryModal from '../components/modal/GalleryModal';
import IngredientModal from '../components/modal/IngredientModal';
import { AuthorBlock, HeaderSinglePost, AkhaThemedLine } from '../components/blog';
import { AkhaQuote } from '../components/divider';
import { RecipeNav, RecipeSection, RecipeMetaBar, AllergyAlerts, IngredientsGrid, DirectionsSteps, GarnishAndTip, RecipeEssentials } from '../components/recipes';
import SiblingPostNav from '../components/layout/SiblingPostNav';
import { Photo } from '../components/modal';
import { FaqBottomPage } from '../components/ui';
import RecipeCherryChat from '../components/chat/RecipeCherryChat';
import { useRecipePageData } from '../hooks/useRecipePageData';
import { useShareLink } from '../hooks/useShareLink';
import type { RecipeNavItem } from '../components/recipes';
import type { UserProfile } from '@thaiakha/shared/types';
import { t } from '../i18n';
import { sanitizeHtml } from '../lib/sanitizeHtml';

interface RecipeSinglePageProps {
  slug: string;
  onNavigate?: (targetPage: string, topic?: string, sectionId?: string) => void;
  userProfile?: UserProfile | null;
}

const RecipeSinglePage: React.FC<RecipeSinglePageProps> = ({ slug, onNavigate, userProfile }) => {
  const {
    recipe,
    recipeRaw,
    allRecipesRaw,
    richIngredients,
    galleryModalItems,
    cultureModalItems,
    recipeCategories,
    previous,
    next,
    activeDiet,
    activeAllergies,
    audioId,
    audioAsset,
    activeConflicts,
    spiceLevel,
    loading,
    navLoading,
  } = useRecipePageData(slug, userProfile);

  const { handleShare, copied } = useShareLink();

  const [isGalleryOpen, setIsGalleryOpen] = useState(false);
  const [galleryStartIndex, setGalleryStartIndex] = useState(0);
  const [isCultureGalleryOpen, setIsCultureGalleryOpen] = useState(false);
  const [cultureGalleryStartIndex, setCultureGalleryStartIndex] = useState(0);
  const [isIngredientModalOpen, setIsIngredientModalOpen] = useState(false);
  const [ingredientStartIndex, setIngredientStartIndex] = useState(0);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [slug]);

  if (loading) {
    return (
      <PageLayout slug="recipes" showPatterns={true} hideDefaultHeader={true}>
        <div className="flex justify-center items-center h-[60vh]">
          <AkhaLoader />
        </div>
      </PageLayout>
    );
  }

  if (!recipe || !recipeRaw) {
    return (
      <PageLayout slug="recipes" showPatterns={true} hideDefaultHeader={true}>
        <div className="flex flex-col justify-center items-center h-[60vh] text-center [padding:var(--space-fluid-m)]">
          <Typography variant="h3" as="p" className="mb-4">{t('recipeSingle:notFound')}</Typography>
          <Button variant="action" onClick={() => onNavigate?.('recipes')}>{t('recipeSingle:backToRecipes')}</Button>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout slug={`recipe-${slug}`} showPatterns={false} hideDefaultHeader={true}>

      <PageSEO
        title={recipeRaw?.seo_title as string || `${recipeRaw?.name} | Thai Akha Kitchen`}
        description={(recipeRaw?.seo_description as string) || (recipeRaw?.description as string)?.slice(0, 160) || ''}
        canonical={`https://www.thaiakha.com/authentic-thai-akha-recipes/${slug}`}
        ogImage={
          (recipeRaw?.cover as Record<string, unknown>)?.image_url as string ||
          'https://mtqullobcsypkqgdkaob.supabase.co/storage/v1/object/public/showcase/og-default.jpg'
        }
        ogType="article"
        jsonLd={recipeRaw?.json_ld as object || {
          '@context': 'https://schema.org',
          '@type': 'Recipe',
          'name': recipeRaw?.name,
          'description': recipeRaw?.description,
          'image': (recipeRaw?.cover as Record<string, unknown>)?.image_url,
          'url': `https://www.thaiakha.com/authentic-thai-akha-recipes/${slug}`,
          'author': { '@type': 'Organization', 'name': 'Thai Akha Kitchen' },
          'recipeIngredient': richIngredients.map(ing => ing.quantity && ing.unit ? `${ing.quantity} ${ing.unit} ${ing.name_en}` : ing.name_en),
          'recipeInstructions': recipe.directions?.map(step => ({
            '@type': 'HowToStep',
            'text': step
          })),
          'prepTime': recipe.prep_time_min ? `PT${recipe.prep_time_min}M` : undefined,
          'cookTime': recipe.cook_time_min ? `PT${recipe.cook_time_min}M` : undefined,
          'totalTime': (recipeRaw?.total_time_min) ? `PT${recipeRaw.total_time_min}M` : (recipe.prep_time_min && recipe.cook_time_min) ? `PT${recipe.prep_time_min + recipe.cook_time_min}M` : undefined,
          'recipeYield': recipe.servings ? `${recipe.servings} servings` : undefined,
        }}
      />

      <RecipeNav
        recipeName={recipe.name}
        currentRecipeId={recipeRaw.id as string}
        allRecipes={allRecipesRaw as unknown as RecipeNavItem[]}
        categories={recipeCategories}
        previous={previous as unknown as RecipeNavItem | null}
        next={next as unknown as RecipeNavItem | null}
        onClose={() => onNavigate?.('recipes')}
        onNavigate={(slugOrId) => onNavigate?.('recipes', undefined, slugOrId)}
        navLoading={navLoading}
      />

      <article className="w-full flex flex-col [gap:var(--space-fluid-xl)] animate-in fade-in duration-500">

        <div className="w-full max-w-6xl mx-auto">
          <HeaderSinglePost
            title={recipe.name}
            subtitle={(recipeRaw?.subtitle as string) || (recipeRaw?.thai_name as string) || undefined}
            primaryImage={recipe.image}
            primaryImageAlt={recipe.coverAltText || recipe.name}
            audioAssetId={audioId}
            hasAudio={!!audioAsset}
            quote={recipe.excerpt || (recipeRaw?.excerpt as string) || undefined}
            categoryName={(recipeRaw?.content_categories as Record<string, unknown>)?.tab_label as string || undefined}
            dietLabel={activeDiet && activeDiet !== 'diet_regular'
              ? activeDiet.replace('diet_', '').replace(/_/g, ' ').toUpperCase()
              : undefined}
            onShare={() => handleShare(recipe.name, recipe.excerpt ?? recipe.description ?? '')}
            isCopied={copied}
            theme="kitchen"
          />
        </div>

        {/* ── Meta + Allergy + Description ─────────────────── max-w-4xl */}
        <div className="w-full max-w-4xl mx-auto flex flex-col [gap:var(--space-fluid-xl)]">

          <RecipeMetaBar
            servings={recipe.servings}
            prepTimeMin={recipe.prep_time_min}
            cookTimeMin={recipe.cook_time_min}
            difficulty={(recipeRaw?.difficulty as string) || undefined}
            spiceLevel={(recipeRaw?.essentials as Record<string, unknown>)?.spice_level as string || undefined}
          />

          {activeConflicts.length > 0 && <AllergyAlerts conflicts={activeConflicts} />}

          {recipe.description && (
            <RecipeSection sectionId="recipe_single_description">
              <Typography as="div" variant="paragraphL" color="default" className="leading-relaxed [&_strong]:font-bold [&_em]:italic [&_a]:text-action [&_a]:font-bold hover:[&_a]:underline recipe-prose"
                dangerouslySetInnerHTML={{ __html: sanitizeHtml(recipe.description) }}
              />
            </RecipeSection>
          )}

        </div>

        {/* ── Photo Gallery ─────────────────────────────────── max-w-6xl (= header) */}
        {(galleryModalItems[0] || galleryModalItems[2]) && (
          <div className="w-full max-w-6xl mx-auto flex flex-col [gap:var(--space-fluid-s)]">
            <AkhaThemedLine theme="kitchen" length="xl" geometry="none" />
            <RecipeSection sectionId="recipe_single_gallery">
              <div className="grid grid-cols-1 sm:grid-cols-2 [gap:var(--space-fluid-m)]">
                {[0, 2].flatMap(idx =>
                  galleryModalItems[idx]
                    ? [
                        <Photo
                          key={galleryModalItems[idx].asset_id || idx}
                          item={galleryModalItems[idx]}
                          variant="video"
                          onClick={() => { setGalleryStartIndex(idx); setIsGalleryOpen(true); }}
                        />,
                      ]
                    : []
                )}
              </div>
            </RecipeSection>
          </div>
        )}
        {/* ── Ingredients → End ──────────────────────────── max-w-4xl */}
        <div className="w-full max-w-4xl mx-auto flex flex-col [gap:var(--space-fluid-xl)]">

          {richIngredients.length > 0 && (
            <div className="contents">
              <AkhaThemedLine theme="kitchen" />
              <RecipeSection sectionId="recipe_single_ingredients">
                <IngredientsGrid
                  ingredients={richIngredients}
                  onIngredientClick={(index) => { setIngredientStartIndex(index); setIsIngredientModalOpen(true); }}
                />
              </RecipeSection>
            </div>
          )}

          {recipe.directions && recipe.directions.length > 0 && (
            <div className="contents">
              <AkhaThemedLine theme="kitchen" />
              <RecipeSection sectionId="recipe_single_directions">
                <DirectionsSteps steps={recipe.directions} />
              </RecipeSection>
            </div>
          )}

          {galleryModalItems[1] && (
            <div className="contents">
              <Photo
                item={galleryModalItems[1]}
                variant="video"
                onClick={() => { setGalleryStartIndex(1); setIsGalleryOpen(true); }}
              />
            </div>
          )}

          <div className="contents">
            <GarnishAndTip garnish={recipe.garnish} cooksTip={recipe.cooks_tip} />
          </div>

          {(recipe.notes || cultureModalItems.length > 0) && (
            <div className="contents">
              <AkhaThemedLine theme="kitchen" />
              <RecipeSection sectionId="recipe_single_culture_story">
                <Card variant="glass" padding="md" rounded="2xl">

                  {recipe.notes && (
                    <Typography as="div" variant="paragraphM" color="muted" className="leading-relaxed italic [&_strong]:font-bold [&_em]:not-italic [&_a]:text-action [&_a]:font-bold hover:[&_a]:underline recipe-prose"
                      dangerouslySetInnerHTML={{ __html: sanitizeHtml(recipe.notes) }}
                    />
                  )}

                  {cultureModalItems.length > 0 && (
                    <div
                      className={`grid grid-cols-1 sm:grid-cols-2 [gap:var(--space-fluid-m)]${recipe.notes ? ' [margin-top:var(--space-fluid-m)]' : ''}`}
                    >
                      {cultureModalItems.map((item, idx) => (
                        <Photo
                          key={item.asset_id || idx}
                          item={item}
                          variant="video"
                          onClick={() => { setCultureGalleryStartIndex(idx); setIsCultureGalleryOpen(true); }}
                          className="rounded-xl"
                        />
                      ))}
                    </div>
                  )}

                  {!!recipeRaw?.culture_link_url && (
                    <div className="[margin-top:var(--space-fluid-m)] [padding-top:var(--space-fluid-s)] border-t border-white/10">
                      <Typography variant="microLabel" color="muted" className="block [margin-bottom:var(--space-fluid-3xs)]">
                        Discover more
                      </Typography>
                      <a
                        href={recipeRaw.culture_link_url as string}
                        className="group inline-flex items-center gap-2 hover:opacity-80 transition-opacity"
                      >
                        <Typography as="span" variant="h6" className="text-action leading-snug group-hover:underline">
                          {(recipeRaw.culture_link_label as string) || 'Explore Akha Culture'}
                        </Typography>
                        <span aria-hidden="true" className="text-action text-lg font-bold">→</span>
                      </a>
                    </div>
                  )}

                </Card>
              </RecipeSection>
            </div>
          )}

          {recipe.healthBenefits && recipe.healthBenefits !== 'Traditional Akha heritage dish.' && (
            <div className="contents">
              <AkhaThemedLine theme="kitchen" />
              <RecipeSection sectionId="recipe_single_health">
                <Card variant="glass" padding="md" rounded="2xl">
                  <Typography as="div" variant="paragraphM" color="default" className="leading-relaxed [&_strong]:font-bold [&_em]:italic [&_a]:text-action [&_a]:font-bold hover:[&_a]:underline recipe-prose"
                    dangerouslySetInnerHTML={{ __html: sanitizeHtml(recipe.healthBenefits) }}
                  />
                </Card>
              </RecipeSection>
            </div>
          )}

          {galleryModalItems[3] && (
            <div className="contents">
              <AkhaThemedLine theme="kitchen" length="xl" geometry="none" />
              <Photo
                item={galleryModalItems[3]}
                variant="video"
                onClick={() => { setGalleryStartIndex(3); setIsGalleryOpen(true); }}
              />
              {galleryModalItems[3].caption && (
                <AkhaQuote variant="base" align="left" className="max-w-3xl mx-auto">
                  {galleryModalItems[3].caption}
                </AkhaQuote>
              )}
            </div>
          )}

          <div className="contents">
            <AkhaThemedLine theme="kitchen" />
            <RecipeSection sectionId="recipe_single_ask_cherry">
              <RecipeCherryChat
                cherry_prompt={recipeRaw?.cherry_prompt as string | undefined}
                cherry_response={recipeRaw?.cherry_response as string | undefined}
                cherry_button_ids={recipeRaw?.cherry_button_ids as string[] | undefined}
                recipeName={(recipeRaw?.name as string) || ''}
                diet={activeDiet}
                allergies={activeAllergies}
              />
            </RecipeSection>
          </div>

          {(recipeRaw?.essentials || recipeRaw?.spice_level_id || recipe?.prep_time_min) && (
            <div className="contents">
              <AkhaThemedLine theme="kitchen" />
              <RecipeEssentials
                prepTimeMin={recipe.prep_time_min}
                cookTimeMin={recipe.cook_time_min}
                totalTimeMin={(recipeRaw?.total_time_min as number) || undefined}
                servings={recipe.servings}
                difficulty={(recipeRaw?.difficulty as string) || undefined}
                spiceLevelId={(recipeRaw?.spice_level_id as number) || undefined}
                spiceLevelData={spiceLevel}
                essentials={(recipeRaw?.essentials as Record<string, string>) || undefined}
              />
            </div>
          )}

          {!!recipeRaw?.author_note && (
            <div className="contents">
              <AkhaThemedLine theme="kitchen" />
              <RecipeSection sectionId="recipe_single_author_note" hideSubtitle={false}>
                <Card variant="glass" padding="md" rounded="2xl">
                  <Typography as="div" variant="paragraphM" color="muted" className="leading-relaxed italic [&_strong]:font-bold [&_em]:not-italic [&_a]:text-action [&_a]:font-bold hover:[&_a]:underline recipe-prose"
                    dangerouslySetInnerHTML={{ __html: sanitizeHtml(recipeRaw.author_note as string) }}
                  />
                </Card>
              </RecipeSection>
            </div>
          )}

          <AuthorBlock
            author={recipeRaw?.authors as Parameters<typeof AuthorBlock>[0]['author']}
            theme="kitchen"
          />

        </div>

        {/* FAQ + divider + sibling — gap:xl matches main's flex gap (mirrors News/History pattern) */}
        <div className="w-full flex flex-col [gap:var(--space-fluid-xl)]">
          <div className="w-full">
            <FaqBottomPage
              entityType="recipe"
              slug={slug}
            />
          </div>

          {(previous || next) && (
            <>
              <SiblingPostNav
                sectionId="sibiling_recipes"
                onOpen={(s) => onNavigate?.('recipes', undefined, s)}
                previous={previous ? {
                  title: previous.name as string,
                  subtitle: (previous.excerpt as string | null) || null,
                  imageUrl: ((previous.cover as Record<string, unknown>)?.image_url as string | null) ?? null,
                  href: `/recipes/${(previous.slug as string) || (previous.id as string)}`,
                  slug: (previous.slug as string) || (previous.id as string),
                } : null}
                next={next ? {
                  title: next.name as string,
                  subtitle: (next.excerpt as string | null) || null,
                  imageUrl: ((next.cover as Record<string, unknown>)?.image_url as string | null) ?? null,
                  href: `/recipes/${(next.slug as string) || (next.id as string)}`,
                  slug: (next.slug as string) || (next.id as string),
                } : null}
              />
            </>
          )}
        </div>

      </article>

      <GalleryModal
        isOpen={isGalleryOpen}
        onClose={() => setIsGalleryOpen(false)}
        items={galleryModalItems}
        startIndex={galleryStartIndex}
      />

      <GalleryModal
        isOpen={isCultureGalleryOpen}
        onClose={() => setIsCultureGalleryOpen(false)}
        items={cultureModalItems}
        startIndex={cultureGalleryStartIndex}
      />

      <IngredientModal
        isOpen={isIngredientModalOpen}
        onClose={() => setIsIngredientModalOpen(false)}
        items={richIngredients}
        startIndex={ingredientStartIndex}
      />

    </PageLayout>
  );
};

export default RecipeSinglePage;
