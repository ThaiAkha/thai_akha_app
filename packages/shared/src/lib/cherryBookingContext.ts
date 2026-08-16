// ─────────────────────────────────────────────────────────────────────────────
// cherryBookingContext — conoscenza prenotazioni per Cherry (3 livelli)
//
//   L1 GUEST   → disponibilità posti (libera/full/chiusa) su intento availability.
//   L2 LOGGATO (booking proprio)   → dettagli completi + self-service dal Dashboard.
//   L3 LOGGATO (booking agenzia)   → dettagli, ma modifiche strutturali via agenzia.
//
// Iniettato SOLO su intento pertinente (token-efficiente). Cherry è read-only:
// non prenota, non modifica, non cancella mai — istruisce e rimanda.
// ─────────────────────────────────────────────────────────────────────────────

import { getUserBookingDetails, getClassAvailability } from '../services/booking.service';

const BOOKING_INTENT = [
  'booking', 'reservation', 'pickup', 'pick up', 'my class', 'what time', 'hotel',
  'cancel', 'change my', 'modify', 'reschedule', 'move my', 'meeting point',
  'prenotaz', 'ritiro', 'annull', 'cambiar', 'sposta',
];

const AVAIL_INTENT = [
  'available', 'availability', 'spot', 'spots', 'seat', 'seats', 'free', 'room',
  'space', 'book for', 'still open', 'sold out', 'full ', 'posti', 'disponib', 'liber',
];

function hasAny(text: string, list: string[]): boolean {
  const h = (text ?? '').toLowerCase();
  return list.some((k) => h.includes(k));
}

/** "tomorrow morning" → data YYYY-MM-DD, o null se nessuna data relativa nota. */
function parseRelativeDate(text: string): string | null {
  const h = (text ?? '').toLowerCase();
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const fmt = (d: Date) => d.toISOString().slice(0, 10);
  if (/(day after tomorrow|after tomorrow|dopodomani)/.test(h)) {
    const d = new Date(today); d.setDate(d.getDate() + 2); return fmt(d);
  }
  if (/(tomorrow|domani|tmrw)/.test(h)) {
    const d = new Date(today); d.setDate(d.getDate() + 1); return fmt(d);
  }
  if (/(today|tonight|stasera|stamattina|oggi)/.test(h)) return fmt(today);
  return null;
}

/** Sessione dal testo. null = entrambe. */
function parseSession(text: string): 'morning_class' | 'evening_class' | null {
  const h = (text ?? '').toLowerCase();
  if (/(morning|mattin|breakfast|market)/.test(h)) return 'morning_class';
  if (/(evening|night|sera|dinner|tonight|stasera)/.test(h)) return 'evening_class';
  return null;
}

const sessLabel = (id: string) => (id === 'evening_class' ? 'evening' : 'morning');

/**
 * Blocco BOOKING/AVAILABILITY per il prompt, o null se nessun intento pertinente.
 */
export async function getBookingContextForCherry(
  text: string,
  ctx: { isLogged: boolean; userId?: string | null },
): Promise<string | null> {
  // ── L2/L3: utente loggato che chiede della SUA prenotazione ────────────────
  if (ctx.isLogged && hasAny(text, BOOKING_INTENT)) {
    const b = await getUserBookingDetails(ctx.userId);
    if (b) {
      const cls = (b.sessionType ?? '').toLowerCase().includes('even') ? 'evening' : 'morning';
      const lines: string[] = [
        `### YOUR BOOKING (authoritative, read-only — Cherry can NEVER modify, cancel or rebook it):`,
        `${cls} class on ${b.bookingDate}${b.daysUntil != null ? ` (in ${b.daysUntil} day(s))` : ''}.`,
      ];
      const det: string[] = [];
      if (b.hotelName) det.push(`pickup hotel: ${b.hotelName}`);
      if (b.pickupZone) det.push(`pickup zone: ${b.pickupZone}`);
      if (b.pickupTime) det.push(`pickup time: ${b.pickupTime}`);
      if (b.paxCount) det.push(`${b.paxCount} guest(s)`);
      if (b.totalPrice) det.push(`total: ${b.totalPrice} THB`);
      if (b.specialRequests) det.push(`note: ${b.specialRequests}`);
      if (det.length) lines.push(`Details — ${det.join('; ')}.`);

      if (b.isAgencyManaged) {
        lines.push(
          `OWNERSHIP: booked via a travel agency. The guest CANNOT self-change the date, class or pickup — those changes must go through their agency. They CAN still update their food profile, choose the menu and play the quiz themselves.`,
        );
      } else {
        lines.push(
          `OWNERSHIP: the guest's own booking. They can self-manage from their Dashboard — change the date/session, change the pickup hotel, or cancel — plus update diet/allergies/spice, choose the menu and play the quiz.`,
        );
      }
      lines.push(
        `STYLE: warm and helpful. To CHANGE anything, tell the guest WHERE to go (Dashboard, or their agency if agency-managed). You never modify bookings yourself. Plain text kha.`,
      );
      return lines.join('\n');
    }
  }

  // ── L1: guest che chiede DISPONIBILITÀ ─────────────────────────────────────
  if (!ctx.isLogged && hasAny(text, AVAIL_INTENT)) {
    const date = parseRelativeDate(text);
    if (date) {
      const session = parseSession(text);
      const rows = await getClassAvailability(date, date);
      const pick = session ? rows.filter((r) => r.sessionId === session) : rows;
      if (pick.length) {
        const parts = pick.map((r) =>
          r.isClosed
            ? `${sessLabel(r.sessionId)} class on ${r.date}: CLOSED${r.closureReason ? ` (${r.closureReason})` : ''}`
            : r.free > 0
              ? `${sessLabel(r.sessionId)} class on ${r.date}: ${r.free} seat(s) free`
              : `${sessLabel(r.sessionId)} class on ${r.date}: fully booked`,
        );
        return [
          `### CLASS AVAILABILITY (authoritative LIVE data — answer ONLY from this):`,
          `${parts.join('; ')}.`,
          `STYLE: encouraging — if seats are free, warmly invite to book on the booking page; if full or closed, suggest another day. Cherry cannot book for them. Plain text kha.`,
        ].join('\n');
      }
    }
    // Intento availability ma nessuna data riconosciuta → nota generica.
    return [
      `### CLASS AVAILABILITY:`,
      `No specific date was understood. Classes run every day — a morning class and an evening class, 12 seats each. Invite the guest to see live spots and book on the booking page.`,
      `STYLE: helpful, plain text kha.`,
    ].join('\n');
  }

  return null;
}
