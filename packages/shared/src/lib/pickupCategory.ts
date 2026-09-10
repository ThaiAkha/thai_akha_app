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
/** `null` = nessuna posizione accesa: la riconsegna non e' ancora stata decisa. */
export type DropoffPosition = 'walk_off' | 'same' | 'elsewhere' | null;

/**
 * Lo stato della riconsegna come lo tiene il database, per NOME.
 *
 * Dal 2026-09-10 `bookings.dropoff_mode` porta cinque nomi invece di una booleana che
 * significava due cose opposte (nel sito "spento" voleva dire «riportami dove mi avete
 * preso», nel planner `false` voleva dire «non riportarmi»: 11 righe su 61 erano in uno
 * stato che nessuno aveva scelto).
 */
export type DropoffMode = 'same' | 'to_define' | 'none' | 'point' | 'hotel';

/** Cio' che il database sa della riconsegna di una prenotazione. */
export interface DropoffState {
    /** `bookings.dropoff_mode`. Assente = riga non ancora convertita: si ripiega sui vecchi campi. */
    mode?: DropoffMode | string | null;
    /** `bookings.dropoff_meeting_point`. Vale solo con mode 'point'. */
    meetingPoint?: string | null;
}

export function dropoffPosition(
    requiresDropoff: boolean | null | undefined,
    dropoffHotel: string | null | undefined,
    sameAsPickupAllowed: boolean,
    /**
     * Luogo del RITIRO. Serve perche' una destinazione identica al ritiro non e' una
     * destinazione diversa: e' "stesso posto" scritto due volte. La console di
     * prenotazione le fabbricava (40 righe su 62 il 2026-09-09), e senza questo confronto
     * l'ispettore accendeva "luogo diverso" su tutto. Il front la stessa domanda la fa
     * da tempo: `dropoff_hotel && dropoff_hotel !== hotel_name` (useBookingLoader).
     */
    pickupHotel?: string | null,
    /**
     * Lo stato scritto per NOME. Quando c'e', decide lui: e' il dato, non un indizio.
     *
     * Aggiunto in coda e facoltativo di proposito, per non rompere i chiamanti mentre
     * migrano. Non e' la forma definitiva: quando tutti passano il nome, i quattro
     * parametri di sopra diventano il ripiego e questa firma va accorciata.
     */
    stato?: DropoffState
): DropoffPosition {
    // ── IL NOME, quando c'e', VIENE PRIMA DI TUTTO ────────────────────────────
    // Non e' una preferenza di stile: i vecchi parametri sono SINTOMI, e i sintomi
    // sbagliano. Una riga diretta a un punto di riconsegna ha la destinazione in
    // `dropoff_meeting_point` e `dropoff_hotel` NULL: dedotta dai sintomi diventa
    // "stesso posto", cioe' il pannello dice «riportalo dove l'hai preso» a chi va
    // all'aeroporto. Misurato su TAK00189 il 2026-09-10.
    const mode = stato?.mode ?? null;
    if (mode) {
        switch (mode) {
            case 'none':      return 'walk_off';
            case 'hotel':     return 'elsewhere';
            case 'point':     return 'elsewhere';
            // 'to_define' NON accende nessuna posizione, come `pickupPosition` per il
            // ritiro non ancora scelto: e' il valore di partenza di OGNI prenotazione con
            // punto d'incontro, e accendere un pulsante vorrebbe dire scegliere al posto
            // del manager, in massa. Il pannello mostra "da definire" e una riga che dice
            // di chi e' il turno - mai il vuoto muto, che si legge come guasto.
            case 'to_define': return null;
            case 'same':
                // `sameAsPickupAllowed` resta come difesa, non come traduttore: dal
                // 2026-09-10 "stesso posto" con ritiro walk-in e' vietato nel database
                // (non si riporta dove non si e' preso nessuno). Se arriva lo stesso,
                // meglio "luogo diverso" che una posizione che la UI non sa disegnare.
                return sameAsPickupAllowed ? 'same' : 'elsewhere';
        }
    }

    // ── RIPIEGO per le righe non ancora convertite (mode assente) ─────────────
    // Solo un `false` esplicito significa "se ne va da se'": NULL nel database vale
    // "il ritorno serve", come fa il lettore della pagina.
    if (requiresDropoff === false) return 'walk_off';
    const dest = (dropoffHotel ?? null);
    if (dest === null) return sameAsPickupAllowed ? 'same' : 'elsewhere';
    const d = dest.trim();
    // '' = destinazione scelta e non ancora compilata: la posizione e' quella premuta.
    if (d === '') return 'elsewhere';
    const p = (pickupHotel ?? '').trim();
    if (p !== '' && d.toLowerCase() === p.toLowerCase()) {
        return sameAsPickupAllowed ? 'same' : 'elsewhere';
    }
    return 'elsewhere';
}
