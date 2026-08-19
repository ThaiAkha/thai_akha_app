import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { supabase, getFunctionErrorMessage } from '@thaiakha/shared/lib/supabase';
import { useAuth } from '../context/AuthContext';
import { getSmartAvatarUrlSafe } from '@thaiakha/shared/lib/avatarSystem';
import { getSessionCapacity, getSessionPrice } from '@thaiakha/shared/lib/sessionUtils';
import type { Tables, UserProfile } from '@thaiakha/shared/types';

export type UserMode = 'new' | 'existing' | 'agency' | 'internal';
export type PaymentStatus = 'paid' | 'unpaid';
export type SessionStatus = 'OPEN' | 'FULL' | 'CLOSED';

/** Riga bookings letta per il calcolo disponibilita' (select session_id, pax_count, guest_name). */
export type AvailabilityBooking = Pick<Tables<'bookings'>, 'session_id' | 'pax_count' | 'guest_name'>;
export interface SessionAvailability {
    status: SessionStatus;
    booked: number;
    total: number;
    bookings: AvailabilityBooking[];
}
export interface BookingAvailability {
    morning: SessionAvailability;
    evening: SessionAvailability;
}

/** Shape usata dal form (BookingContent): mirror del select '*, pickup_zones(*)' su hotel_locations. */
export interface BookingPickupZone {
    id: string;
    name: string;
    morning_pickup_time: string;
    evening_pickup_time: string;
}
export interface BookingHotel {
    id: string;
    name: string;
    lat?: number;
    lng?: number;
    pickup_zones?: BookingPickupZone;
}
export type BookingMeetingPoint = Pick<Tables<'meeting_points'>, 'id' | 'name'>;

export interface NewUser {
    fullName: string;
    email: string;
    phone: string;
    password: string;
    isWhatsapp: boolean;
    gender: 'male' | 'female' | 'other' | '';
    age: number | '';
    nationality: string;
}

