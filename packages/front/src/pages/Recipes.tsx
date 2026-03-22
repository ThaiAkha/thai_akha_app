import React, { useState, useEffect, useMemo, useRef } from 'react';
import { supabase } from '@thaiakha/shared/lib/supabase';
import { PageLayout, HeaderMenu, SmartHeaderSection } from '../components/layout/index';
import { MegaMenu, MegaMenuCard } from '../components/recipes/index';
import { Typography, Chip, MediaImage, Alert, AkhaPixelLine, AudioPlayer } from '../components/ui/index';
import { MenuCard, RecipeView, RecipeData } from '../components/menu/index';
import { mapToRecipeData } from '../lib/recipeHelpers';
import { adaptRecipeToDiet } from '../lib/recipeAdapter';
import { cn } from '@thaiakha/shared/lib/utils';
import { RecipeCategoryDB } from '@thaiakha/shared';
import { UserProfile } from '../services/auth.service';
import { useDietaryKnowledge } from '../hooks/useDietaryKnowledge';



interface RecipesPageProps {
  onNavigate: (page: string) => void;
  userProfile: UserProfile | null;
}

const RecipesPage: React.FC<RecipesPageProps> = ({ userProfile }) => {
  const [loading, setLoading] = useState(true);

  const [categories, setCategories] = useState<RecipeCategoryDB[]>([]);
  const [recipes, setRecipes] = useState<any[]>([]);
  const { profiles: dietProfiles, allergies: allergyKnowledge, loading: knowledgeLoading } = useDietaryKnowledge();
  const [selectedRecipe, setSelectedRecipe] = useState<RecipeData | null>(null);

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
        const [catsRes, recipesRes] = await Promise.all([
          supabase.from('recipe_categories').select('*').order('display_order'),
          supabase.from('recipes').select('*, recipe_key_ingredients(ingredient)'),
        ]);

        if (catsRes.data) setCategories(catsRes.data);
        if (recipesRes.data) setRecipes(recipesRes.data);
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
      name: 'Your Diet Style',
      icon: 'restaurant',
      description: 'Choose your preference to personalize recipes.',
      substitutions: []
    } as any;

    return dietProfiles.find(p => p.id === activeDiet) || {
      id: 'diet_regular',
      name: 'Regular Diet',
      icon: 'restaurant',
      description: 'Standard authentic preparation.',
      substitutions: []
    } as any;
  }, [activeDiet, dietProfiles]);

  const groupedDiets = useMemo(() => ({
    lifestyle: dietProfiles.filter(p => p.type !== 'religious'),
    culture: dietProfiles.filter(p => p.type === 'religious')
  }), [dietProfiles]);

  const handleConfirm = (diet: string, allergies: string[]) => {
    setActiveDiet(diet);
    setActiveAllergies(allergies);
    setHasInteracted(true);
    closeMegaMenuRef.current?.();
  };

  const handleSelectRecipe = (rawRecipe: any) => {
    setSelectedRecipe(mapToRecipeData(rawRecipe));
  };

  const handleAskCherryDish = (dish: RecipeData) => {
    const topic = `Tell me about ${dish.name} for a ${activeDiet.replace('diet_', '')} diet considering my allergies: ${activeAllergies.join(', ')} kha`;
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
      allergyOptions={allergyOptions}
      groupedDiets={groupedDiets}
      onConfirm={handleConfirm}
    />
  );

  if (selectedRecipe) {
    const adaptedRecipe = adaptRecipeToDiet(selectedRecipe, activeDiet, activeAllergies);
    const adaptedAllRecipes = recipes.map(r => adaptRecipeToDiet(mapToRecipeData(r), activeDiet, activeAllergies));
    const currentCategory = categories.find(c => c.id === selectedRecipe.category);

    return (
      <PageLayout slug="recipes" hideDefaultHeader={true} loading={false}>
        <RecipeView
          recipe={adaptedRecipe}
          allRecipes={adaptedAllRecipes}
          activeDiet={activeDiet.replace('diet_', '').toUpperCase()}
          categoryData={{ title: currentCategory?.title || 'Collection', description: currentCategory?.description || '', image: currentCategory?.image }}
          userAllergies={activeAllergies}
          onBack={() => setSelectedRecipe(null)}
          onSelectDish={(dish) => setSelectedRecipe(dish)}
        />
      </PageLayout>
    );
  }

  return (
    <PageLayout slug="recipes" loading={loading || knowledgeLoading} showPatterns={true} hideDefaultHeader={true} customHeader={<HeaderMenu customSlug="recipes" />}>

      {/* MEGA MENU: PERSONALIZZAZIONE */}
      <MegaMenu
        variant="diet"
        title={activeProfileData.name}
        subtitle={hasInteracted ? "Active Profile" : "Personalize"}
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
      <div id="dietary-summary" className="w-full max-w-2xl mx-auto mt-4 px-4 md:px-0 scroll-mt-44">
        {hasInteracted && (
          <div className="animate-in fade-in slide-in-from-bottom-8 duration-700 space-y-4">
            {/* Card 1: Dietary Note */}
            {activeDiet && (
              <Alert
                variant="warning"
                title={activeProfileData.name}
                icon={activeProfileData.icon}
                message={activeProfileData.description || `This menu has been adapted to follow ${activeProfileData.name} guidelines.`}
                body={activeProfileData.experience}
              />
            )}

            {/* Card 2: Allergy Alert */}
            {activeAllergies.length > 0 && (
              <Alert
                variant="error"
                title="Allergy Alert"
                subtitle={activeAllergies.join(' / ')}
                message="The recipes below have been filtered or modified to exclude your selected allergens. Always inform your chef about severe allergies."
              />
            )}
          </div>
        )}
      </div>

      {/* STUDENT PROMISE -> Dynamic Header 00 */}
      <div className="mt-10 mb-8">
        <SmartHeaderSection
          sectionId="recipe-00"
          variant="section"
          align="center"
          hideTitle={false}
          hideSubtitle={false}
          hideDivider={false}
          hideDescription={false}
        />
      </div>

      <AkhaPixelLine />

      {!activeDiet && (
        <div className="mt-16 min-h-[35vh] flex items-center justify-center">
          <div className="text-center px-8 select-none pointer-events-none">
            <Typography
              variant="display1"
              className="text-title/[0.2] dark:text-white/[0.2] uppercase leading-tight"
            >
              Select your<br />diet style before<br />viewing the content
            </Typography>
          </div>
        </div>
      )}

      {/* LISTA RICETTE */}
      <div className="w-full min-h-[50vh] space-y-16">
        {activeDiet && categories.map((cat, idx) => {
          const catRecipes = recipes.filter(r => r.category === cat.id);
          if (catRecipes.length === 0) return null;
          const gridConfig = getGridConfig(catRecipes.length);

          return (
            <React.Fragment key={cat.id}>
              <section className="animate-fade-slide-up scroll-mt-40 space-y-12" id={cat.id} style={{ animationDelay: `${idx * 100}ms` }}>
                <SmartHeaderSection
                  sectionId={`recipe-${String(idx + 1).padStart(2, '0')}`}
                  variant="section"
                  align="center"
                />

                <div className={cn(gridConfig.container, "mb-16")}>
                  {catRecipes.map((rawRecipe) => {
                    const r = mapToRecipeData(rawRecipe);
                    const displayLabel = activeDiet === 'diet_regular' ? 'ORIGINAL' : activeDiet.replace('diet_', '').toUpperCase();
                    const preview = adaptRecipeToDiet(r, activeDiet, activeAllergies);

                    return (
                      <div className={gridConfig.item || ""} key={r.id}>
                        <MenuCard
                          dish={{ ...preview, colorTheme: r.colorTheme || '#ED5565', image: r.image }}
                          isSelected={false}
                          actionLabel="View Recipe"
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

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16 items-start">
                  <div className="lg:col-span-5 flex flex-col gap-6 relative lg:sticky lg:top-32">
                    <div className="relative aspect-video rounded-[2.5rem] overflow-hidden border border-border shadow-2xl group">
                      <MediaImage
                        url={cat.image || ""}
                        fallbackAlt={cat.title}
                        showCaption={false}
                        imgClassName="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
                    </div>
                    <AudioPlayer categoryId={cat.id} className="w-full" />
                  </div>
                  <div className="lg:col-span-7">
                    <div className="h-full p-8 md:p-12 rounded-[3rem] bg-surface border border-border flex flex-col gap-10 shadow-inner">
                      {cat.ui_quote && <Typography variant="quote" className="text-2xl md:text-3xl text-gray-900 dark:text-gray-100 opacity-90 border-primary pl-8 py-4">"{cat.ui_quote}"</Typography>}
                      <div className="space-y-6">
                        <Typography variant="paragraphM" className="text-desc/90 whitespace-pre-wrap leading-relaxed text-lg font-light text-left">
                          {cat.content_body || cat.description}
                        </Typography>
                      </div>
                      {cat.keywords && cat.keywords.length > 0 && (
                        <div className="flex flex-wrap gap-2 pt-6 border-t border-border">
                          {cat.keywords.map((kw, kIdx) => (
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