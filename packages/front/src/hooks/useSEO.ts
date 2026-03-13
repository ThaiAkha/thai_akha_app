import { useState, useEffect } from 'react';
import { seoService, PageMetadata } from '@thaiakha/shared';

/**
 * Hook to manage SEO metadata state for a specific page slug.
 * 
 * @param slug The page identifier (e.g., 'home', 'classes', 'recipes')
 * @returns { metadata, loading } SEO metadata and loading state
 */
export const useSEO = (slug: string) => {
  const [metadata, setMetadata] = useState<PageMetadata | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const fetchSEO = async () => {
      setLoading(true);
      try {
        const data = await seoService.getMetadataForSlug(slug);
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
  }, [slug]);

  return { metadata, loading };
};
