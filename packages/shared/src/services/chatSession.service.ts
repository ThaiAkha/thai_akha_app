// packages/shared/src/services/chatSession.service.ts
import { supabase } from '../lib/supabase';
import type { Json } from '../types';

export interface ChatSession {
  id: string;
  user_id: string | null;
  session_token: string | null;
  created_at: string;
  last_activity: string;
  summary: string | null;
  message_count: number;
  status: string;
  metadata: any;
}

export interface DbChatMessage {
  id: string;
  session_id: string;
  sender_role: 'user' | 'assistant' | 'system';
  content: string;
  type: 'text' | 'voice';
  created_at: string;
  /** Id del nodo CHAT_FLOW iniettato (memoria visite/ragnatela). null per AI/voce. */
  node_id?: string | null;
  /** Metadati liberi: link/asset cliccati, azione, ecc. (memoria click). */
  metadata?: Record<string, unknown> | null;
}

const SESSION_TOKEN_KEY = 'cherry_session_token';

const getGuestToken = (): string => {
  let token = localStorage.getItem(SESSION_TOKEN_KEY);
  if (!token) {
    token = `guest_${crypto.randomUUID()}`;
    localStorage.setItem(SESSION_TOKEN_KEY, token);
  }
  return token;
};

/** Returns the current guest session token from localStorage, or null if not yet created. */
export const getGuestSessionToken = (): string | null =>
  localStorage.getItem(SESSION_TOKEN_KEY);

export const getOrCreateSession = async (userId?: string): Promise<ChatSession> => {
  try {
    if (userId) {
      const { data } = await supabase
        .from('chat_sessions')
        .select('*')
        .eq('user_id', userId)
        .gte('last_activity', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
        .order('last_activity', { ascending: false })
        .limit(1)
        .maybeSingle();
      if (data) return data as ChatSession;

      const { data: newSession, error: insertError } = await supabase
        .from('chat_sessions')
        .insert({ user_id: userId, metadata: { source: 'front_app' } })
        .select()
        .single();
      if (insertError) throw insertError;
      return newSession as ChatSession;
    } else {
      const token = getGuestToken();
      const { data } = await supabase
        .from('chat_sessions')
        .select('*')
        .eq('session_token', token)
        .maybeSingle();
      if (data) return data as ChatSession;

      const { data: newSession, error: insertError } = await supabase
        .from('chat_sessions')
        .insert({ session_token: token, metadata: { source: 'front_app_guest' } })
        .select()
        .single();
      if (insertError) throw insertError;
      return newSession as ChatSession;
    }
  } catch (err) {
    console.warn('[ChatSession] Supabase fallback, using ephemeral session', err);
    return {
      id: `ephemeral_${crypto.randomUUID()}`,
      user_id: userId ?? null,
      session_token: null,
      created_at: new Date().toISOString(),
      last_activity: new Date().toISOString(),
      summary: null,
      message_count: 0,
      status: 'active',
      metadata: null,
    };
  }
};

export const loadRecentMessages = async (
  sessionId: string,
  limit = 10
): Promise<DbChatMessage[]> => {
  if (sessionId.startsWith('ephemeral_')) return [];
  const { data, error } = await supabase
    .from('chat_messages')
    .select('*')
    .eq('session_id', sessionId)
    .order('created_at', { ascending: false })
    .limit(limit);
  if (error) {
    console.warn('[ChatSession] loadRecentMessages error:', error);
    return [];
  }
  return (data as DbChatMessage[]).reverse();
};

export const saveMessage = (
  sessionId: string,
  role: 'user' | 'assistant' | 'system',
  content: string,
  type: 'text' | 'voice' = 'text',
  opts?: { nodeId?: string | null; metadata?: Record<string, unknown> | null }
): void => {
  if (sessionId.startsWith('ephemeral_')) return;
  supabase
    .from('chat_messages')
    .insert({
      session_id: sessionId,
      sender_role: role,
      content,
      type,
      node_id: opts?.nodeId ?? null,
      metadata: (opts?.metadata ?? null) as Json,
    })
    .then(({ error }) => {
      if (error) console.warn('[ChatSession] saveMessage failed (silent):', error.message);
    });
};

export const updateSummary = async (sessionId: string, summary: string): Promise<void> => {
  if (sessionId.startsWith('ephemeral_')) return;
  await supabase.from('chat_sessions').update({ summary }).eq('id', sessionId);
};

export const checkRateLimit = async (
  userId?: string,
  sessionToken?: string
): Promise<{ allowed: boolean; reason?: string }> => {
  try {
    const { data, error } = await supabase.rpc('check_chat_rate_limit', {
      p_user_id: (userId ?? null) as string,
      p_session_token: (sessionToken ?? null) as string,
    });

    if (error) throw error;

    const row = Array.isArray(data) ? data[0] : data;
    return {
      allowed: row.allowed,
      reason: row.reason ?? undefined,
    };
  } catch (err) {
    // Fallback silenzioso: non bloccare l'utente se la RPC fallisce
    console.warn('[checkRateLimit] RPC failed, allowing by default:', err);
    return { allowed: true };
  }
};
