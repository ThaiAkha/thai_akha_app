// ─────────────────────────────────────────────────────────────────────────────
// cherryHistory — lo storico della conversazione nella forma che Gemini vuole.
//
// Fino al 2026-09-06 lo storico viaggiava come TESTO dentro la system
// instruction ("Guest: … / Cherry: …"), riletto dal DB a ogni messaggio (un giro
// di rete in piu') e senza filtrare le righe 'system' dei marker di visita.
// Qui si costruisce dai messaggi gia' in memoria, nella forma nativa `history`
// del proxy, con le regole che l'API impone: si parte da 'user', i ruoli si
// alternano, si chiude con 'model' (il messaggio corrente lo aggiunge la edge).
//
// La edge (`gemini-proxy-chat`) applica lo stesso raddrizzamento per conto suo:
// e' un altro runtime e non puo' importare da qui. Se cambia una regola, cambia
// in tutti e due i posti.
// ─────────────────────────────────────────────────────────────────────────────

import type { ChatMessage } from '../types';
import type { GeminiChatMessage } from '../services/ai.service';
import { truncate } from './cherryTextUtils';

/** Messaggi recenti passati al modello (3 scambi). */
export const HISTORY_MESSAGES = 6;
/** Tetto per messaggio: i nodi della ragnatela sono lunghi, al modello basta il senso. */
export const HISTORY_PART_CHARS = 600;

/**
 * Dai messaggi mostrati in chat allo storico per il modello.
 * Esclude le righe 'system', la bolla in streaming e i testi vuoti; prende gli
 * ultimi `limit`; fonde i messaggi consecutivi dello stesso ruolo; toglie i
 * 'model' in testa e gli 'user' in coda cosi' l'alternanza regge sempre.
 */
export function buildGeminiHistory(
  messages: readonly ChatMessage[],
  limit = HISTORY_MESSAGES,
): GeminiChatMessage[] {
  const out: GeminiChatMessage[] = [];
  const recent = messages
    .filter((m) => (m.role === 'user' || m.role === 'model') && !m.isStreaming)
    .map((m) => ({ role: m.role as 'user' | 'model', text: truncate((m.fullText ?? m.text ?? '').trim(), HISTORY_PART_CHARS) }))
    .filter((m) => m.text.length > 0)
    .slice(-limit);

  for (const m of recent) {
    const last = out[out.length - 1];
    if (last && last.role === m.role) last.parts += `\n${m.text}`;
    else out.push({ role: m.role, parts: m.text });
  }
  while (out.length > 0 && out[0].role !== 'user') out.shift();
  while (out.length > 0 && out[out.length - 1].role !== 'model') out.pop();
  return out;
}
