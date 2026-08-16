import React from 'react';
import { Typography, Icon, Card } from '../ui';
import { SmartHeaderSection } from '../layout';
import AkhaPixelPattern from '../divider/AkhaPixelPattern';
import { cn } from '@thaiakha/shared/lib/utils';

// ─── Types ────────────────────────────────────────────────────────────────────

interface SpiceLevel {
  id: number;
  title: string;
  label: string;
  subtitle: string;
  description: string;
  icon: string;
  color_code: string;
  philosophy_quote: string;
  chef_note: string;
  akha_connection: string;
}

export interface RecipeEssentialsProps {
  prepTimeMin?: number;
  cookTimeMin?: number;
  totalTimeMin?: number;
  servings?: string;
  difficulty?: string;
  spiceLevelId?: number;
  /** Pre-resolved spice level — when provided skips internal fetch */
  spiceLevelData?: Record<string, unknown> | null;
  essentials?: Record<string, string>;
}

// ─── Qualitative field config ─────────────────────────────────────────────────

const QUAL_FIELDS: Array<{ key: string; label: string; icon: string; fullWidth?: boolean }> = [
  { key: 'dietary',         label: 'Dietary',        icon: 'eco' },
  { key: 'cuisine',         label: 'Cuisine',         icon: 'ramen_dining' },
  { key: 'origin',          label: 'Origin',          icon: 'location_on' },
  { key: 'season',          label: 'Season',          icon: 'grass' },
  { key: 'allergen_note',   label: 'Allergens',       icon: 'warning_amber',  fullWidth: true },
  { key: 'substitutions',   label: 'Substitutions',   icon: 'swap_horiz',     fullWidth: true },
  { key: 'equipment',       label: 'Equipment',       icon: 'hardware',       fullWidth: true },
  { key: 'key_technique',   label: 'Key Technique',   icon: 'auto_awesome',   fullWidth: true },
  { key: 'taught_in',       label: 'Taught In',       icon: 'school' },
  { key: 'class_highlight', label: 'Class Highlight', icon: 'star',           fullWidth: true },
  { key: 'storage',         label: 'Storage',         icon: 'inventory_2' },
  { key: 'pairs_with',      label: 'Pairs With',      icon: 'dinner_dining' },
];

// ─── SectionLabel sub-component ──────────────────────────────────────────────

const SectionLabel: React.FC<{ icon: string; label: string; className?: string }> = ({ icon, label, className }) => (
  <div className={cn('flex flex-col [gap:var(--space-fluid-xs)]', className)}>
    <div className="flex items-center [gap:var(--space-fluid-xs)]">
      <Icon name={icon} size="md" className="text-action" />
      <Typography variant="h6" as="h3" color="title" className="uppercase tracking-widest">
        {label}
      </Typography>
    </div>
    <AkhaPixelPattern variant="line_simple_medium" size={6} opacity={0.6} />
  </div>
);

// ─── Pill sub-component ───────────────────────────────────────────────────────

const Pill: React.FC<{ icon: string; label: string; value?: string }> = ({ icon, label, value }) => (
  <div className="flex items-center [gap:var(--space-fluid-2xs)] [padding:var(--space-fluid-2xs)_var(--space-fluid-s)] rounded-full border bg-action/10 border-action/20">
    <Icon name={icon} size="xs" className="text-action" />
    <Typography
      variant="paragraphS"
      className="text-action uppercase tracking-wider font-bold"
    >
      {value ? `${label}: ${value}` : label}
    </Typography>
  </div>
);

// ─── Main component ───────────────────────────────────────────────────────────

