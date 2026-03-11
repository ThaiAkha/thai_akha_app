import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { AdminPageLayout } from '../components/layout/AdminPageLayout';
import { Typography, Card, Icon, Table, Tabs, Badge, ClassPicker } from '../components/ui/index';
import { SessionType } from '../components/ui/ClassPicker';
import { cn } from '../lib/utils';

// --- CONFIGURAZIONE NAVIGAZIONE ---
const NAV_TABS = [
  { value: 'kitchen', label: 'Kitchen Prep', icon: 'skillet' },
  { value: 'reports', label: 'Reports', icon: 'bar_chart' }
];

type DashboardView = 'kitchen' | 'reports';

// --- COLONNE TABELLA CUCINA ---
const KITCHEN_COLS = [
  { 
    key: 'profiles.full_name', 
    header: 'Chef Name', 
    render: (_: any, r: any) => (
      <div className="flex items-center gap-3">
        <div className="size-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-xs font-black text-title shadow-inner">
            {(r.profiles?.full_name || 'G').charAt(0)}
        </div>
        <div>
            <span className="font-bold text-title block">{r.profiles?.full_name || 'Guest'}</span>
            <span className="text-[10px] text-desc/60 font-mono tracking-widest uppercase">
                #{r.internal_id.slice(0,6)}
            </span>
        </div>
      </div>
    )
  },
  { 
    key: 'pax_count', 
    header: 'Pax', 
    align: 'center' as const, 
    render: (v: number) => (
        <span className="font-mono font-black text-xl text-title">{v}</span>
    )
  },
  { 
    key: 'menu_selections', 
    header: 'Dietary Protocol', 
    render: (_: any, r: any) => {
      const diet = r.profiles?.dietary_profile?.replace('diet_', '') || 'Regular';
      const allergies = r.profiles?.allergies || [];
      const isSpecial = diet !== 'Regular' || allergies.length > 0;

      return (
        <div className="flex flex-col gap-1.5 items-start">
          <Badge variant={isSpecial ? 'mineral' : 'outline'} className={cn("text-[10px]", isSpecial ? "text-orange-400 bg-orange-500/10 border-orange-500/20" : "text-desc opacity-50")}>
            {diet.toUpperCase()}
          </Badge>
          
          {allergies.length > 0 && (
            <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-red-500/10 border border-red-500/20">
                <Icon name="warning" size="xs" className="text-red-400"/> 
                <span className="text-[9px] font-black text-red-400 uppercase tracking-wider">{allergies.join(', ')}</span>
            </div>
          )}
        </div>
      );
    } 
  }
];

