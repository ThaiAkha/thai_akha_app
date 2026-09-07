// ─────────────────────────────────────────────────────────────────────────────
// pickupWindow — la finestra complessiva del pickup, ricavata dalle zone.
//
// Prima della zona scelta, la prenotazione puo' dire solo "dalla prima partenza
// all'ultimo arrivo" fra le zone che hanno una finestra: e' la stessa cifra che
// Terms e FAQ scrivono a mano (8:15-9:00). Qui esce dalla tabella pickup_zones,
// cosi' un cambio di finestra in admin arriva alla prenotazione da solo.
// ─────────────────────────────────────────────────────────────────────────────

export interface ZoneWindowRow {
  morning_pickup_time?: string | null;
  morning_pickup_end?: string | null;
  evening_pickup_time?: string | null;
  evening_pickup_end?: string | null;
}

/** "08:30:00" -> "08:30". Vuoto se manca. */
export const hhmm = (v: string | null | undefined): string => (v ?? '').slice(0, 5);

/** "08:20 - 09:00" per la mattina (o la sera), '' se nessuna zona ha una finestra. */
export function pickupWindowSpan(zones: readonly ZoneWindowRow[], session: 'morning' | 'evening'): string {
  const from = (z: ZoneWindowRow) => hhmm(session === 'morning' ? z.morning_pickup_time : z.evening_pickup_time);
  const to = (z: ZoneWindowRow) => hhmm(session === 'morning' ? z.morning_pickup_end : z.evening_pickup_end);
  const starts = zones.map(from).filter(Boolean).sort();
  const ends = zones.map(to).filter(Boolean).sort();
  if (starts.length === 0) return '';
  const last = ends[ends.length - 1];
  return last ? `${starts[0]} - ${last}` : starts[0];
}

/** "17:00 - 21:00" dalla riga della sessione, '' se manca un estremo. */
export function classTimeSpan(start: string | null | undefined, end: string | null | undefined): string {
  const a = hhmm(start);
  const b = hhmm(end);
  return a && b ? `${a} - ${b}` : a || '';
}
