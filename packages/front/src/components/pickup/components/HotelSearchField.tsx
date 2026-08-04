/**
 * HotelSearchField
 * Reusable hotel search input with server-side suggestions dropdown.
 * Used for both pickup and drop-off fields.
 *
 * accent — 'action' (lime) for pickup, 'yellow' for drop-off
 */

import React from 'react';
import { Typography, Icon } from '../../ui';
import { Input } from '../../ui/form';
import { cn } from '@thaiakha/shared/lib/utils';
import type { HotelResult } from '../hooks/useHotelSearch';

interface HotelSearchFieldProps {
  placeholder: string;
  query: string;
  results: HotelResult[];
  loading: boolean;
  showSuggestions: boolean;
  accent?: 'action' | 'yellow';
  /** Material icon name for the left adornment */
  leftIcon?: string;
  /** Whether to show the "pin on map" button */
  showMapPin?: boolean;
  onQueryChange: (q: string) => void;
  onFocus: () => void;
  onSelect: (hotel: HotelResult) => void;
  onPinMap?: () => void;
}

const HotelSearchField: React.FC<HotelSearchFieldProps> = ({
  placeholder,
  query,
  results,
  loading,
  showSuggestions,
  accent = 'action',
  leftIcon = 'search',
  showMapPin = false,
  onQueryChange,
  onFocus,
  onSelect,
  onPinMap,
}) => {
  const accentColor = accent === 'action' ? 'text-action' : 'text-yellow-500';

  return (
    <div className="relative group">
      <Input
        placeholder={placeholder}
        value={query}
        onChange={(e) => onQueryChange(e.target.value)}
        onFocus={onFocus}
        className="pl-10 bg-white/5 border-white/10 text-white font-bold"
      />
      <div className={cn('absolute left-3 top-1/2 -translate-y-1/2', accentColor)}>
        <Icon name={leftIcon} size="sm" />
      </div>

      {/* Suggestions dropdown */}
      {showSuggestions && (loading || results.length > 0) && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-surface-elevated border border-white/10 rounded-2xl z-50 shadow-2xl overflow-hidden">
          {loading ? (
            <div className="p-4 text-center text-white/40 text-xs flex items-center justify-center gap-2">
              <Icon name="autorenew" size="xs" className="animate-spin" />
              Searching...
            </div>
          ) : (
            results.map((h) => {
              const isOutside = !h.zone_id || h.zone_id === 'outside' || h.zone_id === 'walk-in';
              return (
                <div
                  key={h.id}
                  onClick={() => onSelect(h)}
                  className="p-3 hover:bg-white/10 cursor-pointer border-b border-white/5 last:border-0 flex items-center justify-between gap-2"
                >
                  <Typography variant="body" as="span" className="text-white text-sm">
                    {h.name}
                  </Typography>
                  {isOutside && accent === 'action' && (
                    <span className="text-[9px] font-black uppercase text-red-400/80 bg-red-500/10 px-2 py-0.5 rounded-full shrink-0">
                      Outside
                    </span>
                  )}
                  {isOutside && accent === 'yellow' && (
                    <span className="text-[9px] font-black uppercase text-orange-400/80 bg-orange-500/10 px-2 py-0.5 rounded-full shrink-0">
                      Extra cost
                    </span>
                  )}
                </div>
              );
            })
          )}
        </div>
      )}

      {/* Manual pin trigger */}
      {showMapPin && onPinMap && (
        <button
          onClick={onPinMap}
          className="flex items-center gap-2 mt-2 text-[10px] font-bold text-white/40 hover:text-white uppercase tracking-wider"
        >
          <Icon name="add_location_alt" size="xs" />
          Pin on map
        </button>
      )}
    </div>
  );
};

export default HotelSearchField;
