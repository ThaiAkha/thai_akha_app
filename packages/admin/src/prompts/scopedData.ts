// packages/admin/src/prompts/scopedData.ts
// Formatta i dati live SCOPATI per ruolo (AdminScopedData) in un blocco
// markdown-lite unico, da passare come `scopedDataBlocks` a buildAdminAgentPrompt.
// Condiviso da chat testo + voce. Il fetcher (adminScopedFetch) decide QUALI righe;
// qui decidiamo QUALI campi vede la Cherry di quel ruolo (es. driver = NO finanza).
import type { CookingClassDB } from '@thaiakha/shared';
import type { BookingDaySummary, GuestAlert } from './adminPrompt';
import type { AdminScopedData, MarketRunSummary } from './adminScopedFetch';

// ⚠️ TIER-1 base file (in-app, sempre presente). PROIEZIONE VERIFICATA dei Terms
// (front_terms v1.6 §4/§8/§10 + agency_terms v1.3 §5/§6) - NON è la fonte legale: i testi
// vincolanti sono le Terms/Privacy nel DB. A OGNI cambio Terms riverificare qui.
// Regola brand: mai trattino lungo/medio. Nessuno "group discount" (non ha fonte).
const BUSINESS_TERMS = `### BUSINESS TERMS
Working summary for staff. The binding texts are the Terms and the Privacy Policy in the app: if someone asks for exact wording, point them to the page instead of paraphrasing.
- Cancellation: free with 48 hours notice, Thailand time, counted from the class start (9:00 AM Morning, 5:00 PM Evening). Same standard for guests and agencies. Within 48 hours, and for no-shows, the amount stays due: the full price for a guest, the net rate for an agency. Date changes are free outside 48 hours, subject to availability. Marketplace bookings (Viator, Klook, Cookly) follow the platform's own rules.
- Private class: our Morning or Evening class for one group only. Three settings: up to 12 Chefs in the air-conditioned kitchen, up to 16 in the garden kitchen, 17 to 28 in both kitchens together.
  Morning 16,000 / 18,000 / 34,000 THB. Evening 15,000 / 17,000 / 32,000 THB.
  We may ask a 50% deposit to hold the date, at our discretion; the balance and the method are agreed at booking.
- Private class has exactly two exceptions to the normal rules, both in the guest's favour: the market tour can be ADDED to a private Evening on request (afternoon, before the class, no extra cost; it is not included by default, not even in a private Evening), and the Visitor limits do not apply.
- Guest payment: online card or PayPal with no surcharge; cash in THB, USD or EUR on arrival with no fee; card or Alipay on site carry 3%.
- Agency payment: the agency sells at our public rates and pays us the net rate (public rate minus its per-Traveler commission, at the tier in force at confirmation). Invoiced through Zoho Books in THB; the net rate is paid before the class (classes in the current month: by the day before the class; later months: by the 1st of the month of the class) unless a weekly or monthly cycle was agreed at onboarding. Bank transfer in THB, bank fees on the agency. The agency confirms payment in the Partner Portal with its receipt. No late interest. Marketplace bookings (Viator, Klook, Cookly) are never invoiced. Never quote the guest payment rules to an agency partner.`;

function renderClasses(cookingClasses: CookingClassDB[]): string {
  const body = cookingClasses?.length
    ? cookingClasses.map(c =>
        `- ID: ${c.id} | **${c.title}** | Price: ${c.price} ${c.currency ?? 'THB'} ${c.unit ?? 'per person'}\n  Status: ${c.is_active ? 'ACTIVE' : 'INACTIVE'}`
      ).join('\n')
    : `- **Morning Cooking Class**: 1,400 THB per person\n- **Evening Cooking Class**: 1,300 THB per person`;
  return `### OFFICIAL DATA: COOKING CLASSES\n${body}`;
}

