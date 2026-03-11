import { useState, useEffect, useMemo, useCallback } from 'react';
import { supabase } from '@thaiakha/shared/lib/supabase';
import { SessionType } from '../components/common/ClassPicker';

export function useManagerReservation() {
    const [globalDate, setGlobalDate] = useState(new Date().toISOString().split('T')[0]);
    const [globalSession, setGlobalSession] = useState<SessionType>('all');
    const [loading, setLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [bookings, setBookings] = useState<any[]>([]);
    const [selectedBooking, setSelectedBooking] = useState<any | null>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [editData, setEditData] = useState<any>(null);

    // ✅ AppHeader handles metadata loading automatically

    // --- FETCH DATA ---
    const fetchTableData = useCallback(async () => {
        setLoading(true);
        try {
            let query = supabase
                .from('bookings')
                .select(`
                    internal_id, booking_ref, pax_count, status, session_id, booking_date, pickup_time, customer_note,
                    hotel_name, pickup_zone, meeting_point, requires_dropoff, phone_number, agency_note, user_id, guest_name, guest_email,
                    profiles:user_id(full_name, email, dietary_profile, allergies, avatar_url),
                    menu_selections(curry:curry_id(name), soup:soup_id(name), stirfry:stirfry_id(name))
                `)
                .order('status', { ascending: false })
                .order('booking_date', { ascending: false })
                .order('pickup_time', { ascending: true })
                .limit(100);

            // Only filter by date if needed
            if (globalDate) {
                query = query.eq('booking_date', globalDate);
            }

            if (globalSession !== 'all') {
                query = query.eq('session_id', globalSession);
            }

            const { data, error } = await query;
            if (error) {
                console.error("Fetch Error:", error);
                throw error;
            }

            console.log('Bookings loaded:', data?.length || 0, 'for date:', globalDate);
            setBookings(data || []);

            if (selectedBooking) {
                const updated = data?.find((b: any) => b.internal_id === selectedBooking.internal_id);
                if (updated) setSelectedBooking(updated);
            }
        } catch (e) {
            console.error("Fetch Error:", e);
            setBookings([]);
        } finally {
            setLoading(false);
        }
    }, [globalDate, globalSession, selectedBooking]);

    useEffect(() => {
        fetchTableData();
    }, [globalDate, globalSession]);

    // --- ACTIONS ---
    const handleSelectBooking = useCallback((booking: any) => {
        if (selectedBooking?.internal_id === booking.internal_id) {
            setSelectedBooking(null);
            setIsEditing(false);
        } else {
            setSelectedBooking(booking);
            setIsEditing(false);
        }
    }, [selectedBooking]);

    const handleEditStart = useCallback(() => {
        if (!selectedBooking) return;
        setIsEditing(true);
        setEditData({
            booking_date: selectedBooking.booking_date,
            session_id: selectedBooking.session_id,
            pax_count: selectedBooking.pax_count,
            phone_number: selectedBooking.phone_number || '',
            has_whatsapp: selectedBooking.has_whatsapp || false,
            payment_status: selectedBooking.payment_status || 'pending',
            customer_note: selectedBooking.customer_note || '',
            full_name: selectedBooking.profiles?.full_name || '',
            dietary_profile: selectedBooking.profiles?.dietary_profile || 'diet_regular',
            allergies: Array.isArray(selectedBooking.profiles?.allergies)
                ? selectedBooking.profiles.allergies.join(', ')
                : (typeof selectedBooking.profiles?.allergies === 'string' ? selectedBooking.profiles.allergies : ''),
            hotel_name: selectedBooking.hotel_name || '',
            status: selectedBooking.status
        });
    }, [selectedBooking]);

    const handleSave = useCallback(async () => {
        if (!selectedBooking || !editData) return;
        setIsSaving(true);
        try {
            if (selectedBooking.user_id) {
                const { error: profileError } = await supabase
                    .from('profiles')
                    .update({
                        full_name: editData.full_name,
                        dietary_profile: editData.dietary_profile,
                        allergies: editData.allergies
                            ? editData.allergies.split(',').map((s: string) => s.trim()).filter(Boolean)
                            : []
                    })
                    .eq('id', selectedBooking.user_id);

                if (profileError) throw profileError;
            }

            const { error: bookingError } = await supabase
                .from('bookings')
                .update({
                    booking_date: editData.booking_date,
                    session_id: editData.session_id,
                    pax_count: parseInt(editData.pax_count),
                    phone_number: editData.phone_number,
                    has_whatsapp: editData.has_whatsapp,
                    payment_status: editData.payment_status,
                    customer_note: editData.customer_note,
                    hotel_name: editData.hotel_name,
                    status: editData.status
                })
                .eq('internal_id', selectedBooking.internal_id);

            if (bookingError) throw bookingError;

            setIsEditing(false);
            fetchTableData();
        } catch (err) {
            console.error("Save Error:", err);
            alert("Save Error: " + (err as any).message);
        } finally {
            setIsSaving(false);
        }
    }, [selectedBooking, editData, fetchTableData]);

    const handleCancelBooking = useCallback(async (bookingId: string) => {
        setIsSaving(true);
        try {
            const { error } = await supabase
                .from('bookings')
                .update({ status: 'cancelled' })
                .eq('internal_id', bookingId);

            if (error) throw error;

            console.log('Booking cancelled:', bookingId);
            fetchTableData();
        } catch (err) {
            console.error("Cancel Error:", err);
            alert("Cancel Error: " + (err as any).message);
        } finally {
            setIsSaving(false);
        }
    }, [fetchTableData]);

    const handleRestoreBooking = useCallback(async (bookingId: string) => {
        setIsSaving(true);
        try {
            const { error } = await supabase
                .from('bookings')
                .update({ status: 'confirmed' })
                .eq('internal_id', bookingId);

            if (error) throw error;

            console.log('Booking restored:', bookingId);
            fetchTableData();
        } catch (err) {
            console.error("Restore Error:", err);
            alert("Restore Error: " + (err as any).message);
        } finally {
            setIsSaving(false);
        }
    }, [fetchTableData]);

    const handleDeleteBooking = useCallback(async (bookingId: string) => {
        setIsSaving(true);
        try {
            const { error } = await supabase
                .from('bookings')
                .delete()
                .eq('internal_id', bookingId);

            if (error) throw error;

            console.log('Booking deleted permanently:', bookingId);
            setSelectedBooking(null);
            setIsEditing(false);
            fetchTableData();
        } catch (err) {
            console.error("Delete Error:", err);
            alert("Delete Error: " + (err as any).message);
        } finally {
            setIsSaving(false);
        }
    }, [fetchTableData]);

    const closeInspector = useCallback(() => {
        setSelectedBooking(null);
        setIsEditing(false);
    }, []);

    // --- COMPUTED ---
    const stats = useMemo(() => {
        const totalPax = bookings.reduce((acc: number, b: any) => acc + (b.pax_count || 0), 0);
        const dietaryCounts: Record<string, number> = {};
        bookings.forEach((b: any) => {
            const diet = (b.profiles?.dietary_profile || 'diet_regular').replace('diet_', '');
            dietaryCounts[diet] = (dietaryCounts[diet] || 0) + 1;
        });
        return { totalPax, totalBookings: bookings.length, dietaryCounts };
    }, [bookings]);

    return {
        // Data
        bookings,
        selectedBooking,
        editData,
        stats,

        // State
        loading,
        isSaving,
        isEditing,
        globalDate,
        globalSession,

        // Setters
        setGlobalDate,
        setGlobalSession,
        setIsEditing,
        setEditData,

        // Actions
        fetchTableData,
        handleSelectBooking,
        handleEditStart,
        handleSave,
        handleCancelBooking,
        handleRestoreBooking,
        handleDeleteBooking,
        closeInspector,
    };
}
