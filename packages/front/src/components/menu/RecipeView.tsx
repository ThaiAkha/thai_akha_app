import React from 'react';
import { Typography, Badge, Icon, Button, Divider, Modal, MediaImage } from '../ui/index';
import GalleryModal from '../modal/GalleryModal';
import { cn } from '@thaiakha/shared/lib/utils';
import { sanitizeHtml } from '../../lib/sanitizeHtml';
import { useRecipeView } from './recipeView/useRecipeView';
import { CHERRY_AVATAR_SRC, CHERRY_SMALL_AVATAR_BG } from '../chat/ChatIdentityHeader';
import type { RecipeData, CategoryData, IngredientDetail } from './recipeView/types';
import { nativeNameFor, type NativeNameSource } from '@thaiakha/shared/lib/nativeName';
import { useLanguage } from '../../context/LanguageContext';

// Tipi ri-esportati (consumer esistenti importano da qui). Logica in ./recipeView/useRecipeView (#16 split).
export type { RecipeData, CategoryData, IngredientDetail };

// --- INTERFACCE ---

interface RecipeViewProps {
  recipe: RecipeData;
  categoryData?: CategoryData;
  allRecipes: RecipeData[];
  activeDiet: string;
  userAllergies?: string[];
  onBack: () => void;
  onSelectDish: (dish: RecipeData) => void;
  // Props for Selection Flow
  onConfirmSelection?: (dish: RecipeData) => void;
  isSelected?: boolean;
}

// Fallback colors for categories if not specified in DB
const CAT_COLORS: Record<string, string> = {
  curry: 'bg-red-500/80 text-white border-red-400/50',
  soup: 'bg-btn-p-500/80 text-white border-btn-p-400/50',
  stirfry: 'bg-yellow-500/80 text-black border-yellow-400/50',
  akha_specialty: 'bg-primary/80 text-white border-primary/50',
  appetizer: 'bg-green-600/80 text-white border-green-400/50',
  dessert: 'bg-pink-500/80 text-white border-pink-400/50',
};

