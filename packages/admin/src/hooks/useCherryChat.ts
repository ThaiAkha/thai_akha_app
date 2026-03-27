// packages/admin/src/hooks/useCherryChat.ts
import { useState, useEffect, useRef, useCallback } from 'react';
import { GoogleGenAI } from '@google/genai';
import { orchestrator } from '@thaiakha/shared/prompts';
import {
  getOrCreateSession,
  loadRecentMessages,
  saveMessage,
  updateSummary,
  checkRateLimit,
  type ChatSession,
  type DbChatMessage,
} from '@thaiakha/shared/services';
import type { ChatMessage } from '@thaiakha/shared';
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

  const buildSystemPrompt = useCallback(
    (history: DbChatMessage[], summary: string | null): string => {
      const activeAgent = orchestrator.getAgent('admin', userProfile?.role);
      const base = orchestrator.buildPrompt(
        activeAgent,
        userProfile || {},
        userProfile?.dietary_profile || 'diet_regular',
        userProfile?.allergies || [],
        false,
        'admin'
      );

      let historyBlock = '';
      if (summary) {
        historyBlock += `\n### SESSION SUMMARY (previous context):\n${summary}\n`;
      }
      if (history.length > 0) {
        historyBlock += `\n### RECENT CONVERSATION:\n`;
        historyBlock += history
          .slice(-HISTORY_WINDOW)
          .map(m => `${m.sender_role === 'user' ? 'Staff' : 'Cherry'}: ${m.content}`)
          .join('\n');
      }
      return base + historyBlock;
    },
    [userProfile]
  );

  const initGeminiChat = useCallback(
    (history: DbChatMessage[], summary: string | null) => {
      const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY });
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
          ? `Sawasdee kha ${userProfile.full_name.split(' ')[0]}! Admin panel active. How can I assist you today? kha`
          : "Sawasdee kha! I'm Cherry, your kitchen AI. How can I help the team today? kha";
        initialMessages.push({ id: 'greeting', role: 'model', text: greeting });
      }

      setMessages(initialMessages);
      initGeminiChat(history, session.summary);
    };

    init();
  }, [userProfile?.id]);

  const triggerAutoSummary = async (sid: string) => {
    if (!chatRef.current) return;
    try {
      const result = await chatRef.current.sendMessage({
        message:
          'Please summarize this conversation in max 2 sentences, focusing on: operational requests, booking summaries, and any staff notes. Be concise.',
      });
      const summary: string = result.text?.trim() || '';
      if (summary) await updateSummary(sid, summary);
    } catch {
      // silent fail
    }
  };

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
      console.error('[useCherryChat/admin] sendMessage error:', err);
      setError('The kitchen is very busy kha! Please try again.');
      setMessages(prev => prev.filter(m => m.id !== modelMsgId));
    } finally {
      setIsLoading(false);
    }
  };

  return { messages, sendMessage, isLoading, error, sessionId };
};
