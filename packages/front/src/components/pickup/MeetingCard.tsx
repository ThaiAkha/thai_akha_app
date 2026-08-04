/**
 * MeetingCard
 * Unified expandable card for all meeting point types:
 *   - Walk-in (school, temple) — theme="blue"
 *   - Airport gates           — theme="action"
 *   - Train station           — theme="action"
 *   - Outside-zone fallbacks  — theme="yellow"
 *   - Drop-off "Other" list   — theme="yellow"
 *
 * Clicking the card selects it and expands it in-place.
 * Clicking again deselects and collapses.
 */

import React from 'react';
import { Typography, Icon } from '../ui';
import { cn } from '@thaiakha/shared/lib/utils';
import { fmtTime } from './utils/locationHelpers';
import type { MeetingPoint } from '@thaiakha/shared/types';
import type { MeetingPointWithDist } from './hooks/useMeetingPoints';

// ─── Theme definitions ────────────────────────────────────────────────────────

type Theme = 'action' | 'blue' | 'yellow';

const THEME = {
  action: {
    selected:   'bg-action/15 border-action shadow-lg shadow-action/10',
    unselected: 'bg-white/5 border-white/10 hover:bg-white/8 hover:border-white/20',
    iconBg:     { selected: 'bg-action/20', unselected: 'bg-white/8' },
    iconColor:  { selected: 'text-action',  unselected: 'text-white/50' },
    check:      'text-action',
    time:       'text-action/80',
    map:        'text-action hover:text-action/70',
    divider:    'border-action/20',
    nameSelected: 'text-white',
  },
  blue: {
    selected:   'bg-blue-500/15 border-blue-500 shadow-lg shadow-blue-500/10',
    unselected: 'bg-white/5 border-white/10 hover:bg-white/8 hover:border-white/20',
    iconBg:     { selected: 'bg-blue-500',  unselected: 'bg-white' },
    iconColor:  { selected: 'text-white',   unselected: 'text-black' },
    check:      'text-blue-400',
    time:       'text-blue-300',
    map:        'text-blue-400 hover:text-blue-300',
    divider:    'border-white/10',
    nameSelected: 'text-white',
  },
  yellow: {
    selected:   'bg-yellow-500/20 border-yellow-500',
    unselected: 'bg-white/5 border-white/10 hover:bg-white/8 hover:border-white/20',
    iconBg:     { selected: 'bg-yellow-500/20', unselected: 'bg-white/10' },
    iconColor:  { selected: 'text-yellow-300',  unselected: 'text-white/60' },
    check:      'text-yellow-400',
    time:       'text-yellow-300',
    map:        'text-yellow-400 hover:text-yellow-300',
    divider:    'border-white/10',
    nameSelected: 'text-white',
  },
} satisfies Record<Theme, object>;

// ─── Props ────────────────────────────────────────────────────────────────────

interface MeetingCardProps {
  mp: MeetingPoint | MeetingPointWithDist;
  isSelected: boolean;
  selectedClass: 'morning' | 'evening';
  onSelect: () => void;
  theme?: Theme;
  /** Material icon name — overrides default (place) */
  iconName?: string;
  /** Distance in km (shown as a badge) */
  distKm?: number;
  /** Show "Nearest" badge */
  isNearest?: boolean;
  /** Override the body description (e.g. dynamic walk-in text) */
  descriptionOverride?: string;
}

// ─── Component ────────────────────────────────────────────────────────────────

