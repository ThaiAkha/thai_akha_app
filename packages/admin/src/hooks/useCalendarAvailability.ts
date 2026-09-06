import { useQuery, useQueryClient } from '@thaiakha/shared/query';
import { supabase } from '@thaiakha/shared/lib/supabase';
import type { Tables } from '@thaiakha/shared/types';
import { getSessionCapacity } from '@thaiakha/shared/lib/sessionUtils';
import { getDateKey } from '@thaiakha/shared/lib/dateKeyUtils';

export interface SessionStatus {
    status: 'OPEN' | 'FULL' | 'CLOSED';
    seats: number;
    capacity: number;
    isLocked?: boolean;
    reason?: string | null;
    occupiedCount: number;
}

export interface DayData {
    morning_class: SessionStatus;
    evening_class: SessionStatus;
    hasBookings: boolean;
}

const NO_AVAILABILITY: Record<string, DayData> = {};

/** Una data passata e' chiusa; oggi si chiude alle 10 per la mattina e alle 17 per la sera. */
const checkLock = (dateStr: string, session: 'morning_class' | 'evening_class'): boolean => {
    const todayStr = getDateKey(new Date());
    if (dateStr < todayStr) return true;
    if (dateStr > todayStr) return false;
    const nowHour = new Date().getHours();
    if (session === 'morning_class') return nowHour >= 10;
    if (session === 'evening_class') return nowHour >= 17;
    return false;
};

/**
 * Capienza delle sessioni: una riga per sessione, non cambia praticamente mai.
 * Prima viveva in un `useRef` azzerato a ogni cambio mese, quindi si rileggeva
 * dodici volte per sfogliare un anno. Con una chiave sua si legge una volta.
 */
export const sessionCapacityQueryKey = ['class_sessions', 'capacity'] as const;

async function fetchSessionCapacity(): Promise<Record<string, number>> {
    const { data } = await supabase.from('class_sessions').select('id, max_capacity');
    const out: Record<string, number> = {};
    data?.forEach((s) => { out[s.id] = getSessionCapacity(s.max_capacity) ?? 0; });
    return out;
}

/** La griglia del calendario copre sei settimane a partire dalla domenica prima del primo del mese. */
function gridRange(viewDate: Date): { start: string; end: string; startGrid: Date } {
    const year = viewDate.getFullYear();
    const month = viewDate.getMonth();
    const firstDayOfMonth = new Date(year, month, 1);
    const startGrid = new Date(year, month, 1 - firstDayOfMonth.getDay());
    const endGrid = new Date(startGrid);
    endGrid.setDate(startGrid.getDate() + 42);
    return { start: getDateKey(startGrid), end: getDateKey(endGrid), startGrid };
}

export const calendarAvailabilityQueryKey = (start: string, end: string) =>
    ['calendar_availability', start, end] as const;

async function fetchAvailability(
    startGrid: Date,
    startDateStr: string,
    endDateStr: string,
    capacity: Record<string, number>,
): Promise<Record<string, DayData>> {
    const [{ data: bookings }, { data: overrides }] = await Promise.all([
        supabase.rpc('get_calendar_availability', { start_date: startDateStr, end_date: endDateStr }),
        supabase
            .from('class_calendar_overrides')
            .select('*')
            .gte('date', startDateStr)
            .lte('date', endDateStr),
    ]);

    const bookingsMap = new Map<string, number>();
    bookings?.forEach((b: { booking_date: string; session_id: string; total_occupied: number }) => {
        bookingsMap.set(`${b.booking_date}-${b.session_id}`, b.total_occupied);
    });

    const overridesMap = new Map<string, Tables<'class_calendar_overrides'>>();
    overrides?.forEach(o => { overridesMap.set(`${o.date}-${o.session_id}`, o); });

    const statusMap: Record<string, DayData> = {};
    const loopDate = new Date(startGrid);

    for (let i = 0; i < 42; i++) {
        const dateStr = getDateKey(loopDate);

        const getStatus = (sessionId: 'morning_class' | 'evening_class'): SessionStatus => {
            const mapKey = `${dateStr}-${sessionId}`;
            const override = overridesMap.get(mapKey);
            const occupied = bookingsMap.get(mapKey) || 0;
            const capacityValue = getSessionCapacity(override?.custom_capacity ?? capacity[sessionId]) ?? 0;

            if (override?.is_closed) {
                return {
                    status: 'CLOSED',
                    seats: 0,
                    capacity: capacityValue,
                    isLocked: checkLock(dateStr, sessionId),
                    reason: override.closure_reason,
                    occupiedCount: occupied,
                };
            }

            const remaining = Math.max(0, capacityValue - occupied);
            return {
                status: remaining > 0 ? 'OPEN' : 'FULL',
                seats: remaining,
                capacity: capacityValue,
                isLocked: checkLock(dateStr, sessionId),
                reason: override?.closure_reason,
                occupiedCount: occupied,
            };
        };

        const morning = getStatus('morning_class');
        const evening = getStatus('evening_class');
        statusMap[dateStr] = {
            morning_class: morning,
            evening_class: evening,
            hasBookings: morning.occupiedCount > 0 || evening.occupiedCount > 0,
        };

        loopDate.setDate(loopDate.getDate() + 1);
    }

    return statusMap;
}

/**
 * Data layer unico (CLAUDE.md #17): era `useState` + `useEffect` + fetch a mano,
 * con la capienza delle sessioni tenuta in un `useRef` e buttata a ogni cambio mese.
 *
 * `setAvailability` e `refresh` restano, con la stessa firma: `useAdminCalendar`
 * li usa per l'aggiornamento ottimistico delle chiusure (mostra subito il nuovo
 * stato, salva, poi risincronizza). Cambia solo dove vive il dato: non piu' uno
 * stato locale ma la cache delle query, quindi la stessa scrittura ottimistica
 * si vede anche nelle altre schermate che leggono lo stesso mese.
 */
export const useCalendarAvailability = (viewDate: Date) => {
    const { start, end, startGrid } = gridRange(viewDate);

    const capacityQuery = useQuery({
        queryKey: sessionCapacityQueryKey,
        queryFn: fetchSessionCapacity,
    });

    const capacity = capacityQuery.data;
    const availabilityQuery = useQuery({
        queryKey: calendarAvailabilityQueryKey(start, end),
        queryFn: () => fetchAvailability(startGrid, start, end, capacity ?? {}),
        enabled: !!capacity,
    });

    const queryClient = useQueryClient();
    const key = calendarAvailabilityQueryKey(start, end);

    return {
        availability: availabilityQuery.data ?? NO_AVAILABILITY,
        loading: capacityQuery.isPending || availabilityQuery.isPending,
        /** Aggiornamento ottimistico: scrive nella cache il mese gia' modificato. */
        setAvailability: (next: Record<string, DayData>) => queryClient.setQueryData(key, next),
        /** Risincronizza in sottofondo, senza rimettere la schermata in attesa. */
        refresh: () => { void queryClient.invalidateQueries({ queryKey: key }); },
    };
};
