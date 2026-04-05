import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.0";

// ─── CORS Headers ───────────────────────────────────────────────────────────

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

// ─── Environment ────────────────────────────────────────────────────────────

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const SITE_URL = "https://thaiakha.com";

// ─── Bot Detection ──────────────────────────────────────────────────────────

const BOT_PATTERN =
  /googlebot|facebookexternalhit|linkedinbot|perplexitybot|chatgpt-user|twitterbot|slackbot|whatsapp|discordbot|applebot|bingbot|yandexbot|telegrambot|pinterestbot|tweetmemebot|baiduspider|ig_nativemobile|tiktok/i;

// ─── Types ──────────────────────────────────────────────────────────────────

interface OGData {
  title: string;
  description: string;
  image: string;
  imageType: string;
  url: string;
  type: string;
  jsonLd?: Record<string, unknown>;
}

interface SiteMetadataRow {
  og_title: string | null;
  og_description: string | null;
  og_image: string | null;
  json_ld: Record<string, unknown> | null;
}

interface CultureRow {
  seo_title: string | null;
  seo_description: string | null;
  primary_image: string | null;
  slug: string;
}

interface MediaAssetRow {
  image_url: string | null;
  mime_type: string | null;
}

interface ContentCategoryRow {
  title: string;
  description: string | null;
  image_url: string | null;
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

    const categoryMatch = path.match(/^\/(\w+)\/category\/([^/]+)$/);
    if (categoryMatch) {
      const domain = categoryMatch[1];
      const categoryId = categoryMatch[2];
      const catData = await fetchUniversalCategoryData(supabase, domain, categoryId, path);
      if (catData) ogData = catData;
    } else if (path.startsWith("/history/")) {
      const slug = extractSlug(path, "/history/");
      const cultureData = await fetchCultureData(supabase, slug);
      if (cultureData) ogData = cultureData;
    } else {
      const pageSlug = path === "/" || path === "" ? "home" : extractPageName(path);
      const siteData = await fetchSiteMetadata(supabase, pageSlug);
      if (siteData) {
        ogData = siteData;
      } else if (pageSlug !== "default") {
        // Fallback to 'default' row
        const fallback = await fetchSiteMetadata(supabase, "default");
        if (fallback) ogData = fallback;
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
    console.error("[OG-META] Error:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error", details: String(error) }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});

// ─── Helper Functions ────────────────────────────────────────────────────────

function getDefaultOGData(path: string): OGData {
  return {
    title: "Thai Akha Kitchen — Discover Culture & Flavor",
    description:
      "Explore the authentic flavors, stories, and traditions of Akha culture through classes, recipes, and cultural journeys.",
    image: `${SITE_URL}/og-default.jpg`,
    imageType: "image/jpeg",
    url: `${SITE_URL}${path}`,
    type: "website",
  };
}

function extractSlug(pathname: string, prefix: string): string {
  return pathname.substring(prefix.length).split("/")[0];
}

function extractPageName(pathname: string): string {
  return pathname.substring(1).split("/")[0] || "home";
}

async function fetchUniversalCategoryData(
  supabase: ReturnType<typeof createClient>,
  domain: string,
  categoryId: string,
  path: string
): Promise<OGData | null> {
  try {
    const { data, error } = await supabase
      .from('content_categories')
      .select('title, description, image_url')
      .eq('domain', domain)
      .eq('id', categoryId)
      .single<ContentCategoryRow>();
    if (error || !data) return null;
    const title = data.title;
    const description = data.description || 'Explore this collection from Thai Akha Kitchen';
    const image = data.image_url || `${SITE_URL}/og-default.jpg`;
    return {
      title,
      description,
      image,
      imageType: image.endsWith('.webp') ? 'image/webp' : 'image/jpeg',
      url: `${SITE_URL}${path}`,
      type: 'website',
      jsonLd: {
        '@context': 'https://schema.org',
        '@type': 'CollectionPage',
        name: title,
        description,
        url: `${SITE_URL}${path}`,
      },
    };
  } catch {
    return null;
  }
}

async function fetchCultureData(
  supabase: ReturnType<typeof createClient>,
  slug: string
): Promise<OGData | null> {
  try {
    const { data, error } = await supabase
      .from("culture_sections")
      .select("seo_title, seo_description, primary_image, slug")
      .eq("slug", slug)
      .single<CultureRow>();

    if (error || !data) return null;

    let imageUrl = `${SITE_URL}/og-culture.jpg`;
    let imageType = "image/jpeg";
    if (data.primary_image) {
      const asset = await resolveAssetImage(supabase, data.primary_image);
      imageUrl = asset.url;
      imageType = asset.mimeType;
    }

    return {
      title: data.seo_title || "Thai Akha Culture & History",
      description: data.seo_description || "Discover authentic Akha stories and traditions",
      image: imageUrl,
      imageType,
      url: `${SITE_URL}/history/${slug}`,
      type: "article",
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
      .select("og_title, og_description, og_image, json_ld")
      .eq("page_slug", pageSlug)
      .single<SiteMetadataRow>();

    if (error || !data) return null;

    const imageUrl = data.og_image || `${SITE_URL}/og-default.jpg`;
    const imageType = imageUrl.endsWith(".webp")
      ? "image/webp"
      : imageUrl.endsWith(".png")
      ? "image/png"
      : "image/jpeg";

    // Include json_ld only if it's a non-empty object
    const jsonLd =
      data.json_ld &&
      typeof data.json_ld === "object" &&
      Object.keys(data.json_ld).length > 0
        ? (data.json_ld as Record<string, unknown>)
        : undefined;

    return {
      title: data.og_title || "Thai Akha Kitchen",
      description: data.og_description || "",
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
      return { url: `${SITE_URL}/og-culture.jpg`, mimeType: "image/jpeg" };
    }
    return { url: data.image_url, mimeType: data.mime_type || "image/jpeg" };
  } catch {
    return { url: `${SITE_URL}/og-culture.jpg`, mimeType: "image/jpeg" };
  }
}

function generateOGHTML(ogData: OGData): string {
  const title = escapeHtml(ogData.title);
  const description = escapeHtml(ogData.description);
  const image = escapeHtml(ogData.image);
  const url = escapeHtml(ogData.url);

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <meta name="description" content="${description}">

  <!-- Open Graph -->
  <meta property="og:title" content="${title}">
  <meta property="og:description" content="${description}">
  <meta property="og:image" content="${image}">
  <meta property="og:image:alt" content="${title}">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">
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
${ogData.jsonLd ? `
  <!-- Structured Data -->
  <script type="application/ld+json">${JSON.stringify(ogData.jsonLd)}</script>` : ""}
</head>
<body></body>
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
