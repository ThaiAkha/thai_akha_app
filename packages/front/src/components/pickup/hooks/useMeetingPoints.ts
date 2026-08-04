import { useState, useEffect, useMemo } from 'react';
import { supabase } from '@thaiakha/shared/lib/supabase';
import { haversineDistance } from '@thaiakha/shared/lib/geoUtils';
import type { MeetingPoint } from '@thaiakha/shared/types';

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
}

export function useMeetingPoints({ selectedClass, outsideHotelCoords }: Options): UseMeetingPointsResult {
  const [meetingPoints, setMeetingPoints] = useState<MeetingPoint[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const fetch = async () => {
      setLoading(true);
      try {
        const { data } = await supabase
          .from('meeting_points')
          .select('*, point_type, is_dropoff_point, cover:media_assets!image_asset_id(image_url, alt_text)')
          .eq('active', true)
          .order('name');
        if (!cancelled) {
          // Resolve image_asset_id → media_assets; keep the `image_url` alias used by MeetingCard.
          const resolved = (data ?? []).map((row) => {
            const cover = (row as Record<string, unknown>).cover as { image_url?: string } | null;
            return { ...row, image_url: cover?.image_url ?? null };
          });
          setMeetingPoints(resolved as unknown as MeetingPoint[]);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    fetch();
    return () => { cancelled = true; };
  }, []);

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

  const dropoffPoints = useMemo(() =>
    meetingPoints.filter(mp => mp.is_dropoff_point === true),
  [meetingPoints]);

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
    loading,
  };
}
