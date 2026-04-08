import React, { useMemo, useState, useRef, useEffect, useCallback } from 'react';
import { supabase } from '@thaiakha/shared/lib/supabase';
import { contentService } from '@thaiakha/shared/services';
import { PageLayout } from '../components/layout/index';
import { Typography, Badge, Icon, Button, Divider, Modal, MediaImage, AkhaLoader } from '../components/ui/index';
import GalleryModal, { GalleryItem } from '../components/modal/GalleryModal';
import { cn } from '@thaiakha/shared/lib/utils';
import { useDietaryKnowledge } from '../hooks/useDietaryKnowledge';
import { adaptRecipeToDiet } from '../lib/recipeAdapter';
import { mapToRecipeData } from '../lib/recipeHelpers';
import { RecipeData } from '../components/menu/index';
import { t } from '@thaiakha/shared/lib/ui-strings';
import { HeaderSinglePost, ContentRenderer, SiblingCard, AkhaHistoryLine } from '../components/blog';
import { RecipeExplorer } from '../components/recipes';
import { useMediaAsset } from '../hooks/useMediaAsset';
import { useAudioAsset } from '../hooks/useAudioAsset';
import { Photo } from '../components/modal';

export interface IngredientDetail {
  id: string;
  name_en: string;
  name_th: string;
  phonetic?: string;
  description: string;
  image_url: string;
  // Dati dal livello composition
  quantity?: string;
  unit?: string;
  prep_note?: string;
}

// --- CONSTANTS ---
const CATEGORY_ORDER = ['appetizer', 'dessert', 'akha_specialty', 'curry', 'soup', 'stirfry'];
const CATEGORY_LABELS: Record<string, string> = {
  appetizer: 'Heritage Starters',
  dessert: 'Sweet Traditions',
  akha_specialty: 'Akha Signature',
  curry: 'Mountain Curries',
  soup: 'Village Soups',
  stirfry: 'Fire & Wok'
};

interface RecipeSinglePageProps {
  slug: string;
  onNavigate?: (targetPage: string, topic?: string, sectionId?: string) => void;
  userProfile?: any;
}

