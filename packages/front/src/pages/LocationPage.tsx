import React, { useState, useEffect, useMemo } from 'react';
import { supabase } from '../lib/supabase';
import { PageLayout } from '../components/layout/PageLayout';
import PickupMapBackground from '../components/layout/PickupMapBackground';
import { Typography, Icon, Input, Button, Badge, Toggle, Card } from '../components/ui';
import { cn } from '../lib/utils';
import { isPointInPolygon } from '../lib/geoUtils';
import { GEOJSON_MASTER } from '../data/mapZones';

// --- TIPI & INTERFACCE ---

interface Zone {
  id: string;
  name: string;
  color_code: string;
  morning_pickup_time: string;
  evening_pickup_time: string;
  coords?: number[][];
}

interface LocationState {
  type: 'db_hotel' | 'meeting_point' | 'custom_pin';
  name: string;
  lat: number;
  lng: number;
  zoneId?: string;
  isUnknown?: boolean;
}

type TransportMode = 'pickup' | 'self';
type ActiveField = 'pickup' | 'dropoff';

const LocationPage: React.FC<{ onNavigate: (page: string) => void }> = ({ onNavigate }) => {
  // --- STATE: DATI & LOADING ---
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [zones, setZones] = useState<Record<string, Zone>>({});
  const [hotels, setHotels] = useState<any[]>([]);
  
  // --- STATE: LOGICA UI ---
  const bookingId = localStorage.getItem('current_booking_id');
  const isEditMode = !!bookingId;
  
  const [selectedClass, setSelectedClass] = useState<'morning' | 'evening'>('morning');
  const [transportMode, setTransportMode] = useState<TransportMode>('pickup');
  
  // Gestione Doppia Location (Start & End)
  const [pickupLoc, setPickupLoc] = useState<LocationState | null>(null);
  const [dropoffLoc, setDropoffLoc] = useState<LocationState | null>(null);
  const [isDropoffSame, setIsDropoffSame] = useState(true);
  
  // Focus Mappa (Cosa sto pinnando?)
  const [activeField, setActiveField] = useState<ActiveField>('pickup');
  const [isPinningMode, setIsPinningMode] = useState(false);
  
  // Ricerca
  const [searchQuery, setSearchQuery] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);

  // --- 1. INIT: CARICAMENTO DATI ---
  useEffect(() => {
    const init = async () => {
      setLoading(true);
      try {
        const [zRes, hRes] = await Promise.all([
          supabase.from('pickup_zones').select('*'),
          supabase.from('hotel_locations').select('*').eq('is_active', true)
        ]);

        // Mappatura Zone (Merge DB + GeoJSON Local)
        const zoneMap: Record<string, Zone> = {};
        if (zRes.data) zRes.data.forEach((z: any) => zoneMap[z.id] = z);

        if (GEOJSON_MASTER?.features) {
          GEOJSON_MASTER.features.forEach((f: any) => {
            if (f.geometry.type === 'Polygon') {
              const zId = f.properties.id === 'AREA_AZURE_001' ? 'azure' :
                          f.properties.id === 'AREA_PINK_001' ? 'pink' :
                          f.properties.id === 'AREA_GREEN_001' ? 'green' :
                          f.properties.id === 'AREA_YELLOW_001' ? 'yellow' : null;
              
              if (zId) {
                // Fallback se zona nuova (es. Azure) non è nel DB
                if (!zoneMap[zId] && zId === 'azure') {
                   zoneMap[zId] = { id: 'azure', name: 'Azure Area', color_code: '#1af0ff', morning_pickup_time: '08:40:00', evening_pickup_time: '16:40:00' } as any;
                }
                if (zoneMap[zId]) zoneMap[zId].coords = f.geometry.coordinates;
              }
            }
          });
        }
        setZones(zoneMap);
        setHotels(hRes.data || []);

        // Ripristino Prenotazione Esistente (Edit Mode)
        if (bookingId) {
          const { data: booking } = await supabase.from('bookings').select('*').eq('internal_id', bookingId).single();
          if (booking) {
            setSelectedClass(booking.session_id?.includes('evening') ? 'evening' : 'morning');
            
            // Set Transport Mode
            if (booking.pickup_zone === 'walk-in') {
                setTransportMode('self');
                // Set Meeting Point (Scuola o Tempio)
                setPickupLoc({ type: 'meeting_point', name: booking.hotel_name, lat: 0, lng: 0, zoneId: 'meeting_point' });
            } else {
                setTransportMode('pickup');
                // Set Pickup
                if (booking.hotel_name) {
                    setPickupLoc({ type: 'db_hotel', name: booking.hotel_name, lat: booking.pickup_lat, lng: booking.pickup_lng, zoneId: booking.pickup_zone });
                    setSearchQuery(booking.hotel_name);
                }
                // Set Dropoff logic
                if (booking.requires_dropoff && booking.dropoff_hotel && booking.dropoff_hotel !== booking.hotel_name) {
                    setIsDropoffSame(false);
                    setDropoffLoc({ type: 'db_hotel', name: booking.dropoff_hotel, lat: booking.dropoff_lat, lng: booking.dropoff_lng, zoneId: booking.dropoff_zone });
                }
            }
          }
        }
      } finally { setLoading(false); }
    };
    init();
  }, [bookingId]);

  // --- 2. LOGICA HELPER ---

  // Detect Zone from Lat/Lng
  const detectZone = (lat: number, lng: number): string | undefined => {
    const priority = ['azure', 'pink', 'green', 'yellow']; // Ordine controllo
    for (const pid of priority) {
      const zone = zones[pid];
      if (zone?.coords && isPointInPolygon({ lat, lng }, zone.coords)) return pid;
    }
    return undefined;
  };

  // Filter Hotels
  const filteredHotels = useMemo(() => {
    if (!searchQuery || searchQuery.length < 2) return [];
    return hotels.filter(h => h.name.toLowerCase().includes(searchQuery.toLowerCase())).slice(0, 5);
  }, [searchQuery, hotels]);

  // Meeting Points Disponibili (Filtrati per orario)
  const availableMeetingPoints = useMemo(() => {
    return GEOJSON_MASTER.features.filter((f: any) => {
        if (f.geometry.type !== 'Point') return false;
        const props = f.properties;
        // Se è sera, nascondi punti che non hanno orario serale (es. Wat Pan Whaen)
        if (selectedClass === 'evening' && !props.evening_pickup_time) return false;
        return true;
    });
  }, [selectedClass]);

  // --- 3. HANDLERS ---

  const handleMapClick = (coords: { lat: number, lng: number }) => {
    if (!isPinningMode) return;
    
    const foundZoneId = detectZone(coords.lat, coords.lng);
    const newLoc: LocationState = {
        type: 'custom_pin',
        name: '', // Utente inserirà nome dopo
        lat: coords.lat,
        lng: coords.lng,
        zoneId: foundZoneId,
        isUnknown: true
    };

    if (activeField === 'pickup') {
        setPickupLoc(newLoc);
        setSearchQuery(''); // Reset search text to force manual input
    } else {
        setDropoffLoc(newLoc);
        setIsDropoffSame(false);
    }
    
    setIsPinningMode(false);
  };

  const handlePointSelect = (point: any) => {
    // Se clicco un punto sulla mappa
    const loc: LocationState = {
        type: 'meeting_point',
        name: point.name,
        lat: point.lat,
        lng: point.lng,
        zoneId: 'meeting_point'
    };

    if (transportMode === 'self') {
        setPickupLoc(loc);
    } else {
        // In pickup mode, posso selezionare un MP come dropoff
        if (activeField === 'pickup') setPickupLoc(loc);
        else setDropoffLoc(loc);
    }
  };

  const handleConfirm = async () => {
    if (!pickupLoc) return;
    
    // Validazione Pickup
    if (transportMode === 'pickup' && pickupLoc.type === 'custom_pin' && !pickupLoc.name.trim()) {
        alert("Please enter a name for your Pickup Location kha.");
        return;
    }
    // Validazione Dropoff
    const finalDropoff = isDropoffSame ? pickupLoc : dropoffLoc;
    if (transportMode === 'pickup' && !isDropoffSame && !finalDropoff) {
        alert("Please select a Drop-off location or enable 'Same as Pickup'.");
        return;
    }

    setSaving(true);
    try {
        // Calcolo Orario Pickup
        let time = "08:50:00"; // Default Walk-in
        if (transportMode === 'pickup' && pickupLoc.zoneId && zones[pickupLoc.zoneId]) {
            const z = zones[pickupLoc.zoneId];
            time = selectedClass === 'morning' ? z.morning_pickup_time : z.evening_pickup_time;
        } else if (transportMode === 'self') {
            // Cerca orario dal GeoJSON per il punto selezionato
            const pt = GEOJSON_MASTER.features.find((f:any) => f.properties.name === pickupLoc.name);
            if (pt?.properties) {
                time = selectedClass === 'morning' 
                    ? (pt.properties.morning_pickup_time || "08:50:00") 
                    : (pt.properties.evening_pickup_time || "16:50:00");
            }
        }

        const payload = {
            // Pickup
            hotel_name: pickupLoc.name,
            pickup_zone: transportMode === 'self' ? 'walk-in' : (pickupLoc.zoneId || 'outside'),
            pickup_lat: pickupLoc.lat,
            pickup_lng: pickupLoc.lng,
            pickup_time: time,
            
            // Dropoff (Solo se non Self)
            requires_dropoff: transportMode === 'pickup',
            dropoff_hotel: transportMode === 'pickup' ? finalDropoff?.name : null,
            dropoff_zone: transportMode === 'pickup' ? finalDropoff?.zoneId : null,
            dropoff_lat: transportMode === 'pickup' ? finalDropoff?.lat : null,
            dropoff_lng: transportMode === 'pickup' ? finalDropoff?.lng : null,

            customer_note: pickupLoc.isUnknown ? `Manual Pin: ${pickupLoc.name}` : undefined
        };

        if (isEditMode) {
            await supabase.from('bookings').update(payload).eq('internal_id', bookingId);
            localStorage.removeItem('current_booking_id');
            onNavigate('user');
        } else {
            localStorage.setItem('pickup_draft_data', JSON.stringify(payload));
            onNavigate('booking');
        }

    } catch (e) {
        console.error(e);
        alert("Error saving location.");
    } finally {
        setSaving(false);
    }
  };

  return (
    <PageLayout slug="location" hideDefaultHeader={true} loading={loading} isFullScreen={true}>
      <div className="relative w-full h-[100dvh] flex flex-col lg:block bg-black overflow-hidden">
        
        {/* ================= MAPPA (Z-0) ================= */}
        <div className="absolute inset-0 z-0">
          <PickupMapBackground 
            geoJsonData={GEOJSON_MASTER}
            selectedLocation={activeField === 'pickup' ? pickupLoc : dropoffLoc}
            onMapClick={handleMapClick}
            onPointSelect={handlePointSelect}
            selectionMode={true} // Sempre attiva per interazione fluida
          />
        </div>

        {/* ================= SIDEBAR UI (Z-10) ================= */}
        <div className={cn(
            "relative z-10 flex flex-col shadow-2xl transition-all duration-700 ease-cinematic",
            "bg-[#0a0b0d]/95 backdrop-blur-xl border-t lg:border border-white/10",
            "w-full h-[75vh] mt-auto rounded-t-[3rem]",
            "lg:absolute lg:left-8 lg:top-8 lg:bottom-8 lg:w-[480px] lg:h-auto lg:rounded-[3rem] lg:mt-0"
        )}>
            
            {/* HEADER SIDEBAR */}
            <div className="p-6 md:p-8 shrink-0 space-y-5">
                <div className="flex justify-between items-center">
                    <div>
                        <Typography variant="h4" className="italic uppercase text-white leading-none">
                            Pickup <span className="text-primary">Location</span>
                        </Typography>
                        {isEditMode && <Badge variant="mineral" className="mt-2 text-yellow-500 border-yellow-500/30">Edit Mode</Badge>}
                    </div>
                    {/* Session Toggle */}
                    <div className="flex bg-white/5 p-1 rounded-xl border border-white/10">
                        <button onClick={() => setSelectedClass('morning')} className={cn("px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all", selectedClass === 'morning' ? "bg-white text-black" : "text-white/40")}>AM</button>
                        <button onClick={() => setSelectedClass('evening')} className={cn("px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all", selectedClass === 'evening' ? "bg-secondary text-black" : "text-white/40")}>PM</button>
                    </div>
                </div>

                {/* TRANSPORT MODE TOGGLE */}
                <div className="grid grid-cols-2 gap-3">
                    <button onClick={() => setTransportMode('pickup')} className={cn("p-4 rounded-2xl border text-left transition-all", transportMode === 'pickup' ? "bg-action/10 border-action text-white" : "bg-white/5 border-white/5 text-white/40")}>
                        <div className="flex justify-between mb-1"><Icon name="local_taxi" className={transportMode === 'pickup' ? "text-action" : ""} /> {transportMode === 'pickup' && <Icon name="check_circle" size="xs" className="text-action" />}</div>
                        <div className="text-xs font-black uppercase">Need Pickup</div>
                        <div className="text-[10px] opacity-60">From Hotel</div>
                    </button>
                    <button onClick={() => setTransportMode('self')} className={cn("p-4 rounded-2xl border text-left transition-all", transportMode === 'self' ? "bg-blue-500/10 border-blue-500 text-white" : "bg-white/5 border-white/5 text-white/40")}>
                        <div className="flex justify-between mb-1"><Icon name="directions_walk" className={transportMode === 'self' ? "text-blue-500" : ""} /> {transportMode === 'self' && <Icon name="check_circle" size="xs" className="text-blue-500" />}</div>
                        <div className="text-xs font-black uppercase">Go Myself</div>
                        <div className="text-[10px] opacity-60">Meet at School</div>
                    </button>
                </div>
            </div>

            {/* SCROLLABLE CONTENT */}
            <div className="flex-1 overflow-y-auto px-6 md:px-8 space-y-6 custom-scrollbar pb-6">
                
                {/* --- MODE 1: PICKUP LOGIC --- */}
                {transportMode === 'pickup' && (
                    <div className="space-y-6">
                        
                        {/* A. PICKUP FIELD */}
                        <div onClick={() => setActiveField('pickup')} className={cn("transition-opacity", activeField === 'dropoff' && "opacity-50")}>
                            <Typography variant="caption" className="text-action mb-2 block uppercase tracking-widest font-bold">Start Location (Pickup)</Typography>
                            <div className="relative group">
                                <Input 
                                    placeholder="Search Hotel..." 
                                    value={activeField === 'pickup' ? searchQuery : pickupLoc?.name || ''}
                                    onChange={(e) => { setSearchQuery(e.target.value); setShowSuggestions(true); }}
                                    onFocus={() => { setActiveField('pickup'); setShowSuggestions(true); }}
                                    className="pl-10 bg-white/5 border-white/10 text-white font-bold"
                                />
                                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-action"><Icon name="search" size="sm"/></div>
                                
                                {/* Suggestions Dropdown */}
                                {activeField === 'pickup' && showSuggestions && filteredHotels.length > 0 && (
                                    <div className="absolute top-full left-0 right-0 mt-2 bg-[#1a1a1a] border border-white/10 rounded-2xl z-50 shadow-2xl">
                                        {filteredHotels.map(h => (
                                            <div key={h.id} onClick={() => { 
                                                setPickupLoc({ type: 'db_hotel', name: h.name, lat: h.latitude, lng: h.longitude, zoneId: h.zone_id }); 
                                                setSearchQuery(h.name); setShowSuggestions(false); 
                                            }} className="p-3 hover:bg-white/10 cursor-pointer text-sm text-white border-b border-white/5 last:border-0">
                                                {h.name}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                            
                            {/* Manual Pin Trigger */}
                            <button onClick={() => { setActiveField('pickup'); setIsPinningMode(true); }} className="flex items-center gap-2 mt-2 text-[10px] font-bold text-white/40 hover:text-white uppercase tracking-wider">
                                <Icon name="add_location_alt" size="xs" /> Pin on Map
                            </button>
                        </div>

                        {/* CONNECTOR LINE */}
                        <div className="relative flex items-center justify-center py-2">
                            <div className="w-px h-8 bg-white/10 absolute top-0"></div>
                            <div className="w-px h-8 bg-white/10 absolute bottom-0"></div>
                            <div onClick={() => setIsDropoffSame(!isDropoffSame)} className="relative z-10 bg-[#121212] border border-white/20 px-4 py-2 rounded-full cursor-pointer flex items-center gap-3 hover:border-white/40 transition-all">
                                <span className="text-[10px] font-bold uppercase text-white/60">Same Drop-off?</span>
                                <Toggle checked={isDropoffSame} onChange={setIsDropoffSame} className="scale-75" />
                            </div>
                        </div>

                        {/* B. DROPOFF FIELD */}
                        <div className={cn("transition-all duration-500", isDropoffSame ? "opacity-40 grayscale pointer-events-none" : "opacity-100")}>
                            <Typography variant="caption" className="text-yellow-500 mb-2 block uppercase tracking-widest font-bold">End Location (Drop-off)</Typography>
                            <div className="relative" onClick={() => setActiveField('dropoff')}>
                                <Input 
                                    placeholder="Same as Pickup" 
                                    value={isDropoffSame ? (pickupLoc?.name || '') : (dropoffLoc?.name || '')}
                                    onChange={(e) => setDropoffLoc({...dropoffLoc!, name: e.target.value, type: 'custom_pin', lat: 0, lng: 0})} // Basic text edit
                                    disabled={isDropoffSame}
                                    className="pl-10 bg-white/5 border-white/10 text-white font-bold"
                                />
                                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-yellow-500"><Icon name="flag" size="sm"/></div>
                            </div>
                            {!isDropoffSame && (
                                <button onClick={() => { setActiveField('dropoff'); setIsPinningMode(true); }} className="flex items-center gap-2 mt-2 text-[10px] font-bold text-white/40 hover:text-white uppercase tracking-wider">
                                    <Icon name="add_location_alt" size="xs" /> Pin Drop-off
                                </button>
                            )}
                        </div>

                    </div>
                )}

                {/* --- MODE 2: SELF TRANSPORT --- */}
                {transportMode === 'self' && (
                    <div className="space-y-4">
                        <Typography variant="caption" className="text-blue-400 block uppercase tracking-widest font-bold mb-2">Select Meeting Point</Typography>
                        {availableMeetingPoints.map((pt: any) => {
                            const isSelected = pickupLoc?.name === pt.properties.name;
                            return (
                                <div key={pt.properties.name} onClick={() => setPickupLoc({ type: 'meeting_point', name: pt.properties.name, lat: pt.geometry.coordinates[1], lng: pt.geometry.coordinates, zoneId: 'meeting_point' })}
                                    className={cn("p-4 rounded-2xl border cursor-pointer flex items-center gap-4 transition-all", isSelected ? "bg-blue-500/20 border-blue-500" : "bg-white/5 border-white/10 hover:bg-white/10")}
                                >
                                    <div className="size-10 rounded-full bg-white flex items-center justify-center shrink-0">
                                        {pt.properties.icon ? <img src={pt.properties.icon} className="w-6 h-6"/> : <Icon name="place" className="text-black"/>}
                                    </div>
                                    <div>
                                        <div className="font-bold text-white text-sm">{pt.properties.name}</div>
                                        <div className="text-[10px] text-white/60 mt-1">
                                            {selectedClass === 'morning' ? pt.properties.morning_pickup_time : pt.properties.evening_pickup_time}
                                        </div>
                                    </div>
                                    {isSelected && <Icon name="check_circle" className="ml-auto text-blue-500" />}
                                </div>
                            );
                        })}
                    </div>
                )}

            </div>

            {/* FOOTER ACTIONS */}
            <div className="p-6 md:p-8 bg-black/40 border-t border-white/10">
                <Button 
                    variant={isEditMode ? "mineral" : "action"} 
                    fullWidth size="xl" 
                    onClick={handleConfirm}
                    isLoading={saving}
                    disabled={!pickupLoc}
                    className="shadow-xl"
                    icon={isEditMode ? "save" : "check_circle"}
                >
                    {isEditMode ? "Update Booking" : "Confirm Location"}
                </Button>
            </div>

        </div>
      </div>
    </PageLayout>
  );
};

export default LocationPage;