import { createClient } from "jsr:@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
// ⚠️ Must use www to match canonical URLs in the DB and avoid duplicate content penalty
const SITE_URL = "https://www.thaiakha.com";

/**
 * 🌍 PERIMETRO LINGUE — copia Deno di packages/shared/src/lib/i18n.ts.
 * Le Edge Functions girano su Deno e non possono importare da @thaiakha/shared:
 * questa lista va tenuta allineata a mano, come già si fa per og-meta-tags.
 */
const DEFAULT_LANG = "en";
const SUPPORTED_LANGS = [
  "en", "es", "fr", "de", "pt", "it", "ca", "nl", "th", "zh", "ko", "ja",
] as const;

/**
 * 🔴 STESSO INTERRUTTORE del front (VITE_I18N_ROUTES lato app).
 * Spento = sitemap monolingua inglese, identica a quella di oggi. Acceso =
 * dodici lingue con hreflang. Non deve MAI accendersi da solo: una sitemap che
 * annuncia URL a prefisso mentre le route sono spente manderebbe Google su
 * pagine che rispondono 302.
 */
const I18N_ENABLED = Deno.env.get("I18N_ROUTES_ENABLED") === "true";
const ACTIVE_LANGS: readonly string[] = I18N_ENABLED ? SUPPORTED_LANGS : [DEFAULT_LANG];

// Rete di sicurezza sulle route private. Il filtro vero è access_level='public'
// (strutturale: una nuova pagina privata è esclusa da sola); questa lista resta
// per le pagine che fossero pubbliche ma non hanno senso in sitemap.
const SITEMAP_BLACKLIST = new Set([
  "user", "user-dashboard", "user-menu", "user-quiz", "user-passport",
  "auth", "menu", "home",
]);

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

/** Un'entità del sito, espressa in segmenti di slug INGLESI. */
interface SitemapEntry {
  /** Segmenti inglesi del path. [] = home. */
  segments: string[];
  priority: string;
  changefreq: string;
  lastmod?: string | null;
}

/** lingua → (slug inglese → slug tradotto). Righe solo per le 7 lingue europee. */
type SlugIndex = Record<string, Record<string, string>>;

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // ── Static pages from site_metadata ──────────────────────────────────────
    // access_level='public' è il filtro autorevole: senza, ogni futura pagina
    // riservata finirebbe in sitemap finché qualcuno non aggiorna la blacklist.
    const { data: staticPages } = await supabase
      .from("site_metadata")
      .select("page_slug, created_at")
      .eq("show_in_menu", true)
      .eq("access_level", "public")
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

    // ── Registro slug tradotti ────────────────────────────────────────────────
    // Una sola lettura dell'intera view (~1.938 righe) invece di una per lingua.
    // A flag spento non si legge affatto.
    const slugIndex: SlugIndex = {};
    if (I18N_ENABLED) {
      const { data: translatedSlugs } = await supabase
        .from("v_translated_slugs")
        .select("lang, slug_en, slug_translated");

      for (const row of translatedSlugs ?? []) {
        if (!row.lang || !row.slug_en || !row.slug_translated) continue;
        (slugIndex[row.lang] ??= {})[row.slug_en] = row.slug_translated;
      }
    }

    // ── Costruzione delle entità (in slug INGLESI) ────────────────────────────
    const entries: SitemapEntry[] = [];
    const seen = new Set<string>();

    /**
     * Dedup sulla chiave inglese: i 4 hub (culture/recipes/news/ingredients)
     * hanno show_in_menu=true, quindi arrivavano DUE volte — dal ciclo delle
     * pagine statiche e dai push hardcoded qui sotto. Un URL duplicato in
     * sitemap è un segnale sporco che Google riporta come warning.
     */
    const push = (entry: SitemapEntry) => {
      const key = entry.segments.join("/");
      if (seen.has(key)) return;
      seen.add(key);
      entries.push(entry);
    };

    // Homepage — highest priority
    push({ segments: [], priority: "1.0", changefreq: "daily", lastmod: new Date().toISOString() });

    // Hub pages (content index pages) — PRIMA delle statiche, così vincono loro
    // priorità e changefreq (0.9/weekly) e non quelli generici (0.8/monthly).
    const HUBS = [
      "akha-culture-highland-heritage",
      "authentic-thai-akha-recipes",
      "thai-cooking-tips-news",
      "thai-cooking-ingredients",
    ];
    for (const hub of HUBS) {
      push({ segments: [hub], priority: "0.9", changefreq: "weekly", lastmod: new Date().toISOString() });
    }

    // Static public pages (excluding private/app routes)
    for (const page of staticPages || []) {
      const slug = page.page_slug;
      if (!slug || SITEMAP_BLACKLIST.has(slug)) continue;
      push({ segments: [slug], priority: "0.8", changefreq: "monthly", lastmod: page.created_at });
    }

    // Recipe detail pages
    for (const recipe of recipes || []) {
      if (!recipe.slug) continue;
      push({ segments: ["authentic-thai-akha-recipes", recipe.slug], priority: "0.9", changefreq: "weekly", lastmod: recipe.updated_at });
    }

    // Culture/history detail pages
    for (const section of cultureSections || []) {
      if (!section.slug) continue;
      push({ segments: ["akha-culture-highland-heritage", section.slug], priority: "0.8", changefreq: "monthly", lastmod: section.updated_at });
    }

    // News/blog detail pages
    for (const article of news || []) {
      if (!article.slug) continue;
      push({ segments: ["thai-cooking-tips-news", article.slug], priority: "0.7", changefreq: "weekly", lastmod: article.updated_at });
    }

    // Ingredient category guides
    for (const cat of ingredientCategories || []) {
      if (!cat.slug) continue;
      push({ segments: ["thai-cooking-ingredients", cat.slug], priority: "0.8", changefreq: "monthly", lastmod: cat.updated_at });
    }

    // Ingredient detail pages
    for (const ingredient of ingredients || []) {
      if (!ingredient.slug) continue;
      push({ segments: ["thai-cooking-ingredients", ingredient.slug], priority: "0.7", changefreq: "monthly", lastmod: ingredient.updated_at });
    }

    // ── Emissione ─────────────────────────────────────────────────────────────
    const urls: string[] = [];
    for (const entry of entries) {
      for (const lang of ACTIVE_LANGS) {
        urls.push(buildUrl(entry, lang, slugIndex));
      }
    }

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
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

