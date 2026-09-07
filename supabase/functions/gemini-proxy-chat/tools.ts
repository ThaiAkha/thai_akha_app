// ─────────────────────────────────────────────────────────────────────────────
// tools — esecuzione degli strumenti di Cherry nella edge (Deno).
//
// Regole dati (concordate con /database il 2026-09-07):
//   • match_semantic e i dettagli col SERVICE ROLE: la funzione filtra le bozze
//     e non e' piu' concessa ad anon/authenticated (migration 20260907200000);
//   • mai `select('*')` dove c'e' semantic_vector: 1.536 numeri per riga;
//   • i vettori sono inglesi: la domanda si embedda nello stesso spazio;
//   • una riga modificata sparisce dalla ricerca fino al tick orario.
// Un errore dello strumento torna al modello come { error }, mai come throw:
// la risposta continua senza quel dato.
// ─────────────────────────────────────────────────────────────────────────────
import type { SupabaseClient } from 'jsr:@supabase/supabase-js@2';
import {
  ALL_KINDS_LIMIT, KIND_META, PER_KIND_LIMIT, SEARCH_KINDS, buildRecipeResult, contentUrl, looksNonEnglish, pick, rankHits, snippet,
  type SearchHit, type SearchKind,
} from './toolsPure.ts';

const EMBED_MODEL = 'text-embedding-3-small'; // 1536 dim, lo stesso di generate-embeddings

export interface ToolContext {
  supabase: SupabaseClient;
  lang: string;
  profileIds: string[];
  openaiKey: string | undefined;
}

type Row = Record<string, unknown>;

