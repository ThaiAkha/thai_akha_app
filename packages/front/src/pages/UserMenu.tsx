import React, { useState, useEffect, useMemo } from 'react';
import { supabase } from '@thaiakha/shared/lib/supabase';
import { Typography, Button, Icon, Badge } from '../components/ui/index';
import { PageLayout } from '../components/layout/PageLayout';
import HeaderMenu from '../components/layout/HeaderMenu';
import { MenuCard, RecipeView, RecipeData } from '../components/menu/index';
import { authService, UserProfile } from '../services/auth.service';
import { MegaMenu, MegaMenuCard } from '../components/recipes/index';
import { useDietaryKnowledge } from '../hooks/useDietaryKnowledge';
import { useActiveProfile } from '../context/ActiveProfileContext';
import ProfileSwitcher from '../components/user-dashboard/ProfileSwitcher';
import { NoBookingBanner } from '../components/user-dashboard';
import { cn } from '@thaiakha/shared/lib/utils';
import { t } from '@thaiakha/shared/lib/ui-strings';
import { contentService } from '@thaiakha/shared/services';
import { ContentCategoryDB } from '@thaiakha/shared';

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
  const [categories, setCategories] = useState<ContentCategoryDB[]>([]);
  const [selections, setSelections] = useState<Record<string, any>>({});
  const [viewingRecipe, setViewingRecipe] = useState<RecipeData | null>(null);

  // Dietary Knowledge
  const { profiles, getDietProfiles, getAllergyProfiles } = useDietaryKnowledge();
  const dietProfiles = getDietProfiles();

  // F2 — il menu si compila per il PROFILO ATTIVO (host o un suo gestito).
  // Il booking resta dell'host; cambia solo `menu_selections.user_id`.
  const { managedProfiles, activeProfileId, isActingAsManaged, isActiveVisitor } = useActiveProfile();
  const activeManaged = managedProfiles.find(p => p.id === activeProfileId) ?? null;

  // --- INIT ---
  useEffect(() => {
    const init = async () => {
      setLoading(true);
      try {
        const [cats, recRes, spiceRes] = await Promise.all([
          contentService.getContentCategories('recipe'),
          supabase.from('recipes').select(`*, recipe_key_ingredients(ingredient), cover:media_assets!cover_asset_id(asset_id, image_url, alt_text)`).eq('recipe_type', 'class').order('category').order('name'),
          supabase.from('spiciness_levels').select('*').order('id')
        ]);

        if (cats) {
          setCategories(cats);
          // Initialize selections with category IDs that are selection-based
          // Selection-based categories are identified by specific IDs or simply all active categories for now
          // content_categories.id is a SLUG (e.g. 'authentic-thai-curry-recipes'),
          // not a short key — normalize it to curry/soup/stirfry before matching.
          const selectionCats = cats.filter(c => ['curry', 'soup', 'stirfry'].includes(normalizeCat(c.id)));
          const initialSelections: Record<string, any> = {};
          selectionCats.forEach(c => { initialSelections[normalizeCat(c.id)] = null; });
          setSelections(initialSelections);
        }

        if (recRes.data) {
          setRecipes(recRes.data.map(r => ({
            ...r,
            keyIngredients: r.recipe_key_ingredients?.map((i:any) => i.ingredient) || []
          })));
        }
        if (spiceRes.data) setSpicinessLevels(spiceRes.data);

        const currentUser = userProfile || await authService.getCurrentUserProfile();

        if (currentUser) {
          // Prefill diete dal profilo ATTIVO (host o gestito); il booking è dell'host.
          const dietSource = isActingAsManaged && activeManaged ? activeManaged : currentUser;
          const effectiveUserId = activeProfileId ?? currentUser.id;
          setDiet((dietSource.dietary_profile ?? 'diet_regular').replace('diet_', '') || 'regular');
          setAllergies(dietSource.allergies ?? []);
          setSelectedSpicinessId(dietSource.preferred_spiciness_id ?? 2);

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
              .eq('user_id', effectiveUserId)
              .maybeSingle();

            if (savedMenu && recRes.data) {
              const menuSelections: Record<string, any> = {};
              menuSelections.curry = recRes.data.find(r => r.id === savedMenu.curry_id) || null;
              menuSelections.soup = recRes.data.find(r => r.id === savedMenu.soup_id) || null;
              menuSelections.stirfry = recRes.data.find(r => r.id === savedMenu.stirfry_id) || null;
              setSelections(menuSelections);
            }
          }
        } else {
          onNavigate('auth');
        }
      } catch (err) { console.error(err); } finally { setLoading(false); }
    };
    init();
  }, [userProfile, sectionId, activeProfileId]);

  // --- ACTIONS ---
  const handleConfirm = async () => {
    const hasDishes = selections.curry && selections.soup && selections.stirfry;
    if (!hasDishes) return alert(t.user.select3Dishes);
    if (!targetBookingId) return onNavigate('booking');

    setSaving(true);
    try {
      const currentUser = userProfile || await authService.getCurrentUserProfile();
      if (!currentUser) throw new Error("User not found");

      // user_id = profilo ATTIVO (host o gestito); booking_id resta del gruppo (host).
      const effectiveUserId = activeProfileId ?? currentUser.id;
      const cleanAllergies = allergies.filter(a => a && a.trim() !== '');

      const payload = {
        user_id: effectiveUserId,
        booking_id: targetBookingId,
        curry_id: selections.curry?.id || null,
        soup_id: selections.soup?.id || null,
        stirfry_id: selections.stirfry?.id || null,
        spiciness_id: selectedSpicinessId,
        selected_profile: `diet_${diet}`,
        selected_allergies: cleanAllergies,
        updated_at: new Date().toISOString()
      };

      const { data: existing } = await supabase.from('menu_selections').select('id').eq('booking_id', targetBookingId).eq('user_id', effectiveUserId).maybeSingle();

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
    image: dbRecipe.cover?.image_url || '',
    hasPeanuts: dbRecipe.has_peanuts,
    hasGluten: dbRecipe.has_gluten,
    hasShellfish: dbRecipe.has_shellfish || false,
    hasSoy: dbRecipe.has_soy || false,
    hasEggs: dbRecipe.has_eggs || false,
    hasFish: dbRecipe.has_fish || false,
    hasFishSauce: dbRecipe.has_fish_sauce || false,
    hasSeafood: dbRecipe.has_seafood || false,
    hasSesame: dbRecipe.has_sesame || false,
    hasSoySauce: dbRecipe.has_soy_sauce || false,
    hasTreeNuts: dbRecipe.has_tree_nuts || false,
    isSignature: dbRecipe.is_signature || false,
    isFixedDish: dbRecipe.is_fixed_dish || false,
    healthBenefits: dbRecipe.health_benefits,
    keyIngredients: dbRecipe.keyIngredients || [],
    galleryImages: [],
    dietary_variants: dbRecipe.dietary_variants || {}
  });

  // Match by the exact category SLUG of the active tab (not the normalized key),
  // so e.g. the inactive 'curry-paste-recipes' category doesn't leak into 'curry'.
  const getRecipes = (catSlug: string) => recipes.filter(r => r.category === catSlug && !r.is_fixed_dish);

  const activeProfileData = useMemo(() => {
    if (!diet) return { id: '', name: 'Your Diet Style', icon: 'restaurant' } as any;
    return dietProfiles.find(p => p.id === `diet_${diet}`) || { id: 'diet_regular', name: 'Regular Diet', icon: 'restaurant' } as any;
  }, [diet, dietProfiles]);

  const allergyOptions = useMemo(() => {
    return getAllergyProfiles().map(ak => {
      const key = ak.id.replace(/^allergy[_-]/, '').replace(/[_-]/g, ' ');
      return key.split(' ').map((w: string) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
    });
  }, [profiles]);

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
      <div className="contents">
        <div className="flex flex-col [gap:var(--space-fluid-xl)] animate-in fade-in slide-in-from-bottom-8 duration-700">
          {/* F2 — chi sta compilando il menu (host o gestito) */}
          <div className="px-4 md:px-8 max-w-[85rem] mx-auto w-full">
            <ProfileSwitcher />
          </div>
          {isActiveVisitor ? (
            /* F3 — i visitor non scelgono piatti; dieta/allergie nel Passport */
            <div className="px-4 md:px-8 max-w-[85rem] mx-auto w-full">
              <div className="rounded-3xl bg-surface border border-border [padding:var(--space-fluid-l)] flex flex-col items-center text-center [gap:var(--space-fluid-s)]">
                <Icon name="visibility" size="xl" className="text-sub" />
                <Typography variant="h4" color="title">Visitors don't pick dishes</Typography>
                <Typography variant="paragraphS" color="muted" className="max-w-md">
                  As a visitor you won't be cooking. You can still set allergies & dietary info in your Passport so the kitchen keeps you safe.
                </Typography>
                <Button variant="brand" size="lg" onClick={() => onNavigate('user', undefined, 'passport')}>Go to Passport</Button>
              </div>
            </div>
          ) : !targetBookingId ? (
            /* Senza booking non si seleziona il menu: stato vuoto + banner verso il booking. */
            <div className="px-4 md:px-8 max-w-[85rem] mx-auto w-full">
              <NoBookingBanner onNavigate={onNavigate} />
            </div>
          ) : (
          <>
          <section className="flex flex-col [gap:var(--space-fluid-m)]">
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
          </section>

          {categories.filter(c => ['curry', 'soup', 'stirfry'].includes(normalizeCat(c.id))).map(cat => {
            // catKey = normalized short key (curry/soup/stirfry) for selection state;
            // cat.id = exact slug used to pull that category's own recipes.
            const catKey = normalizeCat(cat.id);
            return (
            <section key={cat.id} className="flex flex-col [gap:var(--space-fluid-m)] scroll-mt-48 px-4 md:px-8 max-w-[85rem] mx-auto w-full" id={catKey}>
              <div className="flex items-center gap-4 border-l-4 border-primary pl-6">
                <Typography variant="h2" className="italic uppercase text-gray-900 dark:text-gray-100">{cat.title} <span className="text-primary">{t.user.selectionLabel}</span></Typography>
                <Badge variant="mineral" className="bg-white/5">{getRecipes(cat.id).length} {t.user.optionsLabel}</Badge>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 [gap:var(--space-fluid-m)]">
                {getRecipes(cat.id).map(recipe => (
                  <MenuCard
                    key={recipe.id}
                    dish={{...recipe, image: recipe.cover?.image_url || ''}}
                    isSelected={selections[catKey]?.id === recipe.id}
                    onClick={() => setSelections({...selections, [catKey]: recipe})}
                    onPreview={() => onNavigate('recipes', undefined, `${recipe.slug}?source=menu`)}
                  />
                ))}
              </div>
            </section>
            );
          })}

          <div className="fixed bottom-0 left-0 right-0 z-50 p-6 flex justify-center pointer-events-none bg-gradient-to-t from-background via-background/80 to-transparent pb-8 pt-12">
            <div className="pointer-events-auto flex items-center gap-3 w-full max-w-md bg-surface/80 dark:bg-surface/90 backdrop-blur-xl p-2 rounded-[2rem] border border-white/10 shadow-[0_20px_50px_-12px_rgba(0,0,0,0.5)]">
              <button onClick={() => onNavigate('user')} className="size-14 rounded-[1.5rem] flex items-center justify-center text-red-400 hover:bg-red-500/10 hover:text-red-500 transition-all active:scale-95"><Icon name="close" size="lg" /></button>
              <Button variant="brand" fullWidth size="lg" disabled={!selections.curry || !selections.soup || !selections.stirfry || saving} onClick={handleConfirm} isLoading={saving} icon={saving ? 'sync' : 'check'} className={cn("rounded-[1.5rem] h-14 text-sm font-black tracking-widest", (!selections.curry || !selections.soup || !selections.stirfry) && "opacity-50 grayscale")}>
                {saving ? t.user.selectionSaving : t.user.confirmMenu}
              </Button>
            </div>
          </div>
          </>
          )}
        </div>
      </div>
    </PageLayout>
  );
};

export default MenuPage;