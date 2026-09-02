/**
 * Driver Route - stato e logica: profilo driver, fermate del giorno (RPC), fase pickup/dropoff,
 * avanzamento stato fermata, avvio corsa, calcolo payout. Estratto da DriverRoute.tsx (#16 split
 * monstre) a comportamento invariato: la pagina riceve questo oggetto.
 */
import { useState, useEffect, useMemo, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { supabase } from '@thaiakha/shared/lib/supabase';
import { authService, UserProfile } from '../../../services/auth.service';
import type { Stop, TransportStatus } from '../../../components/driver/TransportStopCard';
import { STATUS_STATIC, type Phase, type SessionFilter } from './driverRouteConfig';

export function useDriverRoute() {
    const { t } = useTranslation('driver');

    const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
    const [stops, setStops] = useState<Stop[]>([]);
    const [confirmId, setConfirmId] = useState<string | null>(null);
    const [phase, setPhase] = useState<Phase>('PICKUP');
    const [showPayoutModal, setShowPayoutModal] = useState(false);
    const [payoutAmount, setPayoutAmount] = useState<number | null>(null);
    const [startRouteClicks, setStartRouteClicks] = useState(0);
    const [dropoffStartedManual, setDropoffStartedManual] = useState(false);

    const [activeDate, setActiveDate] = useState(new Date().toISOString().split('T')[0]);
    const [sessionFilter, setSessionFilter] = useState<SessionFilter>('morning_class');

    // Computed STATUS_CONFIG with translated labels
    const STATUS_CONFIG = useMemo(() => ({
        waiting: {
            ...STATUS_STATIC.waiting,
            label: t('statusLabels.waiting'),
            actionLabel: t('actions.startPickup'),
        },
        driver_en_route: {
            ...STATUS_STATIC.driver_en_route,
            label: t('statusLabels.enRoute'),
            actionLabel: t('actions.imHere'),
        },
        driver_arrived: {
            ...STATUS_STATIC.driver_arrived,
            label: t('statusLabels.atLobby'),
            actionLabel: t('actions.pickupPax'),
        },
        on_board: {
            ...STATUS_STATIC.on_board,
            label: t('statusLabels.onBoard'),
            actionLabel: t('actions.dropComplete'),
        },
        dropped_off: {
            ...STATUS_STATIC.dropped_off,
            label: t('statusLabels.completed'),
            actionLabel: t('actions.done'),
        },
    }), [t]);

    // 2. AUTH INITIALIZATION
    useEffect(() => {
        authService.getCurrentUserProfile().then(profile => {
            if (profile) setUserProfile(profile);
        });
    }, []);

    // 3. FETCH ROUTE DATA
    const fetchRoute = useCallback(async () => {
        if (!userProfile) return;
        try {
            // Legge dalla RPC driver_route(), non da bookings: la funzione espone i campi
            // di trasporto + guest_name/avatar_url e NON le colonne sanitarie del profilo
            // (allergies, dietary_profile). Vedi Privacy 2142; era la vista driver_route_v
            // (20260728000200_profiles_privilege_guard), diventata funzione con lo stesso
            // filtro nella migration 20260902200000_driver_route_rpc (advisor 0010). Si
            // auto-scopa come bookings_select_scoped, quindi i filtri qui restano identici.
            const { data, error } = await supabase
                .rpc('driver_route')
                .select(`
                    internal_id, status, pax_count, hotel_name, pickup_zone, pickup_time, phone_number, customer_note, session_id, route_order,
                    pickup_driver_uid, transport_status, dropoff_hotel, requires_dropoff,
                    guest_name, avatar_url
                `)
                .eq('booking_date', activeDate)
                .neq('status', 'cancelled')
                .order('route_order', { ascending: true })
                .order('pickup_time', { ascending: true });

            if (error) throw error;

            if (data) {
                setStops(data.map((b) => ({ ...b }) as Stop));
            }
        } catch (error) {
            console.error("Supabase Fetch Error:", error);
        }
    }, [userProfile, activeDate]);

    // Auto-refresh: 30s interval
    useEffect(() => {
        if (!userProfile) return;
        fetchRoute();
        const interval = setInterval(fetchRoute, 30000);
        return () => clearInterval(interval);
    }, [userProfile, fetchRoute]);

    // Auto-detect phase based on booking statuses
    useEffect(() => {
        const sessionStops = stops.filter(s => s.session_id === sessionFilter);
        const hasPickupPhase = sessionStops.some(s =>
            ['waiting', 'driver_en_route', 'driver_arrived'].includes(s.transport_status)
        );

        if (hasPickupPhase) {
            setPhase('PICKUP');
        } else {
            const hasDropoffPhase = sessionStops.some(s =>
                s.transport_status === 'on_board' && s.requires_dropoff !== false
            );
            if (hasDropoffPhase && phase === 'PICKUP') {
                setPhase('DROPOFF');
            }
        }
    }, [stops, sessionFilter, phase]);

    useEffect(() => {
        setDropoffStartedManual(false);
    }, [phase, sessionFilter]);

    // 4. MEMOIZED FILTERING
    const visibleStops = useMemo(() => {
        let filtered = stops;

        if (userProfile?.role === 'driver') {
            filtered = stops.filter(s => s.pickup_driver_uid === userProfile.id);
        }

        const sessionStops = filtered.filter(s => s.session_id === sessionFilter);

        if (phase === 'PICKUP') {
            return sessionStops
                .filter(s => ['waiting', 'driver_en_route', 'driver_arrived', 'on_board', 'dropped_off'].includes(s.transport_status))
                .sort((a, b) => {
                    if (!a.pickup_time || !b.pickup_time) return 0;
                    return a.pickup_time.localeCompare(b.pickup_time);
                });
        }

        return sessionStops
            .filter(s => (s.transport_status === 'on_board' || s.transport_status === 'dropped_off') && s.requires_dropoff !== false)
            .sort((a, b) => {
                const hotelA = a.dropoff_hotel || a.hotel_name || '';
                const hotelB = b.dropoff_hotel || b.hotel_name || '';
                return hotelA.localeCompare(hotelB);
            });
    }, [stops, sessionFilter, phase, userProfile]);

    // 5. COMPUTED VALUES
    const completedPax = useMemo(() =>
        visibleStops
            .filter(s => s.transport_status === 'on_board' || s.transport_status === 'dropped_off')
            .reduce((sum, s) => sum + (s.pax_count || 0), 0),
        [visibleStops]);

    const totalPax = useMemo(() =>
        visibleStops.reduce((sum, s) => sum + (s.pax_count || 0), 0),
        [visibleStops]);

    const isRouteStarted = useMemo(() => {
        if (visibleStops.length === 0) return false;
        if (phase === 'PICKUP') {
            return visibleStops.some(s => s.transport_status !== 'waiting');
        }
        return dropoffStartedManual || visibleStops.some(s => s.transport_status === 'dropped_off');
    }, [visibleStops, phase, dropoffStartedManual]);

    const firstIncompleteIndex = useMemo(() =>
        visibleStops.findIndex(s =>
            phase === 'PICKUP' ? s.transport_status !== 'on_board' : s.transport_status !== 'dropped_off'
        ),
        [visibleStops, phase]);

    // 6. PAYOUT CALCULATION
    const calculatePayout = useCallback(async () => {
        if (!userProfile) return;
        try {
            const { data, error } = await supabase.rpc('calculate_driver_payout', {
                p_driver_id: userProfile.id,
                p_run_date: activeDate,
                p_session_id: sessionFilter
            });

            if (error) {
                console.error('Payout calculation error:', error);
                return;
            }

            const amount = data && data.length > 0 ? data[0].payout_amount : 0;
            setPayoutAmount(amount);
            setShowPayoutModal(true);
        } catch (err) {
            console.error('Payout RPC error:', err);
        }
    }, [userProfile, activeDate, sessionFilter]);

    // 7. STATUS UPDATE WITH OPTIMISTIC UI
    const handleStatusChange = useCallback(async (stop: Stop, nextStatusOverride?: TransportStatus) => {
        const currentConfig = STATUS_CONFIG[stop.transport_status];
        const nextStatus = nextStatusOverride || currentConfig.next;

        if (!nextStatus || !userProfile) return;

        const previousStops = [...stops];

        setStops(current => current.map(s =>
            s.internal_id === stop.internal_id
                ? { ...s, transport_status: nextStatus, pickup_driver_uid: userProfile.id }
                : s
        ));

        try {
            // #132: il driver non ha piu' UPDATE diretto su bookings (RLS stretta).
            // La RPC SECURITY DEFINER consente SOLO i campi pickup delle SUE fermate
            // e scrive i timestamp actual_* lato server.
            const { error } = await supabase.rpc('driver_update_pickup', {
                p_internal_id: stop.internal_id,
                p_status: nextStatus,
            });

            if (error) throw error;

            // All drop-offs complete → trigger payout
            if (nextStatus === 'dropped_off' && phase === 'DROPOFF') {
                const allComplete = stops
                    .filter(s => s.session_id === sessionFilter && s.requires_dropoff !== false)
                    .every(s => s.internal_id === stop.internal_id || s.transport_status === 'dropped_off');

                if (allComplete) await calculatePayout();
            }

            // Chain: after pickup, set next waiting stop to en_route
            if (nextStatus === 'on_board') {
                const currentOrder = stop.route_order || 0;
                const nextStop = visibleStops.find(s =>
                    s.transport_status === 'waiting' &&
                    (s.route_order > currentOrder || !s.route_order)
                );
                if (nextStop) {
                    await supabase.rpc('driver_update_pickup', {
                        p_internal_id: nextStop.internal_id,
                        p_status: 'driver_en_route',
                    });
                }
            }

            fetchRoute();
        } catch (error) {
            console.error("Status update failed:", error);
            setStops(previousStops);
        }
    }, [userProfile, stops, phase, sessionFilter, visibleStops, calculatePayout, fetchRoute, STATUS_CONFIG]);

    // 8. ACTION HANDLERS
    const handleClickAction = useCallback((stop: Stop) => {
        if (confirmId === stop.internal_id) {
            handleStatusChange(stop);
            setConfirmId(null);
        } else {
            setConfirmId(stop.internal_id);
            setTimeout(() => setConfirmId(null), 3000);
        }
    }, [confirmId, handleStatusChange]);

    const handleStartRoute = useCallback(async () => {
        if (startRouteClicks === 0) {
            setStartRouteClicks(1);
            setTimeout(() => setStartRouteClicks(0), 3000);
            return;
        }

        setStartRouteClicks(0);

        if (phase === 'PICKUP') {
            const firstWaiting = visibleStops.find(s => s.transport_status === 'waiting');
            if (firstWaiting) {
                await handleStatusChange(firstWaiting, 'driver_en_route');
            }
        } else {
            setDropoffStartedManual(true);
        }
    }, [startRouteClicks, phase, visibleStops, handleStatusChange]);

    return {
        userProfile, setUserProfile, stops, setStops, confirmId, setConfirmId, phase, setPhase, showPayoutModal, setShowPayoutModal, payoutAmount, setPayoutAmount, startRouteClicks, setStartRouteClicks, dropoffStartedManual, setDropoffStartedManual, activeDate, setActiveDate, sessionFilter, setSessionFilter, STATUS_CONFIG, fetchRoute, visibleStops, completedPax, totalPax, isRouteStarted, firstIncompleteIndex, calculatePayout, handleStatusChange, handleClickAction, handleStartRoute,
    };
}

export type DriverRouteState = ReturnType<typeof useDriverRoute>;
