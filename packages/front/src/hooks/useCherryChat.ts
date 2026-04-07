import { useState, useEffect, useRef, useCallback } from 'react';
import { sendChatMessageProxy } from '@thaiakha/shared/services';
import { buildCherryPrompt, type CherryUserContext } from '../prompts/cherryPrompt';
import {
  getOrCreateSession,
  loadRecentMessages,
  saveMessage,
  updateSummary,
  checkRateLimit,
  type ChatSession,
} from '@thaiakha/shared/services';
import type { ChatMessage } from '@thaiakha/shared';
import type { UserProfile } from '../services/auth.service';

const HISTORY_WINDOW = 3;
const SUMMARY_THRESHOLD = 20;

export const useCherryChat = (userProfile?: UserProfile | null) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);

  const sessionRef = useRef<ChatSession | null>(null);
  const initialized = useRef(false);

  // ── Initialization ─────────────────────────────────────────────────────────

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    const init = async () => {
      const session = await getOrCreateSession(userProfile?.id);
      sessionRef.current = session;
      setSessionId(session.id);

      const history = await loadRecentMessages(session.id, HISTORY_WINDOW * 2);
      const initialMessages: ChatMessage[] = history.map(
        (m): ChatMessage => ({
          id: m.id,
          role: m.sender_role === 'user' ? 'user' : 'model',
          text: m.content,
        })
      );

      // ── Static welcome message (UI-only, never sent to Gemini) ─────────────
      // Cherry greets the user without wasting tokens or causing a "double intro".
      // On returning users with history, the history already provides context.
      if (initialMessages.length === 0) {
        const greeting = userProfile?.full_name
          ? `Sawasdee kha ${(userProfile.full_name).split(' ')[0]}! 🍒 Welcome back to your Akha kitchen. How can I help you today?`
          : "Sawasdee kha! 🍒 I'm Cherry, your Akha cultural guide and chef. Ask me anything about our courses, recipes or Thai culture!";
        // Pure UI message — id prefixed 'static:' so sendMessage never saves it to DB
        initialMessages.push({ id: 'static:greeting', role: 'model', text: greeting });
      }

      setMessages(initialMessages);
    };

    init();
  }, [userProfile?.id]);

  // ── Auto-summary ───────────────────────────────────────────────────────────

  const triggerAutoSummary = async (sid: string) => {
    try {
      const recentMessages = await loadRecentMessages(sid, HISTORY_WINDOW * 2);
      const transcript = recentMessages
        .map(m => `${m.sender_role === 'user' ? 'Guest' : 'Cherry'}: ${m.content}`)
        .join('\n');

      const summary = await sendChatMessageProxy({
        message: `Summarize in 2 sentences, focusing on: dietary preferences, booking interests, specific requests:\n${transcript}`,
        systemInstruction: 'You are a concise conversation summarizer. Output plain text only.',
      });

      if (summary) await updateSummary(sid, summary);
    } catch {
      // silent fail
    }
  };

  // ── sendMessage ────────────────────────────────────────────────────────────

  const sendMessage = async (userText: string) => {
    if (!userText.trim() || isLoading) return;

    const sid = sessionRef.current?.id ?? null;

    if (sid) {
      const rateLimit = await checkRateLimit(userProfile?.id, undefined);
      if (!rateLimit.allowed) {
        setError(rateLimit.reason ?? 'Limit reached.');
        return;
      }
    }

    const userMsgId = `user-${Date.now()}`;
    const modelMsgId = `model-${Date.now()}`;

    setMessages(prev => [
      ...prev,
      { id: userMsgId, role: 'user', text: userText },
      { id: modelMsgId, role: 'model', text: '', isStreaming: true },
    ]);
    setIsLoading(true);
    setError(null);

    if (sid) saveMessage(sid, 'user', userText, 'text');

    try {
      // Build system prompt with full context
      const userContext: CherryUserContext = {
        isLogged: !!userProfile,
        name: userProfile?.full_name,
        dietary_profile: userProfile?.dietary_profile,
        allergies: userProfile?.allergies,
        preferred_spiciness: userProfile?.preferred_spiciness_id ? String(userProfile.preferred_spiciness_id) : undefined,
      };
      const basePrompt = buildCherryPrompt(userContext);

      // Get recent conversation for context
      const recentHistory = await loadRecentMessages(sid || '', HISTORY_WINDOW * 2);
      const historyText = recentHistory
        .slice(-HISTORY_WINDOW)
        .map(m => `${m.sender_role === 'user' ? 'Guest' : 'Cherry'}: ${m.content}`)
        .join('\n');

      const systemInstruction = basePrompt + (historyText ? `\n### RECENT CONVERSATION:\n${historyText}` : '');

      // Call proxy with full system instruction
      const response = await sendChatMessageProxy({
        message: userText,
        systemInstruction,
      });

      setMessages(prev =>
        prev.map(m => (m.id === modelMsgId ? { ...m, text: response, isStreaming: false } : m))
      );

      if (sid) saveMessage(sid, 'assistant', response, 'text');

      if (sid && sessionRef.current && sessionRef.current.message_count >= SUMMARY_THRESHOLD) {
        sessionRef.current.message_count = 0;
        triggerAutoSummary(sid);
      }
    } catch (err) {
      console.error('[useCherryChat] sendMessage error:', err);
      setError('The kitchen is very busy kha! Please try again.');
      setMessages(prev => prev.filter(m => m.id !== modelMsgId));
    } finally {
      setIsLoading(false);
    }
  };

  // ── addVoiceMessages (The Bridge) ────────────────────────────────────────
  // This merges Gemini Live transcriptions into the unified chat UI and DB.

  const addVoiceMessages = useCallback(async (
    userText: string,
    assistantText: string
  ) => {
    if (!userText.trim() || !assistantText.trim()) return;

    const userMsgId = `voice-user-${Date.now()}`;
    const modelMsgId = `voice-model-${Date.now()}`;

    // 1. Update UI state instantly
    setMessages(prev => [
      ...prev,
      { id: userMsgId, role: 'user', text: userText, type: 'voice' as any },
      { id: modelMsgId, role: 'model', text: assistantText, type: 'voice' as any }
    ]);

    // 2. Persist to Supabase
    const sid = sessionRef.current?.id;
    if (sid) {
      await Promise.all([
        saveMessage(sid, 'user', userText, 'voice'),
        saveMessage(sid, 'assistant', assistantText, 'voice')
      ]);
    }
  }, []);

  return {
    messages,
    sendMessage,
    addVoiceMessages,
    isLoading,
    error,
    sessionId,
  };
};
