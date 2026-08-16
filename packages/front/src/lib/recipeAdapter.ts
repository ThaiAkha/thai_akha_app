import { RecipeData } from '../components/menu/RecipeView';

/**
 * 🥗 DIETARY SUBSTITUTION INTERFACE
 */
export interface DietarySubstitution {
  original: string;
  substitute: string;
  alt_substitute?: string | null;
}

/**
 * 🥗 DIETARY PROFILE INTERFACE
 */
export interface DietaryProfile {
  id: string;
  substitutions: DietarySubstitution[];
  [key: string]: unknown;
}

/**
 * 🥗 RAW KEY INGREDIENT — dati completi da recipe_key_ingredients (Sistema B)
 */
export interface RawKeyIngredient {
  ingredient: string;
  ingredient_id: string | null;
  display_order: number;
  dietary_adaptations: Record<string, { action: 'substitute' | 'omit'; substitute_id?: string }>;
  ui_role: string;
}

/**
 * 🧠 RECIPE ADAPTER ENGINE V4
 *
 * Gerarchia sostituzione (in ordine di priorità):
 *   Sistema B (recipe_key_ingredients.dietary_adaptations) → override per-ricetta
 *   Sistema A (dietary_substitutions via DietaryProfile)   → regola globale di default
 *
 * Sistema B gestisce: omit (rimuove ingrediente), substitute (delega a Sistema A per il nome)
 * Sistema A gestisce: substitute (testo), omit via sentinel "Omitted" → rimosso
 */
export const adaptRecipeToDiet = (
  recipe: RecipeData,
  diet: string,
  allergies: string[] = [],
  profiles: DietaryProfile[] = [],
  rawKeyIngredients: RawKeyIngredient[] = []   // Sistema B: campi completi da DB
): RecipeData => {

  const cleanDiet = diet?.replace('diet_', '').toLowerCase() || 'regular';
  const dietKey = `diet_${cleanDiet}`;

  // 1. CLONAZIONE
  const adapted = { ...recipe };

  // 2. ADATTAMENTO BASE (dietary_variants dal DB — nome, descrizione, ingredienti variante)
  const dbVariant = recipe.dietary_variants?.[dietKey];
  if (dbVariant) {
    if (dbVariant.name) adapted.name = dbVariant.name;
    if (dbVariant.description) adapted.description = dbVariant.description;
    if (dbVariant.health_benefits) adapted.healthBenefits = dbVariant.health_benefits;
    if (dbVariant.subtitle) adapted.subtitle = dbVariant.subtitle;
    if (dbVariant.excerpt) adapted.excerpt = dbVariant.excerpt;
    if (Array.isArray(dbVariant.key_ingredients) && dbVariant.key_ingredients.length > 0) {
      adapted.keyIngredients = dbVariant.key_ingredients;
    }
  }

  // 3. SISTEMA B — costruisce l'insieme degli ingredienti da omettere per questa ricetta
  // (override per-ricetta: vince su Sistema A per il caso "omit")
  // Nota: il caso "substitute" di Sistema B delega il nome a Sistema A (UUID resolution futura)
  const omitSet = new Set<string>();

  if (rawKeyIngredients.length > 0) {
    const allergyKeys = allergies.map(
      a => `allergy_${a.toLowerCase().replace(/\s+/g, '_')}`
    );

    for (const rki of rawKeyIngredients) {
      const da = rki.dietary_adaptations || {};

      if (da[dietKey]?.action === 'omit') omitSet.add(rki.ingredient.toLowerCase());

      for (const ak of allergyKeys) {
        if (da[ak]?.action === 'omit') omitSet.add(rki.ingredient.toLowerCase());
      }
    }
  }

  // 4. SISTEMA A — sostituzioni globali da DietaryProfile (text-based)
  // Base: adapted.keyIngredients (può essere già modificato da dbVariant al passo 2)
  const activeProfile = profiles.find(p => p.id === dietKey || p.id === diet);
  let ingredients = applySubstitutions(adapted.keyIngredients, activeProfile?.substitutions || []);

  // Allergie
  for (const allergyKey of allergies) {
    const allergyProfileId = `allergy_${allergyKey.toLowerCase().replace(/\s+/g, '_')}`;
    const allergyProfile = profiles.find(p => p.id === allergyProfileId);
    if (allergyProfile) {
      ingredients = applySubstitutions(ingredients, allergyProfile.substitutions);
    }
  }

  // 5. APPLICA OMIT DI SISTEMA B — filtra dopo Sistema A
  // (così gli ingredienti già sostituiti da A non sfuggono all'omit di B)
  if (omitSet.size > 0) {
    ingredients = ingredients.filter(ing => !omitSet.has(ing.toLowerCase()));
  }

  adapted.keyIngredients = ingredients;

  // 6. VISUAL BADGE
  adapted.activeDietLabel = cleanDiet === 'regular' ? 'ORIGINAL' : cleanDiet.toUpperCase();

  return adapted;
};

/**
 * Applica una lista di sostituzioni a un array di ingredienti.
 * Se substitute = "Omitted" (sentinel DB), l'ingrediente viene rimosso dalla lista.
 */
const applySubstitutions = (ingredients: string[], substitutions: DietarySubstitution[]): string[] => {
  if (!substitutions.length) return ingredients;

  return ingredients
    .map((ing): string | null => {
      const lowerIng = ing.toLowerCase();

      const sub = substitutions.find(s => lowerIng.includes(s.original.toLowerCase()));

      if (sub) {
        // "Omitted" è il sentinel DB per ingredienti da rimuovere
        if (sub.substitute === 'Omitted') return null;
        // Se esiste un'alternativa, esponi entrambe — futura UI "1 vs 2"
        if (sub.alt_substitute) return `${sub.substitute} / ${sub.alt_substitute}`;
        return sub.substitute;
      }

      return ing;
    })
    .filter((ing): ing is string => ing !== null);
};