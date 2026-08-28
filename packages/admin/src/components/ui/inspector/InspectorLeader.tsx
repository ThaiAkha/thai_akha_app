import React from 'react';
import { cn } from '@thaiakha/shared/lib/utils';

export interface InspectorLeaderProps {
  className?: string;
  /** Di norma un LeaderHeader (+ badge di contesto, es. ZoneTimeBadge). */
  children: React.ReactNode;
  /** Opt-in: aggiunge border-b. Di default NO, perche' LeaderHeader porta gia' il suo pb-5 border-b. */
  divider?: boolean;
}

/**
 * Blocco header NON a altezza fissa: InspectorHeader e' h-16/h-20 con truncate e non
 * puo' ospitare avatar + contatti + badge. Stesso chrome del blocco leader di
 * LogisticInspector (p-6 pb-3, senza border-b esterno), cosi' Logistic / Reservation /
 * KitchenBookings possono portare il LeaderHeader fuori dal corpo scrollabile senza
 * cambiare aspetto ne' raddoppiare la riga di separazione.
 */
export const InspectorLeader: React.FC<InspectorLeaderProps> = ({ className, children, divider = false }) => (
  <div className={cn('shrink-0 p-6 pb-3 bg-gray-50/30 dark:bg-gray-800/20', divider && 'border-b border-gray-100 dark:border-gray-800', className)}>
    {children}
  </div>
);
