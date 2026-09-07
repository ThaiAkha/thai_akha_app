// ─────────────────────────────────────────────────────────────────────────────
// toolsPure — la parte SENZA rete degli strumenti di Cherry: dichiarazioni,
// URL, ordinamento dei risultati, forma della ricetta. Niente Deno, niente
// import da npm/jsr: cosi' la testa il runner di Node in packages/shared
// (lib/__tests__/cherryTools.test.ts) e la edge la importa com'e'.
// ─────────────────────────────────────────────────────────────────────────────

export type SearchKind = 'recipes' | 'ingredients' | 'culture' | 'news';
export const SEARCH_KINDS: readonly SearchKind[] = ['recipes', 'ingredients', 'culture', 'news'];

/** Tabella e hub (slug canonico della pagina, come front/lib/hubSlugs.ts) per famiglia. */
export const KIND_META: Record<SearchKind, { table: string; hub: string }> = {
  recipes: { table: 'recipes', hub: 'authentic-thai-akha-recipes' },
  ingredients: { table: 'ingredients_library', hub: 'thai-cooking-ingredients' },
  culture: { table: 'culture_sections', hub: 'akha-culture-highland-heritage' },
  news: { table: 'akha_news', hub: 'thai-cooking-tips-news' },
};

/** Per famiglia: quanti risultati chiedere e quanti tenerne. */
export const PER_KIND_LIMIT = 3;
export const ALL_KINDS_LIMIT = 5;
/**
 * Sotto questa somiglianza un risultato non e' una risposta: meglio dirlo che inventare.
 * MISURATA il 2026-09-07 sul catalogo vero (scripts/cherry-corpus): otto domande
 * fuori tema ("visto per la Thailandia", "noleggio scooter") arrivano fino a 0,35
 * di somiglianza; la risposta GIUSTA piu' debole delle 30 del corpus sta a 0,41.
 * 0,25 (primo valore) lasciava passare il rumore come se fosse una risposta.
 */
export const MIN_SIMILARITY = 0.38;
export const SNIPPET_CHARS = 280;

/** Dichiarazioni per Gemini (function calling). Le descrizioni sono il vero prompt degli strumenti. */
export const TOOL_DECLARATIONS = [
  {
    name: 'search_content',
    description:
      'Find what the guest is talking about in Thai Akha Kitchen content: a dish of the class menu (recipes), an ingredient (ingredients), an Akha culture story (culture) or a practical article (news). Call it BEFORE answering any question about a specific dish, ingredient, culture topic or article; use kind "all" when unsure. Returns the best matches with a short summary and the page url in the guest language.',
    parameters: {
      type: 'OBJECT',
      properties: {
        query: { type: 'STRING', description: 'What to look for, IN ENGLISH: translate the guest words if they wrote in another language, keeping the dish, ingredient or topic they named. The catalogue is indexed in English and a non-English query finds much less.' },
        kind: { type: 'STRING', enum: ['recipes', 'ingredients', 'culture', 'news', 'all'], description: 'Which family of content, or "all".' },
      },
      required: ['query'],
    },
  },
  {
    name: 'get_recipe',
    description:
      'The real key ingredients of ONE dish of the class menu, grouped by importance, with the substitutions that apply to this guest diet and allergies. Call it before listing or discussing ingredients of a dish; never list ingredients from memory. Needs the recipe slug from search_content.',
    parameters: {
      type: 'OBJECT',
      properties: { slug: { type: 'STRING', description: 'The recipe slug returned by search_content.' } },
      required: ['slug'],
    },
  },
] as const;

export const TOOL_NAMES = TOOL_DECLARATIONS.map((t) => t.name);

/**
 * URL della pagina: slug INGLESE con il prefisso lingua (negli slug tradotti
 * th/zh/ja/ko sono nulli). SEMPRE due livelli, ingredienti compresi: la pagina
 * legge solo il secondo segmento e decide da quello se e' una categoria o un
 * ingrediente, quindi un terzo segmento aprirebbe la griglia della categoria.
 */
export function contentUrl(kind: SearchKind, slug: string, lang: string): string {
  const prefix = !lang || lang === 'en' ? '' : `/${lang}`;
  return `${prefix}/${KIND_META[kind].hub}/${slug}`;
}

