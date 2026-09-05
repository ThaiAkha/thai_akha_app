import { test } from 'node:test';
import assert from 'node:assert/strict';
import { parseLangList } from '../i18n';

test('vuota o assente -> solo inglese', () => {
  assert.deepEqual(parseLangList(''), ['en']);
  assert.deepEqual(parseLangList(undefined), ['en']);
  assert.deepEqual(parseLangList(null), ['en']);
});

test('una lingua, con spazi e maiuscole tollerati', () => {
  assert.deepEqual(parseLangList('es'), ['en', 'es']);
  assert.deepEqual(parseLangList(' es '), ['en', 'es']);
  assert.deepEqual(parseLangList('ES'), ['en', 'es']);
});

test("l'ordine e' quello del perimetro, mai quello digitato", () => {
  assert.deepEqual(parseLangList('fr,es'), ['en', 'es', 'fr']);
  assert.deepEqual(parseLangList('ja, es ,de'), ['en', 'es', 'de', 'ja']);
});

test('codici fuori perimetro scartati, duplicati assorbiti, en gia\' dentro', () => {
  assert.deepEqual(parseLangList('es,hi'), ['en', 'es']);
  assert.deepEqual(parseLangList('es,es'), ['en', 'es']);
  assert.deepEqual(parseLangList('en'), ['en']);
});

test('nessuna parola magica e fail-closed sui refusi', () => {
  assert.deepEqual(parseLangList('all'), ['en']);
  assert.deepEqual(parseLangList('true'), ['en']);
  assert.deepEqual(parseLangList('es;fr'), ['en']);
});
