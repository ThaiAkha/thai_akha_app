import { useState, useEffect, useMemo } from 'react';
import { contentService } from '@thaiakha/shared/services';
import { CultureSectionDetail, CultureGalleryItem, CultureSection } from '@thaiakha/shared/types';

export function useCultureDetail(
  slug: string, 
  sections: CultureSection[]
) {
  const [section, setSection] = useState<CultureSectionDetail | null>(null);
  const [galleryItems, setGalleryItems] = useState<CultureGalleryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  
  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        setLoading(true);
        setError(false);
        
        // Fetch full detail and gallery in parallel
        const [detail, gallery] = await Promise.all([
          contentService.getCultureSectionBySlug(slug),
          contentService.getCultureGallery(slug)
        ]);
        
        if (!mounted) return;
        
        if (!detail) { 
          setError(true); 
          return; 
        }
        
        setSection(detail);
        setGalleryItems(gallery);
      } catch (e) {
        console.error('useCultureDetail load error', e);
        if (mounted) setError(true);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    if (slug) {
      load();
    }
    
    return () => { mounted = false; };
  }, [slug]);

  const { previous, next } = useMemo(() => {
    const idx = sections.findIndex(s => s.slug === slug);
    if (idx === -1 || sections.length === 0) return { previous: null, next: null };
    return {
      previous: idx > 0 ? sections[idx - 1] : null,
      next: idx < sections.length - 1 ? sections[idx + 1] : null,
    };
  }, [slug, sections]);

  return {
    section,
    galleryItems,
    previous,
    next,
    loading,
    error
  };
}
