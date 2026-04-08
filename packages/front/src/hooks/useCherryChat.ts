import { useState, useEffect, useRef, useCallback } from 'react';
import { sendChatMessageProxy, sendChatMessageStream } from '@thaiakha/shared/services';
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

const SPICINESS_MAP: Record<string, string> = {
  '1': 'The Farang (Soft)',
  '2': 'Thai Smile (Mild)',
  '3': 'Respect! (Medium)',
  '4': 'Thai Spicy (Local)',
  '5': 'Akha Warrior (Extreme)',
};

const DIETARY_MAP: Record<string, string> = {
  diet_regular: 'Regular',
  diet_vegan: 'Vegan',
  diet_vegetarian: 'Vegetarian',
  diet_pescatarian: 'Pescatarian',
  diet_meat_lover: 'Meat Lover',
  diet_halal: 'Halal Friendly',
  diet_kosher: 'Kosher Friendly',
  diet_rastafari: 'Rastafari (Ital)',
  diet_jain: 'Jain Friendly',
  diet_hindu: 'Hindu Friendly',
};
const SUMMARY_THRESHOLD = 20;
const TYPEWRITER_INTERVAL_MS = 35; // ~28 words/sec

export const useCherryChat = (userProfile?: UserProfile | null) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);

  const sessionRef = useRef<ChatSession | null>(null);
  const initialized = useRef(false);

  // ── Typewriter refs ─────────────────────────────────────────────────────────
  const typeQueueRef = useRef<string[]>([]);
  const typeIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const serverDoneRef = useRef(false);
  const fullResponseRef = useRef('');

  const stopTypewriter = useCallback((msgId: string) => {
    if (typeIntervalRef.current) {
      clearInterval(typeIntervalRef.current);
      typeIntervalRef.current = null;
    }
    typeQueueRef.current = [];
    setMessages(prev =>
      prev.map(m => m.id === msgId ? { ...m, text: fullResponseRef.current, isStreaming: false } : m)
    );
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (typeIntervalRef.current) clearInterval(typeIntervalRef.current);
    };
  }, []);

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

      if (initialMessages.length === 0) {
        const greeting = userProfile?.full_name
          ? `Sawasdee kha ${(userProfile.full_name).split(' ')[0]}! 🍒 Welcome back to your Akha kitchen. How can I help you today?`
          : "Sawasdee kha! 🍒 I'm Cherry, your Akha cultural guide and chef. Ask me anything about our courses, recipes or Thai culture!";
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

      if (summary) {
        await updateSummary(sid, summary);
        if (sessionRef.current && sessionRef.current.id === sid) {
          sessionRef.current.summary = summary;
        }
      }
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

    // Reset typewriter state for this message
    typeQueueRef.current = [];
    serverDoneRef.current = false;
    fullResponseRef.current = '';
    if (typeIntervalRef.current) {
      clearInterval(typeIntervalRef.current);
      typeIntervalRef.current = null;
    }

    // Start typewriter consumer — drains word queue at fixed cadence
    typeIntervalRef.current = setInterval(() => {
      if (typeQueueRef.current.length > 0) {
        const token = typeQueueRef.current.shift()!;
        setMessages(prev =>
          prev.map(m => m.id === modelMsgId ? { ...m, text: m.text + token } : m)
        );
      } else if (serverDoneRef.current) {
        // Queue empty + server stream finished → snap to final text and close
        stopTypewriter(modelMsgId);
      }
      // else: queue empty but server still streaming → wait next tick
    }, TYPEWRITER_INTERVAL_MS);

    try {
      const userContext: CherryUserContext = {
        isLogged: !!userProfile,
        name: userProfile?.full_name,
        dietary_profile: userProfile?.dietary_profile ? (DIETARY_MAP[userProfile.dietary_profile] ?? userProfile.dietary_profile) : undefined,
        allergies: userProfile?.allergies,
        preferred_spiciness: userProfile?.preferred_spiciness_id ? SPICINESS_MAP[String(userProfile.preferred_spiciness_id)] : undefined,
      };
      const basePrompt = buildCherryPrompt(userContext);

      const recentHistory = await loadRecentMessages(sid || '', HISTORY_WINDOW * 2);
      const historyText = recentHistory
        .slice(-HISTORY_WINDOW)
        .map(m => `${m.sender_role === 'user' ? 'Guest' : 'Cherry'}: ${m.content}`)
        .join('\n');

      const summaryText = sessionRef.current?.summary
        ? `\n### PREVIOUS CONVERSATION SUMMARY:\n${sessionRef.current.summary}`
        : '';
      const systemInstruction = basePrompt + summaryText + (historyText ? `\n### RECENT CONVERSATION:\n${historyText}` : '');

      // 🛡️ SECURITY HELPER: Clean JSON artifacts from response
      const cleanResponse = (text: string) => {
        if (text.includes('{"response":"')) {
          try {
            // Tentativo parsing se è un JSON completo
            const parsed = JSON.parse(text);
            return parsed.response || text;
          } catch {
            // Fallback: pulizia manuale regex se è un chunk parziale o malformato
            return text
              .replace(/^\{"response":"/, '')
              .replace(/"\}$/, '')
              .replace(/\\n/g, '\n')
              .replace(/\\"/g, '"');
          }
        }
        return text;
      };

      // Stream from server — push word tokens into the typewriter queue
      const rawResponse = await sendChatMessageStream(
        { message: userText, systemInstruction },
        (chunk) => {
          const cleanChunk = cleanResponse(chunk);
          fullResponseRef.current += cleanChunk;
          // Split cleanChunk into word tokens (preserving trailing spaces)
          const tokens = cleanChunk.match(/\S+[ \t]*/g) ?? [cleanChunk];
          typeQueueRef.current.push(...tokens);
        }
      );

      // Signal server is done — typewriter will finalize when queue empties
      const response = cleanResponse(rawResponse);
      fullResponseRef.current = response;
      serverDoneRef.current = true;

      if (sid) saveMessage(sid, 'assistant', response, 'text');

      if (sid && sessionRef.current && sessionRef.current.message_count >= SUMMARY_THRESHOLD) {
        sessionRef.current.message_count = 0;
        triggerAutoSummary(sid);
      }
    } catch (err) {
      console.error('[useCherryChat] sendMessage error:', err);
      if (typeIntervalRef.current) {
        clearInterval(typeIntervalRef.current);
        typeIntervalRef.current = null;
      }
      setError('The kitchen is very busy kha! Please try again.');
      setMessages(prev => prev.filter(m => m.id !== modelMsgId));
    } finally {
      setIsLoading(false);
    }
  };

  // ── addVoiceMessages (The Bridge) ────────────────────────────────────────

  const addVoiceMessages = useCallback(async (
    userText: string,
    assistantText: string
  ) => {
    if (!userText.trim() || !assistantText.trim()) return;

    const userMsgId = `voice-user-${Date.now()}`;
    const modelMsgId = `voice-model-${Date.now()}`;

    setMessages(prev => [
      ...prev,
      { id: userMsgId, role: 'user', text: userText, type: 'voice' as any },
      { id: modelMsgId, role: 'model', text: assistantText, type: 'voice' as any }
    ]);

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
