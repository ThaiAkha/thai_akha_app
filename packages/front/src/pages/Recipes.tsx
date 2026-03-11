import React, { useState, useEffect, useRef, useMemo } from 'react';
import { supabase } from '../lib/supabase';
import { PageLayout, MegaMenu, HeaderMenu } from '../components/layout/index';
import { Typography, Icon, Badge, Chip, Button, Toggle } from '../components/ui/index';
import { MenuCard, RecipeView, RecipeData } from '../components/menu/index';
import { mapToRecipeData } from '../lib/recipeHelpers';
import { adaptRecipeToDiet } from '../lib/recipeAdapter';
import AkhaPixelPattern from '../components/ui/AkhaPixelPattern';
import { useTextToSpeech } from '../hooks/useTextToSpeech';
import { cn } from '../lib/utils';
import { RecipeCategoryDB } from '../types/index';
import { UserProfile } from '../services/authService';
import { contentService } from '../services/contentService';

const ALLERGY_OPTIONS = ['Peanuts', 'Shellfish', 'Gluten', 'Soy', 'Eggs', 'Dairy', 'Sesame'];

interface RecipesPageProps {
  onNavigate: (page: string) => void;
  userProfile: UserProfile | null;
}

const RecipesPage: React.FC<RecipesPageProps> = ({ onNavigate, userProfile }) => {
  const [loading, setLoading] = useState(true);
  
  const [categories, setCategories] = useState<RecipeCategoryDB[]>([]);
  const [recipes, setRecipes] = useState<any[]>([]);
  const [dietProfiles, setDietProfiles] = useState<any[]>([]);

  const [selectedRecipe, setSelectedRecipe] = useState<RecipeData | null>(null);
  
  const [activeDiet, setActiveDiet] = useState('diet_regular');
  const [activeAllergies, setActiveAllergies] = useState<string[]>([]);
  const [showAllergySection, setShowAllergySection] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);

  const { speak, cancel } = useTextToSpeech();
  const [activeAudioId, setActiveAudioId] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [catsRes, recipesRes, profiles] = await Promise.all([
          supabase.from('recipe_categories').select('*').order('display_order'),
          supabase.from('recipes').select('*, recipe_key_ingredients(ingredient)'),
          contentService.getDietaryProfiles()
        ]);

        if (catsRes.data) setCategories(catsRes.data);
        if (recipesRes.data) setRecipes(recipesRes.data);
        if (profiles) setDietProfiles(profiles);
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
      setShowAllergySection(true);
    }
  }, [userProfile]);

  const activeProfileData = useMemo(() => {
    return dietProfiles.find(p => p.id === activeDiet) || {
      name: 'Regular Diet',
      icon: '🍽️',
      description: 'Standard authentic preparation.'
    };
  }, [activeDiet, dietProfiles]);

  const groupedDiets = useMemo(() => ({
    lifestyle: dietProfiles.filter(p => p.type !== 'religious'),
    culture: dietProfiles.filter(p => p.type === 'religious')
  }), [dietProfiles]);

  const toggleAllergy = (allergen: string) => {
    setActiveAllergies(prev => prev.includes(allergen) ? prev.filter(a => a !== allergen) : [...prev, allergen]);
    setHasInteracted(true);
  };

  const handleAllergySwitch = (val: boolean) => {
    setShowAllergySection(val);
    if (!val) setActiveAllergies([]);
  };

  const handleDietSelect = (dietId: string) => {
    setActiveDiet(dietId);
    setHasInteracted(true);
  };

  const handleSelectRecipe = (rawRecipe: any) => {
    setSelectedRecipe(mapToRecipeData(rawRecipe));
  };

  const handleAskCherryDish = (dish: RecipeData) => {
    const topic = `Tell me about ${dish.name} for a ${activeDiet.replace('diet_', '')} diet considering my allergies: ${activeAllergies.join(', ')} kha`;
    window.dispatchEvent(new CustomEvent('trigger-chat-topic', { detail: { topic } }));
  };

  const handlePlayAudio = (cat: RecipeCategoryDB) => {
    if (activeAudioId === cat.id) {
      if (audioRef.current) audioRef.current.pause();
      cancel();
      setActiveAudioId(null);
      return;
    }
    setActiveAudioId(cat.id);
    if (cat.audio_story_url && audioRef.current) {
      audioRef.current.src = cat.audio_story_url;
      audioRef.current.play();
    } else {
      speak(`${cat.title}. ${cat.description}`);
    }
  };

  const getGridConfig = (count: number) => {
    if (count === 2) return { container: "flex flex-wrap justify-center gap-6 lg:gap-12", item: "w-full md:w-[calc(50%-2rem)] lg:w-[calc(33.33%-3rem)]" };
    if (count === 4) return { container: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6 lg:gap-12 max-w-4xl mx-auto", item: "" };
    return { container: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-12", item: "" };
  };

  const dietContent = (
    <div className="space-y-6"> 
        <div className="space-y-3 pb-8 border-b border-white/10">
           <div className="flex justify-between items-center pl-2">
              <div className="flex items-center gap-3">
                <span className="text-md font-black uppercase tracking-[0.2em] text-desc/60 dark:text-white/30">
                   Allergies?
                </span>
                {activeAllergies.length > 0 && (
                  <Icon name="warning" size="md" className="text-allergy animate-pulse mb-0.5"/>
                )}
              </div>
              <Toggle checked={showAllergySection} onChange={handleAllergySwitch} />
           </div>

           {showAllergySection && (
              <div className="grid grid-cols-3 md-grid-cols-3 gap-3 animate-in fade-in slide-in-from-top-2 duration-300">
                {ALLERGY_OPTIONS.map((allergen) => {
                  const isActive = activeAllergies.includes(allergen);
                  return (
                    <Badge 
                        key={allergen}
                        variant="allergy" 
                        active={isActive}
                        onClick={() => toggleAllergy(allergen)}
                        className="w-full justify-start p-3"
                    >
                        {allergen}
                    </Badge>
                  )
                })}
              </div>
           )}
        </div>

        <div className="grid grid-cols-2 gap-3">
           <div className="space-y-3">
              <span className="text-md font-black uppercase tracking-[0.2em] text-desc/60 dark:text-white/30 pl-2">Lifestyle:</span>
              <div className="grid grid-cols-1 gap-3">
                {groupedDiets.lifestyle.map((diet) => (
                  <button key={diet.id} onClick={() => handleDietSelect(diet.id)} 
                    className={cn(
                      "w-full flex items-center gap-2 p-2 rounded-xl transition-all border group",
                      activeDiet === diet.id 
                        ? "bg-white dark:bg-white text-black border-black/10 dark:border-white shadow-md" 
                        : "bg-white/50 dark:bg-white/5 text-desc/60 dark:text-white/60 border-transparent hover:bg-white dark:hover:bg-white/10"
                    )}>
                    <span className="text-2xl filter drop-shadow-sm">{diet.icon}</span>
                    <span className="font-bold text-md uppercase tracking-tight truncate">{diet.name}</span>
                    {activeDiet === diet.id && <Icon name="check_circle" className="ml-auto text-action" size="md"/>}
                  </button>
                ))}
              </div>
           </div>

           <div className="space-y-3">
              <span className="text-md font-black uppercase tracking-[0.2em] text-desc/60 dark:text-white/30 pl-2">Cultural:</span>
              <div className="grid grid-cols-1 gap-3">
                {groupedDiets.culture.map((diet) => (
                  <button key={diet.id} onClick={() => handleDietSelect(diet.id)} 
                    className={cn(
                      "w-full flex items-center gap-2 p-2 rounded-xl transition-all border group",
                      activeDiet === diet.id 
                        ? "bg-white dark:bg-white text-black border-black/10 dark:border-white shadow-md" 
                        : "bg-white/50 dark:bg-white/5 text-desc/60 dark:text-white/60 border-transparent hover:bg-white dark:hover:bg-white/10"
                    )}>
                    <span className="text-2xl filter drop-shadow-sm">{diet.icon}</span>
                    <span className="font-bold text-md uppercase tracking-tight truncate">{diet.name}</span>
                    {activeDiet === diet.id && <Icon name="check_circle" className="ml-auto text-action" size="md"/>}
                  </button>
                ))}
              </div>
           </div>
        </div>
    </div>
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
    <PageLayout slug="recipes" loading={loading} showPatterns={true} hideDefaultHeader={true} customHeader={<HeaderMenu customSlug="recipes" />}>
      <audio ref={audioRef} className="hidden" />

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
        className="mb-6"
      />

      {/* IDENTITY CARD (Setup Your Profile) */}
      <div className="w-full max-w-2xl mx-auto mt-4 animate-in fade-in slide-in-from-top-1 duration-500 px-4 md:px-0">
        <div className="bg-[#121212] border-2 border-white/10 rounded-[2rem] p-8 shadow-2xl flex flex-col md:flex-row items-center gap-8 relative overflow-hidden group hover:border-action/30 transition-all">
          <div className="absolute top-0 right-0 w-32 h-32 bg-action/5 rounded-full blur-3xl pointer-events-none" />
          <div className="size-20 rounded-2xl bg-white/5 flex items-center justify-center border border-white/10 shrink-0 shadow-inner group-hover:scale-105 transition-transform">
             <Icon name="tune" size="xl" className="text-white/20"/>
          </div>
          <div className="text-center md:text-left flex-1">
            <Typography variant="h4" className="text-white italic mb-2 uppercase tracking-tight">Setup Your Profile</Typography>
            <p className="text-white/50 text-sm leading-relaxed font-medium">Customize ingredients and exclude allergens to tailor the entire menu to your needs.</p>
          </div>
        </div>
      </div>

      {/* STUDENT PROMISE CON GRADIENTE */}
      <div className="w-full max-w-4xl mx-auto text-center px-6 mt-24 mb-16 space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-200">
         <Typography variant="h6" className="text-desc/60 uppercase tracking-[0.2em] text-xs md:text-sm font-bold">
            For every student attending our
         </Typography>
         
         <div className="flex items-center gap-4 justify-center">
            <Typography variant="display2" className="text-3xl md:text-6xl lg:text-7xl text-title drop-shadow-xl uppercase italic">
              Cooking Class
            </Typography>
         </div>

         <div className="max-w-2xl mx-auto">
            <Typography variant="paragraphL" className="text-desc font-medium leading-relaxed text-xl">
               we offer an opportunity to <br className="hidden md:block"/>
               learn and make <span className="text-title font-black underline decoration-[#ccff33] decoration-4">10 Dishes + 1 Curry Paste</span>
            </Typography>
         </div>
      </div>

      {/* CATEGORIA HEADER DINAMICO (AKHA TRADITIONAL) */}
      <div className="w-full text-center mt-32 mb-16 space-y-4">
        <Typography variant="display2" className="text-4xl md:text-6xl text-title uppercase italic tracking-tighter">
          Akha Traditional
        </Typography>
        <div className="opacity-60"><AkhaPixelPattern variant="line_simple" size={8} speed={25} expandFromCenter={true} className="gap-2 mx-auto" /></div>
      </div>

      {/* LISTA RICETTE */}
      <div className="w-full min-h-[50vh] space-y-32"> 
        {categories.map((cat, idx) => {
          const catRecipes = recipes.filter(r => r.category === cat.id);
          if (catRecipes.length === 0) return null;
          const isPlaying = activeAudioId === cat.id;
          const gridConfig = getGridConfig(catRecipes.length);

          return (
            <section key={cat.id} className="animate-fade-slide-up scroll-mt-40" id={cat.id} style={{ animationDelay: `${idx * 100}ms` }}>
              <div className={cn(gridConfig.container, "mb-16")}>
                {catRecipes.map((rawRecipe) => {
                  const r = mapToRecipeData(rawRecipe);
                  const displayLabel = activeDiet === 'diet_regular' ? 'ORIGINAL' : activeDiet.replace('diet_', '').toUpperCase();
                  const preview = adaptRecipeToDiet(r, activeDiet, activeAllergies);

                  return (
                    <div className={gridConfig.item || ""} key={r.id}>
                      <MenuCard
                        dish={{...preview, colorTheme: r.colorTheme || '#ED5565', image: r.image}}
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
                    <img src={cat.image || ""} alt={cat.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
                    {cat.icon_name && (
                      <div className="absolute top-4 left-4 size-12 rounded-2xl bg-black/40 backdrop-blur-md border border-white/10 flex items-center justify-center text-white shadow-lg"><Icon name={cat.icon_name} size="md" /></div>
                    )}
                  </div>
                  <button onClick={() => handlePlayAudio(cat)} className={cn("flex items-center gap-5 p-5 rounded-[2rem] border transition-all duration-300 w-full group/audio shadow-lg", isPlaying ? "bg-action/10 border-action shadow-[0_0_30px_rgba(152,201,60,0.25)]" : "bg-surface border-border hover:border-action/30")}>
                    <div className={cn("size-12 rounded-full flex items-center justify-center shrink-0 transition-colors", isPlaying ? "bg-action text-white animate-pulse" : "bg-black/10 text-desc/60 group-hover/audio:bg-primary group-hover/audio:text-white")}><Icon name={isPlaying ? "graphic_eq" : "volume_up"} size="md" /></div>
                    <div className="flex flex-col text-left">
                      <span className="text-[10px] font-black uppercase tracking-[0.2em] opacity-50 mb-1">{isPlaying ? "NOW PLAYING" : "AUDIO STORY"}</span>
                      <span className={cn("font-bold text-base leading-none", isPlaying ? "text-action" : "text-title")}>{cat.audio_story_url ? "Listen to the Chef" : "Hear Introduction"}</span>
                    </div>
                  </button>
                </div>
                <div className="lg:col-span-7">
                  <div className="h-full p-8 md:p-12 rounded-[3rem] bg-surface border border-border flex flex-col gap-10 shadow-inner">
                    {cat.ui_quote && <Typography variant="quote" className="text-2xl md:text-3xl text-title opacity-90 border-primary pl-8 py-4">"{cat.ui_quote}"</Typography>}
                    <div className="space-y-6"><Typography variant="paragraphM" className="text-desc/90 whitespace-pre-wrap leading-relaxed text-lg font-light text-left">{cat.content_body || cat.description}</Typography></div>
                    {cat.keywords && cat.keywords.length > 0 && (
                      <div className="flex flex-wrap gap-2 pt-6 border-t border-border">
                        {cat.keywords.map((kw, kIdx) => (<Chip key={kIdx} label={kw} className="text-xs py-2 px-4 bg-background border-border hover:bg-surface" />))}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {idx < categories.length - 1 && (
                <div className="w-full flex justify-center py-16 opacity-30"><div className="w-24 h-1 bg-gradient-to-r from-transparent via-border to-transparent rounded-full" /></div>
              )}
            </section>
          );
        })}
      </div>
    </PageLayout>
  );
};

export default RecipesPage;