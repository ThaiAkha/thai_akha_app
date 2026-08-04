import { createClient } from "jsr:@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
// ⚠️ Must use www to match canonical URLs in the DB and avoid duplicate content penalty
const SITE_URL = "https://www.thaiakha.com";

// Pages that must never appear in the sitemap (private/app-only routes)
const SITEMAP_BLACKLIST = new Set([
  "user", "user-dashboard", "user-menu", "user-quiz", "user-passport",
  "auth", "menu", "home",
]);

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // ── Static pages from site_metadata ──────────────────────────────────────
    const { data: staticPages } = await supabase
      .from("site_metadata")
      .select("page_slug, created_at")
      .eq("show_in_menu", true)
      .order("menu_order", { ascending: true });

    // ── Recipes ───────────────────────────────────────────────────────────────
    const { data: recipes } = await supabase
      .from("recipes")
      .select("slug, updated_at")
      .eq("is_published", true);

    // ── Culture sections ──────────────────────────────────────────────────────
    const { data: cultureSections } = await supabase
      .from("culture_sections")
      .select("slug, updated_at")
      .eq("is_published", true);

    // ── News articles ─────────────────────────────────────────────────────────
    const { data: news } = await supabase
      .from("akha_news")
      .select("slug, updated_at")
      .eq("is_published", true);

    // ── Ingredients (single pages) ────────────────────────────────────────────
    const { data: ingredients } = await supabase
      .from("ingredients_library")
      .select("slug, updated_at")
      .eq("is_published", true);

    // ── Ingredient category guides ────────────────────────────────────────────
    const { data: ingredientCategories } = await supabase
      .from("content_categories")
      .select("slug, updated_at")
      .eq("domain", "ingredient")
      .eq("is_active", true);

    const urls: string[] = [];

    // Homepage — highest priority
    urls.push(buildUrl(SITE_URL, "/", "1.0", "daily", new Date().toISOString()));

    // Static public pages (excluding private/app routes)
    for (const page of staticPages || []) {
      const slug = page.page_slug;
      if (!slug || SITEMAP_BLACKLIST.has(slug)) continue;
      urls.push(buildUrl(SITE_URL, `/${slug}`, "0.8", "monthly", page.created_at));
    }

    // Hub pages (content index pages)
    urls.push(buildUrl(SITE_URL, "/akha-culture-highland-heritage", "0.9", "weekly", new Date().toISOString()));
    urls.push(buildUrl(SITE_URL, "/authentic-thai-akha-recipes", "0.9", "weekly", new Date().toISOString()));
    urls.push(buildUrl(SITE_URL, "/thai-cooking-tips-news", "0.9", "weekly", new Date().toISOString()));
    urls.push(buildUrl(SITE_URL, "/thai-cooking-ingredients", "0.9", "weekly", new Date().toISOString()));

    // Recipe detail pages
    for (const recipe of recipes || []) {
      if (!recipe.slug) continue;
      urls.push(buildUrl(SITE_URL, `/authentic-thai-akha-recipes/${recipe.slug}`, "0.9", "weekly", recipe.updated_at));
    }

    // Culture/history detail pages
    for (const section of cultureSections || []) {
      if (!section.slug) continue;
      urls.push(buildUrl(SITE_URL, `/akha-culture-highland-heritage/${section.slug}`, "0.8", "monthly", section.updated_at));
    }

    // News/blog detail pages
    for (const article of news || []) {
      if (!article.slug) continue;
      urls.push(buildUrl(SITE_URL, `/thai-cooking-tips-news/${article.slug}`, "0.7", "weekly", article.updated_at));
    }

    // Ingredient category guides
    for (const cat of ingredientCategories || []) {
      if (!cat.slug) continue;
      urls.push(buildUrl(SITE_URL, `/thai-cooking-ingredients/${cat.slug}`, "0.8", "monthly", cat.updated_at));
    }

    // Ingredient detail pages
    for (const ingredient of ingredients || []) {
      if (!ingredient.slug) continue;
      urls.push(buildUrl(SITE_URL, `/thai-cooking-ingredients/${ingredient.slug}`, "0.7", "monthly", ingredient.updated_at));
    }

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.join("\n")}
</urlset>`;

    return new Response(xml, {
      headers: {
        ...corsHeaders,
        "Content-Type": "application/xml; charset=utf-8",
        "Cache-Control": "public, max-age=3600",
      },
    });
  } catch (error) {
    console.error("[SITEMAP] Error:", error);
    return new Response("<?xml version=\"1.0\"?><urlset xmlns=\"http://www.sitemaps.org/schemas/sitemap/0.9\"></urlset>", {
      headers: { "Content-Type": "application/xml" },
    });
  }
});

function buildUrl(
  siteUrl: string,
  path: string,
  priority: string,
  changefreq: string,
  lastmod?: string | null
): string {
  const loc = `${siteUrl}${path}`.replace(/&/g, "&amp;");
  const lastmodTag = lastmod
    ? `\n    <lastmod>${lastmod.slice(0, 10)}</lastmod>`
    : "";
  return `  <url>
    <loc>${loc}</loc>${lastmodTag}
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>`;
}
