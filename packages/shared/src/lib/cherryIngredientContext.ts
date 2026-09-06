// ─────────────────────────────────────────────────────────────────────────────
// cherryIngredientContext — RAG ingredienti per Cherry (knowledge L2/L3)
//
// Domande tipo "cos'è il galangal?", "raccontami della citronella" → recupera
// l'ingrediente da ingredients_library e ne dà la descrizione reale, invece di
// allucinare (il guardrail in 03-recipes deflette senza dati).
//
// Fonte L2: summary_ai se presente, altrimenti `description`. Dal 2026-09-05
// arriva da `getIngredientsLibraryForAI`: summary_ai e' popolata e pesa 149 KB,
// quindi non viaggia piu' con la lista che serve a disegnare la pagina ricetta.
//
// Da chiamare SOLO se la RAG ricette NON ha matchato (le domande su un piatto
// hanno precedenza). Match conservativo: solo nomi-ingrediente distintivi.
// ─────────────────────────────────────────────────────────────────────────────

import { recipeService } from '../services/recipe.service';
import { tokenize, truncate, includesAny, scoreName } from './cherryTextUtils';

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

/** La lista sopra e' di QUESTO contesto: la funzione e' condivisa, le parole no. */
const wantsFullDetail = (text: string): boolean => includesAny(text, FULL_DETAIL_SIGNALS);


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
    // Nome inglese (`name_key`) per riconoscere, nome tradotto solo per il
    // punteggio (vedi scoreName). Match valido solo se l'utente ha citato un
    // token distintivo del nome.
    const { score, distinctive } = scoreName(
      msgSet, String(ing.name_key ?? ing.name ?? ''), String(ing.name ?? ''),
      (tk) => tk.length >= 6 && !GENERIC_INGREDIENT_TOKENS.has(tk),
    );
    if (distinctive >= 1 && (!best || score > best.score)) best = { ing, score };
  }
  return best?.ing ?? null;
}



/**
 * Blocco INGREDIENT DATA per il prompt, o null se nessun ingrediente distintivo
 * è riconosciuto. summary_ai (futuro) → description (oggi).
 */
export async function getIngredientContextForCherry(text: string, lang = 'en'): Promise<string | null> {
  const ingredients = await recipeService.getIngredientsLibraryForAI(lang);
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
