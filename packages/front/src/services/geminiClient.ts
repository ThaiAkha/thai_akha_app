// `import type`: l'SDK Gemini pesa 270 KB (54 compressi) e serve SOLO a chi apre la
// voce di Cherry. Come import di valore finiva nel chunk d'ingresso, quindi lo
// scaricava e valutava ogni visitatore di ogni pagina prima del primo render.
// Con il tipo qui e l'`import()` dentro la funzione, il chunk scende al primo
// microfono e non un istante prima (2026-09-05).
import type { GoogleGenAI } from '@google/genai';
import { supabase } from '@thaiakha/shared/lib/supabase';

// ── LIVE CLIENT (WebSocket / Voice) ──────────────────────────────────────────
// The Live API (WebSocket audio) DOES support ephemeral tokens.
// We fetch a one-time-use, 30-minute token from our Supabase Edge Function.
// This prevents the master API key from being exposed in the browser bundle
// during long-lived, expensive voice sessions.
let liveClient: GoogleGenAI | null = null;

export async function getLiveGeminiClient(): Promise<GoogleGenAI> {
  // Il download dell'SDK parte subito e corre in parallelo alla chiamata del token:
  // due attese sovrapposte invece che in fila.
  const sdk = import('@google/genai');

  // ⚠️ Il token effimero è SINGLE-USE (uses:1 nell'edge gemini-token). NON riutilizzare
  // il client tra sessioni: al 2° avvio voce riuseremmo un token già consumato →
  // ai.live.connect fallisce. Quindi fetch di un token FRESCO ad ogni sessione.
  const { data: { session } } = await supabase.auth.getSession();
  const accessToken = session?.access_token;

  try {
    const { data, error } = await supabase.functions.invoke('gemini-token', {
      method: 'POST',
      headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : {},
    });

    if (error || !data?.ephemeralToken) {
      throw new Error(error?.message || 'Failed to fetch ephemeral token kha!');
    }

    const { GoogleGenAI: GenAI } = await sdk;
    liveClient = new GenAI({
      apiKey: data.ephemeralToken,
      httpOptions: { apiVersion: 'v1alpha' },
    });

    return liveClient;
  } catch (err) {
    console.error('[GeminiClient] Live client initialization failed:', err);
    throw err;
  }
}

/**
 * Invalidate cached live client (e.g. on logout).
 * Text chat now uses Edge Function proxy, no client to invalidate.
 */
export function invalidateGeminiClients(): void {
  liveClient = null;
}
