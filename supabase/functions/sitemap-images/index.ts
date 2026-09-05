import { createClient } from "jsr:@supabase/supabase-js@2";

/**
 * sitemap-images: un <image:loc> per ogni immagine di ogni pagina indicizzabile.
 *
 * Fonte: `media_usage` (rigenerata da `public.refresh_media_usage()`, cron notturno
 * `media-usage-refresh-nightly`) join `media_assets.image_url`. Google legge SOLO
 * <image:loc>: caption/title/license nel sitemap sono deprecati dal 2022 e vivono
 * nell'ImageObject del json_ld di pagina.
 *
 * URL DELLE IMMAGINI (2026-09-04, gate #184). Lo storage Supabase risponde
 * `X-Robots-Tag: none` su OGNI oggetto pubblico, e per Google `none` = noindex:
 * una sitemap che punta a `…supabase.co/storage/v1/object/public/…` dichiara 469
 * foto che Google ha l'ordine di ignorare. Qui si emette quindi l'URL del proxy
 * `https://www.thaiakha.com/media/<bucket>/<path>`, servito dal Worker Cloudflare
 * (og-meta-tags, ramo /media/) che rifà la fetch sullo storage, TOGLIE l'header e
 * mette cache immutable. Finché il Worker non è patchato quegli URL non risolvono:
 * ordine obbligato = patch Worker → deploy di questa function → submit in GSC.
 * `media_assets.image_url` NON cambia: la riscrittura in massa (590 righe, UNIQUE)
 * è un secondo passo, con backup, quando anche og:image passerà dal proxy.
 *
 * Stessa disciplina di `sitemap/index.ts`: ogni query passa da `must()` (una
 * fallita → 500, MAI un urlset vuoto con 200), timeout per query, paginazione con
 * tiebreaker deterministico, header X-Sitemap-* per il `curl -I`.
 */

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const STORAGE_PUBLIC_PREFIX = `${SUPABASE_URL}/storage/v1/object/public/`;
const MEDIA_PROXY_PREFIX = "https://www.thaiakha.com/media/";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

type UsageRow = { page_url: string | null; media: { image_url: string | null } | null };
type QueryResult<T> = { data: T[] | null; error: { message: string } | null };

/** Ogni query PostgREST ha al massimo questo tempo: una bloccata non tiene la funzione fino al wall clock. */
const QUERY_TIMEOUT_MS = 8000;

async function must<T>(p: PromiseLike<QueryResult<T>>, what: string): Promise<T[]> {
  const { data, error } = await p;
  if (error) throw new Error(`[SITEMAP-IMAGES] ${what}: ${error.message}`);
  return data ?? [];
}

const esc = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&apos;");

/** storage pubblico → proxy su dominio proprio; qualunque altro host passa invariato. */
const toPublicMedia = (url: string) =>
  url.startsWith(STORAGE_PUBLIC_PREFIX) ? MEDIA_PROXY_PREFIX + url.slice(STORAGE_PUBLIC_PREFIX.length) : url;

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    const tDb = performance.now();

    // Paginazione difensiva (PostgREST max_rows 1000; oggi ~529 righe). L'ordine ha
    // un tiebreaker su asset_id: senza, due pagine con la stessa page_url possono
    // scambiarsi di posto fra una pagina e l'altra e una riga saltare o doppiarsi.
    const rows: UsageRow[] = [];
    const PAGE = 1000;
    for (let from = 0; ; from += PAGE) {
      const batch = await must<UsageRow>(
        supabase
          .from("media_usage")
          .select("page_url, media:media_assets!asset_id(image_url)")
          .order("page_url", { ascending: true })
          .order("asset_id", { ascending: true })
          .range(from, from + PAGE - 1)
          .abortSignal(AbortSignal.timeout(QUERY_TIMEOUT_MS)) as unknown as PromiseLike<QueryResult<UsageRow>>,
        `media_usage range ${from}`,
      );
      rows.push(...batch);
      if (batch.length < PAGE) break;
    }
    const dbMs = Math.round(performance.now() - tDb);
    const tBuild = performance.now();

    // Raggruppa per pagina; dedup immagini
    const byPage = new Map<string, Set<string>>();
    for (const r of rows) {
      const img = r.media?.image_url;
      if (!r.page_url || !img) continue;
      if (!byPage.has(r.page_url)) byPage.set(r.page_url, new Set());
      byPage.get(r.page_url)!.add(toPublicMedia(img));
    }

    let images = 0;
    const body = [...byPage.entries()]
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([page, imgs]) => {
        images += imgs.size;
        return `  <url>\n    <loc>${esc(page)}</loc>\n` +
          [...imgs].map((i) => `    <image:image><image:loc>${esc(i)}</image:loc></image:image>`).join("\n") +
          `\n  </url>`;
      })
      .join("\n");

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
${body}
</urlset>`;
    const buildMs = Math.round(performance.now() - tBuild);

    return new Response(xml, {
      headers: {
        ...corsHeaders,
        "Content-Type": "application/xml; charset=utf-8",
        "Cache-Control": "public, max-age=3600",
        "X-Sitemap-Pages": String(byPage.size),
        "X-Sitemap-Images": String(images),
        "X-Sitemap-Bytes": String(new TextEncoder().encode(xml).byteLength),
        "Server-Timing": `db;dur=${dbMs}, build;dur=${buildMs}`,
      },
    });
  } catch (error) {
    // 500 e non un urlset vuoto con 200: Google prenderebbe "zero immagini" per
    // buono e le conterebbe come rimosse; un 500 lo fa ritentare tenendo l'ultima
    // copia buona. Mai in cache (il Worker lo mappa a 503 + Retry-After).
    console.error("[SITEMAP-IMAGES] Error:", error);
    return new Response(
      `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"></urlset>`,
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/xml; charset=utf-8", "Cache-Control": "no-store", "Retry-After": "300" },
      },
    );
  }
});
