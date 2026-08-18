import { useState, useEffect } from 'react';
import { supabase } from '@thaiakha/shared/lib/supabase';
import { GEOJSON_MASTER } from '@thaiakha/shared/data';
import { mergeZonesWithGeoJson, type Zone } from '../utils/locationHelpers';

export interface UseZonesResult {
  zones: Record<string, Zone>;
  loading: boolean;
}

export function useZones(): UseZonesResult {
  const [zones, setZones] = useState<Record<string, Zone>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const fetchZones = async () => {
      setLoading(true);
      try {
        const { data } = await supabase.from('pickup_zones').select('*');
        if (cancelled) return;
        const features = GEOJSON_MASTER?.features ?? [];
        // display_order e' nullable in DB ma opzionale nel tipo: normalizza null -> undefined
        const zoneRows = (data ?? []).map((z) => ({
          ...z,
          display_order: z.display_order ?? undefined,
        }));
        setZones(mergeZonesWithGeoJson(zoneRows, features));
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    fetchZones();
    return () => { cancelled = true; };
  }, []);

  return { zones, loading };
}
