import { useQuery } from '@thaiakha/shared/query';
import { supabase } from '@thaiakha/shared/lib/supabase';
import { GEOJSON_MASTER } from '@thaiakha/shared/data';
import { mergeZonesWithGeoJson, type Zone } from '../utils/locationHelpers';

export interface UseZonesResult {
  zones: Record<string, Zone>;
  loading: boolean;
}

/** Vuoto stabile: un `{}` inline creerebbe un riferimento nuovo a ogni render. */
const NO_ZONES: Record<string, Zone> = {};

export const pickupZonesQueryKey = ['pickup_zones', 'merged_geojson'] as const;

/**
 * Zone di pickup dal DB, fuse con il GeoJSON statico dei confini.
 *
 * Data layer unico (CLAUDE.md #17): era `useEffect + useState + cancelled`. Stessa
 * query, stessa fusione; in piu' la cache TanStack, cosi' la pagina Pickup e chiunque
 * altro chieda le zone condividono UNA chiamata.
 */
export function useZones(): UseZonesResult {
  const query = useQuery({
    queryKey: pickupZonesQueryKey,
    queryFn: async () => {
      const { data, error } = await supabase.from('pickup_zones').select('*');
      if (error) throw error;
      const features = GEOJSON_MASTER?.features ?? [];
      // display_order e' nullable in DB ma opzionale nel tipo: normalizza null -> undefined
      const zoneRows = (data ?? []).map((z) => ({ ...z, display_order: z.display_order ?? undefined }));
      return mergeZonesWithGeoJson(zoneRows, features);
    },
  });
  return { zones: query.data ?? NO_ZONES, loading: query.isPending };
}
