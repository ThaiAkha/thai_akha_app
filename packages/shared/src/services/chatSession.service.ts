// packages/shared/src/services/chatSession.service.ts
import { supabase } from '../lib/supabase';

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
  type: 'text' | 'voice' = 'text'
): void => {
  if (sessionId.startsWith('ephemeral_')) return;
  supabase
    .from('chat_messages')
    .insert({ session_id: sessionId, sender_role: role, content, type })
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
  _sessionToken?: string
): Promise<{ allowed: boolean; reason?: string }> => {
  if (userId) {
    // VIP: utente con prenotazione confermata — nessun limite
    const { data: hasBooking } = await supabase
      .from('bookings')
      .select('id')
      .eq('user_id', userId)
      .eq('status', 'confirmed')
      .gte('booking_date', new Date().toISOString().split('T')[0])
      .limit(1)
      .maybeSingle();
    if (hasBooking) return { allowed: true };

    // Utente loggato normale: max 30 messaggi/giorno
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    const session = await getOrCreateSession(userId);
    const { count } = await supabase
      .from('chat_messages')
      .select('*', { count: 'exact', head: true })
      .eq('sender_role', 'user')
      .gte('created_at', oneDayAgo)
      .eq('session_id', session.id);
    if (count && count >= 30) {
      return {
        allowed: false,
        reason: 'Daily limit reached. Come back tomorrow or book a class!',
      };
    }
    return { allowed: true };
  }

  // Guest: max 10 messaggi per sessione
  const session = await getOrCreateSession();
  if (session.message_count >= 10) {
    return {
      allowed: false,
      reason: 'Guest limit reached. Create a free account to continue chatting!',
    };
  }
  return { allowed: true };
};
