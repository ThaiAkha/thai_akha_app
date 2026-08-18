/**
 * PickupSection
 * "I Need Pickup" content area.
 *
 * Three sub-tabs (chips): Hotel | Airport | Train Station
 *   Hotel   → HotelSearchField + ZoneCard (B2) + OutsideZonePanel (B3)
 *   Airport → MeetingCard list (airport gates, action theme)
 *   Train   → MeetingCard (train station, action theme)
 */

import React from 'react';
import { Typography, Icon } from '../../ui';
import { cn } from '@thaiakha/shared/lib/utils';
import HotelSearchField from './HotelSearchField';
import ZoneCard from './ZoneCard';
import OutsideZonePanel from './OutsideZonePanel';
import MeetingCard from '../MeetingCard';
import type { LocationState, PickupType } from '../hooks/useLocationState';
import type { UseHotelSearchResult } from '../hooks/useHotelSearch';
import type { UseMeetingPointsResult } from '../hooks/useMeetingPoints';
import type { PickupZone } from '@thaiakha/shared/types';

interface PickupSectionProps {
  selectedClass: 'morning' | 'evening';
  pickupType: PickupType;
  onPickupTypeChange: (t: PickupType) => void;

  // hotel search
  hotelSearch: UseHotelSearchResult;
  onHotelSelect: (hotel: { id: string; name: string; zone_id: string | null; latitude: number; longitude: number }) => void;
  onPinMap: () => void;

  // meeting points
  meetingData: UseMeetingPointsResult;

  // current selection
  pickupLoc: LocationState | null;
  onPickupLocChange: (loc: LocationState | null) => void;

  // zone data
  selectedZoneData: (PickupZone & { color_code?: string | null; morning_pickup_end?: string | null; evening_pickup_end?: string | null }) | null;
  isOutsideZone: boolean;
  outsideHotelCoords: { lat: number; lng: number } | null;
}

const PICKUP_TYPE_CHIPS: { key: PickupType; label: string; icon: string }[] = [
  { key: 'hotel',   label: 'Hotel',         icon: 'hotel' },
  { key: 'airport', label: 'Airport',        icon: 'flight' },
  { key: 'train',   label: 'Train Station',  icon: 'train' },
];

const PickupSection: React.FC<PickupSectionProps> = ({
  selectedClass,
  pickupType,
  onPickupTypeChange,
  hotelSearch,
  onHotelSelect,
  onPinMap,
  meetingData,
  pickupLoc,
  onPickupLocChange,
  selectedZoneData,
  isOutsideZone,
  outsideHotelCoords,
}) => (
  <div className="space-y-3">
    <Typography
      variant="caption"
      className="text-action mb-2 block uppercase tracking-widest font-bold"
    >
      Start Location
    </Typography>

    {/* Pickup type chip selector */}
    <div className="flex gap-2 flex-wrap">
      {PICKUP_TYPE_CHIPS.map(({ key, label, icon }) => (
        <button
          key={key}
          onClick={() => onPickupTypeChange(key)}
          className={cn(
            'flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border transition-all',
            pickupType === key
              ? 'bg-action/15 border-action text-action'
              : 'bg-white/5 border-white/10 text-white/40 hover:border-white/20',
          )}
        >
          <Icon name={icon} size="xs" />
          {label}
        </button>
      ))}
    </div>

    {/* ── TAB: HOTEL ── */}
    {pickupType === 'hotel' && (
      <div className="space-y-3">
        <HotelSearchField
          placeholder="Search your hotel…"
          query={hotelSearch.query}
          results={hotelSearch.results}
          loading={hotelSearch.loading}
          showSuggestions={hotelSearch.showSuggestions}
          accent="action"
          leftIcon="search"
          showMapPin
          onQueryChange={(q) => {
            hotelSearch.setQuery(q);
            hotelSearch.setShowSuggestions(true);
            // reset pickup loc while typing
            onPickupLocChange(null);
          }}
          onFocus={() => hotelSearch.setShowSuggestions(true)}
          onSelect={(h) => {
            hotelSearch.setQuery(h.name);
            hotelSearch.setShowSuggestions(false);
            onHotelSelect(h);
          }}
          onPinMap={onPinMap}
        />

        {/* B2 — In-zone hotel: show pickup time window */}
        {pickupLoc && selectedZoneData && !isOutsideZone && (
          <ZoneCard zone={selectedZoneData} selectedClass={selectedClass} />
        )}

        {/* B3 — Outside-zone hotel: show nearest meeting points */}
        {pickupLoc && isOutsideZone && (
          <OutsideZonePanel
            points={meetingData.outsideZonePoints}
            selectedClass={selectedClass}
            selectedId={pickupLoc?.zoneId}
            hasCoords={!!outsideHotelCoords}
            onSelect={onPickupLocChange}
          />
        )}
      </div>
    )}

    {/* ── TAB: AIRPORT ── */}
    {pickupType === 'airport' && (
      <div className="space-y-2">
        {meetingData.airportPoints.map((mp) => (
          <MeetingCard
            key={mp.id}
            mp={mp}
            isSelected={pickupLoc?.zoneId === mp.id}
            selectedClass={selectedClass}
            theme="action"
            iconName="flight"
            onSelect={() =>
              onPickupLocChange({
                type: 'meeting_point',
                name: mp.name,
                lat: mp.latitude,
                lng: mp.longitude,
                zoneId: mp.id,
              })
            }
          />
        ))}
        {meetingData.airportPoints.length === 0 && (
          <Typography variant="body" as="div" className="text-center text-white/40 py-6">
            No airport pickup points available.
          </Typography>
        )}
      </div>
    )}

    {/* ── TAB: TRAIN ── */}
    {pickupType === 'train' && (
      <div className="space-y-2">
        {meetingData.trainPoints.map((mp) => (
          <MeetingCard
            key={mp.id}
            mp={mp}
            isSelected={pickupLoc?.zoneId === mp.id}
            selectedClass={selectedClass}
            theme="action"
            iconName="train"
            onSelect={() =>
              onPickupLocChange({
                type: 'meeting_point',
                name: mp.name,
                lat: mp.latitude,
                lng: mp.longitude,
                zoneId: mp.id,
              })
            }
          />
        ))}
        {meetingData.trainPoints.length === 0 && (
          <Typography variant="body" as="div" className="text-center text-white/40 py-6">
            No train station pickup available.
          </Typography>
        )}
      </div>
    )}
  </div>
);

export default PickupSection;
