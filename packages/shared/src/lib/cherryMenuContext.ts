// ─────────────────────────────────────────────────────────────────────────────
// cherryMenuContext — il menu scelto dal cliente (per-utente, read-only).
//
// Su intento "menu" + utente loggato, Cherry sa i piatti scelti (curry/soup/
// stir-fry) per la sua prenotazione. Per cambiarli istruisce il Dashboard —
// non modifica mai.
// ─────────────────────────────────────────────────────────────────────────────

import { getUserMenuSelection } from '../services/booking.service';

const MENU_INTENT = [
  'my menu', 'what did i choose', 'what i picked', 'my dishes', 'my curry', 'which curry',
  'my soup', 'which soup', 'my stir', 'change my menu', 'pick my menu', 'choose my menu',
  'cosa ho scelto', 'menu scelto', 'mio menu', 'che curry', 'che piatti',
];

export function hasMenuIntent(text: string): boolean {
  const h = (text ?? '').toLowerCase();
  return MENU_INTENT.some((k) => h.includes(k));
}

/** Blocco YOUR MENU, o null se non loggato / nessun intento menu. */
export async function getMenuContextForCherry(
  text: string,
  ctx: { isLogged: boolean; userId?: string | null },
): Promise<string | null> {
  if (!ctx.isLogged || !hasMenuIntent(text)) return null;

  const m = await getUserMenuSelection(ctx.userId);
  if (!m) return null;

  if (m.empty) {
    return [
      `### YOUR MENU:`,
      `The guest hasn't chosen their class menu yet. Invite them to pick their curry, soup and stir-fry in their Dashboard (Menu section).`,
      `STYLE: warm, plain text kha.`,
    ].join('\n');
  }

  const parts: string[] = [];
  if (m.curry) parts.push(`curry: ${m.curry}`);
  if (m.soup) parts.push(`soup: ${m.soup}`);
  if (m.stirfry) parts.push(`stir-fry: ${m.stirfry}`);

  return [
    `### YOUR MENU (authoritative — the guest's chosen dishes for their class):`,
    `${parts.join('; ')}.`,
    `STYLE: warm; confirm their picks. To change them, they edit the menu in their Dashboard — Cherry never changes it. Plain text kha.`,
  ].join('\n');
}
