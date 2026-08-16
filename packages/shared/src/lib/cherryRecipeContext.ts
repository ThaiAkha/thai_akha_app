// ─────────────────────────────────────────────────────────────────────────────
// cherryRecipeContext — RAG ricette per le risposte AI di Cherry
//
// Quando l'utente chiede di una ricetta specifica, Cherry NON deve inventare gli
// ingredienti: questo helper rileva il piatto, recupera i dati reali (riusando
// recipe.service → recipe_key_ingredients con ui_role + dietary_adaptations) e
// costruisce un blocco "RECIPE DATA" da iniettare nel prompt del turno.
//
// `ui_role` (main/regular/base) NON va mostrato all'utente: guida solo la
// PROFONDITÀ del racconto (importanza progressiva). Le sostituzioni dieta/allergie
// arrivano dal dato (dietary_adaptations, Sistema B), mai inventate.
// ─────────────────────────────────────────────────────────────────────────────

import { recipeService } from '../services/recipe.service';

interface KeyIngredient {
  ingredient: string;
  ingredient_id: string;
  display_order?: number;
  ui_role?: string; // 'main' | 'regular' | 'base'
  dietary_adaptations?: Record<string, { action?: 'substitute' | 'omit'; substitute_id?: string | null }>;
}

// Token generici che da soli NON identificano un piatto (evitano falsi match).
const GENERIC_TOKENS = new Set([
  'thai', 'with', 'and', 'the', 'salad', 'soup', 'curry', 'fried', 'stir', 'fry',
  'sweet', 'sour', 'spicy', 'class', 'dish', 'rice', 'akha', 'homemade', 'fresh',
]);

function tokenize(s: string): string[] {
  const matches: string[] = s.toLowerCase().match(/[a-z]+/g) ?? [];
  return matches.filter((t) => t.length >= 3);
}

/** Trova la ricetta citata nel testo (match per token distintivi del nome). */
export function findRecipeInText(
  text: string,
  recipes: Record<string, unknown>[],
): Record<string, unknown> | null {
  const msgSet = new Set(tokenize(text));
  let best: { r: Record<string, unknown>; score: number } | null = null;

  for (const r of recipes) {
    const nameToks = tokenize(String(r.name ?? ''));
    let score = 0;
    let distinctive = 0;
    for (const tk of nameToks) {
      if (msgSet.has(tk)) {
        score++;
        if (!GENERIC_TOKENS.has(tk)) distinctive++;
      }
    }
    // Serve almeno un token DISTINTIVO (es. "papaya", "massaman") per evitare
    // che "curry" da solo matchi quattro curry diversi.
    if (distinctive >= 1 && (!best || score > best.score)) best = { r, score };
  }
  return best?.r ?? null;
}

function firstSentence(text: string, max = 160): string {
  const clean = text.replace(/\s+/g, ' ').trim();
  if (!clean) return '';
  const dot = clean.indexOf('. ');
  const cut = dot > 0 && dot < max ? dot + 1 : Math.min(clean.length, max);
  return clean.slice(0, cut).trim();
}

/**
 * Costruisce il blocco RECIPE DATA per il prompt, oppure null se nessuna ricetta
 * è riconosciuta nel testo.
 * @param text             messaggio utente
 * @param activeProfileIds profili attivi dell'utente (es. ['diet_vegan','allergy_peanuts'])
 */
export async function getRecipeContextForCherry(
  text: string,
  activeProfileIds: string[] = [],
): Promise<string | null> {
  const recipes = await recipeService.getAllRecipesFull();
  const recipe = findRecipeInText(text, recipes);
  if (!recipe) return null;

  const lib = await recipeService.getIngredientsLibrary();
  const libById = new Map(lib.map(i => [String((i as Record<string, unknown>).id), i as Record<string, unknown>]));

  const ings = (((recipe.recipe_key_ingredients as KeyIngredient[]) ?? []))
    .slice()
    .sort((a, b) => (a.display_order ?? 0) - (b.display_order ?? 0));

  const nameOf = (i: KeyIngredient) =>
    String((libById.get(String(i.ingredient_id))?.name_en as string) ?? i.ingredient);
  const descOf = (i: KeyIngredient) =>
    firstSentence(String((libById.get(String(i.ingredient_id))?.description as string) ?? ''));

  const byRole = (role: string) => ings.filter(i => (i.ui_role ?? 'base') === role);
  const main = byRole('main');
  const regular = byRole('regular');
  const base = ings.filter(i => !['main', 'regular'].includes(i.ui_role ?? 'base'));

  // Sostituzioni dal dato (Sistema B: dietary_adaptations per-ricetta).
  const subs: string[] = [];
  for (const i of ings) {
    const adapt = i.dietary_adaptations ?? {};
    for (const pid of activeProfileIds) {
      const a = adapt[pid];
      if (!a) continue;
      if (a.action === 'omit') {
        subs.push(`${nameOf(i)} → omitted (${pid})`);
      } else if (a.action === 'substitute' && a.substitute_id) {
        const subName = String((libById.get(String(a.substitute_id))?.name_en as string) ?? 'substitute');
        subs.push(`${nameOf(i)} → ${subName} (${pid})`);
      }
    }
  }

  const lines: string[] = [];
  lines.push(`### RECIPE DATA — ${String(recipe.name)} (authoritative — answer ONLY from this, do not invent ingredients):`);
  if (main.length) {
    lines.push(
      `MOST IMPORTANT (spend a couple of words of flavour/interest): ` +
      main.map(i => (descOf(i) ? `${nameOf(i)} — ${descOf(i)}` : nameOf(i))).join('; '),
    );
  }
  if (regular.length) lines.push(`SUPPORTING (introduce briefly): ${regular.map(nameOf).join(', ')}`);
  if (base.length) lines.push(`SEASONINGS / BASE (just name them for completeness): ${base.map(nameOf).join(', ')}`);
  if (subs.length) lines.push(`SUBSTITUTIONS for this guest (use these, never invent): ${subs.join('; ')}`);
  lines.push(
    `STYLE: progressive importance — more words on the most important ingredients, just name the seasonings. ` +
    `Do NOT show category labels (no "main/regular/base"). Plain text.`,
  );
  return lines.join('\n');
}
