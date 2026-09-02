// packages/admin/src/prompts/adminScopedFetch.ts
// ─────────────────────────────────────────────────────────────────────────────
// Fetch dati SCOPATO PER RUOLO per la Cherry Admin (Fase 3).
// UN solo punto di scoping, consumato da entrambi gli hook (chat testo + voce).
//
// Ogni ruolo vede SOLO i dati che gli competono (WHERE + colonne per-ruolo):
//   driver    → SOLO i propri pickup (pickup/dropoff_driver_uid = userId), no finanza
//   logistics → SOLO le proprie market_runs (created_by = userId), NO bookings
//   kitchen   → SOLO oggi: diete/menu, no finanza/pickup
//   manager   → broad 7gg (bookings + market + payments)
//   admin     → tutto
//   agency    → SOLO le proprie prenotazioni (bookings.user_id = userId)
//
// ⚠️ Colonne di ownership VERIFICATE sullo schema live (audit /database 2026-06-11):
//   driver→bookings.pickup_driver_uid/dropoff_driver_uid · agency→bookings.user_id
//   (NON reservation_id_agency, che è text) · market_runs→created_by (+shopper_role).
// ⚠️ Il fetch gira col client anon+session (JWT utente) → le RLS scopate sono la
//    barriera vera; questo scoping client controlla cosa VEDE la Cherry.
// ─────────────────────────────────────────────────────────────────────────────
import { contentService } from '@thaiakha/shared/services';
import { supabase } from '@thaiakha/shared';
import type { CookingClassDB, Tables } from '@thaiakha/shared';
import type { BookingDaySummary, GuestAlert } from './adminPrompt';

export type AdminScope = 'driver' | 'logistics' | 'kitchen' | 'manager' | 'admin' | 'agency';

export interface MarketRunSummary {
  date: string;
  shopperRole: string;
  totalCost?: number;
  status?: string;
  notes?: string;
}

export interface AdminScopedData {
  scope: AdminScope;
  cookingClasses: CookingClassDB[];
  bookingSnapshot: BookingDaySummary[];
  guestAlerts: GuestAlert[];
  marketRuns: MarketRunSummary[];
}

/** Normalizza profiles.role → scope (fallback prudente: kitchen, come selectAdminAgent). */
export function resolveScope(role?: string): AdminScope {
  const r = (role ?? '').toLowerCase();
  if (r === 'driver' || r === 'logistics' || r === 'kitchen' || r === 'manager' || r === 'admin' || r === 'agency') {
    return r as AdminScope;
  }
  return 'kitchen';
}

const BOOKING_COLS =
  'internal_id, booking_date, session_id, pax_count, visitor_count, status, guest_name, ' +
  'booking_ref, hotel_name, pickup_time, pickup_zone, payment_method, payment_status, ' +
  'total_price, special_requests, customer_note';
// Colonne minime pickup per il driver (niente finanza/note cliente).
const BOOKING_COLS_DRIVER =
  'internal_id, booking_date, session_id, pax_count, visitor_count, status, guest_name, ' +
  'hotel_name, pickup_time, pickup_zone';

/** Shape delle righe lette con BOOKING_COLS / BOOKING_COLS_DRIVER (bookings o RPC driver_route). */
// Le colonne sono stringhe concatenate (non literal): PostgREST non le inferisce, quindi il
// risultato viene castato UNA volta a questa shape (colonne driver = sottoinsieme, opzionali).
type BookingScopedRow = Pick<Tables<'bookings'>, 'internal_id' | 'booking_date' | 'session_id' | 'pax_count' | 'visitor_count' | 'status' | 'guest_name' | 'hotel_name' | 'pickup_time' | 'pickup_zone'>
  & Partial<Pick<Tables<'bookings'>, 'booking_ref' | 'payment_method' | 'payment_status' | 'total_price' | 'special_requests' | 'customer_note'>>;
type MarketRunScopedRow = Pick<Tables<'market_runs'>, 'run_date' | 'shopper_role' | 'total_cost' | 'status' | 'notes' | 'created_by'>;

const mapBooking = (b: BookingScopedRow): BookingDaySummary => ({
  date: b.booking_date,
  session: b.session_id ?? 'unknown',
  pax: b.pax_count ?? 0,
  visitors: b.visitor_count ?? 0,
  status: b.status ?? 'unknown',
  bookingRef: b.booking_ref ?? undefined,
  hotelName: b.hotel_name ?? undefined,
  pickupTime: b.pickup_time ?? undefined,
  pickupZone: b.pickup_zone ?? undefined,
  paymentMethod: b.payment_method ?? undefined,
  paymentStatus: b.payment_status ?? undefined,
  totalPrice: b.total_price ?? undefined,
  specialRequests: b.special_requests ?? undefined,
  customerNote: b.customer_note ?? undefined,
});

