import React, { useState, useEffect, useMemo } from 'react';
import { supabase } from '@thaiakha/shared/lib/supabase';
import { Typography, Button, Icon, Badge } from '../components/ui/index';
import { PageLayout } from '../components/layout/PageLayout';
import HeaderMenu from '../components/layout/HeaderMenu';
import { MenuCard, RecipeView, RecipeData } from '../components/menu/index';
import { authService, UserProfile } from '../services/auth.service';
import { MegaMenu, MegaMenuCard } from '../components/recipes/index';
import { useDietaryKnowledge } from '../hooks/useDietaryKnowledge';
import { cn } from '@thaiakha/shared/lib/utils';
import { t } from '@thaiakha/shared/lib/ui-strings';

const normalizeCat = (cat: string) => {
  const lower = cat.toLowerCase();
  if (lower.includes('curry')) return 'curry';
  if (lower.includes('soup')) return 'soup';
  if (lower.includes('stir')) return 'stirfry';
  return 'other';
};

const MenuPage: React.FC<{
  onNavigate: (page: string, topic?: string, sectionId?: string) => void;
  userProfile?: UserProfile | null;
  onAuthSuccess: () => void;
  sectionId?: string | null;
}> = ({ onNavigate, userProfile, onAuthSuccess, sectionId }) => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Context
  const [targetBookingId, setTargetBookingId] = useState<string | null>(sectionId || null);

  // Dati
  const [recipes, setRecipes] = useState<any[]>([]);
  const [spicinessLevels, setSpicinessLevels] = useState<any[]>([]);

  // Preferenze
  const [diet, setDiet] = useState<string>('regular');
  const [allergies, setAllergies] = useState<string[]>([]);
  const [selectedSpicinessId, setSelectedSpicinessId] = useState<number>(2);

  // Selezioni
  const [selections, setSelections] = useState<Record<string, any>>({ curry: null, soup: null, stirfry: null });
  const [viewingRecipe, setViewingRecipe] = useState<RecipeData | null>(null);

  // Dietary Knowledge
  const { profiles: dietProfiles, allergies: allergyKnowledge } = useDietaryKnowledge();

  // --- INIT ---
  useEffect(() => {
    const init = async () => {
      setLoading(true);
      try {
        const [recRes, spiceRes] = await Promise.all([
          supabase.from('recipes').select(`*, recipe_key_ingredients(ingredient)`).order('category, name'),
          supabase.from('spiciness_levels').select('*').order('id')
        ]);

        if (recRes.data) {
          setRecipes(recRes.data.map(r => ({
            ...r,
            keyIngredients: r.recipe_key_ingredients?.map((i:any) => i.ingredient) || []
          })));
        }
        if (spiceRes.data) setSpicinessLevels(spiceRes.data);

        const currentUser = userProfile || await authService.getCurrentUserProfile();
        
        if (currentUser) {
          setDiet(currentUser.dietary_profile?.replace('diet_', '') || 'regular');
          setAllergies(currentUser.allergies || []);
          setSelectedSpicinessId(currentUser.preferred_spiciness_id || 2);

          let activeBookingId = sectionId;
          if (!activeBookingId) {
            const { data: latestBooking } = await supabase
              .from('bookings')
              .select('internal_id')
              .eq('user_id', currentUser.id)
              .neq('status', 'cancelled')
              .gte('booking_date', new Date().toISOString().split('T')[0])
              .order('booking_date', { ascending: true })
              .limit(1)
              .maybeSingle();
            activeBookingId = latestBooking?.internal_id;
          }
          setTargetBookingId(activeBookingId || null);

          if (activeBookingId) {
            const { data: savedMenu } = await supabase
              .from('menu_selections')
              .select('*')
              .eq('booking_id', activeBookingId)
              .maybeSingle();

            if (savedMenu && recRes.data) {
              setSelections({
                curry: recRes.data.find(r => r.id === savedMenu.curry_id) || null,
                soup: recRes.data.find(r => r.id === savedMenu.soup_id) || null,
                stirfry: recRes.data.find(r => r.id === savedMenu.stirfry_id) || null,
              });
            }
          }
        } else {
          onNavigate('auth');
        }
      } catch (err) { console.error(err); } finally { setLoading(false); }
    };
    init();
  }, [userProfile, sectionId]);

  // --- ACTIONS ---
  const handleConfirm = async () => {
    const hasDishes = selections.curry && selections.soup && selections.stirfry;
    if (!hasDishes) return alert(t.user.select3Dishes);
    if (!targetBookingId) return onNavigate('booking');

    setSaving(true);
    try {
      const currentUser = userProfile || await authService.getCurrentUserProfile();
      if (!currentUser) throw new Error("User not found");

      const cleanAllergies = allergies.filter(a => a && a.trim() !== '');

      const payload = {
        user_id: currentUser.id,
        booking_id: targetBookingId,
        curry_id: selections.curry?.id || null,
        soup_id: selections.soup?.id || null,
        stirfry_id: selections.stirfry?.id || null,
        spiciness_id: selectedSpicinessId,
        selected_profile: `diet_${diet}`,
        selected_allergies: cleanAllergies,
        updated_at: new Date().toISOString()
      };

      const { data: existing } = await supabase.from('menu_selections').select('id').eq('booking_id', targetBookingId).eq('user_id', currentUser.id).maybeSingle();

      if (existing) await supabase.from('menu_selections').update(payload).eq('id', existing.id);
      else await supabase.from('menu_selections').insert(payload);

      if (onAuthSuccess) await onAuthSuccess();
      onNavigate('user');
    } catch (err: any) { alert(t.user.saveFailed); } finally { setSaving(false); }
  };

  const handleSelectFromPreview = (dish: RecipeData) => {
      const cat = normalizeCat(dish.category);
      setSelections(prev => ({ ...prev, [cat]: dish }));
      setViewingRecipe(null);
  };

  const mapToRecipeView = (dbRecipe: any): RecipeData => ({
    id: dbRecipe.id,
    name: dbRecipe.name,
    thai_name: dbRecipe.thai_name,
    description: dbRecipe.description,
    category: dbRecipe.category,
    image: dbRecipe.image,
    spiciness: dbRecipe.spiciness,
    isVegan: dbRecipe.is_vegan,
    isVegetarian: dbRecipe.is_vegetarian,
    hasPeanuts: dbRecipe.has_peanuts,
    hasGluten: dbRecipe.has_gluten,
    hasShellfish: dbRecipe.has_shellfish || false,
    hasSoy: dbRecipe.has_soy || false,
    hasEggs: dbRecipe.has_eggs || false,
    hasDairy: dbRecipe.has_dairy || false,
    isSignature: dbRecipe.is_signature || false,
    isFixedDish: dbRecipe.is_fixed_dish || false,
    healthBenefits: dbRecipe.health_benefits,
    keyIngredients: dbRecipe.keyIngredients || [],
    galleryImages: dbRecipe.gallery_images || [],
    colorTheme: dbRecipe.color_theme,
    dietary_variants: dbRecipe.dietary_variants || {}
  });

  const getRecipes = (cat: string) => recipes.filter(r => normalizeCat(r.category) === cat && !r.is_fixed_dish);

  const activeProfileData = useMemo(() => {
    if (!diet) return { id: '', name: 'Your Diet Style', icon: 'restaurant' } as any;
    return dietProfiles.find(p => p.id === `diet_${diet}`) || { id: 'diet_regular', name: 'Regular Diet', icon: 'restaurant' } as any;
  }, [diet, dietProfiles]);

  const allergyOptions = useMemo(() =>
    allergyKnowledge.map(ak =>
      ak.allergy_key.split(' ').map((w: string) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
    )
  , [allergyKnowledge]);

  const groupedDiets = useMemo(() => ({
    lifestyle: dietProfiles.filter(p => !p.type || p.type !== 'religious'),
    culture: dietProfiles.filter(p => p.type === 'religious')
  }), [dietProfiles]);

  return (
    <PageLayout
      slug="menu"
      loading={loading}
      hideDefaultHeader={true}
      customHeader={<HeaderMenu customSlug="my-menu" />}
    >
      <div className="w-full pb-40">
        <div className="space-y-16 animate-in fade-in slide-in-from-bottom-8 duration-700">
          <div className="flex flex-col gap-8 -mt-8 mb-16">
            <MegaMenu
              variant="diet"
              title={activeProfileData.name}
              icon={activeProfileData.icon}
              activeLabel={activeProfileData.name}
              activeCount={allergies.length}
              customContent={
                <MegaMenuCard
                  initialDiet={`diet_${diet}`}
                  initialAllergies={allergies}
                  initialSpiciness={selectedSpicinessId}
                  allergyOptions={allergyOptions}
                  groupedDiets={groupedDiets}
                  onConfirm={(d, a, s) => {
                      setDiet(d.replace('diet_', ''));
                      setAllergies(a);
                      if (s) setSelectedSpicinessId(Number(s));
                  }}
                />
              }
            />
          </div>

            {['curry', 'soup', 'stirfry'].map(cat => (
              <section key={cat} className="space-y-8 scroll-mt-48 px-4 md:px-8 max-w-[85rem] mx-auto" id={cat}>
                <div className="flex items-center gap-4 border-l-4 border-primary pl-6">
                  <Typography variant="h2" className="italic uppercase text-gray-900 dark:text-gray-100">{cat} <span className="text-primary">{t.user.selectionLabel}</span></Typography>
                  <Badge variant="mineral" className="bg-white/5">{getRecipes(cat).length} {t.user.optionsLabel}</Badge>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
                  {getRecipes(cat).map(recipe => (
                    <MenuCard
                      key={recipe.id}
                      dish={{...recipe, colorTheme: recipe.color_theme || '#ff7597', image: recipe.image}}
                      isSelected={selections[cat]?.id === recipe.id}
                      onClick={() => setSelections({...selections, [cat]: recipe})}
                      onPreview={() => onNavigate('recipes', undefined, `${recipe.slug}?source=menu`)}
                    />
                  ))}
                </div>
              </section>
            ))}

            <div className="fixed bottom-0 left-0 right-0 z-50 p-6 flex justify-center pointer-events-none bg-gradient-to-t from-background via-background/80 to-transparent pb-8 pt-12">
              <div className="pointer-events-auto flex items-center gap-3 w-full max-w-md bg-surface/80 dark:bg-surface/90 backdrop-blur-xl p-2 rounded-[2rem] border border-white/10 shadow-[0_20px_50px_-12px_rgba(0,0,0,0.5)]">
                <button onClick={() => onNavigate('user')} className="size-14 rounded-[1.5rem] flex items-center justify-center text-red-400 hover:bg-red-500/10 hover:text-red-500 transition-all active:scale-95"><Icon name="close" size="lg" /></button>
                <Button variant="brand" fullWidth size="lg" disabled={!selections.curry || !selections.soup || !selections.stirfry || saving} onClick={handleConfirm} isLoading={saving} icon={saving ? 'sync' : 'check'} className={cn("rounded-[1.5rem] h-14 text-sm font-black tracking-widest", (!selections.curry || !selections.soup || !selections.stirfry) && "opacity-50 grayscale")}>
                  {saving ? t.user.selectionSaving : t.user.confirmMenu}
                </Button>
              </div>
            </div>
        </div>
      </div>
    </PageLayout>
  );
};

export default MenuPage;