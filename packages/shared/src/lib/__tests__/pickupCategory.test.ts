import { test } from 'node:test';
import assert from 'node:assert/strict';

const loaded = await import('../pickupCategory.ts');
const { zoneNeedsDriver, WALK_IN_ZONE, pickupPlaceUnset, PLACEHOLDER_HOTEL, pickupPosition, dropoffPosition, isWalkOff, dropoffPlace } =
    (loaded as { default?: typeof import('../pickupCategory.ts') }).default ?? loaded;

// 1. RITIRO IN HOTEL: nessun punto d'incontro, una zona vera. L'autista serve.
test('hotel: zona vera senza punto -> serve l\'autista', () => {
    assert.equal(zoneNeedsDriver(null, null, 'green'), true);
    assert.equal(zoneNeedsDriver(null, null, 'outside'), true);
});

// 2. PUNTO DI CITTA': l'autista passa a prendere. E' il caso che spariva.
test('punto di citta\' (pickup) -> serve l\'autista, QUALUNQUE sia la zona', () => {
    assert.equal(zoneNeedsDriver('mp_mcdonalds', 'pickup', 'green'), true);
    // il caso vero TAK00171: punto di tipo pickup marcato walk-in dal vecchio difetto.
    // La zona diceva "niente autista", il tipo dice il contrario, e vince il tipo.
    assert.equal(zoneNeedsDriver('mp_mcdonalds', 'pickup', WALK_IN_ZONE), true);
    assert.equal(zoneNeedsDriver('mp_airport_gate_1', 'pickup', null), true);
});

// 3. PUNTO WALK-IN: l'ospite arriva da se'. Nessun autista.
test('punto walk-in -> nessun autista, QUALUNQUE sia la zona', () => {
    assert.equal(zoneNeedsDriver('mp_school', 'walk_in', WALK_IN_ZONE), false);
    // i casi veri TAK00103 e TAK00120: punto walk_in con zona 'outside' per retaggio.
    // Prima la zona li mandava fra i "da assegnare"; il tipo li rimette al loro posto.
    assert.equal(zoneNeedsDriver('mp_school', 'walk_in', 'outside'), false);
    assert.equal(zoneNeedsDriver('mp_wat_pan_whaen', 'walk_in', null), false);
});

test('la zona walk-in senza punto resta un walk-in (righe nate cosi\')', () => {
    assert.equal(zoneNeedsDriver(null, null, WALK_IN_ZONE), false);
});

test('il sentinello "" non e\' un punto: decide la zona', () => {
    // '' = "punto d'incontro, modalita' scelta ma punto non ancora selezionato".
    assert.equal(zoneNeedsDriver('', null, 'green'), true);
    assert.equal(zoneNeedsDriver('', null, WALK_IN_ZONE), false);
});

test('un tipo assente o inatteso resta assegnabile: mai far scomparire una riga', () => {
    // punto disattivato, quindi non presente nella lista caricata -> tipo null
    assert.equal(zoneNeedsDriver('mp_scomparso', null, 'green'), true);
    assert.equal(zoneNeedsDriver('mp_scomparso', null, WALK_IN_ZONE), true);
    // un punto di sola riconsegna finito qui per errore: si vede, non si nasconde
    assert.equal(zoneNeedsDriver('mp_saturday_market', 'dropoff', null), true);
});

test('nessuna zona e nessun punto: va assegnato', () => {
    assert.equal(zoneNeedsDriver(null, null, null), true);
    assert.equal(zoneNeedsDriver(undefined, undefined, undefined), true);
});

// ── il luogo di ritiro: "non scelto" ha DUE forme ───────────────────────────
test('il segnaposto del front conta come "non scelto", anche se il campo e\' pieno', () => {
    // e' il caso che il vecchio calcolo sbagliava: campo pieno, luogo assente
    assert.equal(pickupPlaceUnset(PLACEHOLDER_HOTEL, null), true);
    assert.equal(pickupPlaceUnset('  Update in profile  ', null), true);
});

