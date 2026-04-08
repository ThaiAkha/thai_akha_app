# 🛠️ Gemini Live Client (Infrastructure)

**Source File:** `packages/front/src/services/geminiClient.ts`  
**Description:** The low-level service that manages authentication and initialization for the Google GenAI Multimodal Live API. It implements a secure "Ephemeral Token" pattern to avoid exposing master API keys in the client-side bundle.

---

## 📄 Full File Content (1:1 with Code)

```typescript
import { GoogleGenAI } from '@google/genai';
import { supabase } from '@thaiakha/shared/lib/supabase';

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
      throw new Error(error?.message || 'Failed to fetch ephemeral token kha!');
    }

    liveClient = new GoogleGenAI({
      apiKey: data.ephemeralToken,
      httpOptions: { apiVersion: 'v1alpha' },
    });
    liveTokenExpiresAt = now + 25 * 60 * 1000; // 25-min cache

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
  liveTokenExpiresAt = 0;
}
```

---

## 🛡️ Security Architecture
- **Ephemeral Access**: Unlike standard text chat, the **Gemini Live API** requires a persistent WebSocket connection. We use a 30-minute ephemeral token generated via the `gemini-token` Edge Function.
- **Edge Proxy (Text Mode)**: Text-based messages bypass this client entirely, using a secondary Proxy service for maximum speed and security.
- **Caching Logic**: The client is cached for **25 minutes** to minimize redundant Edge Function calls during active user sessions.