// RECIPE SINGLE PAGE COMPONENT
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
  const explorerRef = useRef<HTMLDivElement>(null);

  const [richIngredients, setRichIngredients] = useState<IngredientDetail[]>([]);
  const [activeIngredient, setActiveIngredient] = useState<IngredientDetail | null>(null);
  const [loadingIng, setLoadingIng] = useState(false);
  const [allergyMap, setAllergyMap] = useState<Record<string, string>>({});

  const audioRef = useRef<HTMLAudioElement | null>(null);

  // --- NAVIGATION PERSISTENCE ---
  // Try to detect if we came from Menu/Booking to handle the Back button correctly
  const [isFromMenu, setIsFromMenu] = useState(false);
  const [activeBookingId, setActiveBookingId] = useState<string | null>(null);

  useEffect(() => {
    // Check window.history.state or similar if passed via router
    // This is a safety measure to prevent ReferenceError
    const state = (window as any).history?.state?.usr;
    if (state?.isFromMenu) {
      setIsFromMenu(true);
      if (state.bookingId) setActiveBookingId(state.bookingId);
    }
  }, []);

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

  // Audio assets
  const audioId = recipeRaw?.audio_asset_id ?? undefined;
  const { asset: audioAsset } = useAudioAsset({ assetId: audioId });

  // SIBLING NAVIGATION (Global Sequence)
  const { previous, next } = useMemo(() => {
    if (!recipeRaw || !allRecipesRaw.length) return { previous: null, next: null };
    const currentIndex = allRecipesRaw.findIndex(r => r.id === recipeRaw.id);
    return {
      previous: currentIndex > 0 ? allRecipesRaw[currentIndex - 1] : null,
      next: currentIndex < allRecipesRaw.length - 1 ? allRecipesRaw[currentIndex + 1] : null
    };
  }, [recipeRaw, allRecipesRaw]);

  // Share logic
  const handleShare = useCallback(() => {
    if (navigator.share) {
      navigator.share({
        title: recipe?.name ?? 'Thai Akha Recipe',
        text: recipe?.description ?? '',
        url: window.location.href,
      }).catch(console.error);
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert(t.common.copiedLink);
    }
  }, [recipe]);

  // Handle click outside to close explorer
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (explorerRef.current && !explorerRef.current.contains(e.target as Node)) {
        setIsExplorerOpen(false);
      }
    };
    if (isExplorerOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isExplorerOpen]);

  const handleOpenGallery = useCallback((idx: number) => {
    setGalleryStartIndex(idx);
    setIsGalleryOpen(true);
  }, []);

  const galleryModalItems: GalleryItem[] = useMemo(() => {
    return (recipeRaw?.gallery_images || []).map((img: any) => ({
      image_url: img.image_url,
      title: img.title || '',
      description: img.description || '',
      asset_id: img.id
    }));
  }, [recipeRaw]);

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

    // --- EFFECT: PROCESS INGREDIENTS FROM COMPOSITION ---
    const processIngredients = () => {
      if (!recipeRaw?.recipe_composition) return;

      const ingredients: IngredientDetail[] = recipeRaw.recipe_composition.map((item: any) => ({
        id: item.ingredients_library.id,
        name_en: item.ingredients_library.name_en,
        name_th: item.ingredients_library.name_th,
        phonetic: item.ingredients_library.phonetic,
        description: item.ingredients_library.description,
        image_url: item.ingredients_library.image_url,
        quantity: item.quantity,
        unit: item.unit,
        prep_note: item.prep_note
      }));

      setRichIngredients(ingredients);
    };

    const fetchAllergiesMap = async () => {
      const map = await contentService.getAllergyMap();
      setAllergyMap(map);
    };

    processIngredients();
    fetchAllergiesMap();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [recipeRaw, activeAllergies, userProfile]);

  // No longer needed visibleIngredientsNames filter as we use richIngredients directly

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
    <PageLayout
      slug={`recipe-${slug}`}
      showPatterns={true}
      hideDefaultHeader={true}
    >
      <div className="w-full flex flex-col">
        <div className="w-full max-w-6xl mx-auto [padding-inline:var(--space-fluid-m)] [padding-top:var(--space-fluid-l)] pb-32">
          {loading && (
            <div className="flex items-center justify-center py-32">
              <AkhaLoader />
            </div>
          )}

          {!loading && (!recipe || !recipeRaw) && (
            <div className="flex flex-col items-center justify-center py-32 text-center [gap:var(--space-fluid-s)]">
              <Icon name="wifi_off" size="xl" className="text-primary/40" />
              <Typography variant="h5" color="sub">{t.history.loadError}</Typography>
              <Button variant="outline" size="sm" onClick={() => (window as any).history.back()} icon="arrow_back">{t.common.back}</Button>
            </div>
          )}

          {!loading && recipe && recipeRaw && (
            <article className="flex flex-col gap-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
              {/* CUSTOM RECIPE NAVIGATOR (Pillula al centro) */}
              <div className="flex justify-center -mb-4 relative z-[60] px-4">
                 <div ref={explorerRef} className="relative w-full max-w-sm md:max-w-md">
                    <button 
                       onClick={() => setIsExplorerOpen(!isExplorerOpen)}
                       className="w-full flex items-center justify-between px-6 py-3 rounded-full bg-surface-overlay/95 backdrop-blur-3xl border border-white/10 shadow-2xl hover:bg-white/5 transition-all group active:scale-95"
                    >
                       <div className="flex flex-col items-start min-w-0 pr-2">
                          <span className="text-[9px] font-black uppercase tracking-widest text-primary leading-none mb-1">Heritage Collection</span>
                          <span className="font-display font-black text-gray-900 dark:text-gray-100 text-sm uppercase truncate w-full text-left leading-none">{recipe.name}</span>
                       </div>
                       <Icon 
                          name={isExplorerOpen ? "close" : "expand_more"} 
                          className={cn("transition-transform duration-300", isExplorerOpen ? "text-primary rotate-90" : "text-gray-500/50")} 
                       />
                    </button>

                    {/* MODAL / PANEL VERSION OF EXPLORER */}
                    <RecipeExplorer
                      isOpen={isExplorerOpen}
                      onOpen={setIsExplorerOpen}
                      currentRecipeId={recipeRaw.id}
                      allRecipes={allRecipesRaw.map(r => ({ ...r, name: r.name || 'Recipe' }))}
                      onSelectDish={(dish) => {
                        if (onNavigate) onNavigate('recipes', undefined, dish.slug || dish.id);
                        setIsExplorerOpen(false);
                      }}
                      categoryLabels={CATEGORY_LABELS}
                      categoryOrder={CATEGORY_ORDER}
                    />
                 </div>
              </div>

              <HeaderSinglePost
                title={recipe.name}
                subtitle={recipeRaw?.subtitle || recipe.thai_name}
                primaryImage={recipe.image}
                audioAssetId={audioId}
                hasAudio={!!audioAsset}
                quote={recipe.healthBenefits}
                onShare={handleShare}
              />

              {/* PHOTO GRID (3 COLUMNS) */}
              {galleryModalItems.length > 0 && (
                <div className="max-w-5xl mx-auto w-full grid grid-cols-1 sm:grid-cols-3 [gap:var(--space-fluid-m)] pt-6">
                  {galleryModalItems.slice(0, 3).map((item, idx) => (
                    <Photo
                      key={item.asset_id || idx}
                      item={item}
                      variant="video"
                      onClick={() => handleOpenGallery(idx)}
                    />
                  ))}
                </div>
              )}

              {/* DESCRIPTION / CONTENT */}
              <div className="max-w-3xl mx-auto w-full flex flex-col [gap:var(--space-fluid-l)] py-6">
                {recipe.description && (
                  <ContentRenderer content={recipe.description} />
                )}
              </div>

              {/* INGREDIENT LIST (Premium Akha Style) */}
              <div className="max-w-4xl mx-auto w-full flex flex-col gap-8 py-12">
                <AkhaHistoryLine />
                <div className="flex flex-col gap-6">
                  <div className="flex items-center gap-4">
                    <div className="flex-1 h-px bg-border" />
                    <div className="flex items-center gap-2 text-action/60">
                      <Icon name="list_alt" size="sm" />
                      <Typography variant="caption" color="muted" className="uppercase tracking-widest">
                        {t.recipeSingle.keyIngredients}
                      </Typography>
                    </div>
                    <div className="flex-1 h-px bg-border" />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {richIngredients.map((ing) => (
                      <div
                        key={ing.id}
                        onClick={() => setActiveIngredient(ing)}
                        className="flex items-center justify-between p-4 rounded-2xl bg-surface/40 border border-white/5 hover:bg-white/10 transition-all cursor-pointer group shadow-sm"
                      >
                        <div className="flex flex-col">
                          <Typography variant="body" className="font-bold">{ing.name_en}</Typography>
                          <Typography variant="microLabel" color="sub">{ing.name_th}</Typography>
                        </div>
                        <div className="flex items-center gap-3">
                          {ing.quantity && (
                            <Badge variant="outline" className="opacity-60 border-white/20">
                              {ing.quantity} {ing.unit}
                            </Badge>
                          )}
                          <Icon name="chevron_right" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <AkhaHistoryLine />

              {/* SIBLING NAVIGATION - 2 CARDS ONLY */}
              {(previous || next) && (
                <div className="flex flex-col [gap:var(--space-fluid-xs)] py-12">
                  <Typography variant="microLabel" color="muted" className="text-center tracking-widest uppercase mb-8">
                    {t.history.otherChapters}
                  </Typography>
                  <div className="grid grid-cols-1 sm:grid-cols-2 [gap:var(--space-fluid-l)] max-w-5xl mx-auto w-full">
                    {previous && (
                      <SiblingCard
                        key={previous.id}
                        section={{
                          id: previous.id,
                          slug: previous.slug || previous.id,
                          title: previous.name,
                          subtitle: previous.thai_name || '',
                          primary_image: previous.image || '',
                        } as any}
                        direction="prev"
                        onClick={() => onNavigate?.('recipes', undefined, previous.slug || previous.id)}
                      />
                    )}

                    {next && (
                      <SiblingCard
                        key={next.id}
                        section={{
                          id: next.id,
                          slug: next.slug || next.id,
                          title: next.name,
                          subtitle: next.thai_name || '',
                          primary_image: next.image || '',
                        } as any}
                        direction="next"
                        onClick={() => onNavigate?.('recipes', undefined, next.slug || next.id)}
                      />
                    )}
                  </div>
                </div>
              )}

              <div className="flex justify-center pt-8 pb-4">
                <Button variant="brand" size="md" icon="arrow_back" iconPosition="left" onClick={() => (window as any).history.back()}>
                  {t.common.goBack}
                </Button>
              </div>
            </article>
          )}
        </div>
      </div>

      <GalleryModal
        isOpen={isGalleryOpen}
        onClose={() => setIsGalleryOpen(false)}
        items={galleryModalItems}
        startIndex={galleryStartIndex}
      />

      <Modal
        isOpen={!!activeIngredient}
        onClose={() => setActiveIngredient(null)}
        title={activeIngredient?.name_en}
      >
        {activeIngredient && (
          <div className="flex flex-col bg-surface-elevated rounded-[2.5rem] overflow-hidden">
            {activeIngredient.image_url && (
              <div className="w-full h-64 md:h-80 relative overflow-hidden group">
                <MediaImage url={activeIngredient.image_url} fallbackAlt={activeIngredient.name_en} className="w-full h-full object-cover transition-transform duration-[10s] scale-105 group-hover:scale-100" />
                <div className="absolute inset-0 bg-gradient-to-t from-surface-elevated via-surface-elevated/40 to-transparent" />
                <div className="absolute bottom-6 left-6 right-6">
                  <div className="flex flex-col gap-1">
                    <Typography variant="h2" className="text-white font-black uppercase italic leading-none tracking-tighter mb-1">
                      {activeIngredient.name_en}
                    </Typography>
                    <div className="flex items-center gap-3">
                      <span className="text-white/60 font-medium text-sm italic">{activeIngredient.name_th}</span>
                      {activeIngredient.phonetic && (
                        <span className="text-white/40 font-mono text-[11px] uppercase tracking-wider">[{activeIngredient.phonetic}]</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
            <div className="p-8 space-y-6">
              <Typography variant="paragraphM" className="text-gray-700 dark:text-gray-300 leading-relaxed font-light italic-light">
                {activeIngredient.description || "Every component tells a story of the Akha highlands."}
              </Typography>
              {activeIngredient.quantity && (
                <div className="pt-4 border-t border-white/5">
                  <Badge variant="brand" size="md">
                    {activeIngredient.quantity} {activeIngredient.unit}
                  </Badge>
                </div>
              )}
              <Button variant="action" fullWidth onClick={() => setActiveIngredient(null)} className="rounded-[1.5rem] py-6 uppercase font-black tracking-widest">
                {t.recipeSingle.closeDetails}
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </PageLayout>
  );
};

export default RecipeSinglePage;
