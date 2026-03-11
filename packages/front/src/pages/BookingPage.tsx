import React, { useState, useEffect, useMemo } from 'react';
import { supabase } from '../lib/supabase';
import { PageLayout } from '../components/layout/PageLayout';
import HeaderMenu from '../components/layout/HeaderMenu';
import { Typography, Button, Card, Input, Textarea, Icon, Modal, Badge } from '../components/ui/index';
import { authService, UserProfile } from '../services/authService';
import { contentService } from '../services/contentService';
import { cn } from '../lib/utils';
import { CalendarView } from '../components/booking/CalendarView';

// --- CONFIGURAZIONE PAESI ---
const COUNTRY_PREFIXES = [
  { code: '+66', label: '🇹🇭 TH (+66)' }, { code: '+1', label: '🇺🇸 US (+1)' },
  { code: '+44', label: '🇬🇧 UK (+44)' }, { code: '+33', label: '🇫🇷 FR (+33)' },
  { code: '+39', label: '🇮🇹 IT (+39)' }, { code: '+49', label: '🇩🇪 DE (+49)' },
  { code: '+86', label: '🇨🇳 CN (+86)' }, { code: '+61', label: '🇦🇺 AU (+61)' },
  { code: '+65', label: '🇸🇬 SG (+65)' },
];

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const MONTHS_SHORT = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];

interface SessionInfo {
  id: string;
  label: string;
  shortLabel: string;
  basePrice: number;
  icon: string;
  color: string;
  pickupTime: string;
  classTime: string;
  marketTour: boolean;
}

interface SessionStatus {
  status: 'OPEN' | 'FULL' | 'CLOSED';
  remaining: number;
  reason?: string;
}

interface DailyAvailability {
  morning_class: SessionStatus;
  evening_class: SessionStatus;
}

interface BookingPageProps {
  onNavigate: (page: string, topic?: string, sectionId?: string) => void;
  userProfile: UserProfile | null;
  onAuthSuccess: () => void;
}

