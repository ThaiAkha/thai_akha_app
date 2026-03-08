import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router';
import { supabase } from '../../lib/supabase';
import Button from '../../components/ui/button/Button';
import { cn } from '../../lib/utils';
import { authService, UserProfile } from '../../services/auth.service';
import {
    CheckCircle2,
    Bus, Truck, Home
} from 'lucide-react';
import PageContainer from '../../components/layout/PageContainer';
import { usePageMetadata } from '../../hooks/usePageMetadata';
import AdminClassPicker from '../../components/common/AdminClassPicker';
import TransportStopCard, { Stop, TransportStatus } from '../../components/driver/TransportStopCard';

// --- TYPES ---
type Phase = 'PICKUP' | 'DROPOFF';
type SessionFilter = 'morning_class' | 'evening_class';

// --- CONFIGURAZIONE STATI ---
const STATUS_CONFIG: Record<TransportStatus, { label: string; actionLabel: string; color: string; next: TransportStatus | null }> = {
    waiting: {
        label: 'WAITING',
        actionLabel: 'START PICKUP',
        color: 'bg-white text-black hover:bg-white/90',
        next: 'driver_en_route'
    },
    driver_en_route: {
        label: 'EN ROUTE',
        actionLabel: 'I AM HERE',
        color: 'bg-brand-600 text-white hover:bg-brand-700',
        next: 'driver_arrived'
    },
    driver_arrived: {
        label: 'AT LOBBY',
        actionLabel: 'PICK UP PAX',
        color: 'bg-yellow-500 text-black hover:bg-yellow-400',
        next: 'on_board'
    },
    on_board: {
        label: 'ON BOARD',
        actionLabel: 'DROP COMPLETE',
        color: 'bg-green-600 text-white hover:bg-green-700',
        next: 'dropped_off'
    },
    dropped_off: {
        label: 'COMPLETED',
        actionLabel: 'DONE',
        color: 'bg-gray-700 text-gray-400 cursor-not-allowed',
        next: null
    }
};

