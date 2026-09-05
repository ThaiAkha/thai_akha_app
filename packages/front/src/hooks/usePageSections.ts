/**
 * usePageSections - UNICO hook per le intestazioni CMS `page_sections` (#86 F1).
 *
 * Sostituisce useHomePageSections / useClassesPageSections / useQuizPageSections /
 * useRecipeSingleSections / usePageSection: stessa SELECT (newsService.getPageSections),
 * una sola query Supabase per gruppo di id, cache e dedup gestiti da TanStack Query
 * (niente Map a livello modulo, niente `let cancelled`, StrictMode non raddoppia).
 *
 * Usage:
 *   const { sections, loading } = usePageSections(HOME_SECTION_IDS, { metadataSlug: 'home' });
 *   sections['home_01']  // PageSectionData | null (tipizzato sugli id passati)
 *
 *   const { section, loading } = usePageSection('universal_cherry');
 */

import { useMemo } from 'react';
import { useQuery } from '@thaiakha/shared/query';
import { newsService } from '@thaiakha/shared/services';
import { useLanguage } from '../context/LanguageContext';
import { usePageMetadata, type PageMetadata } from './usePageMetadata';

// ─── Types ───────────────────────────────────────────────────────────────────

/** Card CMS dentro page_sections.cards (jsonb): renderizzata come StatCard. */
export interface PageSectionCard {
  title: string;
  description: string;
  /** Colore StatCard (primary | action | quiz | ...) - validare con toStatCardColor. */
  variant: string;
}

export interface PageSectionData {
  section_id: string;
  title: string;
  subtitle: string | null;
  description: string | null;
  highlight: string | null;
  tag_badge: string | null;
  // CMS Dynamic Data
  image_asset_id?: string;
  button_text?: string;
  button_link_url?: string;
  open_in_new_tab?: boolean;
  /** Domanda-seme per il pulsante Ask Cherry (entry point chat). */
  cherry_prompt?: string | null;
  /** Risposta preset zero-latency / contesto per la chat. */
  cherry_response?: string | null;
  /** Checklist (array di stringhe) - jsonb. */
  bullets?: string[] | null;
  /** Stat card CMS - jsonb array. */
  cards?: PageSectionCard[] | null;
  /** Id YouTube del video della sezione (gemello di image/audio_asset_id). #117 */
  youtube_video_id?: string | null;
}

/** Metadata di pagina (site_metadata): stesso tipo/chiave di usePageMetadata. */
export type { PageMetadata };

// ── StatCard color mapping (variant DB → colore StatCard, fallback 'primary') ──
const STAT_CARD_COLORS = [
  'primary', 'secondary', 'action', 'success', 'warning',
  'error', 'info', 'default', 'quiz', 'transparent',
] as const;
export type StatCardColor = (typeof STAT_CARD_COLORS)[number];

export function toStatCardColor(variant: string | null | undefined): StatCardColor {
  return (STAT_CARD_COLORS as readonly string[]).includes(variant ?? '')
    ? (variant as StatCardColor)
    : 'primary';
}

// ─── Registro id per pagina ──────────────────────────────────────────────────

export const HOME_SECTION_IDS = [
  'home_01', 'home_02', 'home_03', 'home_04', 'home_05', 'home_06',
] as const;
export type HomeSectionId = (typeof HOME_SECTION_IDS)[number];

export const CLASSES_SECTION_IDS = [
  'class-00', 'class-01', 'class-02', 'class-03', 'class-04', 'class-05', 'class-06',
] as const;
export type ClassesSectionId = (typeof CLASSES_SECTION_IDS)[number];

export const RECIPE_SINGLE_SECTION_IDS = [
  'recipe_single_description',
  'recipe_single_ingredients',
  'recipe_single_directions',
  'recipe_single_culture_story',
  'recipe_single_health',
  'recipe_single_gallery',
  'recipe_single_essentials',
  'recipe_single_author_note',
  'recipe_single_ask_cherry',
] as const;
export type RecipeSingleSectionId = (typeof RECIPE_SINGLE_SECTION_IDS)[number];

