import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { PageLayout } from '../components/layout/PageLayout';
import HeaderMenu from '../components/layout/HeaderMenu';
import { Tabs } from '../components/ui';
import { UserProfile } from '../services/authService';
import { Certificate, CertificateDish } from '../components/menu/Certificate';
import {
  DashboardTab,
  MenuManager,
  QuizWidget,
  UserSettings
} from '../components/user-dashboard';

interface UserPageProps {
  onNavigate: (page: string, topic?: string, sectionId?: string) => void;
  userProfile: UserProfile | null;
  onProfileRefresh: () => void;
  sectionId?: string | null;
}

// 1. MAPPATURA SLUG DINAMICI
// Associa ogni Tab al "page_slug" nella tabella site_metadata del DB
const HEADER_SLUGS: Record<string, string> = {
  dashboard: 'user-dashboard', // Titolo: "Let's Cook! / Your Kitchen Hub"
  menu:      'user-menu',      // Titolo: "Your Culinary / Selection"
  quiz:      'user-quiz',      // Titolo: "Akha Wisdom / Path"
  passport:  'user-passport'   // Titolo: "Digital / Passport"
};

const UserPage: React.FC<UserPageProps> = ({
  onNavigate,
  userProfile,
  onProfileRefresh,
  sectionId
}) => {
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Dati
  const [bookingsList, setBookingsList] = useState<any[]>([]);
  const [activeBookingId, setActiveBookingId] = useState<string | null>(null);
  const [menuSelection, setMenuSelection] = useState<any | null>(null);
  const [spicinessLevels, setSpicinessLevels] = useState<any[]>([]);
  const [showCertificate, setShowCertificate] = useState(false);
  
  // Dati per la Route Timeline (Lista fermate driver)
  const [routeStops, setRouteStops] = useState<any[]>([]);

  // Gestione tab iniziale da props
  useEffect(() => {
    if (sectionId && ['dashboard', 'menu', 'quiz', 'passport'].includes(sectionId)) {
      setActiveTab(sectionId);
    }
  }, [sectionId]);

  // --- 1. FETCH BOOKINGS & SORTING (Caricamento Iniziale) ---
  const fetchBookings = async (isBackgroundRefresh = false) => {
    if (!userProfile) return;
    
    if (!isBackgroundRefresh) setLoading(true);

    try {
      // Carica livelli piccantezza solo se non ci sono
      if (spicinessLevels.length === 0) {
        const { data: levels } = await supabase.from('spiciness_levels').select('*').order('id');
        if (levels) setSpicinessLevels(levels);
      }

      const { data: bookings } = await supabase
        .from('bookings')
        .select(`*, class_sessions ( display_name, start_time )`)
        .eq('user_id', userProfile.id)
        .neq('status', 'cancelled');

      if (bookings && bookings.length > 0) {
        // Logica Sorting
        const now = new Date();
        now.setHours(0,0,0,0);
        
        const future = bookings.filter(b => new Date(b.booking_date) >= now)
          .sort((a,b) => new Date(a.booking_date).getTime() - new Date(b.booking_date).getTime());
        
        const past = bookings.filter(b => new Date(b.booking_date) < now)
          .sort((a,b) => new Date(b.booking_date).getTime() - new Date(a.booking_date).getTime());

        const sortedBookings = [...future, ...past];
        setBookingsList(sortedBookings);

        // Seleziona ID solo al primo caricamento, non durante i refresh
        if (!activeBookingId) {
            const lastEdited = localStorage.getItem('last_edited_booking');
            const targetId = lastEdited && sortedBookings.find(b => b.internal_id === lastEdited) 
                ? lastEdited 
            : (future.length > 0 ? future[0].internal_id : sortedBookings[0].internal_id); // ✅ FIX: Aggiunto [0]            
            setActiveBookingId(targetId);
            localStorage.removeItem('last_edited_booking');
        }
      } else {
        setBookingsList([]);
        setActiveBookingId(null);
      }
    } catch (err) {
      console.error("UserPage Fetch Error:", err);
    } finally {
      if (!isBackgroundRefresh) setLoading(false);
    }
  };

  // Caricamento iniziale
  useEffect(() => {
    fetchBookings();
  }, [userProfile, refreshTrigger]);

  // --- 2. FETCH MENU & ROUTE DETAILS (Dettagli + Refresh) ---
  
  // Funzione dedicata per aggiornare SOLO la rotta (leggera)
  const fetchRouteData = async (currentBooking: any) => {
      const { data: stops } = await supabase
        .from('bookings')
        .select('internal_id, hotel_name, route_order, transport_status, pickup_time')
        .eq('booking_date', currentBooking.booking_date)
        .eq('session_id', currentBooking.session_id)
        .neq('status', 'cancelled')
        .order('route_order', { ascending: true });
        
      setRouteStops(stops || []);
  };

  useEffect(() => {
    const loadDetails = async () => {
      if (!activeBookingId) {
        setMenuSelection(null);
        setRouteStops([]);
        return;
      }

      const { data: menu } = await supabase
        .from('menu_selections')
        .select(`*, curry:recipes!curry_id(name, image), soup:recipes!soup_id(name, image), stirfry:recipes!stirfry_id(name, image)`)
        .eq('booking_id', activeBookingId)
        .maybeSingle();

      setMenuSelection(menu);

      const currentBooking = bookingsList.find(b => b.internal_id === activeBookingId);
      if (currentBooking) {
          fetchRouteData(currentBooking);
      }
    };
    loadDetails();
  }, [activeBookingId, bookingsList, spicinessLevels]);

  // --- 3. 🧠 SMART POLLING (Auto-Refresh Logistico) ---
  useEffect(() => {
    const currentBooking = bookingsList.find(b => b.internal_id === activeBookingId);
    if (!currentBooking) return;

    // 1. Calcolo Data Locale (Fix Timezone + Array)
    const d = new Date();
    const offset = d.getTimezoneOffset() * 60000;
    const todayStr = new Date(d.getTime() - offset).toISOString().split('T');

    // 2. Controllo attivazione
    const isToday = currentBooking.booking_date === todayStr;
    const isPending = currentBooking.transport_status !== 'dropped_off';
    
    // Attiva SOLO SE: È oggi, non è finito il viaggio, e c'è una prenotazione valida
    if (isToday && isPending) {
        // console.log("⚡ LIVE TRACKING ACTIVE: Polling every 15s"); // Debug opzionale
        
        // Refresh immediato per sicurezza (sincronizza stato iniziale)
        fetchBookings(true);
        if(currentBooking) fetchRouteData(currentBooking);

        // Interval: Aggiorna ogni 15 secondi
        const interval = setInterval(() => {
            fetchBookings(true); // Aggiorna lo stato della mia prenotazione (es. "Driver Arrived")
            fetchRouteData(currentBooking); // Aggiorna la timeline degli altri hotel
        }, 15000); 

        return () => clearInterval(interval);
    }
  }, [activeBookingId, bookingsList]); // Reagisce se cambia lo stato o l'ID

  // --- HELPER CERTIFICATO ---
  const getCertificateDishes = (): CertificateDish[] => {
    if (!menuSelection) return [];
    const dishes = [menuSelection.curry, menuSelection.soup, menuSelection.stirfry].filter(Boolean);
    
    return dishes.map(d => ({
        name: d.name || 'Signature Dish',
        image: d.image || '',
        variantLabel: userProfile?.dietary_profile !== 'diet_regular' 
            ? userProfile?.dietary_profile?.replace('diet_', '').charAt(0).toUpperCase() + userProfile?.dietary_profile?.slice(6) + ' Version'
            : undefined
    }));
  };

  const activeBooking = bookingsList.find(b => b.internal_id === activeBookingId);

  const TABS = [
    { value: 'dashboard', label: 'Overview', icon: 'dashboard' },
    { value: 'menu', label: 'My Menu', icon: 'restaurant_menu', badge: menuSelection ? undefined : '!' },
    { value: 'quiz', label: 'Akha Quiz', icon: 'psychology' },
    { value: 'passport', label: 'Passport', icon: 'badge', activeColor: 'secondary' as const },
  ];

  // Determina lo slug corrente (fallback su dashboard se qualcosa si rompe)
  const currentSlug = HEADER_SLUGS[activeTab] || 'user-dashboard';

  return (
    <PageLayout 
      slug="user" 
      loading={loading} 
      hideDefaultHeader={true} 
      // 🟢 Header Dinamico
      customHeader={<HeaderMenu customSlug={currentSlug} />}
    >
      
      <div className="w-full min-h-[80vh] relative">
         <div className="sticky top-24 z-40 w-full flex justify-center mb-10 animate-fade-slide-up">
            <div className="pointer-events-auto drop-shadow-2xl">
               <Tabs items={TABS} value={activeTab} onChange={setActiveTab} variant="pills" />
            </div>
         </div>
         
         <div className="animate-in fade-in slide-in-from-bottom-8 duration-700 delay-100">
            {activeTab === 'dashboard' && (
              <DashboardTab 
                userProfile={userProfile} 
                bookings={bookingsList} 
                activeId={activeBookingId}
                routeStops={routeStops} // 👈 Passaggio dati rotta
                onSelectBooking={setActiveBookingId}
                menuStatus={!!menuSelection}
                onNavigate={onNavigate}
                onChangeTab={setActiveTab}
                onOpenSettings={() => setActiveTab('passport')}
                onShowCertificate={() => setShowCertificate(true)}
              />
            )}

            {activeTab === 'menu' && (
              <MenuManager 
                bookingId={activeBookingId} 
                bookings={bookingsList} 
                onSelectBooking={setActiveBookingId}
                menuSelection={menuSelection}
                onNavigate={onNavigate}
              />
            )}

{activeTab === 'quiz' && (
    <QuizWidget 
        onNavigate={onNavigate} 
        userProfile={userProfile} // 👈 FONDAMENTALE: Passiamo il profilo qui!
    />
)}
            {activeTab === 'passport' && (
              <UserSettings 
                userProfile={userProfile} 
                spicinessLevels={spicinessLevels}
                onBack={() => setActiveTab('dashboard')} 
                onUpdate={() => {
                    setRefreshTrigger(prev => prev + 1);
                    onProfileRefresh();
                    setTimeout(() => { setActiveTab('dashboard'); window.scrollTo({ top: 0, behavior: 'smooth' }); }, 1500);
                }}
              />
            )}
         </div>
      </div>

      {showCertificate && userProfile && activeBooking && (
        <Certificate 
            name={userProfile.full_name} 
            date={new Date(activeBooking.booking_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
            classType={activeBooking.session_id?.includes('morning') ? "Morning Market Course" : "Evening Feast Course"}
            dietLabel={userProfile.dietary_profile?.replace('diet_', '').toUpperCase()}
            dishes={getCertificateDishes()}
            onClose={() => setShowCertificate(false)}
        />
      )}

    </PageLayout>
  );
};

export default UserPage;