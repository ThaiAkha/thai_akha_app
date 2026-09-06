// MULTI-KITCHEN — Hook riusabile: overview pax Morning/Evening per giorno (oggi → +N).
// Alimenta il componente <DaysSidebar>. Usato da Kitchen Planner, Driver Planner, ecc.
import { useQuery } from '@thaiakha/shared/query';
import { supabase } from '@thaiakha/shared/lib/supabase';

export interface DayOverview {
  date: string;     // yyyy-mm-dd
  morning: number;  // pax morning_class
  evening: number;  // pax evening_class
}

const toISO = (d: Date) => new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().split('T')[0];

const NO_DAYS: DayOverview[] = [];

export const daysOverviewQueryKey = (windowDays: number) =>
  ['bookings', 'days_overview', windowDays] as const;

async function fetchDaysOverview(windowDays: number): Promise<DayOverview[]> {
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const end = new Date(today); end.setDate(today.getDate() + windowDays);
  const { data } = await supabase
    .from('bookings')
    .select('booking_date, session_id, pax_count, status')
    .gte('booking_date', toISO(today))
    .lte('booking_date', toISO(end))
    .neq('status', 'cancelled');

  // Pre-popola tutti i giorni della finestra (anche a 0 pax) così la nav è sempre completa.
  const map = new Map<string, DayOverview>();
  for (let i = 0; i <= windowDays; i++) {
    const d = new Date(today); d.setDate(today.getDate() + i);
    map.set(toISO(d), { date: toISO(d), morning: 0, evening: 0 });
  }
  ((data as { booking_date: string; session_id: string | null; pax_count: number | null }[]) ?? []).forEach((b) => {
    const row = map.get(b.booking_date) ?? { date: b.booking_date, morning: 0, evening: 0 };
    if ((b.session_id || 'morning_class') === 'evening_class') row.evening += b.pax_count ?? 0;
    else row.morning += b.pax_count ?? 0;
    map.set(b.booking_date, row);
  });
  return Array.from(map.values()).sort((a, b) => a.date.localeCompare(b.date));
}

/**
 * Data layer unico (CLAUDE.md #17): era `useState` + `useEffect` + fetch a mano.
 *
 * Due pagine lo montano con la stessa finestra di sei giorni, ManagerReservation e
 * ManagerLogistic: senza una cache condivisa ognuna faceva la sua lettura, e ogni
 * passaggio da una all'altra la rifaceva da capo. Con la chiave sotto, e' una
 * lettura sola, condivisa, e per la durata dello staleTime non si ripete: un
 * manager che passa la giornata a rimbalzare fra le due pagine smette di
 * aspettare la stessa risposta.
 */
export function useDaysOverview(windowDays = 6) {
  const query = useQuery({
    queryKey: daysOverviewQueryKey(windowDays),
    queryFn: () => fetchDaysOverview(windowDays),
  });

  return {
    days: query.data ?? NO_DAYS,
    loading: query.isPending,
    refetch: query.refetch,
  };
}
