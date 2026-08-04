/**
 * useRecipeProfile.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * React hook that resolves the final recipe data by combining:
 *   1. Base recipe (from DB)
 *   2. Active diet profile → dietary_variants text overrides (Layer 2)
 *   3. Active allergies   → allergen_adaptations text overrides (Layer 3)
 *   4. Ingredient grid    → recipe_key_ingredients + dietary_adaptations (Layer 1)
 *
 * Usage:
 *   const { recipe, keyIngredients, allergenNotes, conflictWarning } =
 *     useRecipeProfile(rawRecipe, userProfile);
 */

import { useMemo } from 'react';
import {
  applyDietaryProfile,
  applyMultipleAllergens,
  resolveIngredientGrid,
  getAllergenNotesForCherry,
  getConflictWarning,
  type RecipeData,
  type KeyIngredient,
  type ResolvedIngredient,
} from '@thaiakha/shared/lib/recipeProfileUtils';

// ─── User profile shape ───────────────────────────────────────────────────────

export interface UserProfile {
  /** Active diet profile key, e.g. "diet_vegan" | null = base recipe */
  dietProfileId: string | null;
  /** Active allergy keys, e.g. ["allergy_peanuts", "allergy_fish_sauce"] */
  allergyKeys: string[];
}

// ─── Hook return type ─────────────────────────────────────────────────────────

export interface RecipeProfileResult {
  /** Final recipe with all text fields resolved for the active profile */
  recipe: RecipeData;
  /** Resolved ingredient cards for the Hero Grid */
  keyIngredients: ResolvedIngredient[];
  /** Note(s) for Cherry AI to read when an allergy is active */
  allergenNotes: string;
  /** Warning message if two active allergies conflict (e.g. fish → soy substitute, but soy allergy active) */
  conflictWarning: string | null;
  /** Whether any diet or allergy adaptation is active */
  isAdapted: boolean;
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useRecipeProfile(
  rawRecipe: RecipeData | null,
  userProfile: UserProfile,
  rawKeyIngredients: KeyIngredient[] = []
): RecipeProfileResult {
  return useMemo(() => {
    if (!rawRecipe) {
      return {
        recipe: {} as RecipeData,
        keyIngredients: [],
        allergenNotes: '',
        conflictWarning: null,
        isAdapted: false,
      };
    }

    const { dietProfileId, allergyKeys } = userProfile;
    const hasAllergies = allergyKeys.length > 0;
    const hasDiet = !!dietProfileId;

    // ── Layer 2: apply diet variant narrative ─────────────────────────────────
    let adapted = hasDiet
      ? applyDietaryProfile(rawRecipe, dietProfileId)
      : rawRecipe;

    // ── Layer 3: apply allergen text overrides ────────────────────────────────
    let conflicts: string[] = [];
    if (hasAllergies) {
      const result = applyMultipleAllergens(adapted, allergyKeys, dietProfileId);
      adapted = result.recipe;
      conflicts = result.conflicts;
    }

    // ── Layer 1: resolve ingredient grid ──────────────────────────────────────
    // Combine diet + allergy profile keys for ingredient resolution
    const activeProfiles = [
      ...(dietProfileId ? [dietProfileId] : []),
      ...allergyKeys,
    ];
    const keyIngredients = resolveIngredientGrid(rawKeyIngredients, activeProfiles);

    // ── Cherry AI allergy notes ───────────────────────────────────────────────
    const allergenNotes = hasAllergies
      ? getAllergenNotesForCherry(rawRecipe, allergyKeys)
      : '';

    return {
      recipe: adapted,
      keyIngredients,
      allergenNotes,
      conflictWarning: getConflictWarning(conflicts),
      isAdapted: hasDiet || hasAllergies,
    };
  }, [rawRecipe, userProfile, rawKeyIngredients]);
}
