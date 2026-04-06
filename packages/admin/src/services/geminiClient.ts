import { GoogleGenAI } from '@google/genai';
import { supabase } from '@thaiakha/shared/lib/supabase';

// ── TEXT CLIENT (REST API) ────────────────────────────────────────────────────
// The regular Chats API (REST) does NOT support ephemeral tokens.
// We use VITE_GEMINI_API_KEY directly. This is safe because text requests
// are stateless and rate-limited per-request by Google.
let textClient: GoogleGenAI | null = null;

export function getTextGeminiClient(): GoogleGenAI {
  if (textClient) return textClient;

  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('[GeminiClient] VITE_GEMINI_API_KEY is missing!');
  }
  textClient = new GoogleGenAI({ apiKey });
  return textClient;
}

// ── LIVE CLIENT (WebSocket / Voice) ──────────────────────────────────────────
// The Live API (WebSocket audio) DOES support ephemeral tokens.
// We fetch a one-time-use, 30-minute token from our Supabase Edge Function.
// This prevents the master API key from being exposed in the browser bundle
// during long-lived, expensive voice sessions.
let liveClient: GoogleGenAI | null = null;
let liveTokenExpiresAt = 0;

export async function getLiveGeminiClient(): Promise<GoogleGenAI> {
  const now = Date.now();

  if (liveClient && now < liveTokenExpiresAt) {
    return liveClient;
  }

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

    liveClient = new GoogleGenAI({ apiKey: data.ephemeralToken });
    liveTokenExpiresAt = now + 25 * 60 * 1000; // 25-min cache

    return liveClient;
  } catch (err) {
    console.error('[GeminiClient] Live client initialization failed:', err);
    throw err;
  }
}

/**
 * Invalidate all cached clients (e.g. on logout).
 */
export function invalidateGeminiClients(): void {
  textClient = null;
  liveClient = null;
  liveTokenExpiresAt = 0;
}
