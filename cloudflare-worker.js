/**
 * Cloudflare Worker — OG Meta-Tags Injection for Social Bots
 * CONFIGURED FOR: thaiakha.com · WORKER DASHBOARD: "og-meta-tags"
 * EDGE FUNCTION: https://mtqullobcsypkqgdkaob.supabase.co/functions/v1/og-meta-tags
 *
 * ⚠️ QUESTO FILE È LO SPECCHIO DEL WORKER LIVE (dashboard Cloudflare).
 * Il deploy è manuale: copia-incolla nel dashboard. Prima del 2026-08-10 sera
 * questa copia era STALE (il live aveva 301 map, robots, sitemap proxy, llms.txt
 * che qui mancavano): riallineata dal codice live via connettore. Da ora ogni
 * modifica si fa QUI e si incolla nel dashboard — mai il contrario.
 *
 * PATCH 2026-08-10: +/ingredients +/contact-us +/privacy in REDIRECT_MAP · +Disallow /join-group
 * PATCH 2026-08-10 sera: blocco prefissi lingua (multilingua, flag I18N_ROUTES_ENABLED)
 */

const SOCIAL_BOTS = [

  // ── Social & Messaging ───────────────────────────────────────────────────
  'facebookexternalhit', 'whatsapp', 'twitterbot',
  'tweetmemebot', 'linkedinbot', 'pinterestbot', 'tumblr', 'telegrambot',
  'ig_nativemobile', 'tiktok', 'discordbot', 'slackbot', 'linebot',

  // ── Search Engines (Traditional & AI-Powered) ────────────────────────────
  'googlebot', 'bingbot', 'slurp', 'baiduspider', 'yandexbot',
  'duckduckbot', 'semrushbot',

  // ── OpenAI / ChatGPT ────────────────────────────────────────────────────
  'gptbot', 'chatgpt-user', 'oai-searchbot',

  // ── Google (Gemini / AI Overviews) ──────────────────────────────────────
  'google-extended', 'google-agent', 'gemini-deep-research',

  // ── Anthropic / Claude ──────────────────────────────────────────────────
  'claudebot', 'claude-user', 'claude-searchbot', 'anthropic-ai',

  // ── Perplexity AI ───────────────────────────────────────────────────────
  'perplexitybot', 'perplexity-user',

  // ── Meta (Facebook / Instagram / Llama) ─────────────────────────────────
  'meta-externalagent', 'meta-webindexer', 'facebookbot',

  // ── Apple Intelligence ──────────────────────────────────────────────────
  'applebot', 'applebot-extended',

  // ── Amazon ──────────────────────────────────────────────────────────────
  'amazonbot', 'amazonadbot', 'amazonproductdiscoverybot',

  // ── ByteDance / TikTok AI ───────────────────────────────────────────────
  'bytespider',

  // ── Emerging & Regional AI Bots ─────────────────────────────────────────
  'cohere-ai', 'cohereforaisearchcrawler', 'mistral', 'mistralai-user',
  'ccbot', 'deepseek-crawler', 'deepseekcrawl', 'grokbot', 'xai-bot',
  'qwen-bot', 'youbot', 'bravesearch', 'kagibot', 'phindbot', 'ai2bot',
  'iaskspider', 'diffbot', 'gemini-crawl', 'ahrefsbot',

  // ── Image / Multimodal AI Bots ──────────────────────────────────────────
  'omgili', 'imagesift',

  // ── OG Preview Tools ────────────────────────────────────────────────────
  'opengraph', 'lychee', 'bingpreview', 'storebot-google',
];

const OG_FUNCTION_URL  = 'https://mtqullobcsypkqgdkaob.supabase.co/functions/v1/og-meta-tags';
const SITEMAP_URL      = 'https://mtqullobcsypkqgdkaob.supabase.co/functions/v1/sitemap';
const LLMS_TXT_URL     = 'https://mtqullobcsypkqgdkaob.supabase.co/functions/v1/llms-txt';
const ORIGIN_URL       = 'https://thai-akha-front.web.app';
const SITE_URL         = 'https://www.thaiakha.com';
const CACHE_TTL        = 3600;
const STALE_REVALIDATE = 86400;
const OG_DEFAULT_IMAGE = 'https://mtqullobcsypkqgdkaob.supabase.co/storage/v1/object/public/showcase/og-default.jpg';

