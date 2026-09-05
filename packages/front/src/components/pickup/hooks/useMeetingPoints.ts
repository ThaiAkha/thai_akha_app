import { useMemo } from 'react';
import { useQuery } from '@thaiakha/shared/query';
import { supabase } from '@thaiakha/shared/lib/supabase';
import { haversineDistance } from '@thaiakha/shared/lib/geoUtils';
import { sidecarJoin, sidecarFilter, mergeSidecarRows } from '@thaiakha/shared/lib/mergeTranslation';
import type { MeetingPoint } from '@thaiakha/shared/types';
import { useLanguage } from '../../../context/LanguageContext';

/** Campi di CONTENUTO del sidecar punti d'incontro (dropoff incluso: e' testo utente). */
const MEETING_POINT_T_FIELDS = ['name', 'description', 'dropoff_description'] as const;

export type MeetingPointWithDist = MeetingPoint & { _distKm?: number };

export interface UseMeetingPointsResult {
  meetingPoints: MeetingPoint[];
  walkInPoints: MeetingPoint[];
  airportPoints: MeetingPoint[];
  trainPoints: MeetingPoint[];
  dropoffPoints: MeetingPoint[];
  outsideZonePoints: MeetingPointWithDist[];
  loading: boolean;
}

interface Options {
  selectedClass: 'morning' | 'evening';
  outsideHotelCoords: { lat: number; lng: number } | null;
  /** booking_date 'YYYY-MM-DD' — nota solo in edit mode; null = data non ancora scelta */
  bookingDate?: string | null;
}

/** Vuoto stabile: un `[]` inline sarebbe un riferimento nuovo a ogni render (rompe i useMemo). */
const NO_POINTS: MeetingPoint[] = [];

export const meetingPointsQueryKey = (lang = 'en') =>
  ['meeting_points', 'active_with_cover', lang] as const;

/** Weekday locale da 'YYYY-MM-DD' (0=domenica … 6=sabato); null se data assente/malformata. */
function parseWeekday(dateStr: string | null | undefined): number | null {
  if (!dateStr) return null;
  const [y, m, d] = dateStr.split('-').map(Number);
  if (!y || !m || !d) return null;
  return new Date(y, m - 1, d).getDay();
}

/**
 * Punti d'incontro attivi (con cover da media_assets) e le liste derivate per la pagina Pickup.
 * Data layer unico (CLAUDE.md #17): era `useEffect + useState + cancelled`. Stessa query;
 * in cache, cosi' tornare sulla pagina non la ripete.
 */
export function useMeetingPoints({ selectedClass, outsideHotelCoords, bookingDate }: Options): UseMeetingPointsResult {
  const { lang } = useLanguage();
  const query = useQuery({
    queryKey: meetingPointsQueryKey(lang),
    queryFn: async () => {
      const q = sidecarFilter(supabase
        .from('meeting_points')
        .select('*, point_type, is_dropoff_point, cover:media_assets!image_asset_id(image_url, alt_text)'
          + sidecarJoin('meeting_points_translations', MEETING_POINT_T_FIELDS, lang))
        .eq('active', true)
        .order('name'), lang);
      const { data: raw, error } = await q;
      if (error) throw error;
      const data = mergeSidecarRows(raw, lang);
      // Resolve image_asset_id → media_assets; keep the `image_url` alias used by MeetingCard.
      const resolved = data.map((row) => {
        const cover = (row as Record<string, unknown>).cover as { image_url?: string } | null;
        return { ...row, image_url: cover?.image_url ?? null };
      });
      return resolved as unknown as MeetingPoint[];
    },
  });
  const meetingPoints = query.data ?? NO_POINTS;

  const walkInPoints = useMemo(() =>
    meetingPoints.filter(mp => {
      if (mp.point_type !== 'walk_in') return false;
      if (selectedClass === 'evening' && !mp.evening_pickup_time) return false;
      return true;
    }),
  [meetingPoints, selectedClass]);

  // Airport: exact IDs only — excludes hotels like "Central Airport Plaza"
  const airportPoints = useMemo(() =>
    meetingPoints.filter(mp => mp.id === 'mp_airport_gate1' || mp.id === 'mp_airport_gate2'),
  [meetingPoints]);

  const trainPoints = useMemo(() =>
    meetingPoints.filter(mp => mp.id === 'mp_train_station'),
  [meetingPoints]);

  // I due night market sono attivi solo il loro giorno: se conosciamo la data
  // della classe li filtriamo; se la data non è nota mostriamo entrambi
  // (la description contiene il giorno di apertura).
  const dropoffPoints = useMemo(() => {
    const day = parseWeekday(bookingDate);
    return meetingPoints.filter(mp => {
      if (mp.is_dropoff_point !== true) return false;
      if (mp.id === 'mp_saturday_market') return day === null || day === 6;
      if (mp.id === 'mp_sunday_market')   return day === null || day === 0;
      return true;
    });
  }, [meetingPoints, bookingDate]);

  // Outside-zone fallback list: pickup-capable points only, sorted by distance
  const outsideZonePoints = useMemo((): MeetingPointWithDist[] => {
    const eligible = meetingPoints.filter(mp => {
      if (mp.point_type === 'dropoff' || mp.is_dropoff_point === true) return false;
      if (selectedClass === 'evening' && !mp.evening_pickup_time) return false;
      return true;
    });

    if (!outsideHotelCoords) return eligible;

    return eligible
      .map(mp => ({
        ...mp,
        _distKm: haversineDistance(outsideHotelCoords, { lat: mp.latitude, lng: mp.longitude }),
      }))
      .sort((a, b) => (a._distKm ?? 0) - (b._distKm ?? 0));
  }, [meetingPoints, selectedClass, outsideHotelCoords]);

  return {
    meetingPoints,
    walkInPoints,
    airportPoints,
    trainPoints,
    dropoffPoints,
    outsideZonePoints,
    loading: query.isPending,
  };
}
