/**
 * recipeProfileUtils.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * Utilities for applying diet + allergy profiles to recipe data.
 *
 * Architecture (3 layers):
 *   Layer 1 — recipe_key_ingredients.dietary_adaptations
 *             → which ingredient cards to show / swap in the Hero Grid
 *   Layer 2 — recipes.dietary_variants
 *             → full narrative text rewrite per diet profile
 *   Layer 3 — recipes.allergen_adaptations
 *             → text field overrides + ingredient substitutions for medical allergies
 *
 * Naming conventions
 *   profileId  → diet key  e.g. "diet_vegan", "diet_jainism"
 *   allergyKey → allergy   e.g. "allergy_peanuts", "allergy_fish_sauce"
 *                           (prefix "allergy_" stripped when looking up allergen_adaptations)
 */

// ─── Types ────────────────────────────────────────────────────────────────────

export interface KeyIngredient {
  ingredient: string;
  ingredient_id: string;
  display_order?: number;
  dietary_adaptations: Record<string, {
    action: 'substitute' | 'omit';
    substitute_id: string | null;
    alt_substitute_id: string | null;
  }>;
  // resolved by the UI after fetching ingredients_library
  resolved_ingredient_id?: string;
  is_omitted?: boolean;
  has_alternative?: boolean;
}

export interface AllergenAdaptation {
  action: 'omit' | 'substitute';
  omit: string[];
  substitute: string | null;
  substitute_allergens: string[];
  note_for_user: string;
  text_fields_affected: string[];
  base_overrides: Record<string, string | Record<string, string>>;
  variant_overrides: Record<string, Record<string, string>>;
}

export interface RecipeData {
  id: string;
  slug: string;
  name: string;
  description: string;
  health_benefits: string;
  notes: string;
  garnish: string;
  cooks_tip: string;
  directions: string[];
  essentials?: Record<string, string>;
  author_note: string;
  dietary_variants?: Record<string, Record<string, unknown>>;
  allergen_adaptations?: Record<string, AllergenAdaptation>;
  recipe_key_ingredients?: KeyIngredient[];
  [key: string]: unknown;
}

// ─── Layer 2: Apply diet profile (narrative text) ────────────────────────────

/**
 * Returns the recipe with text fields replaced by the active diet variant.
 * Fields overridden: name, subtitle, excerpt, description, health_benefits,
 *                    notes, garnish, cooks_tip, directions, essentials, author_note
 *
 * Falls back to base recipe fields if variant or field is missing.
 */
export function applyDietaryProfile(
  recipe: RecipeData,
  profileId: string | null
): RecipeData {
  if (!profileId || !recipe.dietary_variants?.[profileId]) return recipe;

  const variant = recipe.dietary_variants[profileId] as Record<string, unknown>;
  const NARRATIVE_FIELDS = [
    'name', 'subtitle', 'excerpt', 'description', 'health_benefits',
    'notes', 'garnish', 'cooks_tip', 'directions', 'essentials', 'author_note',
  ] as const;

  const result = { ...recipe };
  for (const field of NARRATIVE_FIELDS) {
    if (variant[field] !== undefined && variant[field] !== null && variant[field] !== '') {
      (result as Record<string, unknown>)[field] = variant[field];
    }
  }
  return result;
}

// ─── Layer 3: Apply allergen adaptation (text overrides) ─────────────────────

/**
 * Strips the "allergy_" prefix to match allergen_adaptations keys.
 * e.g. "allergy_peanuts" → "peanuts"
 */
function toAllergenKey(allergyKey: string): string {
  return allergyKey.replace(/^allergy[_-]/, '');
}

/**
 * Removes HTML paragraphs containing a specific substring from a field string.
 * Used for variant_overrides._all_variants.health_benefits_remove_paragraph_containing
 */
function removeParagraphContaining(html: string, phrase: string): string {
  const lower = phrase.toLowerCase();
  return html
    .split(/(?=<p[^>]*>)/i)
    .filter(para => !para.toLowerCase().includes(lower))
    .join('');
}