const DriverRoute: React.FC = () => {
    const navigate = useNavigate();
    usePageMetadata('driver');
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
            const { data, error } = await supabase
                .from('bookings')
                .select(`
                    internal_id, status, pax_count, hotel_name, pickup_zone, pickup_time, phone_number, customer_note, session_id, route_order,
                    pickup_driver_uid, transport_status, dropoff_hotel, requires_dropoff,
                    profiles: user_id(full_name, avatar_url)
                `)
                .eq('booking_date', activeDate)
                .neq('status', 'cancelled')
                .order('route_order', { ascending: true })
                .order('pickup_time', { ascending: true });

            if (error) throw error;

            if (data) {
                setStops(data.map((b: any) => {
                    const profile = b.profiles;
                    return {
                        ...b,
                        guest_name: profile?.full_name || 'Guest',
                        avatar_url: profile?.avatar_url,
                    } as Stop;
                }));
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
            const updatePayload: Record<string, unknown> = {
                transport_status: nextStatus,
                pickup_driver_uid: userProfile.id,
            };

            if (nextStatus === 'on_board') {
                updatePayload.actual_pickup_time = new Date().toISOString();
            }
            if (nextStatus === 'dropped_off') {
                updatePayload.actual_dropoff_time = new Date().toISOString();
            }

            const { error } = await supabase
                .from('bookings')
                .update(updatePayload)
                .eq('internal_id', stop.internal_id);

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
                    await supabase.from('bookings').update({
                        transport_status: 'driver_en_route',
                        pickup_driver_uid: userProfile.id
                    }).eq('internal_id', nextStop.internal_id);
                }
            }

            fetchRoute();
        } catch (error) {
            console.error("Status update failed:", error);
            setStops(previousStops);
        }
    }, [userProfile, stops, phase, sessionFilter, visibleStops, calculatePayout, fetchRoute]);

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

    // 9. UTILS
    const openMap = (hotel: string) =>
        window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(hotel + " Chiang Mai")}`, '_blank');

    const handleWhatsApp = (phone: string) =>
        window.open(`https://wa.me/${phone?.replace(/[^0-9]/g, '')}?text=Sawasdee%20kha%20Driver%20is%20at%20lobby`, '_blank');

    return (
        <PageContainer variant="narrow" className="h-[calc(100vh-64px)] flex flex-col bg-gray-50 dark:bg-black p-0 overflow-hidden">
            <div className="flex-1 overflow-y-auto no-scrollbar pb-32">

                {/* --- DATE & SESSION PICKER --- */}
                <div className="p-4 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 sticky top-0 z-20 space-y-4">
                    <AdminClassPicker
                        date={activeDate}
                        session={sessionFilter}
                        onDateChange={setActiveDate}
                        onSessionChange={setSessionFilter}
                    />

                    {/* Phase Selector & Pax Counter */}
                    <div className="flex items-center justify-between gap-3">
                        <div className="flex-1 flex bg-gray-100 dark:bg-white/5 p-1 rounded-xl border border-gray-200 dark:border-white/10">
                            <button
                                onClick={() => setPhase('PICKUP')}
                                className={cn(
                                    "flex-1 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2",
                                    phase === 'PICKUP'
                                        ? "bg-brand-600 text-white shadow-lg"
                                        : "text-gray-400 dark:text-white/40 hover:text-white/60"
                                )}
                            >
                                <Truck className="w-3.5 h-3.5" /> Pickup
                            </button>
                            <button
                                onClick={() => setPhase('DROPOFF')}
                                className={cn(
                                    "flex-1 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2",
                                    phase === 'DROPOFF'
                                        ? "bg-green-600 text-white shadow-lg"
                                        : "text-gray-400 dark:text-white/40 hover:text-white/60"
                                )}
                            >
                                <Home className="w-3.5 h-3.5" /> Drop-off
                            </button>
                        </div>

                        <div className="bg-brand-50 dark:bg-brand-500/10 px-4 py-2 rounded-xl border border-brand-100 dark:border-brand-500/20 flex items-center gap-3">
                            <span className="text-xl font-mono font-black text-brand-600 dark:text-brand-400 leading-none">{completedPax}</span>
                            <span className="text-[10px] font-bold text-brand-400 dark:text-white/40 uppercase tracking-widest">/ {totalPax} PAX</span>
                        </div>
                    </div>
                </div>

                <div className="px-4 space-y-6">
                    {/* Start Route Button */}
                    {!isRouteStarted && visibleStops.length > 0 && (
                        <Button
                            variant="primary"
                            size="md"
                            onClick={handleStartRoute}
                            className={cn(
                                "w-full h-16 text-lg font-black transition-all",
                                phase === 'PICKUP'
                                    ? startRouteClicks === 0
                                        ? "shadow-[0_0_40px_rgba(227,31,51,0.4)] animate-pulse bg-brand-600 hover:bg-brand-700 text-white"
                                        : "bg-red-500 text-white animate-pulse shadow-[0_0_60px_rgba(239,68,68,0.6)]"
                                    : startRouteClicks === 0
                                        ? "shadow-[0_0_40px_rgba(34,197,94,0.4)] animate-pulse bg-green-600 hover:bg-green-700 text-white"
                                        : "bg-red-500 text-white animate-pulse shadow-[0_0_60px_rgba(239,68,68,0.6)]"
                            )}
                        >
                            {phase === 'PICKUP'
                                ? <><Bus className="w-5 h-5 mr-2" />{startRouteClicks === 0 ? 'Start Pickup Route' : 'CLICK AGAIN TO CONFIRM'}</>
                                : <><Home className="w-5 h-5 mr-2" />{startRouteClicks === 0 ? 'Start Drop-off Route' : 'CLICK AGAIN TO CONFIRM'}</>
                            }
                        </Button>
                    )}

                    {visibleStops.map((stop, index) => (
                        <TransportStopCard
                            key={stop.internal_id}
                            stop={stop}
                            phase={phase}
                            displayHotel={phase === 'DROPOFF' ? (stop.dropoff_hotel || stop.hotel_name) : stop.hotel_name}
                            isOnBoard={stop.transport_status === 'on_board'}
                            isActiveStep={index === firstIncompleteIndex && isRouteStarted}
                            isConfirming={confirmId === stop.internal_id}
                            statusCfg={STATUS_CONFIG[stop.transport_status]}
                            onAction={handleClickAction}
                            onOpenMap={openMap}
                            onWhatsApp={handleWhatsApp}
                        />
                    ))}
                </div>
            </div>

            {/* --- PAYOUT MODAL --- */}
            {showPayoutModal && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-gray-900 rounded-2xl p-8 max-w-md w-full shadow-2xl border border-gray-200 dark:border-white/10">
                        <div className="text-center space-y-4">
                            <div className="w-16 h-16 bg-green-100 dark:bg-green-500/20 rounded-full flex items-center justify-center mx-auto">
                                <CheckCircle2 className="w-10 h-10 text-green-600 dark:text-green-400" />
                            </div>
                            <h3 className="text-2xl font-black text-gray-900 dark:text-white">
                                All Rides Completed!
                            </h3>
                            <div className="bg-brand-50 dark:bg-brand-500/10 p-6 rounded-xl border border-brand-100 dark:border-brand-500/20">
                                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Daily Earnings</p>
                                <p className="text-4xl font-black text-brand-600 dark:text-brand-400">
                                    {payoutAmount || 0} <span className="text-2xl">THB</span>
                                </p>
                            </div>
                            <Button
                                variant="primary"
                                onClick={() => {
                                    setShowPayoutModal(false);
                                    navigate('/driver');
                                }}
                                className="w-full h-12 text-lg font-bold"
                            >
                                Return to Home
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </PageContainer>
    );
};

export default DriverRoute;
