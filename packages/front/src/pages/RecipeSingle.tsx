import React, { useMemo, useState, useRef, useEffect } from 'react';
import { supabase } from '@thaiakha/shared/lib/supabase';
import { contentService } from '@thaiakha/shared/services';
import { PageLayout } from '../components/layout/index';
import { Typography, Badge, Icon, Button, Divider, Modal, MediaImage } from '../components/ui/index';
import GalleryModal, { GalleryItem } from '../components/modal/GalleryModal';
import { cn } from '@thaiakha/shared/lib/utils';
import { useDietaryKnowledge } from '../hooks/useDietaryKnowledge';
import { adaptRecipeToDiet } from '../lib/recipeAdapter';
import { mapToRecipeData } from '../lib/recipeHelpers';
import { RecipeData } from '../components/menu/index';
import { t } from '@thaiakha/shared/lib/ui-strings';
import { RecipeExplorer } from '../components/recipes/index';

export interface IngredientDetail {
  id: string;
  name_en: string;
  name_th: string;
  phonetic?: string;
  description: string;
  image_url: string;
  is_visible_public: boolean;
}

interface RecipeSinglePageProps {
  slug: string;
  onNavigate?: (targetPage: string, topic?: string, sectionId?: string) => void;
  userProfile?: any;
}

const CATEGORY_ORDER = ['appetizer', 'dessert', 'akha_specialty', 'curry', 'soup', 'stirfry'];

const CATEGORY_LABELS = t.recipeSingle.categories;

const CAT_COLORS: Record<string, string> = {
  curry: 'bg-red-500/80 text-white border-red-400/50',
  soup: 'bg-btn-p-500/80 text-white border-btn-p-400/50',
  stirfry: 'bg-yellow-500/80 text-black border-yellow-400/50',
  akha_specialty: 'bg-primary/80 text-white border-primary/50',
  appetizer: 'bg-green-600/80 text-white border-green-400/50',
  dessert: 'bg-pink-500/80 text-white border-pink-400/50',
};

