import { useState, useEffect } from 'react';
import { seoService, PageMetadata } from '@thaiakha/shared';

/**
 * Hook to manage SEO metadata state for a specific page slug.
 *
 * @param slug The page identifier — SEMPRE lo slug INGLESE (identità DB).
 *             La traduzione dell'URL la fa il router prima di arrivare qui.
 * @param lang Lingua da servire: 'en' legge la base, le altre fondono il sidecar
 *             campo per campo (vedi lib/mergeTranslation.ts).
 * @returns { metadata, loading } SEO metadata and loading state
 */
export const useSEO = (slug: string, lang: string = 'en') => {
  const [metadata, setMetadata] = useState<PageMetadata | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const fetchSEO = async () => {
      setLoading(true);
      try {
        const data = await seoService.getMetadataForSlug(slug, 'site_metadata', lang);
        if (isMounted) {
          setMetadata(data);
        }
      } catch (error) {
        console.error(`[SEO] Failed to fetch metadata for slug: ${slug}`, error);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchSEO();

    return () => {
      isMounted = false;
    };
  }, [slug, lang]);

  return { metadata, loading };
};