const BookingPage: React.FC<BookingPageProps> = ({ onNavigate, userProfile, onAuthSuccess }) => {
  const isAgency = userProfile?.role === 'agency';
  const commissionRate = isAgency ? (userProfile?.agency_commission_rate || 0) : 0;

  // --- STATE: DATA & CONFIG ---
  const [sessionConfig, setSessionConfig] = useState<Record<string, SessionInfo>>({});
  const [loadingConfig, setLoadingConfig] = useState(true);

  // --- STATE: FLOW ---
  const [viewStep, setViewStep] = useState<'selection' | 'auth' | 'form'>('selection');
  const [authMode, setAuthMode] = useState<'guest' | 'login'>('guest');
  const [showCalendarModal, setShowCalendarModal] = useState(false);

  // --- STATE: SELECTION ---
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [session, setSession] = useState<'morning_class' | 'evening_class' | null>(null);
  const [pax, setPax] = useState<number>(0);
  const [loadingAvailability, setLoadingAvailability] = useState(false);

  // Availability State
  const [dailyStats, setDailyStats] = useState<DailyAvailability>({
    morning_class: { status: 'OPEN', remaining: 0 },
    evening_class: { status: 'OPEN', remaining: 0 }
  });

  // Payment & Form State
  const [paymentMethod, setPaymentMethod] = useState<'arrival' | 'card' | 'agency'>('arrival');
  const [formData, setFormData] = useState({
    fullName: userProfile?.full_name || '',
    email: userProfile?.email || '',
    password: '',
    phonePrefix: '+66',
    phoneNumber: '',
    customerNote: '',
    agencyNote: ''
  });

  // --- 1. INIT: FETCH CONFIGURAZIONE CLASSI (Dinamica dal DB) ---
  useEffect(() => {
    const initConfig = async () => {
      try {
        const classesDB = await contentService.getCookingClasses();
        const config: Record<string, SessionInfo> = {};

        classesDB.forEach((c: any) => {
          const isMorning = c.id.includes('morning');
          config[c.id] = {
            id: c.id,
            label: c.title,
            shortLabel: isMorning ? "Morning Session" : "Evening Session",
            basePrice: c.price,
            icon: isMorning ? "wb_sunny" : "dark_mode",
            color: isMorning ? "text-primary" : "text-secondary",
            pickupTime: isMorning ? "08:30 - 09:00" : "16:30 - 17:00", 
            classTime: isMorning ? "09:00 - 14:30" : "17:00 - 21:00",
            marketTour: c.has_market_tour
          };
        });
        
        setSessionConfig(config);
      } catch (e) {
        console.error("Config Load Error", e);
      } finally {
        setLoadingConfig(false);
      }
    };
    initConfig();
  }, []);

  // --- SYNC PROFILE ---
  useEffect(() => {
    if (userProfile) {
      setFormData(prev => ({ ...prev, fullName: userProfile.full_name, email: userProfile.email }));
      if (viewStep === 'auth') setViewStep('form');
    }
    if (isAgency) setPaymentMethod('agency');
  }, [userProfile, isAgency, viewStep]);

  // --- COMPUTED PRICES ---
  const currentBasePrice = session && sessionConfig[session] ? sessionConfig[session].basePrice : 0;
  const totalGross = currentBasePrice * pax;
  const discountAmount = Math.round((totalGross * commissionRate) / 100);
  const finalPrice = totalGross - discountAmount;

  // DATA SCROLLER
  const dateOptions = useMemo(() => {
    const dates = [];
    const baseDate = new Date(selectedDate);
    baseDate.setHours(12,0,0,0);
    for (let i = -2; i <= 2; i++) {
      const d = new Date(baseDate);
      d.setDate(baseDate.getDate() + i);
      dates.push(d);
    }
    return dates;
  }, [selectedDate]);

  // --- ENGINE DISPONIBILITÀ (Realtime) ---
  useEffect(() => {
    const fetchDailyStats = async () => {
      setLoadingAvailability(true);
      const offset = selectedDate.getTimezoneOffset() * 60000;
      const localDate = new Date(selectedDate.getTime() - offset);
      const dateStr = localDate.toISOString().split('T');

      try {
        const { data: sessionsData } = await supabase.from('class_sessions').select('id, max_capacity');
        const baseCaps: Record<string, number> = {};
        sessionsData?.forEach((s: any) => baseCaps[s.id] = s.max_capacity);

        const { data: overrides } = await supabase.from('class_calendar_overrides').select('*').eq('date', dateStr);
        const { data: bookings } = await supabase.from('bookings').select('session_id, pax_count').eq('booking_date', dateStr).neq('status', 'cancelled');

        const calculateStatus = (sessionId: string): SessionStatus => {
          const override = overrides?.find((o: any) => o.session_id === sessionId);
          
          if (override?.is_closed) return { status: 'CLOSED', remaining: 0, reason: override.closure_reason || 'Closed' };

          const max = override?.custom_capacity ?? baseCaps[sessionId] ?? 12;
          const occupied = bookings?.filter((b: any) => b.session_id === sessionId).reduce((sum: number, b: any) => sum + b.pax_count, 0) || 0;
          
          const remaining = Math.max(0, max - occupied);
          return { status: remaining > 0 ? 'OPEN' : 'FULL', remaining, reason: remaining === 0 ? 'Fully Booked' : undefined };
        };

        setDailyStats({
          morning_class: calculateStatus('morning_class'),
          evening_class: calculateStatus('evening_class')
        });

      } catch (err) { 
        console.error("Availability Fetch Error:", err); 
      } finally {
        setLoadingAvailability(false);
      }
    };

    if (Object.keys(sessionConfig).length > 0) fetchDailyStats();
  }, [selectedDate, sessionConfig]);

  // --- HANDLERS ---

  const isPaxSelected = pax > 0;
  const maxSelectable = session ? dailyStats[session].remaining : 12;

  const handleSessionSelect = (s: 'morning_class' | 'evening_class') => {
    if (!isPaxSelected) { alert("Please add at least 1 participant first kha!"); return; }
    
    const stats = dailyStats[s];
    if (stats.status !== 'OPEN' || stats.remaining < pax) {
      alert(`Sorry, this class is ${stats.status === 'FULL' ? 'full' : 'closed'} or has only ${stats.remaining} seats.`);
      return;
    }
    setSession(s);
  };

  const handleConfirmSelection = () => {
    if (!session || !isPaxSelected) return;
    const currentStats = dailyStats[session];
    
    if (currentStats.status !== 'OPEN' || currentStats.remaining < pax) {
      alert(`Sorry, availability changed. Only ${currentStats.remaining} seats left.`);
      return;
    }

    if (userProfile) setViewStep('form');
    else setViewStep('auth');
    
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmit = async () => {
    if (!session) return;
    setLoadingConfig(true); 

    try {
      let userId = userProfile?.id;

      if (!userId) {
        let authResponse;
        if (authMode === 'login') authResponse = await authService.signIn(formData.email, formData.password);
        else authResponse = await authService.signUp(formData.email, formData.password, formData.fullName);
        
        if (!authResponse?.user) throw new Error("Authentication failed.");
        userId = authResponse.user.id;
        onAuthSuccess();
      }

      const finalCustomerNote = isAgency ? `AGENCY GUEST: ${formData.customerNote}` : formData.customerNote;
      
      const offset = selectedDate.getTimezoneOffset() * 60000;
      const localDate = new Date(selectedDate.getTime() - offset);
      const dateStr = localDate.toISOString().split('T');

      // 🟢 AUTO-ASSIGN DRIVER LOGIC
      // Cerchiamo il "Priority Driver" (il primo della lista o uno specifico se necessario)
      let assignedDriverId = null;
      try {
        const { data: drivers } = await supabase
          .from('profiles')
          .select('id')
          .eq('role', 'driver')
          .limit(1); // Prende il primo disponibile
        
        if (drivers && drivers.length > 0) {
          assignedDriverId = drivers.id;
        }
      } catch (dErr) {
        console.warn("Auto-assign driver failed:", dErr);
      }

      const payload = {
        user_id: userId,
        session_id: session,
        booking_date: dateStr,
        pax_count: pax,
        total_price: finalPrice,
        applied_commission_rate: commissionRate,
        payment_method: isAgency ? 'agency_invoice' : (paymentMethod === 'card' ? 'credit_card' : 'pay_on_arrival'),
        payment_status: isAgency ? 'pending_invoice' : 'pending',
        status: 'confirmed',
        phone_prefix: formData.phonePrefix,
        phone_number: formData.phoneNumber,
        customer_note: finalCustomerNote,
        agency_note: isAgency ? formData.agencyNote : '',
        hotel_name: 'To be selected',
        pickup_zone: 'walk-in',
        // Assegnazione automatica del driver
        pickup_driver_uid: assignedDriverId 
      };

      const { data, error } = await supabase.from('bookings').insert(payload).select('internal_id').single();
      if (error) throw error;

      if (data) localStorage.setItem('last_edited_booking', data.internal_id);

      if (isAgency) onNavigate('agency-portal');
      else onNavigate('user');

    } catch (err: any) {
      alert("Booking Error: " + (err.message || "Unknown error"));
    } finally {
      setLoadingConfig(false);
    }
  };

  const formattedDateStr = `${DAYS[selectedDate.getDay()]}, ${selectedDate.getDate()} ${MONTHS[selectedDate.getMonth()]}`;
  const shortDateStr = `${selectedDate.getDate()} ${MONTHS_SHORT[selectedDate.getMonth()]}`;

  const StepTitle = ({ number, title }: { number: string, title: string }) => (
    <div className="flex items-baseline gap-3 mb-6 px-2">
      <span className="text-xl font-mono font-bold text-desc/30 leading-none">{number}.</span>
      <span className="text-xl font-mono font-bold text-desc/50 leading-none uppercase">{title}</span>
    </div>
  );

  return (
    <PageLayout slug="booking" loading={loadingConfig} showPatterns={true} hideDefaultHeader={true} customHeader={<HeaderMenu customSlug="booking" />}>
      
      <div className="w-full max-w-4xl mx-auto flex flex-col gap-16 md:gap-24 pb-32">

        {/* ================= STEP 1: SELECTION ================= */}
        {viewStep === 'selection' && (
          <div className="space-y-16 animate-in fade-in slide-in-from-bottom-8">
            
            {/* BLOCCO 1: DATA */}
            <section>
              <StepTitle number="01" title="Select Date" />
              
              <div className="flex items-center gap-3 bg-surface border border-border p-2 rounded-2xl shadow-sm mb-8 transition-colors">
                <div className="relative flex-1">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-action pointer-events-none"><Icon name="event" size="lg" /></div>
                  <button onClick={() => setShowCalendarModal(true)} className="w-full bg-transparent text-title font-bold text-lg py-4 pl-12 pr-4 text-left hover:bg-black/5 dark:hover:bg-white/5 rounded-xl transition-colors">
                    {formattedDateStr} <span className="text-desc/40 text-base ml-2">(Tap to change)</span>
                  </button>
                </div>
                <Button variant="mineral" size="lg" onClick={() => setShowCalendarModal(true)} className="shrink-0 h-12 px-6">Month View</Button>
              </div>

              <div className="flex items-center justify-between gap-4 overflow-x-auto no-scrollbar py-2 px-2">
                {dateOptions.map((d, i) => {
                  const isSelected = d.getDate() === selectedDate.getDate();
                  const isToday = d.toDateString() === new Date().toDateString();
                  return (
                    <button
                      key={i}
                      onClick={() => { setSelectedDate(d); setSession(null); }}
                      className={cn(
                        "flex-1 min-w-[85px] h-[110px] flex flex-col items-center justify-center gap-1 rounded-3xl border transition-all duration-300",
                        isSelected 
                          ? "bg-action/10 border-action text-action shadow-[0_0_25px_-5px_rgba(152,201,60,0.4)] scale-110 z-10 font-bold" 
                          : "bg-surface border-border text-desc hover:border-action/30 hover:bg-surface/80"
                      )}
                    >
                      <span className={cn("text-xs font-black uppercase tracking-widest leading-none mb-1", isSelected ? "text-action" : "text-desc/40")}>
                        {DAYS[d.getDay()]}
                      </span>
                      <span className={cn("text-4xl font-mono font-black leading-none my-0.5", isSelected ? "text-action" : "text-title")}>
                        {d.getDate()}
                      </span>
                      <span className="text-[10px] font-black uppercase tracking-widest opacity-40 mt-1">
                        {MONTHS_SHORT[d.getMonth()]}
                      </span>
                      {isToday && (<span className="text-[9px] font-bold text-primary mt-1">TODAY</span>)}
                    </button>
                  );
                })}
              </div>
            </section>

            {/* BLOCCO 2: PARTECIPANTI */}
            <section>
              <StepTitle number="02" title="Add Participants" />
              <div className="flex justify-center w-full py-3">
                <div className={cn("flex items-center gap-6 backdrop-blur-md border px-8 py-3 rounded-full transition-all duration-500", isPaxSelected ? "bg-action/10 border-action shadow-[0_0_20px_-5px_rgba(152,201,60,0.3)] scale-105" : "bg-surface border-border opacity-80 shadow-sm")}>
                  <div className="flex items-center gap-2 border-r border-border pr-6">
                    <Icon name="groups" size="lg" className={isPaxSelected ? "text-action" : "text-desc/40"} />
                    <span className={cn("text-lg font-black uppercase tracking-widest", isPaxSelected ? "text-action" : "text-desc/40")}>People</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <button onClick={() => { setPax(Math.max(0, pax - 1)); setSession(null); }} disabled={pax === 0} className="size-12 rounded-full bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/20 flex items-center justify-center text-title transition-colors disabled:opacity-30 disabled:cursor-not-allowed"><Icon name="remove" size="lg" /></button>
                    <span className={cn("font-display font-black text-2xl min-w-[1.5rem] text-center", pax === 0 ? "text-desc/30" : "text-title")}>{pax}</span>
                    <button onClick={() => setPax(Math.min(maxSelectable > 0 ? maxSelectable : 99, pax + 1))} disabled={maxSelectable > 0 && pax >= maxSelectable} className={cn("size-12 rounded-full flex items-center justify-center transition-colors", (maxSelectable > 0 && pax >= maxSelectable) ? "bg-black/5 dark:bg-white/5 text-desc/20" : "bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/20 text-title")}><Icon name="add" size="lg" /></button>
                  </div>
                </div>
              </div>
            </section>

            {/* BLOCCO 3: CLASSE */}
            <section>
              <StepTitle number="03" title="Select Class" />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {['morning_class', 'evening_class'].map((s) => {
                  const sessionType = s as 'morning_class' | 'evening_class';
                  const info = sessionConfig[sessionType];
                  
                  if (!info) return <div key={s} className="h-64 bg-white/5 animate-pulse rounded-3xl" />;

                  const stats = dailyStats[sessionType];
                  const isFull = stats.status !== 'OPEN';
                  const notEnoughSeats = stats.remaining < pax;
                  const disabled = !isPaxSelected || isFull || notEnoughSeats;
                  const active = session === sessionType;
                  
                  const displayPrice = isAgency ? Math.round(info.basePrice * (1 - commissionRate/100)) : info.basePrice;

                  return (
                    <div
                      key={s}
                      onClick={() => !disabled && handleSessionSelect(sessionType)}
                      className={cn(
                        "group relative p-8 rounded-[2.5rem] cursor-pointer transition-all duration-300 border-2 flex flex-col min-h-[340px]",
                        disabled 
                          ? "opacity-50 grayscale cursor-not-allowed border-border bg-black/5 dark:bg-white/5" 
                          : active 
                            ? "bg-action/5 border-action shadow-[0_0_40px_-10px_rgba(152,201,60,0.3)] scale-[1.02] z-10" 
                            : "bg-surface border-border hover:border-action/30 hover:shadow-xl hover:-translate-y-1"
                      )}
                    >
                      <div className="flex justify-between items-start mb-6">
                        <div>
                          <Typography variant="h3" className="text-title text-2xl italic uppercase leading-none mb-2 tracking-tighter">
                            {sessionType === 'morning_class' ? 'Morning' : 'Evening'}<br/>
                            <span className={info.color}>Cooking Class</span>
                          </Typography>
                        </div>
                        <div className={cn("transition-colors duration-300", active ? "text-action" : info.color)}>
                          <Icon name={info.icon} className="text-6xl md:text-7xl opacity-90" />
                        </div>
                      </div>

                      <div className="space-y-3 mb-8 flex-grow">
                        <div className="flex items-center gap-3 text-sm text-desc">
                          <Icon name="local_taxi" size="xs" className="opacity-50"/>
                          <span>Pickup: <strong className="text-title">{info.pickupTime}</strong></span>
                        </div>
                        <div className="flex items-center gap-3 text-sm text-desc">
                          <Icon name="schedule" size="xs" className="opacity-50"/>
                          <span>Class: <strong className="text-title">{info.classTime}</strong></span>
                        </div>
                        <div className="flex items-center gap-3 text-sm">
                          <Icon name="storefront" size="xs" className={info.marketTour ? "text-action" : "text-desc/20"}/>
                          <span className={info.marketTour ? "text-action font-bold" : "text-desc/40 decoration-line-through"}>
                            {info.marketTour ? "Market Tour Included" : "No Market Tour"}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 text-sm text-desc">
                          <Icon name="restaurant_menu" size="xs" className="text-primary"/>
                          <span>Learn <strong>11 Dishes</strong></span>
                        </div>
                      </div>

                      <div className="pt-6 border-t border-border flex justify-between items-end">
                        <div className="flex flex-col">
                          <span className={cn("font-mono font-black text-3xl", active ? "text-action" : "text-title")}>
                            {displayPrice.toLocaleString()} <span className="text-sm font-sans text-desc/60">THB</span>
                          </span>
                          {isAgency && <span className="text-[10px] font-bold text-green-500 uppercase tracking-wider">Partner Rate</span>}
                        </div>
                        
                        {!isPaxSelected 
                          ? <div className="text-xs uppercase font-bold text-desc/30 tracking-widest">Add Pax First</div>
                          : (isFull || notEnoughSeats)
                            ? <Badge variant="mineral" className="bg-red-500/10 text-red-500 border-red-500/30">FULL</Badge>
                            : <div className="bg-black/5 dark:bg-white/10 px-4 py-2 rounded-xl text-xs font-bold text-title uppercase tracking-widest">{stats.remaining} Seats Left</div>
                        }
                      </div>
                    </div>
                  )
                })}
              </div>
            </section>

            {/* BLOCCO 4: CONFERMA */}
            {session && isPaxSelected && sessionConfig[session] && (
              <section className="animate-in fade-in slide-in-from-bottom-8 duration-700 pb-8">
                <StepTitle number="04" title="Review & Continue" />
                <div className="relative w-full bg-surface dark:bg-[#1a1a1a] border-2 border-action/20 rounded-[2.5rem] p-8 shadow-2xl overflow-hidden group hover:border-action/50 transition-all duration-500">
                  
                  <div className="absolute top-0 right-0 w-64 h-64 bg-action/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
                  
                  <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
                    <div className="flex flex-col items-center md:items-start w-full md:w-auto text-center md:text-left">
                      <div className="flex flex-wrap justify-center md:justify-start gap-2 mb-4">
                        <span className="inline-flex items-center px-4 py-1.5 rounded-xl bg-surface border border-border text-xs font-black uppercase tracking-widest text-title shadow-sm">
                          <Icon name="event" size="xs" className="mr-2 text-action"/>
                          {shortDateStr}
                        </span>
                        <span className="inline-flex items-center px-4 py-1.5 rounded-xl bg-surface border border-border text-xs font-black uppercase tracking-widest text-title shadow-sm">
                          <Icon name="group" size="xs" className="mr-2 text-action"/>
                          {pax} Pax
                        </span>
                      </div>
                      <Typography variant="h3" className="text-title font-black italic uppercase leading-none mb-2">
                        {sessionConfig[session].shortLabel}
                      </Typography>
                      <p className="text-desc text-sm font-medium opacity-80 max-w-md">
                        Review your selection. You will enter your details in the next step.
                      </p>
                    </div>

                    <div className="flex flex-col items-center md:items-end gap-4 w-full md:w-auto mt-4 md:mt-0">
                      <div className="text-center md:text-right">
                        <div className="text-[10px] font-bold uppercase text-desc/60 mb-1 tracking-[0.2em]">Total Estimate</div>
                        <div className="text-4xl md:text-5xl font-mono font-black text-primary leading-none">
                          {finalPrice.toLocaleString()} <span className="text-xl text-title font-sans">THB</span>
                        </div>
                      </div>
                      <Button 
                        variant="action" 
                        size="xl" 
                        onClick={handleConfirmSelection} 
                        icon="arrow_forward" 
                        className="w-full md:w-auto px-10 h-16 text-lg shadow-action-glow hover:scale-105 transition-transform"
                      >
                        Continue Booking
                      </Button>
                    </div>
                  </div>
                </div>
              </section>
            )}
          </div>
        )}

        {/* ================= STEP 2: FORM & PAYMENT ================= */}
        {viewStep !== 'selection' && session && sessionConfig[session] && (
          <div className="animate-in fade-in slide-in-from-bottom-8">
            
            {/* RIASSUNTO TESTATA */}
            <div className="bg-surface border-l-4 border-action rounded-[2rem] p-6 flex items-center justify-between border-y border-r border-border shadow-md mb-8">
              <div>
                <Typography variant="h5" className="text-title leading-none mt-1">
                  {sessionConfig[session].label}
                </Typography>
                <Typography variant="caption" className="text-action font-bold mt-1 block">
                  {formattedDateStr} • {pax} Pax
                </Typography>
              </div>
              <Button variant="mineral" size="sm" icon="edit" onClick={() => setViewStep('selection')} className="border-border hover:border-action hover:text-action hover:bg-action/5 shadow-sm min-w-[100px]">
                Modify
              </Button>
            </div>

            {/* AUTH TOGGLE */}
            {viewStep === 'auth' && !userProfile && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                <button onClick={() => { setAuthMode('login'); setViewStep('form'); }} className="bg-surface hover:bg-muted border border-dashed border-border p-6 rounded-[2rem] text-left group transition-all">
                  <div className="flex items-center gap-3 mb-2"><Icon name="person" className="text-primary group-hover:scale-110 transition-transform" /><span className="font-bold text-title">Login Account</span></div>
                  <p className="text-xs text-desc pl-9">Use existing profile & discounts.</p>
                </button>
                <button onClick={() => { setAuthMode('guest'); setViewStep('form'); }} className="bg-surface hover:bg-muted border border-border p-6 rounded-[2rem] text-left group transition-all">
                  <div className="flex items-center gap-3 mb-2"><Icon name="person_add" className="text-title group-hover:scale-110 transition-transform" /><span className="font-bold text-title">New Guest</span></div>
                  <p className="text-xs text-desc pl-9">Book quickly.</p>
                </button>
              </div>
            )}

            {/* FORM DATI */}
            {viewStep === 'form' && (
              <Card variant="glass" className="p-8 border-border bg-surface/50">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                  <div>
                    <Typography variant="h4" className="text-title italic uppercase">
                      {isAgency ? 'Agency Booking' : (authMode === 'login' ? 'Member Login' : 'Guest Details')}
                    </Typography>
                    {!userProfile && !isAgency && (
                      <p className="text-xs text-desc/60 mt-1">
                        {authMode === 'login' ? "Access your profile & benefits." : "Quick booking without password."}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-3">
                    {isAgency && <Badge variant="brand">B2B Mode</Badge>}
                    {!userProfile && (
                      <Button variant="mineral" size="sm" icon={authMode === 'login' ? "person_add" : "login"} onClick={() => setAuthMode(authMode === 'login' ? 'guest' : 'login')} className="text-xs h-10 px-4 border-border hover:border-title">
                        {authMode === 'login' ? "Continue as Guest" : "Login instead"}
                      </Button>
                    )}
                  </div>
                </div>

                <div className="space-y-5">
                  {isAgency && (
                    <div className="bg-blue-500/10 border border-blue-500/30 p-4 rounded-xl mb-4">
                      <div className="flex items-center gap-2 mb-2 text-blue-500 font-bold uppercase text-[10px] tracking-widest"><Icon name="business_center" size="sm"/> Partner Info</div>
                      <p className="text-xs text-desc">You are booking as <strong className="text-title">{userProfile?.agency_company_name}</strong>. No immediate payment required.</p>
                    </div>
                  )}

                  {authMode === 'login' && !userProfile ? (
                    <>
                      <Input label="Email" type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} leftIcon="mail" />
                      <Input label="Password" type="password" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} leftIcon="lock" />
                    </>
                  ) : (
                    <>
                      <Input label="Your Name (Booker)" value={formData.fullName} onChange={e => setFormData({...formData, fullName: e.target.value})} disabled={!!userProfile} leftIcon="person" />
                      <Input label="Email" type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} disabled={!!userProfile} leftIcon="mail" />
                      <div className="flex gap-2">
                        <select value={formData.phonePrefix} onChange={e => setFormData({ ...formData, phonePrefix: e.target.value })} className="w-32 bg-surface border border-border rounded-xl px-3 text-xs font-bold text-title outline-none focus:border-action">
                          {COUNTRY_PREFIXES.map(p => (<option key={p.code} value={p.code} className="bg-surface text-title">{p.label}</option>))}
                        </select>
                        <Input placeholder="123 456 789" value={formData.phoneNumber} onChange={e => setFormData({...formData, phoneNumber: e.target.value})} className="flex-1" />
                      </div>
                      {!userProfile && <Input label="Create Password" type="password" placeholder="Min 6 chars" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} leftIcon="lock" />}
                      <Textarea 
                        label={isAgency ? "Guest Name & Room Number (Required)" : "Dietary Notes"} 
                        placeholder={isAgency ? "e.g. Mr. Mario Rossi, Room 304" : "Allergies, special requests..."} 
                        value={formData.customerNote} 
                        onChange={e => setFormData({...formData, customerNote: e.target.value})} 
                      />
                    </>
                  )}

                  {/* PAYMENT SECTION */}
                  <div className="pt-6 border-t border-border mt-6">
                    <div className="flex justify-between items-end mb-4">
                      <Typography variant="h6" className="text-desc uppercase">Total Due</Typography>
                      <div className="text-right">
                        {isAgency && <span className="block text-xs text-desc/60 line-through">{totalGross.toLocaleString()} THB</span>}
                        <Typography variant="h3" className="text-title font-black">{finalPrice.toLocaleString()} <span className="text-sm text-primary">THB</span></Typography>
                      </div>
                    </div>

                    {!isAgency && !(authMode === 'login' && !userProfile) && (
                      <div className="grid grid-cols-2 gap-4 mb-6">
                        <button type="button" onClick={() => setPaymentMethod('arrival')} className={cn("p-4 rounded-2xl border text-left transition-all", paymentMethod === 'arrival' ? "bg-action/10 border-action text-title" : "bg-surface border-border text-desc hover:bg-muted")}>
                          <div className="font-bold text-sm uppercase mb-1">Pay on Arrival</div>
                          <div className="text-[10px] opacity-70">Cash or QR</div>
                        </button>
                        <button type="button" onClick={() => setPaymentMethod('card')} className={cn("p-4 rounded-2xl border text-left transition-all", paymentMethod === 'card' ? "bg-primary/10 border-primary text-title" : "bg-surface border-border text-desc hover:bg-muted")}>
                          <div className="font-bold text-sm uppercase mb-1">Credit Card</div>
                          <div className="text-[10px] opacity-70">Stripe Secure</div>
                        </button>
                      </div>
                    )}

                    <Button 
                      variant={isAgency ? "mineral" : (paymentMethod === 'card' ? "brand" : "action")}
                      size="xl" 
                      fullWidth 
                      onClick={handleSubmit} 
                      isLoading={loadingConfig}
                      icon={isAgency ? "send" : (paymentMethod === 'card' ? "credit_card" : "verified")}
                    >
                      {isAgency ? "Confirm Booking (Invoice)" : (paymentMethod === 'card' ? "Pay Now (Demo)" : "Confirm & Pay Later")}
                    </Button>
                  </div>
                </div>
              </Card>
            )}
          </div>
        )}
      </div>

      <Modal isOpen={showCalendarModal} onClose={() => setShowCalendarModal(false)} title="" size="xl" className="p-0 overflow-hidden bg-surface dark:bg-[#1a1a1a] border-border w-full max-w-[85rem]" hideCloseButton={true}>
        <CalendarView currentDate={selectedDate} onSelectDate={(date) => { setSelectedDate(date); setShowCalendarModal(false); setSession(null); }} onClose={() => setShowCalendarModal(false)} />
      </Modal>

    </PageLayout>
  );
};

export default BookingPage;