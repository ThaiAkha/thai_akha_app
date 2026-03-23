import React, { useState } from 'react';
import { Typography, Badge, Icon, Alert } from '../ui/index';
import { cn } from '@thaiakha/shared/lib/utils';

// ─── Shared type ─────────────────────────────────────────────────────────────

export interface ClassSection {
  id: string;
  section_key: string;
  title: string;
  subtitle?: string | null;
  description?: string | null;
  tag_badge?: string | null;
  ui_style: 'accordion' | 'timeline' | 'alert_box' | string;
  display_order: number;
  assigned_classes?: string[];
}

// ─── ACCORDION ───────────────────────────────────────────────────────────────

const AccordionBlock: React.FC<ClassSection> = ({ title, subtitle, description, tag_badge }) => {
  const [open, setOpen] = useState(false);

  return (
    <div className={cn(
      'rounded-2xl border border-white/10 overflow-hidden transition-colors duration-300',
      open ? 'border-white/20 bg-white/5' : 'hover:border-white/15'
    )}>
      <button
        type="button"
        onClick={() => setOpen(v => !v)}
        className="w-full flex items-center justify-between gap-3 px-5 py-4 text-left"
      >
        <div className="flex flex-wrap items-center gap-2">
          {tag_badge && <Badge variant="outline" className="text-[10px] shrink-0">{tag_badge}</Badge>}
          <Typography variant="h6" className="text-white/90">{title}</Typography>
          {subtitle && (
            <Typography variant="caption" className="text-white/45 hidden sm:inline">· {subtitle}</Typography>
          )}
        </div>
        <Icon
          name={open ? 'expand_less' : 'expand_more'}
          size="sm"
          className="text-white/35 shrink-0 transition-transform duration-300"
        />
      </button>

      {open && (
        <div className="px-5 pb-5 border-t border-white/8 animate-in fade-in slide-in-from-top-1 duration-200">
          {subtitle && (
            <Typography variant="monoLabel" className="text-xs text-white/50 mt-3 mb-1 block">{subtitle}</Typography>
          )}
          {description && (
            <Typography variant="paragraphS" className="text-white/65 leading-relaxed mt-3">
              {description}
            </Typography>
          )}
        </div>
      )}
    </div>
  );
};

// ─── TIMELINE STEP ───────────────────────────────────────────────────────────

const TimelineBlock: React.FC<ClassSection & { isLast?: boolean; accentClass?: string; dotClass?: string }> = ({
  title, subtitle, description, tag_badge, isLast = false, accentClass = 'text-primary', dotClass = 'bg-primary'
}) => (
  <div className="relative pl-7">
    {!isLast && (
      <div className="absolute left-[5px] top-4 bottom-0 w-px border-l-2 border-dashed border-white/15" />
    )}
    <div className={cn('absolute left-0 top-[6px] w-2.5 h-2.5 rounded-full ring-2 ring-surface', dotClass)} />

    <div className="space-y-1 pb-6">
      <div className="flex flex-wrap items-baseline gap-2">
        {tag_badge && (
          <Badge variant="outline" className="text-[10px]">{tag_badge}</Badge>
        )}
        <Typography variant="h6" className="text-white/90">{title}</Typography>
      </div>
      {subtitle && (
        <Typography variant="monoLabel" className={cn('text-xs', accentClass)}>{subtitle}</Typography>
      )}
      {description && (
        <Typography variant="paragraphS" className="text-white/60 leading-relaxed">
          {description}
        </Typography>
      )}
    </div>
  </div>
);

// ─── ALERT BOX ───────────────────────────────────────────────────────────────

const AlertBoxBlock: React.FC<ClassSection> = ({ title, subtitle, description, tag_badge }) => {
  const icon = tag_badge === 'Location' ? 'location_on'
    : tag_badge === 'Booking' ? 'credit_card'
    : 'info';

  return (
    <Alert
      variant="info"
      title={title}
      subtitle={subtitle ?? undefined}
      message={description ?? ''}
      icon={icon}
    />
  );
};

// ─── FACTORY ─────────────────────────────────────────────────────────────────

interface ClassSectionBlockProps {
  section: ClassSection;
  /** For timeline accent color matching the class theme */
  color?: 'primary' | 'secondary';
  /** Pass true for the last timeline item to hide the connecting line */
  isLast?: boolean;
}

const ClassSectionBlock: React.FC<ClassSectionBlockProps> = ({ section, color = 'primary', isLast = false }) => {
  const accentClass = color === 'primary' ? 'text-primary' : 'text-secondary';
  const dotClass = color === 'primary' ? 'bg-primary' : 'bg-secondary';

  switch (section.ui_style) {
    case 'accordion':
      return <AccordionBlock {...section} />;

    case 'timeline':
      return (
        <TimelineBlock
          {...section}
          isLast={isLast}
          accentClass={accentClass}
          dotClass={dotClass}
        />
      );

    case 'alert_box':
      return <AlertBoxBlock {...section} />;

    default:
      // Fallback: simple card for unknown ui_style
      return (
        <div className="rounded-2xl border border-white/10 bg-white/4 p-4 space-y-1">
          {section.tag_badge && <Badge variant="outline" className="text-[10px]">{section.tag_badge}</Badge>}
          <Typography variant="h6" className="text-white/90">{section.title}</Typography>
          {section.description && (
            <Typography variant="paragraphS" className="text-white/60 leading-relaxed">
              {section.description}
            </Typography>
          )}
        </div>
      );
  }
};

export default ClassSectionBlock;
