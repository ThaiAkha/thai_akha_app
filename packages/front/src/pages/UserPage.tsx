import React, { useState, useEffect, useMemo } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { PageLayout, HeaderMenu, StickyTabNav } from '../components/layout';
import { UserProfile } from '../services/auth.service';
import type { MenuSelectionDish } from '@thaiakha/shared/types';
import { Certificate, CertificateDish } from '../components/menu/Certificate';
import {
  DashboardTab,
  MenuManager,
  QuizWidget,
  UserSettings,
  OverviewView,
  NoBookingBanner,
} from '../components/user-dashboard';
import UserProfileCard from '../components/user-dashboard/UserProfileCard';
import ProfileSwitcher from '../components/user-dashboard/ProfileSwitcher';
import InviteGroupBlock from '../components/user-dashboard/InviteGroupBlock';
import VisitorClassBlock from '../components/user-dashboard/VisitorClassBlock';
import ContextualStatsView from '../components/user-dashboard/ContextualStatsView';
import AccessDeniedView from '../components/user-dashboard/AccessDeniedView';
import TopWarriorsCard from '../components/user-dashboard/TopWarriorsCard';
import { CherryHelp } from '../components/chat/CherryHelp';
import { useUserDashboardData } from '../hooks/useUserDashboardData';
import { t } from '../i18n';

/* ── CONSTANTS ── */
// Synced with DB profiles.role constraint — agency uses Admin App, logistics doesn't exist in schema
// Ruoli operativi che non hanno booking personali (no fetch bookings, no certificato).
// NB: Menu e My Reservation NON sono gated dal ruolo ma dalla presenza di un booking
// ATTIVO (vedi hasActiveBooking): anche un'agency con un suo booking li vede.
const STAFF_ROLES = new Set(['admin', 'manager', 'kitchen', 'driver']);

const HEADER_SLUGS: Record<string, string> = {
  overview: 'user-dashboard',
  reservation: 'user-dashboard',
  menu: 'user-menu',
  quiz: 'user-quiz',
  passport: 'user-passport',
};

