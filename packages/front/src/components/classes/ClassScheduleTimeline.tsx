import React, { useState, useMemo } from 'react';
import { Typography, Icon } from '../ui/index';
import { SmartHeaderSection } from '../layout/SmartHeaderSection';
import Card from '../ui/card/Card';
import AkhaPixelPattern from '../divider/AkhaPixelPattern';
import { cn } from '@thaiakha/shared/lib/utils';
import GalleryModal from '../modal/GalleryModal';
import type { GalleryItem } from '../modal/GalleryModal';
import { useMediaAsset } from '../../hooks/useMediaAsset';

// ─── Types ───────────────────────────────────────────────────────────────────

export interface ScheduleStep {
  time: string;
  label: string;
  description: string;
  asset_id?: string;
  /**
   * Optional deep-link to a related page (news article, pickup, market…).
   * `page` is what onNavigate accepts (short alias or canonical slug); `slug`
   * is the sub-page (e.g. a news article slug); `label` overrides the CTA text.
   */
  link?: { page: string; slug?: string; label?: string };
}

interface ClassScheduleTimelineProps {
  steps: ScheduleStep[];
  color?: 'primary' | 'secondary';
  sectionId?: string;
  onNavigate?: (page: string, topic?: string, sectionId?: string) => void;
}

// ─── Single step photo ────────────────────────────────────────────────────────

const StepPhoto: React.FC<{
  assetId: string;
  label: string;
  onClick: () => void;
}> = ({ assetId, label, onClick }) => {
  const { asset, loading } = useMediaAsset({ assetId });

  if (loading) {
    return <div className="w-full aspect-video rounded-[1.5rem] bg-surface-2 animate-pulse" />;
  }
  if (!asset?.image_url) return null;

  return (
    <button
      type="button"
      onClick={onClick}
      className="group/photo relative w-full aspect-video rounded-[1.5rem] overflow-hidden cursor-zoom-in focus:outline-none focus-visible:ring-2 focus-visible:ring-action"
    >
      <img
        src={asset.image_url}
        alt={asset.alt_text || label}
        className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover/photo:scale-105"
      />
      <div className="absolute inset-0 bg-black/0 group-hover/photo:bg-black/20 transition-colors duration-300 flex items-center justify-center">
        <span className="opacity-0 group-hover/photo:opacity-100 transition-opacity duration-300 bg-black/50 rounded-full p-2">
          <Icon name="zoom_in" size="sm" className="text-white" />
        </span>
      </div>
    </button>
  );
};


// ─── Step Card Content ────────────────────────────────────────────────────────