// ─── Query keys ──────────────────────────────────────────────────────────────

/** Firma stabile di un set di id (ordinata: stesso set, stesso ordine = stessa cache). */
export const pageSectionsSignature = (ids: readonly string[]) => [...ids].sort().join(',');

export const pageSectionsQueryKey = (ids: readonly string[]) =>
  ['page_sections', pageSectionsSignature(ids)] as const;


// ─── Hook ────────────────────────────────────────────────────────────────────

export interface UsePageSectionsOptions {
  /** Slug site_metadata da caricare in parallelo (es. 'home'): `loading` copre entrambe le query. */
  metadataSlug?: string;
  /** false = nessuna query (es. componente in modalita' controllata che riceve i dati dal padre). Default true. */
  enabled?: boolean;
}

export interface UsePageSectionsResult<Id extends string> {
  /** Sempre completo sugli id richiesti: `null` per le sezioni assenti nel DB. */
  sections: Record<Id, PageSectionData | null>;
  /** null se `metadataSlug` non e' passato o non trovato. */
  metadata: PageMetadata | null;
  loading: boolean;
  error: Error | null;
}

function emptySections<Id extends string>(ids: readonly Id[]): Record<Id, PageSectionData | null> {
  return ids.reduce((acc, id) => { acc[id] = null; return acc; }, {} as Record<Id, PageSectionData | null>);
}

export function usePageSections<Id extends string>(
  ids: readonly Id[],
  options: UsePageSectionsOptions = {},
): UsePageSectionsResult<Id> {
  const { metadataSlug, enabled = true } = options;
  const idsSig = pageSectionsSignature(ids);
  const sectionsEnabled = enabled && ids.length > 0;
  const metadataEnabled = enabled && Boolean(metadataSlug);

  // La lingua entra nella CHIAVE, non solo nella query: senza, il cambio lingua
  // riuserebbe la cache inglese e la pagina resterebbe in inglese finche' non
  // scade (bug che si vede solo cambiando lingua due volte di seguito).
  const { lang } = useLanguage();

  const sectionsQuery = useQuery({
    queryKey: ['page_sections', lang, idsSig] as const,
    queryFn: () => newsService.getPageSections<PageSectionData>(ids, lang),
    enabled: sectionsEnabled,
  });

  const metadataQuery = usePageMetadata(metadataSlug, { enabled: metadataEnabled });

  const sections = useMemo(() => {
    // Ricostruisce gli id dalla firma: cosi' la dipendenza e' una stringa stabile
    // e un nuovo array con gli stessi id non ricalcola nulla.
    const wanted = (idsSig ? idsSig.split(',') : []) as Id[];
    const map = emptySections(wanted);
    for (const row of sectionsQuery.data ?? []) {
      if (Object.prototype.hasOwnProperty.call(map, row.section_id)) map[row.section_id as Id] = row;
    }
    return map;
  }, [sectionsQuery.data, idsSig]);

  const sectionsLoading = sectionsEnabled && sectionsQuery.isPending;
  const metadataLoading = metadataQuery.loading;
  const rawError = sectionsQuery.error;

  return {
    sections,
    metadata: metadataQuery.metadata,
    loading: sectionsLoading || metadataLoading,
    error: rawError instanceof Error ? rawError : rawError ? new Error(String(rawError)) : null,
  };
}

/** Comodita' per UNA sola sezione (stessa query/cache di usePageSections). */
export function usePageSection(
  sectionId: string,
  options: Pick<UsePageSectionsOptions, 'enabled'> = {},
): {
  section: PageSectionData | null;
  loading: boolean;
} {
  const ids = useMemo(() => [sectionId] as const, [sectionId]);
  const { sections, loading } = usePageSections(ids, options);
  return { section: sections[sectionId] ?? null, loading };
}

export default usePageSections;
