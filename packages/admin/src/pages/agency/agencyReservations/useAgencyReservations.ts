/**
 * Agency Reservations - stato e dati: prenotazioni dell'agenzia loggata, selezione, ricerca/filtro,
 * form di modifica e salvataggio. Estratto da AgencyReservations.tsx (#16 split monstre), invariato.
 */
import { useState, useEffect, useMemo } from 'react';
import { supabase } from '@thaiakha/shared/lib/supabase';
import { useAuth } from '../../../context/AuthContext';
import { useTranslation } from 'react-i18next';
import type { Tables } from '@thaiakha/shared/types';
import { getDisplayId, type AgencyBooking } from './types';

/** Shape of the bookings select in fetchBookings (join profiles). */
type AgencyBookingRow = Pick<Tables<'bookings'>,
    'internal_id' | 'booking_ref' | 'booking_date' | 'session_id' | 'pax_count' | 'total_price' | 'status' |
    'commission_amount' | 'customer_note' | 'agency_note' | 'hotel_name' | 'pickup_time' | 'pickup_zone' | 'phone_number' |
    'guest_name' | 'guest_email'
> & { profiles: { full_name: string | null; email: string | null } | null };

export function useAgencyReservations() {
    const { t, i18n } = useTranslation('reservation');
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [bookings, setBookings] = useState<AgencyBooking[]>([]);
    const [selectedBookingId, setSelectedBookingId] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [isEditing, setIsEditing] = useState(false);
    const [editForm, setEditForm] = useState<Partial<AgencyBooking>>({});
    const [isSaving, setIsSaving] = useState(false);

    const fetchBookings = async () => {
        if (!user) return;
        setLoading(true);
        try {
            let query = supabase
                .from('bookings')
                .select(`
          internal_id, booking_ref, booking_date, session_id, pax_count, total_price, status,
          commission_amount,
          customer_note, agency_note, hotel_name, pickup_time, pickup_zone, phone_number,
          guest_name, guest_email,
          profiles:user_id(full_name, email)
        `)
                .order('booking_date', { ascending: false });

            if (user.role === 'agency') query = query.eq('user_id', user.id);

            const { data } = await query;
            // Join select not inferable by supabase-js: one cast to the declared row shape.
            const mapped: AgencyBooking[] = ((data || []) as unknown as AgencyBookingRow[]).map((b) => ({
                internal_id: b.internal_id,
                booking_ref: b.booking_ref,
                guest_name: b.guest_name || b.profiles?.full_name || 'Guest',
                email: b.guest_email || b.profiles?.email || '',
                booking_date: b.booking_date,
                session_type: b.session_id?.includes('morning') ? 'Morning Class' : 'Evening Class',
                // DB columns are nullable, the domain type is stricter: same values as before (row was untyped).
                pax: b.pax_count as number,
                total_price: b.total_price as number,
                commission: b.commission_amount ?? 0,
                status: b.status as AgencyBooking['status'],
                hotel_name: b.hotel_name || '',
                pickup_time: b.pickup_time ? b.pickup_time.slice(0, 5) : '--:--',
                pickup_zone: b.pickup_zone || 'pending',
                customer_note: b.customer_note || '',
                agency_note: b.agency_note || '',
                phone_number: b.phone_number || ''
            }));
            setBookings(mapped);
        } catch (error) {
            console.error("Error fetching bookings:", error);
        } finally {
            setLoading(false);
        }
    };

    // ✅ AppHeader handles metadata loading automatically

    // eslint-disable-next-line react-hooks/exhaustive-deps -- fetchBookings is recreated every render; refetch only when the user changes
    useEffect(() => { fetchBookings(); }, [user]);

    const activeBooking = useMemo(() => bookings.find(b => b.internal_id === selectedBookingId), [bookings, selectedBookingId]);

    useEffect(() => {
        if (activeBooking) {
            setEditForm({
                hotel_name: activeBooking.hotel_name,
                pickup_time: activeBooking.pickup_time,
                agency_note: activeBooking.agency_note,
                status: activeBooking.status
            });
            setIsEditing(false);
        }
    }, [activeBooking]);

    const handleSave = async () => {
        if (!activeBooking) return;
        setIsSaving(true);
        try {
            await supabase.from('bookings').update(editForm).eq('internal_id', activeBooking.internal_id);
            fetchBookings();
            setIsEditing(false);
        } catch (error) {
            console.error("Error updating booking:", error);
        } finally {
            setIsSaving(false);
        }
    };

    const filteredList = useMemo(() => {
        return bookings.filter(b => (statusFilter === 'all' || b.status === statusFilter) &&
            (b.guest_name.toLowerCase().includes(searchQuery.toLowerCase()) || getDisplayId(b).toLowerCase().includes(searchQuery.toLowerCase())));
    }, [bookings, statusFilter, searchQuery]);

    return {
        user, t, i18n, loading, setLoading, bookings, setBookings, selectedBookingId, setSelectedBookingId, searchQuery, setSearchQuery, statusFilter, setStatusFilter, isEditing, setIsEditing, editForm, setEditForm, isSaving, setIsSaving, fetchBookings, activeBooking, handleSave, filteredList,
    };
}

export type AgencyReservationsState = ReturnType<typeof useAgencyReservations>;
