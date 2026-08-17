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
 * Re-runs whenever dateOptions or sessionConfig changes.
 */

import { useState, useEffect } from 'react';
import { supabase } from '@thaiakha/shared/lib/supabase';
import { t } from '../../../i18n';
import type { DailyAvailability, SessionInfo, SessionStatus } from '../booking.types';

export interface UseAvailabilityResult {
  dailyStats: Record<string, DailyAvailability>;
  loading: boolean;
}

/** Convert a local Date to a timezone-safe YYYY-MM-DD string */
function toDateStr(d: Date): string {
  const offset = d.getTimezoneOffset() * 60_000;
  return new Date(d.getTime() - offset).toISOString().split('T')[0];
}

export function useAvailability(
  dateOptions: Date[],
  sessionConfig: Record<string, SessionInfo>,
): UseAvailabilityResult {
  const [dailyStats, setDailyStats] = useState<Record<string, DailyAvailability>>({});
  const [loading, setLoading] = useState(false);

  const configReady = Object.keys(sessionConfig).length > 0;

  useEffect(() => {
    if (!configReady || dateOptions.length === 0) return;

    let cancelled = false;

    const fetchRange = async () => {
      setLoading(true);
      try {
        // 1. Base capacities
        const { data: sessionsData } = await supabase
          .from('class_sessions')
          .select('id, max_capacity');
        const baseCaps: Record<string, number> = {};
        sessionsData?.forEach((s: any) => { baseCaps[s.id] = s.max_capacity; });

        const dateStrings = dateOptions.map(toDateStr);
        const startDate   = dateStrings[0];
        const endDate     = dateStrings[dateStrings.length - 1];

        // 2. Overrides
        const { data: overrides } = await supabase
          .from('class_calendar_overrides')
          .select('*')
          .in('date', dateStrings);

        // 3. Occupancy via RPC
        const { data: occupancy, error: rpcError } = await supabase.rpc(
          'get_calendar_availability',
          { start_date: startDate, end_date: endDate },
        );
        if (rpcError) console.error('RPC Availability Error:', rpcError);

        if (cancelled) return;

        // 4. Build map
        const newMap: Record<string, DailyAvailability> = {};

        dateStrings.forEach(dateStr => {
          const calculateStatus = (sessionId: string): SessionStatus => {
            const override = overrides?.find(
              (o: any) => o.date === dateStr && o.session_id === sessionId,
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
            const row      = occupancy?.find((o: any) => o.booking_date === dateStr && o.session_id === sessionId);
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

        setDailyStats(newMap);
      } catch (err) {
        console.error('Availability range fetch error:', err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchRange();
    return () => { cancelled = true; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dateOptions, configReady]);

  return { dailyStats, loading };
}
