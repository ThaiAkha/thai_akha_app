import React, { useState, useEffect, useMemo } from 'react';
import { supabase } from '../../lib/supabase';
import { Badge, Typography, Button, Icon, Modal } from '../ui/index';
import { cn } from '../../lib/utils';
import { DIETARY_KNOWLEDGE_BASE } from '../../data/dietaryKnowledge';

// --- INTERFACCE ---

interface Dish {
  id: string;
  name: string;
  thai_name?: string;
  description: string;
  category: string;
  image: string;
  spiciness: number;
  // Flags Allergeni
  hasPeanuts: boolean;
  hasShellfish: boolean;
  hasGluten: boolean;
  hasSoy: boolean;
  hasEggs?: boolean;
  hasDairy?: boolean;
  // Dati
  keyIngredients: string[];
  healthBenefits: string;
  colorTheme: string;
  isVegan: boolean;
  isVegetarian: boolean;
}

interface IngredientDetail {
  id: string;
  name_en: string;
  name_th: string;
  phonetic?: string;
  description: string;
  image_url: string;
  is_visible_public: boolean;
}

interface RecipeDetailProps {
  dish: Dish;
  userAllergies?: string[]; // Array di stringhe ["Peanuts", "Shellfish"]
  onClose: () => void;
  onSelect: (dish: Dish) => void;
  selections: any;
}

