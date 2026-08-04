/**
 * backfill-image-dims Edge Function
 * Riempie width/height/size_kb su media_assets leggendo gli header dei file .webp
 * da Storage. Idempotente, a batch. Uso: POST { "limit": 100 } (ripeti finché remaining=0).
 */
import { createClient } from "jsr:@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, apikey",
};
const json = (b: unknown, s = 200) =>
  new Response(JSON.stringify(b, null, 2), { status: s, headers: { ...corsHeaders, "Content-Type": "application/json" } });

/** Parse WebP dimensions from the first header bytes (VP8 / VP8L / VP8X). */
function parseWebpDims(b: Uint8Array): { width: number; height: number } | null {
  if (b.length < 30) return null;
  // "RIFF" .... "WEBP"
  if (b[0] !== 0x52 || b[1] !== 0x49 || b[2] !== 0x46 || b[3] !== 0x46) return null;
  if (b[8] !== 0x57 || b[9] !== 0x45 || b[10] !== 0x42 || b[11] !== 0x50) return null;
  const fourcc = String.fromCharCode(b[12], b[13], b[14], b[15]);
  if (fourcc === "VP8 ") {
    const w = (b[26] | (b[27] << 8)) & 0x3fff;
    const h = (b[28] | (b[29] << 8)) & 0x3fff;
    return { width: w, height: h };
  }
  if (fourcc === "VP8L") {
    const b0 = b[21], b1 = b[22], b2 = b[23], b3 = b[24];
    const w = 1 + (((b1 & 0x3f) << 8) | b0);
    const h = 1 + (((b3 & 0x0f) << 10) | (b2 << 2) | ((b1 & 0xc0) >> 6));
    return { width: w, height: h };
  }
  if (fourcc === "VP8X") {
    const w = 1 + (b[24] | (b[25] << 8) | (b[26] << 16));
    const h = 1 + (b[27] | (b[28] << 8) | (b[29] << 16));
    return { width: w, height: h };
  }
  return null;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  const body = await req.json().catch(() => ({} as { limit?: number }));
  const limit = Math.min(body.limit ?? 100, 200);

  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    const { data: rows, error } = await supabase
      .from("media_assets")
      .select("asset_id, image_url")
      .or("width.is.null,height.is.null,size_kb.is.null")
      .limit(limit);
    if (error) throw error;

    let updated = 0, failed = 0;
    for (const r of rows ?? []) {
      try {
        if (!r.image_url) { failed++; continue; }
        const patch: Record<string, unknown> = {};

        // peso via HEAD (Content-Length)
        const head = await fetch(r.image_url, { method: "HEAD" });
        const len = parseInt(head.headers.get("content-length") || "0", 10);
        if (len > 0) patch.size_kb = Math.round(len / 1024);

        // dimensioni via Range (primi byte header)
        const ranged = await fetch(r.image_url, { headers: { Range: "bytes=0-39" } });
        const buf = new Uint8Array(await ranged.arrayBuffer());
        const dims = parseWebpDims(buf);
        if (dims && dims.width > 0 && dims.height > 0) { patch.width = dims.width; patch.height = dims.height; }

        if (Object.keys(patch).length > 0) {
          patch.updated_at = new Date().toISOString();
          await supabase.from("media_assets").update(patch).eq("asset_id", r.asset_id);
          updated++;
        } else failed++;
      } catch (_e) { failed++; }
    }

    const { count: remaining } = await supabase
      .from("media_assets").select("asset_id", { count: "exact", head: true })
      .or("width.is.null,height.is.null,size_kb.is.null");

    return json({ ok: true, processed: rows?.length ?? 0, updated, failed, remaining: remaining ?? 0 });
  } catch (e) {
    return json({ ok: false, error: String(e instanceof Error ? e.message : e) }, 500);
  }
});
