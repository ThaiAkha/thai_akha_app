/**
 * PickUpPage — Orchestrator (~250 lines)
 *
 * All logic lives in hooks under components/pickup/hooks/
 * All UI lives in components under components/pickup/components/
 *
 * This file wires them together:
 *   - reads bookingId from localStorage (edit mode)
 *   - computes derived state (selectedZoneData, isOutsideZone, …)
 *   - handles confirm (new booking → localStorage draft | edit → Supabase update)
 *   - renders the map background + sidebar
 */

import React, { useEffect, useMemo, useState } from 'react';
import { supabase } from '@thaiakha/shared/lib/supabase';
import { GEOJSON_MASTER } from '@thaiakha/shared/data';
import { PageLayout } from '../components/layout/PageLayout';
import { Typography, Badge } from '../components/ui';
import { cn } from '@thaiakha/shared/lib/utils';
import { t } from '@thaiakha/shared/lib/ui-strings';

import { isPointInPolygon } from '@thaiakha/shared/lib/geoUtils';
import {
  PickupMapBackground,
  SessionSelector,
  TransportModeSelector,
  PickupSection,
  WalkInSection,
  DropoffSection,
  ConfirmFooter,
  useLocationState,
  useZones,
  useMeetingPoints,
  useHotelSearch,
  useBookingLoader,
} from '../components/pickup';

// ─── Component ────────────────────────────────────────────────────────────────

