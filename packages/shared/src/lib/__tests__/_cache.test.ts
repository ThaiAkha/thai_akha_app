/**
 * Test di services/_cache.ts. Sta qui, e non in services/__tests__, perche' il
 * runner della CI (`pnpm test:shared`) guarda solo lib/__tests__: allargare il
 * glob avrebbe toccato la pipeline per un file solo.
 *
 * Il modulo legge `localStorage`, `window` e `document` al caricamento: qui si
 * costruiscono finti PRIMA di importarlo, e si contano le chiamate.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';

// ── Finto localStorage con contatori e quota simulabile ──────────────────────
const store = new Map<string, string>();
const counters = { getItem: 0, setItem: 0, removeItem: 0 };
let failNextSetItem = false;
const fakeLocalStorage = {
  get length() { return store.size; },
  key: (i: number) => Array.from(store.keys())[i] ?? null,
  getItem: (k: string) => { counters.getItem += 1; return store.get(k) ?? null; },
  setItem: (k: string, v: string) => {
    counters.setItem += 1;
    if (failNextSetItem) { failNextSetItem = false; throw new Error('QuotaExceededError'); }
    store.set(k, v);
  },
  removeItem: (k: string) => { counters.removeItem += 1; store.delete(k); },
};
Object.defineProperty(globalThis, 'localStorage', { value: fakeLocalStorage, configurable: true, writable: true });

// ── Finti window/document: catturano i gestori registrati dal modulo ─────────
const handlers: Record<string, ((e: unknown) => void)[]> = {};
const fakeWindow = { addEventListener: (ev: string, fn: (e: unknown) => void) => { (handlers[ev] ??= []).push(fn); } };
const fakeDocument = { visibilityState: 'visible', addEventListener: fakeWindow.addEventListener };
Object.defineProperty(globalThis, 'window', { value: fakeWindow, configurable: true, writable: true });
Object.defineProperty(globalThis, 'document', { value: fakeDocument, configurable: true, writable: true });

const KEY = 'akha_cache_content_v16';
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
const fire = (ev: string, payload: unknown = {}) => (handlers[ev] ?? []).forEach((fn) => fn(payload));

// Il modulo si importa DOPO i finti: il cleanup di testa legge localStorage subito.
const { fetchWithCache, peekCache } = await import('../../services/_cache');

test('il blob si legge da disco UNA volta: le letture successive non toccano localStorage', async () => {
  store.set(KEY, JSON.stringify({ a: { value: 1, timestamp: 1 }, b: { value: 2, timestamp: 2 } }));
  counters.getItem = 0;
  assert.equal(peekCache('a'), 1);
  assert.equal(peekCache('b'), 2);
  await fetchWithCache('a', async () => 1);
  await fetchWithCache('b', async () => 2);
  assert.equal(counters.getItem, 1, 'un solo JSON.parse per tutte le letture');
});

test('dodici scritture ravvicinate diventano UNA scrittura su disco', async () => {
  counters.setItem = 0;
  await Promise.all(
    Array.from({ length: 12 }, (_, i) => fetchWithCache(`k${i}`, async () => ({ n: i }))),
  );
  assert.equal(counters.setItem, 0, 'nessuna scrittura sincrona nel giro delle risposte');
  await sleep(220);
  assert.equal(counters.setItem, 1, 'una sola scrittura raggruppata');
  const disk = JSON.parse(store.get(KEY)!);
  assert.equal(disk.k11.value.n, 11);
  assert.equal(disk.a.value, 1, 'le voci preesistenti restano');
});

test('a quota piena: sfratta la meta\' piu\' vecchia, tiene le voci appena scritte, e la memoria resta valida', async () => {
  counters.setItem = 0; counters.removeItem = 0;
  failNextSetItem = true;
  await fetchWithCache('fresca', async () => 'nuova');
  await sleep(220);
  assert.equal(counters.setItem, 2, 'primo tentativo fallito + riscrittura sfoltita');
  assert.equal(counters.removeItem, 0, 'non si e\' arrivati a buttare tutto');
  const disk = JSON.parse(store.get(KEY)!);
  assert.equal(disk.fresca.value, 'nuova', 'la voce appena scritta sopravvive allo sfratto');
  assert.equal(peekCache('fresca'), 'nuova', 'e resta leggibile in memoria');
  assert.ok(Object.keys(disk).length < 16, 'la meta\' piu\' vecchia e\' uscita');
});

test('un\'altra scheda scrive: si rilegge il disco tenendo sopra le nostre modifiche non ancora salvate', async () => {
  await sleep(220); // svuota eventuali flush pendenti
  // la nostra modifica, non ancora su disco
  await fetchWithCache('mia', async () => 'di questa scheda');
  // l'altra scheda scrive un blob suo
  store.set(KEY, JSON.stringify({ altrui: { value: 'dell\'altra scheda', timestamp: Date.now() } }));
  fire('storage', { key: KEY });
  assert.equal(peekCache('altrui'), 'dell\'altra scheda', 'si vede cio\' che ha scritto l\'altra');
  assert.equal(peekCache('mia'), 'di questa scheda', 'e non si perde cio\' che avevamo in sospeso');
  await sleep(220);
});

test('alla chiusura della pagina si scrive subito, senza aspettare il timer', async () => {
  counters.setItem = 0;
  await fetchWithCache('ultima', async () => 'prima di chiudere');
  assert.equal(counters.setItem, 0);
  fire('pagehide');
  assert.equal(counters.setItem, 1, 'scritto subito');
  assert.equal(JSON.parse(store.get(KEY)!).ultima.value, 'prima di chiudere');
});

test('una lista vuota non si persiste (regola preesistente, invariata)', async () => {
  counters.setItem = 0;
  await fetchWithCache('vuota', async () => []);
  await sleep(220);
  assert.equal(counters.setItem, 0);
  assert.equal(peekCache('vuota'), null);
});
