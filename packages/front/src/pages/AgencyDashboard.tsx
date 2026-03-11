import React, { useState, useEffect, useMemo } from 'react';
import { supabase } from '../lib/supabase';
import { AdminThreeColumnLayout } from '../components/layout/index';
import { 
  AdminHeader, 
  AdminListItem, 
  AdminSearch, 
  AdminDetailView 
} from '../components/admin/ui/index';
import { 
  Typography, 
  Button, 
  Icon, 
  Badge, 
  Input, 
  Textarea, 
  Card,
  Divider 
} from '../components/ui/index';
import { UserProfile } from '../services/authService';
import { cn } from '../lib/utils';

interface AgencyBooking {
  internal_id: string;
  booking_ref: string | null;
  guest_name: string;
  email: string;
  booking_date: string;
  session_type: string;
  pax: number;
  total_price: number;
  commission: number;
  status: 'confirmed' | 'pending' | 'cancelled' | 'completed';
  hotel_name: string;
  pickup_time: string;
  pickup_zone: string;
  customer_note: string;
  agency_note: string;
  phone_number: string;
}

const getDisplayId = (b: AgencyBooking) => b.booking_ref || b.internal_id.slice(0, 8).toUpperCase();

const AgencyDashboard: React.FC<{ onNavigate: (p: string) => void, userProfile: UserProfile | null }> = ({ onNavigate, userProfile }) => {
  const [loading, setLoading] = useState(true);
  const [bookings, setBookings] = useState<AgencyBooking[]>([]);
  const [selectedBookingId, setSelectedBookingId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState<Partial<AgencyBooking>>({});
  const [isSaving, setIsSaving] = useState(false);

  const fetchBookings = async () => {
    if (!userProfile) return;
    setLoading(true);
    try {
      let query = supabase
        .from('bookings')
        .select(`
          internal_id, booking_ref, booking_date, session_id, pax_count, total_price, status,
          customer_note, agency_note, hotel_name, pickup_time, pickup_zone, phone_number,
          profiles:user_id(full_name, email)
        `)
        .order('booking_date', { ascending: false });

      if (userProfile.role === 'agency') query = query.eq('user_id', userProfile.id);

      const { data } = await query;
      const mapped: AgencyBooking[] = (data || []).map((b: any) => ({
        internal_id: b.internal_id,
        booking_ref: b.booking_ref,
        guest_name: b.profiles?.full_name || 'Guest',
        email: b.profiles?.email || '',
        booking_date: b.booking_date,
        session_type: b.session_id?.includes('morning') ? 'Morning Class' : 'Evening Class',
        pax: b.pax_count,
        total_price: b.total_price,
        commission: Math.round(b.total_price * ((userProfile.agency_commission_rate || 0) / 100)),
        status: b.status,
        hotel_name: b.hotel_name || '',
        pickup_time: b.pickup_time ? b.pickup_time.slice(0,5) : '--:--',
        pickup_zone: b.pickup_zone || 'pending',
        customer_note: b.customer_note || '',
        agency_note: b.agency_note || '',
        phone_number: b.phone_number || ''
      }));
      setBookings(mapped);
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchBookings(); }, [userProfile]);

  const activeBooking = useMemo(() => bookings.find(b => b.internal_id === selectedBookingId), [bookings, selectedBookingId]);

  useEffect(() => {
    if (activeBooking) {
      setEditForm({ hotel_name: activeBooking.hotel_name, pickup_time: activeBooking.pickup_time, agency_note: activeBooking.agency_note, booking_date: activeBooking.booking_date, status: activeBooking.status });
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
    } finally { setIsSaving(false); }
  };

  const filteredList = useMemo(() => {
    return bookings.filter(b => (statusFilter === 'all' || b.status === statusFilter) && 
      (b.guest_name.toLowerCase().includes(searchQuery.toLowerCase()) || getDisplayId(b).toLowerCase().includes(searchQuery.toLowerCase())));
  }, [bookings, statusFilter, searchQuery]);

  // --- PANES ---
  const leftPane = (
    <div className="flex flex-col h-full">
      <AdminHeader title="Bookings" icon="business_center" actions={
        <Button variant="mineral" size="xs" icon="add" onClick={() => onNavigate('booking')}>New</Button>
      }/>
      <AdminSearch value={searchQuery} onChange={setSearchQuery} placeholder="Search Ref or Guest..." />
      
      <div className="p-4 border-b border-border bg-black/5">
        <div className="flex gap-2 overflow-x-auto no-scrollbar">
          {['all', 'confirmed', 'pending', 'cancelled'].map(s => (
            <button key={s} onClick={() => setStatusFilter(s)} className={cn("px-3 py-1.5 rounded-lg text-[9px] uppercase font-black tracking-wider transition-all border", statusFilter === s ? "bg-title text-surface border-title shadow-sm" : "bg-surface border-border text-desc/40")}>
              {s}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar">
        {filteredList.map(b => (
          <AdminListItem 
            key={b.internal_id}
            title={b.guest_name}
            subtitle={`${new Date(b.booking_date).toLocaleDateString()} • ${getDisplayId(b)}`}
            isActive={selectedBookingId === b.internal_id}
            onClick={() => setSelectedBookingId(b.internal_id)}
            status={<Badge variant="mineral" className="h-4 px-1.5 text-[8px]">{b.status}</Badge>}
          />
        ))}
      </div>
    </div>
  );

  const centerPane = (
    <div className="flex flex-col h-full bg-background">
      <AdminHeader title="Invoice Preview" />
      <div className="flex-1 overflow-y-auto p-12 flex justify-center items-start">
        {activeBooking ? (
          <Card variant="glass" padding="none" className="w-full max-w-[800px] bg-surface shadow-2xl border border-border animate-in zoom-in-95 duration-500">
            <div className="p-12 space-y-12">
              <div className="flex justify-between items-start">
                <div className="size-16 rounded-2xl bg-primary flex items-center justify-center text-white shadow-brand-glow"><Icon name="restaurant" size="lg"/></div>
                <div className="text-right">
                   <Typography variant="h3" className="text-title uppercase font-black italic">Invoice</Typography>
                   <span className="text-desc/40 font-mono text-xs">REF: #{getDisplayId(activeBooking)}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-12 text-sm">
                <div className="space-y-2">
                  <span className="text-[10px] font-black uppercase text-desc/40 tracking-widest">Billed To</span>
                  <div className="font-bold text-title">{userProfile?.agency_company_name || userProfile?.full_name}</div>
                  <div className="text-desc/60 leading-relaxed">{userProfile?.agency_address || 'Partner Address'}<br/>{userProfile?.agency_city}</div>
                </div>
                <div className="space-y-2">
                  <span className="text-[10px] font-black uppercase text-desc/40 tracking-widest">Guest Info</span>
                  <div className="font-bold text-title">{activeBooking.guest_name}</div>
                  <div className="text-desc/60">{activeBooking.session_type}<br/>{activeBooking.pax} Participants</div>
                </div>
              </div>

              <div className="border-y border-border py-8">
                <table className="w-full text-sm">
                  <thead><tr className="text-desc/40 uppercase text-[10px] tracking-widest border-b border-border pb-4"><th className="text-left font-black pb-4">Description</th><th className="text-center font-black pb-4">Date</th><th className="text-right font-black pb-4">Amount</th></tr></thead>
                  <tbody className="divide-y divide-border/50"><tr className="text-title"><td className="py-6 font-bold">{activeBooking.session_type} for {activeBooking.pax} pax</td><td className="text-center">{activeBooking.booking_date}</td><td className="text-right font-mono font-bold">{activeBooking.total_price.toLocaleString()} THB</td></tr></tbody>
                </table>
              </div>

              <div className="flex justify-end pt-4">
                <div className="w-64 space-y-3">
                  <div className="flex justify-between text-xs text-desc/60"><span>Gross Subtotal</span><span className="font-mono">{activeBooking.total_price.toLocaleString()} THB</span></div>
                  <div className="flex justify-between text-xs text-green-500"><span>Agency Discount ({userProfile?.agency_commission_rate}%)</span><span className="font-mono">-{activeBooking.commission.toLocaleString()} THB</span></div>
                  <Divider variant="mineral" />
                  <div className="flex justify-between items-baseline">
                    <span className="text-xs font-black uppercase">Net Payable</span>
                    <span className="text-2xl font-mono font-black text-primary">{(activeBooking.total_price - activeBooking.commission).toLocaleString()} <span className="text-[10px] font-sans">THB</span></span>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        ) : (
          <div className="h-full flex flex-col items-center justify-center opacity-20"><Icon name="description" size="xl" className="mb-4"/><p className="text-xs font-black uppercase">Select a booking</p></div>
        )}
      </div>
    </div>
  );

  const rightPane = (
    <AdminDetailView 
      title="Inspector" 
      subtitle={activeBooking ? getDisplayId(activeBooking) : "Action required"}
      onClose={() => setSelectedBookingId(null)}
      actions={
        activeBooking && (
          <div className="grid grid-cols-2 gap-2">
            <Button variant="mineral" fullWidth icon="print" onClick={() => window.print()}>Print</Button>
            <Button variant={isEditing ? "action" : "brand"} fullWidth icon={isEditing ? "save" : "edit"} onClick={() => isEditing ? handleSave() : setIsEditing(true)} isLoading={isSaving}>{isEditing ? "Save" : "Edit Booking"}</Button>
          </div>
        )
      }
    >
      {activeBooking ? (
        <div className="space-y-8 animate-in slide-in-from-right-4">
           <section className="space-y-4">
              <Typography variant="h6" className="text-desc/40 uppercase text-[10px] font-black tracking-widest">Guest Logistics</Typography>
              <Input label="Hotel / Pickup" disabled={!isEditing} value={isEditing ? editForm.hotel_name : activeBooking.hotel_name} onChange={e => setEditForm({...editForm, hotel_name: e.target.value})} leftIcon="location_on" />
              <div className="grid grid-cols-2 gap-3">
                <Input label="Time" type="time" disabled={!isEditing} value={isEditing ? editForm.pickup_time : activeBooking.pickup_time} onChange={e => setEditForm({...editForm, pickup_time: e.target.value})} />
                <Input label="Pax" disabled={true} value={activeBooking.pax} />
              </div>
           </section>

           <Divider variant="mineral" />

           <section className="space-y-4">
              <Typography variant="h6" className="text-desc/40 uppercase text-[10px] font-black tracking-widest">Internal Details</Typography>
              <Textarea label="Agency Note" disabled={!isEditing} rows={4} value={isEditing ? editForm.agency_note : activeBooking.agency_note} onChange={e => setEditForm({...editForm, agency_note: e.target.value})} />
              <div className="bg-black/5 p-4 rounded-xl space-y-1">
                 <span className="text-[9px] font-black uppercase text-desc/40">Guest Contact</span>
                 <div className="text-xs font-bold text-title">{activeBooking.phone_number || 'No Phone Recorded'}</div>
              </div>
           </section>

           {isEditing && (
             <section className="space-y-4 pt-4">
                <Typography variant="h6" className="text-desc/40 uppercase text-[10px] font-black tracking-widest">Lifecycle Status</Typography>
                <div className="flex gap-2">
                   {(['confirmed', 'pending', 'cancelled'] as const).map(s => (
                     <button key={s} onClick={() => setEditForm({...editForm, status: s})} className={cn("flex-1 py-2 rounded-xl text-[10px] font-black uppercase border transition-all", editForm.status === s ? "bg-primary text-white border-primary shadow-lg" : "bg-surface border-border text-desc/40")}>{s}</button>
                   ))}
                </div>
             </section>
           )}
        </div>
      ) : (
        <div className="text-center py-20 opacity-20"><Icon name="edit_note" size="xl"/><p className="text-xs font-black uppercase mt-4">Inspector Idle</p></div>
      )}
    </AdminDetailView>
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

export default AgencyDashboard;