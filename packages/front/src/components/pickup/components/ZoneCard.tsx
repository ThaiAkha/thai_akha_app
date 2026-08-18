/**
 * ZoneCard
 * B2 — Shown when a hotel inside the free pickup zone is selected.
 * Displays zone name, color dot, and the pickup time window (start → end).
 */

import React from 'react';
import { Typography, Icon } from '../../ui';
import { fmtTime } from '../utils/locationHelpers';
import type { PickupZone } from '@thaiakha/shared/types';

interface ZoneCardProps {
  zone: PickupZone & { color_code?: string | null };
  selectedClass: 'morning' | 'evening';
}

const ZoneCard: React.FC<ZoneCardProps> = ({ zone, selectedClass }) => {
  const startTime = selectedClass === 'morning'
    ? zone.morning_pickup_time
    : zone.evening_pickup_time;
  const endTime = selectedClass === 'morning'
    ? (zone as any).morning_pickup_end
    : (zone as any).evening_pickup_end;

  const color = zone.color_code ?? '#ffffff';

  return (
    <div
      className="rounded-2xl p-4 border animate-in fade-in slide-in-from-top-2 duration-300"
      style={{ backgroundColor: `${color}18`, borderColor: `${color}40` }}
    >
      <div className="flex items-center gap-4">
        {/* Zone colour dot */}
        <div
          className="size-3 rounded-full shrink-0 ring-2 ring-white/20"
          style={{ backgroundColor: color }}
        />

        {/* Zone name */}
        <div className="flex-1 min-w-0">
          <Typography variant="microLabel" as="div" className="text-white/50">
            Free Pickup Zone
          </Typography>
          <Typography variant="h6" as="div" className="truncate text-white mt-0.5">
            {zone.name}
          </Typography>
        </div>

        {/* Pickup time window */}
        <div className="text-right shrink-0">
          <Typography variant="microLabel" as="div" className="text-white/40 mb-0.5">
            {selectedClass === 'morning' ? 'Morning' : 'Evening'} pickup
          </Typography>
          <Typography variant="numericPrice" as="div" style={{ color }}>
            {fmtTime(startTime)}
          </Typography>
          {endTime && (
            <Typography variant="microLabel" as="div" className="text-white/40 mt-0.5">
              to {fmtTime(endTime)}
            </Typography>
          )}
        </div>
      </div>

      {/* Get-ready note — same for every hotel */}
      <div
        className="flex items-start gap-2 mt-3 pt-3 border-t"
        style={{ borderColor: `${color}25` }}
      >
        <Icon name="schedule" size="xs" className="text-white/40 shrink-0 mt-0.5" />
        <Typography variant="paragraphS" as="p" className="text-white/60 leading-relaxed">
          Please be ready in your hotel lobby a few minutes before your pickup time — our driver keeps to the schedule and can only wait a short moment.
        </Typography>
      </div>
    </div>
  );
};

export default ZoneCard;
