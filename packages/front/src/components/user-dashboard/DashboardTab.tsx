import React from 'react';
import { Typography, Card, Button, Icon, Badge, Avatar } from '../ui';
import { UserProfile } from '../../services/authService';
import { cn } from '../../lib/utils';

interface DashboardTabProps {
  userProfile: UserProfile | null;
  bookings: any[];
  activeId: string | null;
  routeStops: any[];
  onSelectBooking: (id: string) => void;
  menuStatus: boolean;
  onNavigate: (page: string) => void;
  onChangeTab: (tab: string) => void;
  onOpenSettings: () => void;
  onShowCertificate?: () => void;
}

const DashboardTab: React.FC<DashboardTabProps> = ({ 
  userProfile, 
  bookings, 
  activeId, 
  routeStops,
  onSelectBooking, 
  menuStatus, 
  onNavigate, 
  onChangeTab,
  onOpenSettings,
  onShowCertificate
}) => {

  const activeBooking = bookings.find(b => b.internal_id === activeId) || bookings;

  if (!activeBooking) {
    return (
      <div className="flex flex-col items-center justify-center py-20 bg-white/5 rounded-[3rem] border border-dashed border-white/10 animate-in fade-in">
        <Icon name="event_busy" size="2xl" className="text-white/20 mb-4" />
        <Typography variant="h4" className="text-white mb-6">No Active Adventures</Typography>
        <Button variant="action" size="lg" onClick={() => onNavigate('booking')}>Book a Class</Button>
      </div>
    );
  }

  // LOGICA STATI
  const today = new Date();
  today.setHours(0,0,0,0);
  const bookingDate = new Date(activeBooking.booking_date);
  const isPast = bookingDate < today;
  
  const hasHotel = activeBooking.hotel_name && activeBooking.hotel_name !== 'To be selected';
  const isMorning = activeBooking.session_id?.includes('morning');
  const isWalkIn = activeBooking.pickup_zone === 'walk-in';
  const bookingRef = activeBooking.internal_id ? activeBooking.internal_id.slice(0, 6).toUpperCase() : 'REF';
  const transportStatus = activeBooking.transport_status || 'waiting';
  const dietLabel = userProfile?.dietary_profile?.replace('diet_', '').toUpperCase() || 'REGULAR';
  const hasAllergies = userProfile?.allergies && userProfile.allergies.length > 0;

  // --- RENDER TIMELINE UNIFICATA (Timeline + Fermate) ---
  const renderUnifiedTimeline = () => {
    if (isPast) return (
        <div className="mt-8 p-6 bg-white/5 rounded-2xl border border-white/5 text-center">
            <Icon name="verified" className="text-white/20 mb-2" size="lg"/>
            <Typography variant="h5" className="text-white/40">Journey Completed</Typography>
        </div>
    );

    // Se ci sono fermate multiple, mostriamo la sequenza completa
    // Altrimenti (solo io o walk-in), mostriamo la versione semplice
    const showFullRoute = routeStops && routeStops.length > 1 && !isWalkIn;

    return (
      <div className="relative pl-4 ml-2 space-y-8 border-l-2 border-white/10 border-dashed mt-8">
        
        {/* STEP 1: DRIVER STARTED (Route Active) */}
        <div className={cn("relative pl-8 transition-all duration-500", transportStatus === 'waiting' ? "opacity-40" : "opacity-100")}>
            <div className={cn("absolute -left-[9px] top-1 size-4 rounded-full border-2 transition-colors", 
                transportStatus !== 'waiting' ? "bg-action border-action shadow-[0_0_10px_var(--color-action)]" : "bg-[#1a1a1a] border-white/30")} />
            <div className="flex items-center gap-3">
                <Icon name="local_shipping" size="sm" className={transportStatus !== 'waiting' ? "text-action" : "text-white/40"}/>
                <span className="font-bold text-sm text-white/80">Driver Started Route</span>
            </div>
        </div>

        {/* STEP 2: STOPS SEQUENCE (Dinamico) */}
        {showFullRoute && routeStops.map((stop, idx) => {
            const isMe = stop.internal_id === activeBooking.internal_id;
            
            // Logica Colore Stato
            let statusClass = "border-white/10 bg-white/5 text-white/40"; // Default: Waiting
            let iconName = "radio_button_unchecked";
            let label = `Stop ${idx + 1}`;

            if (stop.transport_status === 'dropped_off' || stop.transport_status === 'on_board') {
                statusClass = "border-green-500/30 bg-green-500/10 text-green-500"; // Passato
                iconName = "check_circle";
                label = "Picked Up";
            } 
            else if (stop.transport_status === 'driver_arrived') {
                statusClass = "border-yellow-500/50 bg-yellow-500/10 text-yellow-500 animate-pulse"; // Attivo Ora
                iconName = "local_taxi";
                label = "Driver Here!";
            }
            else if (stop.transport_status === 'driver_en_route') {
                statusClass = "border-blue-500/50 bg-blue-500/10 text-blue-500 animate-pulse"; // In arrivo
                iconName = "directions_car";
                label = "En Route";
            }

            // Highlight "ME"
            if (isMe) {
                return (
                    <div key={stop.internal_id} className="relative pl-8">
                        {/* Indicatore Laterale Pulsante se è il mio turno */}
                        <div className={cn(
                            "absolute -left-[11px] top-6 size-5 rounded-full border-4 shadow-[0_0_15px_currentColor] transition-all duration-500 z-10", 
                            stop.transport_status === 'driver_en_route' ? "bg-blue-500 border-blue-500 text-blue-500 animate-pulse" :
                            stop.transport_status === 'driver_arrived' ? "bg-yellow-500 border-yellow-500 text-yellow-500 animate-bounce" :
                            (stop.transport_status === 'on_board' || stop.transport_status === 'dropped_off') ? "bg-green-500 border-green-500 text-green-500" :
                            "bg-[#1a1a1a] border-white/20 text-white/20"
                        )}></div>

                        {/* Card Principale Pickup */}
                        <div className={cn("p-5 rounded-2xl border flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all duration-500 relative overflow-hidden", 
                            stop.transport_status === 'driver_arrived' ? "bg-yellow-500/10 border-yellow-500/50" : 
                            stop.transport_status === 'driver_en_route' ? "bg-blue-500/10 border-blue-500/50" :
                            "bg-white/5 border-white/10"
                        )}>
                            {/* Flash Background se driver è qui */}
                            {stop.transport_status === 'driver_arrived' && <div className="absolute inset-0 bg-yellow-500/10 animate-pulse pointer-events-none"/>}

                            <div className="relative z-10">
                                <div className="flex items-center gap-3 mb-1">
                                    <span className="font-mono text-xl font-black tracking-tight text-white">
                                        {stop.pickup_time?.slice(0,5)}
                                    </span>
                                    {transportStatus !== 'waiting' && <Badge variant="mineral" className="text-[9px] h-5 px-2 bg-white/10 animate-fade-in">LIVE</Badge>}
                                </div>
                                <div className={cn("font-bold text-lg leading-tight mb-1", 
                                    stop.transport_status === 'driver_arrived' ? "text-yellow-400" : 
                                    stop.transport_status === 'driver_en_route' ? "text-blue-400" : "text-white")}>
                                    {stop.transport_status === 'driver_arrived' ? "Driver is Waiting for YOU!" : 
                                     stop.transport_status === 'driver_en_route' ? "Driver coming to YOU!" :
                                     stop.transport_status === 'on_board' ? "You are On Board" : "Your Pickup"}
                                </div>
                                <div className="text-xs text-white/40">{stop.hotel_name || "Select Location"}</div>
                            </div>

                            {/* Actions */}
                            {hasHotel && !isWalkIn && transportStatus === 'waiting' && (
                                <div className="flex flex-col gap-2 relative z-10">
                                    <Button variant="mineral" size="sm" onClick={() => { localStorage.setItem('current_booking_id', activeBooking.internal_id); onNavigate('location'); }}>
                                        Check / Modify
                                    </Button>
                                </div>
                            )}
                            {!hasHotel && (
                                <Button variant="brand" size="sm" icon="add_location" onClick={() => { localStorage.setItem('current_booking_id', activeBooking.internal_id); onNavigate('location'); }}>
                                    Set Location
                                </Button>
                            )}
                        </div>
                    </div>
                );
            }

            // Fermate di Altri (Piccole)
            return (
                <div key={stop.internal_id} className="relative pl-8">
                    <div className={cn("absolute -left-[9px] top-3 size-4 rounded-full border-2 bg-[#1a1a1a]", 
                        (stop.transport_status === 'on_board' || stop.transport_status === 'dropped_off') ? "border-green-500 bg-green-500" : "border-white/20")}/>
                    
                    <div className={cn("flex items-center justify-between p-3 rounded-xl border text-xs", statusClass)}>
                        <div className="flex items-center gap-3">
                            <Icon name={iconName} size="sm"/>
                            <span className="font-bold uppercase opacity-80">{label}</span>
                        </div>
                        <span className="font-mono opacity-50">{stop.pickup_time?.slice(0,5)}</span>
                    </div>
                </div>
            );
        })}

        {/* Fallback se non ci sono route stops (o walk-in) */}
        {(!showFullRoute || isWalkIn) && (
             <div className="relative pl-8">
                <div className={cn("absolute -left-[11px] top-6 size-5 rounded-full border-4 bg-[#1a1a1a]", hasHotel ? "border-white/20" : "border-yellow-500 animate-pulse")}></div>
                <div className="p-5 rounded-2xl border bg-white/5 border-white/10">
                    <div className="font-bold text-lg text-white mb-1">{isWalkIn ? "Meeting at School" : "Your Pickup"}</div>
                    <div className="text-xs text-white/40">{activeBooking.hotel_name || (isWalkIn ? "Thai Akha Kitchen" : "Select Location")}</div>
                    {isWalkIn && <div className="mt-4 text-xs text-blue-400 font-bold uppercase tracking-wider">Self Transport</div>}
                    {!hasHotel && !isWalkIn && <Button variant="brand" size="sm" className="mt-4" icon="add_location" onClick={() => { localStorage.setItem('current_booking_id', activeBooking.internal_id); onNavigate('location'); }}>Set Location</Button>}
                </div>
             </div>
        )}

        {/* STEP 3: ARRIVAL */}
        <div className={cn("relative pl-8 transition-all duration-500", (transportStatus === 'dropped_off' || isPast) ? "opacity-100" : "opacity-30")}>
            <div className={cn("absolute -left-[9px] top-1 size-4 rounded-full border-2", (transportStatus === 'dropped_off' || isPast) ? "bg-green-500 border-green-500" : "bg-[#1a1a1a] border-white/30")} />
            <div className="flex items-center gap-4">
                <span className="font-mono text-xs font-bold text-white/60 bg-white/5 px-2 py-1 rounded">Finish</span>
                <span className="text-sm font-bold text-white/60">Thai Akha Kitchen</span>
            </div>
        </div>
      </div>
    );
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      {/* COLONNA SINISTRA: LISTA */}
      <div className="lg:col-span-4 space-y-6">
        {/* Passport Card (Identica a prima) */}
        <div onClick={onOpenSettings} className="group relative flex items-center gap-5 bg-[#121212] border border-white/10 p-5 rounded-[2rem] shadow-xl overflow-hidden cursor-pointer hover:border-primary/50 transition-all duration-300">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <div className="relative shrink-0">
            <Avatar src={userProfile?.avatar_url} initials={userProfile?.full_name} size="lg" className="border-2 border-white/10 group-hover:border-primary shadow-lg transition-colors"/>
            <div className="absolute -bottom-1 -right-1 bg-surface text-title p-1.5 rounded-full border border-white/10 shadow-sm group-hover:bg-primary group-hover:text-white transition-colors"><Icon name="edit" size="xs" /></div>
          </div>
          <div className="min-w-0 relative z-10">
            <div className="text-[10px] font-black uppercase tracking-widest text-primary mb-1">Welcome Chef</div>
            <div className="text-xl font-display font-black text-white truncate mb-1">{userProfile?.full_name?.split(' ') || 'Guest'}</div>
            <div className="flex items-center gap-2">
              <Badge variant="mineral" className="text-[9px] h-5 px-2 bg-white/5 border-white/10">{dietLabel}</Badge>
              {hasAllergies && <Badge variant="outline" className="text-[9px] h-5 px-2 text-red-400 border-red-500/30">!</Badge>}
            </div>
          </div>
        </div>

        {/* Lista Prenotazioni */}
        <div className="space-y-4 pl-2">
            <Typography variant="accent" className="text-white/40 text-[10px]">Your Journeys</Typography>
            {bookings.map((b) => {
              const isSelected = activeBooking.internal_id === b.internal_id;
              const d = new Date(b.booking_date);
              const isItemPast = d < today;
              return (
                <button key={b.internal_id} onClick={() => onSelectBooking(b.internal_id)} className={cn("w-full flex items-center gap-4 p-3 rounded-2xl border transition-all text-left group relative overflow-hidden", isSelected ? "bg-white/10 border-primary/50 shadow-lg" : "bg-white/5 border-white/5 hover:bg-white/10", isItemPast && !isSelected && "opacity-50 grayscale hover:grayscale-0")}>
                  <div className={cn("size-10 rounded-xl flex flex-col items-center justify-center shrink-0 font-bold leading-none border transition-colors", isSelected ? "bg-primary text-white border-primary" : "bg-black/20 text-white/40 border-white/10", isItemPast && !isSelected && "bg-white/5")}>
                    <span className="text-lg">{d.getDate()}</span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className={cn("text-xs font-bold uppercase flex justify-between", isSelected ? "text-white" : "text-white/60")}>
                      <span>{b.session_id.includes('morning') ? 'Morning Class' : 'Evening Feast'}</span>
                      {isItemPast && <span className="text-[9px] opacity-50">COMPLETED</span>}
                    </div>
                    <div className="text-[9px] text-white/40 font-mono mt-0.5">{b.pax_count} Guests • {d.toLocaleDateString('en-GB', { month:'short', year:'numeric' })}</div>
                  </div>
                </button>
              )
            })}
        </div>
      </div>

      {/* COLONNA DESTRA: MISSION CONTROL */}
      <div className="lg:col-span-8">
        <Card variant="glass" padding="none" className="bg-[#1a1a1a] border-white/10 overflow-hidden flex flex-col h-fit min-h-[500px] shadow-2xl relative">
          
          {/* Header */}
          <div className="p-6 md:p-8 bg-gradient-to-b from-white/5 to-transparent border-b border-white/5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <Badge variant={isPast ? 'mineral' : (hasHotel ? 'solid' : 'mineral')} className={isPast ? "bg-white/10 text-white/40" : (hasHotel ? 'bg-green-500 text-black border-green-400' : 'bg-yellow-500 text-black border-yellow-400')}>
                  {isPast ? 'COMPLETED' : (hasHotel ? 'CONFIRMED' : 'ACTION REQUIRED')}
                </Badge>
                <span className="font-mono text-[10px] text-white/30 tracking-widest">#{bookingRef}</span>
              </div>
              <Typography variant="h3" className={cn("italic leading-none", isPast ? "text-white/60" : "text-white")}>
                {isMorning ? "Morning Market Tour" : "Evening Sunset Feast"}
              </Typography>
            </div>
            <div className="flex items-center gap-3 bg-black/40 p-2 pr-4 rounded-full border border-white/10">
              <div className="size-10 rounded-full bg-white/10 flex items-center justify-center text-white font-black">{activeBooking.pax_count}</div>
              <div className="flex flex-col"><span className="text-[9px] font-black uppercase text-white/40 tracking-widest">Guests</span></div>
            </div>
          </div>

          {/* Body: TIMELINE UNIFICATA */}
          <div className="flex-1 p-6 md:p-8 relative">
            <Typography variant="accent" className="text-white/40 text-[10px] mb-2 block">{isPast ? "JOURNEY LOG" : "LIVE LOGISTICS"}</Typography>
            
            {renderUnifiedTimeline()}
          </div>

          {/* Footer Actions */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-white/10 border-t border-white/10">
            <button onClick={() => onChangeTab('menu')} className={cn("group relative p-4 h-24 flex flex-col items-center justify-center gap-2 hover:bg-white/5 transition-all", menuStatus ? "text-white" : "bg-red-500/5")}>
              <div className={cn("size-10 rounded-full flex items-center justify-center transition-all group-hover:scale-110", menuStatus ? "bg-white/10 text-white" : "bg-red-500 text-white shadow-lg animate-pulse")}><Icon name="restaurant_menu" /></div>
              <span className={cn("text-[10px] font-black uppercase tracking-widest", menuStatus ? "text-white/60" : "text-red-400")}>{menuStatus ? "See Menu" : "Select Menu"}</span>
            </button>

            {!isPast ? (
                <button onClick={() => { localStorage.setItem('current_booking_id', activeBooking.internal_id); onNavigate('location'); }} className="group p-4 h-24 flex flex-col items-center justify-center gap-2 hover:bg-white/5 transition-all">
                  <div className={cn("size-10 rounded-full flex items-center justify-center transition-all group-hover:scale-110", hasHotel ? "bg-white/10 text-white" : "bg-yellow-500 text-black shadow-lg animate-pulse")}><Icon name="local_taxi" /></div>
                  <span className={cn("text-[10px] font-black uppercase tracking-widest", hasHotel ? "text-white/60" : "text-yellow-500")}>{hasHotel ? "Manage Pickup" : "Add Pickup"}</span>
                </button>
            ) : (
                <div className="p-4 h-24 flex flex-col items-center justify-center gap-2 opacity-30"><Icon name="local_taxi" size="md"/><span className="text-[10px] font-black uppercase">Completed</span></div>
            )}

            <button onClick={() => onShowCertificate && onShowCertificate()} className="group p-4 h-24 flex flex-col items-center justify-center gap-2 hover:bg-white/5 transition-all">
              <div className="size-10 rounded-full border border-white/20 text-white flex items-center justify-center transition-all group-hover:border-quiz group-hover:text-quiz group-hover:scale-110"><Icon name="workspace_premium" /></div>
              <span className="text-[10px] font-black uppercase tracking-widest text-white/60 group-hover:text-quiz">Certificate</span>
            </button>

            {!isPast && (
                <button onClick={() => onNavigate('booking')} className="group p-4 h-24 flex flex-col items-center justify-center gap-2 hover:bg-white/5 transition-all">
                  <div className="size-10 rounded-full border border-white/20 text-white flex items-center justify-center transition-all group-hover:border-white group-hover:scale-110"><Icon name="edit_calendar" /></div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-white/60">Modify Date</span>
                </button>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default DashboardTab;