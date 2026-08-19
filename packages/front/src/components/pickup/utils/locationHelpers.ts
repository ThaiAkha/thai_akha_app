/**
 * locationHelpers.ts
 * Pure utility functions for pickup/location logic.
 * No React, no Supabase — safe to import anywhere.
 */

import { isPointInPolygon } from '@thaiakha/shared/lib/geoUtils';
import type { PickupZone, PickupGeoJsonFeature } from '@thaiakha/shared/types';

// ─── Zone type (extends shared PickupZone with client-side coords) ──────────

export interface Zone extends PickupZone {
  coords?: number[][];
}

// ─── GeoJSON → Zone mapping ──────────────────────────────────────────────────
// Maps GEOJSON_MASTER feature IDs to zone DB IDs.
// ⚠️ If a new polygon is added to the GeoJSON, add a new entry here.
const GEOJSON_ID_MAP: Record<string, string> = {
  AREA_AZURE_001:  'azure',
  AREA_PINK_001:   'pink',
  AREA_GREEN_001:  'green',
  AREA_YELLOW_001: 'yellow',
};

// Fallback zones not yet in DB but present in GeoJSON
const ZONE_FALLBACKS: Record<string, Partial<Zone>> = {
  azure: {
    id: 'azure',
    name: 'Azure Area',
    color_code: '#1af0ff',
    morning_pickup_time: '08:40:00',
    morning_pickup_end:  null,
    evening_pickup_time: '16:40:00',
    evening_pickup_end:  null,
  },
};

/**
 * Merges DB pickup_zones with GEOJSON_MASTER polygon coordinates.
 * Returns a complete zone map keyed by zone ID.
 */
export function mergeZonesWithGeoJson(
  dbZones: PickupZone[],
  geoJsonFeatures: PickupGeoJsonFeature[],
): Record<string, Zone> {
  const map: Record<string, Zone> = {};

  // Seed from DB
  dbZones.forEach(z => { map[z.id] = { ...z }; });

  // Attach polygon coords from GeoJSON
  geoJsonFeatures.forEach((f) => {
    if (f.geometry?.type !== 'Polygon') return;
    const zoneId = GEOJSON_ID_MAP[f.properties?.id ?? ''];
    if (!zoneId) return;

    // Ensure the zone exists (apply fallback if not in DB)
    if (!map[zoneId] && ZONE_FALLBACKS[zoneId]) {
      map[zoneId] = ZONE_FALLBACKS[zoneId] as Zone;
    }
    if (map[zoneId]) {
      map[zoneId].coords = f.geometry.coordinates as number[][];
    }
  });

  return map;
}

// ─── Zone detection ──────────────────────────────────────────────────────────

const ZONE_PRIORITY = ['azure', 'pink', 'green', 'yellow'];

/**
 * Returns the zone ID for a given lat/lng, or undefined if outside all zones.
 * Checks zones in priority order (smallest → largest).
 */
export function detectZone(
  lat: number,
  lng: number,
  zones: Record<string, Zone>,
): string | undefined {
  for (const zid of ZONE_PRIORITY) {
    const zone = zones[zid];
    if (zone?.coords && isPointInPolygon({ lat, lng }, zone.coords)) return zid;
  }
  return undefined;
}

// ─── Time formatting ─────────────────────────────────────────────────────────

/**
 * Converts DB time string ("08:50:00") → "8:50 am" / "4:50 pm".
 * Never shows 24h format to customers.
 */
export function fmtTime(time: string | null | undefined): string {
  if (!time) return '--:--';
  const [h, m] = time.slice(0, 5).split(':').map(Number);
  const period = h < 12 ? 'am' : 'pm';
  const hour = h === 0 ? 12 : h > 12 ? h - 12 : h;
  return `${hour}:${String(m).padStart(2, '0')} ${period}`;
}