export const useAdminBooking = () => {
    const { t } = useTranslation('booking');
    const { user: authUser } = useAuth();
    // --- STATE ---
    const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);
    const [session, setSession] = useState<'morning_class' | 'evening_class'>('morning_class');
    const [userMode, setUserMode] = useState<UserMode>('new');
    const [pax, setPax] = useState<number>(1);
    const [loading, setLoading] = useState(false);
    const [sessionPrices, setSessionPrices] = useState<Record<string, number | null>>({
        morning_class: null,
        evening_class: null
    });
    const [availability, setAvailability] = useState<BookingAvailability>({
        morning: { status: 'OPEN', booked: 0, total: 0, bookings: [] },
        evening: { status: 'OPEN', booked: 0, total: 0, bookings: [] },
    });

    const [newUser, setNewUser] = useState<NewUser>({
        fullName: '',
        email: '',
        phone: '',
        password: '',
        isWhatsapp: true,
        gender: '',
        age: '',
        nationality: ''
    });
    const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [searchResults, setSearchResults] = useState<UserProfile[]>([]);

    // Hotel Logistics
    const [hotelSearchQuery, setHotelSearchQuery] = useState('');
    const [hotelSearchResults, setHotelSearchResults] = useState<BookingHotel[]>([]);
    const [hotel, setHotel] = useState<BookingHotel | null>(null);
    const [isSelectingHotel, setIsSelectingHotel] = useState(false);
    const [pickupZone, setPickupZone] = useState<BookingPickupZone | null>(null);
    const [pickupTime, setPickupTime] = useState('');
    const [notes, setNotes] = useState('');
    const [amount, setAmount] = useState<number | null>(null);
    const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>('unpaid');
    const [hasLuggage, setHasLuggage] = useState(false);

    // Meeting Points
    const [meetingPoints, setMeetingPoints] = useState<BookingMeetingPoint[]>([]);
    const [meetingPoint, setMeetingPoint] = useState('');

    // --- LOGIC ---

    // Fetch Availability
    const fetchAvailability = useCallback(async () => {
        try {
            const { data: sData } = await supabase.from('class_sessions').select('id, max_capacity, price_thb');
            const caps: Record<string, number> = {};
            const prices: Record<string, number | null> = {};
            sData?.forEach((s) => {
                caps[s.id] = getSessionCapacity(s.max_capacity) ?? 0;
                prices[s.id] = getSessionPrice(s.price_thb);
            });
            setSessionPrices(prev => ({ ...prev, ...prices }));

            const { data: bData } = await supabase
                .from('bookings')
                .select('session_id, pax_count, guest_name')
                .eq('booking_date', date)
                .neq('status', 'cancelled');

            const { data: oData } = await supabase
                .from('class_calendar_overrides')
                .select('*')
                .eq('date', date);

            const getInfo = (sid: string) => {
                const override = oData?.find((o) => o.session_id === sid);
                const sessionBookings = bData?.filter((b) => b.session_id === sid) || [];
                const booked = sessionBookings.reduce((sum: number, b) => sum + (b.pax_count || 0), 0) || 0;
                const total = getSessionCapacity(override?.custom_capacity ?? caps[sid]) ?? 0;
                const closed = override?.is_closed;

                let status: SessionStatus = 'OPEN';
                if (closed) status = 'CLOSED';
                else if (total === 0 || booked >= total) status = 'FULL';

                return { booked, total, status, bookings: sessionBookings };
            };

            setAvailability({
                morning: getInfo('morning_class'),
                evening: getInfo('evening_class')
            });
        } catch (e) {
            console.error("Availability error:", e);
        }
    }, [date]);

    useEffect(() => {
        fetchAvailability();
    }, [fetchAvailability]);

    // Search Users
    useEffect(() => {
        const timer = setTimeout(async () => {
            if (searchTerm.length > 2 && (userMode === 'existing' || userMode === 'agency')) {
                try {
                    const role = userMode === 'existing' ? 'guest' : 'agency';
                    const baseSelect = 'id, full_name, email, role, agency_company_name, agency_phone';
                    let query = supabase.from('profiles').select(baseSelect);

                    if (userMode === 'agency') {
                        query = query.eq('role', 'agency').or(`full_name.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%,agency_company_name.ilike.%${searchTerm}%`);
                    } else {
                        query = query.neq('role', 'agency').or(`full_name.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%`);
                    }

                    const { data, error } = await query.limit(10);

                    console.log('[Search Users Debug]', { searchTerm, role, count: data?.length });

                    if (error) {
                        console.error('[Search Users Error]', error);
                        setSearchResults([]);
                    } else {
                        console.log('[Search Users Results]', data?.length, data);
                        // Select parziale su profiles (role string): il form legge la shape UserProfile.
                        setSearchResults((data || []) as unknown as UserProfile[]);
                    }
                } catch (e) {
                    console.error('[Search Users Exception]', e);
                    setSearchResults([]);
                }
            } else {
                setSearchResults([]);
            }
        }, 300);
        return () => clearTimeout(timer);
    }, [searchTerm, userMode]);

    // Search Hotels
    useEffect(() => {
        const timer = setTimeout(async () => {
            if (hotelSearchQuery.length >= 2 && !isSelectingHotel) {
                const { data } = await supabase.from('hotel_locations')
                    .select('*, pickup_zones(*)')
                    .ilike('name', `%${hotelSearchQuery}%`)
                    .limit(4);
                // Join hotel_locations + pickup_zones consumato con la shape del form (BookingHotel).
                setHotelSearchResults((data || []) as unknown as BookingHotel[]);
            } else {
                setHotelSearchResults([]);
            }
        }, 300);
        return () => clearTimeout(timer);
    }, [hotelSearchQuery, isSelectingHotel]);

    // Reset isSelectingHotel flag when query changes manually
    useEffect(() => {
        if (isSelectingHotel && hotel && hotelSearchQuery !== hotel.name) {
            setIsSelectingHotel(false);
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- deve scattare solo quando cambia la query
    }, [hotelSearchQuery]);

    // Fetch Meeting Points
    useEffect(() => {
        const fetchMeetingPoints = async () => {
            try {
                const { data, error } = await supabase.from('meeting_points').select('id, name').order('name');
                console.log("[useAdminBooking] Meeting Points query result:", { data, error });
                if (error) {
                    console.error("Meeting Points error:", error);
                } else {
                    setMeetingPoints(data || []);
                    console.log("[useAdminBooking] Meeting Points loaded:", data?.length);
                }
            } catch (e) {
                console.error("Meeting Points fetch error:", e);
            }
        };
        fetchMeetingPoints();
    }, []);

    // Handle Hotel Selection
    const handleHotelSelect = (h: BookingHotel) => {
        setIsSelectingHotel(true);
        setHotel(h);
        setHotelSearchQuery(h.name);
        setHotelSearchResults([]);
        if (h.pickup_zones) {
            setPickupZone(h.pickup_zones);
            // Auto-set time based on zone and session
            const time = session === 'morning_class'
                ? h.pickup_zones.morning_pickup_time
                : h.pickup_zones.evening_pickup_time;
            setPickupTime(time || '');
        }
    };

    // Auto-calc amount from DB price
    useEffect(() => {
        setAmount(pax * (sessionPrices[session] || 1200));
    }, [pax, session, sessionPrices]);

    // Clamp pax ... (unchanged)
    const currentSessionData = session === 'morning_class' ? availability.morning : availability.evening;
    const maxPax = Math.max(0, currentSessionData.total - currentSessionData.booked);

    useEffect(() => {
        if (maxPax > 0 && pax > maxPax) setPax(maxPax);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- clamp solo quando cambia la capienza
    }, [maxPax]);

    const handleCreate = async () => {
        if (!date || !session) return alert(t('alerts.missingDateSession'));
        if (!amount || amount <= 0) return alert(t('alerts.priceMissing'));
        if (userMode === 'new' && (!newUser.fullName || !newUser.password)) return alert(t('alerts.namePasswordRequired'));
        const { data: { session: currentSession } } = await supabase.auth.getSession();
        console.log("[useAdminBooking] handleCreate - session:", currentSession?.user?.id || 'NO SESSION');

        setLoading(true);
        try {
            let userId = selectedUser?.id;

            if (userMode === 'new') {
                // functions.invoke manda il JWT della sessione staff: l'edge verifica utente + ruolo (P1 audit 2026-08).
                const { data: uData, error: uError } = await supabase.functions.invoke('create-guest-user', {
                    body: {
                        email: newUser.email || `guest-${Date.now()}@temp.tak`,
                        full_name: newUser.fullName,
                        phone: newUser.phone,
                        password: newUser.password
                    }
                });
                if (uError) throw new Error(await getFunctionErrorMessage(uError));
                if (uData?.error) throw new Error(uData.error);

                userId = uData?.userId;
                if (userId) {
                    const avatarUrl = await getSmartAvatarUrlSafe(newUser.gender, newUser.age);
                    await supabase.from('profiles').update({
                        dietary_profile: 'diet_regular',
                        phone_number: newUser.phone,
                        whatsapp: newUser.isWhatsapp,
                        gender: newUser.gender || null,
                        age: newUser.age ? Number(newUser.age) : null,
                        nationality: newUser.nationality || null,
                        avatar_url: avatarUrl
                    }).eq('id', userId);
                }
            }

            // Default values for missing logistics data
            // BYPASS-PAYOUT (driver mapping) — default pickup driver booking-based = "At" (profilo driver reale).
            const defaultDriverId = '5629d491-6cd1-4344-9254-9bf8ccbba45f'; // At

            const { error: bError } = await supabase.from('bookings').insert({
                user_id: userMode === 'internal' ? authUser?.id : userId,
                guest_name: userMode === 'new' ? newUser.fullName : (userMode === 'internal' ? (authUser?.full_name || 'Staff') : selectedUser?.full_name),
                guest_email: userMode === 'new' ? newUser.email : (userMode === 'internal' ? authUser?.email : selectedUser?.email),
                phone_number: userMode === 'new' ? newUser.phone : (selectedUser?.agency_phone || selectedUser?.phone_number || null),
                booking_date: date,
                session_id: session,
                pax_count: pax,
                total_price: amount,
                status: 'confirmed',
                payment_status: paymentStatus,
                payment_method: userMode === 'agency' ? 'agency_invoice' : (paymentStatus === 'paid' ? 'cash' : 'pay_on_arrival'),
                hotel_name: hotel?.name || hotelSearchQuery || null,
                meeting_point: meetingPoint || null,
                pickup_zone: pickupZone?.id || (meetingPoint ? 'walk-in' : null),
                pickup_time: pickupTime || null,
                pickup_lat: hotel?.lat || null,
                pickup_lng: hotel?.lng || null,
                pickup_driver_uid: defaultDriverId,
                dropoff_hotel: hotel?.name || hotelSearchQuery || null,
                dropoff_zone: pickupZone?.id || (meetingPoint ? 'walk-in' : null),
                dropoff_lat: hotel?.lat || null,
                dropoff_lng: hotel?.lng || null,
                dropoff_driver_uid: defaultDriverId,
                customer_note: notes || null,
                has_luggage: hasLuggage,
                booking_source: userMode === 'internal' ? 'staff_internal' : 'admin_console'
            });

            if (bError) throw bError;

            alert(t('alerts.bookingCreated'));
            // Reset
            setPax(1); setNotes(''); setHotel(null); setPickupZone(null); setSelectedUser(null);
            setNewUser({ fullName: '', email: '', phone: '', password: '', isWhatsapp: true, gender: '', age: '', nationality: '' });
            setSearchTerm('');
            setHotelSearchQuery('');
            setMeetingPoint('');
            setPickupTime('');
            setHasLuggage(false);
            fetchAvailability();
        } catch (e: unknown) {
            // Error o PostgrestError: entrambi espongono .message (comportamento invariato)
            alert(t('alerts.errorPrefix', { message: (e as { message?: string } | null)?.message }));
        } finally {
            setLoading(false);
        }
    };

    return {
        date, setDate,
        session, setSession,
        userMode, setUserMode,
        pax, setPax,
        maxPax,
        pricePerHead: getSessionPrice(sessionPrices[session]),
        loading,
        availability,
        newUser, setNewUser,
        selectedUser, setSelectedUser,
        searchTerm, setSearchTerm,
        searchResults,
        hotelSearchQuery, setHotelSearchQuery,
        hotelSearchResults,
        handleHotelSelect,
        hotel, setHotel,
        pickupZone,
        pickupTime, setPickupTime,
        hasLuggage, setHasLuggage,
        notes, setNotes,
        amount, setAmount,
        paymentStatus, setPaymentStatus,
        handleCreate,
        currentSessionData,
        authUser,
        meetingPoints,
        meetingPoint, setMeetingPoint
    };
};
