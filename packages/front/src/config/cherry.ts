/**
 * CHERRY_CONFIG - parametri di tuning della chat Cherry (front).
 * Erano in i18n (cherry.json) come stringhe: numeri di configurazione NON sono
 * testo da tradurre - in i18n mentivano al contatore di copertura e rischiavano
 * la "traduzione". Spostati qui il 2026-08-17 (pulizia i18n, audit /i18n).
 */
export const CHERRY_CONFIG = {
  /** Messaggi nella sessione oltre i quali si genera il summary (era cherry:summaryThreshold). */
  SUMMARY_THRESHOLD: 20,
  /** Intervallo del typewriter effect in ms (era cherry:typewriterIntervalMs). */
  TYPEWRITER_INTERVAL_MS: 80,
  /**
   * Strumenti nella edge (2026-09-07, passo 2 del piano Cherry): ricerca semantica
   * e ricetta su richiesta del modello. true = i quattro contesti di contenuto
   * (ricette, ingredienti, cultura, news) NON partono piu' dal client.
   *
   * ACCESO il 2026-09-09, dopo il deploy della edge e la verifica sul modello
   * vero: 14 prove su 14 sulla domanda che prima falliva (ingredienti esatti di
   * un piatto) e 7 su 7 sulla gamma, in cinque lingue. Se questa costante torna
   * a false, il client rimette i quattro contesti a parole chiave: e' la via di
   * ritorno, e non richiede toccare la edge.
   *
   * L'ORDINE RESTA: la edge si deploya PRIMA del front. Con questa accesa e la
   * edge vecchia, Cherry resterebbe senza contenuti e con un prompt che le dice
   * di usare strumenti che nessuno le ha dichiarato.
   */
  TOOLS_ENABLED: true,
} as const;
