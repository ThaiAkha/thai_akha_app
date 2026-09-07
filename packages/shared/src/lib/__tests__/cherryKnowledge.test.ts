/**
 * Sapere statico di Cherry sopra i fatti GENERATI (generated/facts.<lang>.ts).
 * Legge i file veri del repo: se il generatore cambia forma, si vede qui.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { getCherryFacts, getStaticKnowledge, getAllStaticKnowledge, matchKnowledge, CHERRY_KNOWLEDGE } from '../../data/cherry/knowledge';

test('i fatti inglesi ci sono e hanno le cinque famiglie', async () => {
  const f = await getCherryFacts('en');
  assert.equal(f.lang, 'en');
  assert.equal(f.classes.length, 2);
  assert.ok(f.meetingPoints.length >= 10);
  assert.ok(f.dishes.reduce((n, d) => n + d.items.length, 0) >= 20);
  assert.ok(f.diets.allergies.length >= 10);
  assert.ok(f.business.address.includes('Chiang Mai'));
});

test('lingua sconosciuta cade sull\'inglese, spagnolo arriva tradotto', async () => {
  const xx = await getCherryFacts('xx');
  assert.equal(xx.lang, 'en');
  const es = await getCherryFacts('es');
  assert.equal(es.lang, 'es');
  assert.notEqual(es.classes[0].title, xx.classes[0].title);
  assert.equal(es.classes[0].priceThb, xx.classes[0].priceThb); // i numeri non si traducono
});

test('prezzo della classe: blocco CLASS INFO con prezzo, orario e capienza dal DB', async () => {
  const block = await getStaticKnowledge('how much is the morning class?', 'en');
  assert.ok(block.includes('### CLASS INFO'));
  assert.ok(/1,400 THB/.test(block));
  assert.ok(/09:00-14:30/.test(block));
  assert.ok(/up to 24 together/.test(block), 'la capienza viene dal database, non dal vecchio "12 per class"');
});

test('livello base sempre presente: zone con inizio e fine, Azure compresa, anche senza intento', async () => {
  const block = await getStaticKnowledge('hello', 'en');
  assert.ok(block.startsWith('### CORE FACTS'));
  assert.ok(/Azure[^;]*08:40-09:00 \/ 16:40-17:00/.test(block), block);
  assert.ok(/1,400 THB/.test(block) && /up to 24 together/.test(block));
  assert.ok(!block.includes('### CLASS INFO'), 'il dettaglio resta a intento');
  const es = await getStaticKnowledge('hola', 'es');
  assert.ok(/Zona Verde|Verde/.test(es) || /Green/.test(es), es.slice(0, 300));
});

test('punti di ritrovo: aeroporti e riconsegne, che prima mancavano', async () => {
  const block = await getStaticKnowledge('where do we meet if my hotel is outside the zone?', 'en');
  assert.ok(block.includes('### MEETING POINTS'));
  assert.ok(block.includes('Wat Pan Whaen'));
  assert.ok(block.includes('Airport'));
  assert.ok(block.includes('Drop-off'));
});

test('nessun intento: solo il livello base; la voce prende tutto', async () => {
  assert.deepEqual(matchKnowledge('hello').map((m) => m.id), ['core']);
  const all = await getAllStaticKnowledge('es');
  const facts = await getCherryFacts('es');
  for (const m of CHERRY_KNOWLEDGE) {
    const head = m.build(facts).split('\n')[0];
    assert.ok(head.startsWith('### ') && all.includes(head), m.id);
  }
  assert.ok(all.includes('Clase de cocina por la mañana'));
});
