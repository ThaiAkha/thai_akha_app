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

/**
 * Le tre posizioni del comando "dove prendiamo l'ospite" nell'ispettore della logistica,
 * piu' una quarta che non e' una posizione: NULL = nessuna scelta fatta.
 *
 * PERCHE' NON SI DERIVA DALLA VERITA'/FALSITA' DI `meeting_point`. Il sentinello della
 * modalita' "punto d'incontro, punto non ancora scelto" e' la stringa VUOTA, che in
 * JavaScript e' falsa: il comando a due pulsanti accendeva quindi "Pickup at Hotel" per
 * tutto il tempo in cui l'operatore stava scegliendo il punto, cioe' il pulsante premuto
 * restava spento e si illuminava l'altro. Con tre posizioni lo stesso errore ne
 * accenderebbe una sbagliata in modo stabile. Qui la posizione si deriva da una CATEGORIA
 * esplicita: presenza della modalita' (`meeting_point` non nullo, '' compreso) e tipo.
 *
 * E LA QUARTA. Una prenotazione nata dal sito ha il segnaposto nel campo hotel e la zona
 * 'walk-in': non e' un walk-in scelto, e' l'ASSENZA di una scelta. Derivandola dai dati
 * si aprirebbe pre-posizionata su WALK-IN, che e' proprio la posizione che toglie
 * l'autista, e il primo salvataggio trasformerebbe una supposizione in una decisione.
 * Quindi torna NULL, e il pannello mostra "da decidere" invece di una scelta che nessuno
 * ha fatto.
 */
export type PickupPosition = 'hotel' | 'meeting_point' | 'walk_in' | null;

export function pickupPosition(
    meetingPointId: string | null | undefined,
    meetingPointType: MeetingPointType | null | undefined,
    hotelName: string | null | undefined
): PickupPosition {
    // Modalita' punto d'incontro scelta: vale anche col punto non ancora selezionato ('').
    if (meetingPointId !== null && meetingPointId !== undefined) {
        return meetingPointType === 'walk_in' ? 'walk_in' : 'meeting_point';
    }
    if (pickupPlaceUnset(hotelName, meetingPointId)) return null;
    return 'hotel';
}

/**
 * Le tre posizioni del comando "come torna a casa": se ne va da se', lo riportiamo dove
 * l'abbiamo preso, oppure altrove.
 *
 * WALK-OFF era un comando MANCANTE, non un doppione: nell'admin **nessuno scriveva
 * `requires_dropoff`** (l'unica scrittura era il passaggio di cio' che era stato letto),
 * quindi il manager non aveva modo di dire che un ospite non ha bisogno del ritorno. Nei
 * dati lo stato esiste — 12 prenotazioni su 62 senza rientro — e arrivava da fuori: da
 * questa pagina non si raggiungeva. E' la simmetria del ritiro: walk-in = arriva da se',
 * walk-off = se ne va da se'.
 *
 * Come per il ritiro, la posizione NON si deriva dalla verita' di `dropoff_hotel`: quel
 * campo vale '' mentre si scegle la destinazione, e '' e' falso. Sarebbe la quarta volta
 * che lo stesso errore accende il pulsante sbagliato, e con tre stati invece di due.
 *
 * `sameAsPickupAllowed` e' falso quando il ritiro e' un walk-in: "riportalo dove l'abbiamo
 * preso" non esiste per chi non e' stato preso da nessuna parte (regola dell'owner).
 */
export type DropoffPosition = 'walk_off' | 'same' | 'elsewhere';

export function dropoffPosition(
    requiresDropoff: boolean | null | undefined,
    dropoffHotel: string | null | undefined,
    sameAsPickupAllowed: boolean
): DropoffPosition {
    // Solo un `false` esplicito significa "se ne va da se'": NULL nel database vale
    // "il ritorno serve", come fa il lettore della pagina.
    if (requiresDropoff === false) return 'walk_off';
    if ((dropoffHotel ?? null) !== null) return 'elsewhere';
    return sameAsPickupAllowed ? 'same' : 'elsewhere';
}
