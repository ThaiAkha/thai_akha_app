import React, { useState, useEffect, useMemo } from 'react';
import { supabase } from '../lib/supabase';
import { AdminThreeColumnLayout } from '../components/layout/index';
import { 
  Typography, 
  Button, 
  Icon, 
  Badge, 
  Avatar, 
  Card, 
  Input, 
  Textarea, 
  Divider,
  Table
} from '../components/ui/index';
import { cn } from '../lib/utils';

// --- TYPES ---
interface LogisticsItem {
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
}

interface DriverProfile {
  id: string;
  full_name: string;
  avatar_url?: string;
}

interface SessionSummary {
  date: string;
  session_id: string;
  unassigned_count: number;
}

// Added onNavigate to props to fix type error in App.tsx kha
const AdminLogistics: React.FC<{ onNavigate: (page: string) => void }> = ({ onNavigate }) => {
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [items, setItems] = useState<LogisticsItem[]>([]);
  const [drivers, setDrivers] = useState<DriverProfile[]>([]);
  const [upcomingSessions, setUpcomingSessions] = useState<SessionSummary[]>([]);
  
  // Selection State
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedSessionId, setSelectedSessionId] = useState('morning_class');
  const [selectedBookingId, setSelectedBookingId] = useState<string | null>(null);

  // --- 1. DATA FETCHING ---
  const fetchData = async () => {
    setLoading(true);
    try {
      // A. Fetch Next 10 Sessions for Left Column
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

      // C. Fetch Selected Session Items
      const { data: bookingData } = await supabase
        .from('bookings')
        .select(`
          internal_id, pax_count, hotel_name, pickup_zone, pickup_time, route_order, 
          customer_note, agency_note, pickup_driver_uid, phone_number, session_id, 
          booking_date, transport_status,
          profiles:user_id(full_name, avatar_url)
        `)
        .eq('booking_date', selectedDate)
        .eq('session_id', selectedSessionId)
        .neq('status', 'cancelled')
        .order('route_order', { ascending: true });

      if (bookingData) {
        setItems(bookingData.map((b: any) => ({
          id: b.internal_id,
          guest_name: b.profiles?.full_name || 'Guest',
          pax: b.pax_count,
          hotel_name: b.hotel_name || 'To be selected',
          pickup_time: b.pickup_time || '--:--',
          pickup_zone: b.pickup_zone || 'pending',
          route_order: b.route_order || 0,
          avatar_url: b.profiles?.avatar_url,
          pickup_driver_uid: b.pickup_driver_uid,
          has_missing_info: !b.hotel_name || b.hotel_name === 'To be selected',
          customer_note: b.customer_note,
          agency_note: b.agency_note,
          phone_number: b.phone_number,
          session_id: b.session_id,
          booking_date: b.booking_date,
          transport_status: b.transport_status
        })));
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, [selectedDate, selectedSessionId]);

  // --- 2. ACTIONS ---
  const handleAssign = async (bookingId: string, driverId: string | null) => {
    const { error } = await supabase
      .from('bookings')
      .update({ pickup_driver_uid: driverId, route_order: 99 })
      .eq('internal_id', bookingId);
    
    if (!error) fetchData();
  };

  const handleUpdateBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBookingId) return;
    setIsSaving(true);
    
    const item = items.find(i => i.id === selectedBookingId);
    if (!item) return;

    const { error } = await supabase
      .from('bookings')
      .update({
        hotel_name: item.hotel_name,
        pickup_time: item.pickup_time,
        customer_note: item.customer_note,
        agency_note: item.agency_note,
        phone_number: item.phone_number
      })
      .eq('internal_id', selectedBookingId);

    if (!error) {
      alert("Changes saved kha!");
      fetchData();
    }
    setIsSaving(false);
  };

  const updateLocalItem = (id: string, updates: Partial<LogisticsItem>) => {
    setItems(prev => prev.map(i => i.id === id ? { ...i, ...updates } : i));
  };

  // --- 3. COMPONENTS ---
  const unassignedItems = useMemo(() => items.filter(i => !i.pickup_driver_uid), [items]);
  const selectedBooking = useMemo(() => items.find(i => i.id === selectedBookingId), [items, selectedBookingId]);

  const leftPane = (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="p-6 border-b border-border bg-black/5">
        <Typography variant="h6" className="uppercase tracking-widest text-desc/40">Upcoming Sessions</Typography>
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {upcomingSessions.map((s) => (
          <button
            key={`${s.date}_${s.session_id}`}
            onClick={() => { setSelectedDate(s.date); setSelectedSessionId(s.session_id); }}
            className={cn(
              "w-full p-4 rounded-2xl border text-left transition-all group",
              selectedDate === s.date && selectedSessionId === s.session_id
                ? "bg-action/10 border-action text-action shadow-sm"
                : "bg-surface border-border text-desc hover:bg-black/5"
            )}
          >
            <div className="flex justify-between items-start mb-1">
              <span className="font-mono text-xs font-black">{s.date}</span>
              <Icon name={s.session_id.includes('morning') ? 'wb_sunny' : 'dark_mode'} size="xs" />
            </div>
            <div className="flex justify-between items-center">
              <span className="text-[10px] font-bold uppercase tracking-wider opacity-60">
                {s.session_id.replace('_class', '')}
              </span>
              {s.unassigned_count > 0 && (
                <Badge variant="mineral" className="bg-red-500/10 text-red-500 border-red-500/20 px-1.5 h-4">
                  {s.unassigned_count} NEW
                </Badge>
              )}
            </div>
          </button>
        ))}
      </div>
      
      <Divider variant="mineral" label="Staging (Unassigned)" />
      <div className="p-4 space-y-3 max-h-[40%] overflow-y-auto custom-scrollbar">
        {unassignedItems.map(item => (
          <div 
            key={item.id} 
            onClick={() => setSelectedBookingId(item.id)}
            className={cn(
              "p-3 rounded-xl border-2 cursor-pointer transition-all",
              selectedBookingId === item.id ? "bg-red-500/10 border-red-500/50" : "bg-surface border-border hover:border-red-400/30"
            )}
          >
            <div className="flex justify-between items-center">
              <span className="text-xs font-black uppercase truncate max-w-[120px]">{item.guest_name}</span>
              <Badge variant="outline" className="text-[9px] h-4">{item.pax}p</Badge>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const centerPane = (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b border-border flex justify-between items-center bg-surface/50 backdrop-blur-sm sticky top-0 z-20">
        <div className="flex items-center gap-4">
          <Badge variant="brand" className="bg-action text-white">LIVE BOARD</Badge>
          <Typography variant="h5" className="font-black uppercase italic">{selectedDate} - {selectedSessionId.replace('_', ' ')}</Typography>
        </div>
        <div className="flex gap-2">
          <Button variant="mineral" size="sm" icon="auto_fix">Auto-Assign</Button>
          <Button variant="mineral" size="sm" icon="print" onClick={() => window.print()}>Manifest</Button>
        </div>
      </div>

      <div className="flex-1 overflow-x-auto overflow-y-hidden p-6">
        <div className="flex h-full gap-6 min-w-max pb-4">
          {drivers.map(driver => {
            const driverItems = items.filter(i => i.pickup_driver_uid === driver.id);
            return (
              <div key={driver.id} className="w-[320px] flex flex-col rounded-3xl border border-border bg-surface shadow-xl overflow-hidden">
                <div className="p-4 border-b border-border bg-black/5 flex items-center gap-3">
                  <Avatar src={driver.avatar_url} initials={driver.full_name} size="sm" />
                  <div>
                    <div className="font-black text-title uppercase text-xs tracking-widest">{driver.full_name}</div>
                    <div className="text-[9px] text-desc/40 font-mono">{driverItems.length} Stops</div>
                  </div>
                </div>
                <div className="flex-1 overflow-y-auto p-3 space-y-3 bg-background/30">
                  {driverItems.map(item => (
                    <Card 
                      key={item.id} 
                      variant="glass" 
                      padding="none" 
                      onClick={() => setSelectedBookingId(item.id)}
                      className={cn(
                        "p-4 border-2 transition-all cursor-pointer",
                        selectedBookingId === item.id ? "border-action bg-action/5" : "border-border hover:border-action/30"
                      )}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <span className="font-mono text-xs font-black text-action">{item.pickup_time}</span>
                        <Badge variant="mineral" className="text-[9px] h-4">{item.pax} PAX</Badge>
                      </div>
                      <div className="font-bold text-sm text-title uppercase truncate">{item.guest_name}</div>
                      <div className="flex items-center gap-1 mt-2 text-[10px] text-desc/60 truncate">
                        <Icon name="location_on" size="xs" />
                        {item.hotel_name}
                      </div>
                    </Card>
                  ))}
                  {driverItems.length === 0 && (
                    <div className="h-full flex flex-col items-center justify-center opacity-20 py-20">
                      <Icon name="local_taxi" size="xl" />
                      <span className="text-[10px] font-black uppercase">No Route</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );

  const rightPane = (
    <div className="flex flex-col h-full">
      {!selectedBooking ? (
        <div className="flex-1 flex flex-col items-center justify-center p-12 text-center text-desc/20">
          <Icon name="person_search" size="2xl" className="mb-4" />
          <Typography variant="h5" className="uppercase font-black">Select a Passenger</Typography>
          <p className="text-xs mt-2">Click any card to inspect and manage pickup details kha.</p>
        </div>
      ) : (
        <form onSubmit={handleUpdateBooking} className="flex-1 flex flex-col animate-in slide-in-from-right-4">
          <div className="p-8 border-b border-border bg-black/5 space-y-4">
            <div className="flex justify-between items-start">
              <div className="space-y-1">
                <Badge variant="mineral" className="bg-primary/10 text-primary border-primary/20">{selectedBooking.pax} PAX</Badge>
                <Typography variant="h3" className="text-title font-black uppercase tracking-tight leading-none">
                  {selectedBooking.guest_name}
                </Typography>
              </div>
              <button 
                type="button"
                onClick={() => setSelectedBookingId(null)}
                className="size-8 rounded-full hover:bg-black/5 flex items-center justify-center text-desc/40"
              >
                <Icon name="close" size="sm" />
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-8 space-y-8 custom-scrollbar">
            <section className="space-y-4">
              <Typography variant="h6" className="text-desc/40 uppercase tracking-widest text-[10px] font-black">Route Assignment</Typography>
              <div className="space-y-3">
                <label className="block text-xs font-bold text-desc/60">Assigned Driver</label>
                <select 
                  value={selectedBooking.pickup_driver_uid || ''}
                  onChange={(e) => handleAssign(selectedBooking.id, e.target.value || null)}
                  className="w-full bg-surface border border-border rounded-xl px-4 py-3 text-sm font-bold text-title outline-none focus:border-action transition-all"
                >
                  <option value="">-- UNASSIGNED --</option>
                  {drivers.map(d => <option key={d.id} value={d.id}>{d.full_name}</option>)}
                </select>
              </div>
            </section>

            <Divider variant="mineral" />

            <section className="space-y-5">
              <Typography variant="h6" className="text-desc/40 uppercase tracking-widest text-[10px] font-black">Pickup Details</Typography>
              
              <Input 
                label="Hotel / Meeting Point" 
                value={selectedBooking.hotel_name} 
                onChange={e => updateLocalItem(selectedBooking.id, { hotel_name: e.target.value })}
                leftIcon="location_on"
              />

              <div className="grid grid-cols-2 gap-4">
                <Input 
                  label="Pickup Time" 
                  type="time" 
                  value={selectedBooking.pickup_time} 
                  onChange={e => updateLocalItem(selectedBooking.id, { pickup_time: e.target.value })}
                />
                <Input 
                  label="Contact Phone" 
                  value={selectedBooking.phone_number || ''} 
                  onChange={e => updateLocalItem(selectedBooking.id, { phone_number: e.target.value })}
                  leftIcon="call"
                />
              </div>

              <div className="aspect-video bg-black/5 rounded-2xl border border-border flex flex-col items-center justify-center text-desc/20">
                <Icon name="map" size="lg" />
                <span className="text-[10px] font-black uppercase mt-1">Location Map View</span>
              </div>
            </section>

            <Divider variant="mineral" />

            <section className="space-y-5">
              <Typography variant="h6" className="text-desc/40 uppercase tracking-widest text-[10px] font-black">Communication</Typography>
              <Textarea 
                label="Customer Notes" 
                value={selectedBooking.customer_note || ''} 
                onChange={e => updateLocalItem(selectedBooking.id, { customer_note: e.target.value })}
                rows={3}
              />
              <Textarea 
                label="Agency / Internal Notes" 
                value={selectedBooking.agency_note || ''} 
                onChange={e => updateLocalItem(selectedBooking.id, { agency_note: e.target.value })}
                rows={3}
                variant="filled"
              />
            </section>
          </div>

          <div className="p-6 bg-surface border-t border-border mt-auto">
            <Button 
              type="submit"
              variant="action" 
              fullWidth 
              size="lg" 
              icon="save" 
              isLoading={isSaving}
              className="shadow-action-glow rounded-2xl h-14"
            >
              Update Passenger
            </Button>
          </div>
        </form>
      )}
    </div>
  );

  return (
    <AdminThreeColumnLayout 
      loading={false}
      leftContent={leftPane}
      centerContent={centerPane}
      rightContent={rightPane}
    />
  );
};

export default AdminLogistics;