const RecipeEssentials: React.FC<RecipeEssentialsProps> = ({
  prepTimeMin,
  cookTimeMin,
  totalTimeMin,
  servings,
  difficulty,
  spiceLevelId,
  spiceLevelData,
  essentials,
}) => {
  // Use pre-resolved data from hook (avoids extra Supabase call)
  const spiceLevel = spiceLevelData && spiceLevelId
    ? spiceLevelData as unknown as SpiceLevel
    : null;

  const total = totalTimeMin ?? ((prepTimeMin ?? 0) + (cookTimeMin ?? 0));
  const hasTimingData = !!(servings || (prepTimeMin != null) || total > 0 || difficulty);
  const qualFields = QUAL_FIELDS.filter(f => essentials?.[f.key]);

  if (!hasTimingData && !spiceLevelId && !qualFields.length) return null;

  return (
    <div className="flex flex-col [gap:var(--space-fluid-m)]">

      {/* ── Section header — "The Essentials" ─────────────────────────── */}
      <div className="[margin-bottom:var(--space-fluid-xs)]">
        <SmartHeaderSection
          sectionId="universal_essentials"
          variant="section"
          align="center"
          hideDescription
          dividerTheme="kitchen"
        />
      </div>

      {/* ── BLOCK 1 — Timing & basics pills ───────────────────────────── */}
      {hasTimingData && (
        <div className="flex flex-wrap justify-center [gap:var(--space-fluid-xs)]">
          {servings && <Pill icon="group" label="Serves" value={servings} />}
          {prepTimeMin != null && prepTimeMin > 0 && (
            <Pill icon="schedule" label="Prep" value={`${prepTimeMin} min`} />
          )}
          {cookTimeMin != null && cookTimeMin > 0 && (
            <Pill icon="whatshot" label="Cook" value={`${cookTimeMin} min`} />
          )}
          {total > 0 && (
            <Pill icon="timer" label="Total" value={`${total} min`} />
          )}
          {difficulty && (
            <Pill icon="signal_cellular_alt" label="Level" value={difficulty} />
          )}
        </div>
      )}

      {/* ── BLOCK 2 — Spice section ────────────────────────────────────── */}
      {spiceLevel && (
        <Card variant="glass" padding="md" rounded="2xl">
          <div className="flex flex-col [gap:var(--space-fluid-s)]">

            {/* Card header: emoji + Originally: LABEL + "Title" + divider */}
            <div className="flex flex-col [gap:var(--space-fluid-xs)] [margin-bottom:var(--space-fluid-xs)]">
              <Typography
                variant="h6"
                as="p"
                color="title"
                className="uppercase tracking-widest flex items-center flex-wrap [gap:var(--space-fluid-xs)]"
              >
                <span>{spiceLevel.icon}</span>
                <span className="opacity-50">Original spicy level:</span>
                <span style={{ color: spiceLevel.color_code }}>{spiceLevel.label}</span>
                <span>"{spiceLevel.title}"</span>
              </Typography>
              <AkhaPixelPattern variant="line_simple_medium" size={6} opacity={0.6} />
            </div>

            {/* Subtitle — e.g. "The Welcoming Warmth" */}
            {spiceLevel.subtitle && (
              <Typography variant="paragraphM" color="sub" className="font-semibold leading-snug">
                {spiceLevel.subtitle}
              </Typography>
            )}

            {/* Recipe-specific spice note (from essentials.spice_note) */}
            {essentials?.spice_note && (
              <Typography
                variant="paragraphM"
                color="default"
                className="leading-relaxed italic border-l-2 border-primary/30 [padding-left:var(--space-fluid-xs)]"
              >
                {essentials.spice_note}
              </Typography>
            )}

            {/* Akha cultural connection */}
            <Typography variant="paragraphM" color="muted" className="leading-relaxed">
              {spiceLevel.akha_connection}
            </Typography>

            {/* Footer */}
            <div className="flex items-center [gap:var(--space-fluid-xs)] [padding-top:var(--space-fluid-xs)] border-t border-border/50">
              <Icon name="tune" size="sm" className="text-action opacity-70" />
              <Typography variant="microLabel" color="muted" className="uppercase tracking-wider">
                At Thai Akha Kitchen you cook it your way
              </Typography>
              <Typography variant="caption" className="ml-auto">🌱 → 🔥</Typography>
            </div>

          </div>
        </Card>
      )}

      {/* ── BLOCK 3 — Qualitative fields ──────────────────────────────── */}
      {qualFields.length > 0 && (
        <Card variant="glass" padding="md" rounded="2xl">
          <SectionLabel icon="menu_book" label="The Essentials" className="[margin-bottom:var(--space-fluid-m)]" />
          <div className="grid grid-cols-1 sm:grid-cols-2 [gap:0]">
            {qualFields.map((field, idx) => (
              <div
                key={field.key}
                className={[
                  'flex items-start [gap:var(--space-fluid-xs)] [padding-block:var(--space-fluid-xs)]',
                  field.fullWidth ? 'sm:col-span-2' : '',
                  idx > 0 ? 'border-t border-border/30' : '',
                ].join(' ')}
              >
                <Icon name={field.icon} size="sm" className="text-action opacity-80 shrink-0 [margin-top:3px]" />
                <div className="flex flex-col flex-1 min-w-0">
                  <Typography variant="microLabel" color="muted" className="uppercase tracking-wider">
                    {field.label}
                  </Typography>
                  <Typography variant="paragraphS" color="title">
                    {essentials![field.key]}
                  </Typography>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

    </div>
  );
};

export default RecipeEssentials;
