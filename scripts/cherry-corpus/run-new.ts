/**
 * Corpus di recall, lato NUOVO: la ricerca semantica come la fara' la edge.
 *
 * Misura DUE varianti e la somiglianza GREZZA, prima di qualunque soglia:
 *   • "nativa": la domanda com'e' scritta dall'ospite (quello che la descrizione
 *     dello strumento chiede oggi al modello);
 *   • "inglese": la stessa domanda resa in inglese (quello che il modello
 *     scriverebbe se glielo chiedessimo).
 * I vettori del catalogo sono SOLO inglesi: la differenza fra le due colonne,
 * sulle domande non latine, e' il dato che decide se cambiare la descrizione
 * dello strumento e se la soglia di scarto e' tarata sull'inglese.
 *
 * Uso:  deno run --no-check --node-modules-dir=none --allow-net --allow-read --allow-env scripts/cherry-corpus/run-new.ts
 * Legge SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY e OPENAI_API_KEY da .env (sola lettura sul DB).
 */
import { createClient } from 'jsr:@supabase/supabase-js@2';
import { MIN_SIMILARITY, PER_KIND_LIMIT, KIND_META, type SearchKind } from '../../supabase/functions/gemini-proxy-chat/toolsPure.ts';

const env = Object.fromEntries(Deno.readTextFileSync('.env').split('\n').filter((l) => l.includes('=') && !l.startsWith('#')).map((l) => [l.slice(0, l.indexOf('=')).trim(), l.slice(l.indexOf('=') + 1).trim()]));
const OPENAI = Deno.env.get('OPENAI_API_KEY') ?? env.OPENAI_API_KEY;
if (!OPENAI) { console.error('OPENAI_API_KEY mancante.'); Deno.exit(1); }
const sb = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } });

type Entry = { id: number; lang: string; kind: SearchKind; q: string; qen: string; expect: string[] };
const corpus = JSON.parse(Deno.readTextFileSync('scripts/cherry-corpus/corpus.json')) as Entry[];
const LATIN = new Set(['en', 'es', 'it', 'de', 'fr', 'pt', 'ca', 'nl']);

async function embed(text: string): Promise<number[]> {
  const res = await fetch('https://api.openai.com/v1/embeddings', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${OPENAI}` },
    body: JSON.stringify({ model: 'text-embedding-3-small', input: text.slice(0, 1000) }),
  });
  if (!res.ok) throw new Error(`OpenAI ${res.status}: ${await res.text()}`);
  return (await res.json()).data[0].embedding as number[];
}

/** id -> slug della tabella, per leggere i risultati grezzi di match_semantic. */
const slugCache = new Map<string, Map<string, string>>();
async function slugsOf(table: string): Promise<Map<string, string>> {
  if (!slugCache.has(table)) {
    const { data, error } = await sb.from(table).select('id, slug');
    if (error) throw new Error(`${table}: ${error.message}`);
    slugCache.set(table, new Map((data as Array<{ id: string; slug: string }>).map((r) => [String(r.id), r.slug])));
  }
  return slugCache.get(table)!;
}

interface Measure { rank: number | null; sim: number | null; topSlug: string; topSim: number }
async function measure(e: Entry, text: string): Promise<Measure> {
  const table = KIND_META[e.kind].table;
  const vector = await embed(text);
  const { data, error } = await sb.rpc('match_semantic', { query_embedding: `[${vector.join(',')}]`, match_table: table, match_count: 20 });
  if (error) throw new Error(`match_semantic ${table}: ${error.message}`);
  const slugs = await slugsOf(table);
  const rows = (data as Array<{ id: string; similarity: number }>).map((m) => ({ slug: slugs.get(m.id) ?? m.id, sim: m.similarity }));
  const i = rows.findIndex((r) => e.expect.includes(r.slug));
  return { rank: i < 0 ? null : i + 1, sim: i < 0 ? null : rows[i].sim, topSlug: rows[0]?.slug ?? '-', topSim: rows[0]?.sim ?? 0 };
}

const f2 = (n: number | null) => (n === null ? ' -- ' : n.toFixed(2));
const rows: string[] = [];
const tally = { nat: { hit: 0, hitLatin: 0, hitOther: 0, dropped: 0 }, en: { hit: 0, hitLatin: 0, hitOther: 0, dropped: 0 } };
let latinN = 0, otherN = 0;
for (const e of corpus) {
  const nat = await measure(e, e.q);
  const en = await measure(e, e.qen);
  const isLatin = LATIN.has(e.lang);
  if (isLatin) latinN++; else otherN++;
  for (const [k, m] of [['nat', nat], ['en', en]] as const) {
    const inTop = m.rank !== null && m.rank <= PER_KIND_LIMIT;
    const passes = inTop && (m.sim ?? 0) >= MIN_SIMILARITY;
    if (passes) { tally[k].hit++; if (isLatin) tally[k].hitLatin++; else tally[k].hitOther++; }
    else if (inTop) tally[k].dropped++; // giusto in cima, ma sotto la soglia di scarto
  }
  rows.push(
    `#${String(e.id).padStart(2)} ${e.lang} ${e.kind.padEnd(11)} | nativa r=${String(nat.rank ?? '-').padStart(2)} s=${f2(nat.sim)} top=${f2(nat.topSim)} | inglese r=${String(en.rank ?? '-').padStart(2)} s=${f2(en.sim)} | ${e.q.slice(0, 42)}`,
  );
}
console.log(rows.join('\n'));
const pct = (n: number, d: number) => `${n}/${d} (${Math.round((100 * n) / d)}%)`;
console.log(`\nsoglia di scarto: ${MIN_SIMILARITY}, si guardano i primi ${PER_KIND_LIMIT} per famiglia`);
for (const k of ['nat', 'en'] as const) {
  const t = tally[k];
  console.log(`${k === 'nat' ? 'domanda NATIVA ' : 'domanda INGLESE'}: ${pct(t.hit, corpus.length)}  ·  latine ${pct(t.hitLatin, latinN)}  ·  non latine ${pct(t.hitOther, otherN)}  ·  giuste ma scartate dalla soglia: ${t.dropped}`);
}