// ─── Perimetro lingue (multilingua 2026) ────────────────────────────────────
// Quarta copia del perimetro (shared i18n.ts + 2 edge Deno + qui): il Worker è
// l'UNICO punto in cui passa ogni richiesta, quindi l'unico che può emettere un
// redirect HTTP vero — un replaceState lato React non è un 302 per i crawler.
// Interruttore: var d'ambiente I18N_ROUTES_ENABLED='true' nel dashboard Worker
// (stesso interruttore del secret edge e di VITE_I18N_ROUTES del front: si
// girano INSIEME). Assente o diversa da 'true' = solo inglese, come oggi.
const DEFAULT_LANG = 'en';
const SUPPORTED_LANGS = ['en', 'es', 'fr', 'de', 'pt', 'it', 'ca', 'nl', 'th', 'zh', 'ko', 'ja'];
const TWO_LETTER = /^[a-z]{2}$/i;

function buildFallbackOGHtml(path) {
  const pageUrl = `${SITE_URL}${path}`;
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Thai Akha Kitchen — Discover Culture &amp; Flavor</title>
  <meta name="description" content="Explore authentic flavors, stories, and traditions of Akha culture through classes, recipes, and cultural journeys.">
  <link rel="canonical" href="${pageUrl}">
  <meta name="robots" content="index, follow">
  <meta property="og:title" content="Thai Akha Kitchen — Discover Culture &amp; Flavor">
  <meta property="og:description" content="Explore authentic flavors, stories, and traditions of Akha culture through classes, recipes, and cultural journeys.">
  <meta property="og:image" content="${OG_DEFAULT_IMAGE}">
  <meta property="og:image:width" content="1920">
  <meta property="og:image:height" content="1080">
  <meta property="og:image:type" content="image/jpeg">
  <meta property="og:url" content="${pageUrl}">
  <meta property="og:type" content="website">
  <meta property="og:site_name" content="Thai Akha Kitchen">
  <meta property="og:locale" content="en_US">
  <meta property="fb:app_id" content="1885423361488207">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="Thai Akha Kitchen — Discover Culture &amp; Flavor">
  <meta name="twitter:description" content="Explore authentic flavors, stories, and traditions of Akha culture through classes, recipes, and cultural journeys.">
  <meta name="twitter:image" content="${OG_DEFAULT_IMAGE}">
  <meta name="twitter:site" content="@thaiakhakitchen">
</head>
<body>
  <h1>Thai Akha Kitchen</h1>
  <p>Explore authentic flavors, stories, and traditions of Akha culture through classes, recipes, and cultural journeys.</p>
</body>
</html>`;
}

// ─── Legacy URL → Canonical 301 Redirects ───────────────────────────────────
// Old first-edition slugs permanently redirect to canonical SEO slugs.
// Keep in sync with lib/pageSlugs.ts (front) and og-meta-tags LEGACY_SLUG_MAP.
const REDIRECT_MAP = {
  // Pages
  '/news':                       '/thai-cooking-tips-news',
  '/quiz':                       '/akha-wisdom-path-quiz',
  '/history':                    '/akha-culture-highland-heritage',
  '/ingredients':                '/thai-cooking-ingredients',
  '/recipes':                    '/authentic-thai-akha-recipes',
  '/classes':                    '/thai-cooking-classes-chiang-mai',
  '/cooking-class':              '/thai-cooking-classes-chiang-mai',
  '/morning-class':              '/morning-cooking-class-market-tour',
  '/evening-class':              '/evening-cooking-class-dinner',
  '/about-us':                   '/about-thai-akha-kitchen',
  '/contact':                    '/contact-cooking-school-chiang-mai',
  '/contact-us':                 '/contact-cooking-school-chiang-mai',
  '/booking':                    '/book-cooking-class-chiang-mai',
  '/location':                   '/free-pickup-location-chiang-mai',
  '/faq':                        '/cooking-class-faq-chiang-mai',
  '/terms-and-conditions':       '/booking-terms-conditions',
  '/policy-and-privacy':         '/privacy-policy',
  '/privacy':                    '/privacy-policy',
  // Legacy news articles
  '/thai-cooking-tips-news/the-art-of-thai-akha-spice-soft-to-warrior': '/thai-cooking-tips-news/thai-spice-levels-guide',
  '/thai-cooking-tips-news/how-to-prepare-cooking-class-chiang-mai':    '/thai-cooking-tips-news/prepare-thai-cooking-class-chiang-mai',
  '/thai-cooking-tips-news/how-the-class-works':                        '/thai-cooking-tips-news/how-thai-cooking-class-works',
  '/thai-cooking-tips-news/dietary-styles-and-customization':           '/thai-cooking-tips-news/vegan-vegetarian-thai-cooking-guide',
  '/thai-cooking-tips-news/cooking-with-food-allergies':                '/thai-cooking-tips-news/allergy-safe-thai-cooking-protocols',
  '/thai-cooking-tips-news/art-of-mortar-pestle':                       '/thai-cooking-tips-news/mortar-vs-blender-thai-curry-paste',
  '/thai-cooking-tips-news/local-market-tour-experience':               '/thai-cooking-tips-news/chiang-mai-local-market-tour-guide',
  '/thai-cooking-tips-news/free-pickup-zones-chiang-mai':               '/thai-cooking-tips-news/cooking-class-chiang-mai-pickup-map',
  '/thai-cooking-tips-news/niti-muelaeku-akha-chef':                    '/thai-cooking-tips-news/chef-niti-muelaeku-akha-heritage',
  '/thai-cooking-tips-news/6-reasons-to-join-thai-akha-kitchen':        '/thai-cooking-tips-news/best-cooking-school-chiang-mai-reasons',
  '/thai-cooking-tips-news/reducing-plastic-consumption-chiang-mai':    '/thai-cooking-tips-news/sustainable-cooking-zero-plastic-chiang-mai',
  '/thai-cooking-tips-news/vegan-akha-cooking':                         '/thai-cooking-tips-news/authentic-vegan-thai-cooking-chiang-mai',
  '/thai-cooking-tips-news/cookbook-and-certificate':                   '/thai-cooking-tips-news/thai-cooking-class-certificate-cookbook',
  // Legacy recipe slugs
  '/authentic-thai-akha-recipes/akha-salad':            '/authentic-thai-akha-recipes/authentic-akha-mountain-salad-recipe',
  '/authentic-thai-akha-recipes/akha-herbal-soup':      '/authentic-thai-akha-recipes/akha-spirit-detox-soup-recipe',
  '/authentic-thai-akha-recipes/pad-thai':              '/authentic-thai-akha-recipes/authentic-pad-thai-recipe-chiang-mai',
  '/authentic-thai-akha-recipes/mango-sticky-rice':     '/authentic-thai-akha-recipes/authentic-mango-sticky-rice-recipe',
  '/authentic-thai-akha-recipes/thai-red-curry':        '/authentic-thai-akha-recipes/authentic-thai-red-curry-recipe',
  '/authentic-thai-akha-recipes/thai-green-curry':      '/authentic-thai-akha-recipes/authentic-thai-green-curry-recipe',
  // Legacy history slugs
  '/akha-culture-highland-heritage/spirit-gate':        '/akha-culture-highland-heritage/sacred-akha-spirit-gate-meaning',
  '/akha-culture-highland-heritage/traditional-dress':  '/akha-culture-highland-heritage/traditional-akha-dress-silver',
  '/akha-culture-highland-heritage/swing-festival':     '/akha-culture-highland-heritage/akha-swing-festival-yehkuja',
};

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const path = url.pathname + url.search;
    const userAgent = (request.headers.get('User-Agent') || '').toLowerCase();

    // ── 301 Redirects for legacy slugs ──────────────────────────────────────
    const canonicalPath = REDIRECT_MAP[url.pathname];
    if (canonicalPath) {
      return new Response(null, {
        status: 301,
        headers: {
          'Location': `${SITE_URL}${canonicalPath}`,
          'Cache-Control': 'public, max-age=86400',
          'X-CF-Worker': 'active',
        },
      });
    }

    // ── 302: prefisso lingua non attivo ─────────────────────────────────────
    // Un primo segmento di 2 lettere è SEMPRE una lingua (nessuno slug reale è
    // di 2 lettere, verificato sul registro in tutte le 12 lingue). Se non è
    // una lingua ATTIVA si toglie CONSERVANDO il path: /xx/qualcosa → /qualcosa,
    // mai → / — chi cercava quella pagina deve trovarla, e a un crawler non
    // diciamo che il contenuto è sparito. Vale anche per /en/ (l'inglese vive
    // alla radice, senza prefisso, sempre).
    //
    // 302 e non 301, deliberatamente: malese e hindi arriveranno, e quando /ms/
    // si accenderà nessun crawler deve avere in cache un permanente da smontare.
    // Cache-Control no-store per lo stesso motivo.
    // Stessa regola di front (lib/langRouting.ts) e og-meta-tags (splitLangPath).
    const firstSegment = url.pathname.split('/').filter(Boolean)[0];
    if (firstSegment && TWO_LETTER.test(firstSegment)) {
      const candidate = firstSegment.toLowerCase();
      const i18nEnabled = env && env.I18N_ROUTES_ENABLED === 'true';
      const isActivePrefix = i18nEnabled && candidate !== DEFAULT_LANG && SUPPORTED_LANGS.includes(candidate);
      if (!isActivePrefix) {
        const rest = url.pathname.split('/').filter(Boolean).slice(1).join('/');
        return new Response(null, {
          status: 302,
          headers: {
            'Location': `${SITE_URL}/${rest}${url.search}`,
            'Cache-Control': 'no-store',
            'X-CF-Worker': 'active',
          },
        });
      }
    }

    if (url.pathname === '/debug-worker') {
      const isBot = SOCIAL_BOTS.some(bot => userAgent.includes(bot));
      return new Response(JSON.stringify({ worker: 'active', path, userAgent: request.headers.get('User-Agent'), isBot, timestamp: new Date().toISOString() }, null, 2), {
        headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store', 'X-CF-Worker': 'active' },
      });
    }

    if (url.pathname === '/robots.txt') {
      return new Response(
        'User-agent: *\nAllow: /\nDisallow: /user\nDisallow: /auth\nDisallow: /join-group\nDisallow: /user-dashboard\nDisallow: /user-menu\nDisallow: /user-quiz\nDisallow: /user-passport\nSitemap: https://www.thaiakha.com/sitemap.xml',
        { headers: { 'Content-Type': 'text/plain', 'Cache-Control': 'public, max-age=86400', 'X-CF-Worker': 'active' } }
      );
    }

    if (url.pathname === '/sitemap.xml') {
      const response = await fetch(SITEMAP_URL);
      const headers = new Headers(response.headers);
      headers.set('X-CF-Worker', 'active');
      return new Response(response.body, { status: response.status, headers });
    }

    if (url.pathname === '/llms.txt') {
      const response = await fetch(LLMS_TXT_URL);
      const headers = new Headers(response.headers);
      headers.set('X-CF-Worker', 'active');
      return new Response(response.body, { status: response.status, headers });
    }
    if (url.pathname === '/llms-full.txt') {
      const response = await fetch(`${LLMS_TXT_URL}?full=1`);
      const headers = new Headers(response.headers);
      headers.set('X-CF-Worker', 'active');
      return new Response(response.body, { status: response.status, headers });
    }

    const isBot = SOCIAL_BOTS.some(bot => userAgent.includes(bot));

    if (isBot) {
      const ogUrl = `${OG_FUNCTION_URL}?path=${encodeURIComponent(path)}`;
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000);
        const ogResponse = await fetch(ogUrl, {
          headers: { 'User-Agent': request.headers.get('User-Agent') || '', 'Accept': 'text/html' },
          signal: controller.signal,
        });
        clearTimeout(timeoutId);
        if (!ogResponse.ok) throw new Error(`Supabase error: ${ogResponse.status}`);
        const responseHeaders = new Headers(ogResponse.headers);
        responseHeaders.set('Cache-Control', `public, max-age=${CACHE_TTL}, stale-while-revalidate=${STALE_REVALIDATE}`);
        responseHeaders.set('Content-Type', 'text/html; charset=UTF-8');
        responseHeaders.set('X-Robots-Tag', 'index, follow');
        responseHeaders.set('X-CF-Worker', 'active');
        responseHeaders.delete('CF-Cache-Status');
        return new Response(ogResponse.body, { status: ogResponse.status, statusText: ogResponse.statusText, headers: responseHeaders });
      } catch (error) {
        return new Response(buildFallbackOGHtml(path), {
          status: 200,
          headers: { 'Content-Type': 'text/html; charset=UTF-8', 'Cache-Control': 'public, max-age=60, stale-while-revalidate=300', 'X-Robots-Tag': 'index, follow', 'X-OG-Fallback': 'true', 'X-CF-Worker': 'active' },
        });
      }
    }

    const upstreamResponse = await fetch(new Request(ORIGIN_URL + path, {
      method: request.method,
      headers: request.headers,
      body: request.body,
      redirect: 'follow',
    }));
    const headers = new Headers(upstreamResponse.headers);
    headers.set('X-CF-Worker', 'active');
    return new Response(upstreamResponse.body, { status: upstreamResponse.status, statusText: upstreamResponse.statusText, headers });
  },
};
