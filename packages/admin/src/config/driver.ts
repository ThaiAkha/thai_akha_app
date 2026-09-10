/**
 * Calcolo automatico del payout a fine corsa di ritorno.
 *
 *  false → confermando l'ultima riconsegna la corsa si chiude e basta. Nessuna riga
 *          nasce in `driver_payments`. Il payout si calcola dal back-office, dove lo
 *          decide una persona.
 *  true  → confermando l'ultima riconsegna l'app chiama `calculate_driver_payout` e
 *          mostra il totale all'autista.
 *
 * PERCHE' ESISTE QUESTO INTERRUTTORE. Il nome della funzione dice "calculate", ma la
 * funzione **scrive**: fa `INSERT INTO driver_payments ... ON CONFLICT DO UPDATE` con
 * stato `pending` (schema al 2026-09-07). Non c'e' modo di chiederle solo il numero: il
 * calcolo e la scrittura sono lo stesso gesto. Quindi a interruttore spento l'autista
 * non vede nemmeno il totale - mostrarlo vorrebbe dire scriverlo.
 *
 * Oggi non e' mai scattato: su 66 prenotazioni nessuna corsa di ritorno e' mai stata
 * completata, quindi zero righe sono nate da qui. E' proprio il motivo per cui va messo
 * dietro una parola adesso: una riga che non ha mai fatto niente e' una riga che nessuno
 * ricordera' di avere, il giorno che i pagamenti diventano veri.
 *
 * Riaccensione = `true` + redeploy, e prima ci si assicura che i pagamenti che nascono
 * da soli siano quello che si vuole. Unico punto che lo legge:
 * `pages/driver/driverRoute/useDriverRoute.ts`.
 */
export const DRIVER_PAYOUT_AUTO = false;