async function embedQuery(text: string, key: string, signal?: AbortSignal): Promise<number[]> {
  const res = await fetch('https://api.openai.com/v1/embeddings', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${key}` },
    body: JSON.stringify({ model: EMBED_MODEL, input: text.slice(0, 1000) }),
    signal,
  });
  if (!res.ok) throw new Error(`OpenAI ${res.status}`);
  const data = await res.json();
  return data.data[0].embedding as number[];
}

/** Join del sidecar solo se la lingua non e' l'inglese (come sidecarJoin del front). */
const tr = (table: string, fields: string, lang: string) => (lang === 'en' ? '' : `, translations:${table}(lang, ${fields})`);

/** Colonne esplicite per famiglia (mai `*`: semantic_vector). */
const DETAIL_SELECT: Record<SearchKind, (lang: string) => string> = {
  recipes: (l) => `id, slug, name, excerpt, summary_ai${tr('recipes_translations', 'name, excerpt, summary_ai', l)}`,
  ingredients: (l) => `id, slug, name, description, summary_ai, category_id${tr('ingredients_library_translations', 'name, description, summary_ai', l)}`,
  culture: (l) => `id, slug, title, summary_ai${tr('culture_sections_translations', 'title, summary_ai', l)}`,
  news: (l) => `id, slug, title, excerpt, summary_ai${tr('akha_news_translations', 'title, excerpt, summary_ai', l)}`,
};

async function searchKind(ctx: ToolContext, kind: SearchKind, vector: number[], limit: number, signal?: AbortSignal): Promise<SearchHit[]> {
  const { table } = KIND_META[kind];
  const rpc = ctx.supabase.rpc('match_semantic', {
    query_embedding: `[${vector.join(',')}]`,
    match_table: table,
    match_count: limit,
  });
  const { data: matches, error } = await (signal ? rpc.abortSignal(signal) : rpc);
  if (error || !matches?.length) return [];
  const byId = new Map((matches as Array<{ id: string; similarity: number }>).map((m) => [m.id, m.similarity]));
  let q = ctx.supabase.from(table).select(DETAIL_SELECT[kind](ctx.lang)).in('id', Array.from(byId.keys()));
  if (ctx.lang !== 'en') q = q.eq('translations.lang', ctx.lang);
  const { data: rows } = await (signal ? q.abortSignal(signal) : q);
  return ((rows ?? []) as unknown as Row[]).map((r) => {
    const name = pick(r, 'name') || pick(r, 'title');
    const summary = snippet(pick(r, 'summary_ai') || pick(r, 'excerpt') || pick(r, 'description'));
    return {
      kind,
      slug: String(r.slug ?? ''),
      name,
      summary,
      url: contentUrl(kind, String(r.slug ?? ''), ctx.lang, kind === 'ingredients' ? (r.category_id as string | null) : null),
      similarity: byId.get(String(r.id)) ?? 0,
    };
  });
}

export async function searchContent(ctx: ToolContext, args: { query?: string; kind?: string }, signal?: AbortSignal): Promise<Row> {
  const query = String(args.query ?? '').trim();
  if (!query) return { error: 'empty query' };
  if (!ctx.openaiKey) return { error: 'search unavailable' };
  const kinds: SearchKind[] = SEARCH_KINDS.includes(args.kind as SearchKind) ? [args.kind as SearchKind] : [...SEARCH_KINDS];
  const vector = await embedQuery(query, ctx.openaiKey, signal);
  const perKind = await Promise.all(kinds.map((k) => searchKind(ctx, k, vector, PER_KIND_LIMIT, signal)));
  const hits = rankHits(perKind.flat(), kinds.length === 1 ? PER_KIND_LIMIT : ALL_KINDS_LIMIT);
  if (hits.length) return { results: hits };
  // Niente sopra soglia. Se la query non era in inglese, la causa piu' probabile
  // e' quella: il catalogo e' indicizzato in inglese e la somiglianza crolla.
  return {
    results: [],
    note: looksNonEnglish(query)
      ? 'nothing found. The catalogue is indexed in ENGLISH: translate the query to English and call search_content once more before giving up.'
      : 'nothing relevant found: say you will check with the chef, do not invent',
  };
}

export async function getRecipe(ctx: ToolContext, args: { slug?: string }, signal?: AbortSignal): Promise<Row> {
  const slug = String(args.slug ?? '').trim();
  if (!slug) return { error: 'missing slug' };
  let q = ctx.supabase
    .from('recipes')
    .select(`id, slug, name, recipe_key_ingredients(ingredient, ingredient_id, display_order, dietary_adaptations, ui_role)${tr('recipes_translations', 'name', ctx.lang)}`)
    .eq('slug', slug)
    .eq('recipe_type', 'class');
  if (ctx.lang !== 'en') q = q.eq('translations.lang', ctx.lang);
  // `abortSignal` vive sul builder, non su quello che torna da `maybeSingle()`.
  const { data: recipe } = await (signal ? q.abortSignal(signal) : q).maybeSingle();
  if (!recipe) return { error: 'recipe not found' };
  const ings = ((recipe as unknown as Row).recipe_key_ingredients as Array<{ ingredient_id: string | null; dietary_adaptations?: Record<string, { substitute_id?: string | null }> | null }> | null) ?? [];
  const wanted = new Set<string>();
  for (const i of ings) {
    if (i.ingredient_id) wanted.add(i.ingredient_id);
    for (const pid of ctx.profileIds) {
      const sub = i.dietary_adaptations?.[pid]?.substitute_id;
      if (sub) wanted.add(sub);
    }
  }
  let iq = ctx.supabase
    .from('ingredients_library')
    .select(`id, name, description${tr('ingredients_library_translations', 'name, description', ctx.lang)}`)
    .in('id', Array.from(wanted));
  if (ctx.lang !== 'en') iq = iq.eq('translations.lang', ctx.lang);
  const { data: lib } = wanted.size ? await (signal ? iq.abortSignal(signal) : iq) : { data: [] as Row[] };
  const byId = new Map(((lib ?? []) as unknown as Row[]).map((r) => [String(r.id), r]));
  return buildRecipeResult(recipe as unknown as Row, byId, ctx.profileIds, ctx.lang) as unknown as Row;
}

/** Dispatcher: nome → esecutore. Mai un throw verso il modello. */
export async function runTool(ctx: ToolContext, name: string, args: Row, signal?: AbortSignal): Promise<Row> {
  try {
    if (name === 'search_content') return await searchContent(ctx, args as { query?: string; kind?: string }, signal);
    if (name === 'get_recipe') return await getRecipe(ctx, args as { slug?: string }, signal);
    return { error: `unknown tool ${name}` };
  } catch (err) {
    console.warn(`[gemini-proxy-chat] tool ${name} failed:`, err instanceof Error ? err.message : err);
    return { error: 'tool unavailable right now' };
  }
}
