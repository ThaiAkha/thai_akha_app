import React, { useState, useEffect, useMemo } from 'react';
import { supabase } from '../../lib/supabase';
import { Typography, Icon, Button, Modal, Toggle, Input, Badge } from '../ui/index';
import { cn } from '../../lib/utils';

// --- TIPI ---
interface DayOverride {
  date: string;
  session_id: 'morning_class' | 'evening_class';
  is_closed: boolean;
  custom_capacity?: number;
  closure_reason?: string;
}

interface SessionStats {
  booked: number;
  capacity: number;
  status: 'OPEN' | 'FULL' | 'CLOSED';
  // ✅ FIX TS: Assicurati che questa proprietà sia definita nell'interfaccia
  isLocked: boolean; 
  override?: DayOverride;
}

interface DayData {
  morning: SessionStats;
  evening: SessionStats;
}

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const DAYS_HEADER = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

// Helper Date Sicuro (Evita crash .split)
const toLocalISO = (d: Date) => {
    const offset = d.getTimezoneOffset() * 60000;
    return new Date(d.getTime() - offset).toISOString().split('T')[0]; // ✅ FIX: Aggiunto [0] per ritornare stringa
};

export const AdminCalendarManager: React.FC = () => {
  const [viewDate, setViewDate] = useState(new Date());
  const [calendarData, setCalendarData] = useState<Record<string, DayData>>({});
  const [loading, setLoading] = useState(false);
  const [baseCaps, setBaseCaps] = useState<Record<string, number>>({ morning_class: 12, evening_class: 12 });

  // Modale
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [editSession, setEditSession] = useState<'morning_class' | 'evening_class'>('morning_class');
  const [isClosed, setIsClosed] = useState(false);
  const [reason, setReason] = useState('');
  const [capacity, setCapacity] = useState<number>(12);

  // --- LOGICA TIME-LOCKING 🔒 ---
  const checkLock = (dateStr: string, session: 'morning_class' | 'evening_class'): boolean => {
    const todayStr = toLocalISO(new Date());
    
    // 1. Passato: Sempre bloccato
    // ✅ FIX TS: Il confronto stringhe ISO è sicuro in JS, TS non dovrebbe lamentarsi se sono stringhe
    if (dateStr < todayStr) return true;
    
    // 2. Futuro: Sempre aperto
    if (dateStr > todayStr) return false;

    // 3. Oggi: Controllo Orario
    const nowHour = new Date().getHours();
    
    if (session === 'morning_class') return nowHour >= 10; // Blocca dopo le 10:00 AM
    if (session === 'evening_class') return nowHour >= 17; // Blocca dopo le 17:00 PM (5 PM)
    
    return false;
  };

  // --- FETCH DATI ---
  const fetchCalendarData = async () => {
    setLoading(true);
    const year = viewDate.getFullYear();
    const month = viewDate.getMonth();
    
    const startStr = toLocalISO(new Date(year, month, 1));
    const endStr = toLocalISO(new Date(year, month + 1, 0));

    try {
        // A. Capacità
        const { data: sessions } = await supabase.from('class_sessions').select('id, max_capacity');
        const caps: Record<string, number> = {};
        if (sessions) {
            sessions.forEach((s: any) => caps[s.id] = s.max_capacity);
        }
        setBaseCaps(caps);

        // B. Dati
        const [overridesRes, bookingsRes] = await Promise.all([
            supabase.from('class_calendar_overrides').select('*').gte('date', startStr).lte('date', endStr),
            supabase.from('bookings').select('booking_date, session_id, pax_count').gte('booking_date', startStr).lte('booking_date', endStr).neq('status', 'cancelled')
        ]);

        const overrides = overridesRes.data || [];
        const bookings = bookingsRes.data || [];
        const statsMap: Record<string, DayData> = {};
        const daysInMonth = new Date(year, month + 1, 0).getDate();

        for (let i = 1; i <= daysInMonth; i++) {
            const d = new Date(year, month, i);
            const dateStr = toLocalISO(d);

            const getSessionStats = (sessId: 'morning_class' | 'evening_class'): SessionStats => {
                const ovr = overrides.find((o: any) => o.date === dateStr && o.session_id === sessId);
                const booked = bookings
                    .filter((b: any) => b.booking_date === dateStr && b.session_id === sessId)
                    .reduce((sum, b) => sum + (b.pax_count || 0), 0);
                
                const cap = ovr?.custom_capacity ?? caps[sessId] ?? 12;
                const isClosedSession = ovr?.is_closed; // Rinominato per evitare conflitto con stato locale

                return {
                    booked,
                    capacity: cap,
                    status: isClosedSession ? 'CLOSED' : (booked >= cap ? 'FULL' : 'OPEN'),
                    isLocked: checkLock(dateStr, sessId), // ✅ FIX TS: Proprietà ora riconosciuta dall'interfaccia
                    override: ovr,
                };
            };

            // ✅ FIX TS: Assegnazione sicura con chiave stringa
            statsMap[dateStr] = {
                morning: getSessionStats('morning_class'),
                evening: getSessionStats('evening_class')
            };
        }
        setCalendarData(statsMap);

    } catch (e) { console.error(e); } 
    finally { setLoading(false); }
  };

  useEffect(() => { fetchCalendarData(); }, [viewDate]);

  // Sync Form con Selezione
  useEffect(() => {
    if (selectedDate && calendarData[selectedDate]) {
        const stats = editSession === 'morning_class' ? calendarData[selectedDate].morning : calendarData[selectedDate].evening;
        setIsClosed(stats.status === 'CLOSED');
        setReason(stats.override?.closure_reason || '');
        setCapacity(stats.capacity);
    }
  }, [selectedDate, editSession]);

  // --- ACTIONS ---
  const handleSaveOverride = async () => {
    if (!selectedDate) return;
    const payload = {
      date: selectedDate,
      session_id: editSession,
      is_closed: isClosed,
      closure_reason: isClosed ? reason : null,
      custom_capacity: isClosed ? null : capacity
    };
    await supabase.from('class_calendar_overrides').upsert(payload, { onConflict: 'date,session_id' });
    await fetchCalendarData();
    setSelectedDate(null);
  };

  const handleQuickClose = async (e: React.MouseEvent, dateStr: string) => {
    e.stopPropagation();
    if (!window.confirm(`Are you sure you want to CLOSE ALL sessions for ${dateStr}?`)) return;

    const payloads = [
        { date: dateStr, session_id: 'morning_class', is_closed: true, closure_reason: 'Quick Close' },
        { date: dateStr, session_id: 'evening_class', is_closed: true, closure_reason: 'Quick Close' }
    ];
    await supabase.from('class_calendar_overrides').upsert(payloads, { onConflict: 'date,session_id' });
    await fetchCalendarData();
  };

  // --- GRID ---
  const calendarDays = useMemo(() => {
    const year = viewDate.getFullYear();
    const month = viewDate.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const days: (string | null)[] = []; // ✅ FIX TS: Tipizzazione esplicita dell'array
    
    for (let i = 0; i < firstDay; i++) days.push(null);
    
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    for (let i = 1; i <= daysInMonth; i++) {
        days.push(toLocalISO(new Date(year, month, i)));
    }
    return days;
  }, [viewDate]);

  // COMPONENTE PILLOLA
  const SessionPill = ({ label, stats }: { label: string, stats: SessionStats }) => {
    const colorClass = stats.status === 'CLOSED' 
        ? "bg-red-500/10 text-red-500 border-red-500/20"
        : stats.booked > 0 
            ? "bg-action/10 text-action border-action/20"
            : "bg-primary/10 text-primary border-primary/20";

    return (
        <div className={cn("flex items-center justify-between px-1.5 py-0.5 rounded border text-[9px] w-full mb-1 h-5", colorClass, stats.isLocked && "opacity-50 grayscale")}>
            <div className="flex items-center gap-1">
                <Icon name={stats.isLocked ? "lock" : (label === 'AM' ? "wb_sunny" : "dark_mode")} size="xs" className="text-[9px]" />
                <span className="font-black">{label}</span>
            </div>
            <span className="font-mono font-bold">
                {stats.status === 'CLOSED' ? 'CLOSED' : `${stats.capacity - stats.booked} Free`}
            </span>
        </div>
    );
  };

  return (
    <div className="flex flex-col h-full bg-[#1a1a1a] rounded-[2.5rem] border border-white/10 overflow-hidden shadow-2xl">
      
      {/* HEADER */}
      <div className="flex items-center justify-between p-6 border-b border-white/10 bg-white/5">
        <Typography variant="h4" className="text-white uppercase font-black italic">
            {MONTHS[viewDate.getMonth()]} <span className="text-action">{viewDate.getFullYear()}</span>
        </Typography>
        <div className="flex gap-2">
            <button onClick={() => setViewDate(new Date(viewDate.setMonth(viewDate.getMonth() - 1)))} className="p-2 bg-white/5 rounded-xl hover:bg-white/10 text-white"><Icon name="chevron_left"/></button>
            <button onClick={() => setViewDate(new Date(viewDate.setMonth(viewDate.getMonth() + 1)))} className="p-2 bg-white/5 rounded-xl hover:bg-white/10 text-white"><Icon name="chevron_right"/></button>
        </div>
      </div>

      {/* GRID */}
      <div className="grid grid-cols-7 gap-px bg-white/5 flex-1 overflow-y-auto p-1">
        {DAYS_HEADER.map(d => (
            <div key={d} className="text-center py-2 text-[10px] uppercase font-black text-white/30">{d}</div>
        ))}
        
        {calendarDays.map((dateStr, i) => {
            // ✅ FIX TS: Controllo nullità prima di usare dateStr
            if (!dateStr) return <div key={`empty-${i}`} className="bg-[#121212]/50 min-h-[100px]"/>;
            
            const stats = calendarData[dateStr] || { 
                morning: { status:'OPEN', booked:0, capacity:12, isLocked:false }, 
                evening: { status:'OPEN', booked:0, capacity:12, isLocked:false } 
            };
            
            const isToday = dateStr === toLocalISO(new Date());
            const canQuickClose = stats.morning.booked === 0 && stats.evening.booked === 0 && !stats.morning.isLocked && !stats.evening.isLocked;

            return (
                <div 
                    key={dateStr} 
                    onClick={() => setSelectedDate(dateStr)}
                    className={cn(
                        "relative bg-[#1a1a1a] p-2 min-h-[120px] cursor-pointer group border border-transparent rounded-xl transition-all flex flex-col",
                        isToday ? "bg-white/5 border-action/30" : "hover:bg-white/5 hover:border-white/10"
                    )}
                >
                    <div className="flex justify-between items-start mb-2">
                        <span className={cn("font-display font-black text-lg", isToday ? "text-action" : "text-white/60")}>{dateStr.split('-')[1]}</span>
                        
                        {/* QUICK CLOSE BUTTON */}
                        {canQuickClose && (
                            <button 
                                onClick={(e) => handleQuickClose(e, dateStr)}
                                className="opacity-0 group-hover:opacity-100 hover:text-red-500 text-white/20 transition-all p-1"
                                title="Quick Close Day"
                            >
                                <Icon name="close" size="xs"/>
                            </button>
                        )}
                    </div>

                    <div className="mt-auto w-full">
                        <SessionPill label="AM" stats={stats.morning} />
                        <SessionPill label="PM" stats={stats.evening} />
                    </div>
                </div>
            );
        })}
      </div>

      {/* MODALE GESTIONE */}
      <Modal isOpen={!!selectedDate} onClose={() => setSelectedDate(null)} title="Manage Availability">
        <div className="space-y-6">
            <div className="bg-white/5 p-4 rounded-xl text-center border border-white/10">
                <Typography variant="h5" className="text-white">{selectedDate}</Typography>
                
                {selectedDate && calendarData[selectedDate] && (
                    <div className="flex justify-center gap-2 mt-2">
                        {calendarData[selectedDate].morning.isLocked && <Badge variant="mineral" className="bg-red-500/10 text-red-500 border-red-500/20 text-[9px]">AM LOCKED</Badge>}
                        {calendarData[selectedDate].evening.isLocked && <Badge variant="mineral" className="bg-red-500/10 text-red-500 border-red-500/20 text-[9px]">PM LOCKED</Badge>}
                    </div>
                )}
            </div>

            <div className="flex bg-black/40 p-1 rounded-xl border border-white/10">
                {['morning_class', 'evening_class'].map(s => {
                    const isSessLocked = selectedDate && calendarData[selectedDate] 
                        ? (s === 'morning_class' ? calendarData[selectedDate].morning.isLocked : calendarData[selectedDate].evening.isLocked)
                        : false;

                    return (
                        <button 
                            key={s} 
                            onClick={() => !isSessLocked && setEditSession(s as any)}
                            disabled={isSessLocked}
                            className={cn(
                                "flex-1 py-3 rounded-lg text-xs font-bold uppercase transition-all flex items-center justify-center gap-2",
                                editSession === s ? "bg-white text-black" : "text-white/40 hover:text-white",
                                isSessLocked && "opacity-30 cursor-not-allowed"
                            )}
                        >
                            {isSessLocked && <Icon name="lock" size="xs"/>}
                            {s === 'morning_class' ? 'Morning' : 'Evening'}
                        </button>
                    )
                })}
            </div>

            <div className="space-y-4 p-4 border border-white/10 rounded-2xl bg-white/5">
                <div className="flex justify-between items-center">
                    <span className="text-sm font-bold text-white">Close Session?</span>
                    <Toggle checked={isClosed} onChange={setIsClosed} />
                </div>

                {isClosed ? (
                    <Input label="Closure Reason" placeholder="e.g. Maintenance..." value={reason} onChange={(e) => setReason(e.target.value)} />
                ) : (
                    <div className="space-y-2">
                        <span className="text-xs font-bold text-white/60 uppercase">Custom Capacity</span>
                        <div className="flex items-center gap-4">
                            <button onClick={() => setCapacity(Math.max(0, capacity - 1))} className="size-10 rounded-xl bg-white/10 hover:bg-white/20 text-white"><Icon name="remove"/></button>
                            <span className="text-2xl font-black text-white w-12 text-center">{capacity}</span>
                            <button onClick={() => setCapacity(capacity + 1)} className="size-10 rounded-xl bg-white/10 hover:bg-white/20 text-white"><Icon name="add"/></button>
                        </div>
                    </div>
                )}
            </div>

            <Button variant="action" fullWidth size="lg" onClick={handleSaveOverride}>Save Changes</Button>
        </div>
      </Modal>

    </div>
  );
};