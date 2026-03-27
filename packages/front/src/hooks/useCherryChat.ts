// packages/front/src/hooks/useCherryChat.ts
import { useState, useEffect, useRef, useCallback } from 'react';
import { GoogleGenAI } from '@google/genai';
import { orchestrator, isAgentAllowed, ALL_AGENTS } from '@thaiakha/shared/prompts';
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

export interface PendingConfirmation {
  targetAgentId: string;
  agentName: string;
}

export const useCherryChat = (userProfile?: UserProfile | null) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [currentAgentId, setCurrentAgentId] = useState<string>('cooking_chef');
  const [pendingConfirmation, setPendingConfirmation] = useState<PendingConfirmation | null>(null);

  const chatRef = useRef<any>(null);
  const sessionRef = useRef<ChatSession | null>(null);
  const initialized = useRef(false);

  // ── System prompt builder ──────────────────────────────────────────────────

  const buildSystemPrompt = useCallback(
    (agentId: string, history: DbChatMessage[], summary: string | null): string => {
      const agent =
        orchestrator.getAgentById(agentId) ?? orchestrator.getAgent('front');

      const base = orchestrator.buildPrompt(
        agent,
        userProfile || {},
        userProfile?.dietary_profile ?? 'diet_regular',
        userProfile?.allergies ?? [],
        false,
        'front'
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
    (agentId: string, history: DbChatMessage[], summary: string | null) => {
      const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY });
      chatRef.current = ai.chats.create({
        model: 'gemini-3-flash-preview',
        config: {
          systemInstruction: buildSystemPrompt(agentId, history, summary),
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
          ? `Sawasdee kha ${userProfile.full_name.split(' ')[0]}! Welcome back to your Akha kitchen. How can I help you today? kha`
          : "Sawasdee kha! I'm Cherry, your Akha cultural guide. How can I help you today? kha";
        initialMessages.push({ id: 'greeting', role: 'model', text: greeting });
      }

      setMessages(initialMessages);
      initGeminiChat('cooking_chef', history, session.summary);
    };

    init();
  }, [userProfile?.id]);

  // ── Auto-summary ───────────────────────────────────────────────────────────

  const triggerAutoSummary = async (sid: string) => {
    if (!chatRef.current) return;
    try {
      const result = await chatRef.current.sendMessage({
        message:
          'Please summarize this conversation in max 2 sentences, focusing on: dietary preferences, booking interests, and any specific requests. Be concise.',
      });
      const summary: string = result.text?.trim() || '';
      if (summary) await updateSummary(sid, summary);
    } catch {
      // silent fail
    }
  };

  // ── switchAgent ────────────────────────────────────────────────────────────

  /**
   * Requests a switch to the given agent.
   * - Security: checks `isAgentAllowed` for front context and guest state.
   * - Requires user confirmation via `pendingConfirmation` flow.
   */
  const switchAgent = useCallback(
    (agentId: string) => {
      const agent = orchestrator.getAgentById(agentId);
      if (!agent) return;

      // Guard: agent must be allowed in front context
      if (!isAgentAllowed(agent, 'front')) return;

      // Guard: guest lock — only cooking_chef is freely accessible for guests
      if (!userProfile && agentId !== 'cooking_chef') {
        setError('Accedi per sbloccare questa sapienza kha!');
        // Auto-clear the error after 3s
        setTimeout(() => setError(null), 3000);
        return;
      }

      // If already on this agent, no-op
      if (agentId === currentAgentId) return;

      // Require confirmation via chip
      setPendingConfirmation({ targetAgentId: agentId, agentName: agent.name });
    },
    [userProfile, currentAgentId]
  );

  // ── confirmSwitch ──────────────────────────────────────────────────────────

  const confirmSwitch = useCallback(async () => {
    if (!pendingConfirmation) return;
    const { targetAgentId } = pendingConfirmation;

    setPendingConfirmation(null);
    setCurrentAgentId(targetAgentId);

    const agent = orchestrator.getAgentById(targetAgentId);
    const agentName = agent?.name ?? targetAgentId;

    // Announce the handover in the chat
    const handoverMsgId = `handover-${Date.now()}`;
    setMessages(prev => [
      ...prev,
      {
        id: handoverMsgId,
        role: 'model',
        text: `Connecting you with **${agentName}** kha...`,
      },
    ]);

    // Reinitialize Gemini with the new agent's system prompt
    const history = await loadRecentMessages(sessionRef.current?.id ?? '', HISTORY_WINDOW * 2);
    initGeminiChat(targetAgentId, history, sessionRef.current?.summary ?? null);
  }, [pendingConfirmation, initGeminiChat]);

  // ── cancelSwitch ───────────────────────────────────────────────────────────

  const cancelSwitch = useCallback(() => {
    setPendingConfirmation(null);
  }, []);

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
    currentAgentId,
    switchAgent,
    pendingConfirmation,
    confirmSwitch,
    cancelSwitch,
  };
};
