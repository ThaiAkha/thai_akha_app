/**
 * Caricamento su richiesta del widget Cloudflare Turnstile.
 *
 * Stesso patto dello script di Google Maps (lib/googleMaps.ts): niente tag nel
 * `<head>`, quindi nessun costo sulle pagine che il form contatti non lo hanno.
 * Lo script arriva quando il form compare.
 *
 * La chiave PUBBLICA sta in `VITE_TURNSTILE_SITE_KEY` (accesso letterale: Vite
 * sostituisce solo quello). Il SEGRETO vive come secret della edge e non entra
 * mai in un bundle.
 */
const SITE_KEY = (import.meta.env.VITE_TURNSTILE_SITE_KEY as string | undefined) ?? '';

/** Vuota finche' l'owner non crea il widget nel pannello Cloudflare. */
export const turnstileConfigured = (): boolean => SITE_KEY.length > 0;

interface TurnstileApi {
  render: (el: HTMLElement, opts: Record<string, unknown>) => string;
  reset: (id?: string) => void;
  remove: (id: string) => void;
}
type WindowWithTurnstile = Window & { turnstile?: TurnstileApi };

let loading: Promise<TurnstileApi> | null = null;

/** Una sola iniezione per pagina; la promessa si ricicla, e su errore si azzera per poter riprovare. */
export function ensureTurnstile(): Promise<TurnstileApi> {
  const w = window as WindowWithTurnstile;
  if (w.turnstile) return Promise.resolve(w.turnstile);
  loading ??= new Promise<TurnstileApi>((resolve, reject) => {
    const done = () => (w.turnstile ? resolve(w.turnstile) : reject(new Error('turnstile assente dopo il caricamento')));
    const existing = document.querySelector<HTMLScriptElement>('script[data-turnstile]');
    if (existing) {
      existing.addEventListener('load', done);
      existing.addEventListener('error', () => reject(new Error('script turnstile non caricato')));
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';
    script.async = true;
    script.defer = true;
    script.dataset.turnstile = '1';
    script.onload = done;
    script.onerror = () => { loading = null; reject(new Error('script turnstile non caricato')); };
    document.head.appendChild(script);
  }).catch((err) => { loading = null; throw err; });
  return loading;
}

export interface TurnstileHandle { reset: () => void; remove: () => void }

/**
 * Disegna il widget dentro `el` e chiama `onToken` quando il gettone e' pronto
 * (o con stringa vuota se scade o fallisce: cosi' chi invia sa che non ce l'ha).
 */
export async function renderTurnstile(
  el: HTMLElement,
  onToken: (token: string) => void,
  lang?: string,
): Promise<TurnstileHandle> {
  const api = await ensureTurnstile();
  const id = api.render(el, {
    sitekey: SITE_KEY,
    language: lang,
    callback: (token: string) => onToken(token),
    'expired-callback': () => onToken(''),
    'error-callback': () => onToken(''),
  });
  return { reset: () => api.reset(id), remove: () => api.remove(id) };
}