const TAB_ANIMATION = {
  initial: { opacity: 0, y: 14 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -8 },
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
  const [activeTab, setActiveTab] = useState<string>('overview');
  const [showCertificate, setShowCertificate] = useState(false);

  /* ── ROLE LOGIC ── */
  const isStaff = STAFF_ROLES.has(userProfile?.role as string ?? '');

  /* ── DATA — bookings/menu/route su TanStack Query (#118 lotto 6, regola #17) ── */
  const {
    bookingsList,
    activeBookingId,
    setActiveBookingId,
    activeBooking,
    menuSelection,
    routeStops,
    spicinessLevels,
    loading,
    refresh,
  } = useUserDashboardData(userProfile, isStaff);

  /* ── ACTIVE BOOKING ── (futuro/oggi, non cancellato). Gate UNICO di Menu + My
     Reservation per QUALSIASI ruolo: senza booking attivo non si vedono. */
  const hasActiveBooking = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return bookingsList.some(b => new Date(b.booking_date) >= today);
  }, [bookingsList]);

  /* ── TABS — Menu + Reservation solo con un booking attivo (qualsiasi ruolo) ── */
  const ALL_TABS = [
    { value: 'overview', label: t('user:tabOverview'), icon: 'home' },
    { value: 'reservation', label: t('user:tabReservation'), icon: 'event_available' },
    { value: 'menu', label: t('user:tabMenu'), icon: 'restaurant_menu', badge: menuSelection ? undefined : '!' },
    { value: 'quiz', label: t('user:tabQuiz'), icon: 'psychology' },
    { value: 'passport', label: t('user:tabPassport'), icon: 'account_box', activeColor: 'secondary' as const },
  ];

  const TABS = ALL_TABS.filter(tab =>
    (tab.value === 'reservation' || tab.value === 'menu') ? hasActiveBooking : true
  );

  /* ── Senza booking attivo non si resta su Menu/Reservation: torna a Overview ── */
  useEffect(() => {
    if (!hasActiveBooking && (activeTab === 'menu' || activeTab === 'reservation')) {
      setActiveTab('overview');
    }
  }, [hasActiveBooking, activeTab]);

  /* ── sectionId sync ── */
  useEffect(() => {
    const valid = ['overview', 'reservation', 'dashboard', 'menu', 'quiz', 'passport'];
    if (sectionId && valid.includes(sectionId)) {
      // legacy 'dashboard' → 'reservation'
      setActiveTab(sectionId === 'dashboard' ? 'reservation' : sectionId);
    }
  }, [sectionId]);

  /* ── CERTIFICATE HELPER ── */
  const getCertificateDishes = (): CertificateDish[] => {
    if (!menuSelection) return [];
    return [menuSelection.curry, menuSelection.soup, menuSelection.stirfry]
      .filter((d): d is MenuSelectionDish => Boolean(d))
      .map(d => ({
        name: d.name || 'Signature Dish',
        image: d.image || '',
        variantLabel: (() => {
          const diet = userProfile?.dietary_profile;
          if (!diet || diet === 'diet_regular') return undefined;
          const label = diet.replace('diet_', '');
          return label.charAt(0).toUpperCase() + label.slice(1) + ' Version';
        })(),
      }));
  };

  const currentSlug = HEADER_SLUGS[activeTab] || 'user-dashboard';

  // ActiveProfileProvider e' montato a livello shell in App.tsx (#87): qui si consuma soltanto.
  return (
    <PageLayout
      slug="user"
      loading={loading}
      hideDefaultHeader={true}
      customHeader={<HeaderMenu customSlug={currentSlug} />}
    >
      <div className="contents">

        {/* ── STICKY TABS ── */}
        <StickyTabNav
          items={TABS}
          value={activeTab}
          onChange={setActiveTab}
        />

        {/* ── GRID LAYOUT ── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 [gap:var(--space-fluid-l)] items-start">

          {/* ── ASIDE — 3 cols (below tabs on mobile, left on desktop) ── */}
          <aside className="lg:col-span-3 flex flex-col [gap:var(--space-fluid-l)] lg:sticky lg:top-[112px]">
            <ProfileSwitcher />
            <UserProfileCard userProfile={userProfile} activeTab={activeTab} />
            <ContextualStatsView
              activeTab={activeTab}
              activeBooking={activeBooking ?? null}
              menuSelection={menuSelection}
            />
            {activeTab === 'quiz' && (
              <TopWarriorsCard />
            )}
          </aside>

          {/* ── MAIN CONTENT — 9 cols ── */}
          <div className="lg:col-span-9 min-w-0">
            {/* Cherry how-to per la pagina corrente (preset zero-latency; render nullo se nessuna voce) */}
            <CherryHelp pageSlug={currentSlug} />
            <AnimatePresence mode="wait">
              <motion.div key={activeTab} {...TAB_ANIMATION}>

                {/* OVERVIEW */}
                {activeTab === 'overview' && (
                  <OverviewView
                    userProfile={userProfile}
                    bookings={bookingsList}
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
                    <NoBookingBanner onNavigate={onNavigate} />
                  ) : (
                    <div className="flex flex-col [gap:var(--space-fluid-l)]">
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
                      {/* F1 — il leader (owner del booking) condivide il link gruppo */}
                      <InviteGroupBlock bookingRef={activeBooking?.booking_ref ?? null} />
                      {/* F3.c — porta un visitor a questa classe (limiti via RPC) */}
                      <VisitorClassBlock bookingId={activeBooking?.internal_id ?? null} />
                    </div>
                  )
                )}

                {/* MY MENU — hidden for staff; requires a booking (same empty state as reservation) */}
                {activeTab === 'menu' && !isStaff && (
                  bookingsList.length === 0 ? (
                    <NoBookingBanner onNavigate={onNavigate} />
                  ) : (
                    <MenuManager
                      bookingId={activeBookingId}
                      bookings={bookingsList}
                      onSelectBooking={setActiveBookingId}
                      menuSelection={menuSelection}
                      onNavigate={onNavigate}
                    />
                  )
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
                    onBack={() => setActiveTab(hasActiveBooking ? 'reservation' : 'overview')}
                    onUpdate={() => {
                      refresh();
                      onProfileRefresh();
                      setTimeout(() => {
                        setActiveTab(hasActiveBooking ? 'reservation' : 'overview');
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }, 1500);
                    }}
                    isStaff={isStaff}
                    onShowCertificate={() => setShowCertificate(true)}
                  />
                )}

              </motion.div>
            </AnimatePresence>
          </div>

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
            ? t('user:morningClass')
            : t('user:eveningClass')
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
