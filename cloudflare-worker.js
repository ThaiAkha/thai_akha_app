/**
 * Cloudflare Worker — OG Meta-Tags Injection for Social Bots
 *
 * This worker intercepts requests from social media crawlers (Facebook, WhatsApp,
 * Twitter, LinkedIn, etc.) and routes them to a Supabase Edge Function that
 * injects Open Graph meta-tags into the HTML response.
 *
 * For regular users, the React app is served normally.
 */

// Social media bots to intercept (case-insensitive)
const SOCIAL_BOTS = [
  'facebookexternalhit',     // Facebook
  'whatsapp',                // WhatsApp (includes link previews)
  'twitterbot',              // Twitter/X
  'tweetmemebot',            // Twitter old
  'linkedinbot',             // LinkedIn
  'slurp',                   // Yahoo Slurp
  'bingbot',                 // Bing
  'googlebot',               // Google (optional, usually doesn't need OG)
  'baiduspider',             // Baidu
  'yandexbot',               // Yandex
  'applebot',                // Apple Siri
  'pinterestbot',            // Pinterest
  'tumblr',                  // Tumblr
  'telegrambot',             // Telegram
  'ig_nativemobile',         // Instagram
  'tiktok',                  // TikTok
];

// Edge Function endpoint (Supabase)
const OG_FUNCTION_URL = 'https://YOUR_SUPABASE_PROJECT.functions.supabase.co/og-meta-tags';

export default {
  async fetch(request, env) {
    const userAgent = request.headers.get('User-Agent') || '';
    const url = new URL(request.url);

    // Check if request is from a social bot
    const isSocialBot = SOCIAL_BOTS.some(bot =>
      userAgent.toLowerCase().includes(bot.toLowerCase())
    );

    console.log(`[CF-Worker] User-Agent: ${userAgent}`);
    console.log(`[CF-Worker] Is Social Bot: ${isSocialBot}`);
    console.log(`[CF-Worker] Path: ${url.pathname}`);

    if (isSocialBot) {
      // 1. Route bot to Edge Function for OG meta-tag injection
      const path = url.pathname + url.search;
      const ogUrl = `${OG_FUNCTION_URL}?path=${encodeURIComponent(path)}`;

      console.log(`[CF-Worker] Routing bot to: ${ogUrl}`);

      try {
        const ogResponse = await fetch(ogUrl);

        // Cache the response at edge for 1 hour
        const cacheHeaders = new Headers(ogResponse.headers);
        cacheHeaders.set('Cache-Control', 'public, max-age=3600');

        return new Response(ogResponse.body, {
          status: ogResponse.status,
          statusText: ogResponse.statusText,
          headers: cacheHeaders,
        });
      } catch (error) {
        console.error(`[CF-Worker] Error fetching OG meta-tags: ${error}`);
        // Fallback: serve regular app if OG function fails
        return fetch(request);
      }
    }

    // 2. For regular users, serve the React app normally
    return fetch(request);
  },
};
