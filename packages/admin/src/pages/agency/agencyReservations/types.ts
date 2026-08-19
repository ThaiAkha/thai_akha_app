/**
 * Agency Reservations - tipo prenotazione agenzia + helper locale/id visualizzato.
 * Estratti da AgencyReservations.tsx (#16 split monstre) a comportamento invariato.
 */
import { getLocaleCode } from '../../../lib/dateFormatter';

export const getLocale = getLocaleCode;

export interface AgencyBooking {
    internal_id: string;
    booking_ref: string | null;
    guest_name: string;
    email: string;
    booking_date: string;
    session_type: string;
    pax: number;
    total_price: number;
    commission: number;
    status: 'confirmed' | 'pending' | 'cancelled' | 'completed';
    hotel_name: string;
    pickup_time: string;
    pickup_zone: string;
    customer_note: string;
    agency_note: string;
    phone_number: string;
}

export const getDisplayId = (b: AgencyBooking) => b.booking_ref || b.internal_id.slice(0, 8).toUpperCase();