const AdminKitchenDashboard: React.FC<{ onNavigate: (page: string) => void }> = ({ onNavigate }) => {

  // --- STATO GLOBALE ---
  const [activeView, setActiveView] = useState<DashboardView>('kitchen');
  
  // ✅ FIX CRITICO: Aggiunto [0] alla fine per prendere solo la data (Stringa)
  // Prima: .split('T') restituiva un Array -> Crash nell'input type="date"
  const [globalDate, setGlobalDate] = useState(new Date().toISOString().split('T')[0]);
  
  const [globalSession, setGlobalSession] = useState<SessionType>('morning_class');
  
  const [loading, setLoading] = useState(false);
  const [bookings, setBookings] = useState<any[]>([]);

  // --- FETCH DATI ---
  const fetchTableData = async () => {
    // Se siamo nel calendario, non serve caricare la tabella cucina
    if (activeView !== 'kitchen') return;

    setLoading(true);
    try {
      let query = supabase
        .from('bookings')
        .select(`
          internal_id, pax_count, status, session_id, pickup_time,
          profiles:user_id(full_name, dietary_profile, allergies)
        `)
        .eq('booking_date', globalDate)
        .neq('status', 'cancelled')
        .order('pickup_time', { ascending: true });

      if (globalSession !== 'all') {
        query = query.eq('session_id', globalSession);
      }

      const { data } = await query;
      setBookings(data || []);
    } catch (e) {
      console.error("Errore fetch cucina:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTableData();
  }, [globalDate, globalSession, activeView]);

  // --- RENDER CONTENT ---
  const renderContent = () => {
    switch (activeView) {
      
      case 'reports':
        return (
          <div className="flex flex-col items-center justify-center h-full border-2 border-dashed border-border dark:border-white/10 rounded-[2.5rem] bg-surface/50 dark:bg-white/5 animate-pulse">
            <div className="size-20 rounded-full bg-white/5 flex items-center justify-center mb-6">
                <Icon name="bar_chart" size="xl" className="text-desc/20"/>
            </div>
            <Typography variant="h5" className="text-desc/40">Financial Reports Coming Soon</Typography>
            <Typography variant="caption" className="text-desc/20 mt-2">Module v2.0 in development</Typography>
          </div>
        );

      case 'kitchen':
      default:
        return (
          <Card variant="glass" padding="none" className="h-full flex flex-col border-border dark:border-white/10 bg-surface dark:bg-[#1a1a1a]/80 shadow-2xl overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
            
            {/* Table Header Stats */}
            <div className="p-5 border-b border-border dark:border-white/5 bg-black/5 dark:bg-white/5 flex justify-between items-center shrink-0">
                <div className="flex items-center gap-3">
                    <div className="size-2 rounded-full bg-action animate-pulse"/>
                    <span className="text-[10px] font-black uppercase tracking-widest text-desc/60">
                        Live Prep List
                    </span>
                </div>
                
                <div className="flex gap-2">
                    <Badge variant="mineral" className="bg-white/10 border-white/20 text-desc">
                        {bookings.length} Stations
                    </Badge>
                    <Badge variant="mineral" className="bg-orange-500/10 text-orange-400 border-orange-500/20">
                        {bookings.filter(b => b.profiles?.dietary_profile !== 'diet_regular').length} Specials
                    </Badge>
                </div>
            </div>

            <div className="flex-1 overflow-hidden">
               {/* ✅ FIX: Rimosso isLoading={loading} se la tua Table non lo supporta.
                  Gestiamo il loading esternamente per sicurezza.
               */}
               {loading ? (
                  <div className="p-8 text-center text-desc opacity-50">Loading Prep List...</div>
               ) : (
                  <Table 
                    data={bookings} 
                    columns={KITCHEN_COLS} 
                    keyField="internal_id"
                    emptyMessage="No cooks found for this session."
                    className="border-none h-full bg-transparent"
                  />
               )}
            </div>
          </Card>
        );
    }
  };

  return (
    <AdminPageLayout loading={false} className="p-0 lg:p-6">
      
      <div className="flex flex-col h-[calc(100vh-140px)] gap-6 animate-in fade-in duration-700 w-full lg:w-[90%] mx-auto">

        {/* HEADER */}
        <div className="flex flex-col gap-4 pb-6 border-b border-border dark:border-white/10 shrink-0">
             <div className="flex items-center justify-between">
                 <div>
                     <Typography variant="h5" className="text-desc uppercase tracking-widest text-xs font-bold opacity-60">Operations</Typography>
                     <Typography variant="h3" className="text-title font-black uppercase tracking-tight">Kitchen Console</Typography>
                 </div>
             </div>

             <div className="flex flex-col xl:flex-row items-center justify-between gap-6">
                <Tabs 
                    items={NAV_TABS} 
                    value={activeView} 
                    onChange={(v) => setActiveView(v as DashboardView)} 
                    className="scale-105"
                />

                {/* Questo DatePicker ora riceve una STRINGA corretta */}
                <ClassPicker 
                    date={globalDate} 
                    onDateChange={setGlobalDate}
                    session={globalSession}
                    onSessionChange={setGlobalSession}
                    className="shadow-xl"
                />
             </div>
        </div>

        {/* CONTENT */}
        <div className="flex-1 min-h-0 relative">
            {renderContent()}
        </div>

      </div>
    </AdminPageLayout>
  );
};

export default AdminKitchenDashboard;