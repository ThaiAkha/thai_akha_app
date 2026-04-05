import React, { useState, useEffect, useMemo, useRef } from 'react';
import { supabase } from '@thaiakha/shared/lib/supabase';
import { t } from '@thaiakha/shared/lib/ui-strings';
import { contentService } from '@thaiakha/shared/services';
import { PageLayout, HeaderMenu, SmartHeaderSection } from '../components/layout/index';
import { MegaMenu, MegaMenuCard } from '../components/recipes/index';
import { Typography, Chip, MediaImage, Alert, AkhaPixelLine, AudioPlayer } from '../components/ui/index';
import { MenuCard, RecipeData } from '../components/menu/index';
import { mapToRecipeData } from '../lib/recipeHelpers';
import { adaptRecipeToDiet } from '../lib/recipeAdapter';
import { cn } from '@thaiakha/shared/lib/utils';
import { ContentCategoryDB } from '@thaiakha/shared';
import { UserProfile, authService } from '../services/auth.service';
import { useDietaryKnowledge } from '../hooks/useDietaryKnowledge';



interface RecipesPageProps {
  onNavigate?: (targetPage: string, topic?: string, sectionId?: string) => void;
  userProfile: UserProfile | null;
  onProfileUpdate?: () => void;
}

const RecipesPage: React.FC<RecipesPageProps> = ({ userProfile, onNavigate, onProfileUpdate }) => {
  const [loading, setLoading] = useState(true);
  const [spicinessLevels, setSpicinessLevels] = useState<any[]>([]);

  const [categories, setCategories] = useState<ContentCategoryDB[]>([]);
  const [recipes, setRecipes] = useState<any[]>([]);
  const { profiles: dietProfiles, allergies: allergyKnowledge, loading: knowledgeLoading } = useDietaryKnowledge();

  const [activeDiet, setActiveDiet] = useState('');
  const [activeAllergies, setActiveAllergies] = useState<string[]>([]);
  const [hasInteracted, setHasInteracted] = useState(false);
  const closeMegaMenuRef = useRef<(() => void) | null>(null);


  const allergyOptions = useMemo(() => {
    return allergyKnowledge.map(ak =>
      ak.allergy_key.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')
    );
  }, [allergyKnowledge]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [cats, recipesRes, spiceData] = await Promise.all([
          contentService.getContentCategories('recipe'),
          contentService.getAllRecipesFull(),
          contentService.getSpicinessLevels(),
        ]);

        setCategories(cats);
        if (recipesRes) setRecipes(recipesRes);
        setSpicinessLevels(spiceData);
      } catch (e) {
        console.error("Error fetching recipes:", e);
      } finally {
        setTimeout(() => setLoading(false), 600);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    if (userProfile?.dietary_profile) {
      setActiveDiet(userProfile.dietary_profile);
      setHasInteracted(true);
    }
    if (userProfile?.allergies && userProfile.allergies.length > 0) {
      setActiveAllergies(userProfile.allergies);
    }
  }, [userProfile]);

  const activeProfileData = useMemo(() => {
    if (!activeDiet) return {
      id: '',
      name: t.recipes.defaultDietName,
      icon: 'restaurant',
      description: t.recipes.defaultDietDesc,
      substitutions: []
    } as any;

    return dietProfiles.find(p => p.id === activeDiet) || {
      id: 'diet_regular',
      name: t.recipes.regularDietName,
      icon: 'restaurant',
      description: t.recipes.regularDietDesc,
      substitutions: []
    } as any;
  }, [activeDiet, dietProfiles]);

  const groupedDiets = useMemo(() => ({
    lifestyle: dietProfiles.filter(p => p.type !== 'religious'),
    culture: dietProfiles.filter(p => p.type === 'religious')
  }), [dietProfiles]);

  const handleConfirm = async (diet: string, allergies: string[], spiciness?: string | number) => {
    setActiveDiet(diet);
    setActiveAllergies(allergies);
    setHasInteracted(true);
    closeMegaMenuRef.current?.();

    // Persist to user profile if logged in
    if (userProfile?.id && userProfile.id !== 'guest') {
      try {
        await authService.updateProfile(userProfile.id, {
          dietary_profile: diet,
          allergies: allergies,
          preferred_spiciness_id: typeof spiciness === 'string' ? parseInt(spiciness) : spiciness
        });
        
        // Notify parent (App.tsx) to refresh global state
        onProfileUpdate?.();
      } catch (err) {
        console.error("Error persisting profile updates:", err);
      }
    } else {
      // GUEST: Save to localStorage
      localStorage.setItem('guest_diet', diet);
      localStorage.setItem('guest_allergies', JSON.stringify(allergies));
      if (spiciness) localStorage.setItem('guest_spiciness', spiciness.toString());
      
      // Notify parent to refresh "Virtual Profile"
      onProfileUpdate?.();
    }
  };

  const handleSelectRecipe = (rawRecipe: any) => {
    if (onNavigate) {
      onNavigate('recipes', undefined, rawRecipe.slug || rawRecipe.id);
    }
  };

  const handleAskCherryDish = (dish: RecipeData) => {
    const topic = t.recipes.askCherryDish({
      name: dish.name,
      diet: activeDiet.replace('diet_', ''),
      allergies: activeAllergies.join(', ')
    });
    window.dispatchEvent(new CustomEvent('trigger-chat-topic', { detail: { topic } }));
  };

  const getGridConfig = (count: number) => {
    if (count === 2) return { container: "flex flex-wrap justify-center gap-6 lg:gap-12", item: "w-full md:w-[calc(50%-2rem)] lg:w-[calc(33.33%-3rem)]" };
    if (count === 4) return { container: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6 lg:gap-12 max-w-4xl mx-auto", item: "" };
    return { container: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-12", item: "" };
  };



  const dietContent = (
    <MegaMenuCard
      initialDiet={activeDiet}
      initialAllergies={activeAllergies}
      initialSpiciness={userProfile?.preferred_spiciness_id}
      allergyOptions={allergyOptions}
      groupedDiets={groupedDiets}
      spicinessOptions={spicinessLevels}
      onConfirm={handleConfirm}
    />
  );

  const hasAlerts = hasInteracted && (!!activeDiet || activeAllergies.length > 0);

  return (
    <PageLayout slug="recipes" loading={loading || knowledgeLoading} showPatterns={true} hideDefaultHeader={true} customHeader={<HeaderMenu customSlug="recipes" />}>

      {/* MEGA MENU: PERSONALIZZAZIONE */}
      <div className="h-[var(--space-fluid-s)]" />
      <MegaMenu
        variant="diet"
        title={activeProfileData.name}
        subtitle={hasInteracted ? t.recipes.activeProfile : t.recipes.personalize}
        icon={activeProfileData.icon}
        activeLabel={activeProfileData.name}
        activeCount={activeAllergies.length}
        customContent={dietContent}
        highlight={!hasInteracted}
        onRegisterClose={(fn) => { closeMegaMenuRef.current = fn; }}
        onDietClick={(isNewOpening: boolean) => {
          if (isNewOpening) {
            setTimeout(() => {
              const el = document.getElementById('dietary-summary');
              el?.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }, 100);
          }
        }}
        onAllergyClick={(isNewOpening: boolean) => {
          if (isNewOpening) {
            setTimeout(() => {
              const el = document.getElementById('dietary-summary');
              el?.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }, 100);
          }
        }}
      />

      {/* DIETARY & ALLERGY SUMMARY (Anchor always present for MegaMenu scroll) */}
      <div id="dietary-summary" className="w-full max-w-2xl mx-auto [margin-top:var(--space-fluid-xs)] [padding-inline:var(--space-fluid-s)] md:[padding-inline:0] scroll-mt-44 font-black">
        {hasAlerts && (
          <div className="animate-in fade-in slide-in-from-bottom-8 duration-700 flex flex-col [gap:var(--space-fluid-s)] [margin-bottom:var(--space-fluid-m)]">
            {/* Diet Alert */}
            {activeDiet && (
              <Alert
                variant="warning"
                title={activeProfileData.name}
                icon={activeProfileData.icon}
                message={activeProfileData.description || t.recipes.dietAdapted({ name: activeProfileData.name })}
                body={activeProfileData.experience}
              />
            )}

            {/* Allergy Alert */}
            {activeAllergies.length > 0 && (
              <Alert
                variant="error"
                icon="health_and_safety"
                title={t.recipes.allergyAlertTitle}
                subtitle={activeAllergies.join(' / ')}
                message={t.recipes.allergyAlertBody}
              />
            )}
          </div>
        )}
      </div>

      {/* STUDENT PROMISE -> Dynamic Header 00/01 */}
      <div className={cn(
        "[margin-bottom:var(--space-fluid-m)]",
        hasAlerts ? "[margin-top:var(--space-fluid-m)]" : "[margin-top:var(--space-fluid-s)]"
      )}>
        <SmartHeaderSection
          sectionId={hasInteracted ? "recipe-01" : "recipe-00"}
          variant="hero"
          align="center"
          hideTitle={false}
          hideSubtitle={false}
          hideDivider={false}
          hideDescription={false}
        />
      </div>

      <AkhaPixelLine />

      {!activeDiet && (
        <div className="[margin-top:var(--space-fluid-xl)] min-h-[35vh] flex items-center justify-center">
          <div className="text-center [padding-inline:var(--space-fluid-m)] select-none pointer-events-none">
            <Typography
              variant="display2"
              className="opacity-20 uppercase leading-tight"
            >
              {t.recipes.selectPrompt.split('\n').map((line, i) => (
                <React.Fragment key={i}>
                  {line}
                  {i < t.recipes.selectPrompt.split('\n').length - 1 && <br />}
                </React.Fragment>
              ))}
            </Typography>
          </div>
        </div>
      )}

      {/* LISTA RICETTE */}
      <div className="w-full min-h-[50vh] flex flex-col [gap:var(--space-fluid-xl)]">
        {activeDiet && categories.map((cat, idx) => {
          const catRecipes = recipes.filter(r => r.category === cat.id);
          if (catRecipes.length === 0) return null;
          const gridConfig = getGridConfig(catRecipes.length);

          return (
            <React.Fragment key={cat.id}>
              <section className="animate-fade-slide-up scroll-mt-40 flex flex-col [gap:var(--space-fluid-l)]" id={cat.id} style={{ animationDelay: `${idx * 100}ms` }}>
                <SmartHeaderSection
                  sectionId={`recipe-${String(idx + 2).padStart(2, '0')}`}
                  variant="section"
                  align="center"
                />

                <div className={cn(gridConfig.container, "[margin-bottom:var(--space-fluid-xl)]")}>
                  {catRecipes.map((rawRecipe) => {
                    const r = mapToRecipeData(rawRecipe);
                    const displayLabel = activeDiet === 'diet_regular' ? 'ORIGINAL' : activeDiet.replace('diet_', '').toUpperCase();
                    const preview = adaptRecipeToDiet(r, activeDiet, activeAllergies);

                    return (
                      <div className={gridConfig.item || ""} key={r.id}>
                        <MenuCard
                          dish={{ ...preview, colorTheme: r.colorTheme || '#ED5565', image: r.image }}
                          isSelected={false}
                          dietLabel={displayLabel}
                          disableBodyCursor={true}
                          onClick={() => handleSelectRecipe(rawRecipe)}
                          onPreview={() => handleSelectRecipe(rawRecipe)}
                          onAskCherry={() => handleAskCherryDish(r)}
                        />
                      </div>
                    );
                  })}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 [gap:var(--space-fluid-l)] lg:[gap:var(--space-fluid-xl)] items-start">
                  <div className="lg:col-span-5 flex flex-col [gap:var(--space-fluid-m)] relative lg:sticky lg:top-32">
                    <div className="relative aspect-video rounded-[2.5rem] overflow-hidden border border-border shadow-2xl group">
                      <MediaImage
                        url={cat.image_url || ""}
                        fallbackAlt={cat.title}
                        showCaption={false}
                        imgClassName="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
                    </div>
                    <AudioPlayer categoryId={cat.id} className="w-full" />
                  </div>
                  <div className="lg:col-span-7">
                    <div className="h-full [padding:var(--space-fluid-l)] md:[padding:var(--space-fluid-xl)] rounded-[3rem] bg-surface border border-border flex flex-col [gap:var(--space-fluid-xl)] shadow-inner">
                      {cat.ui_quote && (
                        <Typography variant="quote" className="text-2xl md:text-3xl text-title/90 border-primary [padding-left:var(--space-fluid-m)] [padding-block:var(--space-fluid-s)]">
                          "{cat.ui_quote}"
                        </Typography>
                      )}
                      <div className="flex flex-col [gap:var(--space-fluid-m)]">
                        <Typography variant="paragraphM" className="text-desc/90 whitespace-pre-wrap leading-relaxed text-lg font-light text-left">
                          {cat.content_body || cat.description}
                        </Typography>
                      </div>
                      {cat.seo_keywords && cat.seo_keywords.length > 0 && (
                        <div className="flex flex-wrap [gap:var(--space-fluid-2xs)] [padding-top:var(--space-fluid-m)] border-t border-border">
                          {cat.seo_keywords.map((kw, kIdx) => (
                            <Chip key={kIdx} label={kw} className="text-xs py-2 px-4 bg-background border-border hover:bg-surface" />
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </section>
              {idx < categories.length - 1 && <AkhaPixelLine />}
            </React.Fragment>
          );
        })}
      </div>
    </PageLayout>
  );
};

export default RecipesPage;