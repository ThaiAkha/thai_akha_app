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
 * Segnaposto che il FRONT scrive nel campo hotel alla creazione della prenotazione,
 * finche' il cliente non sceglie il ritiro (`useBookingSubmit.buildBookingPayload`).
 *
 * Non e' un nome di hotel: e' uno STATO codificato in una frase inglese dentro un campo
 * di testo libero, e confrontato con `===`. Chiunque scriva quella frase a mano nel campo,
 * o la traduca, cambia lo stato della prenotazione senza saperlo. Va detto qui perche' chi
 * legge `hotel_name` non pieno non sospetta che "pieno" possa voler dire "vuoto".
 *
 * La edge ha per necessita' la SUA copia (Deno non importa dal workspace pnpm):
 * `supabase/functions/_shared/b2cEmailI18n.ts`, costante `PLACEHOLDER_HOTEL`, dove decide
 * cosa l'email dice al cliente. Se questa stringa cambia, vanno cambiate entrambe.
 */
export const PLACEHOLDER_HOTEL = 'Update in profile';

/**
 * Il luogo di ritiro non e' ancora stato scelto?
 *
 * Serve perche' "non scelto" in questo database ha DUE forme: il campo davvero vuoto, e
 * il segnaposto qui sopra. La pagina della logistica calcolava `!hotel_name &&
 * !meeting_point`, che prende solo la prima: le prenotazioni nate dal sito hanno il
 * segnaposto, quindi risultavano COMPLETE proprio mentre erano le uniche incomplete
 * (misurato il 2026-09-09: le due righe dichiarate incomplete non erano le due righe
 * incomplete). Un segnale sbagliato che sembra funzionare e' peggio di un segnale assente.
 *
 * Un punto d'incontro scelto e' un luogo: chi ce l'ha non e' incompleto, anche senza hotel.
 */
export function pickupPlaceUnset(
    hotelName: string | null | undefined,
    meetingPointId: string | null | undefined
): boolean {
    if (meetingPointId) return false;
    const name = (hotelName ?? '').trim();
    return name === '' || name === PLACEHOLDER_HOTEL;
}

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
