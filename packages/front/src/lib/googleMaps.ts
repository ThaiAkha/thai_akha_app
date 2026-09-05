/**
 * Caricamento su richiesta dello SDK Google Maps.
 *
 * Fino al 2026-09-05 il tag `<script src="maps.googleapis.com/maps/api/js?...">`
 * stava nel `<head>` di index.html, quindi su OGNI pagina: il bootstrap tirava
 * subito marker.js, geometry.js, util.js, common.js e main.js (circa 280 KB
 * compressi e sei richieste a un terzo host, con la sua handshake TLS a freddo)
 * anche su home, ricette o quiz, che una mappa non la mostrano mai.
 *
 * L'unico consumatore e' components/pickup/PickupMapBackground. Lo script parte
 * ora dalla route: `lazy()` della pagina pickup lo inietta insieme al download
 * del chunk, quindi le due attese scorrono in parallelo come prima e la mappa
 * non arriva piu' tardi di quanto arrivasse.
 */
const MAPS_KEY = (import.meta.env.VITE_GOOGLE_MAPS_API_KEY as string | undefined) ?? '';

/** Idempotente: il guard sul data attribute regge doppio mount, StrictMode e ritorni sulla pagina. */
export function ensureMapsScript(): void {
  if (typeof document === 'undefined') return;
  if (document.querySelector('script[data-gmaps]')) return;
  const script = document.createElement('script');
  script.src = `https://maps.googleapis.com/maps/api/js?key=${MAPS_KEY}&libraries=geometry,marker&loading=async`;
  script.async = true;
  script.defer = true;
  script.dataset.gmaps = '1';
  document.head.appendChild(script);
}
