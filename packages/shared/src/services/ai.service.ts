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
  /** Lingua dell'interfaccia: metriche della edge e lingua dei risultati degli strumenti. */
  lang?: string;
  /** true = la edge dichiara al modello gli strumenti (ricerca semantica, ricetta). */
  tools?: boolean;
  /** Profili dieta/allergia attivi, per le sostituzioni di get_recipe. */
  profileIds?: string[];
}

/**
 * Chi e' loggato manda il proprio JWT: la edge lo riconosce e applica i limiti
 * per utente (e il passaggio libero a chi ha una prenotazione confermata). Fino
 * al 2026-09-06 lo stream mandava sempre la chiave anon, quindi per la edge
 * erano tutti ospiti, e il ramo "utente" della edge non girava mai.
 */
const bearerToken = async (): Promise<string> => {
  try {
    const { data } = await supabase.auth.getSession();
    return data.session?.access_token ?? supabaseAnonKey;
  } catch {
    return supabaseAnonKey;
  }
};

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
/**
 * Tetto di attesa del client. La edge ha il suo (60 s con gli strumenti), ma le
 * intestazioni partono subito: se poi qualcosa va storto a valle, senza questo
 * tetto la bolla di Cherry gira all'infinito. Misurato il 2026-09-09: la
 * funzione era gia' morta da 35 secondi e il client aspettava ancora.
 */
const STREAM_TIMEOUT_MS = 90_000;

export const sendChatMessageStream = async (
  payload: ProxyChatPayload,
  onChunk: (chunk: string) => void
): Promise<string> => {
  const url = `${supabaseUrl}/functions/v1/gemini-proxy-chat?stream=1`;

  const abort = new AbortController();
  const timeoutId = setTimeout(() => abort.abort(), STREAM_TIMEOUT_MS);
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'apikey': supabaseAnonKey,
      'Authorization': `Bearer ${await bearerToken()}`,
    },
    body: JSON.stringify(payload),
    signal: abort.signal,
  }).catch((err: unknown) => { clearTimeout(timeoutId); throw err; });

  if (!response.ok) {
    clearTimeout(timeoutId);
    const err = await response.json().catch(() => ({}));
    throw new Error((err as any).error || `HTTP ${response.status}`);
  }

  const reader = response.body!.getReader();
  const decoder = new TextDecoder();
  let fullText = '';

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      const chunk = decoder.decode(value, { stream: true });
      fullText += chunk;
      onChunk(chunk);
    }
  } finally {
    clearTimeout(timeoutId);
  }

  return fullText;
};
