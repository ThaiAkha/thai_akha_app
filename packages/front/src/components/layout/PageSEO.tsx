import React, { useEffect } from 'react';

interface PageSEOProps {
  title: string;
  description: string;
  canonical: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  ogType?: 'website' | 'article' | 'profile';
  twitterImage?: string;
  jsonLd?: object;
  /** Per-article hreflang map, e.g. { "en": "https://www.thaiakha.com/..." }.
   *  When provided, PageSEO injects the article-specific alternate links.
   *  SEOHead skips hreflang injection on sub-pages, so there is no duplication. */
  hreflang?: Record<string, string>;
}

export const PageSEO: React.FC<PageSEOProps> = ({
  title,
  description,
  canonical,
  ogTitle,
  ogDescription,
  ogImage,
  ogType = 'website',
  twitterImage,
  jsonLd,
  hreflang,
}) => {
  useEffect(() => {
    // 1. Update Document Title
    document.title = title;

    // Helper per settare meta tags senza duplicarli
    const setMeta = (attr: string, key: string, value: string) => {
      let el = document.querySelector(`meta[${attr}="${key}"]`);
      if (!el) {
        el = document.createElement('meta');
        el.setAttribute(attr, key);
        document.head.appendChild(el);
      }
      el.setAttribute('content', value);
    };

    // 2. SEO e Open Graph
    setMeta('name', 'description', description);
    setMeta('property', 'og:title', ogTitle || title);
    setMeta('property', 'og:description', ogDescription || description);
    setMeta('property', 'og:type', ogType);
    if (ogImage) setMeta('property', 'og:image', ogImage);
    setMeta('property', 'og:url', canonical);

    // Twitter Cards (usiamo i metadati base per compatibilità estesa)
    setMeta('name', 'twitter:card', 'summary_large_image');
    setMeta('name', 'twitter:title', ogTitle || title);
    setMeta('name', 'twitter:description', ogDescription || description);
    if (twitterImage || ogImage) {
      setMeta('name', 'twitter:image', twitterImage || ogImage!);
    }

    // 3. Canonical Link
    let canonEl = document.querySelector('link[rel="canonical"]');
    if (!canonEl) {
      canonEl = document.createElement('link');
      canonEl.setAttribute('rel', 'canonical');
      document.head.appendChild(canonEl);
    }
    canonEl.setAttribute('href', canonical);

    // 4. Iniezione JSON-LD (Schema.org strutturato per AI/Search)
    if (jsonLd) {
      document.querySelector('script[data-page-ld]')?.remove();
      const script = document.createElement('script');
      script.type = 'application/ld+json';
      script.setAttribute('data-page-ld', 'true');
      script.text = JSON.stringify(jsonLd);
      document.head.appendChild(script);
    }

    // 5. Inject article-level hreflang alternate links (SEOHead skips these on sub-pages)
    document.querySelectorAll('link[rel="alternate"][data-page-hreflang]').forEach(el => el.remove());
    if (hreflang && typeof hreflang === 'object') {
      Object.entries(hreflang).forEach(([lang, href]) => {
        const el = document.createElement('link');
        el.setAttribute('rel', 'alternate');
        el.setAttribute('hreflang', lang);
        el.setAttribute('href', href);
        el.setAttribute('data-page-hreflang', 'true');
        document.head.appendChild(el);
      });
      // x-default → canonical URL if not already specified
      if (canonical && !hreflang['x-default']) {
        const elDefault = document.createElement('link');
        elDefault.setAttribute('rel', 'alternate');
        elDefault.setAttribute('hreflang', 'x-default');
        elDefault.setAttribute('href', canonical);
        elDefault.setAttribute('data-page-hreflang', 'true');
        document.head.appendChild(elDefault);
      }
    }

    // Unmount cleanup targetizzato
    return () => {
      document.querySelector('script[data-page-ld]')?.remove();
      document.querySelectorAll('link[rel="alternate"][data-page-hreflang]').forEach(el => el.remove());
    };
  }, [title, description, ogTitle, ogDescription, canonical, ogImage, ogType, twitterImage, jsonLd, hreflang]);

  // Questo componente non ha interfaccia grafica
  return null;
};

export default PageSEO;
