// ─────────────────────────────────────────────────────────────────────────────
// cherryDietContext — conoscenza DIETE & ALLERGIE per Cherry (read-only).
//
// Su intento dieta/allergia, inietta la knowledge AUTOREVOLE dal DB:
//   • description_long (contesto: dove si nasconde l'allergene, protocollo)
//   • experience      (la frase azionabile sulla sostituzione)
//   • dietary_substitutions (gli swap strutturati ingrediente→ingrediente)
// Fonte unica: recipeService.getDietaryProfiles() (cached). Mai inventare.
//
// Target: i profili citati nel testo + i profili attivi dell'utente. Se nessun
// profilo specifico → panoramica compatta + invito a indicare dieta/allergia.
// ─────────────────────────────────────────────────────────────────────────────

import { recipeService } from '../services/recipe.service';

const DIET_INTENT = [
  'vegan', 'plant-based', 'plant based', 'vegetarian', 'pescatarian', 'pescatian',
  'meat lover', 'meat-lover', 'carnivore', 'halal', 'kosher', 'jain', 'hindu',
  'rastafari', 'ital', 'allerg', 'intoleran', 'gluten', 'celiac', 'coeliac', 'wheat',
  'peanut', 'tree nut', 'cashew', 'nut-free', 'nut free', 'shellfish', 'shrimp', 'prawn',
  'seafood', 'fish sauce', 'soy', 'soya', 'sesame', 'egg', 'dairy', 'lactose',
  'substitut', 'can i eat', 'suitable for', 'safe for', 'what can i eat', 'diet', 'dietary',
  // IT
  'vegano', 'vegetariano', 'senza glutine', 'allergi', 'intolleran', 'sostitut', 'dieta',
];

export function hasDietIntent(text: string): boolean {
  const h = (text ?? '').toLowerCase();
  return DIET_INTENT.some((k) => h.includes(k));
}

/** Sinonimo nel testo → id profilo dietary_profiles. Più specifico prima. */
const SYNONYM_TO_PROFILE: Array<[string, string]> = [
  ['fish sauce', 'allergy_fish_sauce'],
  ['soy sauce', 'allergy_soy_sauce'],
  ['tree nut', 'allergy_tree_nuts'],
  ['cashew', 'allergy_tree_nuts'],
  ['peanut', 'allergy_peanuts'],
  ['gluten', 'allergy_gluten'], ['celiac', 'allergy_gluten'], ['coeliac', 'allergy_gluten'], ['wheat', 'allergy_gluten'],
  ['shellfish', 'allergy_shellfish'], ['shrimp', 'allergy_shellfish'], ['prawn', 'allergy_shellfish'],
  ['seafood', 'allergy_seafood'],
  ['sesame', 'allergy_sesame'],
  ['soya', 'allergy_soy'], ['soy', 'allergy_soy'],
  ['egg', 'allergy_eggs'],
  ['plant-based', 'diet_vegan'], ['plant based', 'diet_vegan'], ['vegan', 'diet_vegan'], ['vegano', 'diet_vegan'],
  ['vegetarian', 'diet_vegetarian'], ['vegetariano', 'diet_vegetarian'],
  ['pescatarian', 'diet_pescatarian'], ['pescatian', 'diet_pescatarian'],
  ['meat lover', 'diet_meat_lover'], ['meat-lover', 'diet_meat_lover'], ['carnivore', 'diet_meat_lover'],
  ['halal', 'diet_halal'],
  ['kosher', 'diet_kosher'],
  ['jain', 'diet_jainism'],
  ['hindu', 'diet_hinduism'],
  ['rastafari', 'diet_rastafari'], ['ital', 'diet_rastafari'],
];

type Profile = {
  id?: string; name?: string; type?: string;
  description?: string; description_long?: string; experience?: string;
  substitutions?: Array<{ original?: string; substitute?: string }>;
};

/** Blocco DIET & ALLERGY, o null se nessun intento dieta/allergia. */
export async function getDietContextForCherry(
  text: string,
  ctx?: { activeProfileIds?: string[] },
): Promise<string | null> {
  if (!hasDietIntent(text)) return null;

  const profiles = (await recipeService.getDietaryProfiles()) as Profile[];
  if (!profiles || profiles.length === 0) return null;

  const h = (text ?? '').toLowerCase();
  const byId = new Map<string, Profile>(profiles.map((p) => [String(p.id ?? ''), p]));

  // Profili pertinenti: sinonimi nel testo + profili attivi dell'utente.
  const ids = new Set<string>();
  for (const [kw, id] of SYNONYM_TO_PROFILE) if (h.includes(kw) && byId.has(id)) ids.add(id);
  for (const id of ctx?.activeProfileIds ?? []) if (byId.has(id)) ids.add(id);

  const picked = Array.from(ids).map((id) => byId.get(id)).filter(Boolean).slice(0, 3) as Profile[];

  // Nessun profilo specifico → panoramica compatta + invito.
  if (picked.length === 0) {
    const diets = profiles.filter((p) => p.type !== 'allergy').map((p) => p.name).filter(Boolean);
    const allergies = profiles.filter((p) => p.type === 'allergy').map((p) => p.name).filter(Boolean);
    return [
      `### DIET & ALLERGY SUPPORT (authoritative):`,
      `Every guest cooks at their own individual station — the diet sets the rules, not the menu, with zero cross-contamination.`,
      `Lifestyle/religious diets we support: ${diets.join(', ')}.`,
      `Allergies we handle: ${allergies.join(', ')}.`,
      `STYLE: warm; answer from this and invite the guest to tell you their diet/allergy for the exact substitutions. Plain text kha.`,
    ].join('\n');
  }

  const blocks = picked.map((p) => {
    const ctxText = (p.description_long || p.experience || p.description || '').toString().trim();
    const swaps = (p.substitutions ?? [])
      .filter((s) => s?.original && s?.substitute)
      .slice(0, 5)
      .map((s) => `${s.original} → ${s.substitute}`)
      .join('; ');
    return [`• ${p.name}: ${ctxText}`, swaps ? `  Substitutions: ${swaps}.` : ''].filter(Boolean).join('\n');
  });

  return [
    `### DIET & ALLERGY (authoritative — answer from this, never invent):`,
    ...blocks,
    `STYLE: warm and reassuring — "Your Wok, Your Rules", own individual station, zero cross-contamination. Cite the substitutions as facts. Plain text kha.`,
  ].join('\n');
}
