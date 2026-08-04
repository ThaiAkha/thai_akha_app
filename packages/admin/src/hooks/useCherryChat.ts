// packages/admin/src/hooks/useCherryChat.ts
import { useState, useEffect, useRef, useCallback } from 'react';
import { sendChatMessageProxy } from '@thaiakha/shared/services';
import { selectAdminAgent, buildAdminAgentPrompt } from '../prompts/adminAgents';
import { formatScopedDataBlocks } from '../prompts/scopedData';
import { fetchAdminScopedData, type AdminScopedData } from '../prompts/adminScopedFetch';
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
const TYPEWRITER_MS = 80; // cadenza reveal — allineata al front (Cherry v6)

export const useCherryChat = (userProfile?: UserProfile | null) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const sessionRef = useRef<ChatSession | null>(null);
  const initialized = useRef(false);
  const scopedDataRef = useRef<AdminScopedData | null>(null);

  const buildSystemPrompt = useCallback(
    (history: DbChatMessage[], summary: string | null): string => {
      // Multi-Cherry per ruolo (Fase 3): agente + DATI scopati per ruolo.
      const agent = selectAdminAgent(userProfile?.role);
      const scopedDataBlocks = scopedDataRef.current
        ? formatScopedDataBlocks(scopedDataRef.current)
        : 'No live data loaded kha.';
      const base = buildAdminAgentPrompt(agent, userProfile || {}, scopedDataBlocks, false);

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

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    const init = async () => {
      const today = new Date().toISOString().split('T')[0];
      const nextWeek = new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0];

      // Fase 3: dati SCOPATI per ruolo (un solo punto di scoping, condiviso con la voce).
      const [scoped, session] = await Promise.all([
        fetchAdminScopedData(userProfile?.role, userProfile?.id, today, nextWeek),
        getOrCreateSession(userProfile?.id),
      ]);
      scopedDataRef.current = scoped;
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
        // Greeting con il nome della Cherry-ruolo (così l'utente sa quale assistente è attivo).
        const agent = selectAdminAgent(userProfile?.role);
        const firstName = userProfile?.full_name?.split(' ')[0];
        const greeting = firstName
          ? `Sawasdee kha ${firstName}! I'm ${agent.name}. How can I help you today? kha`
          : `Sawasdee kha! I'm ${agent.name}. How can I help the team today? kha`;
        initialMessages.push({ id: 'greeting', role: 'model', text: greeting });

      }

      setMessages(initialMessages);
    };

    init();
  }, [userProfile?.id]);

  const triggerAutoSummary = async (sid: string) => {
    try {
      const summary = await sendChatMessageProxy({
        message:
          'Please summarize this conversation in max 2 sentences, focusing on: operational requests, booking summaries, and any staff notes. Be concise.',
        systemInstruction: 'You are a concise conversation summarizer. Output plain text only.',
      });
      if (summary) await updateSummary(sid, summary);
    } catch {
      // silent fail
    }
  };

  const sendMessage = async (userText: string) => {
    if (!userText.trim() || isLoading) return;

    const sid = sessionRef.current?.id ?? null;

    if (sid) {
      const rateLimit = await checkRateLimit(userProfile?.id, sessionRef.current?.session_token ?? undefined);
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
      // Build system prompt with full context (booking data, alerts, etc.)
      const recentHistory = await loadRecentMessages(sid || '', HISTORY_WINDOW * 2);
      const systemInstruction = buildSystemPrompt(recentHistory, sessionRef.current?.summary || null);

      // Call proxy with full system instruction
      const response = await sendChatMessageProxy({
        message: userText,
        systemInstruction,
      });

      // Persist subito (la persistenza non aspetta l'animazione).
      if (sid) saveMessage(sid, 'assistant', response, 'text');

      // Typewriter: rivela la risposta progressivamente (parità UX col front).
      await new Promise<void>((resolve) => {
        const tokens = response.match(/\S+[ \t]*|\n+/g) ?? [response];
        let i = 0;
        const interval = setInterval(() => {
          if (i < tokens.length) {
            const chunk = tokens[i++];
            setMessages(prev =>
              prev.map(m => (m.id === modelMsgId ? { ...m, text: m.text + chunk } : m))
            );
          } else {
            clearInterval(interval);
            setMessages(prev =>
              prev.map(m => (m.id === modelMsgId ? { ...m, isStreaming: false } : m))
            );
            resolve();
          }
        }, TYPEWRITER_MS);
      });

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
