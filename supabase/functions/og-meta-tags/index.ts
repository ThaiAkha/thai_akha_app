import { createClient } from "jsr:@supabase/supabase-js@2";

// ─── CORS Headers ───────────────────────────────────────────────────────────

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

// ─── Environment ────────────────────────────────────────────────────────────

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const SITE_URL = "https://www.thaiakha.com";

// OG fallback image — used when a page/content has no specific og_image in the DB.
const OG_DEFAULT_IMAGE = "https://mtqullobcsypkqgdkaob.supabase.co/storage/v1/object/public/showcase/og-default.jpg";
const OG_CULTURE_IMAGE = OG_DEFAULT_IMAGE;

// ─── Bot Detection ──────────────────────────────────────────────────────────

const BOT_PATTERN =
  /googlebot|google-extended|storebot-google|bingbot|bingpreview|slurp|baiduspider|yandexbot|applebot|apple-pubsub|duckduckbot|semrushbot|ahrefsbot|mj12bot|dotbot|facebookexternalhit|meta-externalagent|meta-ai|whatsapp|twitterbot|tweetmemebot|linkedinbot|pinterestbot|tumblr|telegrambot|ig_nativemobile|tiktok|discordbot|slackbot|gptbot|chatgpt-user|oai-searchbot|claudebot|claude-web|anthropic-ai|perplexitybot|perplexity-user|cohere-ai|cohereforaisearchcrawler|mistral|ai2bot|youbot|bravesearch|bravebot|kagibot|mojeekbot|neevabot|phindbot|amazonbot|amazoncloudi|bytespider|omgili|imagesift|opengraph|lychee|iaskspider|diffbot|scrapy|python-requests|go-http-client|dataprovider|rogerbot|seokicks|seekport|linkdex|seoscannerbot|ccbot|commoncrawl|ia_archiver|archive\.org|gemini-crawl|google-gemini|xai-bot|deepseekcrawl|deepseek/i;

// ─── Types ──────────────────────────────────────────────────────────────────

interface OGData {
  title: string;
  description: string;
  image: string;
  imageType: string;
  url: string;
  type: string;
  jsonLd?: Record<string, unknown>;
  bodyContent?: string;
}

interface SiteMetadataRow {
  seo_title: string | null;
  seo_description: string | null;
  og_title: string | null;
  og_description: string | null;
  cover_asset_id: string | null;  // modern — resolves via media_assets
  json_ld: Record<string, unknown> | null;
}

interface CultureRow {
  seo_title: string | null;
  seo_description: string | null;
  og_title: string | null;
  og_description: string | null;
  og_image: string | null;
  cover_asset_id: string | null;  // asset ID → lookup in media_assets
  slug: string;
  title: string;
  subtitle: string | null;
  json_ld: Record<string, unknown> | null;
}

interface MediaAssetRow {
  image_url: string | null;
  mime_type: string | null;
}

// ContentCategoryRow removed — categories have no dedicated URL routes;
// they are state filters inside Recipes.tsx, not standalone pages.

interface RecipeRow {
  seo_title: string | null;
  seo_description: string | null;
  og_title: string | null;
  og_description: string | null;
  og_image: string | null;
  cover_asset_id: string | null;  // asset ID → lookup in media_assets
  name: string;
  description: string | null;
  excerpt: string | null;
  json_ld: Record<string, unknown> | null;
}

interface NewsRow {
  seo_title: string | null;
  seo_description: string | null;
  og_title: string | null;
  og_description: string | null;
  og_image: string | null;
  cover_asset_id: string | null;  // asset ID → lookup in media_assets
  title: string;
  excerpt: string | null;
  json_ld: Record<string, unknown> | null;
  published_at: string | null;
}

