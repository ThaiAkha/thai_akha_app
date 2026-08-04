// packages/shared/src/services/pickup.service.ts
// READ-ONLY. Risolve hotel → zona pickup → finestra orario, per Cherry.
// Solo hotel attivi/pubblicati (is_active). Cherry non scrive mai.
import { supabase } from '../lib/supabase';

// Parole comuni che NON identificano un hotel (riducono i falsi match nei nomi).
const STOPWORDS = new Set([
  'hotel', 'hostel', 'time', 'what', 'zone', 'pickup', 'pick', 'class', 'morning',
  'evening', 'where', 'when', 'please', 'area', 'resort', 'guesthouse', 'house',
  'place', 'room', 'near', 'staying', 'stay', 'chiang', 'mai', 'thai', 'akha',
  'from', 'with', 'this', 'that', 'have', 'about',
]);

function tokens(s: string): string[] {
  const m: string[] = (s ?? '').toLowerCase().match(/[a-z0-9]{4,}/g) ?? [];
  return m.filter((t) => !STOPWORDS.has(t));
}

/** "08:30:00" → "08:30" */
function hhmm(t?: string | null): string | null {
  if (!t) return null;
  return String(t).slice(0, 5);
}

export interface HotelPickupResult {
  found: boolean;
  /** più hotel plausibili → Cherry chiede di precisare */
  ambiguous?: boolean;
  candidates?: string[];
  hotelName?: string;
  zoneId?: string;
  zoneName?: string;
  morning?: string | null; // "08:30–09:00"
  evening?: string | null;
  isWalkIn?: boolean;
  isOutside?: boolean;
  note?: string | null;
}

/**
 * Risolve l'hotel citato nel testo e la sua finestra di pickup.
 * Token-search su hotel_locations.name (forward ILIKE), poi zona da pickup_zones.
 * found:false se nessun match (→ Cherry chiede il nome esatto / fallback fase 2).
 */
export const resolveHotelPickup = async (text: string): Promise<HotelPickupResult> => {
  const toks = tokens(text);
  if (toks.length === 0) return { found: false };

  try {
    const orFilter = toks.slice(0, 5).map((t) => `name.ilike.%${t}%`).join(',');
    const { data: hotels } = await supabase
      .from('hotel_locations')
      .select('id, name, zone_id')
      .eq('is_active', true)
      .or(orFilter)
      .limit(8);

    if (!hotels || hotels.length === 0) return { found: false };

    // Score: numero di token del nome presenti nel testo, poi nome più lungo.
    const textSet = new Set(toks);
    const scored = (hotels as Array<Record<string, unknown>>)
      .map((h) => {
        const nameToks = tokens(String(h.name));
        const overlap = nameToks.filter((t) => textSet.has(t)).length;
        return { h, overlap, len: String(h.name).length };
      })
      .sort((a, b) => b.overlap - a.overlap || b.len - a.len);

    const top = scored[0];
    if (top.overlap < 1) return { found: false };

    const tied = scored.filter((s) => s.overlap === top.overlap);
    if (tied.length > 1) {
      return { found: false, ambiguous: true, candidates: tied.slice(0, 4).map((s) => String(s.h.name)) };
    }

    const zoneId = String(top.h.zone_id ?? '');
    const { data: zone } = await supabase
      .from('pickup_zones')
      .select('id, name, morning_pickup_time, morning_pickup_end, evening_pickup_time, evening_pickup_end, description')
      .eq('id', zoneId)
      .maybeSingle();

    const z = (zone ?? {}) as Record<string, unknown>;
    const morning = hhmm(z.morning_pickup_time as string)
      ? `${hhmm(z.morning_pickup_time as string)}–${hhmm(z.morning_pickup_end as string)}`
      : null;
    const evening = hhmm(z.evening_pickup_time as string)
      ? `${hhmm(z.evening_pickup_time as string)}–${hhmm(z.evening_pickup_end as string)}`
      : null;

    return {
      found: true,
      hotelName: String(top.h.name),
      zoneId,
      zoneName: zone ? String(z.name) : zoneId,
      morning,
      evening,
      isWalkIn: zoneId === 'walk-in',
      isOutside: zoneId === 'outside',
      note: zone ? ((z.description as string) ?? null) : null,
    };
  } catch {
    return { found: false };
  }
};