/**
 * Path assoluto di un'entità in una lingua.
 * Ogni segmento viene tradotto singolarmente (l'hub e l'articolo hanno slug
 * propri); un segmento senza traduzione resta inglese — è il caso di th/zh/ko/ja,
 * che navigano su slug inglesi con contenuti tradotti.
 */
function localizedUrl(entry: SitemapEntry, lang: string, slugIndex: SlugIndex): string {
  const map = slugIndex[lang] ?? {};
  const segments = entry.segments.map((seg) => map[seg] ?? seg);
  const prefix = lang === DEFAULT_LANG ? "" : `/${lang}`;
  const path = segments.length ? `${prefix}/${segments.join("/")}` : `${prefix}/`;
  return `${SITE_URL}${path}`.replace(/&/g, "&amp;");
}

function buildUrl(entry: SitemapEntry, lang: string, slugIndex: SlugIndex): string {
  const loc = localizedUrl(entry, lang, slugIndex);
  const lastmodTag = entry.lastmod
    ? `\n    <lastmod>${entry.lastmod.slice(0, 10)}</lastmod>`
    : "";

  // hreflang reciproci: ogni URL elenca TUTTE le lingue, sé stesso compreso.
  // Google scarta i gruppi hreflang non reciproci, quindi l'auto-riferimento non
  // è ridondante — è la condizione perché il gruppo venga considerato valido.
  // A flag spento ACTIVE_LANGS è ['en'] e questo blocco non emette nulla.
  const alternates = I18N_ENABLED
    ? ACTIVE_LANGS.map(
        (alt) =>
          `\n    <xhtml:link rel="alternate" hreflang="${alt}" href="${localizedUrl(entry, alt, slugIndex)}"/>`,
      ).join("") +
      `\n    <xhtml:link rel="alternate" hreflang="x-default" href="${localizedUrl(entry, DEFAULT_LANG, slugIndex)}"/>`
    : "";

  return `  <url>
    <loc>${loc}</loc>${lastmodTag}${alternates}
    <changefreq>${entry.changefreq}</changefreq>
    <priority>${entry.priority}</priority>
  </url>`;
}