// ─── Legacy slug → canonical slug map ───────────────────────────────────────
// Mirrors App.tsx LEGACY_SLUG_MAP — keeps Edge Function in sync with React router.
// When a bot hits a legacy URL, we resolve to the canonical DB slug.
const LEGACY_SLUG_MAP: Record<string, string> = {
  // Pages
  'news':                     'thai-cooking-tips-news',
  'quiz':                     'akha-wisdom-path-quiz',
  'history':                  'akha-culture-highland-heritage',
  'ingredients':              'thai-cooking-ingredients',
  'recipes':                  'authentic-thai-akha-recipes',
  'classes':                  'thai-cooking-classes-chiang-mai',
  'cooking-class':            'thai-cooking-classes-chiang-mai',
  'morning-class':            'morning-cooking-class-market-tour',
  'evening-class':            'evening-cooking-class-dinner',
  'about-us':                 'about-thai-akha-kitchen',
  'contact':                  'contact-cooking-school-chiang-mai',
  'contact-us':               'contact-cooking-school-chiang-mai',
  'booking':                  'book-cooking-class-chiang-mai',
  'location':                 'free-pickup-location-chiang-mai',
  'faq':                      'cooking-class-faq-chiang-mai',
  'terms-and-conditions':     'booking-terms-conditions',
  'policy-and-privacy':       'privacy-policy',
  'privacy':                  'privacy-policy',
  // News Articles (legacy)
  'the-art-of-thai-akha-spice-soft-to-warrior': 'thai-spice-levels-guide',
  'how-to-prepare-cooking-class-chiang-mai':    'prepare-thai-cooking-class-chiang-mai',
  'how-the-class-works':                        'how-thai-cooking-class-works',
  'dietary-styles-and-customization':           'vegan-vegetarian-thai-cooking-guide',
  'cooking-with-food-allergies':                'allergy-safe-thai-cooking-protocols',
  'art-of-mortar-pestle':                       'mortar-vs-blender-thai-curry-paste',
  'local-market-tour-experience':               'chiang-mai-local-market-tour-guide',
  'free-pickup-zones-chiang-mai':               'cooking-class-chiang-mai-pickup-map',
  'niti-muelaeku-akha-chef':                    'chef-niti-muelaeku-akha-heritage',
  '6-reasons-to-join-thai-akha-kitchen':        'best-cooking-school-chiang-mai-reasons',
  'reducing-plastic-consumption-chiang-mai':    'sustainable-cooking-zero-plastic-chiang-mai',
  'how-to-use-dry-spices-curry-paste':          'how-to-use-thai-dry-spices-guide',
  'akha-thai-languages-guide':                  'essential-thai-akha-market-phrases',
  'vegan-akha-cooking':                         'authentic-vegan-thai-cooking-chiang-mai',
  'cookbook-and-certificate':                   'thai-cooking-class-certificate-cookbook',
  // Recipe Articles (legacy)
  'akha-salad':            'authentic-akha-mountain-salad-recipe',
  'akha-herbal-soup':      'akha-spirit-detox-soup-recipe',
  'akha-sapi-thong':       'traditional-akha-sapi-thong-recipe',
  'papaya-salad':          'authentic-som-tum-papaya-salad-recipe',
  'fried-spring-rolls':    'crispy-thai-spring-rolls-recipe',
  'thai-red-curry':        'authentic-thai-red-curry-recipe',
  'thai-green-curry':      'authentic-thai-green-curry-recipe',
  'thai-panang-curry':     'authentic-thai-panang-curry-recipe',
  'thai-massaman-curry':   'authentic-thai-massaman-curry-recipe',
  'tom-kha-coconut-milk':  'authentic-tom-kha-gai-recipe',
  'tom-yum-hot-and-sour':  'authentic-tom-yum-goong-recipe',
  'clear-soup-egg-tofu':   'thai-clear-soup-egg-tofu-recipe',
  'pad-thai':              'authentic-pad-thai-recipe-chiang-mai',
  'stir-fry-cashew-nuts':  'thai-chicken-cashew-nuts-recipe',
  'stir-fry-holy-basil':   'authentic-pad-kra-pao-recipe',
  'sweet-and-sour-vegetables': 'thai-sweet-and-sour-vegetable-recipe',
  'mango-sticky-rice':     'authentic-mango-sticky-rice-recipe',
  'pumpkin-in-coconut-milk': 'thai-pumpkin-coconut-milk-recipe',
  // History Sections (legacy)
  'living-tradition':       'akha-village-living-traditions',
  'akha-men':               'akha-mens-new-year-traditions',
  'food-as-medicine':       'akha-food-as-medicine-healing',
  'learn-basic-survival':   'akha-jungle-survival-medicine',
  'spirit-gate':            'sacred-akha-spirit-gate-meaning',
  'music-folklore':         'traditional-akha-music-folklore',
  'religion-taboo':         'akha-religious-taboos-beliefs',
  'communal-dining':        'akha-communal-dining-etiquette',
  'spice-philosophy':       'akha-sapi-thong-spice-philosophy',
  'thai-akha-fusion':       'thai-akha-culinary-fusion',
  'religion-cosmos-belief': 'akha-cosmos-animist-beliefs',
  'modern-borders':         'akha-diaspora-southeast-asia',
  'hani-akha':              'hani-akha-shared-ancestry',
  'the-high-plateau':       'tibetan-plateau-akha-origins',
  'hill-tribes-overview':   'northern-thailand-hill-tribes-guide',
  'historical-roots':       'akha-migration-history-routes',
  'jungle-bounty':          'akha-jungle-foraging-pantry',
  'traditional-dress':      'traditional-akha-dress-silver',
  'threads-of-origin':      'akha-subgroups-migration-history',
  'woven-stories':          'akha-textile-embroidery-traditions',
  'swing-festival':         'akha-swing-festival-yehkuja',
};

