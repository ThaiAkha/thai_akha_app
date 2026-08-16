/**
 * Pausa temporanea del booking online (Livello 2).
 *
 *  true  → la pagina /booking mostra lo stato "non attiva" con CTA verso il sito
 *          principale e NON renderizza selezione/checkout.
 *  false → flusso di prenotazione normale.
 *
 * Riapertura = false + redeploy. Coordinato con la disponibilità lato DB
 * (class_sessions.max_capacity = 0 durante la pausa → 12 alla riapertura).
 */
export const BOOKING_ONLINE_PAUSED = true;

/** Dove mandare gli ospiti a prenotare durante la pausa. */
export const BOOKING_PAUSED_REDIRECT_URL = 'https://www.thaiakhakitchen.com/booking';