const MeetingCard: React.FC<MeetingCardProps> = ({
  mp,
  isSelected,
  selectedClass,
  onSelect,
  theme = 'action',
  iconName,
  distKm,
  isNearest,
  descriptionOverride,
}) => {
  const t = THEME[theme];
  const time = selectedClass === 'morning' ? mp.morning_pickup_time : mp.evening_pickup_time;
  const isWalkIn = mp.point_type === 'walk_in';
  const timeLabel = isWalkIn ? 'Arrive by' : 'Pickup at';
  const description = descriptionOverride ?? mp.description;
  const resolvedIcon = iconName
    ?? (mp.id.includes('airport') ? 'flight'
      : mp.id.includes('train')   ? 'train'
      : 'place');

  return (
    <div
      onClick={onSelect}
      className={cn(
        'rounded-2xl border cursor-pointer overflow-hidden transition-all duration-300',
        isSelected ? t.selected : t.unselected,
      )}
    >
      {/* ── Collapsed header (always visible) ─────────────────────────────── */}
      <div className="p-4 flex items-center gap-3">

        {/* Icon */}
        <div className={cn(
          'size-10 rounded-full flex items-center justify-center shrink-0 overflow-hidden transition-all duration-200',
          isSelected ? t.iconBg.selected : t.iconBg.unselected,
        )}>
          {mp.icon_url ? (
            <img
              src={mp.icon_url}
              alt={mp.name}
              className={cn('w-6 h-6 object-contain', isSelected && theme === 'blue' && 'brightness-[10]')}
            />
          ) : (
            <Icon
              name={resolvedIcon}
              size="sm"
              className={cn('transition-colors', isSelected ? t.iconColor.selected : t.iconColor.unselected)}
            />
          )}
        </div>

        {/* Name + time + badges */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 flex-wrap">
            <Typography variant="h6" as="span" className={cn('truncate', isSelected ? t.nameSelected : 'text-white')}>
              {mp.name}
            </Typography>
            {isNearest && (
              <Typography variant="microLabel" as="span" className="text-emerald-400/80 bg-emerald-500/10 px-1.5 py-0.5 rounded-full shrink-0">
                Nearest
              </Typography>
            )}
          </div>

          {time && (
            <Typography
              variant="microLabel"
              as="div"
              className={cn('mt-0.5 transition-colors', isSelected ? t.time : 'text-white/40')}
            >
              {isWalkIn ? 'Walk-in · ' : `${selectedClass === 'morning' ? 'Morning' : 'Evening'} · `}
              {timeLabel} {fmtTime(time)}
              {distKm !== undefined && (
                <span className="text-white/30 ml-1">
                  · {distKm < 1 ? `${Math.round(distKm * 1000)}m` : `${distKm.toFixed(1)}km`}
                </span>
              )}
            </Typography>
          )}
        </div>

        {/* Radio / check */}
        <Icon
          name={isSelected ? 'check_circle' : 'radio_button_unchecked'}
          size="sm"
          className={cn('shrink-0 transition-colors duration-200', isSelected ? t.check : 'text-white/20')}
        />
      </div>

      {/* ── Expanded content (only when selected) ─────────────────────────── */}
      {isSelected && (
        <div className={cn('px-4 pb-4 space-y-3 border-t animate-in fade-in duration-200', t.divider)}>

          {/* Optional image */}
          {mp.image_url && (
            <div className="h-28 rounded-xl overflow-hidden mt-3">
              <img src={mp.image_url} alt={mp.name} className="w-full h-full object-cover opacity-70" />
            </div>
          )}

          {/* Description */}
          {description && (
            <Typography variant="paragraphS" as="p" className="text-white/60 leading-relaxed pt-3">
              {description}
            </Typography>
          )}

          {/* Pickup time summary */}
          {time && (
            <div className="flex items-center gap-2">
              <Icon name="schedule" size="xs" className="text-white/30 shrink-0" />
              <Typography variant="microLabel" as="span" className={t.time}>
                {timeLabel} {fmtTime(time)}
              </Typography>
            </div>
          )}

          {/* Google Maps link */}
          {mp.google_maps_link && (
            <a
              href={mp.google_maps_link}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className={cn('inline-flex items-center gap-2 transition-colors', t.map)}
            >
              <Icon name="map" size="xs" />
              <Typography variant="caption" as="span" className={cn('font-bold', t.map)}>
                View on Google Maps
              </Typography>
              <Icon name="open_in_new" size="xs" className="opacity-60" />
            </a>
          )}
        </div>
      )}
    </div>
  );
};

export default MeetingCard;
