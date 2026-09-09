/**
 * Le regole del form contatti, che dopo la chiusura della policy vivono SOLO
 * nella edge (col service role la RLS non vale piu'). Il file non importa nulla
 * di Deno, cosi' lo esercita il runner di Node.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import * as loaded from '../../../../../supabase/functions/submit-contact/validate';
type Mod = typeof import('../../../../../supabase/functions/submit-contact/validate');
const { checkContact } = ((loaded as unknown as { default?: Mod }).default ?? loaded) as Mod;

const buono = { name: 'Ana', email: 'ana@example.com', topic: 'general', message: 'Ciao, vorrei informazioni.' };

test('un messaggio valido passa, ripulito dagli spazi', () => {
  const r = checkContact({ ...buono, name: '  Ana  ', message: ' Ciao ' });
  assert.equal(r.ok, true);
  assert.deepEqual(r.ok && r.value, { name: 'Ana', email: 'ana@example.com', topic: 'general', message: 'Ciao' });
});

test("l'esca compilata si scarta in silenzio, senza dire che e' stata scartata", () => {
  const r = checkContact({ ...buono, website: 'http://spam.example' });
  assert.equal(r.ok, false);
  assert.equal(r.ok === false && 'silent' in r, true);
});

test('gli stessi limiti della policy che viene tolta', () => {
  assert.equal(checkContact({ ...buono, name: '' }).ok, false);
  assert.equal(checkContact({ ...buono, name: 'a'.repeat(201) }).ok, false);
  assert.equal(checkContact({ ...buono, name: 'a'.repeat(200) }).ok, true);
  assert.equal(checkContact({ ...buono, message: 'x'.repeat(8001) }).ok, false);
  assert.equal(checkContact({ ...buono, message: 'x'.repeat(8000) }).ok, true);
  assert.equal(checkContact({ ...buono, topic: '' }).ok, false);
});

test('la chiocciola non vale in prima ne in ultima posizione', () => {
  for (const email of ['@example.com', 'ana@', 'anaexample.com', 'a@'])
    assert.equal(checkContact({ ...buono, email }).ok, false, email);
  assert.equal(checkContact({ ...buono, email: 'a@b' }).ok, true);
});

test('campi assenti o di tipo sbagliato non passano', () => {
  assert.equal(checkContact({}).ok, false);
  assert.equal(checkContact({ ...buono, name: 42 }).ok, false);
  assert.equal(checkContact({ ...buono, message: null }).ok, false);
});