test('campo vuoto o assente: non scelto', () => {
    assert.equal(pickupPlaceUnset('', null), true);
    assert.equal(pickupPlaceUnset(null, null), true);
    assert.equal(pickupPlaceUnset(undefined, undefined), true);
    assert.equal(pickupPlaceUnset('   ', null), true);
});

test('un hotel vero e\' un luogo scelto', () => {
    assert.equal(pickupPlaceUnset('Rimping Village', null), false);
});

test('un punto d\'incontro e\' un luogo: basta da solo', () => {
    assert.equal(pickupPlaceUnset(null, 'mp_school'), false);
    // anche col segnaposto nel campo hotel: il punto vince
    assert.equal(pickupPlaceUnset(PLACEHOLDER_HOTEL, 'mp_cen_airport'), false);
});

test('il sentinello "" del punto non e\' un punto', () => {
    assert.equal(pickupPlaceUnset(PLACEHOLDER_HOTEL, ''), true);
});

// ── le tre posizioni del comando, piu' il "da decidere" ─────────────────────
test('hotel vero -> posizione hotel', () => {
    assert.equal(pickupPosition(null, null, 'Rimping Village'), 'hotel');
});

test('punto di citta\' -> posizione punto d\'incontro', () => {
    assert.equal(pickupPosition('mp_cen_airport', 'pickup', null), 'meeting_point');
});

test('punto walk-in -> posizione walk-in', () => {
    assert.equal(pickupPosition('mp_school', 'walk_in', null), 'walk_in');
});

test('IL CASO CHE ROMPEVA IL COMANDO: modalita\' scelta, punto ancora no', () => {
    // '' e' falso in JS: il vecchio comando accendeva "hotel" mentre mostrava la
    // tendina dei punti. La posizione la porta il TIPO, non la verita' della stringa.
    assert.equal(pickupPosition('', 'pickup', ''), 'meeting_point');
    assert.equal(pickupPosition('', 'walk_in', ''), 'walk_in');
    // e non cade su "da decidere" solo perche' il campo hotel e' stato svuotato
    assert.notEqual(pickupPosition('', 'pickup', ''), null);
});

test('prenotazione nata dal sito -> NESSUNA posizione, non walk-in', () => {
    // il segnaposto piu' la zona walk-in non sono una scelta: sono la sua assenza
    assert.equal(pickupPosition(null, null, PLACEHOLDER_HOTEL), null);
    assert.equal(pickupPosition(null, null, null), null);
    assert.equal(pickupPosition(undefined, undefined, ''), null);
});

test('punto con tipo sconosciuto -> punto d\'incontro, cioe\' assegnabile', () => {
    assert.equal(pickupPosition('mp_spento', null, null), 'meeting_point');
});

// ── le tre posizioni del ritorno ────────────────────────────────────────────
test('requires_dropoff false -> walk-off', () => {
    assert.equal(dropoffPosition(false, null, true), 'walk_off');
    // vince su tutto: anche con una destinazione scritta, il ritorno non serve
    assert.equal(dropoffPosition(false, 'Rimping Village', true), 'walk_off');
});

test('nessuna destinazione -> lo riportiamo dove l\'abbiamo preso', () => {
    assert.equal(dropoffPosition(true, null, true), 'same');
    // NULL nel database vale "il ritorno serve", come fa il lettore della pagina
    assert.equal(dropoffPosition(null, null, true), 'same');
    assert.equal(dropoffPosition(undefined, null, true), 'same');
});

test('una destinazione -> altrove', () => {
    assert.equal(dropoffPosition(true, 'Shangri-La', true), 'elsewhere');
});

test('IL SENTINELLO: destinazione scelta ma non ancora compilata', () => {
    // '' e' falso in JS: guardando la verita' del campo il comando si sarebbe acceso
    // su "stesso posto" mentre l'operatore aveva premuto "altrove".
    assert.equal(dropoffPosition(true, '', true), 'elsewhere');
});

