/**
 * Punto d'ingresso unico dei primitivi inspector. I 6 adopter storici importano ancora
 * dal percorso profondo `./InspectorShell`, che ri-esporta i nomi spostati.
 */
export { InspectorShell, InspectorBody } from './InspectorShell';
export type { InspectorBodyProps } from './InspectorShell';
export { InspectorHeader } from './InspectorHeader';
export type { InspectorHeaderProps } from './InspectorHeader';
export { InspectorEmpty } from './InspectorEmpty';
export type { InspectorEmptyProps } from './InspectorEmpty';
export { InspectorFooter } from './InspectorFooter';
export type { InspectorFooterProps } from './InspectorFooter';
export { InspectorLeader } from './InspectorLeader';
export type { InspectorLeaderProps } from './InspectorLeader';
export { InspectorDeleteZone } from './InspectorDeleteZone';
export type { InspectorDeleteZoneProps } from './InspectorDeleteZone';
export {
  InspectorEditButton,
  InspectorSaveButton,
  InspectorCancelButton,
  InspectorPrimaryButton,
} from './InspectorActionButtons';
