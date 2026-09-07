/**
 * Corpus di recall, lato NUOVO: search_content della edge (tools.ts) contro il DB
 * vivo, col service role, come fara' la edge. Serve la chiave OpenAI (secret della
 * edge, non in nessun file): si passa al momento nell'ambiente.
 *
 * Uso:  OPENAI_API_KEY=... deno run --no-check --node-modules-dir=none --allow-net --allow-read --allow-env scripts/cherry-corpus/run-new.ts
 * Prima della migration 20260907200000 il risultato misura la funzione SBAGLIATA (bozze e probes=1).
 */
import { createClient } from 'jsr:@supabase/supabase-js@2';
import { searchContent } from '../../supabase/functions/gemini-proxy-chat/tools.ts';
const env = Object.fromEntries(Deno.readTextFileSync('.env').split('\n').filter((l) => l.includes('=') && !l.startsWith('#')).map((l) => [l.slice(0, l.indexOf('=')).trim(), l.slice(l.indexOf('=') + 1).trim()]));
const openaiKey = Deno.env.get('OPENAI_API_KEY');
if (!openaiKey) { console.error('OPENAI_API_KEY mancante: passala nell ambiente per questa sola esecuzione.'); Deno.exit(1); }
const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } });
const corpus = JSON.parse(Deno.readTextFileSync('scripts/cherry-corpus/corpus.json')) as Array<{ id: number; lang: string; kind: string; q: string; expect: string[] }>;
let hitsKind = 0, hitsAll = 0; const out: string[] = [];
for (const c of corpus) {
  const ctx = { supabase, lang: c.lang, profileIds: [], openaiKey } as any;
  const byKind = await searchContent(ctx, { query: c.q, kind: c.kind }) as { results?: Array<{ slug: string; similarity: number }> };
  const all = await searchContent(ctx, { query: c.q, kind: 'all' }) as { results?: Array<{ slug: string; similarity: number }> };
  const rankIn = (r?: Array<{ slug: string }>) => { const i = (r ?? []).findIndex((x) => c.expect.includes(x.slug)); return i < 0 ? null : i + 1; };
  const rk = rankIn(byKind.results), ra = rankIn(all.results);
  if (rk) hitsKind++; if (ra) hitsAll++;
  const top = byKind.results?.[0];
  out.push(`${rk ? 'OK ' : '-- '} #${String(c.id).padStart(2)} ${c.lang} ${c.kind.padEnd(11)} kind:${rk ?? '-'} all:${ra ?? '-'}  top=${top?.slug ?? '(nessuno)'} ${top ? top.similarity.toFixed(2) : ''} | ${c.q}`);
}
console.log(out.join('\n'));
console.log(`\nNUOVO: per famiglia ${hitsKind}/${corpus.length}, con "all" ${hitsAll}/${corpus.length}`);
