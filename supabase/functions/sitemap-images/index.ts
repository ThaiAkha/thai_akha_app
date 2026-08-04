/**
 * sitemap-images Edge Function — Google Image Sitemap
 * Serves /sitemap-images.xml: ogni pagina pubblicata con le sue immagini in-use.
 * Sorgente unica: tabella `media_usage` (asset↔pagina↔ruolo) → join media_assets.image_url.
 *
 * Google legge solo <image:loc> (caption/title/license nel sitemap sono deprecati;
 * quei segnali vivono nell'ImageObject json_ld iniettato in pagina).
 */
import { createClient } from "jsr:@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

const esc = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

interface UsageRow {
  page_url: string;
  media: { image_url: string | null } | null;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Paginazione difensiva (PostgREST default 1000; qui siamo ~262 ma a prova di crescita)
    const rows: UsageRow[] = [];
    let from = 0;
    const PAGE = 1000;
    while (true) {
      const { data, error } = await supabase
        .from("media_usage")
        .select("page_url, media:media_assets!asset_id(image_url)")
        .order("page_url", { ascending: true })
        .range(from, from + PAGE - 1);
      if (error) throw error;
      const batch = (data ?? []) as unknown as UsageRow[];
      rows.push(...batch);
      if (batch.length < PAGE) break;
      from += PAGE;
    }

    // Raggruppa per pagina; dedup immagini
    const byPage = new Map<string, Set<string>>();
    for (const r of rows) {
      const img = r.media?.image_url;
      if (!r.page_url || !img) continue;
      if (!byPage.has(r.page_url)) byPage.set(r.page_url, new Set());
      byPage.get(r.page_url)!.add(img);
    }

    const body = [...byPage.entries()]
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([page, imgs]) =>
        `  <url>\n    <loc>${esc(page)}</loc>\n` +
        [...imgs].map((i) => `    <image:image><image:loc>${esc(i)}</image:loc></image:image>`).join("\n") +
        `\n  </url>`
      )
      .join("\n");

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
${body}
</urlset>`;

    return new Response(xml, {
      headers: { ...corsHeaders, "Content-Type": "application/xml; charset=utf-8", "Cache-Control": "public, max-age=3600" },
    });
  } catch (error) {
    console.error("[SITEMAP-IMAGES] Error:", error);
    return new Response(
      `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"></urlset>`,
      { headers: { ...corsHeaders, "Content-Type": "application/xml; charset=utf-8" } },
    );
  }
});
