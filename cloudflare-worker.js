/**
 * Cloudflare Worker — OG Meta-Tags Injection for Social Bots
 * CONFIGURED FOR: thaiakha.com
 * EDGE FUNCTION: https://mtqullobcsypkqgdkaob.functions.supabase.co/og-meta-tags
 */

const SOCIAL_BOTS = [
  'facebookexternalhit',
  'whatsapp',
  'twitterbot',
  'tweetmemebot',
  'linkedinbot',
  'slurp',
  'bingbot',
  'googlebot',
  'baiduspider',
  'yandexbot',
  'applebot',
  'pinterestbot',
  'tumblr',
  'telegrambot',
  'ig_nativemobile',
  'tiktok',
  'perplexitybot',
  'chatgpt-user',
  'discordbot',
];

const OG_FUNCTION_URL = 'https://mtqullobcsypkqgdkaob.functions.supabase.co/og-meta-tags';
const ORIGIN_URL = 'https://thai-akha-front.web.app';

export default {
  async fetch(request, env) {
    const userAgent = request.headers.get('User-Agent') || '';
    const url = new URL(request.url);

    const isSocialBot = SOCIAL_BOTS.some(bot =>
      userAgent.toLowerCase().includes(bot.toLowerCase())
    );

    if (isSocialBot) {
      const path = url.pathname + url.search;
      const ogUrl = `${OG_FUNCTION_URL}?path=${encodeURIComponent(path)}`;

      try {
        const ogResponse = await fetch(ogUrl);
        const cacheHeaders = new Headers(ogResponse.headers);
        cacheHeaders.set('Cache-Control', 'public, max-age=3600');
        return new Response(ogResponse.body, {
          status: ogResponse.status,
          statusText: ogResponse.statusText,
          headers: cacheHeaders,
        });
      } catch (error) {
        // Fallback to origin
      }
    }

    // Serve from Firebase origin directly (avoids Worker loop)
    const originRequest = new Request(
      ORIGIN_URL + url.pathname + url.search,
      request
    );
    return fetch(originRequest);
  },
};
