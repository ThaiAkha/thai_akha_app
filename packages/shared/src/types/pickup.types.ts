/**
 * Pickup & Logistics Types
 * Shared between front (PickUpPage) and admin (useAdminHotels)
 */

export interface PickupZone {
  id: string;
  name: string;
  color_code: string | null;
  description: string | null;
  morning_pickup_time: string | null;
  morning_pickup_end: string | null;
  evening_pickup_time: string | null;
  evening_pickup_end: string | null;
  display_order?: number;
}

export interface MeetingPoint {
  id: string;
  name: string;
  description?: string | null;
  /** Testo mostrato quando il punto è usato come DROP-OFF (fallback: description).
   *  Per i punti dual-role (aeroporto/stazione) evita di ripetere le istruzioni di pickup. */
  dropoff_description?: string | null;
  latitude: number;
  longitude: number;
  google_maps_link?: string | null;
  /** Resolved cover URL (from image_asset_id → media_assets). Read-only, for display. */
  image_url?: string | null;
  /** Media asset reference for the point photo (replaces legacy image_url column). */
  image_asset_id?: string | null;
  icon_url?: string | null;
  morning_pickup_time?: string | null;
  morning_pickup_end?: string | null;
  evening_pickup_time?: string | null;
  evening_pickup_end?: string | null;
  active?: boolean;
  /**
   * Role of this point:
   * - 'pickup'  → standard pickup meeting point (used in outside-zone selection)
   * - 'walk_in' → client arrives independently (school, temple)
   * - 'dropoff' → drop-off destination only (markets, etc.)
   */
  point_type?: 'pickup' | 'walk_in' | 'dropoff';
  /**
   * True if this point can also be selected as a drop-off destination
   * (airport gates, train station, Saturday/Sunday markets).
   */
  is_dropoff_point?: boolean;
}

export interface HotelLocation {
  id: string;
  name: string;
  zone_id: string | null;
  latitude: number | null;
  longitude: number | null;
  address: string | null;
  phone_number: string | null;
  map_link: string | null;
  website: string | null;
  google_place_id: string | null;
  is_active: boolean;
  created_at?: string;
  /** Client-side enriched */
  zone_name?: string;
  zone_color?: string;
}

export type HotelFormData = Omit<HotelLocation, 'id' | 'created_at' | 'zone_name' | 'zone_color'>;

// ─── GeoJSON shape of GEOJSON_MASTER (shared/data/mapZones.ts) ──────────────
// Loose on purpose: features are heterogeneous (zone polygons + point markers).

export interface PickupGeoJsonProperties {
  id?: string;
  name?: string;
  type?: string;
  color?: string;
  icon?: string | null;
  'marker-color'?: string;
  zIndex?: number;
  [key: string]: unknown;
}

export interface PickupGeoJsonFeature {
  type: string;
  properties: PickupGeoJsonProperties;
  geometry: {
    type: string;
    /** Point: [lng, lat] · Polygon: rings of [lng, lat] */
    coordinates: number[] | number[][] | number[][][];
  };
}

export interface PickupGeoJsonCollection {
  type: string;
  features: PickupGeoJsonFeature[];
}
