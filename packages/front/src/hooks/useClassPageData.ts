import { useState, useEffect, useMemo } from 'react';
import { contentService } from '@thaiakha/shared/services';
import { CookingClassDB } from '@thaiakha/shared';
import { useSEO } from './useSEO';
import { usePageSections } from './usePageSections';
import type { PageSectionData } from './usePageSections';
import type { GalleryItem } from '../components/modal';
import type { ClassSection } from '../components/classes/ClassSectionBlock';

/**
 * Shared data loader for the two cooking-class detail pages (Morning / Evening).
 * Morning and Evening differ only by a handful of slug/id strings — this hook
 * derives them from the `variant` and runs the identical Promise.all fetch,
 * so the pages stay free of duplicated loading logic.
 */
export type ClassVariant = 'morning' | 'evening';

interface ClassVariantConfig {
  slug: string;
  classId: string;
  galleryKeys: [string, string];
  pickupSectionId: string;
}

const CONFIG: Record<ClassVariant, ClassVariantConfig> = {
  morning: {
    slug: 'morning-cooking-class-market-tour',
    classId: 'morning_class',
    galleryKeys: ['class_morning_1', 'class_morning_2'],
    pickupSectionId: 'morning-06',
  },
  evening: {
    slug: 'evening-cooking-class-dinner',
    classId: 'evening_class',
    galleryKeys: ['class_evening_1', 'class_evening_2'],
    pickupSectionId: 'evening-06',
  },
};

const toItem = (g: { asset_id: string; image_url: string; title?: string; caption?: string }): GalleryItem => ({
  asset_id: g.asset_id,
  image_url: g.image_url,
  title: g.title,
  description: g.caption,
});

export interface ClassPageData {
  classData: CookingClassDB | null;
  gallery1: GalleryItem[];
  gallery2: GalleryItem[];
  pickupSection: PageSectionData | null;
  exclusionsSection: PageSectionData | null;
  /** Blocchi flusso classe (class_sections) assegnati a questa classe, per display_order. */
  classSections: ClassSection[];
  seoMetadata: ReturnType<typeof useSEO>['metadata'];
  /** Combined loading: data fetch OR SEO metadata still in flight. */
  loading: boolean;
}

export const useClassPageData = (variant: ClassVariant): ClassPageData => {
  const cfg = CONFIG[variant];
  const { metadata: seoMetadata, loading: seoLoading } = useSEO(cfg.slug);

  const [loading, setLoading] = useState(true);
  const [classData, setClassData] = useState<CookingClassDB | null>(null);
  const [gallery1, setGallery1] = useState<GalleryItem[]>([]);
  const [gallery2, setGallery2] = useState<GalleryItem[]>([]);
  const [classSections, setClassSections] = useState<ClassSection[]>([]);
  // Sezioni CMS pickup + esclusioni: una query, cache TanStack condivisa (#86 F1)
  const sectionIds = useMemo(() => [cfg.pickupSectionId, 'universal_exclusions'] as const, [cfg.pickupSectionId]);
  const { sections: pageSections, loading: sectionsLoading } = usePageSections(sectionIds);
  const pickupSection = pageSections[cfg.pickupSectionId] ?? null;
  const exclusionsSection = pageSections['universal_exclusions'] ?? null;

  useEffect(() => {
    let isMounted = true;
    const load = async () => {
      setLoading(true);
      try {
        const [classes, gal1, gal2, sections] = await Promise.all([
          contentService.getCookingClasses(),
          contentService.getGallery(cfg.galleryKeys[0]),
          contentService.getGallery(cfg.galleryKeys[1]),
          contentService.getClassSections(cfg.classId),
        ]);
        if (!isMounted) return;

        setClassData(classes.find((c: CookingClassDB) => c.id === cfg.classId) ?? null);
        setGallery1(gal1.map(toItem));
        setGallery2(gal2.map(toItem));
        setClassSections(sections as unknown as ClassSection[]);
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    load();
    return () => { isMounted = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- cfg is derived from variant (static CONFIG lookup)
  }, [variant]);

  return {
    classData,
    gallery1,
    gallery2,
    pickupSection,
    exclusionsSection,
    classSections,
    seoMetadata,
    loading: loading || seoLoading || sectionsLoading,
  };
};
