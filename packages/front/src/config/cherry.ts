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
} as const;
