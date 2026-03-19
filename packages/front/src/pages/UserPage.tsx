import React, { useState, useEffect, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { supabase } from '@thaiakha/shared/lib/supabase';
import { PageLayout } from '../components/layout/PageLayout';
import HeaderMenu from '../components/layout/HeaderMenu';
import { Tabs } from '../components/ui';
import { UserProfile } from '../services/auth.service';
import { Certificate, CertificateDish } from '../components/menu/Certificate';
import {
  DashboardTab,
  MenuManager,
  QuizWidget,
  UserSettings,
  OverviewView,
} from '../components/user-dashboard';
import UserProfileCard from '../components/user-dashboard/UserProfileCard';
import ContextualStatsView from '../components/user-dashboard/ContextualStatsView';
import AccessDeniedView from '../components/user-dashboard/AccessDeniedView';

/* ── CONSTANTS ── */
const STAFF_ROLES = new Set(['admin', 'manager', 'agency', 'kitchen', 'logistics', 'driver']);

const HEADER_SLUGS: Record<string, string> = {
  overview:     'user-dashboard',
  reservation:  'user-dashboard',
  menu:         'user-menu',
  quiz:         'user-quiz',
  passport:     'user-passport',
};

const TAB_ANIMATION = {
  initial:  { opacity: 0, y: 14 },
  animate:  { opacity: 1, y: 0 },
  exit:     { opacity: 0, y: -8 },
  transition: { duration: 0.22, ease: 'easeOut' as const },
};

interface UserPageProps {
  onNavigate: (page: string, topic?: string, sectionId?: string) => void;
  userProfile: UserProfile | null;
  onProfileRefresh: () => void;
  sectionId?: string | null;
}

const UserPage: React.FC<UserPageProps> = ({
  onNavigate,
  userProfile,
  onProfileRefresh,
  sectionId,
}) => {
  const [loading, setLoading]           = useState(true);
  const [activeTab, setActiveTab]       = useState<string>('overview');
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Data
  const [bookingsList, setBookingsList]         = useState<any[]>([]);
  const [activeBookingId, setActiveBookingId]   = useState<string | null>(null);
  const [menuSelection, setMenuSelection]       = useState<any | null>(null);
  const [spicinessLevels, setSpicinessLevels]   = useState<any[]>([]);
  const [routeStops, setRouteStops]             = useState<any[]>([]);
  const [showCertificate, setShowCertificate]   = useState(false);

  /* ── ROLE LOGIC ── */
  const isStaff = STAFF_ROLES.has(userProfile?.role as string ?? '');

  /* ── TABS — filtered by role ── */
  const ALL_TABS = [
    { value: 'overview',    label: 'Overview',        icon: 'home' },
    { value: 'reservation', label: 'My Reservation',  icon: 'event_available' },
    { value: 'menu',        label: 'My Menu',         icon: 'restaurant_menu', badge: menuSelection ? undefined : '!' },
    { value: 'quiz',        label: 'Akha Quiz',       icon: 'psychology' },
    { value: 'passport',    label: 'Passport',        icon: 'badge', activeColor: 'secondary' as const },
  ];

  const TABS = isStaff
    ? ALL_TABS.filter(t => ['overview', 'quiz', 'passport'].includes(t.value))
    : ALL_TABS;

  /* ── sectionId sync ── */
  useEffect(() => {
    const valid = ['overview', 'reservation', 'dashboard', 'menu', 'quiz', 'passport'];
    if (sectionId && valid.includes(sectionId)) {
      // legacy 'dashboard' → 'reservation'
      setActiveTab(sectionId === 'dashboard' ? 'reservation' : sectionId);
    }
  }, [sectionId]);

  /* ── FETCH BOOKINGS — guarded for staff ── */
  const fetchBookings = async (isBackgroundRefresh = false) => {
    if (!userProfile || isStaff) return;
    if (!isBackgroundRefresh) setLoading(true);

    try {
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
        const now = new Date();
        now.setHours(0, 0, 0, 0);
        const future = bookings
          .filter(b => new Date(b.booking_date) >= now)
          .sort((a, b) => new Date(a.booking_date).getTime() - new Date(b.booking_date).getTime());
        const past = bookings
          .filter(b => new Date(b.booking_date) < now)
          .sort((a, b) => new Date(b.booking_date).getTime() - new Date(a.booking_date).getTime());

        const sorted = [...future, ...past];
        setBookingsList(sorted);

        if (!activeBookingId) {
          const lastEdited = localStorage.getItem('last_edited_booking');
          const target = lastEdited && sorted.find(b => b.internal_id === lastEdited)
            ? lastEdited
            : (future.length > 0 ? future[0].internal_id : sorted[0].internal_id);
          setActiveBookingId(target);
          localStorage.removeItem('last_edited_booking');
        }
      } else {
        setBookingsList([]);
        setActiveBookingId(null);
      }
    } catch (err) {
      console.error('UserPage Fetch Error:', err);
    } finally {
      if (!isBackgroundRefresh) setLoading(false);
    }
  };

  useEffect(() => {
    if (isStaff) { setLoading(false); return; }
    fetchBookings();
  }, [userProfile, refreshTrigger, isStaff]);

  /* ── FETCH ROUTE DATA ── */
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

  /* ── FETCH MENU + ROUTE DETAILS ── */
  useEffect(() => {
    if (isStaff) return;
    const loadDetails = async () => {
      if (!activeBookingId) { setMenuSelection(null); setRouteStops([]); return; }

      const { data: menu } = await supabase
        .from('menu_selections')
        .select(`*, curry:recipes!curry_id(name, image), soup:recipes!soup_id(name, image), stirfry:recipes!stirfry_id(name, image)`)
        .eq('booking_id', activeBookingId)
        .maybeSingle();

      setMenuSelection(menu);
      const current = bookingsList.find(b => b.internal_id === activeBookingId);
      if (current) fetchRouteData(current);
    };
    loadDetails();
  }, [activeBookingId, bookingsList, isStaff]);

  /* ── SMART POLLING (today only) ── */
  useEffect(() => {
    if (isStaff) return;
    const current = bookingsList.find(b => b.internal_id === activeBookingId);
    if (!current) return;

    const now = new Date();
    const todayStr = new Date(now.getTime() - now.getTimezoneOffset() * 60000).toISOString().split('T')[0];
    const isToday  = current.booking_date === todayStr;
    const isPending = current.transport_status !== 'dropped_off';

    if (isToday && isPending) {
      fetchBookings(true);
      fetchRouteData(current);
      const interval = setInterval(() => {
        fetchBookings(true);
        fetchRouteData(current);
      }, 15000);
      return () => clearInterval(interval);
    }
  }, [activeBookingId, bookingsList, isStaff]);

  /* ── CERTIFICATE HELPER ── */
  const getCertificateDishes = (): CertificateDish[] => {
    if (!menuSelection) return [];
    return [menuSelection.curry, menuSelection.soup, menuSelection.stirfry]
      .filter(Boolean)
      .map(d => ({
        name: d.name || 'Signature Dish',
        image: d.image || '',
        variantLabel: userProfile?.dietary_profile !== 'diet_regular'
          ? userProfile?.dietary_profile?.replace('diet_', '').charAt(0).toUpperCase() + userProfile?.dietary_profile?.slice(6) + ' Version'
          : undefined,
      }));
  };

  const activeBooking = bookingsList.find(b => b.internal_id === activeBookingId);
  const currentSlug   = HEADER_SLUGS[activeTab] || 'user-dashboard';

  return (
    <PageLayout
      slug="user"
      loading={loading}
      hideDefaultHeader={true}
      customHeader={<HeaderMenu customSlug={currentSlug} />}
    >
      <div className="w-full">

        {/* ── STICKY TABS ── */}
        <div className="sticky top-20 z-40 w-full flex justify-center mb-8 md:mb-10">
          <div className="pointer-events-auto drop-shadow-2xl">
            <Tabs items={TABS} value={activeTab} onChange={setActiveTab} variant="pills" />
          </div>
        </div>

        {/* ── GRID LAYOUT ── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">

          {/* ── ASIDE — 4 cols (below tabs on mobile, left on desktop) ── */}
          <aside className="lg:col-span-4 flex flex-col gap-5 lg:sticky lg:top-36">
            <UserProfileCard userProfile={userProfile} />
            <ContextualStatsView
              activeTab={activeTab}
              activeBooking={activeBooking ?? null}
              menuSelection={menuSelection}
            />
          </aside>

          {/* ── MAIN CONTENT — 8 cols ── */}
          <main className="lg:col-span-8 min-w-0">
            <AnimatePresence mode="wait">
              <motion.div key={activeTab} {...TAB_ANIMATION}>

                {/* OVERVIEW */}
                {activeTab === 'overview' && (
                  <OverviewView
                    userProfile={userProfile}
                    activeBooking={activeBooking ?? null}
                    menuSelection={menuSelection}
                    onChangeTab={setActiveTab}
                    onNavigate={onNavigate}
                    isStaff={isStaff}
                  />
                )}

                {/* MY RESERVATION */}
                {activeTab === 'reservation' && (
                  isStaff ? (
                    <AccessDeniedView />
                  ) : bookingsList.length === 0 ? (
                    /* No booking state */
                    <div className="flex flex-col items-center justify-center py-20 bg-surface border border-border rounded-3xl text-center px-6">
                      <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-5">
                        <span className="material-symbols-rounded text-primary text-3xl">event_busy</span>
                      </div>
                      <p className="font-bold text-title text-lg mb-2">No Active Booking</p>
                      <p className="text-sub text-sm mb-6 max-w-xs">
                        Book a cooking class to manage your reservation here.
                      </p>
                      <button
                        onClick={() => onNavigate('booking')}
                        className="inline-flex items-center gap-2 bg-primary text-white font-bold px-6 py-3 rounded-2xl hover:bg-primary/90 transition-colors"
                      >
                        <span className="material-symbols-rounded text-xl">calendar_add_on</span>
                        Book a Class
                      </button>
                    </div>
                  ) : (
                    <DashboardTab
                      userProfile={userProfile}
                      bookings={bookingsList}
                      activeId={activeBookingId}
                      routeStops={routeStops}
                      onSelectBooking={setActiveBookingId}
                      menuStatus={!!menuSelection}
                      onNavigate={onNavigate}
                      onChangeTab={setActiveTab}
                      onOpenSettings={() => setActiveTab('passport')}
                      onShowCertificate={() => setShowCertificate(true)}
                    />
                  )
                )}

                {/* MY MENU — hidden for staff */}
                {activeTab === 'menu' && !isStaff && (
                  <MenuManager
                    bookingId={activeBookingId}
                    bookings={bookingsList}
                    onSelectBooking={setActiveBookingId}
                    menuSelection={menuSelection}
                    onNavigate={onNavigate}
                  />
                )}

                {/* AKHA QUIZ — all roles */}
                {activeTab === 'quiz' && (
                  <QuizWidget onNavigate={onNavigate} userProfile={userProfile} />
                )}

                {/* PASSPORT — all roles, staff: no certificate */}
                {activeTab === 'passport' && (
                  <UserSettings
                    userProfile={userProfile}
                    spicinessLevels={spicinessLevels}
                    onBack={() => setActiveTab(isStaff ? 'overview' : 'reservation')}
                    onUpdate={() => {
                      setRefreshTrigger(prev => prev + 1);
                      onProfileRefresh();
                      setTimeout(() => {
                        setActiveTab(isStaff ? 'overview' : 'reservation');
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }, 1500);
                    }}
                    isStaff={isStaff}
                    onShowCertificate={() => setShowCertificate(true)}
                  />
                )}

              </motion.div>
            </AnimatePresence>
          </main>

        </div>
      </div>

      {/* CERTIFICATE MODAL */}
      {showCertificate && userProfile && activeBooking && (
        <Certificate
          name={userProfile.full_name}
          date={new Date(activeBooking.booking_date).toLocaleDateString('en-GB', {
            day: 'numeric', month: 'short', year: 'numeric'
          })}
          classType={activeBooking.session_id?.includes('morning')
            ? 'Morning Market Course'
            : 'Evening Feast Course'
          }
          dietLabel={userProfile.dietary_profile?.replace('diet_', '').toUpperCase()}
          dishes={getCertificateDishes()}
          onClose={() => setShowCertificate(false)}
        />
      )}
    </PageLayout>
  );
};

export default UserPage;
