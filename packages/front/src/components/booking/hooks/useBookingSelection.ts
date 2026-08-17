/**
 * useBookingSelection
 * Manages the date / session / pax / visitors selection state.
 *
 * Responsibilities:
 *   - selectedDate, viewDate, session, pax, visitors state
 *   - dateOptions (±1 day scroll window around viewDate)
 *   - currentStats derived from dailyStats
 *   - maxSelectable / maxVisitorsAllowed computed values
 *   - Clamp effects (pax ≤ remaining, visitors ≤ maxAllowed)
 *   - Visitor reset on session change
 *   - handleDateSelect, handleSessionSelect, handleConfirmSelection
 */

import { useState, useEffect, useMemo } from 'react';
import { t, tObj } from '../../../i18n';
import type {
  DailyAvailability,
  SessionInfo,
  SessionKey,
  ViewStep,
} from '../booking.types';
import type { UserProfile } from '../../../services/auth.service';

export interface UseBookingSelectionResult {
  // State
  selectedDate:   Date | null;
  viewDate:       Date;
  session:        SessionKey | null;
  pax:            number;
  visitors:       number;

  // Setters (needed by BookingPage for reset flows)
  setSelectedDate: (d: Date | null) => void;
  setSession:      (s: SessionKey | null) => void;
  setPax:          (p: number) => void;
  setVisitors:     (v: number) => void;

  // Derived
  dateOptions:        Date[];
  currentStats:       DailyAvailability;
  maxSelectable:      number;
  maxVisitorsAllowed: number;
  isPaxSelected:      boolean;
  selectedDateStr:    string;
  formattedDateStr:   string;
  shortDateStr:       string;

  // Handlers
  handleDateSelect:         (d: Date) => void;
  handleSessionSelect:      (s: SessionKey) => void;
  handleConfirmSelection:   (
    userProfile: UserProfile | null,
    sessionConfig: Record<string, SessionInfo>,
    setViewStep: (s: ViewStep) => void,
  ) => void;
}

/** Timezone-safe date → YYYY-MM-DD */
function toDateStr(d: Date): string {
  const offset = d.getTimezoneOffset() * 60_000;
  return new Date(d.getTime() - offset).toISOString().split('T')[0];
}

const EMPTY_STATUS = { status: 'OPEN' as const, remaining: 0, totalVisitors: 0 };
const EMPTY_DAILY: DailyAvailability = {
  morning_class: EMPTY_STATUS,
  evening_class: EMPTY_STATUS,
};

export function useBookingSelection(
  dailyStats: Record<string, DailyAvailability>,
  sessionConfig: Record<string, SessionInfo>,
): UseBookingSelectionResult {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [viewDate,     setViewDate]     = useState<Date>(new Date());
  const [session,      setSession]      = useState<SessionKey | null>(null);
  const [pax,          setPax]          = useState(0);
  const [visitors,     setVisitors]     = useState(0);

  // ── Date scroll window (prev / current / next) ────────────────────────────
  const dateOptions = useMemo<Date[]>(() => {
    const base = new Date(viewDate);
    base.setHours(12, 0, 0, 0);
    return [-1, 0, 1].map(i => {
      const d = new Date(base);
      d.setDate(base.getDate() + i);
      return d;
    });
  }, [viewDate]);

  // ── Current date string ───────────────────────────────────────────────────
  const selectedDateStr = useMemo(
    () => (selectedDate ? toDateStr(selectedDate) : ''),
    [selectedDate],
  );

  // ── Availability for selected date ────────────────────────────────────────
  const currentStats = useMemo<DailyAvailability>(() => {
    if (selectedDate && dailyStats[selectedDateStr]) return dailyStats[selectedDateStr];
    // Fallback: remaining=0 until DB responds (no hardcoded capacity)
    return Object.keys(sessionConfig).reduce<DailyAvailability>(
      (acc, key) => ({ ...acc, [key]: EMPTY_STATUS }),
      { ...EMPTY_DAILY },
    );
  }, [selectedDate, dailyStats, selectedDateStr, sessionConfig]);

  const maxSelectable      = session ? (currentStats[session]?.remaining ?? 0) : 0;
  const currentTotalVisitors = session ? (currentStats[session]?.totalVisitors ?? 0) : 0;
  const maxVisitorsAllowed = pax > 0 ? Math.min(pax, 2, 4 - currentTotalVisitors) : 0;
  const isPaxSelected      = pax > 0;

  // ── Clamp effects ─────────────────────────────────────────────────────────
  useEffect(() => {
    if (pax > maxSelectable) setPax(Math.max(0, maxSelectable));
  }, [maxSelectable]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (visitors > maxVisitorsAllowed) setVisitors(Math.max(0, maxVisitorsAllowed));
  }, [pax, maxVisitorsAllowed]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => { setVisitors(0); }, [session]);

  // ── Formatted date strings ────────────────────────────────────────────────
  const formattedDateStr = useMemo(() => {
    if (!selectedDate) return '';
    return selectedDate.toLocaleDateString('en-US', {
      weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
    });
  }, [selectedDate]);

  const shortDateStr = useMemo(() => {
    if (!selectedDate) return '';
    return `${selectedDate.getDate()} ${tObj('common:monthsShort')[selectedDate.getMonth()]}`;
  }, [selectedDate]);

  // ── Handlers ──────────────────────────────────────────────────────────────
  const handleDateSelect = (d: Date) => {
    setSelectedDate(d);
    setViewDate(d);
    setSession(null);
    setPax(0);
    setVisitors(0);
    setTimeout(() => {
      document.getElementById('step-class')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 100);
  };

  const handleSessionSelect = (s: SessionKey) => {
    const stats = currentStats[s];
    if (stats.status !== 'OPEN') {
      alert(t('booking:classUnavailable', {
        status: stats.status === 'FULL' ? t('booking:classFull') : String(t('booking:closed')).toLowerCase(),
      }));
      return;
    }
    setSession(s);
    setTimeout(() => {
      document.getElementById('step-pax')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 100);
  };

  const handleConfirmSelection = (
    userProfile: UserProfile | null,
    _sessionConfig: Record<string, SessionInfo>,
    setViewStep: (s: ViewStep) => void,
  ) => {
    if (!session || !isPaxSelected) return;
    const stats = currentStats[session];

    if (stats.status !== 'OPEN' || stats.remaining < pax) {
      alert(t('booking:availabilityChanged', { count: stats.remaining }));
      return;
    }

    const isActualUser = userProfile && userProfile.role !== 'guest_virtual';
    setViewStep(isActualUser ? 'form' : 'auth');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return {
    selectedDate, viewDate, session, pax, visitors,
    setSelectedDate, setSession, setPax, setVisitors,
    dateOptions, currentStats,
    maxSelectable, maxVisitorsAllowed, isPaxSelected,
    selectedDateStr, formattedDateStr, shortDateStr,
    handleDateSelect, handleSessionSelect, handleConfirmSelection,
  };
}