test('col ritiro walk-in "stesso posto" non esiste: si cade su altrove', () => {
    // chi non e' stato preso da nessuna parte non puo' essere riportato "dove l'abbiamo
    // preso": la regola dell'owner del 2026-09-09.
    assert.equal(dropoffPosition(true, null, false), 'elsewhere');
    assert.equal(dropoffPosition(null, null, false), 'elsewhere');
    // ma walk-off resta raggiungibile anche da un walk-in: se ne va da se'
    assert.equal(dropoffPosition(false, null, false), 'walk_off');
});

test('una COPIA del luogo di ritiro non e\' una destinazione diversa', () => {
    // 40 righe su 62 erano cosi': la console le fabbricava copiando il ritiro.
    assert.equal(dropoffPosition(true, 'Rimping Village', true, 'Rimping Village'), 'same');
    // confronto tollerante su spazi e maiuscole: e' testo scritto a mano
    assert.equal(dropoffPosition(true, '  rimping village ', true, 'Rimping Village'), 'same');
    // una destinazione davvero diversa resta "altrove"
    assert.equal(dropoffPosition(true, 'Shangri-La', true, 'Rimping Village'), 'elsewhere');
});

test('la copia col ritiro walk-in resta "altrove": "stesso posto" non esiste', () => {
    assert.equal(dropoffPosition(true, 'Rimping Village', false, 'Rimping Village'), 'elsewhere');
});

test('senza sapere il luogo di ritiro, una destinazione vale come diversa', () => {
    assert.equal(dropoffPosition(true, 'Rimping Village', true, null), 'elsewhere');
    assert.equal(dropoffPosition(true, 'Rimping Village', true), 'elsewhere');
});

// ── lo stato per NOME (bookings.dropoff_mode), dal 2026-09-10 ───────────────
// Quando il nome c'e', decide lui: i quattro parametri di prima sono SINTOMI, e i
// sintomi sbagliano. Ogni caso qui sotto passa di proposito dei vecchi valori che
// da soli darebbero una risposta diversa: e' la prova che il nome vince.

test('nome "none" -> walk-off, anche se i vecchi campi direbbero altro', () => {
    assert.equal(dropoffPosition(true, null, true, null, { mode: 'none' }), 'walk_off');
});

test('nome "hotel" -> luogo diverso', () => {
    assert.equal(dropoffPosition(true, 'Shangri-La', true, null, { mode: 'hotel' }), 'elsewhere');
});

test('nome "point" -> luogo diverso ANCHE senza dropoff_hotel', () => {
    // E' il caso che si sbagliava: la destinazione vive in dropoff_meeting_point e
    // dropoff_hotel e' NULL, quindi il vecchio ramo rispondeva "stesso posto" e il
    // pannello diceva «riportalo dove l'hai preso» a chi va all'aeroporto (TAK00189).
    assert.equal(
        dropoffPosition(true, null, true, null, { mode: 'point', meetingPoint: 'mp_airport_gate1' }),
        'elsewhere'
    );
    // controprova: senza il nome, gli stessi identici valori sbagliano
    assert.equal(dropoffPosition(true, null, true, null), 'same');
});

test('nome "to_define" -> NESSUNA posizione accesa', () => {
    // Come pickupPosition per il ritiro non scelto: e' il valore di partenza di ogni
    // prenotazione con punto d'incontro, e accendere un pulsante vorrebbe dire
    // scegliere al posto del manager, in massa.
    assert.equal(dropoffPosition(true, null, true, null, { mode: 'to_define' }), null);
    assert.equal(dropoffPosition(false, 'Shangri-La', true, null, { mode: 'to_define' }), null);
});

test('nome "same" -> stesso posto, e degrada solo se il ritiro non lo permette', () => {
    assert.equal(dropoffPosition(true, null, true, null, { mode: 'same' }), 'same');
    // walk-in: "riportami dove mi avete preso" non vuol dire niente per chi e'
    // arrivato a piedi. Vietato nel database dal 10/09; qui resta la difesa.
    assert.equal(dropoffPosition(true, null, false, null, { mode: 'same' }), 'elsewhere');
});

test('nome assente -> si ripiega sui vecchi campi, comportamento invariato', () => {
    assert.equal(dropoffPosition(false, null, true, null, undefined), 'walk_off');
    assert.equal(dropoffPosition(true, null, true, null, {}), 'same');
    assert.equal(dropoffPosition(true, null, true, null, { mode: null }), 'same');
});


