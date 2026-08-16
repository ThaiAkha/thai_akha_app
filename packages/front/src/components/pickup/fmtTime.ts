/**
 * Converts a DB time string ("08:50:00" or "16:50:00") → "8:50 am" / "4:50 pm"
 * Never shows 24h format to customers. Used across all pickup components.
 */
export function fmtTime(time: string | null | undefined): string {
  if (!time) return '--:--';
  const [h, m] = time.slice(0, 5).split(':').map(Number);
  const period = h < 12 ? 'am' : 'pm';
  const hour = h === 0 ? 12 : h > 12 ? h - 12 : h;
  return `${hour}:${String(m).padStart(2, '0')} ${period}`;
}
