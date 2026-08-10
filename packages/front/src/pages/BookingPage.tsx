/**
 * BookingPage — orchestrator (~130 lines)
 *
 * Was 550 lines. Now delegates to:
 *   useSessionConfig    — fetches class config from DB
 *   useAvailability     — fetches daily availability for the scroll window
 *   useBookingSelection — date / session / pax / visitors state + handlers
 *   useBookingForm      — formData / authMode / paymentMethod + profile sync
 *   useBookingSubmit    — handleSubmit + handleStandaloneLogin (unified payload)
 *
 * Still owns:
 *   - viewStep + showCalendarModal (page-level nav state)
 *   - finalPrice derivation
 *   - proxyDailyStats bridge (one-render lag between useAvailability → useBookingSelection)
 *   - PageLayout + CalendarView modal
 */

import React, { useState, useEffect } from 'react';
import { PageLayout } from '../components/layout/PageLayout';
import HeaderMenu from '../components/layout/HeaderMenu';
import { Modal, Typography, Button, Icon } from '../components/ui/index';
import type { UserProfile } from '../services/auth.service';
import { BOOKING_ONLINE_PAUSED, BOOKING_PAUSED_REDIRECT_URL } from '../config/booking';

import {
  useSessionConfig,
  useAvailability,
  useBookingSelection,
  useBookingForm,
  useBookingSubmit,
  BookingSelection,
  BookingCheckout,
  BookingStickyFooter,
  CalendarView,
} from '../components/booking/index';
import type { DailyAvailability, ViewStep } from '../components/booking/index';

interface BookingPageProps {
  onNavigate:    (page: string, topic?: string, sectionId?: string) => void;
  userProfile:   UserProfile | null;
  onAuthSuccess: () => void;
}

const BookingPage: React.FC<BookingPageProps> = ({ onNavigate, userProfile, onAuthSuccess }) => {
  // ── Page-level nav state ──────────────────────────────────────────────────
  const [viewStep, setViewStep]               = useState<ViewStep>('selection');
  const [showCalendarModal, setShowCalendarModal] = useState(false);

  // ── Data hooks ─────────────────────────────────────────────────────────────
  const { sessionConfig, loading: configLoading } = useSessionConfig();

  // proxyDailyStats bridges the circular dependency between dateOptions (from
  // useBookingSelection) and dailyStats (from useAvailability).  After the first
  // availability fetch the proxy is filled and useBookingSelection gets live data
  // on the very next render — a one-render lag that is imperceptible to the user.
  const [proxyDailyStats, setProxyDailyStats] = useState<Record<string, DailyAvailability>>({});

  const {
    selectedDate, session, pax, visitors,
    dateOptions, currentStats,
    maxSelectable, maxVisitorsAllowed, isPaxSelected,
    formattedDateStr, shortDateStr,
    handleDateSelect, handleSessionSelect, handleConfirmSelection,
    setPax, setVisitors,
  } = useBookingSelection(proxyDailyStats, sessionConfig);

  const { dailyStats } = useAvailability(dateOptions, sessionConfig);

  // Forward fetched availability back into useBookingSelection (terminates
  // once data is stable — no infinite loop because dateOptions won't change).
  useEffect(() => {
    if (Object.keys(dailyStats).length > 0) setProxyDailyStats(dailyStats);
  }, [dailyStats]);

  // ── Form + submit hooks ───────────────────────────────────────────────────
  const {
    formData, setFormData,
    authMode, setAuthMode,
    paymentMethod, setPaymentMethod,
  } = useBookingForm(userProfile);

  // Skip auth step for already-logged-in users — but ONLY when on 'auth', never
  // from 'selection' (that would blank the page before they pick a date/session).
  useEffect(() => {
    const isActualUser = userProfile && userProfile.role !== 'guest_virtual';
    if (isActualUser && viewStep === 'auth') setViewStep('form');
  }, [userProfile]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Derived price ─────────────────────────────────────────────────────────
  const finalPrice =
    (session && sessionConfig[session] ? sessionConfig[session].basePrice : 0) * pax;

  const { loading: submitLoading, handleSubmit, handleStandaloneLogin } = useBookingSubmit(
    session, selectedDate, pax, visitors, finalPrice,
    formData, paymentMethod, authMode, userProfile,
    onAuthSuccess, onNavigate,
  );

  // ── Wrapped confirm (injects page-level dependencies) ────────────────────
  const onConfirmSelection = () =>
    handleConfirmSelection(userProfile, sessionConfig, setViewStep);

  return (
    <PageLayout
      slug="book-cooking-class-chiang-mai"
      loading={configLoading}
      showPatterns={true}
      hideDefaultHeader={true}
      customHeader={<HeaderMenu customSlug="book-cooking-class-chiang-mai" />}
    >
      {BOOKING_ONLINE_PAUSED ? (
        /* Nuova pagina booking in costruzione: niente selezione/checkout, rimando al sito attivo */
        <div className="w-full max-w-xl mx-auto flex flex-col items-center text-center [padding-block:var(--space-fluid-2xl)] [padding-inline:var(--space-fluid-m)] [gap:var(--space-fluid-m)]">
          <div className="w-16 h-16 rounded-2xl bg-surface-2 flex items-center justify-center">
            <Icon name="construction" size="lg" className="text-muted" />
          </div>
          <Typography variant="h3" color="title">This page is under construction</Typography>
          <Typography variant="paragraphM" color="muted" className="max-w-md leading-relaxed">
            We're building a brand-new booking experience. In the meantime, you can book your cooking
            class in Chiang Mai on our active site - it only takes a minute.
          </Typography>
          <Button
            as="a"
            href={BOOKING_PAUSED_REDIRECT_URL}
            target="_blank"
            rel="noopener noreferrer"
            variant="brand"
            size="lg"
            className="[margin-top:var(--space-fluid-s)]"
          >
            Go to booking
          </Button>
        </div>
      ) : (
      <>
      <div className="w-full max-w-5xl mx-auto flex flex-col [padding-bottom:12rem]">
        <div className="w-full flex flex-col [gap:var(--space-fluid-2xl)] [padding-bottom:var(--space-fluid-xl)] md:[padding-top:var(--space-fluid-s)] [padding-inline:var(--space-fluid-m)] md:[padding-inline:0]">

          {/* STEP 1 — Date / Session / Pax selection */}
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

          {/* STEP 2 — Auth → Form → Payment */}
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
            handleStandaloneLogin={handleStandaloneLogin}
            loading={submitLoading}
            loggedInUserId={null}
          />
        </div>

        {/* Sticky confirm footer */}
        <BookingStickyFooter
          viewStep={viewStep}
          selectedDate={selectedDate}
          session={session}
          shortDateStr={shortDateStr}
          pax={pax}
          visitors={visitors}
          finalPrice={finalPrice}
          handleConfirmSelection={onConfirmSelection}
        />
      </div>

      {/* Full-screen calendar modal */}
      <Modal
        isOpen={showCalendarModal}
        onClose={() => setShowCalendarModal(false)}
        title=""
        size="xl"
        className="p-0 overflow-hidden bg-surface-elevated border-border w-full max-w-[85rem]"
        hideCloseButton={true}
      >
        <CalendarView
          currentDate={selectedDate}
          onSelectDate={(date) => { handleDateSelect(date); setShowCalendarModal(false); }}
          onClose={() => setShowCalendarModal(false)}
        />
      </Modal>
      </>
      )}
    </PageLayout>
  );
};

export default BookingPage;
