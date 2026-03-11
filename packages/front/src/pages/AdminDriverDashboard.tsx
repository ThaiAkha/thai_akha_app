import React, { useState, useEffect, useMemo } from 'react';
import { supabase } from '../lib/supabase';
import { PageLayout } from '../components/layout/PageLayout';
import { Typography, Icon, Badge, Avatar, Button, Card } from '../components/ui/index'; // Assicurati che Button e Card siano exportati in ui/index
import { cn } from '../lib/utils';
import { authService } from '../services/authService';

// --- CONFIGURAZIONE STATI ---
type TransportStatus = 'waiting' | 'driver_en_route' | 'driver_arrived' | 'on_board' | 'dropped_off';

// Configurazione visuale e logica degli stati
const STATUS_CONFIG: Record<TransportStatus, { label: string; actionLabel: string; color: string; next: TransportStatus | null }> = {
  waiting: {
    label: 'WAITING',
    actionLabel: 'START PICKUP', 
    color: 'text-white/40 border-white/20',
    next: 'driver_en_route'
  },
  driver_en_route: {
    label: 'EN ROUTE',
    actionLabel: 'I AM HERE', 
    color: 'text-blue-400 border-blue-500/50 bg-blue-500/10',
    next: 'driver_arrived'
  },
  driver_arrived: {
    label: 'AT LOBBY',
    actionLabel: 'PICK UP PAX', 
    color: 'text-yellow-400 border-yellow-500/50 bg-yellow-500/10',
    next: 'on_board'
  },
  on_board: {
    label: 'ON BOARD',
    actionLabel: 'DROPPED OFF', 
    color: 'text-action border-action/50 bg-action/10',
    next: 'dropped_off'
  },
  dropped_off: {
    label: 'COMPLETED',
    actionLabel: 'DONE',
    color: 'text-white/20 border-white/5 bg-white/5 grayscale',
    next: null
  }
};

// Helper Data Locale (Fix Fuso Orario)
const getLocalDate = () => {
  const d = new Date();
  const offset = d.getTimezoneOffset() * 60000;
  return new Date(d.getTime() - offset).toISOString().split('T')[0];
};

