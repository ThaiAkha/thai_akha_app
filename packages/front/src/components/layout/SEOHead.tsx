import React, { useEffect, useState } from 'react';
import { useSEO } from '../../hooks/useSEO';
import { LEGACY_TOP_SLUGS } from '../../lib/pageSlugs';

// ─── JSON-LD sanitization ─────────────────────────────────────────────────────

/** Strip HTML tags and decode basic entities from a string (for schema.org plain text fields) */
function stripHtml(html: string): string {
  return html
    .replace(/<[^>]*>/g, '')          // remove all tags
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Deep-clone jsonLd and strip HTML from FAQPage acceptedAnswer.text fields.
 * schema.org requires plain text in acceptedAnswer — <a> tags are invalid.
 */
function sanitizeJsonLd(jsonLd: Record<string, unknown>): Record<string, unknown> {
  // Clone to avoid mutating cached metadata
  const cloned = JSON.parse(JSON.stringify(jsonLd)) as Record<string, unknown>;

  const graph = cloned['@graph'];
  if (!Array.isArray(graph)) return cloned;

  cloned['@graph'] = graph.map((node: unknown) => {
    const n = node as Record<string, unknown>;
    if (n['@type'] !== 'FAQPage') return n;

    const entities = n.mainEntity;
    if (!Array.isArray(entities)) return n;

    n.mainEntity = entities.map((qa: unknown) => {
      const q = qa as Record<string, unknown>;
      const answer = q.acceptedAnswer as Record<string, unknown> | undefined;
      if (answer && typeof answer.text === 'string') {
        answer.text = stripHtml(answer.text);
      }
      return q;
    });
    return n;
  });

  return cloned;
}

// Default OG image (Supabase storage) — same as Edge Function fallback
const OG_DEFAULT_IMAGE = 'https://mtqullobcsypkqgdkaob.supabase.co/storage/v1/object/public/showcase/og-default.jpg';

/**
 * Component to manage the <head> tags (SEO & Social) using native DOM manipulation.
 * This is used as a lightweight alternative to react-helmet-async.
 */
export const SEOHead: React.FC = () => {
  // Deriviamo lo slug (normalizzato via LEGACY_TOP_SLUGS: /recipes → authentic-thai-akha-recipes,
  // stessa mappa del routing in App.tsx) e se siamo su una sotto-pagina (article, ricetta, ecc.)
  const getPathInfo = () => {
    const segments = window.location.pathname.split('/').filter(Boolean);
    const raw = segments[0] || 'home';
    return { slug: LEGACY_TOP_SLUGS[raw] ?? raw, hasSubPage: segments.length > 1 };
  };

  const [pathInfo, setPathInfo] = useState<{ slug: string; hasSubPage: boolean }>(getPathInfo);

  useEffect(() => {
    setPathInfo(getPathInfo());

    const handleNavigation = () => setPathInfo(getPathInfo());

    window.addEventListener('popstate', handleNavigation);

    // Patch per intercettare pushState (perché pushState non scatena popstate)
    const originalPushState = window.history.pushState;
    window.history.pushState = function(...args) {
      originalPushState.apply(this, args);
      handleNavigation();
    };

    return () => {
      window.removeEventListener('popstate', handleNavigation);
      window.history.pushState = originalPushState;
    };
  }, []);

  const { metadata, loading } = useSEO(pathInfo.slug);

  useEffect(() => {
    if (loading || !metadata) return;

    // 1. Update Title
    document.title = metadata.seo_title;

    // 2. Helper to manage meta tags
    const updateOrCreateMeta = (nameOrProperty: string, content: string, isProperty = false) => {
      const attr = isProperty ? 'property' : 'name';
      let element = document.querySelector(`meta[${attr}="${nameOrProperty}"]`);
      
      if (!element) {
        element = document.createElement('meta');
        element.setAttribute(attr, nameOrProperty);
        document.head.appendChild(element);
      }
      element.setAttribute('content', content);
    };

    // 3. Helper to manage link tags (canonical, hreflang)
    const updateOrCreateLink = (rel: string, href: string, hreflang?: string) => {
      const selector = hreflang
        ? `link[rel="${rel}"][hreflang="${hreflang}"]`
        : `link[rel="${rel}"]`;
      let element = document.querySelector(selector);
      if (!element) {
        element = document.createElement('link');
        element.setAttribute('rel', rel);
        if (hreflang) element.setAttribute('hreflang', hreflang);
        document.head.appendChild(element);
      }
      element.setAttribute('href', href);
    };

    // 3b. Remove stale hreflang links from previous page before re-injecting
    document.querySelectorAll('link[rel="alternate"][data-seo-hreflang]').forEach(el => el.remove());

    // 4. Update Meta Tags
    updateOrCreateMeta('description', metadata.seo_description);
    if (metadata.seo_keywords && metadata.seo_keywords.length > 0) {
      updateOrCreateMeta('keywords', metadata.seo_keywords.join(', '));
    }
    updateOrCreateMeta('robots', metadata.seo_robots);

    // 5. Update OpenGraph (Social)
    // Canonical URL fallback: use DB value, else current window URL (never "undefined")
    const canonicalUrl = metadata.canonical_url || window.location.href;
    const ogImage = metadata.og_image || OG_DEFAULT_IMAGE;
    const isWebp = ogImage.endsWith('.webp');

    updateOrCreateMeta('og:title', metadata.og_title || metadata.seo_title, true);
    updateOrCreateMeta('og:description', metadata.og_description || metadata.seo_description, true);
    updateOrCreateMeta('og:image', ogImage, true);
    updateOrCreateMeta('og:image:width', '1920', true);
    updateOrCreateMeta('og:image:height', '1080', true);
    updateOrCreateMeta('og:image:type', isWebp ? 'image/webp' : 'image/jpeg', true);
    updateOrCreateMeta('og:image:alt', metadata.og_title || metadata.seo_title, true);
    updateOrCreateMeta('og:type', metadata.og_type || 'website', true);
    updateOrCreateMeta('og:url', canonicalUrl, true);
    updateOrCreateMeta('og:site_name', 'Thai Akha Kitchen', true);
    updateOrCreateMeta('og:locale', 'en_US', true);
    updateOrCreateMeta('fb:app_id', '1885423361488207', true);

    // 5b. Twitter Card
    updateOrCreateMeta('twitter:card', metadata.twitter_card || 'summary_large_image');
    updateOrCreateMeta('twitter:title', metadata.og_title || metadata.seo_title);
    updateOrCreateMeta('twitter:description', metadata.og_description || metadata.seo_description);
    updateOrCreateMeta('twitter:image', ogImage);
    updateOrCreateMeta('twitter:site', '@thaiakhakitchen');

    // 6. Update Canonical — always set, fallback to current URL
    updateOrCreateLink('canonical', canonicalUrl);

    // 6b. Inject hreflang alternate links — only on top-level pages (not sub-pages/articles).
    // On article pages (hasSubPage=true), PageSEO handles hreflang with article-specific URLs.
    if (!pathInfo.hasSubPage && metadata.hreflang && typeof metadata.hreflang === 'object') {
      Object.entries(metadata.hreflang).forEach(([lang, href]) => {
        const el = document.createElement('link');
        el.setAttribute('rel', 'alternate');
        el.setAttribute('hreflang', lang);
        el.setAttribute('href', href);
        el.setAttribute('data-seo-hreflang', 'true');
        document.head.appendChild(el);
      });
      // Also inject x-default pointing to the canonical URL
      if (metadata.canonical_url && !metadata.hreflang['x-default']) {
        const elDefault = document.createElement('link');
        elDefault.setAttribute('rel', 'alternate');
        elDefault.setAttribute('hreflang', 'x-default');
        elDefault.setAttribute('href', metadata.canonical_url);
        elDefault.setAttribute('data-seo-hreflang', 'true');
        document.head.appendChild(elDefault);
      }
    }

    // 7. Update JSON-LD (Structured Data)
    // Remove any existing SEO JSON-LD scripts first (cleanup on every navigation)
    const existingScripts = document.querySelectorAll('script[data-seo-json-ld="true"]');
    existingScripts.forEach(script => script.remove());

    // On sub-pages (articles, recipes, etc.) PageSEO injects the article-specific JSON-LD.
    // SEOHead must NOT inject the parent CollectionPage JSON-LD on those pages — that would
    // create duplicate @graph scripts and confuse Google's structured data parser (J01 fail).
    if (!pathInfo.hasSubPage && metadata.json_ld && Object.keys(metadata.json_ld).length > 0) {
      const script = document.createElement('script');
      script.type = 'application/ld+json';
      script.setAttribute('data-seo-json-ld', 'true');
      // sanitizeJsonLd strips <a> tags from FAQPage acceptedAnswer.text — schema.org requires plain text
      script.text = JSON.stringify(sanitizeJsonLd(metadata.json_ld));
      document.head.appendChild(script);
    }

  }, [metadata, loading]);

  // This component doesn't render anything in the UI
  return null;
};

export default SEOHead;
