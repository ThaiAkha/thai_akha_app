/**
 * OutsideZonePanel
 * B3 — Shown when a hotel outside the free pickup zone is selected.
 * Displays a warning banner + list of nearest meeting points (MeetingCard).
 * Cards expand in-place when clicked — no separate summary card.
 */

import React from 'react';
import { Typography, Icon } from '../../ui';
import MeetingCard from '../MeetingCard';
import type { LocationState } from '../hooks/useLocationState';
import type { MeetingPointWithDist } from '../hooks/useMeetingPoints';

interface OutsideZonePanelProps {
  points: MeetingPointWithDist[];
  selectedClass: 'morning' | 'evening';
  selectedId: string | null | undefined;
  hasCoords: boolean;
  onSelect: (loc: LocationState) => void;
}

const OutsideZonePanel: React.FC<OutsideZonePanelProps> = ({
  points,
  selectedClass,
  selectedId,
  hasCoords,
  onSelect,
}) => (
  <div className="space-y-3 animate-in fade-in slide-in-from-top-2 duration-300">

    {/* Warning banner */}
    <div className="rounded-2xl p-4 bg-yellow-500/10 border border-yellow-500/30 flex items-start gap-3">
      <Icon name="info" className="text-yellow-400 shrink-0 mt-0.5" size="sm" />
      <div>
        <Typography variant="microLabel" as="div" className="text-yellow-300">
          Outside Free Pickup Area
        </Typography>
        <Typography variant="paragraphS" as="p" className="text-white/60 leading-relaxed mt-1">
          Your hotel is not in our free pickup zone. Choose a nearby meeting point and we'll see you there!
        </Typography>
      </div>
    </div>

    {/* Section label */}
    <Typography
      variant="caption"
      className="text-white/50 block uppercase tracking-widest font-bold px-1"
    >
      {hasCoords ? 'Nearest meeting points' : 'Choose a meeting point'}
    </Typography>

    {/* Meeting point cards — expand in-place via MeetingCard */}
    {points.map((mp, idx) => {
      const isSelected = selectedId === mp.id;
      // First 3 get "Nearest" badge when coords are available
      const isNearest = hasCoords && idx < 3;

      return (
        <MeetingCard
          key={mp.id}
          mp={mp}
          isSelected={isSelected}
          selectedClass={selectedClass}
          theme="yellow"
          distKm={mp._distKm}
          isNearest={isNearest}
          onSelect={() => {
            onSelect({
              type: 'meeting_point',
              name: mp.name,
              lat: mp.latitude,
              lng: mp.longitude,
              zoneId: mp.id,
            });
          }}
        />
      );
    })}
  </div>
);

export default OutsideZonePanel;
