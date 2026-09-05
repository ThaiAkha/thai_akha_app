import { test } from 'node:test';
import assert from 'node:assert/strict';
import { nativeNameFor, nativeNameLine } from '../nativeName';

const galangal = { name: 'Galangal', name_th: 'ข่า', phonetic: 'kha' };

test('EN: titolo latino, ponte thai + traslitterato come oggi', () => {
  assert.deepEqual(nativeNameFor(galangal, 'en'), { thai: 'ข่า', phonetic: 'kha' });
  assert.equal(nativeNameLine(galangal, 'en'), 'ข่า  [kha]');
});

test('ES: identico a EN (il ponte serve a ogni lingua non thai)', () => {
  assert.deepEqual(nativeNameFor(galangal, 'es'), { thai: 'ข่า', phonetic: 'kha' });
});

test('TH: titolo gia\' thai (fuso dal sidecar) -> nessun doppione, nessun traslitterato', () => {
  assert.deepEqual(nativeNameFor({ ...galangal, name: 'ข่า' }, 'th'), { thai: null, phonetic: null });
  assert.equal(nativeNameLine({ ...galangal, name: 'ข่า' }, 'th'), null);
});

test('TH, ricetta col sidecar ancora inglese: il ponte thai resta, il traslitterato no', () => {
  assert.deepEqual(
    nativeNameFor({ name: 'Thai Green Curry', thai_name: 'แกงเขียวหวาน', phonetic: 'kaeng khiao wan' }, 'th'),
    { thai: 'แกงเขียวหวาน', phonetic: null },
  );
});

test('TH, titolo thai DIVERSO dal nome breve: niente seconda riga thai', () => {
  assert.deepEqual(nativeNameFor({ name: 'แกงมัสมั่นไก่', thai_name: 'แกงมัสมั่น' }, 'th'), { thai: null, phonetic: null });
});

test('confronto normalizzato: spazi, maiuscole e NFC non riaprono il doppione', () => {
  assert.equal(nativeNameFor({ name: 'Pad Thai ', name_th: 'pad  thai' }, 'en').thai, null);
});

test('campi assenti o vuoti -> null, mai stringa vuota', () => {
  assert.deepEqual(nativeNameFor({ name: 'Galangal' }, 'en'), { thai: null, phonetic: null });
  assert.deepEqual(nativeNameFor({ name: 'Galangal', name_th: '  ', phonetic: '' }, 'en'), { thai: null, phonetic: null });
});