/** Testo corto, senza HTML e senza spezzare l'ultima parola. */
export function snippet(text: string | null | undefined, max = SNIPPET_CHARS): string {
  const clean = (text ?? '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
  if (clean.length <= max) return clean;
  const cut = clean.slice(0, max);
  const at = cut.lastIndexOf(' ');
  return `${(at > max * 0.6 ? cut.slice(0, at) : cut).trimEnd()}…`;
}

/** Campo tradotto se il sidecar lo ha, altrimenti quello inglese della riga. */
export function pick(row: Record<string, unknown>, field: string): string {
  const tr = Array.isArray(row.translations) ? (row.translations[0] as Record<string, unknown> | undefined) : undefined;
  const v = tr?.[field];
  if (typeof v === 'string' && v.trim()) return v;
  const base = row[field];
  return typeof base === 'string' ? base : '';
}

/**
 * La query non sembra inglese: caratteri fuori dall'alfabeto latino di base, o
 * lettere latine accentate. Serve solo a suggerire al modello di riprovare in
 * inglese quando non trova nulla: i vettori del catalogo sono inglesi e una
 * domanda nativa vale, misurato, 19/30 contro 30/30 (2026-09-07).
 */
export function looksNonEnglish(query: string): boolean {
  return /[^\u0000-\u007F]/.test(query);
}

export interface SearchHit {
  kind: SearchKind;
  slug: string;
  name: string;
  summary: string;
  url: string;
  similarity: number;
}

/** Unisce i risultati delle famiglie per somiglianza, scarta i deboli, taglia a `limit`. */
export function rankHits(hits: SearchHit[], limit: number): SearchHit[] {
  return hits
    .filter((h) => h.similarity >= MIN_SIMILARITY)
    .sort((a, b) => b.similarity - a.similarity)
    .slice(0, limit)
    .map((h) => ({ ...h, similarity: Math.round(h.similarity * 1000) / 1000 }));
}

interface KeyIngredientRow {
  ingredient: string;
  ingredient_id: string | null;
  display_order?: number | null;
  ui_role?: string | null;
  dietary_adaptations?: Record<string, { action?: 'substitute' | 'omit'; substitute_id?: string | null }> | null;
}

export interface RecipeToolResult {
  name: string;
  url: string;
  mostImportant: Array<{ name: string; note: string }>;
  supporting: string[];
  seasonings: string[];
  substitutions: string[];
  style: string;
}

/**
 * La ricetta come la deve raccontare Cherry: importanza progressiva, sostituzioni
 * dal dato (Sistema B, dietary_adaptations per ricetta), mai inventate. Stessa
 * regola del vecchio blocco RECIPE DATA di cherryRecipeContext, in forma dati.
 */
export function buildRecipeResult(
  recipe: Record<string, unknown>,
  ingredientsById: Map<string, Record<string, unknown>>,
  profileIds: readonly string[],
  lang: string,
): RecipeToolResult {
  const ings = ((recipe.recipe_key_ingredients as KeyIngredientRow[] | null) ?? [])
    .slice()
    .sort((a, b) => (a.display_order ?? 0) - (b.display_order ?? 0));
  const nameOf = (i: KeyIngredientRow) => (i.ingredient_id && pick(ingredientsById.get(i.ingredient_id) ?? {}, 'name')) || i.ingredient;
  const noteOf = (i: KeyIngredientRow) => snippet(i.ingredient_id ? pick(ingredientsById.get(i.ingredient_id) ?? {}, 'description') : '', 160);
  const byRole = (role: string) => ings.filter((i) => (i.ui_role ?? 'base') === role);
  const substitutions: string[] = [];
  for (const i of ings) {
    for (const pid of profileIds) {
      const a = i.dietary_adaptations?.[pid];
      if (!a) continue;
      if (a.action === 'omit') substitutions.push(`${nameOf(i)} → omitted (${pid})`);
      else if (a.action === 'substitute' && a.substitute_id) {
        const sub = pick(ingredientsById.get(a.substitute_id) ?? {}, 'name') || 'substitute';
        substitutions.push(`${nameOf(i)} → ${sub} (${pid})`);
      }
    }
  }
  return {
    name: pick(recipe, 'name'),
    url: contentUrl('recipes', String(recipe.slug ?? ''), lang),
    mostImportant: byRole('main').map((i) => ({ name: nameOf(i), note: noteOf(i) })),
    supporting: byRole('regular').map(nameOf),
    seasonings: ings.filter((i) => !['main', 'regular'].includes(i.ui_role ?? 'base')).map(nameOf),
    substitutions,
    style: 'Progressive importance: a few words of flavour on the most important ingredients, just name the seasonings. Never show category labels. Use the substitutions as facts for this guest.',
  };
}
