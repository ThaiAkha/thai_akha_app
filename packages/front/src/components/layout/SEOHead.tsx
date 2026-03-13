import React, { useEffect, useState } from 'react';
import { useSEO } from '../../hooks/useSEO';

/**
 * Component to manage the <head> tags (SEO & Social) using native DOM manipulation.
 * This is used as a lightweight alternative to react-helmet-async.
 */
export const SEOHead: React.FC = () => {
  const [slug, setSlug] = useState('home');
  
  // Deriviamo lo slug dal path (es: '/classes' -> 'classes' o '/' -> 'home')
  const getSlugFromPath = () => {
    const path = window.location.pathname.split('/')[1];
    return path || 'home';
  };

  useEffect(() => {
    // Aggiorna lo slug inizialmente
    setSlug(getSlugFromPath());

    // Ascolta i cambiamenti di navigazione tramite l'evento popstate
    const handlePopState = () => {
      setSlug(getSlugFromPath());
    };

    // Aggiungi listener globale
    window.addEventListener('popstate', handlePopState);
    
    // Patch per intercettare pushState (perché pushState non scatena popstate)
    const originalPushState = window.history.pushState;
    window.history.pushState = function(...args) {
      originalPushState.apply(this, args);
      setSlug(getSlugFromPath());
    };

    return () => {
      window.removeEventListener('popstate', handlePopState);
      window.history.pushState = originalPushState;
    };
  }, []);

  const { metadata, loading } = useSEO(slug);

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

    // 3. Helper to manage link tags (canonical)
    const updateOrCreateLink = (rel: string, href: string) => {
      let element = document.querySelector(`link[rel="${rel}"]`);
      if (!element) {
        element = document.createElement('link');
        element.setAttribute('rel', rel);
        document.head.appendChild(element);
      }
      element.setAttribute('href', href);
    };

    // 4. Update Meta Tags
    updateOrCreateMeta('description', metadata.seo_description);
    if (metadata.seo_keywords && metadata.seo_keywords.length > 0) {
      updateOrCreateMeta('keywords', metadata.seo_keywords.join(', '));
    }
    updateOrCreateMeta('robots', metadata.seo_robots);

    // 5. Update OpenGraph (Social)
    updateOrCreateMeta('og:title', metadata.og_title || metadata.seo_title, true);
    updateOrCreateMeta('og:description', metadata.seo_description, true);
    updateOrCreateMeta('og:image', metadata.og_image, true);
    updateOrCreateMeta('og:type', 'website', true);

    // 6. Update Canonical
    if (metadata.canonical_url) {
      updateOrCreateLink('canonical', metadata.canonical_url);
    }

    // 7. Update JSON-LD (Structured Data)
    // Remove any existing SEO JSON-LD scripts
    const existingScripts = document.querySelectorAll('script[data-seo-json-ld="true"]');
    existingScripts.forEach(script => script.remove());

    if (metadata.json_ld && Object.keys(metadata.json_ld).length > 0) {
      const script = document.createElement('script');
      script.type = 'application/ld+json';
      script.setAttribute('data-seo-json-ld', 'true');
      script.text = JSON.stringify(metadata.json_ld);
      document.head.appendChild(script);
    }

  }, [metadata, loading]);

  // This component doesn't render anything in the UI
  return null;
};

export default SEOHead;
