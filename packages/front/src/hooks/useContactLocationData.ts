import { useQuery } from '@thaiakha/shared/query';
import { supabase } from '@thaiakha/shared/lib/supabase';
import { sidecarJoin, sidecarFilter, mergeSidecarRows } from '@thaiakha/shared/lib/mergeTranslation';
import { useLanguage } from '../context/LanguageContext';
import type { MeetingPoint } from '@thaiakha/shared/types';

export interface PickupZoneRow {
  id: string;
  name: string;
  color_code: string | null;
  morning_pickup_time: string | null;
  evening_pickup_time: string | null;
}

/** Vuoti stabili: un `[]` inline creerebbe un riferimento nuovo a ogni render. */
const NO_POINTS: MeetingPoint[] = [];
const NO_ZONES: PickupZoneRow[] = [];

export const contactLocationQueryKey = (lang = 'en') =>
  ['contact_location', 'meeting_points+pickup_zones', lang] as const;

/**
 * Punti d'incontro walk-in + zone di pickup con orario, per la sezione Location della
 * pagina Contact. Data layer unico (CLAUDE.md #17): era `useEffect + useState +
 * cancelled` dentro il componente. Stesse due query nello stesso Promise.all.
 */
export function useContactLocationData() {
  const { lang } = useLanguage();
  const query = useQuery({
    queryKey: contactLocationQueryKey(lang),
    queryFn: async () => {
      let mpQuery = supabase
        .from('meeting_points')
        .select('id, name, description, google_maps_link, morning_pickup_time, evening_pickup_time'
          + sidecarJoin('meeting_points_translations', ['name', 'description'], lang))
        .eq('active', true)
        .eq('point_type', 'walk_in')
        .order('name');
      let pzQuery = supabase
        .from('pickup_zones')
        .select('id, name, color_code, morning_pickup_time, evening_pickup_time'
          + sidecarJoin('pickup_zones_translations', ['name'], lang))
        .not('morning_pickup_time', 'is', null)
        .order('display_order');
      mpQuery = sidecarFilter(mpQuery, lang);
      pzQuery = sidecarFilter(pzQuery, lang);
      const [mp, pz] = await Promise.all([mpQuery, pzQuery]);
      if (mp.error) throw mp.error;
      if (pz.error) throw pz.error;
      return {
        points: mergeSidecarRows<MeetingPoint>(mp.data, lang),
        zones: mergeSidecarRows<PickupZoneRow>(pz.data, lang),
      };
    },
  });
  return {
    points: query.data?.points ?? NO_POINTS,
    zones: query.data?.zones ?? NO_ZONES,
    loading: query.isPending,
  };
}
