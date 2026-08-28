import React from 'react';
import { cn } from '@thaiakha/shared/lib/utils';

export interface InspectorLeaderProps {
  className?: string;
  /** Di norma un LeaderHeader (+ badge di contesto, es. ZoneTimeBadge). */
  children: React.ReactNode;
  /** Opt-in: aggiunge border-b. Di default NO, perche' LeaderHeader porta gia' il suo pb-5 border-b. */
  divider?: boolean;
  /**
   * Opt-in: sfondo tenue. Di default NO. Dei tre blocchi leader esistenti solo quello di
   * LogisticInspector aveva la tinta; Reservation e KitchenBookings erano sul fondo della
   * card, e un default tinto li avrebbe cambiati d'aspetto.
   */
  tinted?: boolean;
}

/**
 * Blocco header NON a altezza fissa: InspectorHeader e' h-16/h-20 con truncate e non
 * puo' ospitare avatar + contatti + badge. Serve a portare il LeaderHeader fuori dal
 * corpo scrollabile senza cambiarne l'aspetto: per questo bordo e tinta sono entrambi
 * opt-in, e il padding si passa da className dove non e' p-6 pb-3.
 */
export const InspectorLeader: React.FC<InspectorLeaderProps> = ({ className, children, divider = false, tinted = false }) => (
  <div className={cn('shrink-0 p-6 pb-3', tinted && 'bg-gray-50/30 dark:bg-gray-800/20', divider && 'border-b border-gray-100 dark:border-gray-800', className)}>
    {children}
  </div>
);
