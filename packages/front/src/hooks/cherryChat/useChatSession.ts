import { useState, useEffect, useRef, useCallback } from 'react';
import type { Dispatch, MutableRefObject, SetStateAction } from 'react';
import { sendChatMessageProxy } from '@thaiakha/shared/services';
import {
  getOrCreateSession,
  loadRecentMessages,
  updateSummary,
  type ChatSession,
} from '@thaiakha/shared/services';
import type { ChatMessage } from '@thaiakha/shared';
import { detectCoveredTopics } from '@thaiakha/shared/lib/cherryCoveredTopics';
import type { UserProfile } from '../../services/auth.service';
import { HISTORY_WINDOW } from './constants';

interface ChatSessionParams {
  userProfile?: UserProfile | null;
  setMessages: Dispatch<SetStateAction<ChatMessage[]>>;
  coveredTopicsRef: MutableRefObject<Set<string>>;
  visitedNodesRef: MutableRefObject<Set<string>>;
}

/**
 * Sessione Supabase + bootstrap della conversazione (history, memoria
 * anti-ripetizione, memoria ragnatela, greeting) e auto-summary.
 */
export function useChatSession({ userProfile, setMessages, coveredTopicsRef, visitedNodesRef }: ChatSessionParams) {
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
      // Le righe 'system' (es. marker [visited:…]) non si mostrano: servono solo
      // a ricostruire la memoria, non sono messaggi di conversazione.
      const initialMessages: ChatMessage[] = history
        .filter(m => m.sender_role === 'user' || m.sender_role === 'assistant')
        .map(
          (m): ChatMessage => ({
            id: m.id,
            role: m.sender_role === 'user' ? 'user' : 'model',
            text: m.content,
          })
        );

      // Seed della memoria anti-ripetizione dagli argomenti già discussi.
      for (const m of history) {
        for (const topic of detectCoveredTopics(m.content)) coveredTopicsRef.current.add(topic);
        // Seed della memoria ragnatela: nodi già visitati (da node_id persistito).
        if (m.node_id) visitedNodesRef.current.add(m.node_id);
      }

      if (initialMessages.length === 0) {
        const greeting = userProfile?.full_name
          ? `Sawasdee kha ${(userProfile.full_name).split(' ')[0]}! 🍒 Welcome back to your Akha kitchen. How can I help you today?`
          : "Sawasdee kha! 🍒 I'm Cherry, your Akha cultural guide and chef. Ask me anything about our courses, recipes or Thai culture!";
        initialMessages.push({ id: 'static:greeting', role: 'model', text: greeting });
      }

      setMessages(initialMessages);
    };

    init();
  // eslint-disable-next-line react-hooks/exhaustive-deps -- init one-shot (guard initialized ref): rilancia solo al cambio utente
  }, [userProfile?.id]);

  // ── Auto-summary ───────────────────────────────────────────────────────────

  const triggerAutoSummary = useCallback(async (sid: string) => {
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
  }, []);

  /**
   * Id di sessione garantito per i flussi inject (che possono partire prima che
   * l'init abbia risolto). Blocco estratto 1:1 da injectInteraction/injectStaticExchange.
   */
  const ensureSessionId = useCallback(async () => {
    let sid = sessionRef.current?.id;
    if (!sid) {
      const session = await getOrCreateSession(userProfile?.id);
      sessionRef.current = session;
      setSessionId(session.id);
      sid = session.id;
    }
    return sid;
  }, [userProfile?.id]);

  return { sessionId, sessionRef, triggerAutoSummary, ensureSessionId };
}