async function fetchGuestAlerts(bookings: BookingScopedRow[]): Promise<GuestAlert[]> {
  const confirmedIds = bookings
    .filter(b => b.status === 'confirmed')
    .map(b => b.internal_id)
    .filter(Boolean) as string[];
  if (confirmedIds.length === 0) return [];

  const { data: selections } = await supabase
    .from('menu_selections')
    .select('booking_id, selected_profile, selected_allergies, curry_id, soup_id, stirfry_id, spiciness_id')
    .in('booking_id', confirmedIds);
  if (!selections?.length) return [];

  const bookingMap = new Map(bookings.map(b => [b.internal_id, b]));
  return selections
    .filter(s => s.selected_profile !== 'diet_regular' || (Array.isArray(s.selected_allergies) && s.selected_allergies.length > 0))
    .map(s => {
      const booking = bookingMap.get(s.booking_id as string);
      return {
        name: booking?.guest_name ?? 'Guest',
        date: booking?.booking_date ?? '',
        session: booking?.session_id ?? '',
        dietary: s.selected_profile ?? 'regular',
        allergies: Array.isArray(s.selected_allergies) ? s.selected_allergies : [],
        curryChoice: s.curry_id ?? undefined,
        soupChoice: s.soup_id ?? undefined,
        stirfryChoice: s.stirfry_id ?? undefined,
        spicinessLevel: s.spiciness_id ? s.spiciness_id.toString() : undefined,
      };
    });
}

async function fetchMarketRuns(userId?: string, ownOnly = true): Promise<MarketRunSummary[]> {
  let q = supabase
    .from('market_runs')
    .select('run_date, shopper_role, total_cost, status, notes, created_by')
    .order('run_date', { ascending: false })
    .limit(30);
  if (ownOnly && userId) q = q.eq('created_by', userId);
  const { data } = await q;
  return ((data ?? []) as MarketRunScopedRow[]).map((m) => ({
    date: m.run_date,
    shopperRole: m.shopper_role ?? 'unknown',
    totalCost: m.total_cost ?? undefined,
    status: m.status ?? undefined,
    notes: m.notes ?? undefined,
  }));
}

/**
 * Carica i dati live SCOPATI per il ruolo. `today`/`nextWeek` in ISO date (già
 * risolti in TZ locale dal chiamante per evitare buchi a mezzanotte).
 */
export async function fetchAdminScopedData(
  role: string | undefined,
  userId: string | undefined,
  today: string,
  nextWeek: string,
): Promise<AdminScopedData> {
  const scope = resolveScope(role);
  // Le classi (catalogo pubblico) le vedono tutti.
  const cookingClasses = await contentService.getCookingClasses();

  const empty: AdminScopedData = { scope, cookingClasses, bookingSnapshot: [], guestAlerts: [], marketRuns: [] };

  // ── LOGISTICS: solo market_runs proprie, NIENTE bookings ──────────────────
  if (scope === 'logistics') {
    return { ...empty, marketRuns: await fetchMarketRuns(userId, true) };
  }

  // ── DRIVER: solo i propri pickup, colonne minime, niente finanza/menu ─────
  // Fonte = RPC driver_route(), NON bookings: dal 2026-08-03 il driver non ha piu' SELECT su
  // `bookings` (ramo rimosso da bookings_select_scoped) e la RLS non da' errore, filtra - da
  // `bookings` questa query tornava semplicemente vuota. Era la vista driver_route_v, diventata
  // funzione con lo stesso filtro (migration 20260902200000_driver_route_rpc, advisor 0010).
  // Il filtro .or() sotto e' ridondante (la funzione gia' scopa per auth.uid()) ma resta
  // esplicito: la fonte dice cosa stiamo leggendo.
  if (scope === 'driver') {
    if (!userId) return empty;
    const { data } = await supabase
      .rpc('driver_route')
      .select(BOOKING_COLS_DRIVER)
      .or(`pickup_driver_uid.eq.${userId},dropoff_driver_uid.eq.${userId}`)
      .gte('booking_date', today)
      .lte('booking_date', nextWeek)
      .neq('status', 'cancelled')
      .order('booking_date');
    return { ...empty, bookingSnapshot: ((data ?? []) as unknown as BookingScopedRow[]).map(mapBooking) };
  }

  // ── AGENCY: solo le proprie prenotazioni (user_id) ────────────────────────
  if (scope === 'agency') {
    if (!userId) return empty;
    const { data } = await supabase
      .from('bookings')
      .select(BOOKING_COLS)
      .eq('user_id', userId)
      .gte('booking_date', today)
      .lte('booking_date', nextWeek)
      .neq('status', 'cancelled')
      .order('booking_date');
    return { ...empty, bookingSnapshot: ((data ?? []) as unknown as BookingScopedRow[]).map(mapBooking) };
  }

  // ── KITCHEN: solo OGGI, diete/menu (no finanza/pickup nel blocco) ─────────
  if (scope === 'kitchen') {
    const { data } = await supabase
      .from('bookings')
      .select(BOOKING_COLS)
      .eq('booking_date', today)
      .neq('status', 'cancelled')
      .order('booking_date');
    const bookings = (data ?? []) as unknown as BookingScopedRow[];
    return { ...empty, bookingSnapshot: bookings.map(mapBooking), guestAlerts: await fetchGuestAlerts(bookings) };
  }

  // ── MANAGER / ADMIN: broad 7gg (bookings + diete + market) ────────────────
  const { data } = await supabase
    .from('bookings')
    .select(BOOKING_COLS)
    .gte('booking_date', today)
    .lte('booking_date', nextWeek)
    .neq('status', 'cancelled')
    .order('booking_date');
  const bookings = (data ?? []) as unknown as BookingScopedRow[];
  return {
    ...empty,
    bookingSnapshot: bookings.map(mapBooking),
    guestAlerts: await fetchGuestAlerts(bookings),
    marketRuns: await fetchMarketRuns(userId, false), // manager/admin: tutte le run
  };
}
