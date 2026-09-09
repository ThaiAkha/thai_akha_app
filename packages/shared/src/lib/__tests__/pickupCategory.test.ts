import { test } from 'node:test';
import assert from 'node:assert/strict';

const loaded = await import('../pickupCategory.ts');
const { zoneNeedsDriver, WALK_IN_ZONE, pickupPlaceUnset, PLACEHOLDER_HOTEL } =
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
