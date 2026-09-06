/**
 * La data di OGGI a Bangkok, non a Greenwich.
 *
 * Il runtime delle edge function e' UTC, e Bangkok e' sette ore avanti: fra
 * mezzanotte e le sette del mattino ora locale, `new Date().toISOString()` da'
 * ancora la data di ieri. Non e' un dettaglio da poco quando quella stringa
 * diventa la data di un pagamento in contabilita' o quella stampata su una busta
 * paga: non da' nessun errore, e si scopre in riconciliazione.
 *
 * `en-CA` e' un piccolo trucco utile: e' l'unico locale comune che formatta
 * nativamente come `YYYY-MM-DD`, cioe' gia' nella forma che i sistemi si aspettano.
 */
const TZ = 'Asia/Bangkok';

/** `YYYY-MM-DD` a Bangkok. */
export const bangkokToday = (): string =>
  new Intl.DateTimeFormat('en-CA', { timeZone: TZ }).format(new Date());

/** `DD/MM/YYYY` a Bangkok, per i documenti che si leggono a occhio. */
export const bangkokTodayHuman = (): string =>
  new Intl.DateTimeFormat('en-GB', {
    timeZone: TZ, day: '2-digit', month: '2-digit', year: 'numeric',
  }).format(new Date());