function renderBookings(snapshot: BookingDaySummary[], opts: { showFinance: boolean; label: string }): string {
  if (!snapshot.length) return `### BOOKINGS (${opts.label})\nNo bookings found kha.`;
  const lines = snapshot.map(b => {
    const session = b.session.includes('evening') ? 'Evening' : 'Morning';
    const visitorNote = b.visitors > 0 ? ` + ${b.visitors} visitor${b.visitors > 1 ? 's' : ''}` : '';
    const out = [`- **${b.date} ${session}** | ${b.pax} paying pax${visitorNote} | ${b.status}`];
    if (b.hotelName || b.pickupTime) {
      out.push(`  Pickup: ${b.pickupTime ?? '—'} · ${b.hotelName ?? '—'}${b.pickupZone ? ` (${b.pickupZone})` : ''}`);
    }
    if (opts.showFinance && (b.paymentMethod || b.paymentStatus)) {
      out.push(`  Payment: ${b.paymentMethod ?? '—'} · ${b.totalPrice ? `${b.totalPrice.toLocaleString()} THB` : '—'} · ${b.paymentStatus ?? '—'}`);
    }
    if (b.bookingRef) out.push(`  Booking ref: ${b.bookingRef}`);
    if (b.specialRequests) out.push(`  Special requests: "${b.specialRequests}"`);
    if (opts.showFinance && b.customerNote) out.push(`  Customer note: "${b.customerNote}"`);
    return out.join('\n');
  }).join('\n');
  return `### BOOKINGS (${opts.label})\n${lines}`;
}

/** Driver: SOLO pickup, ZERO finanza/note cliente. */
function renderPickups(snapshot: BookingDaySummary[]): string {
  if (!snapshot.length) return `### YOUR PICKUPS\nNo pickups assigned to you kha.`;
  const lines = snapshot.map(b => {
    const session = b.session.includes('evening') ? 'Evening' : 'Morning';
    return `- **${b.date} ${session}** | ${b.pax} pax | ${b.hotelName ?? '—'}${b.pickupZone ? ` (${b.pickupZone})` : ''} · pickup ${b.pickupTime ?? '—'} | ${b.status}`;
  }).join('\n');
  return `### YOUR PICKUPS (your assigned stops only)\n${lines}`;
}

function renderAlerts(guestAlerts: GuestAlert[]): string {
  if (!guestAlerts.length) return `### GUEST DIETARY ALERTS\nNo dietary alerts kha.`;
  const lines = guestAlerts.map(g => {
    const allergyText = g.allergies.length ? ` + Allergic to: ${g.allergies.join(', ')}` : '';
    const session = g.session.includes('evening') ? 'Evening' : 'Morning';
    const out = [`- [${g.name}] ${session} ${g.date} — ${g.dietary}${allergyText}`];
    if (g.curryChoice || g.soupChoice || g.stirfryChoice || g.spicinessLevel) {
      const menuItems = [g.curryChoice, g.soupChoice, g.stirfryChoice].filter(Boolean).join(' · ');
      out.push(`  Menu pre-selection: ${menuItems || '—'} · Spice: ${g.spicinessLevel ?? '—'}`);
    }
    return out.join('\n');
  }).join('\n');
  return `### GUEST DIETARY ALERTS\n${lines}`;
}

function renderMarketRuns(runs: MarketRunSummary[]): string {
  if (!runs.length) return `### MARKET RUNS\nNo recent market runs kha.`;
  const lines = runs.map(m =>
    `- **${m.date}** | ${m.shopperRole} | ${m.totalCost != null ? `${m.totalCost.toLocaleString()} THB` : '—'} | ${m.status ?? '—'}${m.notes ? ` · "${m.notes}"` : ''}`
  ).join('\n');
  return `### MARKET RUNS (recent)\n${lines}`;
}

/** Assembla il blocco dati per il ruolo (cosa VEDE la Cherry di quel ruolo). */
export function formatScopedDataBlocks(data: AdminScopedData): string {
  const { scope, cookingClasses, bookingSnapshot, guestAlerts, marketRuns } = data;
  const parts: string[] = [];

  // LOGISTICS: solo market runs proprie.
  if (scope === 'logistics') {
    parts.push(renderMarketRuns(marketRuns));
    return parts.join('\n\n');
  }

  // DRIVER: solo i propri pickup, niente finanza.
  if (scope === 'driver') {
    parts.push(renderPickups(bookingSnapshot));
    return parts.join('\n\n');
  }

  // KITCHEN / MANAGER / ADMIN / AGENCY → classi + bookings.
  const showFinance = scope === 'manager' || scope === 'admin' || scope === 'agency';
  parts.push(renderClasses(cookingClasses));
  parts.push(renderBookings(bookingSnapshot, { showFinance, label: scope === 'kitchen' ? 'Today' : 'Next 7 days' }));
  if (scope === 'kitchen' || guestAlerts.length) parts.push(renderAlerts(guestAlerts));
  if (marketRuns.length) parts.push(renderMarketRuns(marketRuns));
  parts.push(BUSINESS_TERMS);
  return parts.join('\n\n');
}