/**
 * Applies allergen base_overrides to a recipe's top-level text fields.
 *
 * base_overrides supports:
 *   - "fieldName": "replacement string"        → direct replacement
 *   - "directions": { "N": "step text" }        → replace step at index N
 */
function applyBaseOverrides(
  recipe: RecipeData,
  overrides: Record<string, string | Record<string, string>>
): RecipeData {
  const result = { ...recipe };

  for (const [field, override] of Object.entries(overrides)) {
    if (field === 'directions' && typeof override === 'object' && !Array.isArray(override)) {
      const dirs = Array.isArray(recipe.directions) ? [...recipe.directions] : [];
      for (const [idx, text] of Object.entries(override as Record<string, string>)) {
        dirs[parseInt(idx, 10)] = text;
      }
      result.directions = dirs;
    } else if (typeof override === 'string') {
      (result as Record<string, unknown>)[field] = override;
    }
  }
  return result;
}

/**
 * Applies allergen variant_overrides to an already-resolved variant object.
 *
 * variant_overrides supports:
 *   - "diet_X": { "fieldName": "replacement" }
 *   - "_all_variants": { "health_benefits_remove_paragraph_containing": "phrase",
 *                        "health_benefits_append_paragraph": "<p>...</p>" }
 */
function applyVariantOverrides(
  variantData: Record<string, unknown>,
  variantKey: string,
  variantOverrides: Record<string, Record<string, string>>
): Record<string, unknown> {
  const result = { ...variantData };

  // Apply wildcard first, then specific variant (specific wins)
  const keys = ['_all_variants', variantKey].filter(k => variantOverrides[k]);

  for (const key of keys) {
    const overrides = variantOverrides[key];
    for (const [field, value] of Object.entries(overrides)) {
      if (field.endsWith('_remove_paragraph_containing')) {
        const targetField = field.replace('_remove_paragraph_containing', '');
        if (typeof result[targetField] === 'string') {
          result[targetField] = removeParagraphContaining(result[targetField] as string, value);
        }
      } else if (field.endsWith('_append_paragraph')) {
        const targetField = field.replace('_append_paragraph', '');
        if (typeof result[targetField] === 'string') {
          // Insert before closing paragraph if possible
          const existing = result[targetField] as string;
          const lastP = existing.lastIndexOf('</p>');
          result[targetField] = lastP !== -1
            ? existing.slice(0, lastP + 4) + '\n' + value
            : existing + '\n' + value;
        }
      } else {
        result[field] = value;
      }
    }
  }
  return result;
}

/**
 * Applies allergen adaptations (Layer 3) to a recipe.
 * Call AFTER applyDietaryProfile if both a diet and allergy are active.
 *
 * @param recipe      Recipe (already diet-adapted if applicable)
 * @param allergyKey  e.g. "allergy_peanuts" or "peanuts"
 * @param activeProfileId  Current diet profile (for variant_overrides lookup)
 */
export function applyAllergenAdaptation(
  recipe: RecipeData,
  allergyKey: string,
  activeProfileId: string | null = null
): RecipeData {
  const key = toAllergenKey(allergyKey);
  const adaptation = recipe.allergen_adaptations?.[key];
  if (!adaptation) return recipe;

  // Apply base text overrides
  let result = applyBaseOverrides(recipe, adaptation.base_overrides ?? {});

  // Apply variant-specific overrides to the active diet variant's fields
  if (activeProfileId && adaptation.variant_overrides) {
    const currentVariant = result.dietary_variants?.[activeProfileId] as Record<string, unknown> | undefined;
    if (currentVariant) {
      const adaptedVariant = applyVariantOverrides(
        currentVariant,
        activeProfileId,
        adaptation.variant_overrides
      );
      result = {
        ...result,
        dietary_variants: {
          ...result.dietary_variants,
          [activeProfileId]: adaptedVariant,
        },
      };
    }
  }

  return result;
}

/**
 * Apply multiple allergen adaptations in sequence.
 * Multi-allergy: each allergen is applied independently.
 * The `substitute_allergens` field is used by the caller to warn about conflicts.
 */
