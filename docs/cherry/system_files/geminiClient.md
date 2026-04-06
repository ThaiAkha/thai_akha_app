# geminiClient.ts

**Status**: ✅ Production (v2.0 — Dual Client Architecture 2026-04-06)
**Updated**: 2026-04-06

---

## Architecture: Two Separate Clients

The Gemini API is split into two distinct clients because text (REST) and voice (WebSocket) have different authentication and model requirements:

| Client | API Type | Authentication | Model | Use Case |
|---|---|---|---|---|
| **Text** | REST | Direct API Key | `gemini-3-flash-preview` | `useCherryChat` streaming text |
| **Voice** | WebSocket (Live) | Ephemeral Token | `gemini-2.5-flash-native-audio` | `useGeminiLive` real-time audio |

---

## Implementation

```ts
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
    throw new Error('[GeminiClient] VITE_GEMINI_API_KEY is missing kha!');
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
      throw new Error(error?.message || 'Failed to fetch ephemeral token kha!');
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
```

---

## Key Design Decisions

1. **Separation of Concerns**: Text and voice use different models, auth methods, and APIs
2. **Ephemeral Tokens for Voice**: Supabase Edge Function generates 30-min tokens to avoid exposing master key
3. **Singleton Pattern**: Both clients are cached to prevent redundant instantiations
4. **Cache Invalidation**: `invalidateGeminiClients()` called on logout to clear cache

---

## Notes

- **Text API**: Uses `generateContent` endpoint (streaming)
- **Voice API**: Uses `live.connect` (WebSocket, real-time bidirectional)
- **No Cross-Contamination**: Each client is independent; voice issues won't affect text chat
