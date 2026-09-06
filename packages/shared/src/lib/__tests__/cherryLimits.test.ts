import { test } from 'node:test';
import assert from 'node:assert/strict';
import { CHERRY_MESSAGE_MAX_CHARS, measureMessage } from '../cherryLimits';

/** Il tetto della edge gemini-proxy-chat (MAX_MESSAGE_CHARS in supabase/functions): il client deve restarle sotto. */
const EDGE_MAX_MESSAGE_CHARS = 4000;

test('il tetto del client sta sotto quello della edge', () => {
  assert.ok(CHERRY_MESSAGE_MAX_CHARS < EDGE_MAX_MESSAGE_CHARS);
});

test('sotto l\'80% niente contatore, dall\'80% compare, al tetto lo dice, oltre non parte', () => {
  assert.deepEqual(measureMessage('x'.repeat(799)), { length: 799, max: 1000, nearLimit: false, atLimit: false, tooLong: false });
  assert.deepEqual(measureMessage('x'.repeat(800)), { length: 800, max: 1000, nearLimit: true, atLimit: false, tooLong: false });
  assert.deepEqual(measureMessage('x'.repeat(1000)), { length: 1000, max: 1000, nearLimit: true, atLimit: true, tooLong: false });
  assert.deepEqual(measureMessage('x'.repeat(1001)), { length: 1001, max: 1000, nearLimit: true, atLimit: true, tooLong: true });
});

test('conta caratteri, non parole: il thai senza spazi si misura lo stesso', () => {
  const thai = 'สวัสดีค่ะ'.repeat(120); // 9 caratteri x 120 = 1080, zero spazi
  assert.equal(measureMessage(thai).tooLong, true);
  assert.equal(measureMessage('una domanda normale kha').nearLimit, false);
});
