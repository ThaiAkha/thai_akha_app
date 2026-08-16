import React from 'react';
import { cn } from '@thaiakha/shared/lib/utils';
import { t } from '@thaiakha/shared/lib/ui-strings';
import { Typography, Icon } from '../ui/index';

interface LegalMetaBannerProps {
  version: string;
  effectiveDate: string;
  lastUpdated: string;
  /** Accento per mondo: 'brand' (default) | 'ocean'. */
  accent?: 'brand' | 'ocean';
  className?: string;
}

const fmt = (d: string) =>
  d ? new Date(d).toLocaleDateString('en-GB', { year: 'numeric', month: 'long', day: 'numeric' }) : '';

/**
 * LegalMetaBanner — barra meta di un documento legale (versione, data effettiva,
 * ultimo aggiornamento). Estratta dal viewer per poterla mostrare full-width
 * sopra il contenuto/TOC nelle pagine Terms/Privacy.
 */
export const LegalMetaBanner: React.FC<LegalMetaBannerProps> = ({
  version,
  effectiveDate,
  lastUpdated,
  accent = 'brand',
  className,
}) => {
  const isOcean = accent === 'ocean';
  return (
    <div
      className={cn(
        'flex flex-wrap items-center justify-between [gap:var(--space-fluid-xs)] [padding-block:var(--space-fluid-s)] [padding-inline:var(--space-fluid-m)] rounded-2xl border',
        isOcean
          ? 'bg-ocean-blue/5 dark:bg-ocean-blue/10 border-ocean-blue/10'
          : 'bg-primary/5 dark:bg-primary/10 border-primary/10',
        className
      )}
    >
      <div className="flex items-center [gap:var(--space-fluid-xs)]">
        <Icon name="info" size="xs" className={isOcean ? 'text-ocean-blue/60' : 'text-primary/60'} />
        <Typography variant="caption" color="muted">{t.components.legalMeta.version} {version}</Typography>
        <span className="text-border">·</span>
        <Typography variant="caption" color="muted">{t.components.legalMeta.effective} {fmt(effectiveDate)}</Typography>
      </div>
      <div className="flex items-center [gap:var(--space-fluid-2xs)]">
        <Icon name="check_circle" size="xs" className="text-action" />
        <Typography variant="caption" color="muted">{t.components.legalMeta.lastUpdated} {fmt(lastUpdated)}</Typography>
      </div>
    </div>
  );
};

export default LegalMetaBanner;
