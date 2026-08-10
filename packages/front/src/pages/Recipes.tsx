import React, { useState, useMemo, useRef } from 'react';
import { t } from '@thaiakha/shared/lib/ui-strings';

import { useRecipesListData } from '../hooks/useRecipesListData';
import { PageLayout, HeaderMenu, SmartHeaderSection, SiblingInfoSection, PageEssentials } from '../components/layout';
import { MegaMenu, MegaMenuCard, RecipeCategory } from '../components/recipes';
import { Typography, Alert, AkhaThemedLine, FaqBottomPage } from '../components/ui';
import { MenuCard } from '../components/menu/index';
import { mapToRecipeData } from '../lib/recipeHelpers';
import { adaptRecipeToDiet, RawKeyIngredient } from '../lib/recipeAdapter';
import { cn } from '@thaiakha/shared/lib/utils';
import { UserProfile } from '../services/auth.service';
import { useDietaryKnowledge } from '../hooks/useDietaryKnowledge';
import { useUserPassport } from '../hooks/useUserPassport';



interface RecipesPageProps {
  onNavigate?: (targetPage: string, topic?: string, sectionId?: string) => void;
  userProfile: UserProfile | null;
  onProfileUpdate?: () => void;
}


const RecipesPage: React.FC<RecipesPageProps> = ({ userProfile, onNavigate, onProfileUpdate }) => {
  const { categories, recipes, spicinessLevels, loading } = useRecipesListData();
  const { profiles: dietProfiles, getAllergyProfiles, loading: knowledgeLoading } = useDietaryKnowledge();
  const { passport, updatePassport, hasExplicitPassport } = useUserPassport(userProfile, onProfileUpdate);

  const [isDietDirty, setIsDietDirty] = useState(false);
  const closeMegaMenuRef = useRef<(() => void) | null>(null);
  const openMegaMenuRef = useRef<(() => void) | null>(null);


  const allergyOptions = useMemo(() => {
    return getAllergyProfiles().map(ak => {
      // id is now 'allergy_peanuts' (underscore, canonical DB id)
      const key = ak.id.replace('allergy_', '').replace(/_/g, ' ');
      return key.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
    });
  }, [dietProfiles]);

  const activeProfileData = useMemo(() => {
    if (!passport.dietary_profile) return {
      id: '',
      name: t.recipes.defaultDietName,
      icon: 'restaurant',
      description: t.recipes.defaultDietDesc,
      substitutions: []
    } as any;

    return dietProfiles.find(p => p.id === passport.dietary_profile) || {
      id: 'diet_regular',
      name: t.recipes.regularDietName,
      icon: 'restaurant',
      description: t.recipes.regularDietDesc,
      substitutions: []
    } as any;
  }, [passport.dietary_profile, dietProfiles]);

  const groupedDiets = useMemo(() => ({
    lifestyle: dietProfiles.filter(p => p.type !== 'religious'),
    culture: dietProfiles.filter(p => p.type === 'religious')
  }), [dietProfiles]);

  const handleConfirm = async (diet: string, allergies: string[], spiciness?: string | number) => {
    closeMegaMenuRef.current?.();

    await updatePassport({
      dietary_profile: diet,
      allergies,
      preferred_spiciness_id: typeof spiciness === 'string' ? parseInt(spiciness) : spiciness
    });
  };

  const handleSelectRecipe = (rawRecipe: any) => {
    if (onNavigate) {
      onNavigate('recipes', undefined, rawRecipe.slug || rawRecipe.id);
    }
  };

  const getGridConfig = (count: number) => {
    if (count === 2) return { container: "flex flex-wrap justify-center [gap:var(--space-fluid-l)]", item: "w-full md:w-[calc(50%-2rem)] lg:w-[calc(33.33%-3rem)]" };
    if (count === 3) return { container: "grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 [gap:var(--space-fluid-l)]", item: "" };
    if (count === 4) return { container: "grid grid-cols-2 md:grid-cols-2 lg:grid-cols-2 [gap:var(--space-fluid-l)] max-w-4xl mx-auto", item: "" };
    return { container: "grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 [gap:var(--space-fluid-l)]", item: "" };
  };



  const dietContent = (
    <MegaMenuCard
      initialDiet={passport.dietary_profile}
      initialAllergies={passport.allergies}
      initialSpiciness={passport.preferred_spiciness_id}
      allergyOptions={allergyOptions}
      groupedDiets={groupedDiets}
      spicinessOptions={spicinessLevels}
      onConfirm={handleConfirm}
      onDirtyChange={setIsDietDirty}
      onClose={() => closeMegaMenuRef.current?.()}
    />
  );

  const hasAlerts = hasExplicitPassport && (!!passport.dietary_profile || passport.allergies.length > 0);

  const headerDescription = hasExplicitPassport
    ? t.recipes.headerDescReady({ diet: activeProfileData.name, allergies: passport.allergies })
    : undefined;

  return (
    <PageLayout slug="authentic-thai-akha-recipes" loading={loading || knowledgeLoading} showPatterns={true} hideDefaultHeader={true} customHeader={<HeaderMenu customSlug="authentic-thai-akha-recipes" descriptionOverride={headerDescription} />}>
      {/* SEO: interamente di SEOHead (globale, slug-based). Niente PageSEO qui. */}

      {/* MEGA MENU: PERSONALIZZAZIONE */}
      <MegaMenu
        variant="diet"
        title={hasExplicitPassport ? activeProfileData.name : t.recipes.selectDietLabel}
        subtitle={hasExplicitPassport ? t.recipes.activeProfile : t.recipes.personalize}
        icon={activeProfileData.icon}
        activeLabel={activeProfileData.name}
        activeCount={passport.allergies.length}
        customContent={dietContent}
        highlight={!hasExplicitPassport}
        onRegisterClose={(fn) => { closeMegaMenuRef.current = fn; }}
        onRegisterOpen={(fn) => { openMegaMenuRef.current = fn; }}
        onDietClick={(isNewOpening: boolean) => {
          if (isNewOpening) {
            setTimeout(() => {
              const el = document.getElementById('dietary-summary');
              el?.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }, 100);
          }
        }}
        disableOutsideClick={isDietDirty}
      />

      {/* DIETARY & ALLERGY SUMMARY (Anchor always present for MegaMenu scroll) */}
      <div id="dietary-summary" className="w-full max-w-2xl mx-auto [padding-inline:var(--space-fluid-s)] md:[padding-inline:0] scroll-mt-44 font-black">
        {hasAlerts && (
          <div className="animate-in fade-in slide-in-from-bottom-8 duration-700 flex flex-col [gap:var(--space-fluid-s)]">
            {/* Diet Alert */}
            {passport.dietary_profile && (
              <Alert
                variant="warning"
                title={activeProfileData.name}
                icon={activeProfileData.icon}
                message={activeProfileData.description || t.recipes.dietAdapted({ name: activeProfileData.name })}
                body={activeProfileData.experience}
              />
            )}

            {/* Allergy Alert */}
            {passport.allergies.length > 0 && (
              <Alert
                variant="error"
                icon="health_and_safety"
                title={t.recipes.allergyAlertTitle}
                subtitle={passport.allergies.join(' / ')}
                message={t.recipes.allergyAlertBody}
              />
            )}
          </div>
        )}
      </div>

      {!hasExplicitPassport && (
        <div className="[margin-top:var(--space-fluid-xl)] [margin-bottom:var(--space-fluid-xl)] min-h-[35vh] flex items-center justify-center">
          <div className="text-center flex flex-col items-center [gap:var(--space-fluid-m)]">
            <Typography variant="display2" className="text-title uppercase leading-tight">
              {t.recipes.selectPrompt.split('\n').map((line, i) => (
                <React.Fragment key={i}>
                  {line}
                  {i < t.recipes.selectPrompt.split('\n').length - 1 && <br />}
                </React.Fragment>
              ))}
            </Typography>
            <Typography variant="body" className="text-desc max-w-sm">
              {t.recipes.defaultDietDesc}
            </Typography>
            <button
              onClick={() => openMegaMenuRef.current?.()}
              className="[margin-top:var(--space-fluid-xs)] inline-flex items-center [gap:var(--space-fluid-2xs)] [padding-block:var(--space-fluid-xs)] [padding-inline:var(--space-fluid-m)] rounded-full bg-title text-inverse font-semibold transition-opacity hover:opacity-80 active:opacity-70"
            >
              <span className="material-symbols-rounded text-[1.1em]">tune</span>
              {t.recipes.personalize}
            </button>
          </div>
        </div>
      )}

      {/* LISTA RICETTE */}
      <div className="w-full min-h-[50vh] flex flex-col [gap:var(--space-fluid-xl)]">
        {hasExplicitPassport && passport.dietary_profile && categories.map((cat, idx) => {
          const catRecipes = recipes.filter(r => r.category === cat.id);
          if (catRecipes.length === 0) return null;
          const gridConfig = getGridConfig(catRecipes.length);

          // Immagini del modal gallery categoria: cover di ogni ricetta (join cover:media_assets).
          const catGalleryItems = catRecipes
            .map((r: any) => ({
              asset_id: r.cover?.asset_id as string | undefined,
              image_url: (r.cover?.image_url || '') as string,
              title: (r.name || '') as string,
            }))
            .filter(g => g.image_url);

          return (
            <React.Fragment key={cat.id}>
              <section className="animate-fade-slide-up scroll-mt-40 flex flex-col [gap:var(--space-fluid-l)]" id={cat.id} style={{ animationDelay: `${idx * 100}ms` }}>
                <SmartHeaderSection
                  sectionId={`recipe-${String(idx + 2).padStart(2, '0')}`}
                  variant="section"
                  align="center"
                />

                {/* Blocco categoria — prima delle schede ricette */}
                <RecipeCategory cat={cat} activeDiet={passport.dietary_profile} galleryItems={catGalleryItems} />

                {/* Schede ricette */}
                <div className={cn(gridConfig.container)}>
                  {catRecipes.map((rawRecipe) => {
                    const r = mapToRecipeData(rawRecipe);
                    const displayLabel = passport.dietary_profile === 'diet_regular' ? 'ORIGINAL' : passport.dietary_profile.replace('diet_', '').toUpperCase();
                    const rki = (rawRecipe.recipe_key_ingredients as RawKeyIngredient[]) || [];
                    const preview = adaptRecipeToDiet(r, passport.dietary_profile, passport.allergies, dietProfiles, rki);

                    return (
                      <div className={gridConfig.item || ""} key={r.id}>
                        <MenuCard
                          dish={preview}
                          isSelected={false}
                          dietLabel={displayLabel}
                          disableBodyCursor={true}
                          href={`/authentic-thai-akha-recipes/${rawRecipe.slug || rawRecipe.id}`}
                          onClick={() => handleSelectRecipe(rawRecipe)}
                          onPreview={() => handleSelectRecipe(rawRecipe)}
                        />
                      </div>
                    );
                  })}
                </div>

                {/* Chef's Secrets — card sotto la griglia ricette */}
                {cat.chef_secrets && cat.chef_secrets.length > 0 && (
                  <div className="flex flex-col [gap:var(--space-fluid-xs)] [padding:var(--space-fluid-m)] rounded-2xl bg-surface border border-border/60">
                    <div className="flex items-center [gap:var(--space-fluid-xs)]">
                      <span className="material-symbols-rounded text-primary/60 text-xl">restaurant</span>
                      <Typography variant="caption" color="muted" className="uppercase tracking-widest font-bold">Chef's Secrets</Typography>
                    </div>
                    <ul className="grid grid-cols-1 md:grid-cols-2 [gap:var(--space-fluid-xs)]">
                      {(cat.chef_secrets as string[]).map((secret, idx) => (
                        <li key={idx} className="flex items-start [gap:var(--space-fluid-xs)]">
                          <span className="material-symbols-rounded text-primary/30 text-sm mt-0.5 flex-shrink-0">chevron_right</span>
                          <Typography variant="paragraphS" color="muted" className="leading-relaxed">{secret}</Typography>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </section>

              {/* Divider tra sezioni */}
              {idx < categories.length - 1 && (
                <div className="opacity-80">
                  <AkhaThemedLine theme="kitchen" />
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>

      {/* PageEssentials: facts, references, author note — always rendered for SEO crawlers */}
      <PageEssentials
        slug="authentic-thai-akha-recipes"
      />

      {/* FaqBottomPage: always rendered (not gated on dietary_profile) — visible to crawlers */}
      <FaqBottomPage
        slug="authentic-thai-akha-recipes"
        onNavigate={onNavigate as any}
      />

      <SiblingInfoSection
        currentSlug="authentic-thai-akha-recipes"
        onNavigate={onNavigate as any}
        sectionId="sibiling_info"
      />
    </PageLayout>
  );
};

export default RecipesPage;