// ─────────────────────────────────────────────────────────────────────────────
// historyPure — lo storico nella forma che il modello accetta. Senza Deno:
// gemello di packages/shared/src/lib/cherryHistory.ts (il client manda gia' uno
// storico buono, qui si raddrizza comunque perche' la chiave anon la possiede
// chiunque). Se cambia una regola, cambia in tutti e due i posti.
// ─────────────────────────────────────────────────────────────────────────────

export const MAX_HISTORY_ITEMS = 12;
export const MAX_HISTORY_PART_CHARS = 4_000;

export type HistoryInput = Array<{ role: 'user' | 'model'; parts: string }> | undefined;

/** Si parte da 'user', i ruoli si alternano, si chiude con 'model' (il messaggio corrente lo aggiunge sendMessage). */
export const normalizeHistory = (
  history: HistoryInput,
): Array<{ role: 'user' | 'model'; parts: Array<{ text: string }> }> => {
  const out: Array<{ role: 'user' | 'model'; text: string }> = [];
  for (const h of (history ?? []).slice(-MAX_HISTORY_ITEMS)) {
    const text = typeof h?.parts === 'string' ? h.parts.trim().slice(0, MAX_HISTORY_PART_CHARS) : '';
    if (!text) continue;
    const role = h.role === 'user' ? 'user' : 'model';
    const last = out[out.length - 1];
    if (last && last.role === role) last.text += `\n${text}`;
    else out.push({ role, text });
  }
  while (out.length > 0 && out[0].role !== 'user') out.shift();
  while (out.length > 0 && out[out.length - 1].role !== 'model') out.pop();
  return out.map((h) => ({ role: h.role, parts: [{ text: h.text }] }));
};
