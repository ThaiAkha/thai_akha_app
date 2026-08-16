/**
 * llms-txt Edge Function
 * Serves /llms.txt and /llms-full.txt per lo standard AI-readability (llmstxt.org)
 * ChatGPT, Perplexity, Claude, Gemini e altri leggono questo file prima di indicizzare.
 *
 * DESIGN: completamente data-driven, in SYNC con la sitemap.
 * - Le "Key Pages" arrivano da site_metadata (show_in_menu=true, seo_robots index*),
 *   ordinate per menu_order → mai obsolete, niente liste hardcoded.
 * - Le collection (cultura, ricette, news) dai rispettivi published rows.
 * - Le descrizioni usano summary_ai (AI-asset) con fallback seo_description.
 */
import { createClient } from "jsr:@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const SITE_URL = "https://www.thaiakha.com";

// Hub pages: hanno una sezione collection dedicata → esclusi dalle Key Pages
const HUB_SLUGS = new Set([
  "akha-culture-highland-heritage",
  "authentic-thai-akha-recipes",
  "thai-cooking-tips-news",
]);

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

interface PageRow {
  page_slug: string;
  menu_label: string | null;
  summary_ai: string | null;
  seo_description: string | null;
  seo_robots: string | null;
}

const desc = (r: { summary_ai?: string | null; seo_description?: string | null }) =>
  (r.summary_ai || r.seo_description || "").trim();

const pathFor = (slug: string) => (slug === "home" ? "/" : `/${slug}`);

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  const url = new URL(req.url);
  const isFull = url.searchParams.get("full") === "1" || url.pathname.endsWith("/llms-full.txt");

  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // ── Indexed public pages (same source as sitemap, minus noindex) ───────────
    const { data: pagesRaw } = await supabase
      .from("site_metadata")
      .select("page_slug, menu_label, summary_ai, seo_description, seo_robots")
      .eq("show_in_menu", true)
      .ilike("seo_robots", "index%")
      .order("menu_order", { ascending: true });

    const pages = (pagesRaw || []) as PageRow[];
    const keyPages = pages.filter(p => !HUB_SLUGS.has(p.page_slug));

    // ── Content collections ────────────────────────────────────────────────────
    const [cultureRes, recipesRes, newsRes] = await Promise.all([
      supabase.from("culture_sections")
        .select("slug, title, subtitle, seo_description, summary_ai")
        .eq("is_published", true)
        .order("display_order", { ascending: true }),
      supabase.from("recipes")
        .select("slug, name, description, seo_description, summary_ai")
        .eq("is_published", true)
        .order("name", { ascending: true }),
      supabase.from("akha_news")
        .select("slug, title, excerpt, seo_description, summary_ai")
        .eq("is_published", true)
        .order("published_at", { ascending: false }),
    ]);

    const culture = cultureRes.data || [];
    const recipes = recipesRes.data || [];
    const news = newsRes.data || [];

    // ── Build llms.txt ─────────────────────────────────────────────────────────
    const keyPagesBlock = keyPages.map(p => {
      const label = p.menu_label || p.page_slug;
      const d = desc(p);
      return `- [${label}](${SITE_URL}${pathFor(p.page_slug)})${d ? `: ${d}` : ""}`;
    }).join("\n");

    const llmsCore = `# Thai Akha Kitchen

> Authentic Thai & Akha cooking school in Chiang Mai, Thailand — led by Chef Niti
> Muelaeku, a Highland Akha chef preserving ancestral wisdom. Morning & evening
> classes, 11-dish menus, market tour, individual cooking stations, vegan /
> vegetarian / allergy-safe options, free hotel pickup.

## Key Pages

${keyPagesBlock}

## Akha Culture & History (${culture.length} articles)

${culture.map(s => `- [${s.title}](${SITE_URL}/akha-culture-highland-heritage/${s.slug})${s.subtitle ? `: ${s.subtitle}` : ""}`).join("\n")}

## Authentic Recipes (${recipes.length} recipes)

${recipes.map(r => `- [${r.name}](${SITE_URL}/authentic-thai-akha-recipes/${r.slug})`).join("\n")}

## Cooking Tips & News (${news.length} articles)

${news.map(a => `- [${a.title}](${SITE_URL}/thai-cooking-tips-news/${a.slug})`).join("\n")}

## Optional

- [Sitemap XML](${SITE_URL}/sitemap.xml)
- [Privacy Policy](${SITE_URL}/privacy-policy)
- [Booking Terms](${SITE_URL}/booking-terms-conditions)
`;

    if (!isFull) {
      return new Response(llmsCore, {
        headers: { ...corsHeaders, "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "public, max-age=3600" },
      });
    }

    // ── llms-full.txt: full descriptions for deep AI ingestion ─────────────────
    const llmsFull = `${llmsCore}

---

## Detailed Pages

${keyPages.map(p => `### ${p.menu_label || p.page_slug}
URL: ${SITE_URL}${pathFor(p.page_slug)}
${desc(p)}
`).join("\n")}

## Detailed Culture Articles

${culture.map(s => `### ${s.title}
URL: ${SITE_URL}/akha-culture-highland-heritage/${s.slug}
${desc(s) || s.subtitle || ""}
`).join("\n")}

## Detailed Recipes

${recipes.map(r => `### ${r.name}
URL: ${SITE_URL}/authentic-thai-akha-recipes/${r.slug}
${desc(r) || r.description || ""}
`).join("\n")}

## Detailed News & Tips

${news.map(a => `### ${a.title}
URL: ${SITE_URL}/thai-cooking-tips-news/${a.slug}
${desc(a) || a.excerpt || ""}
`).join("\n")}
`;

    return new Response(llmsFull, {
      headers: { ...corsHeaders, "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "public, max-age=3600" },
    });
  } catch (error) {
    console.error("[LLMS-TXT] Error:", error);
    return new Response("# Thai Akha Kitchen\n> https://www.thaiakha.com\n", {
      headers: { ...corsHeaders, "Content-Type": "text/plain; charset=utf-8" },
    });
  }
});