// ── isWalkOff: il criterio del filtro della pagina, il nome prima dei sintomi ──

test('walk-off: il nome "none" vince anche su una booleana che dice il contrario', () => {
    // Il caso che ha fatto sparire le persone: la riga dice "none", il vecchio campo
    // e' rimasto a true. Senza il nome, il filtro la teneva fra chi va riportato.
    assert.equal(isWalkOff(true, { mode: 'none' }), true);
    assert.equal(isWalkOff(false, { mode: 'none' }), true);
});

test('walk-off: "to_define" NON e\' walk-off - non deciso non vuol dire no', () => {
    // Chi non ha deciso va mostrato a chi smista, altrimenti sparisce dalla pagina
    // esattamente come sparivano i walk-off prima di questa colonna.
    assert.equal(isWalkOff(true, { mode: 'to_define' }), false);
    assert.equal(isWalkOff(false, { mode: 'to_define' }), false);
});

test('walk-off: gli altri tre nomi vogliono un viaggio di ritorno', () => {
    assert.equal(isWalkOff(false, { mode: 'same' }), false);
    assert.equal(isWalkOff(false, { mode: 'hotel' }), false);
    assert.equal(isWalkOff(false, { mode: 'point' }), false);
});

test('walk-off: senza nome si ripiega sulla booleana, comportamento invariato', () => {
    assert.equal(isWalkOff(false), true);
    assert.equal(isWalkOff(true), false);
    // NULL non e' "se ne va da se'": e' "nessuno l'ha ancora detto", e il ritorno serve.
    assert.equal(isWalkOff(null), false);
    assert.equal(isWalkOff(undefined), false);
    assert.equal(isWalkOff(false, { mode: null }), true);
});


// ── dropoffPlace: i tre pulsanti del ritorno (decisione owner 2026-09-10) ──

test('tre luoghi: il punto d\'incontro ha il suo pulsante, che prima non esisteva', () => {
    // TAK00189 va a MAYA: prima il pannello non aveva modo di dirlo, e dedotto dai
    // sintomi diventava "stesso posto" - cioe' «riportalo dove l'hai preso» a chi
    // aveva chiesto una fermata diversa.
    assert.equal(
        dropoffPlace(true, null, 'Amiri Place Hotel', { mode: 'point', meetingPoint: 'mp_maya' }),
        'meeting_point'
    );
});

test('tre luoghi: "stesso posto" e "altro hotel" premono lo STESSO pulsante', () => {
    // Non e' una perdita di informazione: la differenza resta nel nome salvato, e
    // 'same' NON scrive una copia del nome nella colonna della destinazione.
    assert.equal(dropoffPlace(true, null, 'Asa Hotel', { mode: 'same' }), 'hotel');
    assert.equal(dropoffPlace(true, 'Shangri-La', 'Asa Hotel', { mode: 'hotel' }), 'hotel');
});

test('tre luoghi: se ne va da se\'', () => {
    assert.equal(dropoffPlace(false, null, 'Asa Hotel', { mode: 'none' }), 'walk_off');
    // anche contro una booleana rimasta indietro
    assert.equal(dropoffPlace(true, null, null, { mode: 'none' }), 'walk_off');
});

test('tre luoghi: "to_define" non accende niente, e il pannello deve dirlo', () => {
    assert.equal(dropoffPlace(true, null, 'Asa Hotel', { mode: 'to_define' }), null);
});

test('tre luoghi: riga non convertita -> hotel, e una copia resta una copia', () => {
    // destinazione identica al ritiro: e' "stesso posto" scritto due volte, non un
    // luogo diverso. In questo comando e' comunque il pulsante hotel.
    assert.equal(dropoffPlace(true, 'Asa Hotel', 'Asa Hotel'), 'hotel');
    assert.equal(dropoffPlace(true, null, 'Asa Hotel'), 'hotel');
    assert.equal(dropoffPlace(false, null, 'Asa Hotel'), 'walk_off');
});