/** Resolve a raw URL slug to its canonical DB slug */
function resolveSlug(raw: string): string {
  return LEGACY_SLUG_MAP[raw] ?? raw;
}

// ─── Main Handler ───────────────────────────────────────────────────────────

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const path = url.searchParams.get("path") || "/";
    const userAgent = req.headers.get("User-Agent") || "";

    // Non-bot: redirect immediato, zero DB call
    if (!BOT_PATTERN.test(userAgent)) {
      return new Response(null, {
        status: 302,
        headers: { ...corsHeaders, Location: `${SITE_URL}${path}` },
      });
    }

    console.log(`[OG-META] Bot detected (${userAgent.slice(0, 40)}), path: ${path}`);

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    let ogData = getDefaultOGData(path);

    // Note: /recipe/category/... routes do NOT exist in the frontend.
    // Categories are state-filters inside Recipes.tsx, not standalone pages.
    // Resolve legacy slugs before routing — e.g. /cooking-class → /thai-cooking-classes-chiang-mai
    const resolvedPath = resolvePath(path);

    if (resolvedPath.startsWith("/akha-culture-highland-heritage/") && resolvedPath.length > "/akha-culture-highland-heritage/".length) {
      const slug = resolveSlug(extractSlug(resolvedPath, "/akha-culture-highland-heritage/"));
      const cultureData = await fetchCultureData(supabase, slug);
      if (cultureData) ogData = cultureData;
    } else if (resolvedPath.startsWith("/authentic-thai-akha-recipes/") && resolvedPath.length > "/authentic-thai-akha-recipes/".length) {
      const slug = resolveSlug(extractSlug(resolvedPath, "/authentic-thai-akha-recipes/"));
      const recipeData = await fetchRecipeData(supabase, slug);
      if (recipeData) ogData = recipeData;
    } else if (resolvedPath.startsWith("/thai-cooking-tips-news/") && resolvedPath.length > "/thai-cooking-tips-news/".length) {
      const slug = resolveSlug(extractSlug(resolvedPath, "/thai-cooking-tips-news/"));
      const newsData = await fetchNewsData(supabase, slug);
      if (newsData) ogData = newsData;
    } else if (resolvedPath.startsWith("/thai-cooking-ingredients/") && resolvedPath.length > "/thai-cooking-ingredients/".length) {
      // Disambiguation: category guides end in '-guide' (content_categories); everything else = single ingredient.
      const slug = extractSlug(resolvedPath, "/thai-cooking-ingredients/");
      const ingData = slug.endsWith("-guide")
        ? await fetchIngredientCategoryData(supabase, slug)
        : await fetchIngredientData(supabase, slug);
      if (ingData) ogData = ingData;
    } else {
      const rawSlug = resolvedPath === "/" || resolvedPath === "" ? "home" : extractPageName(resolvedPath);
      const pageSlug = resolveSlug(rawSlug);
      const siteData = await fetchSiteMetadata(supabase, pageSlug);
      if (siteData) {
        ogData = siteData;
      } else {
        // Try home as ultimate fallback
        const homeFallback = await fetchSiteMetadata(supabase, "home");
        if (homeFallback) ogData = homeFallback;
      }
    }

    const html = generateOGHTML(ogData);

    return new Response(html, {
      headers: {
        ...corsHeaders,
        "Content-Type": "text/html; charset=utf-8",
        "Cache-Control": "public, max-age=3600",
      },
    });
  } catch (error) {
    // Silent fallback — serve default HTML so bots never get a 500
    console.error("[OG-META] Error:", error);
    const fallbackHtml = generateOGHTML(getDefaultOGData("/"));
    return new Response(fallbackHtml, {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "text/html; charset=utf-8" },
    });
  }
});

