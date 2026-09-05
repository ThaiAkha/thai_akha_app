import React, { useState, useEffect, useMemo } from 'react';
import { supabase } from '@thaiakha/shared/lib/supabase';
import { sidecarJoin, sidecarFilter, mergeSidecarRows } from '@thaiakha/shared/lib/mergeTranslation';
import { MENU_RECIPE_T_FIELDS } from '../components/user-dashboard/menuManager/menuHelpers';
import { useQuery } from '@thaiakha/shared/query';
import { Typography, Button, Icon, Badge } from '../components/ui/index';
import { PageLayout } from '../components/layout/PageLayout';
import HeaderMenu from '../components/layout/HeaderMenu';
import { MenuCard } from '../components/menu/index';
import { authService, UserProfile } from '../services/auth.service';
import { MegaMenu, MegaMenuCard } from '../components/recipes/index';
import { useDietaryKnowledge, type DietaryProfile } from '../hooks/useDietaryKnowledge';
import { useContentCategories } from '../hooks/useContentCategories';
import { useActiveProfile } from '../context/ActiveProfileContext';
import { useLanguage } from '../context/LanguageContext';
import ProfileSwitcher from '../components/user-dashboard/ProfileSwitcher';
import { NoBookingBanner } from '../components/user-dashboard';
import { cn } from '@thaiakha/shared/lib/utils';
import { t } from '../i18n';
import type { Tables } from '@thaiakha/shared/types';

/** Recipe row as selected below (recipes + key ingredients + cover join).
 *  keyIngredients is flattened for the list; saved selections keep the raw row (no keyIngredients). */
type MenuRecipe = Tables<'recipes'> & {
  recipe_key_ingredients: Pick<Tables<'recipe_key_ingredients'>, 'ingredient'>[];
  cover: Pick<Tables<'media_assets'>, 'asset_id' | 'image_url' | 'alt_text'> | null;
  keyIngredients?: string[];
};

