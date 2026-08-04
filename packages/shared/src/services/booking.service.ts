// packages/shared/src/services/booking.service.ts
// READ-ONLY. Deriva lo stato prenotazione dell'utente per la response policy di
// Cherry (guest/loggato × booking). Cherry NON scrive mai: questo service
// espone solo letture. RLS garantisce che l'utente veda solo i propri booking.
import { supabase } from '../lib/supabase';

export type BookingStateKind = 'none' | 'future' | 'imminent';

export interface UserBookingState {
  /** none = nessuna prenotazione futura · future = oltre soglia · imminent = entro soglia */
  state: BookingStateKind;
  /** Giorni mancanti alla prossima classe (0 = oggi). */
  daysUntil?: number;
  /** Tipo classe: 'morning' | 'evening' (testo libero da DB). */
  sessionType?: string | null;
  /** Data classe (YYYY-MM-DD). */
  bookingDate?: string | null;
}

/**
 * Stato della PROSSIMA prenotazione confermata dell'utente.
 * @param userId  id utente loggato (assente/guest → 'none')
 * @param opts.imminentDays  soglia "imminent" in giorni (default 2 ≈ 48h)
 */
export const getUserBookingState = async (
  userId?: string | null,
  opts?: { imminentDays?: number },
): Promise<UserBookingState> => {
  // Guest / unauthenticated: user_id is a UUID column, so 'guest' (or any non-UUID)
  // would 400 on PostgREST. Skip the query entirely.
  if (!userId || userId === 'guest') return { state: 'none' };

  const imminentDays = opts?.imminentDays ?? 2;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayStr = today.toISOString().slice(0, 10);

  try {
    const { data, error } = await supabase
      .from('bookings')
      .select('booking_date, session_type, status')
      .eq('user_id', userId)
      .eq('status', 'confirmed')
      .gte('booking_date', todayStr)
      .order('booking_date', { ascending: true })
      .limit(1)
      .maybeSingle();

    if (error || !data?.booking_date) return { state: 'none' };

    const bookingDate = String(data.booking_date);
    const target = new Date(`${bookingDate}T00:00:00`);
    const daysUntil = Math.max(0, Math.round((target.getTime() - today.getTime()) / 86_400_000));
    const state: BookingStateKind = daysUntil <= imminentDays ? 'imminent' : 'future';

    return { state, daysUntil, sessionType: data.session_type ?? null, bookingDate };
  } catch {
    return { state: 'none' }; // fail-safe: mai bloccare la chat per un errore di lettura
  }
};

// ── L2/L3: dettagli completi della prenotazione (read-only) ──────────────────

export interface UserBookingDetails extends UserBookingState {
  hotelName?: string | null;
  pickupZone?: string | null;
  pickupTime?: string | null;
  paxCount?: number | null;
  totalPrice?: number | null;
  specialRequests?: string | null;
  /** TRUE se la prenotazione è gestita da un'agenzia (reservation_id_agency presente).
   *  In quel caso l'utente NON può auto-modificare pickup/data/classe (L3). */
  isAgencyManaged: boolean;
}

/**
 * Dettagli della prossima prenotazione confermata dell'utente (read-only).
 * Distingue booking proprio (L2) vs gestito da agenzia (L3) via reservation_id_agency.
 */
export const getUserBookingDetails = async (
  userId?: string | null,
  opts?: { imminentDays?: number },
): Promise<UserBookingDetails | null> => {
  if (!userId) return null;

  const imminentDays = opts?.imminentDays ?? 2;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayStr = today.toISOString().slice(0, 10);

  try {
    const { data, error } = await supabase
      .from('bookings')
      .select('booking_date, session_type, status, hotel_name, pickup_zone, pickup_time, pax_count, total_price, special_requests, reservation_id_agency')
      .eq('user_id', userId)
      .eq('status', 'confirmed')
      .gte('booking_date', todayStr)
      .order('booking_date', { ascending: true })
      .limit(1)
      .maybeSingle();

    if (error || !data?.booking_date) return null;

    const bookingDate = String(data.booking_date);
    const target = new Date(`${bookingDate}T00:00:00`);
    const daysUntil = Math.max(0, Math.round((target.getTime() - today.getTime()) / 86_400_000));
    const state: BookingStateKind = daysUntil <= imminentDays ? 'imminent' : 'future';

    return {
      state,
      daysUntil,
      sessionType: data.session_type ?? null,
      bookingDate,
      hotelName: data.hotel_name ?? null,
      pickupZone: data.pickup_zone ?? null,
      pickupTime: data.pickup_time ?? null,
      paxCount: data.pax_count ?? null,
      totalPrice: data.total_price ?? null,
      specialRequests: data.special_requests ?? null,
      isAgencyManaged: !!data.reservation_id_agency,
    };
  } catch {
    return null;
  }
};