const AdminDriverDashboard: React.FC<{ onNavigate: (page: string) => void }> = ({ onNavigate }) => {
  const [loading, setLoading] = useState(true);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [stops, setStops] = useState<any[]>([]);
  
  // 🔒 Stato per la conferma "Doppio Click"
  const [confirmId, setConfirmId] = useState<string | null>(null);
  
  // Filtri
  const [activeDate, setActiveDate] = useState(getLocalDate());
  const [sessionFilter, setSessionFilter] = useState<'morning_class' | 'evening_class'>('morning_class');

  // --- INIT ---
  useEffect(() => {
    const initAuth = async () => {
      const profile = await authService.getCurrentUserProfile();
      setUserProfile(profile);
    };
    initAuth();
  }, []);

  // --- DATA FETCHING (Polling 5s) ---
  const fetchRoute = async () => {
    if (!userProfile) return;
    if (stops.length === 0) setLoading(true);

    try {
      let query = supabase
        .from('bookings')
        .select(`
          internal_id, status, pax_count, hotel_name, pickup_zone, pickup_time, phone_number, customer_note, session_id, route_order,
          pickup_driver_uid, transport_status,
          profiles:user_id (full_name, avatar_url)
        `)
        .eq('booking_date', activeDate)
        .neq('status', 'cancelled');

      // ✅ FIX LOGICA: Mostra assegnati a me OPPURE non assegnati (null)
      if (userProfile.role !== 'admin') {
        query = query.or(`pickup_driver_uid.eq.${userProfile.id},pickup_driver_uid.is.null`);
      }

      const { data } = await query
        .order('route_order', { ascending: true })
        .order('pickup_time', { ascending: true });

      if (data) {
        setStops(data.map((b: any) => ({
          ...b,
          guest_name: b.profiles?.full_name || 'Guest',
          avatar_url: b.profiles?.avatar_url
        })));
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userProfile) fetchRoute();
    const interval = setInterval(fetchRoute, 25000); 
    return () => clearInterval(interval);
  }, [activeDate, userProfile]);

  // --- HANDLERS ---

  const handleClickAction = (stop: any) => {
    if (confirmId === stop.internal_id) {
        handleStatusChange(stop);
        setConfirmId(null);
    } else {
        setConfirmId(stop.internal_id);
        setTimeout(() => setConfirmId(null), 3000);
    }
  };

  const handleStatusChange = async (stop: any, nextStatusOverride?: TransportStatus) => {
    const config = STATUS_CONFIG[stop.transport_status as TransportStatus];
    const nextStatus = nextStatusOverride || config.next;
    
    if (!nextStatus) return;

    // 1. Aggiorna DB (Assegna anche il driver se era null)
    await supabase.from('bookings').update({ 
      transport_status: nextStatus,
      actual_pickup_time: nextStatus === 'on_board' ? new Date().toISOString() : null,
      pickup_driver_uid: userProfile.id // Auto-claim
    }).eq('internal_id', stop.internal_id);

    // 2. REAZIONE A CATENA
    if (nextStatus === 'on_board') {
      const currentOrder = stop.route_order || 0;
      const nextStop = stops.find(s => 
        s.session_id === stop.session_id && 
        s.transport_status === 'waiting' &&
        s.route_order > currentOrder
      );

      if (nextStop) {
        await supabase.from('bookings').update({ 
          transport_status: 'driver_en_route' 
        }).eq('internal_id', nextStop.internal_id);
      }
    }

    fetchRoute();
  };

  // Azione Globale Inizio
  const handleStartRoute = async () => {
    const firstStop = visibleStops.find(s => s.transport_status === 'waiting');
    if (firstStop) {
        await handleStatusChange(firstStop, 'driver_en_route');
    } else {
        alert("No waiting stops to start.");
    }
  };

  // Azione Globale Fine
  const handleArriveDestination = async () => {
    if(!confirm("Finish all active rides?")) return;
    const onboardIds = visibleStops.filter(s => s.transport_status === 'on_board').map(s => s.internal_id);
    if(onboardIds.length > 0) {
        await supabase.from('bookings').update({ 
            transport_status: 'dropped_off',
            actual_dropoff_time: new Date().toISOString()
        }).in('internal_id', onboardIds);
        fetchRoute();
    }
  };

  const openMap = (hotel: string) => window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(hotel + " Chiang Mai")}`, '_blank');
  const handleWhatsApp = (phone: string) => window.open(`https://wa.me/${phone?.replace(/[^0-9]/g, '')}?text=Sawasdee%20kha%20Driver%20is%20at%20lobby`, '_blank');

  // --- UI HELPERS ---
  const visibleStops = useMemo(() => stops.filter(s => s.session_id === sessionFilter), [stops, sessionFilter]);
  const completedPax = visibleStops.filter(s => s.transport_status === 'on_board' || s.transport_status === 'dropped_off').reduce((sum, s) => sum + s.pax_count, 0);
  const totalPax = visibleStops.reduce((sum, s) => sum + s.pax_count, 0);
  
  const isRouteStarted = visibleStops.some(s => s.transport_status !== 'waiting');
  // Mostra pulsante finale se c'è qualcuno a bordo
  const showFinalButton = visibleStops.some(s => s.transport_status === 'on_board');

  return (
    <PageLayout slug="admin-driver" hideDefaultHeader={true} loading={loading} isFullScreen={true}>
      <div className="min-h-screen bg-black pb-48 font-sans">
        
        {/* HEADER (Glass Style) */}
        <div className="sticky top-0 z-50 bg-[#121212]/90 backdrop-blur-xl border-b border-white/10 px-4 pt-6 pb-4 shadow-2xl">
          <div className="flex justify-between items-start mb-4">
            <div>
              <Typography variant="h4" className="text-white font-black italic uppercase leading-none">
                Driver <span className="text-action">Console</span>
              </Typography>
              
              <div className="flex items-center gap-2 mt-1">
                <span className="text-white/60 text-xs font-mono">{activeDate}</span>
                <input 
                    type="date" 
                    value={activeDate} 
                    onChange={(e) => setActiveDate(e.target.value)} 
                    className="w-5 h-5 opacity-0 absolute cursor-pointer" 
                />
                <Icon name="edit" size="xs" className="text-white/30"/>
              </div>
            </div>
            
            <div className="text-right bg-white/5 px-4 py-2 rounded-xl border border-white/10">
              <span className="text-2xl font-display font-black text-action leading-none">{completedPax}</span>
              <span className="text-sm font-bold text-white/40">/ {totalPax} Pax</span>
            </div>
          </div>

          <div className="flex bg-white/10 p-1 rounded-xl">
            <button onClick={() => setSessionFilter('morning_class')} className={cn("flex-1 py-3 rounded-lg text-xs font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2", sessionFilter === 'morning_class' ? "bg-white text-black shadow-lg" : "text-white/40")}>
              <Icon name="wb_sunny" size="xs"/> AM
            </button>
            <button onClick={() => setSessionFilter('evening_class')} className={cn("flex-1 py-3 rounded-lg text-xs font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2", sessionFilter === 'evening_class' ? "bg-[#121212] text-white shadow-lg border border-white/10" : "text-white/40")}>
              <Icon name="dark_mode" size="xs"/> PM
            </button>
          </div>
        </div>

        {/* LISTA FERMATE */}
        <div className="p-4 space-y-6">
            
          {/* Tasto Start Globale */}
          {!isRouteStarted && visibleStops.length > 0 && (
             <Button 
                variant="brand" 
                size="xl" 
                fullWidth 
                onClick={handleStartRoute} 
                icon="local_shipping"
                className="shadow-[0_0_40px_rgba(227,31,51,0.4)] animate-pulse"
             >
                Start Pickup Route
             </Button>
          )}

          {visibleStops.map((stop, index) => {
            const statusCfg = STATUS_CONFIG[stop.transport_status as TransportStatus];
            const isDone = stop.transport_status === 'dropped_off'; // Completato
            const isOnBoard = stop.transport_status === 'on_board'; // A bordo
            
            // Attivo se: è il prossimo in lista, o è in corso, o è a bordo
            const isActiveStep = stop.transport_status !== 'waiting' || (stop.transport_status === 'waiting' && index === 0 && !isRouteStarted) || (stop.transport_status === 'waiting' && stops[index-1]?.transport_status === 'on_board');
            
            const isConfirming = confirmId === stop.internal_id;

            // CARD COMPATTA (Finito)
            if (isDone) {
                return (
                    <div key={stop.internal_id} className="flex items-center justify-between p-4 bg-[#1a1a1a] border border-white/5 rounded-2xl opacity-50 grayscale">
                        <div className="flex items-center gap-4">
                            <Icon name="check_circle" className="text-green-500" />
                            <div>
                                <div className="text-white font-bold line-through decoration-white/30">{stop.guest_name}</div>
                                <div className="text-[10px] text-white/40 uppercase">{stop.hotel_name}</div>
                            </div>
                        </div>
                    </div>
                );
            }

            // CARD ATTIVA (Glass Style)
            return (
              <div key={stop.internal_id} className={cn(
                "relative rounded-[2rem] border overflow-hidden transition-all duration-500",
                isOnBoard ? "bg-green-900/10 border-green-500/30 shadow-lg" : 
                isActiveStep ? "bg-[#1a1a1a] border-white/10 shadow-2xl" : 
                "bg-black/40 border-white/5 opacity-60"
              )}>
                
                {/* Header Info */}
                <div className={cn("flex justify-between items-stretch border-b", isOnBoard ? "bg-green-500/10 border-green-500/20" : "bg-white/5 border-white/5")}>
                  <div className="px-5 py-4 flex items-center gap-3">
                    <span className="font-mono text-2xl font-black tracking-tighter text-white">{stop.pickup_time?.slice(0,5)}</span>
                    <Badge variant="outline" className="text-[9px] px-2 h-5 border-0 bg-white/5">{stop.pickup_zone?.toUpperCase()}</Badge>
                  </div>
                  <div className="px-5 flex items-center justify-center bg-black/20 border-l border-white/5 min-w-[4rem]">
                    <span className={cn("text-xl font-black", isOnBoard ? "text-green-400" : "text-white")}>{stop.pax_count}p</span>
                  </div>
                </div>

                <div className="p-5 space-y-5">
                  <div className="flex items-center gap-4">
                    <Avatar src={stop.avatar_url} initials={stop.guest_name} size="md" />
                    <div className="min-w-0">
                      <Typography variant="h5" className="truncate leading-none mb-1 text-lg text-white">{stop.guest_name}</Typography>
                      {stop.customer_note ? <p className="text-[10px] text-yellow-500 italic truncate font-bold">⚠️ "{stop.customer_note}"</p> : <p className="text-[10px] text-white/30 font-bold uppercase">No Notes</p>}
                    </div>
                  </div>

                  <div className="flex gap-2">
                      <button onClick={() => openMap(stop.hotel_name)} className="flex-1 flex items-center gap-3 p-4 rounded-xl border border-white/10 bg-black/40 hover:bg-white/5 transition-all text-left">
                        <Icon name="map" className="text-blue-400 shrink-0" />
                        <span className="text-sm font-bold truncate text-white/90">{stop.hotel_name}</span>
                      </button>
                      <button onClick={() => handleWhatsApp(stop.phone_number)} className="size-14 rounded-xl bg-green-900/20 border border-green-500/30 flex items-center justify-center text-green-500">
                        <Icon name="chat" />
                      </button>
                  </div>

                  {/* ACTION BUTTON */}
                  {(isActiveStep || isOnBoard) && (
                      <button 
                        onClick={() => handleClickAction(stop)}
                        className={cn(
                          "w-full h-16 rounded-2xl flex items-center justify-center gap-3 font-black uppercase tracking-widest text-sm transition-all shadow-lg active:scale-95",
                          isConfirming 
                            ? "bg-red-500 text-white border-red-400 animate-pulse"
                            : statusCfg.color
                        )}
                      >
                        {isConfirming ? (
                            <>CONFIRM ACTION?</>
                        ) : (
                            <>{statusCfg.actionLabel} <Icon name={isOnBoard ? "check" : "arrow_forward"} className="animate-bounce" /></>
                        )}
                      </button>
                  )}
                </div>
              </div>
            );
          })}

          {/* Tasto Fine Corsa */}
          {showFinalButton && (
             <div className="pt-8">
                 <Button 
                    variant="action" 
                    size="xl" 
                    fullWidth 
                    onClick={handleArriveDestination}
                    icon="flag"
                    className="shadow-xl"
                 >
                    Arrive at Destination
                 </Button>
             </div>
          )}

        </div>
      </div>
    </PageLayout>
  );
};

export default AdminDriverDashboard;