/**
 * Driver Route - fasi, filtro sessione e macchina a stati delle fermate (colore + stato successivo).
 * Estratto da DriverRoute.tsx (#16 split monstre) a comportamento invariato.
 */
import type { TransportStatus } from '../../../components/driver/TransportStopCard';

export type Phase = 'PICKUP' | 'DROPOFF';
export type SessionFilter = 'morning_class' | 'evening_class';

// --- STATIC CONFIG (colors and next status only — labels come from t()) ---
export const STATUS_STATIC: Record<TransportStatus, { color: string; next: TransportStatus | null }> = {
    waiting: {
        color: 'bg-white text-black hover:bg-white/90',
        next: 'driver_en_route'
    },
    driver_en_route: {
        color: 'bg-primary-600 text-white hover:bg-primary-700',
        next: 'driver_arrived'
    },
    driver_arrived: {
        color: 'bg-yellow-500 text-black hover:bg-yellow-400',
        next: 'on_board'
    },
    on_board: {
        color: 'bg-green-600 text-white hover:bg-green-700',
        next: 'dropped_off'
    },
    dropped_off: {
        color: 'bg-gray-700 text-gray-400 cursor-not-allowed',
        next: null
    }
};
