import { useMemo } from 'react';
import { useQuery } from '@thaiakha/shared/query';
import { contentService } from '@thaiakha/shared/services';
import { CookingClassDB } from '@thaiakha/shared';
import { usePageMetadata } from './usePageMetadata';
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
  /**
   * Metadata header della pagina (site_metadata). Serve a PageLayout in modalita'
   * progressiva: senza `customMetadata` il suo self-fetch si spegne e lo sfondo
   * cade sull'immagine di default.
   *
   * Sostituisce il vecchio `seoMetadata` da `useSEO`, che NESSUNA delle due pagine
   * consumava: il suo `loading` bloccava la pagina per un dato che veniva scartato.
   * Il SEO vero lo fa SEOHead, globale e slug-based.
   */
  pageMetadata: ReturnType<typeof usePageMetadata>['metadata'];
  /** Combined loading: dati della classe, metadata header o sezioni ancora in volo. */
  loading: boolean;
}

/** Vuoti stabili: un `[]` inline creerebbe un riferimento nuovo a ogni render. */
const NO_ITEMS: GalleryItem[] = [];
const NO_SECTIONS: ClassSection[] = [];

export const classPageDataQueryKey = (variant: ClassVariant) => ['class_page_data', variant] as const;

export const useClassPageData = (variant: ClassVariant): ClassPageData => {
  const cfg = CONFIG[variant];
  const { metadata: pageMetadata, loading: metadataLoading } = usePageMetadata(cfg.slug);
  // Sezioni CMS pickup + esclusioni: una query, cache TanStack condivisa (#86 F1)
  const sectionIds = useMemo(() => [cfg.pickupSectionId, 'universal_exclusions'] as const, [cfg.pickupSectionId]);
  const { sections: pageSections, loading: sectionsLoading } = usePageSections(sectionIds);

  // Data layer unico (CLAUDE.md #17): era `useEffect + useState + isMounted`, l'ultimo
  // fetch a mano di questa pagina. Stesse quattro chiamate, in una query sola per variante.
  const query = useQuery({
    queryKey: classPageDataQueryKey(variant),
    queryFn: async () => {
      const [classes, gal1, gal2, sections] = await Promise.all([
        contentService.getCookingClasses(),
        contentService.getGallery(cfg.galleryKeys[0]),
        contentService.getGallery(cfg.galleryKeys[1]),
        contentService.getClassSections(cfg.classId),
      ]);
      return {
        classData: classes.find((c: CookingClassDB) => c.id === cfg.classId) ?? null,
        gallery1: gal1.map(toItem),
        gallery2: gal2.map(toItem),
        classSections: sections as unknown as ClassSection[],
      };
    },
  });

  return {
    classData: query.data?.classData ?? null,
    gallery1: query.data?.gallery1 ?? NO_ITEMS,
    gallery2: query.data?.gallery2 ?? NO_ITEMS,
    pickupSection: pageSections[cfg.pickupSectionId] ?? null,
    exclusionsSection: pageSections['universal_exclusions'] ?? null,
    classSections: query.data?.classSections ?? NO_SECTIONS,
    pageMetadata,
    loading: query.isPending || metadataLoading || sectionsLoading,
  };
};