const PickUpPage: React.FC<{ onNavigate: (page: string) => void }> = ({ onNavigate }) => {
  // ── Edit mode ──────────────────────────────────────────────────────────────
  const bookingId = localStorage.getItem('current_booking_id');
  const isEditMode = !!bookingId;

  // ── Core location state ────────────────────────────────────────────────────
  const loc = useLocationState();

  // ── Pickup type chip (Hotel | Airport | Train) ─────────────────────────────
  const [pickupType, setPickupType] = useState<'hotel' | 'airport' | 'train'>('hotel');

  // ── Map interaction ────────────────────────────────────────────────────────
  const [isPinningMode, setIsPinningMode] = useState(false);

  // ── Save state ─────────────────────────────────────────────────────────────
  const [saving, setSaving] = useState(false);

  // ── Hotel search (pickup) ──────────────────────────────────────────────────
  const pickupSearch = useHotelSearch(loc.transportMode === 'pickup' && pickupType === 'hotel');
  // ── Hotel search (dropoff) ─────────────────────────────────────────────────
  const dropoffSearch = useHotelSearch(!loc.isDropoffSame && loc.dropoffType === 'hotel');

  // ── Booking date (nota solo in edit mode) — filtra i drop-off per giorno ──
  const [bookingDate, setBookingDate] = useState<string | null>(null);

  // ── Zone + meeting-point data ──────────────────────────────────────────────
  const { zones, loading: zonesLoading } = useZones();
  const meetingData = useMeetingPoints({
    selectedClass: loc.selectedClass,
    outsideHotelCoords: loc.outsideHotelCoords,
    bookingDate,
  });

  const loading = zonesLoading || meetingData.loading;

  // ── Restore existing booking (edit mode) ──────────────────────────────────
  const [bookingLoaded, setBookingLoaded] = useState(!isEditMode);
  useBookingLoader({
    bookingId,
    state: loc,
    setPickupSearchQuery: pickupSearch.setQuery,
    onLoaded: () => setBookingLoaded(true),
    onBookingDate: setBookingDate,
  });

  // ── Derived: zone for selected hotel ──────────────────────────────────────
  const selectedZoneData = useMemo(() => {
    if (!loc.pickupLoc?.zoneId || loc.isOutsideZone) return null;
    return zones[loc.pickupLoc.zoneId] ?? null;
  }, [loc.pickupLoc, zones, loc.isOutsideZone]);

  // ── Handler: hotel selected from pickup dropdown ───────────────────────────
  const handlePickupHotelSelect = (h: { id: string; name: string; zone_id: string | null; latitude: number; longitude: number }) => {
    const isOutside = !h.zone_id || h.zone_id === 'outside' || h.zone_id === 'walk-in';
    loc.setPickupLoc({
      type: 'db_hotel',
      name: h.name,
      lat: h.latitude,
      lng: h.longitude,
      zoneId: h.zone_id ?? undefined,
    });
    loc.setOutsideZoneMode(isOutside);
    loc.setOutsideHotelCoords(isOutside ? { lat: h.latitude, lng: h.longitude } : null);
  };

  // ── Handler: hotel selected from dropoff dropdown ──────────────────────────
  const handleDropoffHotelSelect = (h: { id: string; name: string; zone_id: string | null; latitude: number; longitude: number }) => {
    const isOutside = !h.zone_id || h.zone_id === 'outside' || h.zone_id === 'walk-in';
    loc.setDropoffLoc({
      type: 'db_hotel',
      name: h.name,
      lat: h.latitude,
      lng: h.longitude,
      zoneId: h.zone_id ?? undefined,
    });
    loc.setIsDropoffOutsideZone(isOutside);
  };

  // ── Cherry deep-link: pagina aperta dalla chat con un hotel da auto-cercare ─
  // Cherry rimanda qui (azione nav_pickup_hotel) lanciando 'cherry-pickup-search'.
  // Auto-riempiamo la ricerca e, all'arrivo dei risultati, auto-selezioniamo
  // l'hotel (l'ambiguità è già risolta a monte da Cherry). L'utente vede l'hotel
  // selezionato sulla mappa con zona/orario.
  const [pendingCherryHotel, setPendingCherryHotel] = useState<string | null>(null);

  useEffect(() => {
    const triggerHotel = (hotel?: string) => {
      if (!hotel) return;
      setPickupType('hotel');
      setPendingCherryHotel(String(hotel).toLowerCase());
      pickupSearch.setQuery(String(hotel));
    };
    // 1) Aperta dalla chat: l'hotel è in sessionStorage (sopravvive al lazy-mount).
    try {
      const stored = sessionStorage.getItem('cherry_pickup_hotel');
      if (stored) { sessionStorage.removeItem('cherry_pickup_hotel'); triggerHotel(stored); }
    } catch { /* noop */ }
    // 2) Pagina già montata: evento diretto.
    const onCherrySearch = (e: Event) => triggerHotel((e as CustomEvent).detail?.hotel);
    window.addEventListener('cherry-pickup-search', onCherrySearch);
    return () => window.removeEventListener('cherry-pickup-search', onCherrySearch);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!pendingCherryHotel || pickupSearch.results.length === 0) return;
    const exact = pickupSearch.results.find((h) => h.name.toLowerCase() === pendingCherryHotel);
    handlePickupHotelSelect(exact ?? pickupSearch.results[0]);
    setPendingCherryHotel(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pickupSearch.results, pendingCherryHotel]);

  // ── Handler: map click (manual pin) ───────────────────────────────────────
  const handleMapClick = (coords: { lat: number; lng: number }) => {
    if (!isPinningMode) return;
    const zoneId = Object.keys(zones).find(id => {
      const z = zones[id];
      if (!z.coords) return false;
      return isPointInPolygon(coords, z.coords);
    });
    const newLoc = { type: 'custom_pin' as const, name: '', lat: coords.lat, lng: coords.lng, zoneId, isUnknown: true };
    if (loc.activeField === 'pickup') loc.setPickupLoc(newLoc);
    else { loc.setDropoffLoc(newLoc); loc.setIsDropoffSame(false); }
    setIsPinningMode(false);
  };

  // ── Handler: confirm / update ──────────────────────────────────────────────
  const handleConfirm = async () => {
    if (!loc.pickupLoc) return;
    if (loc.transportMode === 'pickup' && loc.pickupLoc.type === 'custom_pin' && !loc.pickupLoc.name.trim()) {
      alert(t.location.enterPickupName);
      return;
    }
    const finalDropoff = loc.isDropoffSame ? loc.pickupLoc : loc.dropoffLoc;
    if (!loc.isDropoffSame && !finalDropoff) {
      alert(t.location.selectDropoff);
      return;
    }

    setSaving(true);
    try {
      // Compute pickup time
      let pickupTime = '08:50:00';
      if (loc.transportMode === 'pickup' && loc.pickupLoc.zoneId && zones[loc.pickupLoc.zoneId]) {
        const z = zones[loc.pickupLoc.zoneId];
        pickupTime = loc.selectedClass === 'morning' ? z.morning_pickup_time : (z.evening_pickup_time ?? '16:50:00');
      } else if (loc.transportMode === 'self') {
        const mp = meetingData.meetingPoints.find(m => m.id === loc.pickupLoc!.zoneId || m.name === loc.pickupLoc!.name);
        if (mp) {
          pickupTime = loc.selectedClass === 'morning'
            ? (mp.morning_pickup_time ?? '08:50:00')
            : (mp.evening_pickup_time ?? '16:50:00');
        }
      }

      const payload = {
        hotel_name:      loc.pickupLoc.name,
        pickup_zone:     loc.transportMode === 'self' ? 'walk-in' : (loc.pickupLoc.zoneId ?? 'outside'),
        pickup_lat:      loc.pickupLoc.lat,
        pickup_lng:      loc.pickupLoc.lng,
        pickup_time:     pickupTime,
        requires_dropoff: !loc.isDropoffSame && !!loc.dropoffLoc,
        dropoff_hotel:   !loc.isDropoffSame ? finalDropoff?.name : null,
        dropoff_zone:    !loc.isDropoffSame ? finalDropoff?.zoneId : null,
        dropoff_lat:     !loc.isDropoffSame ? finalDropoff?.lat : null,
        dropoff_lng:     !loc.isDropoffSame ? finalDropoff?.lng : null,
        customer_note:   loc.pickupLoc.isUnknown ? `Manual Pin: ${loc.pickupLoc.name}` : undefined,
      };

      if (isEditMode) {
        await supabase.from('bookings').update(payload).eq('internal_id', bookingId);
        localStorage.removeItem('current_booking_id');
        onNavigate('user');
      } else {
        localStorage.setItem('pickup_draft_data', JSON.stringify(payload));
        onNavigate('booking');
      }
    } catch (e) {
      console.error(e);
      alert(t.errors.generic);
    } finally {
      setSaving(false);
    }
  };

  // ── Pickup type change: reset location + search ────────────────────────────
  const handlePickupTypeChange = (type: 'hotel' | 'airport' | 'train') => {
    setPickupType(type);
    loc.resetPickupType(type);
    pickupSearch.clear();
    // #8 — chi arriva in aereo/treno poi va in hotel: apri il drop-off di default.
    // Passando tra airport↔train resta aperto (ogni selezione lo riapre); resta
    // richiudibile a mano. Il drop-off NON viene resettato da resetPickupType.
    if (type === 'airport' || type === 'train') loc.setIsDropoffSame(false);
  };

  // ── Transport mode change: reset everything ────────────────────────────────
  const handleTransportModeChange = (mode: 'pickup' | 'self') => {
    setPickupType('hotel');
    pickupSearch.clear();
    dropoffSearch.clear();
    loc.resetForTransportMode(mode);
  };

  // ── Dropoff toggle ─────────────────────────────────────────────────────────
  const handleDropoffToggle = (needsDifferent: boolean) => {
    loc.setIsDropoffSame(!needsDifferent);
    if (!needsDifferent) {
      dropoffSearch.clear();
      loc.resetDropoff();
    }
  };

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <PageLayout slug="free-pickup-location-chiang-mai" hideDefaultHeader={true} loading={loading || !bookingLoaded} isFullScreen={true}>
      {/* SEO (title/meta/og/json-ld): interamente di SEOHead via site_metadata —
          il nodo LocalBusiness è già rigenerato da business_profile nel seo.service. */}
      <h1 className="sr-only">Free Hotel Pickup – Chiang Mai Cooking Classes</h1>

      <div className="relative w-full h-[100dvh] flex flex-col lg:block bg-black overflow-hidden">

        {/* ── Map (z-0) ──────────────────────────────────────────────────────── */}
        <div className="absolute inset-0 z-0">
          <PickupMapBackground
            geoJsonData={GEOJSON_MASTER}
            selectedLocation={loc.pickupLoc}
            secondaryLocation={!loc.isDropoffSame && loc.dropoffLoc
              ? { lat: loc.dropoffLoc.lat, lng: loc.dropoffLoc.lng }
              : null}
            onMapClick={handleMapClick}
            selectionMode={true}
            meetingPointsOverlay={loc.isOutsideZone ? meetingData.outsideZonePoints : undefined}
            selectedMeetingPointId={loc.isOutsideZone ? (loc.pickupLoc?.zoneId ?? null) : null}
          />
        </div>

        {/* ── Sidebar (z-10) ─────────────────────────────────────────────────── */}
        <div className={cn(
          'relative z-10 flex flex-col shadow-2xl transition-all duration-700 ease-cinematic',
          'bg-surface-overlay/95 backdrop-blur-xl border-t lg:border border-white/10',
          'w-full h-[75vh] mt-auto rounded-t-[3rem]',
          'lg:absolute lg:left-8 lg:top-8 lg:bottom-8 lg:w-[480px] lg:h-auto lg:rounded-[3rem] lg:mt-0',
        )}>

          {/* Header */}
          <div className="px-6 pt-5 pb-4 md:px-8 md:pt-6 shrink-0 space-y-4">
            <div className="text-center space-y-1">
              <Typography variant="h4" className="italic uppercase text-white leading-none">
                Pickup <span className="text-primary">Location</span>
              </Typography>
              {isEditMode && (
                <Badge variant="mineral" className="text-yellow-500 border-yellow-500/30">
                  {t.location.editMode}
                </Badge>
              )}
            </div>

            <SessionSelector value={loc.selectedClass} onChange={loc.setSelectedClass} />
            <TransportModeSelector value={loc.transportMode} onChange={handleTransportModeChange} />
          </div>

          {/* Scrollable content */}
          <div className="flex-1 overflow-y-auto px-6 md:px-8 space-y-6 custom-scrollbar pb-6">

            {/* Pickup mode */}
            {loc.transportMode === 'pickup' && (
              <PickupSection
                selectedClass={loc.selectedClass}
                pickupType={pickupType}
                onPickupTypeChange={handlePickupTypeChange}
                hotelSearch={pickupSearch}
                onHotelSelect={handlePickupHotelSelect}
                onPinMap={() => { loc.setActiveField('pickup'); setIsPinningMode(true); }}
                meetingData={meetingData}
                pickupLoc={loc.pickupLoc}
                onPickupLocChange={loc.setPickupLoc}
                selectedZoneData={selectedZoneData}
                isOutsideZone={loc.isOutsideZone}
                outsideHotelCoords={loc.outsideHotelCoords}
              />
            )}

            {/* Walk-in mode */}
            {loc.transportMode === 'self' && (
              <WalkInSection
                points={meetingData.walkInPoints}
                selectedClass={loc.selectedClass}
                pickupLoc={loc.pickupLoc}
                onSelect={loc.setPickupLoc}
              />
            )}

            {/* Drop-off section — shown once a pickup/walk-in is chosen */}
            {loc.pickupLoc && (
              <DropoffSection
                transportMode={loc.transportMode}
                selectedClass={loc.selectedClass}
                isDropoffSame={loc.isDropoffSame}
                onToggleDropoff={handleDropoffToggle}
                dropoffType={loc.dropoffType}
                onDropoffTypeChange={(type) => {
                  loc.setDropoffType(type);
                  loc.setDropoffLoc(null);
                  dropoffSearch.clear();
                  loc.setIsDropoffOutsideZone(false);
                }}
                dropoffSearch={dropoffSearch}
                onDropoffHotelSelect={handleDropoffHotelSelect}
                onPinDropoff={() => { loc.setActiveField('dropoff'); setIsPinningMode(true); }}
                dropoffPoints={meetingData.dropoffPoints}
                dropoffLoc={loc.dropoffLoc}
                onDropoffLocChange={loc.setDropoffLoc}
                isDropoffOutsideZone={loc.isDropoffOutsideZone}
              />
            )}
          </div>

          {/* Footer */}
          <ConfirmFooter
            isEditMode={isEditMode}
            disabled={!loc.pickupLoc}
            isLoading={saving}
            onConfirm={handleConfirm}
          />
        </div>
      </div>
    </PageLayout>
  );
};

export default PickUpPage;
