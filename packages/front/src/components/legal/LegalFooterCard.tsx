import React from 'react';
import { cn } from '@thaiakha/shared/lib/utils';
import { Typography, Icon } from '../ui/index';
import { useBusinessProfile } from '../../hooks/useBusinessProfile';

interface LegalFooterCardProps {
  /** Override riga entità legale. Default: da business_profile (legal_name · località). */
  text?: string;
  /** Icona a sinistra (Material Symbols). Default = shield. */
  icon?: string;
  /** Anno del copyright. Default = anno corrente. */
  year?: number;
  /** Accento per mondo: 'brand' (default) | 'ocean' (pagine info a tema FAQ). */
  accent?: 'brand' | 'ocean';
  className?: string;
}

/**
 * LegalFooterCard — chiusura dei documenti legali (entità + località) dentro una
 * card coerente con la LegalMetaBanner (stesso bordo/tint per accent). Centrata.
 * Entità legale da business_profile (fonte unica DB) — cambio in DB → cambio qui.
 */
export const LegalFooterCard: React.FC<LegalFooterCardProps> = ({
  text,
  icon = 'shield',
  year = new Date().getFullYear(),
  accent = 'brand',
  className,
}) => {
  const { profile: bp } = useBusinessProfile();
  // address_country è ISO ("TH") → nome leggibile via Intl (no hardcode).
  const countryName = bp?.address_country
    ? (new Intl.DisplayNames(['en'], { type: 'region' }).of(bp.address_country) ?? bp.address_country)
    : '';
  const entityLine =
    text ??
    (bp
      ? [bp.legal_name ?? bp.name, [bp.address_locality, countryName].filter(Boolean).join(', ')]
          .filter(Boolean)
          .join(' · ')
      : '');
  const isOcean = accent === 'ocean';
  if (!entityLine) return null;
  return (
    <div
      className={cn(
        'flex items-center justify-center [gap:var(--space-fluid-2xs)] [padding-block:var(--space-fluid-s)] [padding-inline:var(--space-fluid-m)] rounded-2xl border',
        isOcean
          ? 'bg-ocean-blue/5 dark:bg-ocean-blue/10 border-ocean-blue/10'
          : 'bg-primary/5 dark:bg-primary/10 border-primary/10',
        className,
      )}
    >
      <Icon name={icon} size="xs" className={isOcean ? 'text-ocean-blue/60' : 'text-primary/60'} />
      <Typography variant="caption" color="muted">
        © {year} {entityLine}
      </Typography>
    </div>
  );
};

export default LegalFooterCard;
