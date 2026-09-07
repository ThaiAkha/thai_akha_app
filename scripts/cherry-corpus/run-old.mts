/**
 * Corpus di recall, lato VECCHIO: i quattro riconoscitori a parole chiave di Cherry
 * (findRecipeInText, findIngredient, findCultureSection, findNewsArticle) sui dati
 * vivi, con i nomi nella lingua della domanda (sidecar), come fa buildSystemInstruction
 * con TOOLS_ENABLED = false. Sola lettura, chiave anon.
 *
 * Uso:  node --import tsx scripts/cherry-corpus/run-old.mts
 */
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
const env = Object.fromEntries(readFileSync(resolve('packages/front/.env.production'), 'utf8').split('\n').filter((l) => l.includes('=') && !l.startsWith('#')).map((l) => [l.slice(0, l.indexOf('=')).trim(), l.slice(l.indexOf('=') + 1).trim()]));
process.env.VITE_SUPABASE_URL = env.VITE_SUPABASE_URL;
process.env.VITE_SUPABASE_ANON_KEY = env.VITE_SUPABASE_ANON_KEY;

const { createClient } = await import('@supabase/supabase-js');
const { findRecipeInText } = await import('../../packages/shared/src/lib/cherryRecipeContext');
const { findIngredient } = await import('../../packages/shared/src/lib/cherryIngredientContext');
const { findCultureSection } = await import('../../packages/shared/src/lib/cherryCultureContext');
const { findNewsArticle } = await import('../../packages/shared/src/lib/cherryNewsContext');

type Row = Record<string, unknown>;
const sb = createClient(env.VITE_SUPABASE_URL, env.VITE_SUPABASE_ANON_KEY);
const tr = (t: string, f: string, lang: string) => (lang === 'en' ? '' : `, translations:${t}(lang, ${f})`);
async function rows(table: string, cols: string, lang: string, filter: (q: any) => any): Promise<Row[]> {
  let q = sb.from(table).select(cols + tr(`${table}_translations`, cols.includes('name') ? 'name' : 'title', lang));
  q = filter(q);
  if (lang !== 'en') q = q.eq('translations.lang', lang);
  const { data, error } = await q;
  if (error) throw new Error(`${table}: ${error.message}`);
  // merge come mergeSidecarRows: il campo tradotto sostituisce, l'inglese resta in *_key
  return (data as Row[]).map((r) => {
    const t = Array.isArray(r.translations) ? (r.translations[0] as Row | undefined) : undefined;
    const key = 'name' in r ? 'name' : 'title';
    return { ...r, [`${key}_key`]: r[key], [key]: (t?.[key] as string) || r[key] };
  });
}
const corpus = JSON.parse(readFileSync(resolve('scripts/cherry-corpus/corpus.json'), 'utf8')) as Array<{ id: number; lang: string; kind: string; q: string; expect: string[] }>;
const cache = new Map<string, Row[]>();
const get = async (kind: string, lang: string) => {
  const k = `${kind}:${lang}`;
  if (!cache.has(k)) {
    cache.set(k, kind === 'recipes' ? await rows('recipes', 'id, slug, name', lang, (q) => q.eq('recipe_type', 'class'))
      : kind === 'ingredients' ? await rows('ingredients_library', 'id, slug, name', lang, (q) => q.eq('is_published', true))
      : kind === 'culture' ? await rows('culture_sections', 'id, slug, title', lang, (q) => q.eq('is_published', true))
      : await rows('akha_news', 'id, slug, title', lang, (q) => q.eq('is_published', true)));
  }
  return cache.get(k)!;
};
let hits = 0; const out: string[] = [];
for (const c of corpus) {
  const data = await get(c.kind, c.lang);
  const m = c.kind === 'recipes' ? findRecipeInText(c.q, data) : c.kind === 'ingredients' ? findIngredient(c.q, data) : c.kind === 'culture' ? findCultureSection(c.q, data) : findNewsArticle(c.q, data);
  const got = m ? String(m.slug) : null;
  const hit = !!got && c.expect.includes(got);
  if (hit) hits++;
  out.push(`${hit ? 'OK ' : '-- '} #${String(c.id).padStart(2)} ${c.lang} ${c.kind.padEnd(11)} ${got ?? '(nessuno)'}  | ${c.q}`);
}
console.log(out.join('\n'));
console.log(`\nVECCHIO: ${hits}/${corpus.length} (${Math.round((100 * hits) / corpus.length)}%)`);