export function applyMultipleAllergens(
  recipe: RecipeData,
  allergyKeys: string[],
  activeProfileId: string | null = null
): { recipe: RecipeData; conflicts: string[] } {
  let result = recipe;
  const conflicts: string[] = [];

  for (const allergyKey of allergyKeys) {
    const key = toAllergenKey(allergyKey);
    const adaptation = recipe.allergen_adaptations?.[key];

    if (adaptation) {
      // Check for conflicts: does this allergen's substitute itself trigger another active allergy?
      const substituteAllergens = adaptation.substitute_allergens ?? [];
      const activeKeys = allergyKeys.map(toAllergenKey);
      const conflicting = substituteAllergens.filter(s => activeKeys.includes(s));
      if (conflicting.length > 0) {
        conflicts.push(`${key} substitute contains: ${conflicting.join(', ')}`);
      }

      result = applyAllergenAdaptation(result, allergyKey, activeProfileId);
    }
  }

  return { recipe: result, conflicts };
}

// ─── Layer 1: Resolve ingredient grid ────────────────────────────────────────

export interface ResolvedIngredient {
  ingredient_id: string;       // UUID to fetch from ingredients_library
  original_id: string;         // original UUID (for reference)
  is_substituted: boolean;
  is_omitted: boolean;
  has_alternative: boolean;    // true if alt_substitute_id exists
  alt_ingredient_id: string | null;
  action: 'show' | 'substitute' | 'omit' | 'choice';
}

/**
 * Resolves the ingredient grid for a given set of active profiles.
 * Profiles can be diet (diet_vegan) or allergy (allergy_peanuts).
 *
 * Priority: if a profile says "omit", the ingredient is hidden.
 *           if multiple profiles say "substitute", last write wins.
 *           if alt_substitute_id exists, UI shows a "choose between" banner.
 */
export function resolveIngredientGrid(
  keyIngredients: KeyIngredient[],
  activeProfiles: string[]  // e.g. ["diet_vegan", "allergy_peanuts"]
): ResolvedIngredient[] {
  return keyIngredients.map(ki => {
    let resolvedId = ki.ingredient_id;
    let isOmitted = false;
    let isSubstituted = false;
    let hasAlternative = false;
    let altId: string | null = null;
    let action: ResolvedIngredient['action'] = 'show';

    for (const profileKey of activeProfiles) {
      const adapt = ki.dietary_adaptations?.[profileKey];
      if (!adapt) continue;

      if (adapt.action === 'omit') {
        isOmitted = true;
        action = 'omit';
        break; // omit takes priority
      }

      if (adapt.action === 'substitute' && adapt.substitute_id) {
        resolvedId = adapt.substitute_id;
        isSubstituted = true;
        action = adapt.alt_substitute_id ? 'choice' : 'substitute';
        hasAlternative = !!adapt.alt_substitute_id;
        altId = adapt.alt_substitute_id;
      }
    }

    return {
      ingredient_id: resolvedId,
      original_id: ki.ingredient_id,
      is_substituted: isSubstituted,
      is_omitted: isOmitted,
      has_alternative: hasAlternative,
      alt_ingredient_id: altId,
      action,
    };
  });
}

// ─── Cherry AI helper ─────────────────────────────────────────────────────────

/**
 * Returns the allergen note for Cherry AI to read aloud.
 * If multiple allergies active, returns all notes joined.
 */
export function getAllergenNotesForCherry(
  recipe: RecipeData,
  allergyKeys: string[]
): string {
  const notes: string[] = [];
  for (const key of allergyKeys) {
    const k = toAllergenKey(key);
    const note = recipe.allergen_adaptations?.[k]?.note_for_user;
    if (note) notes.push(note);
  }
  return notes.join(' ');
}

/**
 * Returns a conflict warning message when two active allergies conflict
 * (e.g. fish-free substitute is soy sauce but user is also soy-allergic).
 */
export function getConflictWarning(conflicts: string[]): string | null {
  if (!conflicts.length) return null;
  return `Note: some substitutions may conflict with your other allergies — ${conflicts.join('; ')}. Ask your instructor for guidance.`;
}
