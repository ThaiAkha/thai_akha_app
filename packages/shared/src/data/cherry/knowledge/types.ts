// ─────────────────────────────────────────────────────────────────────────────
// cherryKnowledge — sapere STATICO di Cherry (tabelle piccole e stabili)
//
// Principio: per tabelle piccole + stabili (classi, meeting point, …) NON facciamo
// query Supabase (spreco per 2-12 righe). I dati vivono in file tipizzati e si
// iniettano nel prompt SOLO su intento (in-memory, zero DB, token-efficienti).
// Riusabili da chat testo (per-messaggio) e voce (a inizio sessione).
//
// Aggiungere un argomento = creare un file modulo + registrarlo in index.ts.
// ─────────────────────────────────────────────────────────────────────────────

export interface CherryKnowledgeModule {
  /** id univoco del modulo (es. 'classes'). */
  id: string;
  /** Parole-chiave (lowercase) che attivano l'iniezione del blocco. */
  keywords: string[];
  /** Costruisce il blocco di prompt dai dati locali. Nessun I/O. */
  build: () => string;
}
