// Path: packages/shared/src/lib/pickupCategory.ts
//
// LE TRE CATEGORIE DI RITIRO, in un posto solo e con dei test.
//
// Sta qui, e non nella pagina che lo usa, perche' questo criterio e' stato sbagliato
// due volte nello stesso giorno: prima mancava del tutto (le prenotazioni senza autista
// non comparivano in nessuna colonna del Driver Planner), poi e' stato scritto sulla
// ZONA, che confonde due categorie diverse. Una regola che decide chi vede cosa merita
// un test, non un commento.
import type { MeetingPointType } from '../types/pickup.types';

/** La zona dei walk-in. E' un id vero di `pickup_zones`, non un sentinello. */
export const WALK_IN_ZONE = 'walk-in';

/**
 * Serve un autista a questa prenotazione?
 *
 *   1. ritiro in hotel     meeting_point NULL, zona vera dell'hotel          -> SI
 *   2. punto d'incontro    point_type 'pickup': 8 punti di citta' (aeroporto, -> SI
 *      con ritiro          stazione, McDonald's Tha Phae Gate...)
 *   3. punto d'incontro    point_type 'walk_in': 2 punti (la cucina e         -> NO
 *      walk-in             Wat Pan Whaen), orari "arriva entro"
 *
 * Il criterio NON puo' essere la zona: l'ispettore scriveva `pickup_zone = 'walk-in'`
 * per QUALUNQUE punto scelto, schiacciando la 2 sulla 3. Chi si presentava al
 * McDonald's e aveva bisogno dell'autista finiva nella colonna walk-in e spariva da
 * ogni colonna autista. Il tipo e' un dato del PUNTO, non una scelta di chi compila:
 * se il punto c'e', decide lui, e la zona non ha voce in capitolo.
 *
 * Solo un 'walk_in' ESPLICITO esclude l'autista. Tipo assente (punto disattivato, o
 * non ancora caricato) o inatteso ('dropoff' finito qui per errore) restano
 * assegnabili: meglio una riga in piu' da guardare che una riga che scompare.
 *
 * `meetingPointId` vuoto ('') e' il sentinello della UI "punto d'incontro, non ancora
 * scelto": non e' un punto, quindi si guarda la zona.
 */
export function zoneNeedsDriver(
    meetingPointId: string | null | undefined,
    meetingPointType: MeetingPointType | null | undefined,
    pickupZone: string | null | undefined
): boolean {
    if (meetingPointId) return meetingPointType !== 'walk_in';
    return (pickupZone ?? '') !== WALK_IN_ZONE;
}
