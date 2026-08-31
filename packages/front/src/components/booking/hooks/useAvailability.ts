/**
 * useAvailability
 * Fetches class availability for a date range.
 *
 * Strategy:
 *   1. Load base capacities from class_sessions
 *   2. Fetch daily overrides (closures, custom capacity)
 *   3. Fetch occupancy via RPC get_calendar_availability
 *   4. Merge into DailyAvailability map keyed by YYYY-MM-DD
 *
 * Data layer unico (CLAUDE.md #17): una useQuery per finestra di date. Sono POSTI, non
 * contenuti: `staleTime: 0`, quindi si rilegge a ogni mount e a ogni cambio finestra come
 * prima (la cache serve solo a non duplicare la chiamata). La mappa precedente resta finche'
 * arriva la nuova, com'era: il ponte proxyDailyStats di BookingPage si aggancia a quella.
 */

import { useMemo } from 'react';
import { useQuery, keepPreviousData } from '@thaiakha/shared/query';
import { supabase } from '@thaiakha/shared/lib/supabase';
import { t } from '../../../i18n';
import type { DailyAvailability, SessionInfo, SessionStatus } from '../booking.types';

export interface UseAvailabilityResult {
  dailyStats: Record<string, DailyAvailability>;
  loading: boolean;
}

const NO_STATS: Record<string, DailyAvailability> = {};

/** Convert a local Date to a timezone-safe YYYY-MM-DD string */
function toDateStr(d: Date): string {
  const offset = d.getTimezoneOffset() * 60_000;
  return new Date(d.getTime() - offset).toISOString().split('T')[0];
}

export const availabilityRangeQueryKey = (dateStrings: readonly string[]) =>
  ['availability_range', dateStrings.join('|')] as const;

/** Logica di lettura e fusione invariata rispetto all'effetto originale. */
async function fetchAvailabilityRange(dateStrings: readonly string[]): Promise<Record<string, DailyAvailability>> {
  const startDate = dateStrings[0];
  const endDate   = dateStrings[dateStrings.length - 1];

  // 1+2+3 in parallelo: erano tre await in fila, sono indipendenti.
  const [{ data: sessionsData }, { data: overrides }, { data: occupancy, error: rpcError }] = await Promise.all([
    // 1. Base capacities
    supabase.from('class_sessions').select('id, max_capacity'),
    // 2. Overrides
    supabase.from('class_calendar_overrides').select('*').in('date', [...dateStrings]),
    // 3. Occupancy via RPC
    supabase.rpc('get_calendar_availability', { start_date: startDate, end_date: endDate }),
  ]);
  const baseCaps: Record<string, number> = {};
  sessionsData?.forEach((s) => { baseCaps[s.id] = s.max_capacity; });
  if (rpcError) console.error('RPC Availability Error:', rpcError);

  // 4. Build map
  const newMap: Record<string, DailyAvailability> = {};

  dateStrings.forEach(dateStr => {
    const calculateStatus = (sessionId: string): SessionStatus => {
      const override = overrides?.find(
        (o) => o.date === dateStr && o.session_id === sessionId,
      );
      if (override?.is_closed) {
        return {
          status: 'CLOSED',
          remaining: 0,
          reason: override.closure_reason || t('booking:closed'),
          totalVisitors: 0,
        };
      }

      const max      = override?.custom_capacity ?? baseCaps[sessionId] ?? 0;
      const row      = occupancy?.find((o) => o.booking_date === dateStr && o.session_id === sessionId);
      const occupied = Number(row?.total_occupied ?? 0);
      const remaining = Math.max(0, max - occupied);

      return {
        status: remaining > 0 ? 'OPEN' : 'FULL',
        remaining,
        reason: remaining === 0 ? t('booking:fullyBooked') : undefined,
        totalVisitors: 0,
      };
    };

    newMap[dateStr] = {
      morning_class: calculateStatus('morning_class'),
      evening_class: calculateStatus('evening_class'),
    };
  });

  return newMap;
}

export function useAvailability(
  dateOptions: Date[],
  sessionConfig: Record<string, SessionInfo>,
): UseAvailabilityResult {
  const configReady = Object.keys(sessionConfig).length > 0;
  const dateStrings = useMemo(() => dateOptions.map(toDateStr), [dateOptions]);
  const enabled = configReady && dateStrings.length > 0;

  const query = useQuery({
    queryKey: availabilityRangeQueryKey(dateStrings),
    enabled,
    queryFn: () => fetchAvailabilityRange(dateStrings),
    staleTime: 0,
    placeholderData: keepPreviousData,
  });

  return {
    dailyStats: query.data ?? NO_STATS,
    // isFetching, non isPending: con la mappa precedente a schermo isPending e' falso.
    loading: enabled && query.isFetching,
  };
}