// ─── Helper Functions ────────────────────────────────────────────────────────

function getDefaultOGData(path: string): OGData {
  return {
    title: "Thai Akha Kitchen — Discover Culture & Flavor",
    description:
      "Explore the authentic flavors, stories, and traditions of Akha culture through classes, recipes, and cultural journeys.",
    image: OG_DEFAULT_IMAGE,
    imageType: "image/jpeg",
    url: `${SITE_URL}${path}`,
    type: "website",
  };
}

function extractSlug(pathname: string, prefix: string): string {
  return pathname.substring(prefix.length).split("/")[0];
}

/**
 * Resolve a full path with legacy prefix to its canonical form.
 * e.g. /cooking-class → /thai-cooking-classes-chiang-mai
 * e.g. /history/spirit-gate → /akha-culture-highland-heritage/sacred-akha-spirit-gate-meaning
 */
function resolvePath(pathname: string): string {
  const parts = pathname.split("/").filter(Boolean);
  if (parts.length === 0) return "/";
  const first = parts[0];
  const resolved = LEGACY_SLUG_MAP[first] ?? first;
  if (parts.length === 1) return `/${resolved}`;
  const second = parts[1];
  const resolvedSecond = LEGACY_SLUG_MAP[second] ?? second;
  return `/${resolved}/${resolvedSecond}`;
}

function extractPageName(pathname: string): string {
  return pathname.substring(1).split("/")[0] || "home";
}

// fetchUniversalCategoryData removed — see note above.

async function fetchCultureData(
  supabase: ReturnType<typeof createClient>,
  slug: string
): Promise<OGData | null> {
  try {
    const { data, error } = await supabase
      .from("culture_sections")
      .select("seo_title, seo_description, og_title, og_description, cover_asset_id, slug, title, subtitle, json_ld, canonical_url")
      .eq("slug", slug)
      .single<CultureRow>();

    if (error || !data) {
      console.error(`[OG-META] fetchCultureData error for slug '${slug}':`, error?.message);
      return null;
    }

    const title = data.seo_title || data.og_title || data.title || "Thai Akha Culture & History";
    const description = data.seo_description || data.og_description || data.subtitle || "Discover authentic Akha stories and traditions";

    // og:image dal cover_asset_id → media_assets (fonte canonica unica; mai URL stantio).
    let imageUrl = OG_CULTURE_IMAGE;
    let imageType = "image/jpeg";
    if (data.cover_asset_id) {
      const asset = await resolveAssetImage(supabase, data.cover_asset_id);
      imageUrl = asset.url;
      imageType = asset.mimeType;
    }

    const jsonLd: Record<string, unknown> = data.json_ld && Object.keys(data.json_ld).length > 0
      ? data.json_ld
      : {
          "@context": "https://schema.org",
          "@type": "Article",
          "headline": title,
          "description": description,
          "image": imageUrl,
          "url": `${SITE_URL}/akha-culture-highland-heritage/${slug}`,
        };

    const canonicalUrl = (data as Record<string, unknown>).canonical_url as string | null;
    const finalUrl = canonicalUrl || `${SITE_URL}/akha-culture-highland-heritage/${slug}`;

    return {
      title,
      description,
      image: imageUrl,
      imageType,
      url: finalUrl,
      type: "article",
      jsonLd,
      bodyContent: `${title}\n\n${description}`.trim(),
    };
  } catch {
    return null;
  }
}

