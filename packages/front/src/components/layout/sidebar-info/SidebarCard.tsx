import React from 'react';
import { Typography, Icon } from '../../ui';
import type { TocAccent } from '../../ui';
import { cn } from '@thaiakha/shared/lib/utils';

interface SidebarCardProps {
  /** Titolo del blocco (mostrato nell'header gradiente). Se assente, nessun header. */
  title?: string;
  /** Icona (Material Symbols) a sinistra del titolo nell'header. */
  icon?: string;
  /** Accento per mondo → gradiente header (ocean=FAQ, sunset=history…). */
  accent?: TocAccent;
  children: React.ReactNode;
  className?: string;
}

// Header gradiente per mondo (come la Cherry box): colori scuri → titolo BIANCO leggibile.
const HEADER_GRAD: Record<TocAccent, string> = {
  ocean:  'bg-gradient-to-r from-deep-ocean to-ocean-blue',
  sunset: 'bg-gradient-to-r from-sunset-6 to-sunset-4',
  brand:  'bg-gradient-to-r from-primary to-secondary',
  ingredients: 'bg-gradient-to-r from-pantry-6 to-pantry-4',
};

/**
 * SidebarCard — involucro base COERENTE dei blocchi sidebar info-page.
 * Card (surface+border) con header a GRADIENTE (stile Cherry box) + titolo bianco.
 * Niente divider Akha. Dà a Menu e TOC lo stesso vestito.
 */
export const SidebarCard: React.FC<SidebarCardProps> = ({ title, icon, accent = 'ocean', children, className }) => (
  <div className={cn('bg-surface border border-border rounded-2xl overflow-hidden flex flex-col', className)}>
    {title && (
      <div className={cn('flex items-center [gap:var(--space-fluid-xs)] [padding-block:var(--space-fluid-xs)] [padding-inline:var(--space-fluid-s)]', HEADER_GRAD[accent])}>
        {icon && <Icon name={icon} size="md" className="text-white shrink-0" />}
        <Typography variant="microLabel" className="font-accent text-white font-black uppercase tracking-widest [font-size:1.375rem]">
          {title}
        </Typography>
      </div>
    )}
    <div className="[padding-block:var(--space-fluid-s)] [padding-inline:var(--space-fluid-xs)] flex flex-col [gap:var(--space-fluid-xs)]">
      {children}
    </div>
  </div>
);

export default SidebarCard;
