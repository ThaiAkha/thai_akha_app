import React, { useMemo } from 'react';
import { cn } from '@thaiakha/shared/lib/utils';
import { Typography, Icon, AkhaPixelPattern } from '../ui/index';

type EssentialInput =
  | Record<string, unknown>
  | Array<{ label?: string; key?: string; value?: unknown }>
  | null
  | undefined;

interface TheEssentialBoxProps {
  data: EssentialInput;
  title?: string;
  className?: string;
}

// Known key → icon (fallbacks to a generic dot). Kept small + literal (JIT-safe).
const FACT_ICONS: Record<string, string> = {
  flavour: 'restaurant',
  flavor: 'restaurant',
  taste: 'restaurant',
  season: 'calendar_month',
  uses: 'cooking',
  use: 'cooking',
  culinary_uses: 'cooking',
  storage: 'kitchen',
  store: 'kitchen',
  origin: 'public',
  pairs_with: 'link',
  substitute: 'swap_horiz',
  substitutes: 'swap_horiz',
};

function humanizeLabel(raw: string): string {
  return raw
    .replace(/[_-]+/g, ' ')
    .replace(/\b\w/g, c => c.toUpperCase())
    .trim();
}

function stringifyValue(value: unknown): string {
  if (value == null) return '';
  if (Array.isArray(value)) return value.filter(Boolean).map(String).join(' · ');
  if (typeof value === 'object') return Object.values(value as Record<string, unknown>).map(String).join(' · ');
  return String(value);
}

/**
 * TheEssentialBox — key-facts card for a single ingredient (flavour · season · uses · storage).
 * Accepts either an object ({flavour: "...", season: "..."}) or an array of {label, value}.
 * Pantry world styling. Renders nothing when there are no facts.
 */
const TheEssentialBox: React.FC<TheEssentialBoxProps> = ({ data, title = 'The Essential', className }) => {
  const facts = useMemo(() => {
    if (!data) return [] as Array<{ label: string; value: string; iconKey: string }>;
    const raw: Array<{ label: string; value: string; iconKey: string }> = [];

    if (Array.isArray(data)) {
      for (const item of data) {
        const label = item.label ?? item.key ?? '';
        const value = stringifyValue(item.value);
        if (label && value) raw.push({ label: humanizeLabel(label), value, iconKey: label.toLowerCase() });
      }
    } else if (typeof data === 'object') {
      for (const [key, value] of Object.entries(data)) {
        const v = stringifyValue(value);
        if (v) raw.push({ label: humanizeLabel(key), value: v, iconKey: key.toLowerCase() });
      }
    }
    return raw;
  }, [data]);

  if (facts.length === 0) return null;

  return (
    <aside
      className={cn(
        'rounded-[1.25rem] border border-pantry-4/20 bg-pantry-4/5',
        '[padding:var(--space-fluid-l)] flex flex-col [gap:var(--space-fluid-s)]',
        className,
      )}
    >
      <div className="flex flex-col [gap:var(--space-fluid-2xs)]">
        <Typography variant="microLabel" className="text-pantry-4 uppercase tracking-widest font-black">
          {title}
        </Typography>
        <AkhaPixelPattern variant="line_simple_medium" size={6} opacity={0.7} theme="ingredients" />
      </div>

      <dl className="grid grid-cols-1 sm:grid-cols-2 [gap:var(--space-fluid-s)]">
        {facts.map((fact) => (
          <div key={fact.label} className="flex items-start [gap:var(--space-fluid-xs)]">
            <span className="mt-0.5 inline-flex items-center justify-center size-8 shrink-0 rounded-full bg-pantry-4/10 text-pantry-4">
              <Icon name={FACT_ICONS[fact.iconKey] ?? 'nutrition'} size="sm" />
            </span>
            <div className="flex flex-col min-w-0">
              <dt>
                <Typography variant="microLabel" color="muted" className="uppercase tracking-wide">
                  {fact.label}
                </Typography>
              </dt>
              <dd>
                <Typography variant="paragraphS" className="text-desc leading-snug">
                  {fact.value}
                </Typography>
              </dd>
            </div>
          </div>
        ))}
      </dl>
    </aside>
  );
};

export default TheEssentialBox;
