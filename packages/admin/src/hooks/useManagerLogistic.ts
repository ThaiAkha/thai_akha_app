import { useState, useEffect, useMemo, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { SessionType } from '../components/common/ClassPicker';

// --- TYPES ---
export interface LogisticsItem {
    id: string;
    guest_name: string;
    pax: number;
    hotel_name: string;
    pickup_time: string;
    pickup_zone: string;
    route_order: number;
    avatar_url?: string;
    pickup_driver_uid: string | null;
    has_missing_info: boolean;
    customer_note?: string;
    agency_note?: string;
    phone_number?: string;
    session_id: string;
    booking_date: string;
    transport_status: string;
    // Drop-off fields
    requires_dropoff: boolean;
    dropoff_hotel: string | null;
    dropoff_zone: string | null;
    dropoff_driver_uid: string | null;
    dropoff_sequence: number;
    pickup_sequence: number;
    // Meeting point
    meeting_point: string | null;
    // Zone color
    pickup_zone_color: string | null;
    // Luggage
    has_luggage: boolean;
}

export interface DriverProfile {
    id: string;
    full_name: string;
    avatar_url?: string;
}

export interface SessionSummary {
    date: string;
    session_id: string;
    unassigned_count: number;
}

export interface HotelOption {
    id: string;
    name: string;
    zone_id: string | null;
}

export interface MeetingPointOption {
    id: string;
    name: string;
    morning_pickup_time: string | null;
    evening_pickup_time: string | null;
}

export interface PickupZoneOption {
    id: string;
    name: string;
    color_code: string | null;
    morning_pickup_time: string | null;
    evening_pickup_time: string | null;
}

export function useManagerLogistic() {
    const [loading, setLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [items, setItems] = useState<LogisticsItem[]>([]);
    const [drivers, setDrivers] = useState<DriverProfile[]>([]);
    const [upcomingSessions, setUpcomingSessions] = useState<SessionSummary[]>([]);

    // Reference data
    const [hotels, setHotels] = useState<HotelOption[]>([]);
    const [meetingPoints, setMeetingPoints] = useState<MeetingPointOption[]>([]);
    const [pickupZones, setPickupZones] = useState<PickupZoneOption[]>([]);

    // Selection State
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
    const [selectedSessionId, setSelectedSessionId] = useState<SessionType>('morning_class');
    const [selectedBookingId, setSelectedBookingId] = useState<string | null>(null);

    // ✅ AppHeader handles metadata loading automatically

    // --- REFERENCE DATA FETCH (once on mount) ---
    useEffect(() => {
        const fetchReferenceData = async () => {
            const [hotelRes, mpRes, zoneRes] = await Promise.all([
                supabase
                    .from('hotel_locations')
                    .select('id, name, zone_id')
                    .eq('is_active', true)
                    .eq('review_status', 'approved')
                    .order('name', { ascending: true }),
                supabase
                    .from('meeting_points')
                    .select('id, name, morning_pickup_time, evening_pickup_time')
                    .eq('active', true)
                    .order('name', { ascending: true }),
                supabase
                    .from('pickup_zones')
                    .select('id, name, color_code, morning_pickup_time, evening_pickup_time')
                    .order('display_order', { ascending: true }),
            ]);

            if (hotelRes.data) setHotels(hotelRes.data);
            if (mpRes.data) setMeetingPoints(mpRes.data);
            if (zoneRes.data) setPickupZones(zoneRes.data);
        };

        fetchReferenceData();
    }, []);

    // --- SESSION DATA FETCHING ---
    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            // A. Fetch Next 10 Sessions
            const today = new Date().toISOString().split('T')[0];
            const { data: upcomingData } = await supabase
                .from('bookings')
                .select('booking_date, session_id, pickup_driver_uid')
                .gte('booking_date', today)
                .neq('status', 'cancelled')
                .order('booking_date', { ascending: true });

            if (upcomingData) {
                const summaries: Record<string, SessionSummary> = {};
                upcomingData.forEach(b => {
                    const key = `${b.booking_date}_${b.session_id}`;
                    if (!summaries[key]) {
                        summaries[key] = { date: b.booking_date, session_id: b.session_id, unassigned_count: 0 };
                    }
                    if (!b.pickup_driver_uid) summaries[key].unassigned_count++;
                });
                setUpcomingSessions(Object.values(summaries).slice(0, 10));
            }

            // B. Fetch Drivers
            const { data: driverData } = await supabase
                .from('profiles')
                .select('id, full_name, avatar_url')
                .eq('role', 'driver')
                .order('full_name');
            setDrivers(driverData || []);

            // C. Fetch Selected Session Items (all transport-related fields)
            const { data: bookingData } = await supabase
                .from('bookings')
                .select(`
                    internal_id, pax_count, hotel_name, pickup_zone, pickup_time, route_order,
                    customer_note, agency_note, pickup_driver_uid, phone_number, session_id,
                    booking_date, transport_status, guest_name, guest_email,
                    requires_dropoff, dropoff_hotel, dropoff_zone, dropoff_driver_uid,
                    dropoff_sequence, pickup_sequence, meeting_point, has_luggage,
                    profiles:user_id(full_name, avatar_url)
                `)
                .eq('booking_date', selectedDate)
                .eq('session_id', selectedSessionId)
                .neq('status', 'cancelled')
                .order('route_order', { ascending: true });

            if (bookingData) {
                setItems(bookingData.map((b: any) => {
                    // Resolve meeting point name from ID
                    const meetingPointName = b.meeting_point
                        ? meetingPoints.find(mp => mp.id === b.meeting_point)?.name || b.meeting_point
                        : null;

                    // Resolve pickup zone color
                    const zoneColor = b.pickup_zone
                        ? pickupZones.find(z => z.id === b.pickup_zone)?.color_code || null
                        : null;

                    return {
                        id: b.internal_id,
                        guest_name: b.guest_name || b.profiles?.full_name || 'Guest',
                        pax: b.pax_count,
                        hotel_name: b.hotel_name || '',
                        pickup_time: b.pickup_time || '',
                        pickup_zone: b.pickup_zone || 'pending',
                        route_order: b.route_order || 0,
                        avatar_url: b.profiles?.avatar_url,
                        pickup_driver_uid: b.pickup_driver_uid,
                        has_missing_info: !b.hotel_name && !b.meeting_point,
                        customer_note: b.customer_note,
                        agency_note: b.agency_note,
                        phone_number: b.phone_number,
                        session_id: b.session_id,
                        booking_date: b.booking_date,
                        transport_status: b.transport_status,
                        requires_dropoff: b.requires_dropoff ?? true,
                        dropoff_hotel: b.dropoff_hotel,
                        dropoff_zone: b.dropoff_zone,
                        dropoff_driver_uid: b.dropoff_driver_uid,
                        dropoff_sequence: b.dropoff_sequence ?? 99,
                        pickup_sequence: b.pickup_sequence ?? 99,
                        meeting_point: meetingPointName,
                        pickup_zone_color: zoneColor,
                        has_luggage: b.has_luggage ?? false,
                    };
                }));
            }
        } finally {
            setLoading(false);
        }
    }, [selectedDate, selectedSessionId, meetingPoints, pickupZones]);

    useEffect(() => { fetchData(); }, [fetchData]);

    // --- ACTIONS ---
    const handleAssign = useCallback(async (bookingId: string, driverId: string | null) => {
        const { error } = await supabase
            .from('bookings')
            .update({ pickup_driver_uid: driverId, route_order: 99 })
            .eq('internal_id', bookingId);

        if (!error) fetchData();
    }, [fetchData]);

    const handleUpdateBooking = useCallback(async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedBookingId) return;
        setIsSaving(true);

        const item = items.find(i => i.id === selectedBookingId);
        if (!item) { setIsSaving(false); return; }

        const { error } = await supabase
            .from('bookings')
            .update({
                hotel_name: item.hotel_name || null,
                pickup_time: item.pickup_time || null,
                // pickup_zone has a CHECK constraint — only send valid values or null
                pickup_zone: item.pickup_zone || null,
                customer_note: item.customer_note || null,
                agency_note: item.agency_note || null,
                phone_number: item.phone_number || null,
                meeting_point: item.meeting_point || null,
                requires_dropoff: item.requires_dropoff,
                dropoff_hotel: item.dropoff_hotel || null,
                // dropoff_zone also has a CHECK constraint — same guard
                dropoff_zone: item.dropoff_zone || null,
            })
            .eq('internal_id', selectedBookingId);

        if (!error) {
            fetchData();
        }
        setIsSaving(false);
    }, [selectedBookingId, items, fetchData]);

    const updateLocalItem = useCallback((id: string, updates: Partial<LogisticsItem>) => {
        setItems(prev => prev.map(i => i.id === id ? { ...i, ...updates } : i));
    }, []);

    const closeInspector = useCallback(() => {
        setSelectedBookingId(null);
    }, []);

    // --- COMPUTED ---
    const unassignedItems = useMemo(() => items.filter(i => !i.pickup_driver_uid), [items]);
    const selectedBooking = useMemo(() => items.find(i => i.id === selectedBookingId) || null, [items, selectedBookingId]);

    return {
        // Data
        items,
        drivers,
        upcomingSessions,
        unassignedItems,
        selectedBooking,
        hotels,
        meetingPoints,
        pickupZones,

        // State
        loading,
        isSaving,
        selectedDate,
        selectedSessionId,
        selectedBookingId,

        // Setters
        setSelectedDate,
        setSelectedSessionId,
        setSelectedBookingId,

        // Actions
        fetchData,
        handleAssign,
        handleUpdateBooking,
        updateLocalItem,
        closeInspector,
    };
}
