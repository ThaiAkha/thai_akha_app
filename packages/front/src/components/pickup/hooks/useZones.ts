import { useQuery } from '@thaiakha/shared/query';
import { supabase } from '@thaiakha/shared/lib/supabase';
import { GEOJSON_MASTER } from '@thaiakha/shared/data';
import { sidecarJoin, sidecarFilter, mergeSidecarRows } from '@thaiakha/shared/lib/mergeTranslation';
import type { PickupZone } from '@thaiakha/shared/types';
import { mergeZonesWithGeoJson, type Zone } from '../utils/locationHelpers';
import { useLanguage } from '../../../context/LanguageContext';

/** Campi di CONTENUTO del sidecar zone. */
const PICKUP_ZONE_T_FIELDS = ['name', 'description'] as const;

export interface UseZonesResult {
  zones: Record<string, Zone>;
  loading: boolean;
}

/** Vuoto stabile: un `{}` inline creerebbe un riferimento nuovo a ogni render. */
const NO_ZONES: Record<string, Zone> = {};

export const pickupZonesQueryKey = (lang = 'en') =>
  ['pickup_zones', 'merged_geojson', lang] as const;

/**
 * Zone di pickup dal DB, fuse con il GeoJSON statico dei confini.
 *
 * Data layer unico (CLAUDE.md #17): era `useEffect + useState + cancelled`. Stessa
 * query, stessa fusione; in piu' la cache TanStack, cosi' la pagina Pickup e chiunque
 * altro chieda le zone condividono UNA chiamata.
 */
export function useZones(): UseZonesResult {
  const { lang } = useLanguage();
  const query = useQuery({
    queryKey: pickupZonesQueryKey(lang),
    queryFn: async () => {
      const q = sidecarFilter(supabase.from('pickup_zones')
        .select('*' + sidecarJoin('pickup_zones_translations', PICKUP_ZONE_T_FIELDS, lang)), lang);
      const { data, error } = await q;
      if (error) throw error;
      const features = GEOJSON_MASTER?.features ?? [];
      // display_order e' nullable in DB ma opzionale nel tipo: normalizza null -> undefined
      const zoneRows = mergeSidecarRows(data, lang)
        .map((z) => ({ ...z, display_order: z.display_order ?? undefined })) as unknown as PickupZone[];
      return mergeZonesWithGeoJson(zoneRows, features);
    },
  });
  return { zones: query.data ?? NO_ZONES, loading: query.isPending };
}