// ─── Fetch: /thai-cooking-ingredients/:slug (single ingredient) ──────────────
async function fetchIngredientData(
  supabase: ReturnType<typeof createClient>,
  slug: string
): Promise<OGData | null> {
  try {
    const { data, error } = await supabase
      .from("ingredients_library")
      .select("seo_title, seo_description, og_title, og_description, image_asset_id, slug, name_en, summary_ai, json_ld, canonical_url")
      .eq("slug", slug)
      .eq("is_published", true)
      .single();

    if (error || !data) {
      console.error(`[OG-META] fetchIngredientData error for slug '${slug}':`, error?.message);
      return null;
    }

    const d = data as Record<string, unknown>;
    const title = (d.seo_title || d.og_title || d.name_en || "Thai Cooking Ingredient") as string;
    const description = (d.seo_description || d.og_description || d.summary_ai || "A key ingredient in Akha and Northern Thai cooking.") as string;

    // og:image from image_asset_id → media_assets (ingredients use image_asset_id, not cover_asset_id).
    let imageUrl = OG_DEFAULT_IMAGE;
    let imageType = "image/jpeg";
    if (d.image_asset_id) {
      const asset = await resolveAssetImage(supabase, d.image_asset_id as string);
      imageUrl = asset.url;
      imageType = asset.mimeType;
    }

    const jsonLd: Record<string, unknown> =
      d.json_ld && typeof d.json_ld === "object" && Object.keys(d.json_ld as object).length > 0
        ? (d.json_ld as Record<string, unknown>)
        : {
            "@context": "https://schema.org",
            "@type": "Article",
            "headline": title,
            "description": description,
            "image": imageUrl,
            "url": `${SITE_URL}/thai-cooking-ingredients/${slug}`,
          };

    const canonicalUrl = d.canonical_url as string | null;
    const finalUrl = canonicalUrl || `${SITE_URL}/thai-cooking-ingredients/${slug}`;

    return {
      title,
      description,
      image: imageUrl,
      imageType,
      url: finalUrl,
      type: "article",
      jsonLd,
      bodyContent: `${title}\n\n${description}`.trim(),
    };
  } catch {
    return null;
  }
}

// ─── Fetch: /thai-cooking-ingredients/:slug-guide (category landing) ──────────
async function fetchIngredientCategoryData(
  supabase: ReturnType<typeof createClient>,
  slug: string
): Promise<OGData | null> {
  try {
    const { data, error } = await supabase
      .from("content_categories")
      .select("seo_title, seo_description, og_title, og_description, cover_asset_id, slug, title, description, json_ld, canonical_url")
      .eq("slug", slug)
      .eq("domain", "ingredient")
      .single();

    if (error || !data) {
      console.error(`[OG-META] fetchIngredientCategoryData error for slug '${slug}':`, error?.message);
      return null;
    }

    const d = data as Record<string, unknown>;
    const title = (d.seo_title || d.og_title || d.title || "Thai Cooking Ingredients") as string;
    const description = (d.seo_description || d.og_description || d.description || "Explore Thai cooking ingredients by category.") as string;

    let imageUrl = OG_DEFAULT_IMAGE;
    let imageType = "image/jpeg";
    if (d.cover_asset_id) {
      const asset = await resolveAssetImage(supabase, d.cover_asset_id as string);
      imageUrl = asset.url;
      imageType = asset.mimeType;
    }

    const jsonLd =
      d.json_ld && typeof d.json_ld === "object" && Object.keys(d.json_ld as object).length > 0
        ? (d.json_ld as Record<string, unknown>)
        : undefined;

    const canonicalUrl = d.canonical_url as string | null;
    const finalUrl = canonicalUrl || `${SITE_URL}/thai-cooking-ingredients/${slug}`;

    return {
      title,
      description,
      image: imageUrl,
      imageType,
      url: finalUrl,
      type: "website",
      jsonLd,
      bodyContent: `${title}\n\n${description}`.trim(),
    };
  } catch {
    return null;
  }
}

