import React from 'react';
import { Typography, Badge, Icon } from '../ui/index';
import { cn } from '@thaiakha/shared/lib/utils';
import ClassSectionBlock, { ClassSection } from './ClassSectionBlock';

// ─── Types (mirrors DB JSONB shapes) ────────────────────────────────────────

interface ScheduleItem {
  time: string;
  label: string;
  description: string;
}

interface MeetingPoint {
  type: string; // 'walk_in' | 'market_meeting'
  name: string;
  time: string;
  link: string;
  note?: string;
}

interface ClassDetailsProps {
  color: 'primary' | 'secondary';
  tags?: string[];
  inclusions?: string[];
  schedule?: ScheduleItem[];
  meetingPoints?: MeetingPoint[];
  classSections?: ClassSection[];
}

// ─── Sub-components ──────────────────────────────────────────────────────────

const SectionTitle: React.FC<{ icon: string; label: string }> = ({ icon, label }) => (
  <div className="flex items-center gap-2 mb-4">
    <Icon name={icon} size="sm" className="text-white/50" />
    <Typography variant="microLabel" className="text-white/50 uppercase tracking-widest">{label}</Typography>
  </div>
);

// ─── Main Component ───────────────────────────────────────────────────────────

const ClassDetails: React.FC<ClassDetailsProps> = ({
  color,
  tags = [],
  inclusions = [],
  schedule = [],
  meetingPoints = [],
  classSections = [],
}) => {
  const accent = color === 'primary' ? 'text-primary' : 'text-secondary';
  const accentBg = color === 'primary' ? 'bg-primary/10 border-primary/20' : 'bg-secondary/10 border-secondary/20';
  const accentDot = color === 'primary' ? 'bg-primary' : 'bg-secondary';
  const accentLine = color === 'primary' ? 'border-primary/30' : 'border-secondary/30';

  return (
    <div className="space-y-10 pt-2">

      {/* ── 1. TAGS ─────────────────────────────────────────────────────── */}
      {tags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {tags.map((tag) => (
            <Badge key={tag} variant="outline" className="text-xs">
              {tag}
            </Badge>
          ))}
        </div>
      )}

      {/* ── 2. SCHEDULE TIMELINE ────────────────────────────────────────── */}
      {schedule.length > 0 && (
        <div>
          <SectionTitle icon="schedule" label="Daily Schedule" />
          <div className="relative pl-6">
            {/* Vertical line */}
            <div className={cn('absolute left-2 top-0 bottom-0 w-px border-l-2 border-dashed', accentLine)} />

            <div className="space-y-6">
              {schedule.map((item, idx) => (
                <div key={idx} className="relative">
                  {/* Timeline dot */}
                  <div className={cn('absolute -left-[18px] top-1.5 w-2.5 h-2.5 rounded-full ring-2 ring-surface', accentDot)} />
                  <div className="space-y-0.5">
                    <div className="flex flex-wrap items-baseline gap-2">
                      <Typography variant="monoLabel" className={cn('text-xs font-bold', accent)}>
                        {item.time}
                      </Typography>
                      <Typography variant="h6" className="text-white/90">{item.label}</Typography>
                    </div>
                    <Typography variant="paragraphS" className="text-white/60 leading-relaxed">
                      {item.description}
                    </Typography>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── 3. INCLUSIONS ────────────────────────────────────────────────── */}
      {inclusions.length > 0 && (
        <div>
          <SectionTitle icon="check_circle" label="What's Included" />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {inclusions.map((item) => (
              <div key={item} className="flex items-start gap-3">
                <Icon name="check_circle" size="xs" className={cn('shrink-0 mt-0.5', accent)} />
                <Typography variant="paragraphS" className="text-white/80">{item}</Typography>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── 4. MEETING POINTS ────────────────────────────────────────────── */}
      {meetingPoints.length > 0 && (
        <div>
          <SectionTitle icon="location_on" label="Meeting Points" />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {meetingPoints.map((mp) => (
              <a
                key={mp.name}
                href={mp.link}
                target="_blank"
                rel="noopener noreferrer"
                className={cn(
                  'group flex flex-col gap-2 p-4 rounded-2xl border transition-all duration-300 hover:scale-[1.02]',
                  accentBg
                )}
              >
                <div className="flex items-center justify-between">
                  <Badge variant="outline" className="text-[10px] uppercase tracking-wider">
                    {mp.type === 'walk_in' ? 'Walk-in' : 'Market Meeting'}
                  </Badge>
                  <Typography variant="monoLabel" className={cn('text-xs font-bold', accent)}>
                    {mp.time}
                  </Typography>
                </div>
                <Typography variant="h6" className="text-white/90">{mp.name}</Typography>
                {mp.note && (
                  <Typography variant="caption" className="text-white/55 leading-relaxed">{mp.note}</Typography>
                )}
                <div className="flex items-center gap-1 mt-1 text-white/40 group-hover:text-white/70 transition-colors">
                  <Icon name="location_on" size="xs" />
                  <Typography variant="caption">View on Maps</Typography>
                </div>
              </a>
            ))}
          </div>
        </div>
      )}

      {/* ── 5. CLASS SECTIONS (accordion / timeline / alert_box) ─────────── */}
      {classSections.length > 0 && (
        <div className="space-y-3">
          {classSections.map((section, idx) => (
            <ClassSectionBlock
              key={section.id}
              section={section}
              color={color}
              isLast={idx === classSections.length - 1}
            />
          ))}
        </div>
      )}

    </div>
  );
};

export default ClassDetails;
