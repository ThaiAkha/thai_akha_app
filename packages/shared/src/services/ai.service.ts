// packages/shared/src/services/ai.service.ts
import { supabase, supabaseUrl, supabaseAnonKey } from '../lib/supabase';

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

/**
 * Send a chat message via streaming Edge Function proxy.
 * Calls onChunk for each text chunk as it arrives, returns the full response.
 */
export const sendChatMessageStream = async (
  payload: ProxyChatPayload,
  onChunk: (chunk: string) => void
): Promise<string> => {
  const url = `${supabaseUrl}/functions/v1/gemini-proxy-chat?stream=1`;

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'apikey': supabaseAnonKey,
      'Authorization': `Bearer ${supabaseAnonKey}`,
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error((err as any).error || `HTTP ${response.status}`);
  }

  const reader = response.body!.getReader();
  const decoder = new TextDecoder();
  let fullText = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    const chunk = decoder.decode(value, { stream: true });
    fullText += chunk;
    onChunk(chunk);
  }

  return fullText;
};