const RecipeSinglePage: React.FC<RecipeSinglePageProps> = ({ slug, onNavigate, userProfile }) => {
  const [loading, setLoading] = useState(true);
  const [recipeRaw, setRecipeRaw] = useState<any | null>(null);
  const [allRecipesRaw, setAllRecipesRaw] = useState<any[]>([]);
  const {
    loading: knowledgeLoading
  } = useDietaryKnowledge();

  const [activeDiet, setActiveDiet] = useState('');
  const [activeAllergies, setActiveAllergies] = useState<string[]>([]);

  const [isGalleryOpen, setIsGalleryOpen] = useState(false);
  const [galleryStartIndex, setGalleryStartIndex] = useState(0);
  const [activeAudio, setActiveAudio] = useState<'story' | 'cooking' | null>(null);
  const [isExplorerOpen, setIsExplorerOpen] = useState(false);
  const [activeBookingId, setActiveBookingId] = useState<string | null>(null);
  const [isAlreadyInMenu, setIsAlreadyInMenu] = useState(false);
  const [savingSelection, setSavingSelection] = useState(false);

  const [richIngredients, setRichIngredients] = useState<IngredientDetail[]>([]);
  const [activeIngredient, setActiveIngredient] = useState<IngredientDetail | null>(null);
  const [loadingIng, setLoadingIng] = useState(false);
  const [allergyMap, setAllergyMap] = useState<Record<string, string>>({});
  
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const isFromMenu = window.location.search.includes('source=menu');

  useEffect(() => {
    if (userProfile?.dietary_profile) {
      setActiveDiet(userProfile.dietary_profile);
      setActiveAllergies(userProfile.allergies || []);
    }
  }, [userProfile]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [singleData, allData] = await Promise.all([
          contentService.getRecipeBySlug(slug),
          contentService.getAllRecipesFull(),
        ]);
        setRecipeRaw(singleData);
        setAllRecipesRaw(allData || []);
      } catch (err) {
        console.error("Failed to load recipe:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [slug]);

  const recipe: RecipeData | null = useMemo(() => {
    if (!recipeRaw) return null;
    let mapped = mapToRecipeData(recipeRaw);
    return adaptRecipeToDiet(mapped, activeDiet, activeAllergies);
  }, [recipeRaw, activeDiet, activeAllergies]);

  const allRecipes: RecipeData[] = useMemo(() => {
    return allRecipesRaw.map(r => adaptRecipeToDiet(mapToRecipeData(r), activeDiet, activeAllergies));
  }, [allRecipesRaw, activeDiet, activeAllergies]);

  useEffect(() => {
    if (!recipeRaw) return;

    // --- INJECT SEO TAGS FOR RECIPE ---
    document.title = recipeRaw.seo_title || `${recipeRaw.name} | Thai Akha Kitchen Recipes`;
    const updateOrCreateMeta = (nameOrProperty: string, content: string, isProperty = false) => {
      const attr = isProperty ? 'property' : 'name';
      let element = document.querySelector(`meta[${attr}="${nameOrProperty}"]`);
      if (!element) {
        element = document.createElement('meta');
        element.setAttribute(attr, nameOrProperty);
        document.head.appendChild(element);
      }
      element.setAttribute('content', content);
    };
    const finalDesc = recipeRaw.seo_description || recipeRaw.description?.slice(0, 160);
    if (finalDesc) {
      updateOrCreateMeta('description', finalDesc);
      updateOrCreateMeta('og:description', finalDesc, true);
    }
    updateOrCreateMeta('og:title', recipeRaw.seo_title || `${recipeRaw.name} | Thai Akha Kitchen Recipes`, true);
    if (recipeRaw.og_image || recipeRaw.image) updateOrCreateMeta('og:image', recipeRaw.og_image || recipeRaw.image, true);

    const fetchRichIngredients = async () => {
      if (!recipe.keyIngredients || recipe.keyIngredients.length === 0) return;
      setLoadingIng(true);
      const { data } = await supabase
        .from('ingredients_library')
        .select('id, name_en, name_th, phonetic, description, image_url, is_visible_public')
        .in('name_en', recipe.keyIngredients);
      if (data) setRichIngredients(data);
      setLoadingIng(false);
    };

    const fetchAllergiesMap = async () => {
      const map = await contentService.getAllergyMap();
      setAllergyMap(map);
    };

    const fetchBookingContext = async () => {
        if (!userProfile) return;
        try {
            // Cerca prenotazione attiva per menu selection
            const { data: latestBooking } = await supabase
              .from('bookings')
              .select('internal_id, menu_selections(id, curry_id, soup_id, stirfry_id)')
              .eq('user_id', userProfile.id)
              .neq('status', 'cancelled')
              .order('booking_date', { ascending: true })
              .limit(1)
              .maybeSingle();
            
            if (latestBooking) {
                setActiveBookingId(latestBooking.internal_id);
                // Verifica se già nel menu
                const selections = latestBooking.menu_selections?.[0] as any;
                if (selections && recipeRaw) {
                    const isIn = (selections.curry_id === recipeRaw.id || selections.soup_id === recipeRaw.id || selections.stirfry_id === recipeRaw.id);
                    setIsAlreadyInMenu(isIn);
                }
            }
        } catch (e) { console.error("Err context:", e); }
    };

    fetchRichIngredients();
    fetchAllergiesMap();
    fetchBookingContext();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [recipeRaw, activeAllergies, userProfile]);

  const visibleIngredientsNames = useMemo(() => {
    if (!recipe) return [];
    return recipe.keyIngredients.filter(name => {
      const rich = richIngredients.find(ri => ri.name_en === name);
      return rich ? rich.is_visible_public : false;
    });
  }, [recipe, richIngredients]);

  const activeConflicts = useMemo(() => {
    if (!recipe) return [];
    const conflicts: { allergen: string; warning: string }[] = [];
    const checkMap: Record<string, boolean> = {
      'Peanuts': recipe.hasPeanuts,
      'Shellfish': recipe.hasShellfish,
      'Gluten': recipe.hasGluten,
      'Soy': recipe.hasSoy,
      'Eggs': recipe.hasEggs || false,
      'Dairy': recipe.hasDairy || false
    };

    activeAllergies.forEach(allergen => {
      const key = Object.keys(checkMap).find(k => k.toLowerCase() === allergen.toLowerCase());
      if (key && checkMap[key]) {
        const kbKey = allergen.toLowerCase();
        const warning = allergyMap[kbKey] || t.recipeSingle.defaultWarning;
        conflicts.push({ allergen, warning });
      }
    });
    return conflicts;
  }, [recipe, activeAllergies, allergyMap]);

  const galleryItems: GalleryItem[] = useMemo(() => {
    if (!recipe) return [];
    const mainImage: GalleryItem = { image_url: recipe.image, title: recipe.name, description: t.recipeSingle.signatureDish };
    const secondaryImages = (recipe.galleryImages || []).map((url, i) => ({ image_url: url, title: t.recipeSingle.detailN({ n: i + 1 }) }));
    return [mainImage, ...secondaryImages];
  }, [recipe]);

  const groupedRecipes = useMemo(() => {
    const groups: Record<string, RecipeData[]> = {};
    CATEGORY_ORDER.forEach(cat => groups[cat] = []);
    allRecipes.forEach(r => {
      let key = r.category;
      if (!groups[key]) {
        if (key.includes('curry')) key = 'curry';
        else if (key.includes('soup')) key = 'soup';
        else if (key.includes('stir')) key = 'stirfry';
        else if (key.includes('akha')) key = 'akha_specialty';
        else if (key.includes('appetizer')) key = 'appetizer';
        else if (key.includes('dessert')) key = 'dessert';
      }
      if (groups[key]) groups[key].push(r);
    });
    return groups;
  }, [allRecipes]);

  const handleAskCherry = () => {
    if (!recipeRaw) return;
    const topic = t.recipeSingle.historyOf({ name: recipeRaw.name, diet: activeDiet });
    window.dispatchEvent(new CustomEvent('trigger-chat-topic', { detail: { topic } }));
  };

  const toggleAudio = (type: 'story' | 'cooking') => {
    if (!recipeRaw) return;
    if (activeAudio === type) {
      audioRef.current?.pause();
      setActiveAudio(null);
    } else {
      const url = type === 'story' ? recipeRaw.audio_story_url : recipeRaw.audio_cooking_url;
      if (url && audioRef.current) {
        audioRef.current.src = url;
        audioRef.current.play();
        setActiveAudio(type);
      }
    }
  };

  const openGalleryAt = (index: number) => {
    setGalleryStartIndex(index);
    setIsGalleryOpen(true);
  };

  const handleUpdateMenu = async () => {
      if (!activeBookingId || !userProfile || !recipeRaw) return;
      
      setSavingSelection(true);
      try {
          const cat = recipeRaw.category.toLowerCase();
          const column = cat.includes('curry') ? 'curry_id' : cat.includes('soup') ? 'soup_id' : 'stirfry_id';
          
          const payload = {
              user_id: userProfile.id,
              booking_id: activeBookingId,
              [column]: recipeRaw.id,
              selected_profile: `diet_${activeDiet}`,
              selected_allergies: activeAllergies,
              updated_at: new Date().toISOString()
          };

          const { data: existing } = await supabase.from('menu_selections').select('id').eq('booking_id', activeBookingId).maybeSingle();
          if (existing) await supabase.from('menu_selections').update(payload).eq('id', existing.id);
          else await supabase.from('menu_selections').insert(payload);

          setIsAlreadyInMenu(true);
          // Se arriviamo da menu rinviamo li
          if (isFromMenu) onNavigate?.('menu', undefined, activeBookingId);
      } catch (e) {
          console.error("Save failed:", e);
      } finally {
          setSavingSelection(false);
      }
  };

  if (loading || knowledgeLoading) {
    return (
      <PageLayout slug="recipes" showPatterns={true} hideDefaultHeader={true}>
        <div className="flex justify-center items-center h-[60vh]">
          <div className="size-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
      </PageLayout>
    );
  }

  if (!recipe) {
    return (
      <PageLayout slug="recipes" showPatterns={true} hideDefaultHeader={true}>
        <div className="flex flex-col justify-center items-center h-[60vh] text-center px-4">
          <Typography variant="h3" className="mb-4">{t.recipeSingle.notFound}</Typography>
          <Button variant="action" onClick={() => onNavigate?.('recipes')}>{t.recipeSingle.backToRecipes}</Button>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout slug="recipes" showPatterns={true} hideDefaultHeader={true} isFullScreen={true}>
      <div className="pb-48 w-full pt-[var(--space-fluid-xl)]">
        <div className="max-w-[85rem] mx-auto px-4 md:px-8 lg:px-12">

          {/* --- MAIN CONTENT --- */}
          <div className="flex flex-col gap-[var(--space-fluid-l)]">

            {/* --- STICKY NAV OVERLAY --- */}
            <div className="sticky top-6 z-50 flex justify-center w-full pointer-events-none mb-[2vh]">
                <div className="pointer-events-auto relative w-full md:w-[28rem] lg:w-[32rem]">
                    <div className="flex items-center gap-2 bg-surface/80 dark:bg-surface-elevated/90 backdrop-blur-3xl p-1.5 pl-2.5 rounded-[2.5rem] border border-white/10 shadow-2xl relative z-50 group transition-all hover:bg-surface/95">
                        <button 
                            onClick={() => onNavigate?.(isFromMenu ? 'menu' : 'recipes', undefined, isFromMenu ? activeBookingId || undefined : undefined)} 
                            className="size-10 rounded-full bg-white/5 border border-white/5 flex items-center justify-center text-gray-500 dark:text-white/60 hover:bg-white/10 hover:text-white transition-all active:scale-95"
                        >
                            <Icon name="arrow_back" size="sm" />
                        </button>
                        
                        <div className="w-px h-6 bg-white/10 mx-1"></div>
                        
                        <button 
                            onClick={() => setIsExplorerOpen(!isExplorerOpen)} 
                            className="flex-1 flex items-center justify-between px-4 py-1.5 rounded-2xl transition-all hover:bg-white/5 group min-w-0"
                        >
                            <div className="flex flex-col items-start min-w-0">
                                <span className="text-[8px] font-black uppercase tracking-[0.2em] text-primary leading-none mb-1.5">{t.recipeSingle.heritageExplorer}</span>
                                <span className="font-display font-black text-gray-900 dark:text-white text-[13px] uppercase truncate w-full text-left leading-none tracking-tight">
                                    {recipeRaw.name}
                                </span>
                            </div>
                            <div className={cn(
                                "size-8 rounded-xl flex items-center justify-center transition-all duration-300",
                                isExplorerOpen ? "bg-primary/10 text-primary rotate-180" : "bg-white/5 text-white/30 group-hover:text-white/60"
                            )}>
                                <Icon name="expand_more" size="sm" />
                            </div>
                        </button>
                    </div>

                    <RecipeExplorer 
                        isOpen={isExplorerOpen}
                        onOpen={setIsExplorerOpen}
                        currentRecipeId={recipeRaw.id}
                        allRecipes={allRecipes}
                        onSelectDish={(dish) => onNavigate?.('recipes', undefined, dish.slug)}
                        categoryLabels={CATEGORY_LABELS}
                        categoryOrder={CATEGORY_ORDER}
                    />
                </div>
            </div>


            {/* ── HERO BLOCK: Title + Photo Grid ── */}
            <div className="flex flex-col gap-[var(--space-fluid-m)]">

              {/* Inline Title (replaces HeaderSection) */}
              <div className="flex flex-col gap-3 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="flex items-center gap-3">
                  <Badge variant="mineral" className={cn("shrink-0 font-black text-xs uppercase tracking-widest", CAT_COLORS[recipe.category] || 'bg-primary/10 text-primary border-primary/20')}>
                    {recipe.thai_name || CATEGORY_LABELS[recipe.category] || recipe.category}
                  </Badge>
                  {recipe.isSignature && (
                    <Badge variant="mineral" className="bg-action/10 text-action border-action/20 text-xs">
                      <Icon name="star" size="xs" className="mr-1" /> {t.recipeSingle.signature}
                    </Badge>
                  )}
                </div>
                <Typography variant="h1" className="text-gray-900 dark:text-white font-black uppercase italic leading-none tracking-tighter">
                  {recipe.name}
                </Typography>
                {recipe.description && (
                  <Typography variant="body" className="text-gray-600 dark:text-gray-400 max-w-2xl leading-relaxed">
                    {recipe.description}
                  </Typography>
                )}
              </div>

              {/* Photo Grid: 8/12 main + 4/12 gallery */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-3 md:gap-4">

                {/* Main Photo — 8/12 — 16:9 */}
                <div
                  onClick={() => openGalleryAt(0)}
                  className="md:col-span-8 cursor-pointer relative w-full aspect-video rounded-[2rem] overflow-hidden group shadow-xl"
                >
                  <MediaImage
                    url={recipe.image}
                    fallbackAlt={recipe.name}
                    showCaption={false}
                    imgClassName="w-full h-full object-cover transition-transform duration-[3s] group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="absolute bottom-[var(--space-fluid-s)] left-[var(--space-fluid-s)] text-white/80 bg-black/40 backdrop-blur-md rounded-full px-3 py-1 text-xs uppercase tracking-widest font-black opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-2">
                    <Icon name="zoom_in" size="sm" /> {t.recipeSingle.enlarge}
                  </div>
                </div>

                {/* Gallery Column — 4/12 — 3 photos stacked */}
                <div className="md:col-span-4 grid grid-rows-3 gap-3" style={{ height: 'auto' }}>
                  {galleryItems.slice(1, 4).map((item, idx) => (
                    <div
                      key={idx}
                      onClick={() => openGalleryAt(idx + 1)}
                      className="cursor-pointer relative rounded-2xl overflow-hidden shadow-md group border border-white/5 dark:border-white/10"
                      style={{ minHeight: '100px' }}
                    >
                      <MediaImage
                        url={item.image_url}
                        fallbackAlt={item.title}
                        showCaption={false}
                        imgClassName="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-all group-hover:scale-110 duration-700 absolute inset-0"
                      />
                    </div>
                  ))}
                  {/* Fill empty slots if less than 3 gallery images */}
                  {Array.from({ length: Math.max(0, 3 - galleryItems.slice(1, 4).length) }).map((_, idx) => (
                    <div key={`empty-${idx}`} className="rounded-2xl bg-surface-2 border border-border/30" style={{ minHeight: '100px' }} />
                  ))}
                </div>

              </div>
            </div>

            {/* Safety Shield */}
            {activeConflicts.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {activeConflicts.map((conflict, idx) => (
                  <div key={idx} className="relative overflow-hidden rounded-2xl bg-allergy/10 border border-allergy/30 p-[var(--space-fluid-m)] flex items-start gap-4">
                    <div className="size-12 rounded-xl bg-allergy/20 flex items-center justify-center shrink-0 text-allergy">
                      <Icon name="health_and_safety" size="md" />
                    </div>
                    <div className="space-y-1">
                      <Typography variant="h5" className="text-gray-900 dark:text-white uppercase">{t.recipeSingle.containsAllergen({ allergen: conflict.allergen })}</Typography>
                      <Typography variant="body" className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed opacity-90">{conflict.warning}</Typography>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-4">
              <button onClick={() => toggleAudio('story')} className={cn("flex flex-1 flex-col items-center justify-center gap-2 p-[var(--space-fluid-s)] rounded-[1.5rem] border transition-all", activeAudio === 'story' ? "bg-primary/10 border-primary/50 text-primary animate-pulse shadow-[0_0_15px_rgba(227,31,51,0.2)]" : "bg-white/5 border-white/10 text-gray-700 dark:text-gray-300 hover:bg-white/10")}>
                <Icon name="graphic_eq" size="md" />
                <span className="text-[10px] font-black uppercase tracking-widest">{t.recipeSingle.cultureStory}</span>
              </button>
              <button onClick={handleAskCherry} className="flex flex-1 flex-col items-center justify-center gap-2 p-[var(--space-fluid-s)] rounded-[1.5rem] bg-action/10 border border-action/30 text-action hover:bg-action hover:text-white hover:shadow-[0_0_20px_rgba(152,201,60,0.4)] transition-all">
                <Icon name="chat" size="md" />
                <span className="text-[10px] font-black uppercase tracking-widest">{t.recipeSingle.askCherry}</span>
              </button>
            </div>

            {/* Divider */}
            <Divider variant="mineral" />

            {/* Ingredients Section */}
            <div className="pt-[var(--space-fluid-l)]">
              <div className="flex items-center justify-between mb-8">
                <Typography variant="h3" className="text-secondary uppercase italic">{t.recipeSingle.keyIngredients}</Typography>
                <div className="h-px flex-1 bg-border ml-8 opacity-20" />
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-[var(--space-fluid-s)]">
                {visibleIngredientsNames.map((ingName, idx) => {
                  const details = richIngredients.find(i => i.name_en === ingName);
                  return (
                    <button key={idx} onClick={() => details && setActiveIngredient(details)} className="text-left relative flex flex-col rounded-[1.5rem] overflow-hidden border border-border/50 bg-surface hover:border-secondary/50 transition-all duration-300 group shadow-sm hover:shadow-md">
                      <div className="w-full aspect-[4/3] relative overflow-hidden bg-black/5 dark:bg-white/5">
                        <MediaImage
                          url={details?.image_url}
                          fallbackAlt={ingName}
                          showCaption={false}
                          imgClassName="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                        />
                      </div>
                      <div className="p-4 flex flex-col justify-between h-full bg-surface-2 group-hover:bg-surface-elevated transition-colors">
                        <span className="font-bold text-sm uppercase text-gray-900 dark:text-white group-hover:text-secondary truncate">{ingName}</span>
                        <div className="flex items-center gap-1 mt-2 text-[9px] text-gray-500 dark:text-white/40 uppercase tracking-widest">
                          <Icon name="add_circle" size="xs" /> {t.recipeSingle.viewDetails}
                        </div>
                      </div>
                    </button>
                  )
                })}
                {visibleIngredientsNames.length === 0 && !loadingIng && (
                  <div className="col-span-full py-12 border border-dashed border-border rounded-3xl text-center opacity-50">
                    <Typography variant="body" className="italic">{t.recipeSingle.secretChef}</Typography>
                  </div>
                )}
              </div>
            </div>

          </div>

        </div>
      </div>

      <audio ref={audioRef} className="hidden" onEnded={() => setActiveAudio(null)} />
      <GalleryModal isOpen={isGalleryOpen} onClose={() => setIsGalleryOpen(false)} items={galleryItems} startIndex={galleryStartIndex} />
      <Modal isOpen={!!activeIngredient} onClose={() => setActiveIngredient(null)} variant="cinema" className="max-w-md w-full p-0 overflow-hidden rounded-[2rem]">
        {activeIngredient && (
          <div className="flex flex-col relative w-full bg-surface">
            <div className="h-48 w-full relative">
              <MediaImage
                url={activeIngredient.image_url}
                fallbackAlt={activeIngredient.name_en}
                showCaption={false}
                imgClassName="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
              <div className="absolute bottom-4 left-6">
                <Typography variant="h3" className="text-white uppercase !leading-none mb-1">{activeIngredient.name_en}</Typography>
              </div>
            </div>
            <div className="p-[var(--space-fluid-m)] space-y-[var(--space-fluid-xl)]">
              <Typography variant="body" className="text-gray-600 dark:text-gray-300 leading-relaxed font-light">{activeIngredient.description}</Typography>
              <Button variant="mineral" fullWidth onClick={() => setActiveIngredient(null)} className="rounded-full">{t.recipeSingle.closeDetails}</Button>
            </div>
          </div>
        )}
      </Modal>

      {/* --- SELECTION FOOTER (Only for Booked Users) --- */}
      {activeBookingId && (
        <div className="fixed bottom-0 left-0 right-0 z-50 p-6 flex justify-center bg-gradient-to-t from-background via-background/80 to-transparent">
           <div className="w-full max-w-lg animate-in slide-in-from-bottom-8 duration-700">
             <Button 
                variant={isAlreadyInMenu ? "mineral" : "action"} 
                size="lg" 
                fullWidth 
                onClick={handleUpdateMenu} 
                disabled={isAlreadyInMenu || savingSelection}
                isLoading={savingSelection}
                icon={isAlreadyInMenu ? "check_circle" : "add_circle"}
                className={cn(
                    "shadow-2xl h-16 rounded-[2rem] font-black tracking-widest text-lg uppercase transition-all duration-500",
                    isAlreadyInMenu ? "opacity-90 grayscale" : "hover:scale-105 active:scale-95 shadow-glow-action"
                )}
             >
                {isAlreadyInMenu ? t.recipeSingle.dishAdded : t.recipeSingle.reserveMenu}
             </Button>
           </div>
        </div>
      )}

    </PageLayout>
  );
};

export default RecipeSinglePage;
