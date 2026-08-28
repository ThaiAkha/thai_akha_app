import React from 'react';
import { cn } from '@thaiakha/shared/lib/utils';

/**
 * Composable primitives for the admin master-detail "Inspector" panel.
 * The 12 feature inspectors are conceptually parallel but structurally divergent;
 * these primitives normalize them to the DS baseline (docs/ADMIN_DS_BASELINE_2027.md)
 * without forcing a single rigid shell. Adopt incrementally, behavior-invariant.
 *
 * Qui restano Shell e Body; Header / Empty / Footer / Leader / DeleteZone vivono in
 * file propri e vengono ri-esportati sotto, cosi' gli import profondi
 * (`.../ui/inspector/InspectorShell`) dei 6 adopter continuano a funzionare.
 * Il punto d'ingresso nuovo e' `./index.ts`.
 */

export const InspectorShell: React.FC<{ className?: string; children: React.ReactNode }> = ({ className, children }) => (
  <div className={cn('flex-1 flex flex-col overflow-hidden', className)}>{children}</div>
);

export interface InspectorBodyProps {
  className?: string;
  children: React.ReactNode;
  /**
   * Aggiunge min-h-0: senza, un figlio flex puo' impedire al corpo di restringersi e lo
   * scroll finisce sul contenitore sbagliato (DataExplorerInspector lo ha di serie).
   * Opt-in finche' non e' verificato sui 4 Body attuali.
   */
  fill?: boolean;
  /**
   * Opt-in: lascia visibile la scrollbar. Di default e' nascosta (`no-scrollbar`), com'e'
   * nella maggior parte degli inspector; il pane agency invece la mostrava, e i suoi
   * vicini sulla stessa pagina continuano a mostrarla.
   */
  scrollbar?: boolean;
}

/** Scrollable body. Pass padding via className (e.g. "p-4 space-y-3") - inspectors vary. */
export const InspectorBody: React.FC<InspectorBodyProps> = ({ className, children, fill, scrollbar }) => (
  <div className={cn('flex-1 overflow-y-auto', !scrollbar && 'no-scrollbar', fill && 'min-h-0', className)}>{children}</div>
);

export { InspectorHeader } from './InspectorHeader';
export type { InspectorHeaderProps } from './InspectorHeader';
export { InspectorEmpty } from './InspectorEmpty';
export type { InspectorEmptyProps } from './InspectorEmpty';
export { InspectorFooter } from './InspectorFooter';
export type { InspectorFooterProps } from './InspectorFooter';
