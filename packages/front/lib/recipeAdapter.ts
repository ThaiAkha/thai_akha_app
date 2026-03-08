import { RecipeData } from '../components/menu/RecipeView';

/**
 * 🧠 RECIPE ADAPTER ENGINE V2
 * Supporta ora Dieta (Lifestyle) E Allergie (Safety Filters).
 */
export const adaptRecipeToDiet = (
  recipe: RecipeData, 
  diet: string, 
  allergies: string[] = [] // 👈 NUOVO PARAMETRO
): RecipeData => {

  const cleanDiet = diet?.replace('diet_', '').toLowerCase() || 'regular';
  const dietKey = `diet_${cleanDiet}`;
  
  // 1. CLONAZIONE
  let adapted = { ...recipe };

  // 2. ADATTAMENTO BASE (DIETA)
  // Verifica se esiste variante nel DB, altrimenti fallback algoritmico
  const dbVariant = recipe.dietary_variants?.[dietKey];

  if (dbVariant) {
    if (dbVariant.name) adapted.name = dbVariant.name;
    if (dbVariant.description) adapted.description = dbVariant.description;
    if (dbVariant.keyIngredients) adapted.keyIngredients = dbVariant.keyIngredients;
  } else {
    // Fallback Algoritmico per dieta
    if (cleanDiet !== 'regular' && !adapted.name.toLowerCase().includes(cleanDiet)) {
      const suffix = cleanDiet.charAt(0).toUpperCase() + cleanDiet.slice(1);
      adapted.name = `${recipe.name} (${suffix})`;
    }
    adapted.keyIngredients = calculateIngredients(recipe.keyIngredients, cleanDiet);
  }

  // 3. 🛡️ FILTRO DI SICUREZZA (ALLERGIE) - NUOVO LAYER
  if (allergies.length > 0) {
    adapted.keyIngredients = filterAllergens(adapted.keyIngredients, allergies);
    
    // Aggiungiamo un flag visuale se ci sono modifiche di sicurezza
    // (Opzionale: potremmo cambiare il nome in "Safe Pad Thai")
  }

  // 4. VISUAL BADGE
  adapted.activeDietLabel = cleanDiet === 'regular' ? 'ORIGINAL' : cleanDiet.toUpperCase();

  return adapted;
};

/**
 * Rimuove o sostituisce ingredienti basandosi sulle allergie selezionate
 */
const filterAllergens = (ingredients: string[], allergies: string[]): string[] => {
  const activeFilters = allergies.map(a => a.toLowerCase());

  return ingredients.map(ing => {
    const lowerIng = ing.toLowerCase();

    // 🥜 PEANUTS
    if (activeFilters.includes('peanuts')) {
      if (lowerIng.includes('peanut')) return 'Sunflower Seeds (Safe Crunch)';
    }

    // 🦐 SHELLFISH
    if (activeFilters.includes('shellfish')) {
      if (lowerIng.includes('shrimp') && !lowerIng.includes('paste')) return 'King Mushrooms';
      if (lowerIng.includes('shrimp paste')) return 'Sea Salt (No Shrimp)';
      if (lowerIng.includes('oyster sauce')) return 'Mushroom Sauce';
      if (lowerIng.includes('fish sauce')) return 'Soy Sauce'; // Spesso cross-contaminato
    }

    // 🍞 GLUTEN
    if (activeFilters.includes('gluten')) {
      if (lowerIng.includes('soy sauce')) return 'Tamari (GF)';
      if (lowerIng.includes('noodles') && !lowerIng.includes('rice')) return 'Rice Noodles';
    }

    return ing;
  });
};

/**
 * Helper Base per Dieta (Logica esistente)
 */
const calculateIngredients = (originalIngredients: string[], diet: string): string[] => {
  return originalIngredients.map(ing => {
    const lowerIng = ing.toLowerCase();

    if (diet === 'vegan' || diet === 'vegetarian') {
      if (lowerIng.includes('chicken') || lowerIng.includes('pork') || lowerIng.includes('beef')) return 'Firm Tofu';
      if (lowerIng.includes('shrimp') && !lowerIng.includes('paste')) return 'King Mushrooms';
      if (lowerIng.includes('fish sauce')) return 'Soy Sauce';
      if (lowerIng.includes('oyster sauce')) return 'Mushroom Sauce';
      if (lowerIng.includes('shrimp paste')) return 'Sea Salt';
    }

    if (diet === 'vegan') {
      if (lowerIng.includes('egg')) return 'Tofu Skin';
      if (lowerIng.includes('honey')) return 'Coconut Sugar';
    }

    if (diet === 'pescatarian') {
      if (lowerIng.includes('chicken') || lowerIng.includes('pork')) return 'River Prawns';
    }

    return ing;
  });
};