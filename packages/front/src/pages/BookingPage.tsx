import React, { useState, useEffect, useMemo } from 'react';
import { supabase } from '@thaiakha/shared/lib/supabase';
import { PageLayout } from '../components/layout/PageLayout';
import HeaderMenu from '../components/layout/HeaderMenu';
import { Modal } from '../components/ui/index';
import { authService, UserProfile } from '../services/auth.service';
import { contentService } from '@thaiakha/shared/services';
import { CalendarView } from '../components/booking/CalendarView';
import { BookingSelection } from '../components/booking/BookingSelection';
import { BookingCheckout } from '../components/booking/BookingCheckout';
import { BookingStickyFooter } from '../components/booking/BookingStickyFooter';

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
  totalVisitors: number;
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
  // --- STATE: DATA & CONFIG ---
  const [sessionConfig, setSessionConfig] = useState<Record<string, SessionInfo>>({});
  const [loadingConfig, setLoadingConfig] = useState(true);

  // --- STATE: FLOW ---
  const [viewStep, setViewStep] = useState<'selection' | 'auth' | 'form'>('selection');
  const [authMode, setAuthMode] = useState<'guest' | 'login'>('guest');
  const [showCalendarModal, setShowCalendarModal] = useState(false);

  // --- STATE: SELECTION ---
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [viewDate, setViewDate] = useState<Date>(new Date());
  const [session, setSession] = useState<'morning_class' | 'evening_class' | null>(null);
  const [pax, setPax] = useState<number>(0);
  const [visitors, setVisitors] = useState<number>(0);
  const [, setLoadingAvailability] = useState(false);

  // Availability State (Mapped by date string YYYY-MM-DD)
  const [dailyStats, setDailyStats] = useState<Record<string, DailyAvailability>>({});

  // Payment & Form State
  const [paymentMethod, setPaymentMethod] = useState<'arrival' | 'card'>('arrival');
  const [formData, setFormData] = useState({
    fullName: userProfile?.full_name || '',
    email: userProfile?.email || '',
    password: '',
    phonePrefix: '+66',
    phoneNumber: '',
    age: '',
    gender: '',
    nationality: '',
    hasWhatsapp: null as boolean | null,
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
  }, [userProfile, viewStep]);

  // --- COMPUTED PRICES ---
  const currentBasePrice = session && sessionConfig[session] ? sessionConfig[session].basePrice : 0;
  const finalPrice = currentBasePrice * pax;

  // DATA SCROLLER
  const dateOptions = useMemo(() => {
    const dates = [];
    const baseDate = new Date(viewDate);
    baseDate.setHours(12, 0, 0, 0);

    for (let i = -2; i <= 2; i++) {
      const d = new Date(baseDate);
      d.setDate(baseDate.getDate() + i);
      dates.push(d);
    }
    return dates;
  }, [viewDate]);

  // --- ENGINE DISPONIBILITÀ (Realtime per l'intero range) ---
  useEffect(() => {
    const fetchRangeStats = async () => {
      setLoadingAvailability(true);

      try {
        const { data: sessionsData } = await supabase.from('class_sessions').select('id, max_capacity');
        const baseCaps: Record<string, number> = {};
        sessionsData?.forEach((s: any) => baseCaps[s.id] = s.max_capacity);

        const dateStrings = dateOptions.map(d => {
          const offset = d.getTimezoneOffset() * 60000;
          return new Date(d.getTime() - offset).toISOString().split('T')[0];
        });

        const { data: overrides } = await supabase.from('class_calendar_overrides')
          .select('*')
          .in('date', dateStrings);

        const { data: bookings } = await supabase.from('bookings')
          .select('session_id, booking_date, pax_count, visitor_count')
          .in('booking_date', dateStrings)
          .neq('status', 'cancelled');

        const newStatsMap: Record<string, DailyAvailability> = {};

        dateStrings.forEach(dateStr => {
          const calculateStatus = (sessionId: string): SessionStatus => {
            const override = overrides?.find((o: any) => o.date === dateStr && o.session_id === sessionId);
            if (override?.is_closed) return { status: 'CLOSED', remaining: 0, reason: override.closure_reason || 'Closed', totalVisitors: 0 };

            const max = override?.custom_capacity ?? baseCaps[sessionId] ?? 0;
            const sessionBookings = bookings?.filter((b: any) => b.booking_date === dateStr && b.session_id === sessionId) || [];
            const occupied = sessionBookings.reduce((sum: number, b: any) => sum + b.pax_count, 0);
            const totalVisitors = sessionBookings.reduce((sum: number, b: any) => sum + (b.visitor_count || 0), 0);

            const remaining = Math.max(0, max - occupied);
            return { status: remaining > 0 ? 'OPEN' : 'FULL', remaining, reason: remaining === 0 ? 'Fully Booked' : undefined, totalVisitors };
          };

          newStatsMap[dateStr] = {
            morning_class: calculateStatus('morning_class'),
            evening_class: calculateStatus('evening_class')
          };
        });

        setDailyStats(newStatsMap);

      } catch (err) {
        console.error("Availability Range Fetch Error:", err);
      } finally {
        setLoadingAvailability(false);
      }
    };

    if (Object.keys(sessionConfig).length > 0 && dateOptions.length > 0) fetchRangeStats();
  }, [dateOptions, sessionConfig]);

  // --- HANDLERS ---

  const isPaxSelected = pax > 0;
  const selectedDateStr = selectedDate
    ? new Date(selectedDate.getTime() - (selectedDate.getTimezoneOffset() * 60000)).toISOString().split('T')[0]
    : '';

  const currentStats = useMemo<DailyAvailability>(() => {
    if (selectedDate && dailyStats[selectedDateStr]) return dailyStats[selectedDateStr];
    // Fallback dinamico: remaining 0 finché i dati DB non arrivano (no hardcoded 12)
    const empty = { status: 'OPEN' as const, remaining: 0, totalVisitors: 0 };
    return Object.keys(sessionConfig).reduce<DailyAvailability>(
      (acc, key) => ({ ...acc, [key]: empty }),
      { morning_class: empty, evening_class: empty }
    );
  }, [selectedDate, dailyStats, selectedDateStr, sessionConfig]);

  const maxSelectable = session ? (currentStats[session]?.remaining || 0) : 0;

  // Visitor limits: max 1 per pax, max 2 per booking, max 4 total in class
  const currentTotalVisitors = session ? (currentStats[session]?.totalVisitors ?? 0) : 0;
  const maxVisitorsAllowed = pax > 0 ? Math.min(pax, 2, 4 - currentTotalVisitors) : 0;

  // Clamp pax if availability decreases (date/session change)
  useEffect(() => {
    if (pax > maxSelectable) setPax(Math.max(0, maxSelectable));
  }, [maxSelectable]);

  // Clamp visitors if pax decreases
  useEffect(() => {
    if (visitors > maxVisitorsAllowed) setVisitors(Math.max(0, maxVisitorsAllowed));
  }, [pax, maxVisitorsAllowed]);

  // Reset visitors when session changes
  useEffect(() => {
    setVisitors(0);
  }, [session]);

  const handleDateSelect = (d: Date) => {
    setSelectedDate(d);
    setViewDate(d);
    setSession(null);
    setPax(0);
    setVisitors(0);
    setTimeout(() => {
      const el = document.getElementById('step-class');
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 100);
  };

  const handleSessionSelect = (s: 'morning_class' | 'evening_class') => {
    const stats = currentStats[s];
    if (stats.status !== 'OPEN') {
      alert(`Sorry, this class is ${stats.status === 'FULL' ? 'full' : 'closed'}.`);
      return;
    }
    setSession(s);
    setTimeout(() => {
      const el = document.getElementById('step-pax');
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 100);
  };

  const handleConfirmSelection = () => {
    if (!session || !isPaxSelected) return;
    const stats = currentStats[session];

    if (stats.status !== 'OPEN' || stats.remaining < pax) {
      alert(`Sorry, availability changed. Only ${stats.remaining} seats left.`);
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
        const authResponse: { user?: { id: string } } | null =
          authMode === 'login'
            ? await authService.signIn(formData.email, formData.password)
            : await authService.signUp(formData.email, formData.password, formData.fullName);

        if (!authResponse?.user) throw new Error("Authentication failed.");
        userId = authResponse.user.id;
        onAuthSuccess();

        // Upsert extra profile fields collected in the booking form
        if (authMode !== 'login') {
          await supabase.from('profiles').upsert({
            id: userId,
            phone_prefix: formData.phonePrefix,
            phone_number: formData.phoneNumber,
            ...(formData.age !== '' && { age: Number(formData.age) }),
            ...(formData.gender && { gender: formData.gender }),
            ...(formData.nationality && { nationality: formData.nationality }),
            ...(formData.hasWhatsapp !== null && { phone_whatsapp: formData.hasWhatsapp }),
            updated_at: new Date().toISOString(),
          }, { onConflict: 'id' });
        }
      }

      if (!selectedDate) return;
      const offset = selectedDate.getTimezoneOffset() * 60000;
      const localDate = new Date(selectedDate.getTime() - offset);
      const dateStr = localDate.toISOString().split('T');

      // Auto-assign driver
      let assignedDriverId = null;
      try {
        const { data: drivers } = await supabase
          .from('profiles')
          .select('id')
          .eq('role', 'driver')
          .limit(1);

        if (drivers && drivers.length > 0) assignedDriverId = drivers[0].id;
      } catch (dErr) {
        console.warn("Auto-assign driver failed:", dErr);
      }

      const payload = {
        user_id: userId,
        session_id: session,
        booking_date: dateStr,
        pax_count: pax,
        visitor_count: visitors,
        total_price: finalPrice,
        payment_method: paymentMethod === 'card' ? 'credit_card' : 'pay_on_arrival',
        payment_status: 'pending',
        status: 'confirmed',
        phone_prefix: formData.phonePrefix,
        phone_number: formData.phoneNumber,
        hotel_name: 'To be selected',
        pickup_zone: 'walk-in',
        pickup_driver_uid: assignedDriverId
      };

      const { data, error } = await supabase.from('bookings').insert(payload).select('internal_id').single();
      if (error) throw error;

      if (data) localStorage.setItem('last_edited_booking', data.internal_id);
      onNavigate('user');

    } catch (err: any) {
      alert("Booking Error: " + (err.message || "Unknown error"));
    } finally {
      setLoadingConfig(false);
    }
  };

  const formattedDateStr = useMemo(() => {
    if (!selectedDate) return "";
    const options: Intl.DateTimeFormatOptions = { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' };
    return selectedDate.toLocaleDateString('en-US', options);
  }, [selectedDate]);

  const shortDateStr = useMemo(() => {
    if (!selectedDate) return "";
    return `${selectedDate.getDate()} ${MONTHS_SHORT[selectedDate.getMonth()]}`;
  }, [selectedDate]);

  return (
    <PageLayout slug="booking" loading={loadingConfig} showPatterns={true} hideDefaultHeader={true} customHeader={<HeaderMenu customSlug="booking" />}>

      <div className="w-full max-w-5xl mx-auto flex flex-col pb-48">
        <div className="w-full max-w-5xl mx-auto space-y-16 pb-12 pt-0 md:pt-4 px-6 md:px-0">
          {/* STEP 1: SELECTION */}
          {viewStep === 'selection' && (
            <BookingSelection
              selectedDate={selectedDate}
              handleDateSelect={handleDateSelect}
              dateOptions={dateOptions}
              dailyStats={dailyStats}
              formattedDateStr={formattedDateStr}
              setShowCalendarModal={setShowCalendarModal}
              session={session}
              handleSessionSelect={handleSessionSelect}
              sessionConfig={sessionConfig}
              currentStats={currentStats}
              pax={pax}
              setPax={setPax}
              maxSelectable={maxSelectable}
              isPaxSelected={isPaxSelected}
              visitors={visitors}
              setVisitors={setVisitors}
              maxVisitorsAllowed={maxVisitorsAllowed}
            />
          )}

          {/* STEP 2: CHECKOUT */}
          <BookingCheckout
            viewStep={viewStep}
            setViewStep={setViewStep}
            session={session}
            sessionConfig={sessionConfig}
            selectedDate={selectedDate}
            formattedDateStr={formattedDateStr}
            pax={pax}
            visitors={visitors}
            userProfile={userProfile}
            authMode={authMode}
            setAuthMode={setAuthMode}
            formData={formData}
            setFormData={setFormData}
            paymentMethod={paymentMethod}
            setPaymentMethod={setPaymentMethod}
            finalPrice={finalPrice}
            handleSubmit={handleSubmit}
            loading={loadingConfig}
          />
        </div>

        <BookingStickyFooter
          viewStep={viewStep}
          selectedDate={selectedDate}
          session={session}
          shortDateStr={shortDateStr}
          pax={pax}
          visitors={visitors}
          finalPrice={finalPrice}
          handleConfirmSelection={handleConfirmSelection}
        />
      </div>

      <Modal isOpen={showCalendarModal} onClose={() => setShowCalendarModal(false)} title="" size="xl" className="p-0 overflow-hidden bg-surface dark:bg-surface-elevated border-border w-full max-w-[85rem]" hideCloseButton={true}>
        <CalendarView currentDate={selectedDate} onSelectDate={(date) => { handleDateSelect(date); setShowCalendarModal(false); }} onClose={() => setShowCalendarModal(false)} />
      </Modal>

    </PageLayout>
  );
};

export default BookingPage;
