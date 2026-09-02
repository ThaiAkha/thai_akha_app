/**
 * useCalendarAvailability
 * Posti per sessione su una griglia di 42 giorni (6 settimane da lunedi') attorno al mese in
 * vista, per CalendarView. Data layer unico (CLAUDE.md #17): era `useEffect + useState +
 * isMounted` dentro la vista. Sono POSTI: `staleTime: 0`, si rilegge a ogni cambio mese e a
 * ogni apertura del calendario, come prima; lo skeleton compare a ogni lettura, come prima.
 *
 * Occupazione via RPC get_calendar_availability (SECURITY DEFINER), stessa fonte di
 * useAvailability: conteggi COMPLETI anche per anon e clienti. Prima leggeva `bookings`
 * dal browser, ma la RLS (bookings_select_scoped) mostra solo le righe PROPRIE: la somma
 * era parziale e il calendario SOVRASTIMAVA i posti liberi - difetto mascherato dalla
 * pausa booking (max_capacity 0 = tutto FULL comunque). Chiude i trovati (a)+(b) del
 * triage #118 (2026-09-02).
 */

import { useQuery } from '@thaiakha/shared/query';
import { supabase } from '@thaiakha/shared/lib/supabase';
import { getSessionCapacity } from '@thaiakha/shared/lib/sessionUtils';
import { getDateKey } from '@thaiakha/shared/lib/dateKeyUtils';

export interface CalendarSessionStatus {
  status: 'OPEN' | 'FULL' | 'CLOSED';
  seats: number;
}

export interface CalendarDayData {
  morning: CalendarSessionStatus;
  evening: CalendarSessionStatus;
}

const NO_AVAILABILITY: Record<string, CalendarDayData> = {};
const GRID_DAYS = 42;

/** Primo giorno della griglia (il lunedi' della settimana del 1° del mese). */
export function getGridStart(viewDate: Date): Date {
  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const firstDayOfMonth = new Date(year, month, 1);
  const dayOfWeek = firstDayOfMonth.getDay(); // 0: Sun, 1: Mon...
  const startDayIndex = (dayOfWeek + 6) % 7; // Convert to Mon:0, Tue:1... Sun:6
  return new Date(year, month, 1 - startDayIndex);
}

export const calendarAvailabilityQueryKey = (startDateStr: string) =>
  ['calendar_month_availability', startDateStr] as const;

/** Logica di lettura e fusione invariata rispetto all'effetto originale di CalendarView. */
async function fetchCalendarGrid(startGrid: Date): Promise<Record<string, CalendarDayData>> {
  const endGrid = new Date(startGrid);
  endGrid.setDate(startGrid.getDate() + GRID_DAYS);

  const startDateStr = getDateKey(startGrid);
  const endDateStr = getDateKey(endGrid);

  // A+B+C in parallelo: erano tre await in fila (3-5 s a mese da qui), sono indipendenti.
  const [{ data: sessionsData }, { data: occupancy }, { data: overrides }] = await Promise.all([
    // A. Base Capacity
    supabase.from('class_sessions').select('id, max_capacity'),
    // B. Occupazione via RPC: conteggi completi lato server (vedi header)
    supabase.rpc('get_calendar_availability', { start_date: startDateStr, end_date: endDateStr }),
    // C. Overrides
    supabase
      .from('class_calendar_overrides')
      .select('*')
      .gte('date', startDateStr)
      .lte('date', endDateStr),
  ]);
  const baseCaps: Record<string, number> = {};
  sessionsData?.forEach((s) => baseCaps[s.id] = getSessionCapacity(s.max_capacity) ?? 0);

  // D. Build Map
  const statusMap: Record<string, CalendarDayData> = {};
  const loopDate = new Date(startGrid);

  for (let i = 0; i < GRID_DAYS; i++) {
    const dateStr = getDateKey(loopDate);

    const getStatus = (sessionId: string): CalendarSessionStatus => {
      const override = overrides?.find(o => o.date === dateStr && o.session_id === sessionId);

      if (override?.is_closed) return { status: 'CLOSED', seats: 0 };

      const max = getSessionCapacity(override?.custom_capacity ?? baseCaps[sessionId]) ?? 0;
      const occupied = Number(occupancy
        ?.find(o => o.booking_date === dateStr && o.session_id === sessionId)
        ?.total_occupied ?? 0);

      const remaining = Math.max(0, max - occupied);

      return { status: remaining > 0 ? 'OPEN' : 'FULL', seats: remaining };
    };

    statusMap[dateStr] = {
      morning: getStatus('morning_class'),
      evening: getStatus('evening_class')
    };

    loopDate.setDate(loopDate.getDate() + 1);
  }

  return statusMap;
}

export function useCalendarAvailability(viewDate: Date) {
  const startGrid = getGridStart(viewDate);
  const startDateStr = getDateKey(startGrid);

  const query = useQuery({
    queryKey: calendarAvailabilityQueryKey(startDateStr),
    queryFn: () => fetchCalendarGrid(startGrid),
    staleTime: 0,
  });

  return {
    availability: query.data ?? NO_AVAILABILITY,
    // isFetching: lo skeleton compare anche tornando su un mese gia' letto, com'era.
    loading: query.isFetching,
  };
}
