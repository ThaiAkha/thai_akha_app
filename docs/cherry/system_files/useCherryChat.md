# useCherryChat.ts

**Status**: ✅ Production (v2.0 — Model Migration 2026-04-06)
**Model**: `gemini-3-flash-preview` (REST API)
**Updated**: 2026-04-06

```ts
import { useState, useEffect, useRef, useCallback } from 'react';
import { getTextGeminiClient } from '../services/geminiClient';
import { buildFrontPrompt, fetchChatContextData } from '../prompts/cherryPrompt';
import {
  getOrCreateSession,
  loadRecentMessages,
  saveMessage,
  updateSummary,
  checkRateLimit,
  type ChatSession,
  type DbChatMessage,
} from '@thaiakha/shared/services';
import type { ChatMessage, SpicinessLevel } from '@thaiakha/shared';
import type { UserProfile } from '../services/auth.service';

const HISTORY_WINDOW = 5;
const SUMMARY_THRESHOLD = 20;

export const useCherryChat = (userProfile?: UserProfile | null) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);

  const chatRef = useRef<any>(null);
  const sessionRef = useRef<ChatSession | null>(null);
  const initialized = useRef(false);
  const cookingClassesRef = useRef<Array<{ id: string; title: string; price: number }>>([]);
  const recipesRef = useRef<string[]>([]);
  const spicinessLevelsRef = useRef<SpicinessLevel[]>([]);

  // ── System prompt builder ──────────────────────────────────────────────────

  const buildSystemPrompt = useCallback(
    (history: DbChatMessage[], summary: string | null): string => {
      const base = buildFrontPrompt(
        userProfile || {},
        userProfile?.dietary_profile ?? 'diet_regular',
        userProfile?.allergies ?? [],
        false,
        { cookingClasses: cookingClassesRef.current, menuList: recipesRef.current, spicinessLevels: spicinessLevelsRef.current }
      );

      let historyBlock = '';
      if (summary) {
        historyBlock += `\n### SESSION SUMMARY (previous context):\n${summary}\n`;
      }
      if (history.length > 0) {
        historyBlock += `\n### RECENT CONVERSATION:\n`;
        historyBlock += history
          .slice(-HISTORY_WINDOW)
          .map(m => `${m.sender_role === 'user' ? 'Guest' : 'Cherry'}: ${m.content}`)
          .join('\n');
      }
      return base + historyBlock;
    },
    [userProfile]
  );

  // ── Gemini chat initializer ────────────────────────────────────────────────
  // Uses REST API (getTextGeminiClient) — not ephemeral tokens

  const initGeminiChat = useCallback(
    (history: DbChatMessage[], summary: string | null) => {
      const ai = getTextGeminiClient();
      chatRef.current = ai.chats.create({
        model: 'gemini-3-flash-preview',
        config: {
          systemInstruction: buildSystemPrompt(history, summary),
          temperature: 0.5,
        },
      });
    },
    [buildSystemPrompt]
  );

  // ── Initialization ─────────────────────────────────────────────────────────

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    const init = async () => {
      const { cookingClasses, menuList, spicinessLevels } = await fetchChatContextData();
      cookingClassesRef.current = cookingClasses;
      recipesRef.current = menuList;
      spicinessLevelsRef.current = spicinessLevels;

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
      // Gemini is initialized with REAL history only — the static greeting is invisible to AI
      initGeminiChat(history, session.summary);
    };

    init();
  }, [userProfile?.id]);

  // ── Auto-summary ───────────────────────────────────────────────────────────

  const triggerAutoSummary = async (sid: string) => {
    try {
      const ai = getTextGeminiClient();
      const summaryChat = ai.chats.create({
        model: 'gemini-3-flash-preview',
        config: { systemInstruction: 'You are a concise conversation summarizer. Output plain text only.', temperature: 0.1 },
      });
      const recentMessages = await loadRecentMessages(sid, HISTORY_WINDOW * 2);
      const transcript = recentMessages
        .map(m => `${m.sender_role === 'user' ? 'Guest' : 'Cherry'}: ${m.content}`)
        .join('\n');
      const result = await summaryChat.sendMessage({
        message: `Summarize in 2 sentences, focusing on: dietary preferences, booking interests, specific requests:\n${transcript}`,
      });
      const summary: string = result.text?.trim() || '';
      if (summary) await updateSummary(sid, summary);
    } catch {
      // silent fail
    }
  };

  // ── sendMessage ────────────────────────────────────────────────────────────

  const sendMessage = async (userText: string) => {
    if (!chatRef.current || !userText.trim() || isLoading) return;

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
      const streamResponse = await chatRef.current.sendMessageStream({ message: userText });
      let fullResponse = '';

      for await (const chunk of streamResponse) {
        const text = (chunk as any).text;
        if (text) {
          fullResponse += text;
          setMessages(prev =>
            prev.map(m => (m.id === modelMsgId ? { ...m, text: fullResponse } : m))
          );
        }
      }

      setMessages(prev =>
        prev.map(m => (m.id === modelMsgId ? { ...m, isStreaming: false } : m))
      );

      if (sid) saveMessage(sid, 'assistant', fullResponse, 'text');

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
```