// ── Menu del cliente (read-only): piatti scelti per la prenotazione ──────────

export interface UserMenuSelection {
  curry?: string | null;
  soup?: string | null;
  stirfry?: string | null;
  /** TRUE se non ha ancora scelto nessun piatto. */
  empty: boolean;
}

/**
 * Scelte-piatto dell'utente (curry/soup/stirfry) per la sua prenotazione.
 * Gli id sono recipe id (es. 'curry_04') → risolti in nomi via `recipes`.
 * Read-only. null se utente assente.
 */
export const getUserMenuSelection = async (userId?: string | null): Promise<UserMenuSelection | null> => {
  if (!userId) return null;
  try {
    const { data } = await supabase
      .from('menu_selections')
      .select('curry_id, soup_id, stirfry_id, updated_at')
      .eq('user_id', userId)
      .order('updated_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (!data) return null;
    const ids = [data.curry_id, data.soup_id, data.stirfry_id].filter(Boolean) as string[];
    if (ids.length === 0) return { empty: true };

    const { data: recs } = await supabase.from('recipes').select('id, name').in('id', ids);
    const nameById = new Map((recs ?? []).map((r) => [String((r as Record<string, unknown>).id), String((r as Record<string, unknown>).name)]));
    const resolve = (id?: string | null) => (id ? nameById.get(String(id)) ?? null : null);

    return {
      curry: resolve(data.curry_id),
      soup: resolve(data.soup_id),
      stirfry: resolve(data.stirfry_id),
      empty: false,
    };
  } catch {
    return null;
  }
};

// ── L1: disponibilità posti per classe (read-only, LIVE) ─────────────────────

export interface ClassAvailability {
  date: string;       // YYYY-MM-DD
  sessionId: string;  // class_sessions.id ('morning' | 'evening' …)
  capacity: number;
  occupied: number;
  free: number;       // max(0, capacity - occupied)
  isClosed: boolean;
  closureReason?: string | null;
}

/**
 * Disponibilità posti per data/sessione in un intervallo. Combina la RPC
 * `get_calendar_availability` (occupati) con `class_sessions.max_capacity` e gli
 * override `class_calendar_overrides` (chiusure / capacità custom).
 * LIVE (niente cache): i posti devono essere accurati quando Cherry li cita.
 */
export const getClassAvailability = async (
  startDate: string,
  endDate: string,
): Promise<ClassAvailability[]> => {
  try {
    const [occRes, sessRes, ovrRes] = await Promise.all([
      supabase.rpc('get_calendar_availability', { start_date: startDate, end_date: endDate }),
      supabase.from('class_sessions').select('id, max_capacity, active'),
      supabase.from('class_calendar_overrides')
        .select('date, session_id, is_closed, custom_capacity, closure_reason')
        .gte('date', startDate).lte('date', endDate),
    ]);

    const occupiedMap = new Map<string, number>();
    for (const r of (occRes.data ?? []) as Array<Record<string, unknown>>) {
      occupiedMap.set(`${r.booking_date}|${r.session_id}`, Number(r.total_occupied ?? 0));
    }

    const capacityMap = new Map<string, number>();
    const activeSessions: string[] = [];
    for (const s of (sessRes.data ?? []) as Array<Record<string, unknown>>) {
      if ((s.active as boolean) === false) continue;
      capacityMap.set(String(s.id), Number(s.max_capacity ?? 0));
      activeSessions.push(String(s.id));
    }

    const overrideMap = new Map<string, Record<string, unknown>>();
    for (const o of (ovrRes.data ?? []) as Array<Record<string, unknown>>) {
      overrideMap.set(`${o.date}|${o.session_id}`, o);
    }

    // Costruisce una riga per ogni giorno × sessione attiva nell'intervallo.
    const out: ClassAvailability[] = [];
    const start = new Date(`${startDate}T00:00:00`);
    const end = new Date(`${endDate}T00:00:00`);
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      const dateStr = d.toISOString().slice(0, 10);
      for (const sessionId of activeSessions) {
        const key = `${dateStr}|${sessionId}`;
        const ovr = overrideMap.get(key);
        const isClosed = ovr ? (ovr.is_closed as boolean) === true : false;
        const capacity = ovr && ovr.custom_capacity != null
          ? Number(ovr.custom_capacity)
          : (capacityMap.get(sessionId) ?? 0);
        const occupied = occupiedMap.get(key) ?? 0;
        out.push({
          date: dateStr,
          sessionId,
          capacity,
          occupied,
          free: Math.max(0, capacity - occupied),
          isClosed,
          closureReason: ovr ? (ovr.closure_reason as string | null) ?? null : null,
        });
      }
    }
    return out;
  } catch {
    return []; // fail-safe: nessuna disponibilità → Cherry rimanda alla pagina booking
  }
};
