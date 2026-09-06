import { test } from 'node:test';
import assert from 'node:assert/strict';
import { buildGeminiHistory, HISTORY_PART_CHARS } from '../cherryHistory';
import type { ChatMessage } from '../../types';

const u = (text: string, extra: Partial<ChatMessage> = {}): ChatMessage => ({ id: `u-${text}`, role: 'user', text, ...extra });
const m = (text: string, extra: Partial<ChatMessage> = {}): ChatMessage => ({ id: `m-${text}`, role: 'model', text, ...extra });

test('parte da user, alterna, chiude con model', () => {
  const h = buildGeminiHistory([m('Sawasdee kha!'), u('hi'), m('hello'), u('pad thai?')]);
  assert.deepEqual(h, [{ role: 'user', parts: 'hi' }, { role: 'model', parts: 'hello' }]);
});

test('esclude system, bolla in streaming e testi vuoti', () => {
  const h = buildGeminiHistory([
    u('hi'),
    { id: 's', role: 'system', text: '[visited:x]' },
    m('hello'),
    u('   '),
    m('', { isStreaming: true }),
  ]);
  assert.deepEqual(h, [{ role: 'user', parts: 'hi' }, { role: 'model', parts: 'hello' }]);
});

test('fonde messaggi consecutivi dello stesso ruolo', () => {
  const h = buildGeminiHistory([u('a'), u('b'), m('c'), m('d')]);
  assert.deepEqual(h, [{ role: 'user', parts: 'a\nb' }, { role: 'model', parts: 'c\nd' }]);
});

test('tiene solo gli ultimi N messaggi', () => {
  const msgs: ChatMessage[] = [];
  for (let i = 0; i < 10; i++) msgs.push(u(`q${i}`), m(`a${i}`));
  const h = buildGeminiHistory(msgs, 4);
  assert.deepEqual(h.map((x) => x.parts), ['q8', 'a8', 'q9', 'a9']);
});

test('preferisce fullText e taglia i nodi lunghi', () => {
  const long = 'x'.repeat(HISTORY_PART_CHARS * 2);
  const h = buildGeminiHistory([u('menu'), m('', { fullText: long })]);
  assert.equal(h.length, 2);
  assert.ok(h[1].parts.length <= HISTORY_PART_CHARS + 1);
});

test('conversazione vuota o solo saluto → storico vuoto', () => {
  assert.deepEqual(buildGeminiHistory([]), []);
  assert.deepEqual(buildGeminiHistory([m('Sawasdee kha!')]), []);
  assert.deepEqual(buildGeminiHistory([m('hi'), u('only user')]), []);
});
