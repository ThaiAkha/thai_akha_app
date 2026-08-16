/**
 * WalkInSection
 * "Go Myself" mode — list of walk-in meeting points (school + temple).
 * Each card expands in-place via MeetingCard with a session-aware description.
 */

import React from 'react';
import { Typography } from '../../ui';
import MeetingCard from '../MeetingCard';
import { fmtTime } from '../utils/locationHelpers';
import type { LocationState } from '../hooks/useLocationState';
import type { MeetingPoint } from '@thaiakha/shared/types';

interface WalkInSectionProps {
  points: MeetingPoint[];
  selectedClass: 'morning' | 'evening';
  pickupLoc: LocationState | null;
  onSelect: (loc: LocationState | null) => void;
}

/**
 * Builds the context-aware description for walk-in cards:
 * session-aware timing line + the point's own description from the DB.
 * Descriptions that just repeat "Go directly…" are skipped to avoid duplicates.
 */
function buildWalkInDescription(mp: MeetingPoint, selectedClass: 'morning' | 'evening'): string {
  const time = selectedClass === 'morning' ? mp.morning_pickup_time : mp.evening_pickup_time;
  const dest = mp.id === 'mp_school' ? 'our school' : 'the temple';

  if (!time) return mp.description ?? '';

  const detail = mp.description && !mp.description.toLowerCase().startsWith('go directly')
    ? mp.description
    : '';
  return [`Go directly to ${dest}. Please arrive by ${fmtTime(time)}.`, detail]
    .filter(Boolean)
    .join(' ');
}

const WalkInSection: React.FC<WalkInSectionProps> = ({
  points,
  selectedClass,
  pickupLoc,
  onSelect,
}) => (
  <div className="space-y-3">
    <Typography
      variant="caption"
      className="text-btn-s-400 block uppercase tracking-widest font-bold mb-2"
    >
      Select Meeting Point
    </Typography>

    {points.map((mp) => {
      const isSelected =
        pickupLoc?.zoneId === mp.id || pickupLoc?.name === mp.name;

      return (
        <MeetingCard
          key={mp.id}
          mp={mp}
          isSelected={isSelected}
          selectedClass={selectedClass}
          theme="blue"
          descriptionOverride={buildWalkInDescription(mp, selectedClass)}
          onSelect={() =>
            onSelect(
              isSelected
                ? null
                : {
                    type: 'meeting_point',
                    name: mp.name,
                    lat: mp.latitude,
                    lng: mp.longitude,
                    zoneId: mp.id,
                  },
            )
          }
        />
      );
    })}

    {points.length === 0 && (
      <Typography variant="body" as="div" className="text-center text-white/40 py-6">
        No meeting points available for this session.
      </Typography>
    )}
  </div>
);

export default WalkInSection;
