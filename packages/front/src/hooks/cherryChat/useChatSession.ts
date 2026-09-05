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
  // Una sola promessa di get-or-create condivisa: l'apertura della chat e un flusso
  // inject partiti insieme non devono fare due INSERT sulla stessa sessione.
  const sessionPromise = useRef<Promise<ChatSession> | null>(null);

  const openSession = useCallback(async (): Promise<ChatSession> => {
    if (sessionRef.current) return sessionRef.current;
    sessionPromise.current ??= getOrCreateSession(userProfile?.id);
    const session = await sessionPromise.current;
    sessionRef.current = session;
    setSessionId(session.id);
    return session;
  }, [userProfile?.id]);

  // ── Initialization ─────────────────────────────────────────────────────────

  /**
   * Apre la sessione e ricostruisce la conversazione. Una volta sola per utente.
   *
   * Fino al 2026-09-05 partiva al mount del provider, cioe' per OGNI visitatore
   * di OGNI pagina, con la chat chiusa: due o tre round trip a Supabase (SELECT,
   * a volte INSERT, poi i messaggi) in gara con le query che disegnano la pagina.
   * Per chi era loggato la catena girava due volte, perche' il provider si
   * rimonta quando arriva il profilo, e lasciava per strada una riga di sessione
   * ospite mai usata. Ora la chiama chi ha davvero bisogno della chat, e in
   * mancanza di quello uno slot di inattivita' dopo il primo disegno.
   */
  const initSession = useCallback(async () => {
    if (initialized.current) return;
    initialized.current = true;

    const init = async () => {
      const session = await openSession();

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

    await init();
  }, [openSession, userProfile?.full_name, setMessages, coveredTopicsRef, visitedNodesRef]);

  // Rete di sicurezza: se nessuno apre la chat, la sessione si prepara comunque,
  // ma in uno slot di inattivita' e fuori dalla finestra del primo disegno. Chi
  // apre prima passa da initSession e questo timer non fa niente (guard idempotente).
  useEffect(() => {
    const w = window as Window & {
      requestIdleCallback?: (cb: () => void, opts?: { timeout: number }) => number;
      cancelIdleCallback?: (id: number) => void;
    };
    if (w.requestIdleCallback) {
      const id = w.requestIdleCallback(() => { void initSession(); }, { timeout: 4000 });
      return () => w.cancelIdleCallback?.(id);
    }
    const id = window.setTimeout(() => { void initSession(); }, 2500);
    return () => window.clearTimeout(id);
  }, [initSession]);

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
  const ensureSessionId = useCallback(async () => (await openSession()).id, [openSession]);

  return { sessionId, sessionRef, triggerAutoSummary, ensureSessionId, initSession };
}