async function fetchSiteMetadata(
  supabase: ReturnType<typeof createClient>,
  pageSlug: string
): Promise<OGData | null> {
  try {
    const { data, error } = await supabase
      .from("site_metadata")
      .select("seo_title, seo_description, og_title, og_description, cover_asset_id, json_ld")
      .eq("page_slug", pageSlug)
      .single<SiteMetadataRow>();

    if (error || !data) return null;

    // Resolve cover image via cover_asset_id → media_assets (same pattern as recipes/culture/news)
    let imageUrl = OG_DEFAULT_IMAGE;
    let imageType = "image/jpeg";
    if (data.cover_asset_id) {
      const asset = await resolveAssetImage(supabase, data.cover_asset_id);
      imageUrl = asset.url;
      imageType = asset.mimeType;
    }

    // Include json_ld only if it's a non-empty object
    const jsonLd =
      data.json_ld &&
      typeof data.json_ld === "object" &&
      Object.keys(data.json_ld).length > 0
        ? (data.json_ld as Record<string, unknown>)
        : undefined;

    return {
      // seo_title/seo_description are the canonical fields; og_* as fallback
      title: data.seo_title || data.og_title || "Thai Akha Kitchen",
      description: data.seo_description || data.og_description || "",
      image: imageUrl,
      imageType,
      url: `${SITE_URL}/${pageSlug === "home" ? "" : pageSlug}`,
      type: "website",
      jsonLd,
    };
  } catch {
    return null;
  }
}

async function resolveAssetImage(
  supabase: ReturnType<typeof createClient>,
  assetId: string
): Promise<{ url: string; mimeType: string }> {
  try {
    const { data, error } = await supabase
      .from("media_assets")
      .select("image_url, mime_type")
      .eq("asset_id", assetId)
      .single<MediaAssetRow>();

    if (error || !data?.image_url) {
      return { url: OG_CULTURE_IMAGE, mimeType: "image/jpeg" };
    }
    return { url: data.image_url, mimeType: data.mime_type || detectImageType(data.image_url) };
  } catch {
    return { url: OG_DEFAULT_IMAGE, mimeType: "image/jpeg" };
  }
}

// ─── Helper: detect image MIME type from URL ─────────────────────────────────

function detectImageType(url: string): string {
  if (url.endsWith(".webp")) return "image/webp";
  if (url.endsWith(".png")) return "image/png";
  return "image/jpeg";
}

// ─── Fetch: /recipes/:slug ───────────────────────────────────────────────────

async function fetchRecipeData(
  supabase: ReturnType<typeof createClient>,
  slug: string
): Promise<OGData | null> {
  try {
    const { data, error } = await supabase
      .from("recipes")
      .select("seo_title, seo_description, og_title, og_description, cover_asset_id, name, description, excerpt, json_ld, canonical_url")
      .eq("slug", slug)
      .eq("is_published", true)
      .single<RecipeRow>();

    if (error || !data) return null;

    const title = data.seo_title || data.og_title || `${data.name} | Thai Akha Kitchen`;
    const description = data.seo_description || data.og_description || data.excerpt || (data.description?.slice(0, 160) ?? "");

    // og:image dal cover_asset_id → media_assets (fonte canonica unica; mai URL stantio).
    let image = OG_DEFAULT_IMAGE;
    let imageType = "image/jpeg";
    if (data.cover_asset_id) {
      const asset = await resolveAssetImage(supabase, data.cover_asset_id);
      image = asset.url;
      imageType = asset.mimeType;
    }

    const jsonLd: Record<string, unknown> = data.json_ld && Object.keys(data.json_ld).length > 0
      ? data.json_ld
      : {
          "@context": "https://schema.org",
          "@type": "Recipe",
          "name": data.name,
          "description": description,
          "url": `${SITE_URL}/authentic-thai-akha-recipes/${slug}`,
          "image": image,
        };

    const canonicalUrl = (data as Record<string, unknown>).canonical_url as string | null;
    const finalUrl = canonicalUrl || `${SITE_URL}/authentic-thai-akha-recipes/${slug}`;

    return {
      title,
      description,
      image,
      imageType,
      url: finalUrl,
      type: "article",
      jsonLd,
      bodyContent: `${data.name}\n\n${data.excerpt || data.description || ""}`.trim(),
    };
  } catch {
    return null;
  }
}

// ─── Fetch: /news/:slug ───────────────────────────────────────────────────────

