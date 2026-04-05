import { useState, useEffect, useRef, useCallback } from 'react';
import { GoogleGenAI } from '@google/genai';
import { buildFrontPrompt } from '../prompts/cherryPrompt';
import {
  getOrCreateSession,
  loadRecentMessages,
  saveMessage,
  updateSummary,
  checkRateLimit,
  type ChatSession,
  type DbChatMessage,
} from '@thaiakha/shared/services';
import { contentService } from '@thaiakha/shared/services';
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
  const cookingClassesRef = useRef<Array<{ id: string; title: string; price: number }>>([]);
  const recipesRef = useRef<string[]>([]);

  // ── System prompt builder ──────────────────────────────────────────────────

  const buildSystemPrompt = useCallback(
    (history: DbChatMessage[], summary: string | null): string => {
      const base = buildFrontPrompt(
        userProfile || {},
        userProfile?.dietary_profile ?? 'diet_regular',
        userProfile?.allergies ?? [],
        false,
        { cookingClasses: cookingClassesRef.current, menuList: recipesRef.current }
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

  // ── Initialization ─────────────────────────────────────────────────────────

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    const init = async () => {
      // Fetch cooking classes and recipes via SWR cache (zero-latency on repeat visits)
      const [classes, recipes] = await Promise.all([
        contentService.getCookingClasses(),
        contentService.getRecipes()
      ]);
      cookingClassesRef.current = classes;
      recipesRef.current = recipes.map((r: { title: string }) => r.title);

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

      let historyForGemini = history;
      if (initialMessages.length === 0) {
        const greeting = userProfile?.full_name
          ? `Sawasdee kha ${(userProfile.full_name).split(' ')[0]}! Welcome back to your Akha kitchen. How can I help you today? kha`
          : "Sawasdee kha! I'm Cherry, your Akha cultural guide. How can I help you today? kha";
        initialMessages.push({ id: 'greeting', role: 'model', text: greeting });
        const greetingDbMsg: DbChatMessage = {
          id: 'greeting',
          sender_role: 'assistant',
          content: greeting,
          type: 'text',
          created_at: new Date().toISOString(),
          session_id: session.id,
        };
        historyForGemini = [...history, greetingDbMsg];
      }

      setMessages(initialMessages);
      initGeminiChat(historyForGemini, session.summary);
    };

    init();
  }, [userProfile?.id]);

  // ── Auto-summary ───────────────────────────────────────────────────────────

  const triggerAutoSummary = async (sid: string) => {
    try {
      const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY });
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

  return {
    messages,
    sendMessage,
    isLoading,
    error,
    sessionId,
  };
};
