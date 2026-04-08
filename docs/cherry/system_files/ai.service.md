# 📨 AI Proxy Service (Text Chat Messaging)

**Source File:** `packages/shared/src/services/ai.service.ts`  
**Description:** The primary service for high-security, text-based chat orchestration. It implements a stateless proxy pattern using Supabase Edge Functions to ensure that the master Gemini API key is never exposed to the frontend browser bundle.

---

## 📄 Full File Content (1:1 with Code)

```typescript
// packages/shared/src/services/ai.service.ts
import { supabase } from '../lib/supabase';

export interface GeminiChatMessage {
  role: 'user' | 'model';
  parts: string;
}

export interface ProxyChatPayload {
  message: string;
  history?: GeminiChatMessage[];
  systemInstruction?: string;
}

/**
 * Send a chat message via Supabase Edge Function proxy
 * This avoids exposing GEMINI_API_KEY to the frontend
 *
 * @param payload - Chat message payload with optional history and system instruction
 * @returns Promise<string> - The response text from Gemini
 * @throws Error if the request fails or rate limit is exceeded
 */
export const sendChatMessageProxy = async (payload: ProxyChatPayload): Promise<string> => {
  try {
    const { data, error } = await supabase.functions.invoke('gemini-proxy-chat', {
      body: payload,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (error) {
      console.error('[ai.service] Edge Function error:', error);
      throw new Error(error.message || 'Failed to send message');
    }

    if (!data?.response) {
      throw new Error('Empty response from server');
    }

    return data.response;
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('[ai.service] Chat proxy error:', message);
    throw err;
  }
};
```

---

## 🛰️ Architecture Benefits
- **Zero Key Exposure**: Standard text messages are proxied through `gemini-proxy-chat`, allowing for centralized usage monitoring and security auditing.
- **Server-Side Context Handling**: System instructions and historical data are sent as part of the JSON payload, maintaining statelessness while allowing for complex RAG-based context delivery.
- **Unified Logic**: Whether a message originates from a guest or a logged-in user, the `sendChatMessageProxy` provides a consistent pathway for interacting with Gemini.
