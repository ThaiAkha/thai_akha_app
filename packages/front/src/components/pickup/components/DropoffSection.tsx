/**
 * DropoffSection
 * Shared across both transport modes.
 *
 * Layout:
 *   ── connector line ──
 *   [Do I need drop-off? / Do I need different drop-off?]  ← toggle pill
 *   ── connector line ──
 *   (when toggle ON)
 *     Self mode: info banner
 *     Label "End Location"
 *     Hotel | Other chips
 *     ── Hotel tab: HotelSearchField + outside-zone warning + pin map
 *     ── Other tab: MeetingCard list (dropoff points)
 */

import React from 'react';
import { Typography, Icon, Toggle } from '../../ui';
import { cn } from '@thaiakha/shared/lib/utils';
import HotelSearchField from './HotelSearchField';
import MeetingCard from '../MeetingCard';
import type { LocationState, TransportMode, DropoffType } from '../hooks/useLocationState';
import type { UseHotelSearchResult } from '../hooks/useHotelSearch';
import type { MeetingPoint } from '@thaiakha/shared/types';

interface DropoffSectionProps {
  transportMode: TransportMode;
  selectedClass: 'morning' | 'evening';

  isDropoffSame: boolean;
  onToggleDropoff: (needsDifferent: boolean) => void;

  dropoffType: DropoffType;
  onDropoffTypeChange: (t: DropoffType) => void;

  dropoffSearch: UseHotelSearchResult;
  onDropoffHotelSelect: (hotel: { id: string; name: string; zone_id: string | null; latitude: number; longitude: number }) => void;
  onPinDropoff: () => void;

  dropoffPoints: MeetingPoint[];
  dropoffLoc: LocationState | null;
  onDropoffLocChange: (loc: LocationState | null) => void;

  isDropoffOutsideZone: boolean;
}

const DropoffSection: React.FC<DropoffSectionProps> = ({
  transportMode,
  selectedClass,
  isDropoffSame,
  onToggleDropoff,
  dropoffType,
  onDropoffTypeChange,
  dropoffSearch,
  onDropoffHotelSelect,
  onPinDropoff,
  dropoffPoints,
  dropoffLoc,
  onDropoffLocChange,
  isDropoffOutsideZone,
}) => {
  const toggleLabel = transportMode === 'self'
    ? 'Do I need drop-off?'
    : 'Do I need different drop-off?';

  return (
    <div className="space-y-4">
      {/* Connector + toggle pill */}
      <div className="relative flex items-center justify-center py-2">
        <div className="w-px h-8 bg-white/10 absolute top-0" />
        <div className="w-px h-8 bg-white/10 absolute bottom-0" />

        <div
          onClick={() => onToggleDropoff(isDropoffSame)}
          className="relative z-10 bg-surface border border-white/20 px-4 py-2 rounded-full cursor-pointer flex items-center gap-3 hover:border-white/40 transition-all"
        >
          <span className="text-[10px] font-bold uppercase text-white/60">
            {toggleLabel}
          </span>
          <Toggle
            checked={!isDropoffSame}
            onChange={(v) => onToggleDropoff(v)}
            className="scale-75"
          />
        </div>
      </div>

      {/* Drop-off content — visible only when toggle ON */}
      {!isDropoffSame && (
        <div className="space-y-3 animate-in fade-in slide-in-from-top-2 duration-200">

          {/* Info banner — only in self mode */}
          {transportMode === 'self' && (
            <div className="flex items-start gap-2.5 bg-btn-s-500/10 border border-btn-s-500/20 rounded-xl p-3">
              <Icon name="directions_car" size="xs" className="text-btn-s-400 shrink-0 mt-0.5" />
              <Typography variant="paragraphS" as="p" className="text-white/60 leading-relaxed">
                After class we'll drop you at your hotel or preferred location — free within the city area.
              </Typography>
            </div>
          )}

          <Typography
            variant="caption"
            className="text-dropoff mb-2 block uppercase tracking-widest font-bold"
          >
            End Location
          </Typography>

          {/* Type chips: Hotel | Other */}
          <div className="flex gap-2">
            {([
              { key: 'hotel' as DropoffType, label: 'Hotel', icon: 'hotel' },
              { key: 'other' as DropoffType, label: 'Other',  icon: 'place' },
            ]).map(({ key, label, icon }) => (
              <button
                key={key}
                onClick={() => onDropoffTypeChange(key)}
                className={cn(
                  'flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border transition-all',
                  dropoffType === key
                    ? 'bg-dropoff/15 border-dropoff text-dropoff-light'
                    : 'bg-white/5 border-white/10 text-white/40 hover:border-white/20',
                )}
              >
                <Icon name={icon} size="xs" />
                {label}
              </button>
            ))}
          </div>

          {/* ── TAB: HOTEL ── */}
          {dropoffType === 'hotel' && (
            <div className="space-y-3">
              <HotelSearchField
                placeholder="Search drop-off hotel…"
                query={dropoffSearch.query}
                results={dropoffSearch.results}
                loading={dropoffSearch.loading}
                showSuggestions={dropoffSearch.showSuggestions}
                accent="yellow"
                leftIcon="flag"
                showMapPin
                onQueryChange={(q) => {
                  dropoffSearch.setQuery(q);
                  dropoffSearch.setShowSuggestions(true);
                  onDropoffLocChange(null);
                }}
                onFocus={() => dropoffSearch.setShowSuggestions(true)}
                onSelect={(h) => {
                  dropoffSearch.setQuery(h.name);
                  dropoffSearch.setShowSuggestions(false);
                  onDropoffHotelSelect(h);
                }}
                onPinMap={onPinDropoff}
              />

              {/* Extra cost warning */}
              {isDropoffOutsideZone && dropoffLoc && (
                <div className="flex items-start gap-2.5 bg-btn-p-500/10 border border-btn-p-500/30 rounded-xl p-3 animate-in fade-in slide-in-from-top-1 duration-200">
                  <Icon name="payments" size="xs" className="text-btn-p-400 shrink-0 mt-0.5" />
                  <div className="space-y-0.5">
                    <Typography variant="microLabel" as="div" className="text-btn-p-300 uppercase tracking-widest">
                      Extra cost — outside free area
                    </Typography>
                    <Typography variant="paragraphS" as="p" className="text-white/60 leading-relaxed">
                      This location is outside our complimentary drop-off zone. We can arrange the service — the extra charge is paid directly to your driver after class.
                    </Typography>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ── TAB: OTHER ── */}
          {dropoffType === 'other' && (
            <div className="space-y-2">
              {dropoffPoints.map((mp) => {
                const isSelected = dropoffLoc?.name === mp.name;
                const icon = mp.id.includes('airport') ? 'flight'
                           : mp.id.includes('train')   ? 'train'
                           : 'storefront';

                return (
                  <MeetingCard
                    key={mp.id}
                    mp={mp}
                    isSelected={isSelected}
                    selectedClass={selectedClass}
                    theme="yellow"
                    iconName={icon}
                    descriptionOverride={mp.dropoff_description ?? mp.description}
                    onSelect={() =>
                      onDropoffLocChange({
                        type: 'meeting_point',
                        name: mp.name,
                        lat: mp.latitude,
                        lng: mp.longitude,
                        zoneId: mp.id,
                      })
                    }
                  />
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default DropoffSection;