const RecipeDetail: React.FC<RecipeDetailProps> = ({
  dish,
  userAllergies = [],
  onClose,
  onSelect,
  selections
}) => {
  const [activeIngredient, setActiveIngredient] = useState<IngredientDetail | null>(null);
  const [richIngredients, setRichIngredients] = useState<IngredientDetail[]>([]);
  const [loadingIng, setLoadingIng] = useState(false);

  // --- 1. RILEVAMENTO CONFLITTI ALLERGIE ---
  const activeConflicts = useMemo(() => {
    const conflicts: { allergen: string; warning: string }[] = [];
    
    // Mappa tra nome allergia utente e flag ricetta
    const checkMap: Record<string, boolean> = {
      'Peanuts': dish.hasPeanuts,
      'Shellfish': dish.hasShellfish,
      'Gluten': dish.hasGluten,
      'Soy': dish.hasSoy,
      'Eggs': dish.hasEggs || false,
      'Dairy': dish.hasDairy || false
    };

    userAllergies.forEach(allergen => {
      // Se la ricetta contiene l'allergene
      if (checkMap[allergen]) {
        // Recupera il testo di avviso dalla Knowledge Base
        const warningKey = allergen.toLowerCase() as keyof typeof DIETARY_KNOWLEDGE_BASE.allergyWarnings;
        const warningText = DIETARY_KNOWLEDGE_BASE.allergyWarnings[warningKey] || "We will remove this ingredient for safety.";
        
        conflicts.push({ allergen, warning: warningText });
      }
    });

    return conflicts;
  }, [dish, userAllergies]);

  // --- 2. FETCH DETTAGLI INGREDIENTI (Lazy Load) ---
  useEffect(() => {
    const fetchIngredients = async () => {
      if (!dish.keyIngredients.length) return;
      setLoadingIng(true);
      
      // Cerchiamo nel DB gli ingredienti che matchano i nomi
      const { data } = await supabase
        .from('ingredients_library')
        .select('id, name_en, name_th, phonetic, description, image_url, is_visible_public')
        .in('name_en', dish.keyIngredients);

      if (data) {
        setRichIngredients(data);
      }
      setLoadingIng(false);
    };

    fetchIngredients();
  }, [dish.id, dish.keyIngredients]);

  // --- 3. PRIVACY FILTER ---
  const visibleIngredients = useMemo(() => {
    // Only display ingredients where item.is_visible_public === true
    return dish.keyIngredients.filter(name => {
      const rich = richIngredients.find(ri => ri.name_en === name);
      // If we haven't loaded it yet, we default to hide it to avoid flickering 
      // sensitive logistics items to the public
      return rich ? rich.is_visible_public : false;
    });
  }, [dish.keyIngredients, richIngredients]);

  // --- 4. HELPER SELEZIONE ---
  const isSelected = Object.values(selections).some((s: any) => s?.id === dish.id);

  return (
    <div className="fixed inset-0 z-[1] flex flex-col bg-[#0a0a0a] text-desc animate-in fade-in duration-500">
      
      {/* BACKGROUND CINEMATIC */}
      <div className="absolute inset-0 z-0">
         <img src={dish.image} className="w-full h-full object-cover opacity-20 blur-2xl scale-110" />
         <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-[#0a0a0a]/90 to-transparent" />
      </div>

      {/* HEADER NAVIGAZIONE */}
      <div className="relative z-20 flex items-center justify-between p-6">
        <button onClick={onClose} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white hover:bg-white/10 transition-all">
           <Icon name="arrow_back" size="sm"/>
           <span className="text-xs font-black uppercase tracking-widest">Back</span>
        </button>
      </div>

      {/* CONTENUTO SCROLLABILE */}
      <div className="relative z-10 flex-1 overflow-y-auto custom-scrollbar px-6 pb-32">
        <div className="max-w-4xl mx-auto space-y-10">

          {/* --- HERO SECTION --- */}
          <div className="text-center space-y-4">
             <Badge variant="mineral" className="bg-white/5 border-white/10">{dish.category.toUpperCase()}</Badge>
             
             <Typography variant="display2" className="text-white drop-shadow-2xl">
               {dish.name}
             </Typography>
             
             {dish.thai_name && (
               <Typography variant="h4" className="text-primary italic font-display opacity-90">
                 {dish.thai_name}
               </Typography>
             )}
          </div>

          {/* --- ⚠️ SAFETY ALERTS (SCHEDE UNICHE PER ALLERGIA) --- */}
          {activeConflicts.length > 0 && (
            <div className="space-y-3 animate-in slide-in-from-bottom-4 duration-700">
               {activeConflicts.map((conflict, idx) => (
                 <div 
                    key={idx}
                    className="relative overflow-hidden rounded-2xl bg-allergy/10 border border-allergy/30 p-5 flex items-start gap-5 shadow-[0_0_30px_-10px_rgba(239,68,68,0.3)]"
                 >
                    <div className="size-12 rounded-xl bg-allergy/20 flex items-center justify-center shrink-0 border border-allergy/30 animate-pulse">
                       <Icon name="health_and_safety" size="md" className="text-allergy" />
                    </div>

                    <div className="space-y-1">
                       <div className="flex items-center gap-2">
                          <span className="text-xs font-black text-allergy uppercase tracking-[0.2em]">Safety Alert</span>
                          <span className="h-px w-8 bg-allergy/30"></span>
                       </div>
                       <Typography variant="h5" className="text-white uppercase font-black">
                          Contains {conflict.allergen}
                       </Typography>
                       <Typography variant="body" className="text-desc text-sm leading-relaxed">
                          {conflict.warning}
                       </Typography>
                    </div>

                    <div className="absolute top-4 right-4">
                       <Badge variant="allergy" active={true}>Modifying Recipe</Badge>
                    </div>
                 </div>
               ))}
            </div>
          )}

          {/* DESCRIPTION */}
          <Typography variant="paragraphL" className="text-center text-white/80 leading-relaxed font-light">
            {dish.description}
          </Typography>

          {/* --- INGREDIENTS INTERACTIVE GRID --- */}
          {visibleIngredients.length > 0 && (
            <div>
              <div className="flex items-center gap-4 mb-6">
                 <div className="size-10 rounded-full bg-white/10 flex items-center justify-center text-white">
                    <Icon name="grocery" />
                 </div>
                 <Typography variant="h4" className="text-white italic">Key Ingredients</Typography>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                 {visibleIngredients.map((ingName, idx) => {
                   const details = richIngredients.find(i => i.name_en === ingName);
                   const hasDetails = !!details;

                   return (
                     <button
                       key={idx}
                       onClick={() => hasDetails && setActiveIngredient(details)}
                       className={cn(
                         "relative h-32 rounded-2xl border flex flex-col items-center justify-center gap-3 p-4 transition-all duration-300 group overflow-hidden",
                         hasDetails 
                           ? "bg-[#1a1a1a] border-white/10 hover:border-primary/50 hover:bg-white/5 cursor-pointer" 
                           : "bg-white/5 border-transparent cursor-default"
                       )}
                     >
                        {hasDetails && (
                          <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                             <Icon name="info" size="xs" className="text-primary"/>
                          </div>
                        )}
                        
                        <div className="size-2 rounded-full bg-primary shadow-glow-primary"></div>
                        
                        <span className="font-display font-black uppercase text-sm text-center text-white z-10">
                          {ingName}
                        </span>

                        {details && (
                           <span className="text-[10px] text-primary font-accent uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-all absolute bottom-3">
                              {details.name_th}
                           </span>
                        )}
                     </button>
                   )
                 })}
              </div>
            </div>
          )}

        </div>
      </div>

      {/* FOOTER ACTION */}
      <div className="p-6 border-t border-white/10 bg-[#0a0b0d]/90 backdrop-blur-xl relative z-20">
         <div className="max-w-4xl mx-auto">
            <Button 
               variant={isSelected ? "mineral" : "action"} 
               size="xl" 
               fullWidth
               onClick={() => onSelect(dish as any)}
               disabled={isSelected}
               className="shadow-xl"
            >
               {isSelected ? "Dish Selected" : "Add to Menu"}
            </Button>
         </div>
      </div>

      {/* --- MODAL DETTAGLIO INGREDIENTE --- */}
      <Modal 
        isOpen={!!activeIngredient} 
        onClose={() => setActiveIngredient(null)}
        variant="cinema"
        className="bg-[#1a1a1a] border border-white/10 max-w-sm w-full mx-6 p-0 overflow-hidden rounded-[2.5rem]"
      >
         {activeIngredient && (
           <div className="flex flex-col relative">
              <div className="h-64 w-full relative">
                 <img src={activeIngredient.image_url} className="w-full h-full object-cover" />
                 <div className="absolute inset-0 bg-gradient-to-t from-[#1a1a1a] to-transparent" />
                 
                 <div className="absolute bottom-6 left-6 right-6">
                    <Typography variant="h3" className="text-white uppercase italic leading-none mb-1">
                       {activeIngredient.name_en}
                    </Typography>
                    <div className="flex items-center gap-2 text-primary">
                       <Typography variant="h5">{activeIngredient.name_th}</Typography>
                       {activeIngredient.phonetic && (
                          <span className="text-xs opacity-60">({activeIngredient.phonetic})</span>
                       )}
                    </div>
                 </div>
              </div>

              <div className="p-8 pt-2 space-y-6">
                 <div className="w-12 h-1 bg-white/10 rounded-full mx-auto" />
                 <Typography variant="body" className="text-center text-white/70 leading-relaxed">
                    {activeIngredient.description}
                 </Typography>
                 <Button variant="mineral" fullWidth onClick={() => setActiveIngredient(null)}>
                    Close Details
                 </Button>
              </div>
           </div>
         )}
      </Modal>

    </div>
  );
};

export default RecipeDetail;