const StepCard: React.FC<{
  step: ScheduleStep;
  onPhotoClick: () => void;
  align?: 'left' | 'right';
  onNavigate?: (page: string, topic?: string, sectionId?: string) => void;
}> = ({ step, onPhotoClick, align = 'left', onNavigate }) => {
  const hasPhoto = !!step.asset_id;
  const link = step.link;
  // Canonical-ish path for cmd/ctrl-click (native new tab); SPA nav on plain click.
  const linkHref = link ? `/${link.page}${link.slug ? `/${link.slug}` : ''}` : undefined;

  // Time badge aligned opposite to text: left-aligned card → badge right; right-aligned → badge left
  const timeBadge = (
    <div className="shrink-0 px-3 py-2 rounded-xl bg-action/10 border border-action/20 flex items-center justify-center">
      <Typography variant="accent" className="font-bold text-xs text-action whitespace-nowrap">
        {step.time}
      </Typography>
    </div>
  );

  return (
    <Card variant="glass" padding="none" rounded="2xl" className="w-full flex flex-col">
      {hasPhoto && (
        <StepPhoto assetId={step.asset_id!} label={step.label} onClick={onPhotoClick} />
      )}

      {/* ── Title row + time badge (opposite alignment) ─────────────────── */}
      <div
        className="flex items-center justify-between"
        style={{ padding: 'var(--space-fluid-m)', gap: 'var(--space-fluid-m)' }}
      >
        {align === 'right' && timeBadge}
        <Typography
          variant="h4"
          color="title"
          className={cn('font-bold leading-snug flex-1', align === 'right' && 'md:text-right')}
        >
          {step.label}
        </Typography>
        {align !== 'right' && timeBadge}
      </div>

      {/* ── Divider ─────────────────────────────────────────────────────── */}
      <div className="overflow-hidden" style={{ margin: 'var(--space-fluid-xs) var(--space-fluid-m) 0' }}>
        <AkhaPixelPattern variant="line_divider" size={6} fill animateInView className="opacity-50" />
      </div>

      {/* ── Description ─────────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col [gap:var(--space-fluid-s)]" style={{ padding: 'var(--space-fluid-m)' }}>
        <Typography
          variant="paragraphM"
          color="muted"
          className={cn('leading-relaxed', align === 'right' && 'md:text-right')}
        >
          {step.description}
        </Typography>

        {/* ── Deep-link CTA (news / pickup / market…) ─────────────────── */}
        {link && linkHref && (
          <a
            href={linkHref}
            onClick={(e) => {
              // Let the browser handle cmd/ctrl/middle-click → native new tab.
              if (e.metaKey || e.ctrlKey || e.shiftKey || e.button === 1) return;
              e.preventDefault();
              onNavigate?.(link.page, undefined, link.slug);
            }}
            className={cn(
              'group/cta mt-auto inline-flex items-center [gap:var(--space-fluid-2xs)] self-start',
              'text-action font-bold text-sm rounded-lg transition-colors duration-200',
              'hover:text-action-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-action',
              align === 'right' && 'md:self-end'
            )}
          >
            {link.label || 'Learn more'}
            <Icon name="arrow_forward" size="sm" className="transition-transform duration-200 group-hover/cta:translate-x-0.5" />
          </a>
        )}
      </div>
    </Card>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────

const ClassScheduleTimeline: React.FC<ClassScheduleTimelineProps> = ({
  steps = [],
  color = 'primary',
  sectionId,
  onNavigate,
}) => {
  const [modalOpen, setModalOpen] = useState(false);
  const [modalStart, setModalStart] = useState(0);

  const accentText = color === 'primary' ? 'text-primary' : 'text-secondary';
  const accentBg = color === 'primary' ? 'bg-primary/10 border-primary/20' : 'bg-secondary/10 border-secondary/20';

  const stepsWithPhoto = useMemo(() => steps.filter(s => !!s.asset_id), [steps]);

  const handlePhotoClick = (stepIndex: number) => {
    const step = steps[stepIndex];
    const galleryIdx = stepsWithPhoto.findIndex(s => s.asset_id === step.asset_id);
    setModalStart(Math.max(0, galleryIdx));
    setModalOpen(true);
  };

  const galleryItems: GalleryItem[] = stepsWithPhoto.map(s => ({
    asset_id: s.asset_id,
    image_url: '',
    title: s.label,
    description: s.time,
  }));

  if (steps.length === 0) return null;

  return (
    <>
      <div className="flex flex-col [gap:var(--space-fluid-l)]">

        {/* ── Header ─────────────────────────────────────────────────────── */}
        {sectionId ? (
          <SmartHeaderSection sectionId={sectionId} variant="section" align="center" hideDescription />
        ) : (
          <Typography variant="h3" color="title" className="text-center font-bold">
            Daily Schedule
          </Typography>
        )}

        {/* ── Steps ──────────────────────────────────────────────────────── */}
        <div className="relative flex flex-col [gap:var(--space-fluid-m)]">

          {/* Vertical timeline line — left on mobile, center on desktop */}
          <div className={cn(
            'absolute top-5 bottom-5 w-0.5 pointer-events-none z-0',
            'left-5 md:left-1/2 md:-translate-x-px',
            color === 'primary'
              ? 'bg-gradient-to-b from-primary/40 via-primary/20 to-transparent'
              : 'bg-gradient-to-b from-secondary/40 via-secondary/20 to-transparent'
          )} />

          {steps.map((step, idx) => {
            const isLeft = idx % 2 === 0; // even = left, odd = right (desktop)

            return (
              <div
                key={idx}
                className={cn(
                  // Mobile: flex with dot on left, card on right
                  'relative flex items-start [gap:var(--space-fluid-m)]',
                  // Desktop: 3-column grid [card area | dot | card area]
                  'md:grid md:grid-cols-[1fr_2.5rem_1fr] md:items-start',
                )}
              >
                {/* ── Desktop LEFT column ──────────────────────────────── */}
                <div className="hidden md:flex md:justify-end md:items-start min-w-0">
                  {isLeft && (
                    <StepCard
                      step={step}
                      onPhotoClick={() => handlePhotoClick(idx)}
                      align="right"
                      onNavigate={onNavigate}
                    />
                  )}
                </div>

                {/* ── Number dot — center on desktop, left on mobile ───── */}
                <div className="shrink-0 z-10 md:mx-auto rounded-full bg-surface shadow-theme-sm">
                  <div className={cn(
                    'w-10 h-10 rounded-full border-2 flex items-center justify-center',
                    accentBg
                  )}>
                    <Typography variant="numericRegular" className={cn('font-black leading-none', accentText)}>
                      {idx + 1}
                    </Typography>
                  </div>
                </div>

                {/* ── Mobile card (always) + Desktop RIGHT column ──────── */}
                <div className="flex-1 min-w-0 md:flex md:justify-start md:items-start">
                  {/* Mobile only */}
                  <div className="md:hidden w-full">
                    <StepCard
                      step={step}
                      onPhotoClick={() => handlePhotoClick(idx)}
                      onNavigate={onNavigate}
                    />
                  </div>
                  {/* Desktop right slot */}
                  {!isLeft && (
                    <div className="hidden md:block w-full">
                      <StepCard
                        step={step}
                        onPhotoClick={() => handlePhotoClick(idx)}
                        onNavigate={onNavigate}
                      />
                    </div>
                  )}
                </div>

              </div>
            );
          })}
        </div>
      </div>

      {/* Gallery Modal */}
      {galleryItems.length > 0 && (
        <GalleryModal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          items={galleryItems}
          startIndex={modalStart}
        />
      )}
    </>
  );
};

export default ClassScheduleTimeline;
