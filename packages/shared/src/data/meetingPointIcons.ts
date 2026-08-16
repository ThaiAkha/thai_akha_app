/**
 * Meeting Point Icon Kit — set standard costruito in codice (SVG path 24×24).
 *
 * Icone placeholder in stile unico (fill-based, monocolore): per sostituirne
 * una basta cambiare la path `d` qui sotto — card e mappa si aggiornano insieme.
 * Se in futuro si passa ad asset grafici veri (Storage + icon_url), questo
 * modulo resta il fallback: i consumer usano `meetingPointIconPath(id)` e
 * ripiegano su `icon_url` solo quando qui non c'è nulla.
 *
 * Consumers:
 *   - front MeetingCard        → meetingPointIconPath(id)  (svg inline, fill-current)
 *   - front PickupMapBackground → meetingPointIconDataUri(id, { color })
 *   - shared mapZones (scuola)  → meetingPointIconDataUri(id, { color, bg })
 */

export type MeetingPointIconName =
  | 'plane'
  | 'train'
  | 'chef-hat'
  | 'temple'
  | 'mall'
  | 'market'
  | 'gate';

/** Path SVG (viewBox 0 0 24 24, fill-based, monocolore). */
const ICON_PATHS: Record<MeetingPointIconName, string> = {
  // Material Symbols "flight"
  plane:
    'M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z',
  // Material Symbols "train"
  train:
    'M12 2c-4.42 0-8 .5-8 4v9.5C4 17.43 5.57 19 7.5 19L6 20.5v.5h12v-.5L16.5 19c1.93 0 3.5-1.57 3.5-3.5V6c0-3.5-3.58-4-8-4zM7.5 17c-.83 0-1.5-.67-1.5-1.5S6.67 14 7.5 14s1.5.67 1.5 1.5S8.33 17 7.5 17zm3.5-7H6V6h5v4zm5.5 7c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm1.5-7h-5V6h5v4z',
  // Cappello da chef (scuola Thai Akha Kitchen)
  'chef-hat':
    'M12 2.5a4.5 4.5 0 0 0-4.33 3.26 4 4 0 0 0-.62 7.82V17h9.9v-3.42a4 4 0 0 0-.62-7.82A4.5 4.5 0 0 0 12 2.5zM7.05 18.5V20a1.5 1.5 0 0 0 1.5 1.5h6.9a1.5 1.5 0 0 0 1.5-1.5v-1.5h-9.9z',
  // Tempio a livelli (Wat Pan Whaen)
  temple:
    'M12 2 6 6h12L12 2zM7 7h10v2H7V7zm-1.5 3L4 12.5h16L18.5 10h-13zM6 13.5h12V16H6v-2.5zM5 17h14v2h1v2H4v-2h1v-2z',
  // Shopping bag (mall / centri commerciali)
  mall:
    'M18 6h-2c0-2.21-1.79-4-4-4S8 3.79 8 6H6c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zm-6-2c1.1 0 2 .9 2 2h-4c0-1.1.9-2 2-2zm6 16H6V8h2v2h2V8h4v2h2V8h2v12z',
  // Material Symbols "storefront" (night market)
  market:
    'M21.9 8.89l-1.05-4.37c-.22-.9-1-1.52-1.91-1.52H5.05c-.9 0-1.69.63-1.9 1.52L2.1 8.89c-.24 1.02-.02 2.06.62 2.88.08.11.19.19.28.29V19c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2v-6.94c.09-.09.2-.18.28-.28.64-.82.87-1.87.62-2.89zm-2.99-3.9l1.05 4.37c.1.42.01.84-.25 1.17-.14.18-.44.47-.94.47-.61 0-1.14-.49-1.21-1.14L16.98 5l1.93-.01zM13 5h1.96l.54 4.52c.05.39-.07.78-.33 1.07-.22.26-.54.41-.95.41-.67 0-1.22-.59-1.22-1.31V5zM8.49 9.52L9.04 5H11v4.69c0 .72-.55 1.31-1.29 1.31-.34 0-.65-.15-.89-.41-.25-.29-.37-.68-.33-1.07zm-4.45-.16L5.05 5h1.97l-.58 4.86c-.08.65-.6 1.14-1.21 1.14-.49 0-.8-.29-.93-.47-.27-.32-.36-.75-.26-1.17zM5 19v-6.03c.08.01.15.03.23.03.87 0 1.66-.36 2.24-.95.6.6 1.4.95 2.31.95.87 0 1.65-.36 2.23-.93.59.57 1.39.93 2.29.93.84 0 1.64-.35 2.24-.95.58.59 1.37.95 2.24.95.08 0 .15-.02.23-.03V19H5z',
  // Porta della città (Tha Phae Gate, North Gate)
  gate:
    'M4 21V9h3v12H4zm13 0V9h3v12h-3zM4 8V6c2.5-2 5-3 8-3s5.5 1 8 3v2c-2.5-2-5-3-8-3S6.5 6 4 8zm5 13v-7a3 3 0 0 1 6 0v7h-2v-7a1 1 0 0 0-2 0v7H9z',
};

/** meeting_points.id → icona del kit. */
export const MEETING_POINT_ICONS: Record<string, MeetingPointIconName> = {
  mp_airport_gate1: 'plane',
  mp_airport_gate2: 'plane',
  mp_train_station: 'train',
  mp_school: 'chef-hat',
  mp_wat_pan_whaen: 'temple',
  mp_cen_airport: 'mall',
  mp_central_festival: 'mall',
  mp_maya: 'mall',
  mp_north_gate_b2: 'gate',
  mp_thaphae: 'gate',
  mp_saturday_market: 'market',
  mp_sunday_market: 'market',
};

/** Path `d` per un meeting point (per svg inline con fill-current). */
export function meetingPointIconPath(pointId: string): string | null {
  const name = MEETING_POINT_ICONS[pointId];
  return name ? ICON_PATHS[name] : null;
}

interface IconSvgOptions {
  /** Colore del glifo (default bianco — le icone vivono su superfici scure). */
  color?: string;
  /** Se presente, cerchio di sfondo pieno dietro il glifo (marker mappa). */
  bg?: string;
}

/** SVG completo come stringa; null se il punto non è nel kit. */
export function meetingPointIconSvg(pointId: string, opts: IconSvgOptions = {}): string | null {
  const d = meetingPointIconPath(pointId);
  if (!d) return null;
  const { color = '#FFFFFF', bg } = opts;

  const glyph = bg
    ? `<circle cx="12" cy="12" r="12" fill="${bg}"/><path d="${d}" fill="${color}" transform="translate(4.8 4.8) scale(0.6)"/>`
    : `<path d="${d}" fill="${color}"/>`;

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">${glyph}</svg>`;
}

/** SVG come data-URI (per `img.src` nei marker Google Maps). */
export function meetingPointIconDataUri(pointId: string, opts: IconSvgOptions = {}): string | null {
  const svg = meetingPointIconSvg(pointId, opts);
  return svg ? `data:image/svg+xml,${encodeURIComponent(svg)}` : null;
}
