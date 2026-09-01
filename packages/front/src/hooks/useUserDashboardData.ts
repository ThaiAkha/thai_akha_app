import { useState, useEffect, useMemo } from 'react';
import { useQuery, useQueryClient } from '@thaiakha/shared/query';
import { supabase } from '@thaiakha/shared/lib/supabase';
import type { UserDashboardBooking, DashboardMenuSelection, PickupRouteStop } from '@thaiakha/shared/types';
import type { UserProfile } from '../services/auth.service';
import { useSpicinessLevels } from './useSpicinessLevels';

const NO_BOOKINGS: UserDashboardBooking[] = [];
const NO_STOPS: PickupRouteStop[] = [];

// Prefisso 'user': dati dell'utente loggato, rimossi al logout (App.handleLogout).
export const userDashboardBookingsKey = (userId: string) =>
  ['user', 'dashboard_bookings', userId] as const;
export const userMenuSelectionKey = (bookingId: string) =>
  ['user', 'menu_selection', bookingId] as const;
export const userRouteStopsKey = (date: string, sessionId: string) =>
  ['user', 'route_stops', date, sessionId] as const;

/** Giorno locale in formato YYYY-MM-DD (stesso calcolo del vecchio polling). */
const localTodayStr = () => {
  const now = new Date();
  return new Date(now.getTime() - now.getTimezoneOffset() * 60000).toISOString().split('T')[0];
};

/** Il booking va tenuto "caldo" (polling 20s): e' oggi e il pickup non e' concluso. */
const isHotBooking = (b: UserDashboardBooking | undefined | null) =>
  !!b && b.booking_date === localTodayStr() && b.transport_status !== 'dropped_off';

const fetchDashboardBookings = async (userId: string): Promise<UserDashboardBooking[]> => {
  const { data: bookingRows } = await supabase
    .from('bookings')
    .select(`*, class_sessions ( display_name, start_time )`)
    .eq('user_id', userId)
    .neq('status', 'cancelled');
  // Shape della select (join class_sessions) non inferibile: cast unico alla forma dichiarata.
  const bookings = bookingRows as unknown as UserDashboardBooking[] | null;
  if (!bookings || bookings.length === 0) return [];

  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const future = bookings
    .filter(b => new Date(b.booking_date) >= now)
    .sort((a, b) => new Date(a.booking_date).getTime() - new Date(b.booking_date).getTime());
  const past = bookings
    .filter(b => new Date(b.booking_date) < now)
    .sort((a, b) => new Date(b.booking_date).getTime() - new Date(a.booking_date).getTime());
  return [...future, ...past];
};

/**
 * Data loader della USER DASHBOARD (#118 lotto 6, regola #17): bookings, menu
 * selection e route del giorno su TanStack Query (chiavi 'user', staleTime 0 =
 * stato sempre riletto all'ingresso). Il vecchio setInterval di 20s diventa
 * refetchInterval condizionale: attivo solo se il booking selezionato e' OGGI
 * e il pickup non e' concluso — e aggiorna bookings + route, non il menu
 * (invariante del vecchio polling).
 */
export function useUserDashboardData(userProfile: UserProfile | null, isStaff: boolean) {
  const queryClient = useQueryClient();
  const { spicinessLevels } = useSpicinessLevels();
  const [activeBookingId, setActiveBookingId] = useState<string | null>(null);

  const bookingsQ = useQuery({
    queryKey: userDashboardBookingsKey(userProfile?.id ?? 'anon'),
    queryFn: () => fetchDashboardBookings(userProfile!.id),
    enabled: !!userProfile && !isStaff,
    staleTime: 0,
    // Funzione (non valore): legge i dati gia' in cache, definiti solo dopo questa query.
    refetchInterval: (query) => {
      const current = query.state.data?.find(b => b.internal_id === activeBookingId);
      return isHotBooking(current) ? 20000 : false;
    },
  });
  const bookingsList = bookingsQ.data ?? NO_BOOKINGS;

  /* ── Selezione booking di default (era dentro fetchBookings) ── */
  useEffect(() => {
    const sorted = bookingsQ.data;
    if (!sorted) return;
    if (sorted.length === 0) { setActiveBookingId(null); return; }
    if (activeBookingId) return;
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    const future = sorted.filter(b => new Date(b.booking_date) >= now);
    const lastEdited = localStorage.getItem('last_edited_booking');
    const target = lastEdited && sorted.find(b => b.internal_id === lastEdited)
      ? lastEdited
      : (future.length > 0 ? future[0].internal_id : sorted[0].internal_id);
    setActiveBookingId(target);
    localStorage.removeItem('last_edited_booking');
  }, [bookingsQ.data, activeBookingId]);

  const activeBooking = useMemo(
    () => bookingsList.find(b => b.internal_id === activeBookingId) ?? null,
    [bookingsList, activeBookingId],
  );
  const pollActive = isHotBooking(activeBooking);

  /* ── Menu del booking attivo (il polling NON lo tocca, come prima) ── */
  const menuQ = useQuery({
    queryKey: userMenuSelectionKey(activeBookingId ?? 'none'),
    enabled: !!activeBookingId && !isStaff,
    staleTime: 0,
    queryFn: async () => {
      const { data: menu } = await supabase
        .from('menu_selections')
        .select(`*, curry:recipes!curry_id(name, image), soup:recipes!soup_id(name, image), stirfry:recipes!stirfry_id(name, image)`)
        .eq('booking_id', activeBookingId!)
        .maybeSingle();
      // Join curry/soup/stirfry non inferibile: cast unico alla forma dichiarata.
      return (menu as unknown as DashboardMenuSelection | null) ?? null;
    },
  });

  /* ── Fermate della route del giorno (stessa data+sessione del booking attivo) ── */
  const routeQ = useQuery({
    queryKey: userRouteStopsKey(
      activeBooking?.booking_date ?? 'none',
      (activeBooking?.session_id as string | null) ?? 'none',
    ),
    enabled: !!activeBooking && !isStaff,
    staleTime: 0,
    refetchInterval: pollActive ? 20000 : false,
    queryFn: async () => {
      const { data: stops } = await supabase
        .from('bookings')
        .select('internal_id, hotel_name, route_order, transport_status, pickup_time')
        .eq('booking_date', activeBooking!.booking_date)
        .eq('session_id', activeBooking!.session_id as string) // sempre valorizzato per un booking reale
        .neq('status', 'cancelled')
        .order('route_order', { ascending: true });
      return (stops ?? []) as PickupRouteStop[];
    },
  });

  /** Rilettura bookings dopo un salvataggio (era refreshTrigger++): in background, senza skeleton. */
  const refresh = () => {
    void queryClient.invalidateQueries({ queryKey: ['user', 'dashboard_bookings'] });
  };

  return {
    bookingsList,
    activeBookingId,
    setActiveBookingId,
    activeBooking,
    menuSelection: menuQ.data ?? null,
    routeStops: routeQ.data ?? NO_STOPS,
    spicinessLevels,
    loading: !isStaff && bookingsQ.isPending,
    refresh,
  };
}
