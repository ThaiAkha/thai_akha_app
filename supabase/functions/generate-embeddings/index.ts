/**
 * generate-embeddings Edge Function
 * Genera gli embedding OpenAI (text-embedding-3-small, 1536-dim) e li scrive
 * in `semantic_vector` per le tabelle di contenuto.
 *
 * USO:
 *   - Verifica chiave (non scrive nulla):   POST { "mode": "check" }
 *   - Backfill di una tabella:              POST { "table": "recipes", "batchSize": 50 }
 *   - Backfill tutte le prioritarie:        POST { "table": "all" }
 *
 * Richiede secret: OPENAI_API_KEY (+ SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY).
 */
import { createClient } from "jsr:@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");
const EMBED_MODEL = "text-embedding-3-small"; // 1536 dim — combacia con vector(1536)

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, apikey",
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body, null, 2), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

const clean = (v: unknown) => (typeof v === "string" ? v.trim() : "");

// ── Config per tabella: come comporre il testo da embeddare ──────────────────
type TableCfg = { select: string; text: (r: Record<string, unknown>) => string };

const TABLES: Record<string, TableCfg> = {
  site_metadata: {
    select: "id, seo_title, seo_description, summary_ai",
    text: (r) => [r.seo_title, r.seo_description, r.summary_ai].map(clean).filter(Boolean).join(" — "),
  },
  recipes: {
    select: "id, name, description, seo_description",
    text: (r) => [r.name, r.description, r.seo_description].map(clean).filter(Boolean).join(" — "),
  },
  culture_sections: {
    select: "id, title, subtitle, seo_description, summary_ai",
    text: (r) => [r.title, r.subtitle, r.seo_description, r.summary_ai].map(clean).filter(Boolean).join(" — "),
  },
  akha_news: {
    select: "id, title, excerpt, seo_description",
    text: (r) => [r.title, r.excerpt, r.seo_description].map(clean).filter(Boolean).join(" — "),
  },
  ingredients_library: {
    select: "id, name_en, name_th, description, category, seo_description, summary_ai",
    text: (r) => [r.name_en, r.name_th, r.category, r.description, r.seo_description, r.summary_ai].map(clean).filter(Boolean).join(" — "),
  },
  content_categories: {
    select: "id, title, subtitle, description, summary_ai",
    text: (r) => [r.title, r.subtitle, r.description, r.summary_ai].map(clean).filter(Boolean).join(" — "),
  },
  cooking_classes: {
    select: "id, title, tagline, description, summary_ai",
    text: (r) => [r.title, r.tagline, r.description, r.summary_ai].map(clean).filter(Boolean).join(" — "),
  },
};

async function embed(inputs: string[]): Promise<number[][]> {
  const res = await fetch("https://api.openai.com/v1/embeddings", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${OPENAI_API_KEY}` },
    body: JSON.stringify({ model: EMBED_MODEL, input: inputs }),
  });
  if (!res.ok) throw new Error(`OpenAI ${res.status}: ${await res.text()}`);
  const data = await res.json();
  return data.data.map((d: { embedding: number[] }) => d.embedding);
}

const toVec = (arr: number[]) => `[${arr.join(",")}]`;

async function processTable(supabase: ReturnType<typeof createClient>, table: string, batchSize: number) {
  const cfg = TABLES[table];
  if (!cfg) throw new Error(`Unknown table: ${table}`);

  const { data: rows, error } = await supabase
    .from(table)
    .select(cfg.select)
    .is("semantic_vector", null)
    .limit(batchSize);
  if (error) throw new Error(`select ${table}: ${error.message}`);
  if (!rows || rows.length === 0) return { table, processed: 0, remaining: 0 };

  const texts = rows.map((r) => cfg.text(r as Record<string, unknown>) || "Thai Akha Kitchen");
  const vectors = await embed(texts);

  let processed = 0;
  for (let i = 0; i < rows.length; i++) {
    const id = (rows[i] as { id: string | number }).id;
    const { error: upErr } = await supabase.from(table).update({ semantic_vector: toVec(vectors[i]) }).eq("id", id);
    if (upErr) throw new Error(`update ${table} ${id}: ${upErr.message}`);
    processed++;
  }

  const { count: remaining } = await supabase
    .from(table).select("id", { count: "exact", head: true }).is("semantic_vector", null);
  return { table, processed, remaining: remaining ?? 0 };
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  if (!OPENAI_API_KEY) return json({ ok: false, error: "OPENAI_API_KEY not set in Edge secrets" }, 500);

  let body: { mode?: string; table?: string; batchSize?: number } = {};
  try { body = await req.json(); } catch { /* default */ }

  try {
    // ── Verifica chiave (nessuna scrittura) ──────────────────────────────────
    if (body.mode === "check") {
      const v = await embed(["Thai Akha Kitchen connectivity test"]);
      return json({ ok: true, keyPresent: true, model: EMBED_MODEL, dims: v[0].length });
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    const batchSize = Math.min(body.batchSize ?? 50, 100);
    const tables = body.table === "all" || !body.table ? Object.keys(TABLES) : [body.table];

    const results = [];
    for (const t of tables) results.push(await processTable(supabase, t, batchSize));
    return json({ ok: true, model: EMBED_MODEL, results });
  } catch (e) {
    return json({ ok: false, error: String(e instanceof Error ? e.message : e) }, 500);
  }
});
