
import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Typography, Icon, Badge, Tabs, Button } from '../ui'; // [Source: UI Index]
import { MenuCard } from '../menu';
import RecipeView, { RecipeData } from '../menu/RecipeView';
import { cn } from '../../lib/utils';
import AkhaPixelPattern from '../ui/AkhaPixelPattern';

interface MenuManagerProps {
  bookingId: string | null;
  bookings: any[];
  onSelectBooking: (id: string) => void;
  menuSelection: any | null;
  onNavigate: (page: string, topic?: string, sectionId?: string) => void;
}

// Dati statici per le descrizioni delle categorie (System 4.8)
const CATEGORY_INFO: Record<string, string> = {
  akha_specialty: "Authentic Akha mountain dishes using traditional techniques and foraged ingredients.",
  appetizer: "Handcrafted starters designed to awaken your senses with crunchy textures and fresh Thai herbs.",
  dessert: "Traditional Thai sweets showcasing the natural sweetness of ripe tropical fruits and coconut cream."
};

const MenuManager: React.FC<MenuManagerProps> = ({
  bookingId,
  bookings,
  onSelectBooking,
  menuSelection,
  onNavigate
}) => {
  const [loading, setLoading] = useState(true);
  const [selectedDishes, setSelectedDishes] = useState<any[]>([]);
  const [fixedDishes, setFixedDishes] = useState<any[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>('akha_specialty');
  const [viewingRecipe, setViewingRecipe] = useState<RecipeData | null>(null);

  // --- DATA FETCHING ---
  useEffect(() => {
    const fetchMenuDetails = async () => {
      setLoading(true);
      try {
        // 1. Fetch Fixed Dishes (Included Experience)
        const { data: fixed } = await supabase
            .from('recipes')
            .select('*, recipe_key_ingredients(ingredient)')
            .eq('is_fixed_dish', true)
            .order('category');
        
        if (fixed) setFixedDishes(fixed);

        // 2. Fetch Selected Dishes (Your Menu)
        if (menuSelection) {
          const ids = [
            menuSelection.curry_id,
            menuSelection.soup_id,
            menuSelection.stirfry_id
          ].filter(Boolean);

          if (ids.length > 0) {
            const { data: selected } = await supabase.from('recipes').select('*').in('id', ids);
            const ordered = [
              selected?.find(r => r.id === menuSelection.curry_id),
              selected?.find(r => r.id === menuSelection.soup_id),
              selected?.find(r => r.id === menuSelection.stirfry_id)
            ].filter(Boolean);
            
            setSelectedDishes(ordered as any[]);
          } else {
             setSelectedDishes([]);
          }
        } else {
            setSelectedDishes([]);
        }
      } catch (err) {
        console.error("Menu Fetch Error:", err);
      } finally {
        setTimeout(() => setLoading(false), 300);
      }
    };
    fetchMenuDetails();
  }, [menuSelection]);

  // --- HELPERS ---
  
  // LOGICA CUSTOM: Unisce piatti DB e Schede Culturali
  const getDisplayItems = (cat: string) => {
    const dbItems = fixedDishes.filter(d => d.category === cat);

    // 1. APPETIZER: Aggiungi scheda "Wooden Mortar"
    if (cat === 'appetizer') {
        const culturalCard = {
            id: 'culture-mortar',
            name: 'The Wooden Mortar',
            thai_name: 'Krok Mai',
            // Placeholder immagine Mortaio
            image: 'https://mtqullobcsypkqgdkaob.supabase.co/storage/v1/object/public/showcase/bg-04.webp', 
            description: 'Why wood? We use the "Krok" to gently bruise the papaya, absorbing flavors without crushing the texture.',
            isCultural: true,
            icon: 'soup_kitchen'
        };
        return [...dbItems, culturalCard];
    }

    // 2. DESSERT: Aggiungi scheda "Magic Rice Color"
    if (cat === 'dessert') {
        const culturalCard = {
            id: 'culture-rice',
            name: 'Natural Chemistry',
            thai_name: 'Anchan Lime',
            // Placeholder immagine Blue Tea
            image: 'https://mtqullobcsypkqgdkaob.supabase.co/storage/v1/object/public/showcase/bg-05.webp', 
            description: 'Watch the magic! We boil Blue Pea flowers, then squeeze lime to turn the rice from blue to vibrant purple.',
            isCultural: true,
            icon: 'science'
        };
        return [...dbItems, culturalCard];
    }

    return dbItems;
  };

  // Tabs Configuration
  const FIXED_TABS = [
    { value: 'akha_specialty', label: 'Akha Heritage', icon: 'landscape', activeColor: 'secondary' as const },
    { value: 'appetizer', label: 'Appetizers', icon: 'tapas', activeColor: 'secondary' as const },
    { value: 'dessert', label: 'Desserts', icon: 'icecream', activeColor: 'secondary' as const },
  ];

  // 2. MAPPER CORRETTO (Senza errori rossi)
  const mapToRecipeData = (r: any): RecipeData => ({
    id: r.id,
    name: r.name,
    thai_name: r.thai_name,
    description: r.description,
    category: r.category,
    image: r.image,
    spiciness: r.spiciness || 0,
    
    // Booleani Dietetici
    isVegan: r.is_vegan,
    isVegetarian: r.is_vegetarian,
    
    // Allergeni (TUTTI OBBLIGATORI per RecipeData)
    hasPeanuts: r.has_peanuts || false,
    hasGluten: r.has_gluten || false,
    hasShellfish: r.has_shellfish || false,
    hasSoy: r.has_soy || false,
    
    // Metadata (OBBLIGATORI)
    isSignature: r.is_signature || false,
    isFixedDish: r.is_fixed_dish || false,
    
    healthBenefits: r.health_benefits || "Traditional Akha medicine and nutrition.",
    keyIngredients: r.recipe_key_ingredients?.map((i: any) => i.ingredient) || [],
    
    // Fix: Added missing galleryImages property kha
    galleryImages: r.gallery_images || [],
    // ✅ FIX COLORE: Priorità DB > Fallback
    colorTheme: r.color_theme || '#ED5565'
  });

  const handleEditMenu = () => {
      if (bookingId) onNavigate('menu', undefined, bookingId);
      else onNavigate('menu');
  };

  const handleAskCherry = (dish: any) => {
    const topic = `Tell me about the tradition of ${dish.name} kha`;
    window.dispatchEvent(new CustomEvent('trigger-chat-topic', { detail: { topic } }));
  };

  const handlePlayMusic = (name: string) => {
      alert(`Playing traditional song for: ${name}`);
  };

  // --- VISTA DETTAGLIO OVERLAY ---
  if (viewingRecipe) {
      return (
          <div className="animate-in slide-in-from-bottom-8 duration-500">
              <RecipeView 
                recipe={viewingRecipe} 
                allRecipes={fixedDishes.map(mapToRecipeData)}
                activeDiet="regular"
                onBack={() => setViewingRecipe(null)} 
                onSelectDish={(dish) => setViewingRecipe(dish)} 
              />
          </div>
      );
  }

  // --- MAIN DASHBOARD VIEW ---
  return (
    <div className="space-y-16 pb-24 animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      {/* 1. SECTION: HEADER & DATE SELECTOR */}
      <section className="space-y-12">
        <div className="flex flex-col md:flex-row justify-between items-end gap-6 border-l-4 border-primary pl-6">
            <div className="space-y-4 max-w-2xl">
                <Typography variant="h2" className="uppercase text-title leading-none tracking-tighter">
                    Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-secondary to-action">Menu</span>
                </Typography>
                <Typography variant="paragraphL" className="text-desc">
                    These are the 3 signature dishes you will master at your personal station.
                </Typography>
            </div>

            {bookings.length > 0 && (
                <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1 self-start md:self-end">
                    {bookings.map(b => {
                        const isActive = b.internal_id === bookingId;
                        const dateObj = new Date(b.booking_date);
                        const isMorning = b.session_id.includes('morning');
                        return (
                            <button
                                key={b.internal_id}
                                onClick={() => onSelectBooking(b.internal_id)}
                                disabled={bookings.length === 1}
                                className={cn(
                                    "flex items-center gap-2 px-4 py-2 rounded-full border transition-all whitespace-nowrap",
                                    isActive 
                                        ? "bg-title text-surface border-title shadow-lg font-bold" 
                                        : "bg-surface border-border text-desc hover:bg-black/5 dark:hover:bg-white/10",
                                    bookings.length === 1 && "cursor-default opacity-100"
                                )}
                            >
                                <span className="text-base font-black uppercase">
                                    {dateObj.getDate()} {dateObj.toLocaleDateString('en-US', { month: 'short' })}
                                </span>
                                <Icon name={isMorning ? "wb_sunny" : "dark_mode"} size="md" />
                            </button>
                        )
                    })}
                </div>
            )}
        </div>

        {/* 3 HERO CARDS (Selected Menu) */}
        {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 mt-8 gap-8">
                {[1-3].map(i => <div key={i} className="h-[320px] rounded-[2.5rem] bg-black/5 dark:bg-white/5 border border-border animate-pulse" />)}
            </div>
        ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 mt-8 gap-8 animate-in fade-in duration-500">
            {['Curry', 'Soup', 'Stir-fry'].map((type, idx) => {
                const dish = selectedDishes[idx]; 
                
                // Card Vuota: Usa colori adattivi
                if (!dish) return (
                <div key={type} onClick={handleEditMenu} className="group relative h-[320px] rounded-[2.5rem] bg-surface/50 border-2 border-dashed border-border flex flex-col items-center justify-center cursor-pointer hover:border-primary/50 hover:bg-primary/5 transition-all">
                    <div className="size-16 rounded-full bg-black/5 dark:bg-white/5 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                        <Icon name="add" className="opacity-50 text-desc" />
                    </div>
                    <Typography variant="caption" className="uppercase tracking-widest opacity-50">Select {type}</Typography>
                </div>
                );

                // Card Piena: Usa overlay scuro (Dark context forzato) per contrasto su foto
                return (
                <div key={dish.id} onClick={handleEditMenu} className="group relative h-[320px] rounded-[2.5rem] overflow-hidden border border-border isolate cursor-pointer hover:border-primary/50 transition-all">
                    <img src={dish.image} alt={dish.name} className="absolute inset-0 w-full h-full object-cover transition-transform duration-[2s] group-hover:scale-110 opacity-90 group-hover:opacity-100" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
                    
                    <div className="absolute top-4 left-4 px-3 py-1.5 rounded-full bg-black/60 backdrop-blur-md border border-white/10 text-[10px] font-black uppercase tracking-widest z-20 text-white shadow-sm">
                        Your {type}
                    </div>
                    
                    <div className="absolute top-4 right-4 z-20 opacity-0 group-hover:opacity-100 transition-opacity bg-black/50 p-2 rounded-full backdrop-blur-md">
                        <Icon name="edit" size="sm" className="text-white"/>
                    </div>
                    
                    <div className="absolute bottom-0 left-0 right-0 p-6 z-20">
                        <Typography variant="h4" className="text-white italic uppercase leading-none mb-2 drop-shadow-lg translate-y-2 group-hover:translate-y-0 transition-transform duration-500">
                            {dish.name}
                        </Typography>
                        <Typography variant="caption" className="text-white/80 line-clamp-2 opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-100 font-medium">
                            {dish.description}
                        </Typography>
                    </div>
                </div>
                );
            })}
            </div>
        )}
      </section>

            <div className="flex justify-center pt-10 pb-6 opacity-40">
            <AkhaPixelPattern 
                variant="line"
                size={10}          
                speed={60}        
                expandFromCenter={true}
                className="gap-2" // gap-1.5 = 6px di spazio

            />
            </div>

      {/* 2. SECTION: INCLUDED EXPERIENCE (Con Schede Culturali Stile Food Quiz) */}
      <section className="space-y-10">
        
        {/* Intestazione */}
        <div className="text-center space-y-4 max-w-3xl mx-auto">
            <Typography variant="h2" className="text-title uppercase tracking-tighter">
                Included <span className="text-transparent bg-clip-text bg-gradient-to-r from-secondary to-action">Experience</span>
            </Typography>
            
            {/* DECORATIVE LINE (Logo) - Adattivo */}
            <div className="mb-4 mx-auto opacity-90 hover:opacity-100 transition-opacity">
                <AkhaPixelPattern variant="logo" size={4} speed={40}/>
            </div>
            
            <Typography variant="paragraphL" className="text-desc">
                In addition to your selected dishes, we prepare these traditional recipes together.
            </Typography>
        </div>

        {/* TABS */}
        <div className="flex justify-center w-full">
             <div className="pointer-events-auto drop-shadow-lg">
                <Tabs items={FIXED_TABS} value={activeCategory} onChange={setActiveCategory} variant="pills" />
             </div>
        </div>

        {/* Descrizione Categoria */}
        <div className="text-center max-w-2xl mt-4 mb-4 mx-auto min-h-[4rem] animate-in fade-in slide-in-from-bottom-2 duration-500 key={activeCategory}">
            <Typography variant="paragraphL" className="italic text-desc/80 leading-relaxed">
                "{CATEGORY_INFO[activeCategory]}"
            </Typography>
        </div>

        {/* GRID MISTA (Ricette DB + Schede Culturali Custom Style) */}
        <div>
            {loading ? (
                <div className="text-center py-12 text-desc/40">Loading heritage...</div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 animate-in slide-in-from-bottom-4 duration-700">
                    
                    {getDisplayItems(activeCategory).map((item: any) => {
                        // Verifica se è una scheda culturale custom
                        const isCultural = item.isCultural === true;

                        return (
                            <div key={item.id} className="h-full">
                                {isCultural ? (
                                    // === ✨ NUOVA SCHEDA CULTURALE (Food Quiz Style) ===
                                    <div className="group relative h-full min-h-[420px] rounded-[2rem] overflow-hidden border-2 border-transparent transition-all duration-500 ease-cinematic hover:border-action/50 hover:shadow-[0_20px_50px_-10px_rgba(255,117,151,0.3)]">
                                         
                                         {/* 1. PHOTO FULL (Background Layer) */}
                                         <div className="absolute inset-0 z-0">
                                            <img 
                                                src={item.image} 
                                                alt={item.name} 
                                                className="w-full h-full object-cover transition-transform duration-[2s] ease-cinematic group-hover:scale-105 opacity-80 group-hover:opacity-60" 
                                            />
                                            {/* Flash Effect */}
                                            <div className="absolute inset-0 z-10 bg-gradient-to-tr from-transparent via-white/20 to-transparent opacity-0 group-hover:animate-flash pointer-events-none" />
                                         </div>

                                         {/* 2. FLOATING GLASS PANEL */}
                                         <div className="absolute inset-x-4 bottom-4 top-[35%] bg-surface/90 dark:bg-black/60 backdrop-blur-xl border border-white/20 dark:border-white/10 rounded-[2rem] p-6 flex flex-col justify-between transition-all duration-500 group-hover:bg-surface/95 dark:group-hover:bg-black/70 group-hover:border-primary/30">
                                            
                                            {/* Top Content */}
                                            <div>
                                                <div className="flex items-center gap-2 mb-3">
                                                    <Icon name={item.icon} className="text-primary animate-pulse-slow" size="md"/>
                                                    <span className="font-accent font-bold text-primary uppercase tracking-widest text-xs">
                                                        Did you know?
                                                    </span>
                                                </div>
                                                
                                                <h3 className="font-display font-black text-3xl text-title uppercase italic leading-none mb-3">
                                                    {item.name}
                                                </h3>
                                                
                                                <p className="font-sans text-sm text-desc leading-relaxed line-clamp-4">
                                                    {item.description}
                                                </p>
                                            </div>

                                            {/* Footer Actions */}
                                            <div className="flex items-center justify-between border-t border-border/50 pt-4 mt-2">
                                                <Badge variant="brand" className="shadow-lg shadow-primary/20">
                                                    CULTURE
                                                </Badge>

                                                <Button 
                                                    variant="mineral"
                                                    size="sm"
                                                    onClick={(e) => { e.stopPropagation(); handlePlayMusic(item.name); }}
                                                    className="rounded-full px-4 h-10 border-border/50 hover:border-primary text-xs"
                                                    icon="music_note"
                                                >
                                                    Listen
                                                </Button>
                                            </div>
                                         </div>
                                    </div>
                                ) : (
                                    // === SCHEDA RICETTA STANDARD ===
                                    <MenuCard
                                        dish={mapToRecipeData(item)}
                                        isSelected={false}
                                        isDemo={false}
                                        actionLabel="Discover"
                                        disableBodyCursor={true}
                                        onClick={() => setViewingRecipe(mapToRecipeData(item))}
                                        onPreview={() => setViewingRecipe(mapToRecipeData(item))}
                                        onAskCherry={() => handleAskCherry(item)}
                                    />
                                )}
                            </div>
                        );
                    })}
                </div>
            )}
            
            {!loading && getDisplayItems(activeCategory).length === 0 && (
                <div className="py-20 text-center opacity-60 bg-surface/50 rounded-[3rem] border border-dashed border-border">
                    <Typography variant="caption">No items in this category yet.</Typography>
                </div>
            )}
        </div>
      </section>

    </div>
  );
};

export default MenuManager;
