import { GoogleGenAI } from '@google/genai';
import { supabase } from '@thaiakha/shared/lib/supabase';

// ── LIVE CLIENT (WebSocket / Voice) ──────────────────────────────────────────
// The Live API (WebSocket audio) DOES support ephemeral tokens.
// We fetch a one-time-use, 30-minute token from our Supabase Edge Function.
// This prevents the master API key from being exposed in the browser bundle
// during long-lived, expensive voice sessions.
let liveClient: GoogleGenAI | null = null;

export async function getLiveGeminiClient(): Promise<GoogleGenAI> {
  // ⚠️ Token effimero SINGLE-USE (uses:1 nell'edge gemini-token). NON cachare tra
  // sessioni: al 2° avvio voce riuseremmo un token consumato → connect fallisce.
  const { data: { session } } = await supabase.auth.getSession();
  const accessToken = session?.access_token;

  try {
    const { data, error } = await supabase.functions.invoke('gemini-token', {
      method: 'POST',
      headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : {},
    });

    if (error || !data?.ephemeralToken) {
      throw new Error(error?.message || 'Failed to fetch ephemeral token!');
    }

    liveClient = new GoogleGenAI({
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
