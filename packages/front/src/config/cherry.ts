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
   * PARTE SPENTO di proposito. Acceso qui, un front deployato prima della edge
   * nuova toglierebbe i quattro contesti e la edge vecchia ignorerebbe il campo
   * `tools`: Cherry resterebbe senza contenuti, con un prompt che le dice di
   * usare strumenti che nessuno le ha dichiarato. Ordine: prima si deploya la
   * edge, si verifica, POI si accende qui e si deploya il front.
   */
  TOOLS_ENABLED: false,
} as const;