const NO_RECIPES: MenuRecipe[] = [];
const classMenuRecipesQueryKey = (lang = 'en') => ['recipes', 'class_menu', lang] as const;

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
  const [hydrating, setHydrating] = useState(true);
  const [saving, setSaving] = useState(false);

  // Context
  const [targetBookingId, setTargetBookingId] = useState<string | null>(sectionId || null);

  // Dati pubblici (categorie + ricette di classe): cache TanStack (CLAUDE.md #17).
  // La lettura spiciness che stava qui era scaricata e mai usata: tolta.
  const { lang } = useLanguage();
  const { categories, loading: catsLoading } = useContentCategories('recipe');
  const recipesQ = useQuery({
    queryKey: classMenuRecipesQueryKey(lang),
    queryFn: async () => {
      const q = sidecarFilter(supabase
        .from('recipes')
        .select(`*, recipe_key_ingredients(ingredient), cover:media_assets!cover_asset_id(asset_id, image_url, alt_text)`
          + sidecarJoin('recipes_translations', MENU_RECIPE_T_FIELDS, lang))
        .eq('recipe_type', 'class')
        .order('category')
        .order('name'), lang);
      const { data, error } = await q;
      if (error) throw error;
      const merged = mergeSidecarRows<MenuRecipe>(data, lang);
      return merged.map((r): MenuRecipe => ({
        ...r,
        keyIngredients: r.recipe_key_ingredients?.map((i) => i.ingredient) || []
      }));
    },
  });
  const recipes: MenuRecipe[] = recipesQ.data ?? NO_RECIPES;
  const dataLoading = catsLoading || recipesQ.isPending;
  const loading = dataLoading || hydrating;

  // Preferenze
  const [diet, setDiet] = useState<string>('regular');
  const [allergies, setAllergies] = useState<string[]>([]);
  const [selectedSpicinessId, setSelectedSpicinessId] = useState<number>(2);

  // Selezioni
  const [selections, setSelections] = useState<Record<string, MenuRecipe | null>>({});

  // Dietary Knowledge
  const { profiles, getDietProfiles, getAllergyProfiles } = useDietaryKnowledge();
  const dietProfiles = getDietProfiles();

  // F2 — il menu si compila per il PROFILO ATTIVO (host o un suo gestito).
  // Il booking resta dell'host; cambia solo `menu_selections.user_id`.
  const { managedProfiles, activeProfileId, isActingAsManaged, isActiveVisitor } = useActiveProfile();
  const activeManaged = managedProfiles.find(p => p.id === activeProfileId) ?? null;

  // --- HYDRATION: stato iniziale del form (selezioni, dieta, allergie, booking) ---
  // Non e' una lettura pura: scrive lo stato del form dal profilo attivo e dal menu salvato.
  // Parte quando categorie e ricette sono in cache; le due letture qui dentro (ultimo
  // booking, menu salvato) sono dell'utente e cambiano a ogni prenotazione.
  useEffect(() => {
    if (dataLoading) return;
    let cancelled = false;
    const init = async () => {
      setHydrating(true);
      try {
        // content_categories.id is a SLUG (e.g. 'authentic-thai-curry-recipes'),
        // not a short key — normalize it to curry/soup/stirfry before matching.
        const selectionCats = categories.filter(c => ['curry', 'soup', 'stirfry'].includes(normalizeCat(c.id)));
        const initialSelections: Record<string, MenuRecipe | null> = {};
        selectionCats.forEach(c => { initialSelections[normalizeCat(c.id)] = null; });
        setSelections(initialSelections);

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

            if (savedMenu) {
              const menuSelections: Record<string, MenuRecipe | null> = {};
              menuSelections.curry = recipes.find(r => r.id === savedMenu.curry_id) || null;
              menuSelections.soup = recipes.find(r => r.id === savedMenu.soup_id) || null;
              menuSelections.stirfry = recipes.find(r => r.id === savedMenu.stirfry_id) || null;
              setSelections(menuSelections);
            }
          }
        } else {
          onNavigate('auth');
        }
      } catch (err) { console.error(err); } finally { if (!cancelled) setHydrating(false); }
    };
    init();
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- activeManaged/isActingAsManaged derive from activeProfileId; categories/recipes sono riferimenti stabili di cache; onNavigate is stable enough, re-init would refetch
  }, [dataLoading, userProfile, sectionId, activeProfileId]);

  // --- ACTIONS ---
  const handleConfirm = async () => {
    const hasDishes = selections.curry && selections.soup && selections.stirfry;
    if (!hasDishes) return alert(t('user:select3Dishes'));
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
    } catch { alert(t('user:saveFailed')); } finally { setSaving(false); }
  };



  // Match by the exact category SLUG of the active tab (not the normalized key),
  // so e.g. the inactive 'curry-paste-recipes' category doesn't leak into 'curry'.
  const getRecipes = (catSlug: string) => recipes.filter(r => r.category === catSlug && !r.is_fixed_dish);

  const activeProfileData = useMemo<Pick<DietaryProfile, 'id' | 'name' | 'icon'>>(() => {
    if (!diet) return { id: '', name: 'Your Diet Style', icon: 'restaurant' };
    return dietProfiles.find(p => p.id === `diet_${diet}`) || { id: 'diet_regular', name: 'Regular Diet', icon: 'restaurant' };
  }, [diet, dietProfiles]);

  const allergyOptions = useMemo(() => {
    return getAllergyProfiles().map(ak => {
      const key = ak.id.replace(/^allergy[_-]/, '').replace(/[_-]/g, ' ');
      return key.split(' ').map((w: string) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps -- getAllergyProfiles is a new fn every render; profiles is its only input
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
          <div className="w-full">
            <ProfileSwitcher />
          </div>
          {isActiveVisitor ? (
            /* F3 — i visitor non scelgono piatti; dieta/allergie nel Passport */
            <div className="w-full">
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
            <div className="w-full">
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
            <section key={cat.id} className="flex flex-col [gap:var(--space-fluid-m)] scroll-mt-48 w-full" id={catKey}>
              <div className="flex items-center gap-4 border-l-4 border-primary pl-6">
                <Typography variant="h2" className="italic uppercase text-gray-900 dark:text-gray-100">{cat.title} <span className="text-primary">{t('user:selectionLabel')}</span></Typography>
                <Badge variant="mineral" className="bg-white/5">{getRecipes(cat.id).length} {t('user:optionsLabel')}</Badge>
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

          <div className="fixed bottom-0 left-0 right-0 z-50 p-6 flex justify-center pointer-events-none bg-gradient-to-t from-background via-background/80 to-transparent pt-12 [padding-bottom:max(2rem,env(safe-area-inset-bottom))]">
            <div className="pointer-events-auto flex items-center gap-3 w-full max-w-md bg-surface/80 dark:bg-surface/90 backdrop-blur-xl p-2 rounded-[2rem] border border-white/10 shadow-[0_20px_50px_-12px_rgba(0,0,0,0.5)]">
              <button onClick={() => onNavigate('user')} className="size-14 rounded-[1.5rem] flex items-center justify-center text-red-400 hover:bg-red-500/10 hover:text-red-500 transition-all active:scale-95"><Icon name="close" size="lg" /></button>
              <Button variant="brand" fullWidth size="lg" disabled={!selections.curry || !selections.soup || !selections.stirfry || saving} onClick={handleConfirm} isLoading={saving} icon={saving ? 'sync' : 'check'} className={cn("rounded-[1.5rem] h-14 text-sm font-black tracking-widest", (!selections.curry || !selections.soup || !selections.stirfry) && "opacity-50 grayscale")}>
                {saving ? t('user:selectionSaving') : t('user:confirmMenu')}
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