async function fetchNewsData(
  supabase: ReturnType<typeof createClient>,
  slug: string
): Promise<OGData | null> {
  try {
    const { data, error } = await supabase
      .from("akha_news")
      .select("seo_title, seo_description, og_title, og_description, cover_asset_id, title, excerpt, json_ld, published_at, canonical_url")
      .eq("slug", slug)
      .eq("is_published", true)
      .single<NewsRow>();

    if (error || !data) {
      console.error(`[OG-META] fetchNewsData error for slug '${slug}':`, error?.message);
      return null;
    }

    const title = data.seo_title || data.og_title || `${data.title} | Thai Akha Kitchen`;
    const description = data.seo_description || data.og_description || data.excerpt?.slice(0, 160) || "";

    // og:image dal cover_asset_id → media_assets (fonte canonica unica; mai URL stantio).
    let image = OG_DEFAULT_IMAGE;
    let imageType = "image/jpeg";
    if (data.cover_asset_id) {
      const asset = await resolveAssetImage(supabase, data.cover_asset_id);
      image = asset.url;
      imageType = asset.mimeType;
    }

    const jsonLd: Record<string, unknown> = data.json_ld && Object.keys(data.json_ld).length > 0
      ? data.json_ld
      : {
          "@context": "https://schema.org",
          "@type": "NewsArticle",
          "headline": title,
          "description": description,
          "image": image,
          "url": `${SITE_URL}/thai-cooking-tips-news/${slug}`,
          "datePublished": data.published_at,
          "author": { "@type": "Organization", "name": "Thai Akha Kitchen" },
        };

    const canonicalUrl = (data as Record<string, unknown>).canonical_url as string | null;
    const finalUrl = canonicalUrl || `${SITE_URL}/thai-cooking-tips-news/${slug}`;

    return {
      title,
      description,
      image,
      imageType,
      url: finalUrl,
      type: "article",
      jsonLd,
      bodyContent: `${data.title}\n\n${data.excerpt || ""}`.trim(),
    };
  } catch {
    return null;
  }
}

function generateOGHTML(ogData: OGData): string {
  const title = escapeHtml(ogData.title);
  const description = escapeHtml(ogData.description);
  const image = escapeHtml(ogData.image);
  const url = escapeHtml(ogData.url);
  const bodyText = ogData.bodyContent ? escapeHtml(ogData.bodyContent) : "";

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <meta name="description" content="${description}">
  <link rel="canonical" href="${url}">

  <!-- Crawl directives -->
  <meta name="robots" content="index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1">

  <!-- Open Graph -->
  <meta property="og:title" content="${title}">
  <meta property="og:description" content="${description}">
  <meta property="og:image" content="${image}">
  <meta property="og:image:alt" content="${title}">
  <meta property="og:image:width" content="1920">
  <meta property="og:image:height" content="1080">
  <meta property="og:image:type" content="${ogData.imageType}">
  <meta property="og:url" content="${url}">
  <meta property="og:type" content="${ogData.type}">
  <meta property="og:site_name" content="Thai Akha Kitchen">
  <meta property="og:locale" content="en_US">
  <meta property="fb:app_id" content="1885423361488207">

  <!-- Twitter Card -->
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${title}">
  <meta name="twitter:description" content="${description}">
  <meta name="twitter:image" content="${image}">
  <meta name="twitter:site" content="@thaiakhakitchen">

  <!-- GEO / Location -->
  <meta name="geo.region" content="TH-50">
  <meta name="geo.placename" content="Chiang Mai, Thailand">
  <meta name="geo.position" content="18.7883;98.9853">
  <meta name="ICBM" content="18.7883, 98.9853">
${ogData.jsonLd ? `
  <!-- Structured Data -->
  <script type="application/ld+json">${JSON.stringify(ogData.jsonLd)}</script>` : ""}
</head>
<body>
  <article>
    <h1>${title}</h1>
    <p>${description}</p>
    ${bodyText ? `<section>${bodyText}</section>` : ""}
  </article>
</body>
</html>`;
}

function escapeHtml(text: string): string {
  if (!text) return "";
  const map: Record<string, string> = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;",
  };
  return text.replace(/[&<>"']/g, (char) => map[char]);
}
