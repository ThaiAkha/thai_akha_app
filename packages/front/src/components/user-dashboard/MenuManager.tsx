
import React from 'react';
import { Typography, Icon, Badge, Tabs, Button } from '../ui'; // [Source: UI Index]
import { MenuCard } from '../menu';
import RecipeView from '../menu/RecipeView';
import { cn } from '@thaiakha/shared/lib/utils';
import AkhaPixelPattern from '../divider/AkhaPixelPattern';
import { mapToRecipeData } from '../../lib/recipeHelpers';
import { useMenuManager } from './menuManager/useMenuManager';
import type { MenuManagerProps } from './menuManager/types';

// Stato e dati in ./menuManager/useMenuManager (#16 split monstre): qui solo il render.
const MenuManager: React.FC<MenuManagerProps> = ({
  bookingId,
  bookings,
  onSelectBooking,
  menuSelection,
  onNavigate
}) => {
  const m = useMenuManager({ bookingId, menuSelection, onNavigate });
  const { loading, selectedDishes, fixedDishes, activeCategory, setActiveCategory, viewingRecipe, setViewingRecipe, getDisplayItems, FIXED_TABS, getCategoryDescription, handleEditMenu, handleAskCherry, handlePlayMusic } = m;

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
    <div className="[space-y:var(--space-fluid-section)] [padding-bottom:var(--space-fluid-2xl)] animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      {/* 1. SECTION: HEADER & DATE SELECTOR */}
      <section className="[space-y:var(--space-fluid-xl)]">
        <div className="flex flex-col md:flex-row justify-between items-end gap-6 border-l-4 border-primary [padding-left:var(--space-fluid-m)]">
            <div className="[space-y:var(--space-fluid-s)] max-w-2xl">
                <Typography variant="h2" className="uppercase leading-none tracking-tighter">
                    Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-secondary to-action">Menu</span>
                </Typography>
                <Typography variant="paragraphL" color="sub">
                    These are the 3 signature dishes you will master at your personal station.
                </Typography>
            </div>

            {bookings.length > 0 && (
                <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1 self-start md:self-end">
                    {bookings.map(b => {
                        const isActive = b.internal_id === bookingId;
                        const dateObj = new Date(b.booking_date);
                        const isMorning = (b.session_id ?? '').includes('morning');
                        return (
                            <button
                                key={b.internal_id}
                                onClick={() => onSelectBooking(b.internal_id)}
                                disabled={bookings.length === 1}
                                className={cn(
                                    "flex items-center gap-2 px-5 py-2.5 rounded-full border transition-all whitespace-nowrap",
                                    isActive 
                                        ? "bg-title text-inverse border-title shadow-lg font-bold" 
                                        : "bg-surface border-border text-sub hover:bg-surface-2",
                                    bookings.length === 1 && "cursor-default opacity-100"
                                )}
                            >
                                <Typography variant="badge" color="inherit">
                                    {dateObj.getDate()} {dateObj.toLocaleDateString('en-US', { month: 'short' })}
                                </Typography>
                                <Icon name={isMorning ? "wb_sunny" : "dark_mode"} size="md" />
                            </button>
                        )
                    })}
                </div>
            )}
        </div>

        {/* 3 HERO CARDS (Selected Menu) */}
        {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 [margin-top:var(--space-fluid-m)] [gap:var(--space-fluid-m)]">
                {[1, 2, 3].map(i => <div key={i} className="h-[320px] rounded-[2.5rem] bg-surface-2 animate-pulse" />)}
            </div>
        ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 [margin-top:var(--space-fluid-m)] [gap:var(--space-fluid-m)] animate-in fade-in duration-500">
            {['Curry', 'Soup', 'Stir-fry'].map((type, idx) => {
                const dish = selectedDishes[idx]; 
                
                // Card Vuota: Usa colori adattivi
                if (!dish) return (
                <div key={type} onClick={handleEditMenu} className="group relative h-[320px] rounded-[2.5rem] bg-surface-base border-2 border-dashed border-border/60 flex flex-col items-center justify-center cursor-pointer hover:border-primary/50 hover:bg-primary/5 transition-all">
                    <div className="size-16 rounded-full bg-surface-2 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                        <Icon name="add" className="opacity-50 text-sub" />
                    </div>
                    <Typography variant="microLabel" color="muted">Select {type}</Typography>
                </div>
                );

                // Card Piena: Usa overlay scuro (Dark context forzato) per contrasto su foto
                return (
                <div key={dish.id} onClick={handleEditMenu} className="group relative h-[320px] rounded-[2.5rem] overflow-hidden border border-border/50 isolate cursor-pointer hover:border-primary/50 hover:shadow-xl transition-all">
                    <img src={dish.image} alt={dish.name} className="absolute inset-0 w-full h-full object-cover transition-transform duration-[2s] group-hover:scale-110 opacity-90 group-hover:opacity-100" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
                    
                    <div className="absolute top-4 left-4 px-3 py-1.5 rounded-full bg-black/60 backdrop-blur-md border border-white/10 z-20 shadow-sm">
                        <Typography variant="microLabel" className="text-white">Your {type}</Typography>
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

      <div className="flex justify-center [padding-vertical:var(--space-fluid-m)] opacity-40">
      <AkhaPixelPattern 
          variant="line"
          size={10}          
          speed={60}        
          expandFromCenter={true}
          className="gap-2"
      />
      </div>

      {/* 2. SECTION: INCLUDED EXPERIENCE (Con Schede Culturali Stile Food Quiz) */}
      <section className="[space-y:var(--space-fluid-l)]">
        
        {/* Intestazione */}
        <div className="text-center [space-y:var(--space-fluid-s)] max-w-3xl mx-auto">
            <Typography variant="h2" className="uppercase tracking-tighter">
                Included <span className="text-transparent bg-clip-text bg-gradient-to-r from-secondary to-action">Experience</span>
            </Typography>
            
            <div className="mb-4 mx-auto opacity-90 hover:opacity-100 transition-opacity">
                <AkhaPixelPattern variant="logo" size={4} speed={40}/>
            </div>
            
            <Typography variant="paragraphL" color="sub">
                In addition to your selected dishes, we prepare these traditional recipes together.
            </Typography>
        </div>

        {/* TABS */}
        <div className="flex justify-center w-full">
             <div className="pointer-events-auto filter drop-shadow-lg">
                <Tabs items={FIXED_TABS} value={activeCategory} onChange={setActiveCategory} variant="pills" />
             </div>
        </div>

        {/* Descrizione Categoria */}
        <div className="text-center max-w-2xl [margin-vertical:var(--space-fluid-m)] mx-auto min-h-[4rem] animate-in fade-in slide-in-from-bottom-2 duration-500">
            <Typography variant="paragraphL" color="sub" className="italic leading-relaxed opacity-80">
                "{getCategoryDescription(activeCategory)}"
            </Typography>
        </div>

        {/* GRID MISTA (Ricette DB + Schede Culturali Custom Style) */}
        <div>
            {loading ? (
                <div className="text-center py-12">
                  <Typography variant="caption" color="muted">Loading heritage...</Typography>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 [gap:var(--space-fluid-m)] animate-in slide-in-from-bottom-4 duration-700">
                    
                    {getDisplayItems(activeCategory).map((item) => {
                        const isCultural = item.isCultural === true;

                        return (
                            <div key={item.id} className="h-full">
                                {isCultural ? (
                                    <div className="group relative h-full min-h-[420px] rounded-[2rem] overflow-hidden border-2 border-transparent transition-all duration-500 ease-cinematic hover:border-action/50 hover:shadow-2xl">
                                         
                                         {/* 1. PHOTO FULL (Background Layer) */}
                                         <div className="absolute inset-0 z-0 bg-surface-3">
                                            <img 
                                                src={item.image} 
                                                alt={item.name} 
                                                className="w-full h-full object-cover transition-transform duration-[2s] ease-cinematic group-hover:scale-105 opacity-80 group-hover:opacity-60" 
                                            />
                                            <div className="absolute inset-0 z-10 bg-gradient-to-tr from-transparent via-white/20 to-transparent opacity-0 group-hover:animate-flash pointer-events-none" />
                                         </div>

                                         {/* 2. FLOATING GLASS PANEL */}
                                         <div className="absolute inset-x-4 bottom-4 top-[35%] bg-surface/90 dark:bg-black/60 backdrop-blur-xl border border-white/20 dark:border-white/10 rounded-[2rem] [padding:var(--space-fluid-m)] flex flex-col justify-between transition-all duration-500 group-hover:bg-surface/95 dark:group-hover:bg-black/70 group-hover:border-primary/30">
                                            
                                            <div>
                                                <div className="flex items-center gap-2 mb-3">
                                                    <Icon name={item.icon} className="text-primary animate-pulse-slow" size="md"/>
                                                    <Typography variant="microLabel" color="primary">Did you know?</Typography>
                                                </div>
                                                
                                                <Typography variant="h3" color="title" className="uppercase italic leading-none mb-3">
                                                    {item.name}
                                                </Typography>
                                                
                                                <Typography variant="paragraphS" color="default" className="line-clamp-4 leading-relaxed">
                                                    {item.description}
                                                </Typography>
                                            </div>

                                            <div className="flex items-center justify-between border-t border-border/50 [padding-top:var(--space-fluid-s)] mt-2">
                                                <Badge variant="brand" className="shadow-lg shadow-primary/20">
                                                    CULTURE
                                                </Badge>

                                                <Button 
                                                    variant="mineral"
                                                    size="sm"
                                                    onClick={(e) => { e.stopPropagation(); handlePlayMusic(item.name); }}
                                                    className="rounded-full px-5 h-10 border-border/50 hover:border-primary text-xs"
                                                    icon="music_note"
                                                >
                                                    Listen
                                                </Button>
                                            </div>
                                         </div>
                                    </div>
                                ) : (
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
                <div className="py-20 text-center opacity-60 bg-surface-2/50 rounded-[3rem] border border-dashed border-border">
                    <Typography variant="caption">No items in this category yet.</Typography>
                </div>
            )}
        </div>
      </section>


    </div>
  );
};

export default MenuManager;
