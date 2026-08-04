// ─────────────────────────────────────────────────────────────────────────────
// cherryPickupContext — conoscenza pickup per Cherry (hotel → zona → orario)
//
// Su intento pickup, risolve l'hotel citato e inietta zona + finestra orario.
// Se l'hotel non è identificato → istruisce Cherry a chiedere il nome ESATTO
// (digitato, per evitare errori di trascrizione vocale su 1.395 hotel).
// Se ambiguo → chiede di precisare. Hotel non in DB → fallback (fase 2: Google).
// Read-only.
// ─────────────────────────────────────────────────────────────────────────────

import { resolveHotelPickup } from '../services/pickup.service';

const PICKUP_INTENT = [
  'pickup', 'pick up', 'pick me', 'what time', 'my hotel', 'which zone', 'pickup zone',
  'what zone', 'be ready', 'come get', 'ritiro', 'prendono', 'a che ora', 'che zona',
];

export function hasPickupIntent(text: string): boolean {
  const h = (text ?? '').toLowerCase();
  return PICKUP_INTENT.some((k) => h.includes(k));
}

export interface PickupContext {
  /** Blocco testuale da iniettare nel prompt. */
  text: string;
  /** Nome hotel risolto (presente solo se trovato) → usato per il pulsante mappa. */
  hotelName?: string;
}

/** PICKUP DATA per il prompt + hotel risolto, o null se nessun intento pickup. */
export async function getPickupContextForCherry(text: string): Promise<PickupContext | null> {
  if (!hasPickupIntent(text)) return null;

  const r = await resolveHotelPickup(text);

  if (r.found) {
    if (r.isWalkIn) {
      return {
        hotelName: r.hotelName,
        text: [
          `### PICKUP DATA — ${r.hotelName} (authoritative):`,
          `Walk-in area: NO pickup — the guest comes directly to the cooking school and arrives 15 minutes early.`,
          `STYLE: warm, plain text kha.`,
        ].join('\n'),
      };
    }
    if (r.isOutside) {
      return {
        hotelName: r.hotelName,
        text: [
          `### PICKUP DATA — ${r.hotelName} (authoritative):`,
          `Outside our free pickup range — the guest meets us at a designated meeting point. Suggest they check the pickup map for the nearest one.`,
          `STYLE: warm, plain text kha.`,
        ].join('\n'),
      };
    }
    const times = [r.morning ? `morning ${r.morning}` : null, r.evening ? `evening ${r.evening}` : null]
      .filter(Boolean)
      .join(', ');
    return {
      hotelName: r.hotelName,
      text: [
        `### PICKUP DATA — ${r.hotelName} (authoritative LIVE data — answer ONLY from this):`,
        `Pickup zone: ${r.zoneName}. Pickup window: ${times}.`,
        `STYLE: warm — give the zone and the time window, remind to be ready in the lobby a few minutes before, and tell them you can show it on the map. Plain text kha.`,
      ].join('\n'),
    };
  }

  if (r.ambiguous && r.candidates?.length) {
    return {
      text: [
        `### PICKUP — multiple hotels match:`,
        `Candidates: ${r.candidates.join('; ')}. Ask the guest which one is theirs, or to type the exact name.`,
        `STYLE: helpful, plain text kha.`,
      ].join('\n'),
    };
  }

  // Intento pickup ma hotel non identificato → chiedi il nome esatto.
  return {
    text: [
      `### PICKUP — hotel not identified:`,
      `Ask the guest to TYPE their exact hotel name (typing avoids voice mis-spelling) so you can look up the pickup zone and time. If they typed it and it's still not on our map, tell them it isn't listed yet and point them to the pickup map page.`,
      `STYLE: warm, plain text kha.`,
    ].join('\n'),
  };
}
