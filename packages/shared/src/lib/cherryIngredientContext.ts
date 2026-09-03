// ─────────────────────────────────────────────────────────────────────────────
// cherryIngredientContext — RAG ingredienti per Cherry (knowledge L2/L3)
//
// Domande tipo "cos'è il galangal?", "raccontami della citronella" → recupera
// l'ingrediente da ingredients_library e ne dà la descrizione reale, invece di
// allucinare (il guardrail in 03-recipes deflette senza dati).
//
// Fonte L2: summary_ai se presente, altrimenti `description` (oggi popolata
// 193/194; summary_ai ancora vuota → fallback automatico).
//
// Da chiamare SOLO se la RAG ricette NON ha matchato (le domande su un piatto
// hanno precedenza). Match conservativo: solo nomi-ingrediente distintivi.
// ─────────────────────────────────────────────────────────────────────────────

import { recipeService } from '../services/recipe.service';

// Parole troppo comuni per attivare da sole una scheda ingrediente (evitano
// falsi positivi con domande generiche su cibo/ricette).
const GENERIC_INGREDIENT_TOKENS = new Set([
  'garlic', 'pepper', 'tomato', 'tomatoes', 'carrot', 'carrots', 'onion', 'onions',
  'shallot', 'shallots', 'chicken', 'shrimp', 'prawn', 'prawns', 'noodle', 'noodles',
  'sugar', 'water', 'sauce', 'paste', 'powder', 'fresh', 'dried', 'green', 'red',
]);

const FULL_DETAIL_SIGNALS = [
  'full', 'everything', 'in detail', 'detailed', 'more about', 'in depth',
  'tutto', 'dettagli', 'approfond', 'completo',
];

function tokenize(s: string): string[] {
  const matches: string[] = s.toLowerCase().match(/[a-z]+/g) ?? [];
  return matches.filter((t) => t.length >= 3);
}

/**
 * Cerca l'ingrediente più pertinente citato nel testo. Conservativo: serve un
 * token distintivo del nome (lungo ≥6 e non generico) — così "galangal",
 * "lemongrass", "fingerroot", "tamarind" matchano, "garlic"/"onion" no.
 */
export function findIngredient(
  text: string,
  ingredients: Array<Record<string, unknown>>,
): Record<string, unknown> | null {
  const msgSet = new Set(tokenize(text));
  let best: { ing: Record<string, unknown>; score: number } | null = null;

  for (const ing of ingredients) {
    const nameToks = tokenize(String(ing.name ?? ''));
    if (nameToks.length === 0) continue;

    let score = 0;
    let distinctive = 0;
    for (const tk of nameToks) {
      if (!msgSet.has(tk)) continue;
      score++;
      if (tk.length >= 6 && !GENERIC_INGREDIENT_TOKENS.has(tk)) distinctive++;
    }
    // Match valido solo se l'utente ha citato un token distintivo del nome.
    if (distinctive >= 1 && (!best || score > best.score)) best = { ing, score };
  }
  return best?.ing ?? null;
}

function wantsFullDetail(text: string): boolean {
  const hay = (text ?? '').toLowerCase();
  return FULL_DETAIL_SIGNALS.some((kw) => hay.includes(kw));
}

function truncate(text: string, max: number): string {
  const clean = (text ?? '').trim();
  return clean.length <= max ? clean : clean.slice(0, max).trimEnd() + '…';
}

/**
 * Blocco INGREDIENT DATA per il prompt, o null se nessun ingrediente distintivo
 * è riconosciuto. summary_ai (futuro) → description (oggi).
 */
export async function getIngredientContextForCherry(text: string): Promise<string | null> {
  const ingredients = await recipeService.getIngredientsLibrary();
  const ing = findIngredient(text, ingredients);
  if (!ing) return null;

  const summary = String(ing.summary_ai ?? '').trim();
  const description = String(ing.description ?? '').trim();
  const wantFull = wantsFullDetail(text);
  const knowledge = summary || description;
  if (!knowledge) return null;

  const name = String(ing.name ?? 'ingredient');
  const thai = String(ing.name_th ?? '').trim();
  const phonetic = String(ing.phonetic ?? '').trim();
  const nameLine = thai || phonetic ? `${name}${thai ? ` (${thai}${phonetic ? `, ${phonetic}` : ''})` : ''}` : name;

  const body = wantFull ? knowledge : truncate(knowledge, 600);

  return [
    `### INGREDIENT DATA — ${nameLine} (authoritative — answer ONLY from this, never invent botanical facts):`,
    body,
    `STYLE: warm, knowledgeable cook's voice — what it is, how it tastes, how we use it in the Akha/Thai kitchen. ~120 words, plain text, no labels kha.`,
  ].join('\n');
}