const RecipeView: React.FC<RecipeViewProps> = ({
  recipe,
  allRecipes,
  activeDiet,
  userAllergies = [],
  onBack,
  onSelectDish,
  onConfirmSelection,
  isSelected = false
}) => {
  
  const rv = useRecipeView({ recipe, allRecipes, activeDiet, userAllergies });
  const { lang } = useLanguage();
  /** Ponte thai sotto un nome: null se il nome mostrato e' gia' thai o identico. */
  const thaiOf = (r: NativeNameSource) => nativeNameFor(r, lang).thai;
  const { galleryItems, isGalleryOpen, setIsGalleryOpen, galleryStartIndex, activeAudio, setActiveAudio, isMenuOpen, setIsMenuOpen, richIngredients, activeIngredient, setActiveIngredient, loadingIng, audioRef, menuRef, visibleIngredientsNames, activeConflicts, groupedRecipes, categoryOrder, getCategoryLabel, handleAskCherry, toggleAudio, openGalleryAt } = rv;

  return (
    <div className="flex flex-col gap-8 animate-in fade-in duration-500 pb-40 relative">
      
      {isMenuOpen && <div className="fixed inset-0 z-40 bg-black/40 backdrop-blur-[2px]" onClick={() => setIsMenuOpen(false)} />}

      {/* --- STICKY ISLAND NAV --- */}
      <div className="sticky top-6 z-50 flex justify-center px-4 w-full pointer-events-none">
         <div ref={menuRef} className="pointer-events-auto relative w-full md:w-1/2 lg:w-1/3">
            <div className="flex items-center gap-3 bg-surface/95 backdrop-blur-2xl p-2 pl-3 rounded-[2rem] border border-white/10 shadow-2xl relative z-50">
               <button onClick={onBack} className="size-10 rounded-full bg-white/5 border border-white/5 flex items-center justify-center text-white/60 hover:text-white transition-all active:scale-95 shrink-0"><Icon name="arrow_back" size="sm" /></button>
               <div className="w-px h-6 bg-white/10 mx-1"></div>
               <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="flex-1 flex items-center justify-between px-4 py-2 rounded-xl transition-all hover:bg-white/5 group min-w-0">
                  <div className="flex flex-col items-start min-w-0">
                     <span className="text-[9px] font-black uppercase tracking-widest text-primary leading-none mb-1">Recipe Explorer</span>
                     <span className="font-display font-black text-white text-sm uppercase truncate w-full text-left leading-none">{recipe.name}</span>
                  </div>
                  <Icon name={isMenuOpen ? "close" : "expand_more"} className={cn("transition-transform duration-300 ml-2", isMenuOpen ? "text-primary rotate-90" : "text-white/40")} />
               </button>
            </div>

            {/* DROPDOWN COLLECTIONS */}
            {isMenuOpen && (
               <div className="absolute top-[calc(100%+12px)] left-1/2 -translate-x-1/2 bg-surface-overlay/95 backdrop-blur-3xl border border-white/10 rounded-[2.5rem] shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-4 origin-top z-50 max-h-[75vh] flex flex-col w-[92vw] md:w-[66vw] lg:w-[85rem]">
                  <div className="p-6 border-b border-white/10 bg-white/5 flex justify-between items-center shrink-0">
                     <Typography variant="h5" className="text-white italic">Heritage Collection</Typography>
                     <Badge variant="mineral" className="bg-primary/10 text-primary">{allRecipes.length} Options</Badge>
                  </div>
                  <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-10">
                     {categoryOrder.map(catId => groupedRecipes[catId]?.length > 0 && (
                        <div key={catId} className="space-y-4">
                           <Badge variant="outline" className="border-white/20 text-white/40 px-3">{getCategoryLabel(catId)}</Badge>
                           <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-3">
                              {groupedRecipes[catId].map((item) => (
                                 <button key={item.id} onClick={() => { onSelectDish(item); setIsMenuOpen(false); }} className={cn("relative group w-full h-20 rounded-2xl overflow-hidden border transition-all duration-300 flex items-center text-left", item.id === recipe.id ? "bg-secondary/20 border-secondary/50 text-secondary shadow-lg" : "bg-surface-elevated border-white/5 text-white/60 hover:bg-white/5")}>
                                    <div className="w-1/4 h-full border-r border-white/5 overflow-hidden">
                                       <MediaImage
                                         url={item.image}
                                         fallbackAlt={item.name}
                                         showCaption={false}
                                         imgClassName="w-full h-full object-cover opacity-70 group-hover:opacity-100 transition-all"
                                       />
                                    </div>
                                    <div className="flex-1 px-4 py-2 min-w-0"><span className="font-display font-black uppercase text-sm truncate block">{item.name}</span>{thaiOf(item) && <span className="text-[9px] opacity-40 uppercase truncate block">{thaiOf(item)}</span>}</div>
                                 </button>
                              ))}
                           </div>
                        </div>
                     ))}
                  </div>
               </div>
            )}
         </div>
      </div>

      {/* --- CONTENT GRID --- */}
      <div className="max-w-[var(--container-page)] mx-auto [padding-inline:var(--space-fluid-m)] grid grid-cols-1 md:grid-cols-12 gap-12 mt-4 relative z-10">
        
        {/* MEDIA SIDE (Left) */}
        <div className="md:col-span-5 flex flex-col gap-4">
           <div onClick={() => openGalleryAt(0)} className="relative w-full aspect-square rounded-[2.5rem] overflow-hidden border-2 border-white/10 shadow-2xl group cursor-pointer bg-black">
              <MediaImage
                url={recipe.image}
                fallbackAlt={recipe.name}
                showCaption={true}
                imgClassName="absolute inset-0 w-full h-full object-cover transition-transform duration-[3s] group-hover:scale-110 opacity-90"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
              {/* Mobile Labels */}
              <div className="absolute top-4 left-4 md:hidden z-20"><Badge variant="mineral" className={CAT_COLORS[recipe.category] || 'bg-surface/80'}>{getCategoryLabel(recipe.category).toUpperCase()}</Badge></div>
              <div className="absolute bottom-6 left-6 right-6 md:hidden z-20">
                 <h1 className="text-4xl font-display font-black uppercase text-white leading-[0.9] drop-shadow-xl">{recipe.name}</h1>
              </div>
           </div>
           <div className="grid grid-cols-3 gap-3">
              {galleryItems.slice(1, 4).map((item, idx) => (
                 <div key={idx} onClick={() => openGalleryAt(idx + 1)} className="relative aspect-square rounded-2xl overflow-hidden border border-white/10 cursor-pointer hover:border-primary/50 transition-all">
                    <MediaImage
                      url={item.image_url}
                      fallbackAlt={item.title}
                      showCaption={false}
                      imgClassName="w-full h-full object-cover opacity-70 hover:opacity-100 transition-opacity"
                    />
                 </div>
              ))}
           </div>
           <div className="grid grid-cols-2 gap-3 mt-2">
              <button onClick={() => toggleAudio('story')} className={cn("flex flex-col items-center justify-center gap-2 p-4 rounded-2xl border transition-all bg-surface", activeAudio === 'story' ? "bg-primary/20 border-primary text-primary animate-pulse" : "border-white/10 text-gray-700 dark:text-gray-300")}>
                 <Icon name="graphic_eq" size="md" /><span className="text-[9px] font-black uppercase tracking-widest">Story</span>
              </button>
              {/* Voce brand Cherry (#4): gradiente + avatar canonico come CherryPill/FAB, evento trigger-chat-topic invariato */}
              <button onClick={handleAskCherry} aria-label="Ask Cherry" className="flex flex-col items-center justify-center gap-2 p-4 rounded-2xl bg-[image:var(--cherry-btn-grad)] text-white ring-2 ring-cherry-ai/30 shadow-glow-cherry-ai hover:scale-[1.02] active:scale-95 transition-all">
                 <span className={cn('size-8 rounded-full overflow-hidden', CHERRY_SMALL_AVATAR_BG)}>
                    <img src={CHERRY_AVATAR_SRC} alt="" loading="lazy" className="w-full h-full object-cover" />
                 </span>
                 <Typography as="span" variant="microLabel" className="text-white font-black uppercase tracking-widest">Ask Cherry</Typography>
              </button>
           </div>
        </div>

        {/* INFO SIDE (Right) */}
        <div className="md:col-span-7 space-y-10 lg:pt-2">
           <div className="space-y-4 hidden md:block">
              <div className="flex gap-3"><Badge variant="mineral">{getCategoryLabel(recipe.category).toUpperCase()}</Badge></div>
              <h1 className="text-4xl md:text-5xl font-display font-black uppercase text-gray-900 dark:text-gray-100 leading-[0.9]">{recipe.name}</h1>
              {thaiOf(recipe) && <Typography variant="h4" className="text-primary italic opacity-90">{thaiOf(recipe)}</Typography>}
           </div>

           {/* 🛡️ SAFETY SHIELD CARDS */}
           {activeConflicts.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-in slide-in-from-bottom-4 duration-500">
                 {activeConflicts.map((conflict, idx) => (
                    <div key={idx} className="relative overflow-hidden rounded-3xl bg-allergy/10 border border-allergy/30 p-6 flex items-start gap-6 shadow-glow-allergy">
                       <div className="size-14 rounded-2xl bg-allergy/20 flex items-center justify-center shrink-0 border border-allergy/30 animate-pulse text-allergy"><Icon name="health_and_safety" size="lg" /></div>
                       <div className="space-y-1">
                          <Typography variant="h5" className="text-gray-900 dark:text-gray-100 uppercase font-black">Contains {conflict.allergen}</Typography>
                          <Typography variant="body" className="text-gray-700 dark:text-gray-300 text-xs leading-relaxed opacity-90">{conflict.warning}</Typography>
                       </div>
                    </div>
                 ))}
              </div>
           )}

           <Divider variant="mineral" />
           <Typography variant="paragraphL" className="text-gray-700 dark:text-gray-300 font-light leading-relaxed whitespace-pre-wrap text-lg">{recipe.description}</Typography>

           {/* 🌿 PUBLIC INGREDIENTS GRID */}
           <div>
              <div className="flex items-center justify-between mb-6">
                 <Typography variant="h4" className="text-secondary uppercase italic">Key Ingredients</Typography>
                 <div className="h-px flex-1 bg-border ml-8 opacity-20" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                 {visibleIngredientsNames.map((ingName, idx) => {
                    // Confronto sulla chiave INGLESE: `name` puo' essere tradotto, ingName no.
                    const details = richIngredients.find(i => i.name_key === ingName);
                    return (
                       <button key={idx} onClick={() => details && setActiveIngredient(details)} className="relative flex items-stretch h-20 rounded-2xl overflow-hidden border border-white/10 bg-white/5 backdrop-blur-md hover:bg-white/10 hover:border-secondary/50 transition-all duration-300 group">
                          <div className="w-[25%] relative overflow-hidden border-r border-white/5">
                             <MediaImage
                                url={details?.image_url}
                                fallbackAlt={ingName}
                                showCaption={false}
                                imgClassName="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                             />
                             <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                          </div>
                          <div className="flex-1 px-4 flex flex-col justify-center">
                             <span className="font-bold text-sm uppercase text-white group-hover:text-secondary truncate">{ingName}</span>
                             <div className="flex items-center gap-1 mt-1 text-[8px] text-white/40 uppercase tracking-widest"><Icon name="info" size="xs" />Tap Detail</div>
                          </div>
                       </button>
                    )
                 })}
                 {visibleIngredientsNames.length === 0 && !loadingIng && (
                    <div className="col-span-full py-10 border border-dashed border-white/10 rounded-2xl text-center opacity-30 italic text-sm">Ingredient details restricted to public.</div>
                 )}
              </div>
           </div>
        </div>
      </div>

      {/* --- FLOATING SELECTION FOOTER --- */}
      {onConfirmSelection && (
         <div className="fixed bottom-0 left-0 right-0 z-[60] p-6 bg-gradient-to-t from-black via-black/80 to-transparent flex justify-center animate-in slide-in-from-bottom-8">
            <div className="w-full max-w-lg">
               <Button variant={isSelected ? "mineral" : "action"} size="lg" fullWidth onClick={() => onConfirmSelection(recipe)} disabled={isSelected} className="shadow-2xl h-16 rounded-[1.5rem] font-black tracking-widest text-lg">
                  {isSelected ? "Already in Menu" : "Add to Menu"}
               </Button>
            </div>
         </div>
      )}

      {/* MODALS */}
      <GalleryModal isOpen={isGalleryOpen} onClose={() => setIsGalleryOpen(false)} items={galleryItems} startIndex={galleryStartIndex} />
      <audio ref={audioRef} className="hidden" onEnded={() => setActiveAudio(null)} />

      <Modal isOpen={!!activeIngredient} onClose={() => setActiveIngredient(null)} variant="cinema" className="bg-surface-elevated border border-white/10 max-w-sm w-full mx-auto p-0 overflow-hidden rounded-[2.5rem]">
         {activeIngredient && (
           <div className="flex flex-col relative">
              <div className="h-64 w-full relative">
                 <MediaImage
                   url={activeIngredient.image_url}
                   fallbackAlt={activeIngredient.name}
                   showCaption={false}
                   imgClassName="w-full h-full object-cover"
                 />
                 <div className="absolute inset-0 bg-gradient-to-t from-[#1a1a1a] to-transparent" />
                 <div className="absolute bottom-6 left-6 right-6">
                    <Typography variant="h3" className="text-white uppercase italic leading-none mb-1 text-3xl">{activeIngredient.name}</Typography>
                    {thaiOf(activeIngredient) && (
                      <div className="flex items-center gap-2 text-primary">
                         <Typography variant="h5">{thaiOf(activeIngredient)}</Typography>
                      </div>
                    )}
                 </div>
              </div>
              <div className="p-8 pt-4 space-y-6">
                 {/* description dal DB è HTML (192 righe con <p>/<strong>) → render con prose
                     come IngredientModal/IngredientPageSingle, non testo grezzo. */}
                 <Typography
                    as="div"
                    variant="body"
                    className="text-white/70 leading-relaxed text-sm font-light [&_strong]:font-bold [&_em]:italic [&_a]:text-action [&_a]:font-bold hover:[&_a]:underline recipe-prose"
                    dangerouslySetInnerHTML={{ __html: sanitizeHtml(activeIngredient.description ?? '') }}
                 />
                 <Button variant="mineral" fullWidth onClick={() => setActiveIngredient(null)} className="h-12">Close Details</Button>
              </div>
           </div>
         )}
      </Modal>
    </div>
  );
};

export default RecipeView;