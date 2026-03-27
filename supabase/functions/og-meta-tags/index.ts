import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
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

// ─── Types ──────────────────────────────────────────────────────────────────

interface OGData {
  title: string;
  description: string;
  image: string;
  url: string;
  type: string;
}

// ─── Main Handler ───────────────────────────────────────────────────────────

serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const path = url.searchParams.get("path") || "/";

    console.log(`[OG-META] Processing path: ${path}`);

    // Initialize Supabase client
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // 1. Detect page type and extract identifier
    let ogData = getDefaultOGData(path);

    if (path.startsWith("/history/")) {
      // Culture section page: /history/[slug]
      const slug = extractSlug(path, "/history/");
      console.log(`[OG-META] Culture page slug: ${slug}`);

      const cultureData = await fetchCultureData(supabase, slug);
      if (cultureData) {
        ogData = cultureData;
      }
    } else if (path === "/" || path === "") {
      // Home page - use site metadata
      const siteData = await fetchSiteMetadata(supabase, "home");
      if (siteData) {
        ogData = siteData;
      }
    } else {
      // Other pages (recipes, classes, booking, etc.)
      const pageName = extractPageName(path);
      const siteData = await fetchSiteMetadata(supabase, pageName);
      if (siteData) {
        ogData = siteData;
      }
    }

    // 2. Generate HTML with OG meta-tags
    const html = generateOGHTML(ogData);

    // Return response with meta-tags
    return new Response(html, {
      headers: {
        ...corsHeaders,
        "Content-Type": "text/html; charset=utf-8",
        "Cache-Control": "public, max-age=3600", // Cache for 1 hour
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

/**
 * Default OG data fallback
 */
function getDefaultOGData(path: string): OGData {
  return {
    title: "Thai Akha Kitchen — Discover Culture & Flavor",
    description:
      "Explore the authentic flavors, stories, and traditions of Akha culture through classes, recipes, and cultural journeys.",
    image: `${SITE_URL}/og-default.jpg`,
    url: `${SITE_URL}${path}`,
    type: "website",
  };
}

/**
 * Extract slug from /history/[slug] or /history/[slug]/path
 */
function extractSlug(pathname: string, prefix: string): string {
  const slugPart = pathname.substring(prefix.length);
  return slugPart.split("/")[0]; // Get first segment after prefix
}

/**
 * Extract page name from /pagename or /pagename/path
 */
function extractPageName(pathname: string): string {
  const parts = pathname.substring(1).split("/");
  return parts[0] || "home";
}

/**
 * Fetch culture section metadata
 */
async function fetchCultureData(
  supabase: any,
  slug: string
): Promise<OGData | null> {
  try {
    const { data, error } = await supabase
      .from("culture_sections")
      .select("seo_title, seo_description, primary_image, slug")
      .eq("slug", slug)
      .is("is_published", null) // Include all (published logic elsewhere)
      .single();

    if (error || !data) {
      console.warn(`[OG-META] Culture section not found: ${slug}`);
      return null;
    }

    // Resolve image URL from asset_id
    let imageUrl = `${SITE_URL}/og-culture.jpg`; // Default
    if (data.primary_image) {
      imageUrl = await resolveAssetImage(supabase, data.primary_image);
    }

    return {
      title: data.seo_title || "Thai Akha Culture & History",
      description:
        data.seo_description || "Discover authentic Akha stories and traditions",
      image: imageUrl,
      url: `${SITE_URL}/history/${slug}`,
      type: "article",
    };
  } catch (error) {
    console.error(`[OG-META] Error fetching culture data for ${slug}:`, error);
    return null;
  }
}

/**
 * Fetch site metadata for pages
 */
async function fetchSiteMetadata(
  supabase: any,
  pageSlug: string
): Promise<OGData | null> {
  try {
    const { data, error } = await supabase
      .from("site_metadata")
      .select("og_title, og_description, og_image")
      .eq("page_slug", pageSlug)
      .single();

    if (error || !data) {
      console.warn(`[OG-META] Site metadata not found: ${pageSlug}`);
      return null;
    }

    return {
      title: data.og_title || "Thai Akha Kitchen",
      description: data.og_description || "",
      image: data.og_image || `${SITE_URL}/og-default.jpg`,
      url: `${SITE_URL}/${pageSlug === "home" ? "" : pageSlug}`,
      type: "website",
    };
  } catch (error) {
    console.error(
      `[OG-META] Error fetching site metadata for ${pageSlug}:`,
      error
    );
    return null;
  }
}

/**
 * Resolve asset_id to actual image URL via media_assets table
 */
async function resolveAssetImage(supabase: any, assetId: string): Promise<string> {
  try {
    const { data, error } = await supabase
      .from("media_assets")
      .select("image_url")
      .eq("asset_id", assetId)
      .single();

    if (error || !data?.image_url) {
      console.warn(`[OG-META] Asset image not found: ${assetId}`);
      return `${SITE_URL}/og-culture.jpg`;
    }

    return data.image_url;
  } catch (error) {
    console.error(`[OG-META] Error resolving asset ${assetId}:`, error);
    return `${SITE_URL}/og-culture.jpg`;
  }
}

/**
 * Generate HTML with Open Graph meta-tags
 */
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

  <!-- Open Graph Meta Tags (Facebook, WhatsApp, LinkedIn, etc.) -->
  <meta property="og:title" content="${title}">
  <meta property="og:description" content="${description}">
  <meta property="og:image" content="${image}">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">
  <meta property="og:image:type" content="image/jpeg">
  <meta property="og:url" content="${url}">
  <meta property="og:type" content="${ogData.type}">
  <meta property="og:site_name" content="Thai Akha Kitchen">
  <meta property="og:locale" content="en_US">

  <!-- Twitter Card -->
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${title}">
  <meta name="twitter:description" content="${description}">
  <meta name="twitter:image" content="${image}">
  <meta name="twitter:site" content="@thaiakhakitchen">

  <!-- Redirect to actual React app after meta-tags are served -->
  <script>
    (function() {
      // Give crawlers 1 second to parse meta-tags, then redirect human users
      setTimeout(function() {
        window.location.href = window.location.pathname + window.location.search;
      }, 1000);
    })();
  </script>

  <!-- Fallback for immediate redirect if JS executes faster -->
  <noscript>
    <meta http-equiv="refresh" content="0;url=${url}">
  </noscript>
</head>
<body>
  <p>Loading Thai Akha Kitchen...</p>
</body>
</html>`;
}

/**
 * Escape HTML special characters
 */
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
